import * as THREE from './vendor/three.module.js';

const pointKey = (p) => `${p[0]},${p[1]}`;
const hasPoint = (list, p) => list.some((q) => q[0] === p[0] && q[1] === p[1]);

export class MoonScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-6, 6, 5, -5, 0.1, 70);
    this.camera.position.set(0, 13, 10);
    this.camera.lookAt(0, 0, 0);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.domElement.setAttribute('aria-label', 'Moonlight Garden board with flower boxes, moonlit pedestals, pressure plates, and a small gardener');
    this.renderer.domElement.setAttribute('role', 'img');
    container.appendChild(this.renderer.domElement);
    this.scene.add(new THREE.HemisphereLight(0xcbded2, 0x243a37, 2.8));
    const key = new THREE.DirectionalLight(0xf5ecd0, 4.2);
    key.position.set(-6, 11, -3); key.castShadow = true;
    Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 0.5, far: 30 });
    key.shadow.mapSize.set(1024, 1024); key.shadow.normalBias = 0.025; key.shadow.bias = -0.0004;
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x80b8bf, 1.3); rim.position.set(5, 5, 6); this.scene.add(rim);
    this.materials = new Map();
    this.board = null; this.level = null; this.state = null; this.player = null;
    this.planters = []; this.doors = []; this.goals = []; this.plates = [];
    this.frame = 0; this.frameTimes = []; this.lastTime = performance.now();
    this.reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resizeObserver = new ResizeObserver(() => this.resize()); this.resizeObserver.observe(container);
    this.renderLoop = this.renderLoop.bind(this); this.raf = requestAnimationFrame(this.renderLoop);
  }
  material(color, extra = {}) {
    const key = color + JSON.stringify(extra);
    if (!this.materials.has(key)) this.materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...extra }));
    return this.materials.get(key);
  }
  mesh(geometry, color, parent, position, extra = {}) {
    const item = new THREE.Mesh(geometry, this.material(color, extra));
    item.castShadow = true; item.receiveShadow = true;
    if (position) item.position.set(...position); parent.add(item); return item;
  }
  box(w, h, d, color, parent, position, extra) { return this.mesh(new THREE.BoxGeometry(w, h, d), color, parent, position, extra); }
  cylinder(r1, r2, h, color, parent, position, segments = 10, extra) { return this.mesh(new THREE.CylinderGeometry(r1, r2, h, segments), color, parent, position, extra); }
  sphere(r, color, parent, position, detail = 8) { return this.mesh(new THREE.SphereGeometry(r, detail, Math.max(4, detail / 2)), color, parent, position); }
  world(p) { return [p[0] - (this.level.width - 1) / 2, p[1] - (this.level.height - 1) / 2]; }
  ring(radius, tube, color, parent, height, extra = {}) { const ring = this.mesh(new THREE.TorusGeometry(radius, tube, 5, 28), color, parent, [0, height, 0], extra); ring.rotation.x = -Math.PI / 2; return ring; }
  plant(parent, x, z, scale = 1, color = '#b4ce9c') {
    const group = new THREE.Group(); group.position.set(x, 0, z); group.scale.setScalar(scale); parent.add(group);
    this.cylinder(0.015, 0.02, 0.23, '#769881', group, [0, 0.125, 0], 5);
    const leaf = this.sphere(0.075, '#88ac91', group, [-0.06, 0.14, 0]); leaf.scale.set(1, 0.4, 0.6); leaf.rotation.z = -0.4;
    const leaf2 = this.sphere(0.06, '#9fbd91', group, [0.05, 0.17, 0]); leaf2.scale.set(1, 0.4, 0.6);
    this.sphere(0.055, color, group, [0, 0.29, 0]); return group;
  }
  makePlanter(index) {
    const group = new THREE.Group();
    this.box(0.6, 0.33, 0.6, '#af7763', group, [0, 0.225, 0]);
    this.box(0.67, 0.08, 0.67, '#c78f74', group, [0, 0.405, 0]);
    this.box(0.53, 0.025, 0.53, '#495043', group, [0, 0.452, 0]);
    this.box(0.52, 0.027, 0.014, '#d5a17c', group, [0, 0.27, 0.306]);
    const leaves = new THREE.Group(); leaves.position.y = 0.44; group.add(leaves);
    this.plant(leaves, -0.14, 0.04, 1.25, '#dfd5a0');
    this.plant(leaves, 0.13, -0.09, 1.05, '#e8d9a2');
    this.plant(leaves, 0.09, 0.13, 0.75, '#d1d4a0');
    group.userData = { target: new THREE.Vector3(), leaves, index }; this.board.add(group); return group;
  }
  makePlayer() {
    const group = new THREE.Group();
    this.sphere(0.025, '#705f4f', group, [-0.13, 0.08, 0.03]).scale.set(2.5, 1.8, 4);
    this.sphere(0.025, '#705f4f', group, [0.13, 0.08, 0.03]).scale.set(2.5, 1.8, 4);
    this.cylinder(0.14, 0.2, 0.32, '#d8ded0', group, [0, 0.25, 0]);
    this.box(0.16, 0.23, 0.035, '#839b84', group, [0, 0.24, 0.15]);
    this.sphere(0.135, '#dfbc97', group, [0, 0.5, 0], 12);
    this.cylinder(0.15, 0.23, 0.05, '#c79063', group, [0, 0.595, 0], 16);
    this.cylinder(0.11, 0.155, 0.1, '#d1a373', group, [0, 0.66, 0], 12);
    this.cylinder(0.156, 0.158, 0.025, '#657c65', group, [0, 0.63, 0], 12);
    this.sphere(0.013, '#4c5147', group, [-0.047, 0.505, 0.123]);
    this.sphere(0.013, '#4c5147', group, [0.047, 0.505, 0.123]);
    this.cylinder(0.035, 0.045, 0.22, '#d7ddc9', group, [0.23, 0.27, 0]);
    this.cylinder(0.058, 0.055, 0.12, '#f0ce81', group, [0.26, 0.22, 0.05], 8, { emissive: '#e8b96f', emissiveIntensity: 0.7 });
    this.cylinder(0.07, 0.07, 0.025, '#6b795e', group, [0.26, 0.3, 0.05], 8);
    const lantern = new THREE.PointLight('#e8be79', 0.6, 1.6, 2); lantern.position.set(0.26, 0.3, 0.05); group.add(lantern);
    group.userData = { target: new THREE.Vector3(), angle: 0, targetAngle: 0 }; this.board.add(group); return group;
  }
  loadLevel(level, state) {
    if (this.board) { this.scene.remove(this.board); this.board.traverse((object) => object.geometry?.dispose()); }
    this.level = level; this.state = state; this.board = new THREE.Group(); this.scene.add(this.board);
    this.planters = []; this.doors = []; this.goals = []; this.plates = [];
    const { width, height } = level;
    this.box(width + 0.22, 0.35, height + 0.22, '#344740', this.board, [0, -0.25, 0]);
    this.box(width + 0.1, 0.12, height + 0.1, '#52645a', this.board, [0, -0.06, 0]);
    this.box(width + 0.46, 0.08, height + 0.46, '#203b3b', this.board, [0, -0.465, 0]);
    const wallKeys = new Set(level.walls.map(pointKey));
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const [wx, wz] = this.world([x, y]); const variation = ((x * 17 + y * 31) % 6);
      this.box(0.96, 0.06, 0.96, ['#65786a', '#607366', '#687c6f', '#637769', '#6c8070', '#667869'][variation], this.board, [wx, 0.03, wz]);
      if (wallKeys.has(`${x},${y}`)) {
        const wallHeight = y === height - 1 ? 0.26 : 0.42;
        this.box(0.95, wallHeight, 0.95, variation % 2 ? '#435d50' : '#3d554b', this.board, [wx, 0.06 + wallHeight / 2, wz]);
        this.box(0.98, 0.06, 0.98, '#5e7660', this.board, [wx, 0.08 + wallHeight, wz]);
        if ((x + y * 3) % 3 === 0) {
          const growth = new THREE.Group(); growth.position.set(wx - 0.2, wallHeight + 0.1, wz + 0.2); this.board.add(growth);
          this.plant(growth, 0, 0, 0.7, '#abb998');
        }
      }
    }
    level.goals.forEach((p) => {
      const target = new THREE.Group(); const [x, z] = this.world(p); target.position.set(x, 0, z); this.board.add(target);
      const disc = this.cylinder(0.365, 0.37, 0.018, '#8d916a', target, [0, 0.078, 0], 32, { emissive: '#dcc688', emissiveIntensity: 0.15 });
      const ring = this.ring(0.38, 0.018, '#e1d095', target, 0.097, { emissive: '#dfc579', emissiveIntensity: 0.4 });
      [0, 1, 2, 3].forEach((k) => { const marker = this.box(0.11, 0.018, 0.035, '#e9d89b', target, [Math.sin(k * Math.PI / 2) * 0.28, 0.091, Math.cos(k * Math.PI / 2) * 0.28]); marker.rotation.y = k * Math.PI / 2; });
      this.goals.push({ group: target, disc, ring, point: p });
    });
    level.plates.forEach((p) => {
      const target = new THREE.Group(); const [x, z] = this.world(p); target.position.set(x, 0, z); this.board.add(target);
      const hasGoal = hasPoint(level.goals, p);
      this.box(hasGoal ? 0.85 : 0.64, 0.02, hasGoal ? 0.85 : 0.64, '#42746b', target, [0, 0.075, 0]);
      const ring = this.ring(hasGoal ? 0.45 : 0.22, 0.015, '#a4ccaf', target, 0.095, { emissive: '#b2d7b1', emissiveIntensity: 0.25 });
      if (!hasGoal) this.box(0.18, 0.02, 0.18, '#b4cdb4', target, [0, 0.095, 0]);
      this.plates.push({ group: target, ring, point: p });
    });
    level.doors.forEach((p) => {
      const target = new THREE.Group(); const [x, z] = this.world(p); target.position.set(x, 0, z); this.board.add(target);
      this.box(0.87, 0.02, 0.82, '#7c8b70', target, [0, 0.08, 0]);
      for (let i = 0; i < 5; i++) this.box(0.09, 0.021, 0.75, '#a99d77', target, [-0.32 + i * 0.16, 0.10, 0]);
      [-0.38, 0.38].forEach((xx) => {
        this.box(0.09, 0.64, 0.09, '#859481', target, [xx, 0.4, 0]);
        this.sphere(0.07, '#dddaa3', target, [xx, 0.75, 0]);
      });
      target.rotation.y = Math.PI / 2;
      const bars = new THREE.Group(); target.add(bars);
      for (let i = -1; i <= 1; i++) this.box(0.036, 0.47, 0.035, '#dccb8f', bars, [i * 0.2, 0.375, 0], { emissive: '#d8c087', emissiveIntensity: 0.3 });
      this.box(0.69, 0.032, 0.04, '#c6bd87', bars, [0, 0.55, 0]);
      this.doors.push({ group: target, bars });
    });
    state.crates.forEach((_, index) => this.planters.push(this.makePlanter(index)));
    this.player = this.makePlayer();
    const rear = new THREE.Group(); rear.position.set(-width / 2 - 0.55, 0.02, -height / 2 + 0.1); this.board.add(rear);
    this.cylinder(0.18, 0.25, 0.15, '#475f52', rear, [0, 0, 0], 12);
    this.cylinder(0.035, 0.045, 1.1, '#849982', rear, [0, 0.6, 0], 8);
    this.cylinder(0.12, 0.13, 0.25, '#e3cd91', rear, [0, 1.21, 0], 8, { emissive: '#d9c28b', emissiveIntensity: 0.5 });
    this.cylinder(0.03, 0.19, 0.14, '#697f65', rear, [0, 1.42, 0], 8);
    this.update(state, null, true); this.resize();
  }
  update(state, previous, action = null) {
    const snap = action === true || action?.type === 'reset';
    this.state = state;
    const [px, pz] = this.world(state.player); this.player.userData.target.set(px, 0.065, pz);
    if (previous && (state.player[0] !== previous.player[0] || state.player[1] !== previous.player[1])) this.player.userData.targetAngle = Math.atan2(state.player[0] - previous.player[0], state.player[1] - previous.player[1]);
    if (snap || this.reducedMotion) this.player.position.copy(this.player.userData.target);
    state.crates.forEach((p, i) => { const [x, z] = this.world(p); this.planters[i].userData.target.set(x, 0, z); if (snap || this.reducedMotion) this.planters[i].position.copy(this.planters[i].userData.target); });
    this.goals.forEach((goal) => { const occupied = hasPoint(state.crates, goal.point); goal.ring.material = this.material(occupied ? '#edf0b9' : '#dccc96', { emissive: occupied ? '#d9dd8b' : '#dfc579', emissiveIntensity: occupied ? 0.85 : 0.3 }); });
    this.plates.forEach((plate) => { plate.ring.material = this.material(hasPoint(state.crates, plate.point) ? '#d9edbd' : '#94c4b1', { emissive: '#a2cdb0', emissiveIntensity: hasPoint(state.crates, plate.point) ? 0.6 : 0.2 }); });
  }
  resize() {
    const width = this.container.clientWidth; const height = this.container.clientHeight;
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    const aspect = width / height;
    const half = Math.max((this.level?.height || 7) * 0.42 + 0.65, ((this.level?.width || 8) + 2.0) / aspect / 2);
    this.camera.left = -half * aspect; this.camera.right = half * aspect; this.camera.top = half; this.camera.bottom = -half;
    this.camera.updateProjectionMatrix();
  }
  renderLoop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.1); this.lastTime = time;
    this.frameTimes.push(dt * 1000); if (this.frameTimes.length > 900) this.frameTimes.shift();
    if (this.player) {
      const alpha = this.reducedMotion ? 1 : 1 - Math.exp(-dt * 21);
      this.player.position.lerp(this.player.userData.target, alpha);
      let delta = this.player.userData.targetAngle - this.player.rotation.y; delta = Math.atan2(Math.sin(delta), Math.cos(delta)); this.player.rotation.y += delta * alpha;
      this.planters.forEach((planter) => { planter.position.lerp(planter.userData.target, alpha); if (!this.reducedMotion) planter.userData.leaves.rotation.z = Math.sin(time * 0.0015 + planter.userData.index) * 0.015; });
      this.doors.forEach(({ bars }) => { bars.scale.y = THREE.MathUtils.lerp(bars.scale.y, this.state.doorsOpen ? 0.045 : 1, alpha); });
    }
    this.renderer.render(this.scene, this.camera); this.frame++; this.raf = requestAnimationFrame(this.renderLoop);
  }
  project(point) { const [x, z] = this.world(point); const vector = new THREE.Vector3(x, 0.15, z).project(this.camera); const rect = this.container.getBoundingClientRect(); return { x: rect.left + (vector.x + 1) * rect.width / 2, y: rect.top + (1 - vector.y) * rect.height / 2, visible: Math.abs(vector.x) <= 1 && Math.abs(vector.y) <= 1 }; }
  diagnostics() { const times = [...this.frameTimes].sort((a, b) => a - b); return { renderer: 'Three.js 0.184.0', frame: this.frame, drawCalls: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles, viewport: { width: this.container.clientWidth, height: this.container.clientHeight, pixelRatio: this.renderer.getPixelRatio() }, frameTimes: { samples: times.length, median: times[Math.floor(times.length * 0.5)] ?? null, p95: times[Math.floor(times.length * 0.95)] ?? null }, playerProjection: this.state ? this.project(this.state.player) : null }; }
  dispose() { cancelAnimationFrame(this.raf); this.resizeObserver.disconnect(); this.scene.traverse((object) => object.geometry?.dispose()); this.materials.forEach((material) => material.dispose()); this.renderer.dispose(); this.renderer.domElement.remove(); }
}
