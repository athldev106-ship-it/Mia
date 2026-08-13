'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The hero's 3D scene: the cafe's bowl, turning slowly under warm light,
 * with a few ingredients orbiting it.
 *
 * Built from Three.js primitives rather than a loaded model. There is no
 * 3D asset for this business, and a lathe-turned bowl in the brand's own
 * greens is both closer to the logo and a fraction of the weight of any
 * .glb worth downloading.
 *
 * Three things keep it from costing what a 3D hero usually costs:
 *
 *  - Three.js is imported dynamically inside the effect, so it is fetched
 *    only when this component actually mounts and never enters the bundle
 *    any other route shares.
 *  - It refuses to start under prefers-reduced-motion, on small screens,
 *    and on devices reporting few cores -- the gradient behind it is a
 *    perfectly good hero, and a mid-range phone should not spend its
 *    battery on a spinning bowl.
 *  - The loop stops whenever the hero scrolls out of view or the tab is
 *    hidden, so it costs nothing while someone reads the menu.
 *
 * Anything that throws leaves `ready` false, and the caller keeps showing
 * the gradient. A failed decoration must never take the page with it.
 */
/**
 * Whether this machine has a GPU worth rendering on.
 *
 * A device can report plenty of cores and still have no usable GPU, in
 * which case the browser quietly rasterises WebGL in software --
 * SwiftShader on Chromium, llvmpipe on Mesa. That runs this scene at a
 * few frames a second and heats the device for a decoration.
 *
 * Probed with a throwaway canvas rather than through Three.js, so the
 * answer is known before deciding whether to fetch 185 KB. Fails open: if
 * the extension is unavailable -- Firefox hides it behind a pref, Safari
 * masks it -- the string is empty, nothing matches, and the scene runs.
 */
function hasUsableGpu(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl');
    if (!gl || !('getExtension' in gl)) return false;
    const ctx = gl as WebGLRenderingContext;
    try {
      const info = ctx.getExtension('WEBGL_debug_renderer_info');
      if (!info) return true;
      const driver = String(ctx.getParameter(info.UNMASKED_RENDERER_WEBGL));
      return !/swiftshader|llvmpipe|software|basic render/i.test(driver);
    } finally {
      // Hand the context back rather than waiting for the collector.
      // Browsers cap live WebGL contexts -- Chromium at about 16 -- and
      // drop the oldest silently when you go over. Dropping the probe's
      // context on the floor would spend one of those on every mount and
      // could eventually cost the real scene its own.
      ctx.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    return false;
  }
}

export function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Every disqualifier runs before the library is fetched. Downloading
    // 185 KB and then deciding not to use it is the worst of both.
    //
    // ?force3d overrides the capability gates so the scene can be seen and
    // screenshotted on a machine that would otherwise decline -- a CI
    // browser on software WebGL, or a laptop with no discrete GPU.
    // Reduced-motion is deliberately not overridable: that one is a
    // stated preference rather than a guess about the hardware.
    const forced = new URLSearchParams(window.location.search).has('force3d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    if (!forced) {
      const small = window.matchMedia('(max-width: 767px)').matches;
      const weak = (navigator.hardwareConcurrency ?? 8) < 4;
      if (small || weak) return;
      if (!hasUsableGpu()) return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const THREE = await import('three');
        if (disposed) return;

        const width = mount.clientWidth;
        const height = mount.clientHeight;
        if (width === 0 || height === 0) return;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(width, height, false);
        // setSize's third argument suppresses the inline style, which
        // leaves the canvas displaying at its raw buffer width -- about
        // 3000px on a 2x screen, so the scene renders enormous and
        // cropped. The buffer stays retina-sized; CSS scales it to the box.
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.display = 'block';
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
        camera.position.set(0, 2.15, 4.5);
        // The object stays at the origin and the camera looks straight at
        // it. Positioning it clear of the headline is the canvas element's
        // job, done in CSS -- trying to do it by offsetting the model and
        // re-aiming the camera just fights itself at different viewports.
        const target = new THREE.Vector3(0, 0.22, 0);
        camera.lookAt(target);

        /* ---- Materials, in the brand's colours ---- */
        const sage = new THREE.MeshStandardMaterial({
          color: 0x94a76f,
          roughness: 0.42,
          metalness: 0.05,
        });
        const forest = new THREE.MeshStandardMaterial({
          color: 0x1f2a22,
          roughness: 0.6,
        });
        const cream = new THREE.MeshStandardMaterial({
          color: 0xf3f1e7,
          roughness: 0.85,
        });

        /* ---- The bowl, turned on a lathe from its profile ----
           Shallow and wide, like the logo's. DoubleSide so the inside of
           the bowl is actually visible from the raised camera -- a lathe
           is a surface, not a solid, and single-sided it reads as a
           cut-open shell. */
        const profile: InstanceType<typeof THREE.Vector2>[] = [];
        for (let i = 0; i <= 16; i += 1) {
          const t = i / 16;
          profile.push(new THREE.Vector2(0.22 + Math.sin(t * Math.PI * 0.5) * 0.78, t * 0.42));
        }
        sage.side = THREE.DoubleSide;
        const bowl = new THREE.Mesh(new THREE.LatheGeometry(profile, 96), sage);

        // What is in the bowl: a shallow cream disc just below the rim.
        const contents = new THREE.Mesh(new THREE.CircleGeometry(0.93, 64), cream);
        contents.rotation.x = -Math.PI / 2;
        contents.position.y = 0.36;

        const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.1, 48), forest);
        foot.position.y = -0.05;

        const bowlGroup = new THREE.Group();
        bowlGroup.add(bowl, contents, foot);

        /* ---- The logo's three discs, orbiting above the rim ---- */
        const discs = new THREE.Group();
        for (let i = 0; i < 3; i += 1) {
          const disc = new THREE.Mesh(new THREE.CircleGeometry(0.1, 32), sage);
          const angle = (i / 3) * Math.PI * 2;
          disc.position.set(Math.cos(angle) * 0.98, 0.72, Math.sin(angle) * 0.98);
          discs.add(disc);
        }

        const root = new THREE.Group();
        root.add(bowlGroup, discs);
        // Sized to leave clear margin inside its half of the hero rather
        // than running to the edges.
        root.scale.setScalar(0.82);
        scene.add(root);

        /* ---- Light: warm key, cool fill, so the greens stay green ---- */
        scene.add(new THREE.AmbientLight(0xffffff, 0.55));
        const key = new THREE.DirectionalLight(0xfff2d8, 2.1);
        key.position.set(3.5, 6, 4);
        scene.add(key);
        const rim = new THREE.DirectionalLight(0x9dc4ff, 0.7);
        rim.position.set(-4, 2, -3);
        scene.add(rim);

        /* ---- Motion ---- */
        let pointerX = 0;
        let pointerY = 0;
        const onPointer = (event: PointerEvent) => {
          pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
          pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('pointermove', onPointer, { passive: true });

        const onResize = () => {
          const w = mount.clientWidth;
          const h = mount.clientHeight;
          if (w === 0 || h === 0) return;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', onResize);

        // Only run while the hero is actually on screen and the tab is
        // in front. A 3D scene ticking behind the menu is pure waste.
        let onScreen = true;
        const io = new IntersectionObserver(
          ([entry]) => {
            onScreen = entry.isIntersecting;
          },
          { threshold: 0.02 },
        );
        io.observe(mount);

        let frame = 0;
        const start = performance.now();
        const tick = () => {
          frame = requestAnimationFrame(tick);
          if (!onScreen || document.hidden) return;

          const t = (performance.now() - start) / 1000;
          bowlGroup.rotation.y = t * 0.22;
          root.position.y = Math.sin(t * 0.7) * 0.035;

          discs.rotation.y = -t * 0.3;
          discs.children.forEach((disc, i) => {
            disc.position.y = 0.72 + Math.sin(t * 0.9 + i * 2.1) * 0.05;
            disc.lookAt(camera.position);
          });

          // Ease toward the pointer rather than tracking it exactly.
          camera.position.x += (pointerX * 0.4 - camera.position.x) * 0.04;
          camera.position.y += (2.15 - pointerY * 0.3 - camera.position.y) * 0.04;
          camera.lookAt(target);

          renderer.render(scene, camera);
        };
        frame = requestAnimationFrame(tick);
        setReady(true);

        cleanup = () => {
          cancelAnimationFrame(frame);
          io.disconnect();
          window.removeEventListener('pointermove', onPointer);
          window.removeEventListener('resize', onResize);
          renderer.dispose();
          scene.traverse((obj) => {
            const mesh = obj as InstanceType<typeof THREE.Mesh>;
            if (mesh.geometry) mesh.geometry.dispose();
          });
          [sage, forest, cream].forEach((m) => m.dispose());
          renderer.domElement.remove();
        };
      } catch (error) {
        // The gradient is already behind this; say so and stop.
        console.warn('[hero] 3D scene unavailable, keeping the gradient', error);
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] transition-opacity duration-1000 md:block"
      style={{ opacity: ready ? 1 : 0 }}
    />
  );
}
