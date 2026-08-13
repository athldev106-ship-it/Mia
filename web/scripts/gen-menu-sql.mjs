/**
 * Regenerates the menu half of supabase/seed.sql from src/lib/menu-fallback.ts.
 *
 *   node scripts/gen-menu-sql.mjs
 *
 * The fallback module is what the site serves when no database is attached,
 * and the seed is what fills the database. Typing 84 dishes twice would
 * guarantee they drift, so the module is the single source and this writes
 * the SQL. Edit the module, run this, commit both.
 *
 * The site_settings block at the top of seed.sql is left alone.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src/lib/menu-fallback.ts'), 'utf8');

// Pull the SEED array out of the TS source without needing a compiler.
const marker = 'const SEED: SeedCategory[] = ';
const start = src.indexOf(marker) + marker.length;
const end = src.indexOf('\n];', start) + 2;
// Evaluated as JavaScript rather than coerced into JSON: the array literal
// is already valid JS, and a regex rewrite would mangle apostrophes and
// the em-dashes the descriptions are full of.
const SEED = new Function(`return ${src.slice(start, end)}`)();

const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => (!a || a.length === 0 ? "'{}'" : `'{${a.map((x) => `"${x}"`).join(',')}}'`);

let sql = `-- ---------------------------------------------------------------------
-- Menu categories, in the order the printed card runs them.
-- ---------------------------------------------------------------------
insert into public.menu_categories (name, slug, description, brand, sort_order) values\n`;
sql += SEED.map((c, i) =>
  `  (${q(c.name)}, ${q(c.slug)}, ${q(c.description)}, ${q(c.brand)}, ${i + 1})`,
).join(',\n');
sql += `\non conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  brand       = excluded.brand,
  sort_order  = excluded.sort_order;

-- ---------------------------------------------------------------------
-- Menu items.
-- ---------------------------------------------------------------------
insert into public.menu_items
  (category_id, name, description, price_paise, price_nonveg_paise,
   is_veg, allergens, is_featured, sort_order)
select c.id, v.name, v.description, v.price_paise, v.price_nonveg_paise,
       v.is_veg, v.allergens, v.is_featured, v.sort_order
from (values\n`;

const rows = [];
for (const c of SEED) {
  c.items.forEach((it, i) => {
    rows.push(
      `  (${q(c.slug)}, ${q(it.name)}, ${q(it.description ?? null)}, ${it.price_paise}, ` +
        `${it.price_nonveg_paise ?? 'null'}, ${it.is_veg}, ${arr(it.allergens)}::text[], ` +
        `${it.is_featured ?? false}, ${i + 1})`,
    );
  });
}
sql += rows.join(',\n');
sql += `
) as v(slug, name, description, price_paise, price_nonveg_paise,
       is_veg, allergens, is_featured, sort_order)
join public.menu_categories c on c.slug = v.slug
where not exists (
  select 1 from public.menu_items m where m.name = v.name and m.category_id = c.id
);
`;

const seedPath = join(root, 'supabase/seed.sql');
const existing = readFileSync(seedPath, 'utf8');
const menuStart = '-- ---------------------------------------------------------------------\n-- Menu categories';
writeFileSync(seedPath, existing.slice(0, existing.indexOf(menuStart)) + sql);
console.log(`seed.sql: ${SEED.length} categories, ${rows.length} items`);
