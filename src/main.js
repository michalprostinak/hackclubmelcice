import * as THREE from 'three';
import './style.css';

window.addEventListener('DOMContentLoaded', () => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.innerWidth < 720;

  /* ---------- THREE.JS FOREST ---------- */
  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.3 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const skyColor = 0xE7F1F9;
  scene.background = new THREE.Color(skyColor);
  scene.fog = new THREE.FogExp2(skyColor, mobile ? 0.017 : 0.013);

  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(0, 3.2, 9);
  const lookCur = new THREE.Vector3(0, 2, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x6b7a63, 0.95));
  const sun = new THREE.DirectionalLight(0xfff6e6, 0.85);
  sun.position.set(-20, 30, 10);
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 340), new THREE.MeshLambertMaterial({ color: 0xCFE0D2 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(-6, 0, -60);
  scene.add(ground);

  const nodes = {
    start: [0, 0, 6], fork: [0, 0, -14],
    objavhub: [-10, 0, -24], onas: [-18, 0, -48], tim: [-24, 0, -72], hackclub: [-30, 0, -96], projekty: [-36, 0, -120],
    pridajhub: [10, 0, -24], harmonogram: [18, 0, -48], pridajsafinal: [24, 0, -72]
  };
  const segs = [
    ['start', 'fork'], ['fork', 'objavhub'], ['objavhub', 'onas'], ['onas', 'tim'], ['tim', 'hackclub'], ['hackclub', 'projekty'],
    ['fork', 'pridajhub'], ['pridajhub', 'harmonogram'], ['harmonogram', 'pridajsafinal']
  ];
  const pathMat = new THREE.MeshLambertMaterial({ color: 0xF3F7F2 });
  segs.forEach(([a0, b0]) => {
    const a = nodes[a0], b = nodes[b0];
    const dx = b[0] - a[0], dz = b[2] - a[2], len = Math.sqrt(dx * dx + dz * dz) + 3;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(4.2, len), pathMat);
    plane.rotation.x = -Math.PI / 2;
    plane.rotation.z = -Math.atan2(dx, dz);
    plane.position.set((a[0] + b[0]) / 2, 0.02, (a[2] + b[2]) / 2);
    scene.add(plane);
  });

  const canopies = [];
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 2.2, 6);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6b5842, flatShading: true });
  const coneGeo = new THREE.ConeGeometry(1, 2.1, 7);
  const greens = [0x3E6B4E, 0x2F5A40, 0x4C7D5A, 0x264934];

  function tree(x, z, scale) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.1;
    g.add(trunk);
    const canopy = new THREE.Group();
    const col = greens[(Math.random() * greens.length) | 0];
    for (let i = 0; i < 3; i++) {
      const c = new THREE.Mesh(coneGeo, new THREE.MeshLambertMaterial({ color: col, flatShading: true }));
      c.position.y = 2.1 + i * 1.3;
      c.scale.set(1 - i * 0.22, 1 - i * 0.15, 1 - i * 0.22);
      canopy.add(c);
    }
    g.add(canopy);
    g.position.set(x, 0, z);
    g.rotation.y = Math.random() * 6.28;
    g.scale.setScalar(scale);
    scene.add(g);
    canopies.push({ m: canopy, phase: Math.random() * 10, speed: 0.5 + Math.random() * 0.4 });
  }

  function scatter(count, cx, zMin, zMax) {
    for (let i = 0; i < count; i++) {
      const z = zMin + Math.random() * (zMax - zMin);
      const xc = cx(z);
      const side = Math.random() < 0.5 ? -1 : 1;
      const x = xc + side * (2.6 + Math.random() * 11);
      const scale = 1.1 + Math.random() * 1.6;
      tree(x, z, scale);
    }
  }
  const n = mobile ? 16 : 30;
  scatter(mobile ? 8 : 14, () => 0, -14, 7);
  scatter(n, z => THREE.MathUtils.mapLinear(z, -14, -124, 0, -40), -124, -14);
  scatter(n, z => THREE.MathUtils.mapLinear(z, -14, -76, 0, 40), -76, -14);

  const pCount = mobile ? 60 : 150;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 80;
    pPos[i * 3 + 1] = Math.random() * 8 + 0.5;
    pPos[i * 3 + 2] = 6 - Math.random() * 130;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.18, transparent: true, opacity: 0.55 }));
  scene.add(particles);

  const CAM = {
    'start': { p: nodes.start, l: [0, 2, -6] },
    'objav-hub': { p: [-4, 3, -16], l: [-10, 2, -26] },
    'onas': { p: [-13, 3, -40], l: [-18, 2, -50] },
    'tim': { p: [-20, 3, -64], l: [-24, 2, -74] },
    'hackclub': { p: [-27, 3, -88], l: [-30, 2, -98] },
    'projekty': { p: [-33, 3, -112], l: [-36, 2, -122] },
    'pridaj-hub': { p: [4, 3, -16], l: [10, 2, -26] },
    'harmonogram': { p: [13, 3, -40], l: [18, 2, -50] },
    'pridajsa-final': { p: [20, 3, -64], l: [24, 2, -74] }
  };
  const desiredPos = new THREE.Vector3().copy(camera.position);
  const desiredLook = new THREE.Vector3().copy(lookCur);
  function setCam(id) {
    const c = CAM[id];
    if (!c) return;
    desiredPos.set(...c.p);
    desiredLook.set(...c.l);
    if (reduced) { camera.position.copy(desiredPos); lookCur.copy(desiredLook); }
  }

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const lerp = reduced ? 1 : 0.045;
    camera.position.lerp(desiredPos, lerp);
    lookCur.lerp(desiredLook, lerp);
    camera.lookAt(lookCur);
    canopies.forEach(c => {
      c.m.rotation.z = Math.sin(t * c.speed + c.phase) * 0.035;
      c.m.rotation.x = Math.cos(t * c.speed * 0.8 + c.phase) * 0.02;
    });
    particles.rotation.y = t * 0.01;
    renderer.render(scene, camera);
  }
  animate();
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ---------- UI / SCENES ---------- */
  const scenes = document.querySelectorAll('.scene');
  function goTo(id) {
    const next = document.getElementById(id);
    if (!next) return;
    scenes.forEach(s => s.classList.remove('active'));
    next.classList.add('active');
    setCam(id);
    document.querySelectorAll('.maplist button').forEach(b => {
      b.removeAttribute('aria-current');
      if (b.dataset.go === id) b.setAttribute('aria-current', 'true');
    });
    setTimeout(() => next.focus(), 50);
  }
  document.body.addEventListener('click', e => {
    const t = e.target.closest('[data-go]');
    if (t) { goTo(t.dataset.go); closeMap(); }
  });

  const mapOverlay = document.getElementById('mapOverlay');
  function openMap() { mapOverlay.classList.add('open'); document.getElementById('mapClose').focus(); }
  function closeMap() { mapOverlay.classList.remove('open'); }
  document.getElementById('mapOpen').addEventListener('click', openMap);
  document.getElementById('mapClose').addEventListener('click', closeMap);
  mapOverlay.addEventListener('click', e => { if (e.target === mapOverlay) closeMap(); });

  const signupModal = document.getElementById('signupModal');
  document.getElementById('openSignup').addEventListener('click', () => {
    signupModal.classList.add('open');
    document.getElementById('sName').focus();
  });
  function closeSignup() { signupModal.classList.remove('open'); }
  document.getElementById('signupClose').addEventListener('click', closeSignup);
  document.getElementById('signupForm').addEventListener('submit', function (e) {
    e.preventDefault();
    this.innerHTML = '<h3 class="title-lg" style="font-size:1.4rem;">Ďakujeme! 🌲</h3><p>Ozveme sa ti čo najskôr. Uvidíme sa v lese.</p><button type="button" class="mapclose" id="signupClose2">Zavrieť</button>';
    document.getElementById('signupClose2').addEventListener('click', closeSignup);
  });
  signupModal.addEventListener('click', e => { if (e.target === signupModal) closeSignup(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMap(); closeSignup(); } });
});
