// DeepSleep Hub - 3D Neural Visualization
// DEBUG MODE: Console logs every step

console.log('🧠 Brain.js loading...');

// Global variables
let scene, camera, renderer, controls, composer;
let brainGroup, thoughtNodes = [];
let raycaster, mouse;
let isInitialized = false;

// AI Color Configuration
const AI_CONFIG = {
  openai: { color: 0xffffff, name: 'ChatGPT', lobe: 'frontal' },
  claude: { color: 0xf97316, name: 'Claude', lobe: 'temporal' },
  gemini: { color: 0xa855f7, name: 'Gemini', lobe: 'occipital' },
  kimi: { color: 0xef4444, name: 'Kimi', lobe: 'cerebellum' },
  codex: { color: 0x3b82f6, name: 'Codex', lobe: 'parietal' },
  deepseek: { color: 0x4f46e5, name: 'DeepSeek', lobe: 'limbic' },
  deepsleep: { color: 0xfbbf24, name: 'DeepSleep', lobe: 'core', special: 'dream' },
  deepsleep_beta: { color: 0xfbbf24, name: 'DeepSleep Beta', lobe: 'core', special: 'dream' }
};

// Initialize Three.js Scene
function init() {
  console.log('Initializing Three.js...');
  
  try {
    // 1. Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.015);
    console.log('✅ Scene created');
    
    // 2. Camera
    camera = new THREE.PerspectiveCamera(
      60, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 20, 50);
    console.log('✅ Camera positioned');
    
    // 3. Renderer with error handling
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) {
      throw new Error('Canvas container not found!');
    }
    
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050508, 1);
    canvasContainer.appendChild(renderer.domElement);
    console.log('✅ Renderer attached to DOM');
    
    // 4. Controls (Zoom/Pan/Rotate)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 150;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    console.log('✅ Controls initialized');
    
    // 5. Post-processing (Bloom effect)
    const renderScene = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,  // strength
      0.4,  // radius
      0.85  // threshold
    );
    bloomPass.strength = 1.2;
    
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    console.log('✅ Post-processing ready');
    
    // 6. Lighting (CRITICAL - without lights, objects are black!)
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xfbbf24, 1, 100);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
    console.log('✅ Lighting added');
    
    // 7. Create the Brain Group
    brainGroup = new THREE.Group();
    scene.add(brainGroup);
    console.log('✅ Brain group created');
    
    // 8. Create biological brain shape
    createBiologicalBrain();
    console.log('✅ Brain geometry created');
    
    // 9. Raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    window.addEventListener('click', onMouseClick);
    window.addEventListener('mousemove', onMouseMove);
    console.log('✅ Interaction handlers set');
    
    // 10. Handle resize
    window.addEventListener('resize', onWindowResize);
    
    // Hide loading screen
    document.getElementById('loading').style.display = 'none';
    
    isInitialized = true;
    console.log('🚀 Brain initialization complete!');
    
    // Start animation loop
    animate();
    
    // Add initial demo nodes
    setTimeout(() => {
      addDemoNodes();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    document.getElementById('loading').innerHTML = 
      `<span style="color: #ef4444;">Error: ${error.message}<br>Check console for details</span>`;
  }
}

// Create biological brain with gyri and sulci
function createBiologicalBrain() {
  console.log('Creating brain lobes...');
  
  // Create 5 main lobes as deformed spheres
  const lobeConfigs = [
    { name: 'frontal', color: 0x333333, pos: [0, 8, 12], scale: 1.2, ai: 'openai' },
    { name: 'parietal', color: 0x2a2a35, pos: [0, 12, -2], scale: 1.0, ai: 'codex' },
    { name: 'temporal', color: 0x352a2a, pos: [8, 4, 2], scale: 0.9, ai: 'claude' },
    { name: 'temporal_l', color: 0x352a2a, pos: [-8, 4, 2], scale: 0.9, ai: 'claude' },
    { name: 'occipital', color: 0x2e2a35, pos: [0, 6, -12], scale: 0.8, ai: 'gemini' },
    { name: 'cerebellum', color: 0x352a2a, pos: [0, -6, -8], scale: 0.7, ai: 'kimi' }
  ];
  
  lobeConfigs.forEach(config => {
    // Create sphere with noise displacement for brain folds
    const geometry = new THREE.SphereGeometry(10, 64, 64);
    const posAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    // Add noise for gyri/sulci (brain folds)
    for (let i = 0; i < posAttribute.count; i++) {
      vertex.fromBufferAttribute(posAttribute, i);
      
      // Multiple octaves of noise for realistic folds
      const noise1 = Math.sin(vertex.x * 0.8) * Math.cos(vertex.y * 0.8) * Math.sin(vertex.z * 0.8);
      const noise2 = Math.sin(vertex.x * 2.0) * Math.cos(vertex.y * 2.0) * 0.3;
      const displacement = 1 + (noise1 * 0.4) + (noise2 * 0.15);
      
      vertex.multiplyScalar(displacement);
      posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    
    geometry.computeVertexNormals();
    
    // Material - dark base with emissive glow matching AI color
    const material = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      emissive: config.color,
      emissiveIntensity: 0.1,
      roughness: 0.6,
      metalness: 0.4,
      flatShading: false
    });
    
    const lobe = new THREE.Mesh(geometry, material);
    lobe.position.set(...config.pos);
    lobe.scale.setScalar(config.scale);
    lobe.userData = { 
      type: 'lobe', 
      name: config.name,
      ai: config.ai 
    };
    
    // Add glow halo
    const haloGeo = new THREE.SphereGeometry(12, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: AI_CONFIG[config.ai]?.color || 0xffffff,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    lobe.add(halo);
    
    brainGroup.add(lobe);
    console.log(`  ✅ ${config.name} lobe created`);
  });
}

// Add a thought node (ink splat effect)
function createThoughtNode(ai, text, concept) {
  if (!isInitialized) {
    console.warn('Brain not initialized yet');
    return;
  }
  
  console.log(`Creating thought node for ${ai}: ${concept}`);
  
  const config = AI_CONFIG[ai] || AI_CONFIG.openai;
  const color = config.color;
  
  // Position near the corresponding lobe
  const lobeMap = {
    'frontal': [0, 8, 12],
    'temporal': [8, 4, 2],
    'occipital': [0, 6, -12],
    'cerebellum': [0, -6, -8],
    'parietal': [0, 12, -2],
    'core': [0, 0, 0]
  };
  
  const basePos = lobeMap[config.lobe] || [0, 0, 0];
  const position = new THREE.Vector3(
    basePos[0] + (Math.random() - 0.5) * 20,
    basePos[1] + (Math.random() - 0.5) * 20,
    basePos[2] + (Math.random() - 0.5) * 20
  );
  
  // Create geometry based on AI type
  let geometry;
  if (config.special === 'dream') {
    // Icosahedron for DeepSleep (crystal shape)
    geometry = new THREE.IcosahedronGeometry(0.8, 0);
  } else {
    // Sphere for regular AIs
    geometry = new THREE.SphereGeometry(0.5, 32, 32);
  }
  
  const material = new THREE.MeshStandardMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.9,
    roughness: 0.2,
    metalness: 0.8
  });
  
  const node = new THREE.Mesh(geometry, material);
  node.position.copy(position);
  node.userData = {
    type: 'thought',
    ai: ai,
    text: text,
    concept: concept,
    timestamp: Date.now(),
    originalScale: 1
  };
  
  // Ink splat animation (particles exploding from center)
  createInkSplat(position, color);
  
  // Add to scene
  brainGroup.add(node);
  thoughtNodes.push(node);
  
  // Animate entrance
  node.scale.set(0, 0, 0);
  gsapAnimation(node.scale, { x: 1, y: 1, z: 1 }, 0.6, "back.out");
  
  // Add to UI
  addThoughtToUI(ai, concept || text.substring(0, 30), color);
  
  // Update pressure
  updateNeuralPressure();
  
  // Limit nodes (2KB simulation)
  if (thoughtNodes.length > 50) {
    removeOldestNode();
  }
  
  return node;
}

// Ink splat particle effect
function createInkSplat(position, color) {
  const particleCount = 30;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;
    
    velocities.push({
      x: (Math.random() - 0.5) * 0.8,
      y: (Math.random() - 0.5) * 0.8,
      z: (Math.random() - 0.5) * 0.8
    });
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const material = new THREE.PointsMaterial({
    color: color,
    size: 0.8,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending
  });
  
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  
  // Animate explosion
  let frame = 0;
  function animateSplat() {
    frame++;
    const pos = particles.geometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;
      pos[i * 3 + 2] += velocities[i].z;
    }
    
    particles.geometry.attributes.position.needsUpdate = true;
    material.opacity -= 0.02;
    
    if (material.opacity > 0 && frame < 60) {
      requestAnimationFrame(animateSplat);
    } else {
      scene.remove(particles);
      geometry.dispose();
      material.dispose();
    }
  }
  
  animateSplat();
}

// UI Updates
function addThoughtToUI(ai, concept, color) {
  const container = document.getElementById('thoughts-list');
  const div = document.createElement('div');
  div.className = 'thought';
  div.style.borderLeftColor = '#' + color.toString(16).padStart(6, '0');
  
  const aiName = AI_CONFIG[ai]?.name || ai;
  div.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 4px;">
      <span class="ai-orb" style="background: #${color.toString(16).padStart(6, '0')};"></span>
      <span style="font-size: 10px; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px;">${aiName}</span>
    </div>
    <div style="font-weight: 500;">${concept}</div>
  `;
  
  container.insertBefore(div, container.firstChild);
  
  // Keep only last 10
  while (container.children.length > 10) {
    container.removeChild(container.lastChild);
  }
}

function updateNeuralPressure() {
  const count = thoughtNodes.length;
  const maxNodes = 50;
  const percent = Math.min((count / maxNodes) * 100, 100);
  
  document.getElementById('node-count').textContent = count;
  document.getElementById('pressure-text').textContent = Math.floor(percent) + '%';
  document.getElementById('pressure-bar').style.width = percent + '%';
  
  // Visual warning
  if (percent > 80) {
    document.getElementById('pressure-bar').style.background = '#ef4444';
  } else if (percent > 50) {
    document.getElementById('pressure-bar').style.background = '#f59e0b';
  } else {
    document.getElementById('pressure-bar').style.background = '#10b981';
  }
}

function removeOldestNode() {
  const old = thoughtNodes.shift();
  if (old) {
    // Explosion effect
    createInkSplat(old.position, 0xff0000);
    
    // Remove from scene
    brainGroup.remove(old);
    old.geometry.dispose();
    old.material.dispose();
  }
}

// Mouse interaction
function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Highlight hovered nodes
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(thoughtNodes);
  
  thoughtNodes.forEach(node => {
    if (intersects.length > 0 && intersects[0].object === node) {
      node.material.emissiveIntensity = 1.5;
      document.body.style.cursor = 'pointer';
    } else {
      node.material.emissiveIntensity = 0.8;
    }
  });
  
  if (intersects.length === 0) {
    document.body.style.cursor = 'default';
  }
}

function onMouseClick(event) {
  if (!isInitialized) return;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(thoughtNodes);
  
  if (intersects.length > 0) {
    const node = intersects[0].object;
    console.log('Clicked node:', node.userData);
    
    // Zoom to node
    const targetPos = node.position.clone();
    
    gsapAnimation(camera.position, {
      x: targetPos.x + 20,
      y: targetPos.y + 20,
      z: targetPos.z + 20
    }, 1, "power2.out");
    
    gsapAnimation(controls.target, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z
    }, 1, "power2.out");
    
    alert(`Concept: ${node.userData.concept}\nAI: ${node.userData.ai}\nText: ${node.userData.text.substring(0, 100)}...`);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  if (!isInitialized) return;
  
  controls.update();
  
  if (brainGroup) {
    brainGroup.rotation.y += 0.001;
  }
  
  const time = Date.now() * 0.001;
  thoughtNodes.forEach((node, i) => {
    node.position.y += Math.sin(time + i) * 0.01;
    node.rotation.y += 0.01;
  });
  
  composer.render();
}

function gsapAnimation(target, props, duration, ease) {
  const start = {};
  const change = {};
  const startTime = performance.now();
  
  for (let key in props) {
    start[key] = target[key];
    change[key] = props[key] - target[key];
  }
  
  function update(currentTime) {
    const elapsed = (currentTime - startTime) / 1000;
    const t = Math.min(elapsed / duration, 1);
    
    const easeT = ease === "back.out" ? 
      (t < 1 ? 1 - Math.pow(1 - t, 3) : 1) : 
      (t < 1 ? t * (2 - t) : 1);
    
    for (let key in props) {
      target[key] = start[key] + change[key] * easeT;
    }
    
    if (t < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}

function addDemoNodes() {
  console.log('Adding demo nodes...');
  createThoughtNode('openai', 'RAG is better than long context for precise retrieval', 'RAG-vs-context');
  setTimeout(() => createThoughtNode('claude', 'LLMs can be viewed as compilers for natural language', 'llm-as-compiler'), 1000);
  setTimeout(() => createThoughtNode('gemini', 'Obsidian markdown workflows enable Zettelkasten', 'obsidian-markdown'), 2000);
  setTimeout(() => createThoughtNode('kimi', 'Vector database search requires embedding optimization', 'vector-db-search'), 3000);
  setTimeout(() => createThoughtNode('deepsleep', 'Consolidating memories during idle time', 'dream-consolidation'), 4000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'NEW_THOUGHT' && isInitialized) {
        // Use provided concept logic or fallback
        const conceptStr = request.concepts ? request.concepts.map(c=>c.name).join(', ') : request.text.substring(0,20);
        createThoughtNode(request.ai, request.text, conceptStr);
        sendResponse({success: true});
      }
    });
}
window._handleExtMsg = (request) => {
    if (request.type === 'NEW_THOUGHT' && isInitialized) {
        const conceptStr = request.concepts ? request.concepts.map(c=>c.name).join(', ') : request.text.substring(0,20);
        createThoughtNode(request.ai, request.text, conceptStr);
    }
};
