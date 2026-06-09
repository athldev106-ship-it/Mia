import os, json, asyncio, threading, time, math, sqlite3
from datetime import datetime
from collections import deque
import pandas as pd
import plotly.graph_objs as go
import plotly.utils
from flask import Flask, render_template_string, request, jsonify

# Auto-install missing packages
try:
    from binance import AsyncClient, BinanceSocketManager
    from binance.enums import *
except ImportError:
    import subprocess
    subprocess.check_call(['pip', 'install', 'python-binance', 'flask', 'plotly', 'pandas'])
    from binance import AsyncClient, BinanceSocketManager
    from binance.enums import *

# ---------- CONFIG ----------
CONFIG_FILE = "bot_config.json"
DB_FILE = "trading_data.db"

def load_config():
    default = {
        "api_key": "", "api_secret": "", "use_testnet": True,
        "leverage": 20, "balance_per_trade": 2.0,
        "fast_ema": 5, "slow_ema": 20,
        "stop_loss_pct": 0.06, "profit_ratio": 1.5,
        "symbol": "BTCUSDT", "min_trade_usd": 0.5, "max_trade_usd": 100,
        "volume_scaling": True, "max_daily_loss_pct": 5,
        "live_enabled": False
    }
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            saved = json.load(f)
            default.update(saved)
    else:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(default, f, indent=4)
    return default

def save_config(cfg):
    with open(CONFIG_FILE, 'w') as f:
        json.dump(cfg, f, indent=4)

# ---------- DATABASE ----------
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS trades
                 (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp REAL, datetime TEXT,
                  side TEXT, entry_price REAL, exit_price REAL, quantity REAL,
                  pnl REAL, pnl_percent REAL, balance_after REAL)''')
    c.execute('''CREATE TABLE IF NOT EXISTS balance_history (timestamp REAL, balance REAL)''')
    c.execute('''CREATE TABLE IF NOT EXISTS price_history (timestamp REAL, price REAL, fast_ema REAL, slow_ema REAL)''')
    conn.commit()
    conn.close()

def log_trade(side, entry, qty, exit_price, pnl, pnl_pct, balance_after):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT INTO trades (timestamp, datetime, side, entry_price, exit_price, quantity, pnl, pnl_percent, balance_after) VALUES (?,?,?,?,?,?,?,?,?)",
              (time.time(), datetime.now().isoformat(), side, entry, exit_price, qty, pnl, pnl_pct, balance_after))
    conn.commit()
    conn.close()

def log_balance(balance):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT INTO balance_history (timestamp, balance) VALUES (?,?)", (time.time(), balance))
    conn.commit()
    conn.close()

def log_price(price, fast_ema, slow_ema):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT INTO price_history (timestamp, price, fast_ema, slow_ema) VALUES (?,?,?,?)", (time.time(), price, fast_ema, slow_ema))
    conn.commit()
    conn.close()

# ---------- GLOBAL ----------
app = Flask(__name__)
app.secret_key = os.urandom(24)
bot_running = True
bot_paused = False
current_position = None
market_data = {"price": 0, "fast_ema": 0, "slow_ema": 0, "signal": "Waiting"}
trade_log = deque(maxlen=100)
client = None
account_balance = 0
price_ticks = deque(maxlen=200)
trade_volumes = deque(maxlen=200)
daily_pnl = 0.0
daily_start_balance = 0
config = load_config()
init_db()

# ---------- HELPERS ----------
async def set_leverage(client, symbol, lev):
    try:
        await client.futures_change_leverage(symbol=symbol, leverage=lev)
        print(f"Leverage {lev}x set")
    except Exception as e:
        print(f"Leverage error: {e}")

async def get_balance(client):
    try:
        acc = await client.futures_account()
        for asset in acc['assets']:
            if asset['asset'] == 'USDT':
                return float(asset['walletBalance'])
    except:
        return 0
    return 0

async def cancel_all_orders(client, symbol):
    try:
        await client.futures_cancel_all_open_orders(symbol=symbol)
    except:
        pass

def compute_ema(prices, period):
    if len(prices) < period:
        return 0
    return sum(prices[-period:]) / period

def calculate_position_size(balance, price, cfg, avg_volume=None):
    risk_usd = balance * (cfg["balance_per_trade"] / 100.0)
    risk_usd = max(cfg["min_trade_usd"], min(cfg["max_trade_usd"], risk_usd))
    if cfg["volume_scaling"] and avg_volume and avg_volume > 0:
        vol_factor = min(2.0, avg_volume / 10.0)
        risk_usd *= vol_factor
    qty = risk_usd / price
    qty = math.floor(qty * 1000) / 1000
    return max(0.001, qty)

async def place_oco(client, symbol, quantity, entry_price, sl_pct, tp_pct):
    stop_price = entry_price * (1 - sl_pct/100)
    limit_price = stop_price * 0.999
    take_profit = entry_price * (1 + tp_pct/100)
    try:
        oco = await client.futures_create_oco_order(
            symbol=symbol, side="SELL", quantity=quantity,
            stopPrice=stop_price, stopLimitPrice=limit_price,
            stopLimitTimeInForce='GTC', price=take_profit
        )
        return oco
    except Exception as e:
        print(f"OCO error: {e}")
        return None

async def close_market(client, symbol, quantity, side):
    opposite = "SELL" if side == "BUY" else "BUY"
    try:
        order = await client.futures_create_order(
            symbol=symbol, side=opposite, type=ORDER_TYPE_MARKET, quantity=quantity
        )
        return order
    except Exception as e:
        print(f"Close error: {e}")
        return None

# ---------- MAIN TRADING LOOP ----------
async def run_bot():
    global bot_running, bot_paused, current_position, market_data, client, account_balance
    global trade_log, daily_pnl, daily_start_balance, price_ticks, trade_volumes

    while bot_running and not config.get("live_enabled", False):
        await asyncio.sleep(2)
        config.update(load_config())
        if config.get("live_enabled"):
            break
    if not bot_running:
        return

    api_key = config["api_key"]
    api_secret = config["api_secret"]
    if not api_key or not api_secret:
        print("❌ API keys missing")
        return

    client = await AsyncClient.create(api_key=api_key, api_secret=api_secret, testnet=config["use_testnet"])
    await set_leverage(client, config["symbol"], config["leverage"])
    await cancel_all_orders(client, config["symbol"])
    account_balance = await get_balance(client)
    daily_start_balance = account_balance
    log_balance(account_balance)

    bm = BinanceSocketManager(client)
    trade_socket = bm.futures_trade_socket(config["symbol"])
    mode = "TESTNET" if config["use_testnet"] else "REAL"
    print(f"✅ BOT LIVE | {mode} | {config['symbol']} | {config['leverage']}x")

    async with trade_socket as tstream:
        while bot_running:
            if bot_paused:
                await asyncio.sleep(0.5)
                continue
            if len(price_ticks) % 20 == 0:
                new = load_config()
                config.update(new)

            try:
                msg = await tstream.recv()
                if msg and 'p' in msg and 'q' in msg:
                    price = float(msg['p'])
                    volume = float(msg['q'])
                    market_data["price"] = price
                    price_ticks.append(price)
                    trade_volumes.append(volume)

                    if len(price_ticks) >= config["slow_ema"]:
                        fast = compute_ema(price_ticks, config["fast_ema"])
                        slow = compute_ema(price_ticks, config["slow_ema"])
                        market_data["fast_ema"] = fast
                        market_data["slow_ema"] = slow
                        log_price(price, fast, slow)

                        avg_vol = sum(trade_volumes)/len(trade_volumes) if trade_volumes else 0

                        # BUY signal
                        if fast > slow and len(price_ticks) > config["slow_ema"]+1:
                            prev_fast = compute_ema(list(price_ticks)[-config["fast_ema"]-1:-1], config["fast_ema"])
                            prev_slow = compute_ema(list(price_ticks)[-config["slow_ema"]-1:-1], config["slow_ema"])
                            if prev_fast <= prev_slow and current_position is None:
                                market_data["signal"] = "🔵 BUY"
                                account_balance = await get_balance(client)
                                qty = calculate_position_size(account_balance, price, config, avg_vol)
                                if qty >= 0.001:
                                    try:
                                        order = await client.futures_create_order(
                                            symbol=config["symbol"], side="BUY", type=ORDER_TYPE_MARKET, quantity=qty
                                        )
                                        if order:
                                            entry = price
                                            sl_pct = config["stop_loss_pct"]
                                            tp_pct = sl_pct * config["profit_ratio"]
                                            sl_price = entry * (1 - sl_pct/100)
                                            tp_price = entry * (1 + tp_pct/100)
                                            oco = await place_oco(client, config["symbol"], qty, entry, sl_pct, tp_pct)
                                            current_position = {"side":"BUY","entry_price":entry,"quantity":qty,
                                                                "sl":sl_price,"tp":tp_price,"oco_id":oco.get('orderListId') if oco else None}
                                            trade_log.appendleft({"time":datetime.now().strftime("%H:%M:%S"),"action":"🚀 LONG","price":entry,"qty":qty})
                                            print(f"✅ LONG @ {entry:.2f} | Qty {qty} | SL {sl_price:.2f} | TP {tp_price:.2f}")
                                    except Exception as e:
                                        print(f"Order error: {e}")

                        # SELL signal
                        elif fast < slow and len(price_ticks) > config["slow_ema"]+1:
                            prev_fast = compute_ema(list(price_ticks)[-config["fast_ema"]-1:-1], config["fast_ema"])
                            prev_slow = compute_ema(list(price_ticks)[-config["slow_ema"]-1:-1], config["slow_ema"])
                            if prev_fast >= prev_slow and current_position is not None:
                                market_data["signal"] = "🔴 SELL"
                                await cancel_all_orders(client, config["symbol"])
                                close = await close_market(client, config["symbol"], current_position["quantity"], current_position["side"])
                                if close:
                                    pnl = (price - current_position["entry_price"]) * current_position["quantity"]
                                    pnl_pct = pnl / (current_position["entry_price"] * current_position["quantity"]) * 100
                                    account_balance = await get_balance(client)
                                    log_trade(current_position["side"], current_position["entry_price"], current_position["quantity"], price, pnl, pnl_pct, account_balance)
                                    log_balance(account_balance)
                                    trade_log.appendleft({"time":datetime.now().strftime("%H:%M:%S"),"action":"🏁 CLOSED","price":price,"pnl":round(pnl,2)})
                                    print(f"💰 Closed P&L: ${pnl:.2f} ({pnl_pct:.2f}%) | Balance: ${account_balance:.2f}")
                                    current_position = None

                    # Daily loss limit
                    if daily_start_balance > 0 and account_balance > 0:
                        loss_pct = (daily_start_balance - account_balance) / daily_start_balance * 100
                        if loss_pct > config["max_daily_loss_pct"]:
                            print(f"Daily loss limit reached. Stopping.")
                            bot_running = False

                    await asyncio.sleep(0.02)
            except Exception as e:
                print(f"Websocket error: {e}")
                await asyncio.sleep(1)

    if client:
        await client.close_connection()
    print("Bot stopped.")

# ---------- WEB DASHBOARD ----------
HTML_DASH = """
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Ultra Scalper</title>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<style>
body{background:#0a0c10;color:#eef;font-family:system-ui;padding:16px}
.container{max-width:700px;margin:0 auto}
.card{background:#131722;border-radius:32px;padding:20px;margin-bottom:20px}
.price{font-size:2.5rem;font-weight:bold}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}
.metric{background:#1e2a3a;border-radius:20px;padding:12px;text-align:center}
button{background:#2c3e66;border:none;color:white;padding:10px 16px;border-radius:40px;margin:4px;cursor:pointer}
.danger{background:#922b21}
.warning{background:#b9770e}
.success{background:#1e7e34}
.log{background:#0a0e14;border-radius:20px;padding:12px;max-height:200px;overflow:auto;font-family:monospace;font-size:0.75rem}
</style>
<script>
async function fetchData(){
    const r=await fetch('/api/status');
    const d=await r.json();
    document.getElementById('price').innerHTML=`$${d.price.toFixed(2)}`;
    document.getElementById('fast').innerHTML=d.fast_ema.toFixed(2);
    document.getElementById('slow').innerHTML=d.slow_ema.toFixed(2);
    document.getElementById('balance').innerHTML=`$${d.balance.toFixed(2)}`;
    document.getElementById('pnl').innerHTML=`$${d.daily_pnl.toFixed(2)}`;
    document.getElementById('signal').innerHTML=d.signal;
    document.getElementById('position').innerHTML=d.position?`${d.position.side} @ $${d.position.entry_price.toFixed(2)}`:'None';
    let logDiv=document.getElementById('log');
    logDiv.innerHTML='';
    d.trade_log.slice(0,10).forEach(t=>{logDiv.innerHTML+=`<div>[${t.time}] ${t.action} @ $${t.price} ${t.pnl?`<span class="${t.pnl>=0?'profit':'loss'}">$${t.pnl}</span>`:''}</div>`});
    if(d.graph_json) Plotly.react('graph',JSON.parse(d.graph_json));
}
function control(a){fetch(`/api/control?action=${a}`);fetchData();}
setInterval(fetchData,1500);
window.onload=fetchData;
</script>
</head>
<body>
<div class="container">
<div class="card">
<h2>⚡ Ultra Scalper</h2>
<div class="price" id="price">---</div>
<div class="grid">
<div class="metric">EMA5<br><span id="fast">--</span></div>
<div class="metric">EMA20<br><span id="slow">--</span></div>
<div class="metric">Balance<br><span id="balance">--</span></div>
<div class="metric">Daily PnL<br><span id="pnl">--</span></div>
</div>
<div id="signal" style="text-align:center;font-size:1.4rem;margin:12px 0">---</div>
<div class="grid"><div class="metric">Position<br><span id="position">--</span></div></div>
<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">
<button onclick="control('pause')">⏸ Pause</button>
<button onclick="control('resume')">▶ Resume</button>
<button class="danger" onclick="control('stop')">⛔ Stop</button>
<button class="warning" onclick="location.href='/settings'">⚙️ Settings</button>
<button class="success" onclick="control('enable_live')">🔓 Enable Live</button>
</div>
</div>
<div class="card"><div id="graph" style="height:280px"></div></div>
<div class="card"><div class="log" id="log">Starting...</div></div>
</div>
</body>
</html>
"""

SETTINGS_HTML = """
<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width"><title>Settings</title><style>
body{background:#0a0c10;color:#eef;font-family:system-ui;padding:20px}
.card{background:#131722;border-radius:32px;padding:24px;max-width:500px;margin:0 auto}
input,select{width:100%;padding:12px;margin:8px 0;border-radius:20px;background:#1e2a3a;color:white;border:none}
button{background:#2c3e66;padding:14px;border-radius:40px;width:100%;margin-top:20px}
</style></head>
<body>
<div class="card">
<h2>⚙️ Configuration</h2>
<form method="post">
<input name="api_key" placeholder="API Key" value="{{ config.api_key }}">
<input name="api_secret" type="password" placeholder="API Secret" value="{{ config.api_secret }}">
<label><input type="checkbox" name="use_testnet" {% if config.use_testnet %}checked{% endif %}> Use Testnet (paper)</label>
<input name="leverage" type="number" value="{{ config.leverage }}" placeholder="Leverage">
<input name="balance_per_trade" value="{{ config.balance_per_trade }}" placeholder="% per trade">
<input name="stop_loss_pct" value="{{ config.stop_loss_pct }}" placeholder="Stop loss %">
<input name="profit_ratio" value="{{ config.profit_ratio }}" placeholder="Profit ratio">
<input name="symbol" value="{{ config.symbol }}" placeholder="Symbol">
<input name="min_trade_usd" value="{{ config.min_trade_usd }}" placeholder="Min trade $">
<input name="max_trade_usd" value="{{ config.max_trade_usd }}" placeholder="Max trade $">
<label><input type="checkbox" name="volume_scaling" {% if config.volume_scaling %}checked{% endif %}> Volume scaling</label>
<button type="submit">Save & Restart</button>
</form>
<a href="/" style="color:#f0b90b;display:block;text-align:center;margin-top:16px">← Back</a>
</div>
</body>
</html>
"""

@app.route('/')
def dashboard():
    return render_template_string(HTML_DASH)

@app.route('/settings', methods=['GET','POST'])
def settings_page():
    global config
    if request.method == 'POST':
        new = load_config()
        new['api_key'] = request.form.get('api_key','')
        new['api_secret'] = request.form.get('api_secret','')
        new['use_testnet'] = 'use_testnet' in request.form
        new['leverage'] = int(request.form.get('leverage',20))
        new['balance_per_trade'] = float(request.form.get('balance_per_trade',2))
        new['stop_loss_pct'] = float(request.form.get('stop_loss_pct',0.06))
        new['profit_ratio'] = float(request.form.get('profit_ratio',1.5))
        new['symbol'] = request.form.get('symbol','BTCUSDT').upper()
        new['min_trade_usd'] = float(request.form.get('min_trade_usd',0.5))
        new['max_trade_usd'] = float(request.form.get('max_trade_usd',100))
        new['volume_scaling'] = 'volume_scaling' in request.form
        new['live_enabled'] = False
        save_config(new)
        config = new
        global bot_running
        bot_running = False
        return "<html><body style='background:#0a0c10;color:white;text-align:center;padding:50px'><h2>✅ Saved. Bot restarts in 5s.</h2><script>setTimeout(()=>location.href='/',5000)</script></body></html>"
    return render_template_string(SETTINGS_HTML, config=config)

@app.route('/api/status')
def api_status():
    conn = sqlite3.connect(DB_FILE)
    df = pd.read_sql_query("SELECT timestamp, price, fast_ema, slow_ema FROM price_history ORDER BY timestamp DESC LIMIT 200", conn)
    conn.close()
    graph_json = "{}"
    if len(df) > 0:
        df = df.iloc[::-1]
        fig = go.Figure()
        fig.add_trace(go.Scatter(x=df['timestamp'], y=df['price'], mode='lines', name='Price', line=dict(color='#f0b90b')))
        fig.add_trace(go.Scatter(x=df['timestamp'], y=df['fast_ema'], mode='lines', name='EMA5', line=dict(color='#2ecc71')))
        fig.add_trace(go.Scatter(x=df['timestamp'], y=df['slow_ema'], mode='lines', name='EMA20', line=dict(color='#e74c3c')))
        fig.update_layout(template='plotly_dark', height=280, margin=dict(l=0,r=0,t=20,b=0))
        graph_json = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
    return jsonify({
        "price": market_data.get("price",0),
        "fast_ema": market_data.get("fast_ema",0),
        "slow_ema": market_data.get("slow_ema",0),
        "signal": market_data.get("signal","---"),
        "position": current_position,
        "balance": account_balance,
        "daily_pnl": daily_pnl,
        "trade_log": list(trade_log),
        "graph_json": graph_json
    })

@app.route('/api/control')
def control():
    global bot_running, bot_paused, config
    a = request.args.get('action')
    if a == 'pause':
        bot_paused = True
    elif a == 'resume':
        bot_paused = False
    elif a == 'stop':
        bot_running = False
    elif a == 'enable_live':
        cfg = load_config()
        cfg['live_enabled'] = True
        save_config(cfg)
        config.update(cfg)
        bot_running = False
    return jsonify({"ok":True})

def start_loop():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    while True:
        try:
            loop.run_until_complete(run_bot())
        except Exception as e:
            print(f"Crash: {e}. Restart in 5s")
            time.sleep(5)
        else:
            break

if __name__ == "__main__":
    print("Starting Ultra Scalper Bot...")
    init_db()
    threading.Thread(target=start_loop, daemon=True).start()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False, use_reloader=False)
