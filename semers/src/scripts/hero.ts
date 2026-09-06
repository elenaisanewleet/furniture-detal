/**
 * The hero: an apple made of light that becomes a bar as the reader scrolls.
 *
 * Twenty-odd thousand points, each carrying two positions — one on the skin
 * of an apple, one on the skin of a bar — and a blend between them driven by
 * how far the reader has scrolled through the pinned hero. In the middle of
 * the blend the points swarm apart and glow honey, which is the baking, before
 * settling into the bar.
 *
 * Everything degrades: no WebGL, reduced motion, or a battery-saving device
 * with too few cores and the poster photograph behind the canvas is simply
 * what the reader sees. The canvas only fades in once it has drawn a frame.
 */
import * as THREE from 'three';

const section = document.querySelector<HTMLElement>('[data-hero]');
const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function webgl() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

if (section && canvas && !reduced && webgl()) {
  // Hoisted `frame()` below cannot see the narrowing above; pin the element here.
  const cv = canvas;
  const cores = navigator.hardwareConcurrency || 4;
  const mobile = matchMedia('(max-width: 48rem)').matches;
  const COUNT = mobile ? 9000 : cores <= 4 ? 14000 : 26000;

  /* ------------------------------------------------------------ the shapes */
  /*
   * Both bodies are superellipsoids, sampled by direction and scaled to the
   * surface: an apple is one with exponent two, a dimple pressed into the top
   * and a slight waist; a bar is one with exponent six, which is a box with
   * rounded edges. Sampling by direction means every apple point has a bar
   * point in the same general direction, so the morph reads as one thing
   * changing shape rather than two things swapping.
   */
  const apple = new Float32Array(COUNT * 3);
  const bar = new Float32Array(COUNT * 3);
  const rand = new Float32Array(COUNT);
  const superR = (dx: number, dy: number, dz: number, a: number, b: number, c: number, n: number) =>
    1 / Math.pow(Math.pow(Math.abs(dx / a), n) + Math.pow(Math.abs(dy / b), n) + Math.pow(Math.abs(dz / c), n), 1 / n);

  for (let i = 0; i < COUNT; i++) {
    // Uniform direction on the sphere.
    const u = Math.random() * 2 - 1;
    const th = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const dx = s * Math.cos(th), dy = u, dz = s * Math.sin(th);
    const r = Math.random();
    rand[i] = r;
    // A few points sit just under the skin so the body reads as solid, not hollow.
    const depth = r < 0.18 ? 0.7 + Math.random() * 0.3 : 1;

    // Apple: r=1 sphere, 8% wider than tall, a dimple at the stem, a shallow one at the base.
    let ra = superR(dx, dy, dz, 1.06, 0.98, 1.06, 2.2);
    const top = Math.max(0, dy);
    ra *= 1 - 0.32 * Math.exp(-Math.pow((1 - top) / 0.16, 2)) * (top > 0.5 ? 1 : 0);
    ra *= 1 - 0.1 * Math.exp(-Math.pow((1 + dy) / 0.22, 2));
    // Apples have five faint lobes; a whisper of that keeps it from being a ball.
    ra *= 1 + 0.02 * Math.cos(th * 5) * s;
    apple[i * 3] = dx * ra * depth;
    apple[i * 3 + 1] = dy * ra * depth;
    apple[i * 3 + 2] = dz * ra * depth;

    // Bar: a rounded box, long across, lying flat.
    const rb = superR(dx, dy, dz, 1.65, 0.36, 0.62, 6);
    bar[i * 3] = dx * rb * depth;
    bar[i * 3 + 1] = dy * rb * depth;
    bar[i * 3 + 2] = dz * rb * depth;
  }

  /* --------------------------------------------------------------- the scene */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 1.75));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
  camera.position.set(0, 0.05, 3.9);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(apple, 3));
  geo.setAttribute('aBar', new THREE.BufferAttribute(bar, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));

  const col = (hex: string) => new THREE.Color(hex);
  const uniforms = {
    uP: { value: 0 },
    uTime: { value: 0 },
    uSize: { value: mobile ? 13 : 11 },
    cA: { value: col('#f15a22') },
    cA2: { value: col('#b8401a') },
    cB: { value: col('#d88351') },
    cB2: { value: col('#ffd98a') },
    cM: { value: col('#fdb913') },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uP; uniform float uTime; uniform float uSize;
      attribute vec3 aBar; attribute float aRand;
      varying float vE; varying float vRand;
      void main() {
        float e = uP * uP * (3.0 - 2.0 * uP);
        vec3 p = mix(position, aBar, e);
        // The swarm: strongest half way, and every point takes its own path.
        float s = sin(e * 3.14159);
        vec3 n = vec3(sin(aRand * 12.9 + uTime * 0.7), cos(aRand * 7.3 + uTime * 0.55), sin(aRand * 5.1 - uTime * 0.45));
        p += n * s * (0.3 + 0.5 * aRand);
        // Breathing, so the body is never quite still.
        p += 0.014 * vec3(sin(uTime * 1.1 + aRand * 20.0), cos(uTime * 0.9 + aRand * 17.0), sin(uTime * 1.3 + aRand * 11.0));
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (0.55 + aRand * 0.9) * (1.0 + s * 0.7) / -mv.z;
        vE = e; vRand = aRand;
      }`,
    fragmentShader: /* glsl */ `
      precision mediump float;
      uniform vec3 cA, cA2, cB, cB2, cM;
      varying float vE; varying float vRand;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.1, d);
        vec3 fruit = mix(cA, cA2, vRand);
        vec3 crumb = mix(cB, cB2, vRand);
        vec3 c = mix(fruit, crumb, vE);
        c = mix(c, cM, sin(vE * 3.14159) * 0.65);
        gl_FragColor = vec4(c, a * 0.8);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  /* ------------------------------------------------------------- the inputs */
  let progress = 0;
  let targetRX = 0, targetRY = 0, rx = 0, ry = 0;
  const onPointer = (e: PointerEvent) => {
    targetRY = (e.clientX / innerWidth - 0.5) * 0.5;
    targetRX = (e.clientY / innerHeight - 0.5) * 0.3;
  };
  addEventListener('pointermove', onPointer, { passive: true });

  const readProgress = () => {
    const box = section.getBoundingClientRect();
    const travel = section.offsetHeight - innerHeight;
    progress = travel > 0 ? Math.min(1, Math.max(0, -box.top / travel)) : 0;
    section.style.setProperty('--hp', progress.toFixed(3));
  };

  const resize = () => {
    const w = cv.clientWidth, h = cv.clientHeight;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    // The bar is wide. A portrait phone cannot hold it at full size, so the
    // whole body is scaled down there rather than pushed away, which would
    // shrink the points to dust; a landscape screen sits a little closer.
    camera.position.z = aspect < 0.8 ? 5.2 : aspect < 1.2 ? 4.4 : 3.9;
    group.scale.setScalar(aspect < 0.9 ? Math.max(0.52, aspect / 0.9) : 1);
    // On a phone the copy fills the lower half, so the fruit sits up behind the headline.
    group.position.y = aspect < 0.9 ? 0.55 : 0;
  };
  resize();
  addEventListener('resize', resize, { passive: true });

  /* ---------------------------------------------------------------- the loop */
  let live = true, first = true, t0 = performance.now();
  new IntersectionObserver(([en]) => { live = en.isIntersecting; if (live) frame(); }, { rootMargin: '10% 0px' }).observe(section);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && live) frame(); });

  function frame() {
    if (!live || document.hidden) return;
    readProgress();
    const t = (performance.now() - t0) / 1000;
    uniforms.uTime.value = t;
    uniforms.uP.value += (progress - uniforms.uP.value) * 0.12;
    rx += (targetRX - rx) * 0.05;
    ry += (targetRY - ry) * 0.05;
    group.rotation.y = t * 0.12 + ry;
    group.rotation.x = rx + 0.08;
    // The bar lies down as it forms: a quarter turn that lands with the shape.
    group.rotation.z = -0.35 * uniforms.uP.value * uniforms.uP.value;
    renderer.render(scene, camera);
    if (first) { first = false; cv.classList.add('is-ready'); }
    requestAnimationFrame(frame);
  }
  frame();
} else if (section) {
  // No canvas will draw; the poster is the hero and the copy still swaps with scroll.
  const tick = () => {
    const box = section.getBoundingClientRect();
    const travel = section.offsetHeight - innerHeight;
    section.style.setProperty('--hp', (travel > 0 ? Math.min(1, Math.max(0, -box.top / travel)) : 0).toFixed(3));
  };
  addEventListener('scroll', tick, { passive: true });
  tick();
}
