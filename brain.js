// DeepSleep Hub - 3D Neural Visualization

// Global variables
let scene, camera, renderer, controls, composer;
let brainGroup, thoughtNodes = [], edges = [];
let raycaster, mouse;
let isInitialized = false;
let labelsContainer;

// AI Color Configuration
const AI_CONFIG = {
  openai: { color: 0xffffff, name: 'ChatGPT' },
  claude: { color: 0xf97316, name: 'Claude' },
  gemini: { color: 0xa855f7, name: 'Gemini' },
  kimi: { color: 0xef4444, name: 'Kimi' },
  codex: { color: 0x3b82f6, name: 'Codex' },
  deepsleep: { color: 0xfbbf24, name: 'DeepSleep' }
};

// State
let coreNode = null;
let currentPressure = 0;

function init() {
  try {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.005);
    
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1500);
    camera.position.set(0, 30, 90);
    
    const canvasContainer = document.getElementById('canvas-container');
    labelsContainer = document.getElementById('labels-container');
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 300;
    
    // Post-processing
    const renderScene = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85
    );
    bloomPass.strength = 1.2;
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    
    // Lighting
    scene.add(new THREE.AmbientLight(0x404040, 2));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);
    
    brainGroup = new THREE.Group();
    scene.add(brainGroup);
    
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    window.addEventListener('click', onMouseClick);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);
    
    document.getElementById('loading').style.display = 'none';
    isInitialized = true;
    
    // Create central core node
    createCoreNode();
    
    animate();
    
    setTimeout(() => { addDemoNodes(); }, 1000);
  } catch (error) {
    console.error('Initialization failed:', error);
  }
}

function createCoreNode() {
  const geo = new THREE.SphereGeometry(3, 32, 32);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xfbbf24,
    emissiveIntensity: 1.5,
    roughness: 0.2
  });
  coreNode = new THREE.Mesh(geo, mat);
  coreNode.position.set(0, 0, 0);
  
  // Core aura
  const auraGeo = new THREE.SphereGeometry(4.5, 32, 32);
  const auraMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending });
  const aura = new THREE.Mesh(auraGeo, auraMat);
  coreNode.add(aura);
  
  brainGroup.add(coreNode);
}

function createThoughtNode(ai, text, concept) {
  if (!isInitialized) return;
  
  const config = AI_CONFIG[ai] || AI_CONFIG.openai;
  
  // Random 3D spherical coordinate projection for true 3D spatial graph
  const radius = 15 + Math.random() * 30;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);
  
  const position = new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi)
  );

  const geometry = new THREE.SphereGeometry(0.8 + Math.random()*0.5, 32, 32);
  const material = new THREE.MeshStandardMaterial({
    color: config.color,
    emissive: config.color,
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.9
  });
  
  const node = new THREE.Mesh(geometry, material);
  node.position.copy(position);
  node.userData = {
    type: 'thought', ai: ai, text: text, concept: concept
  };
  
  // Create HTML Label
  const label = document.createElement('div');
  label.className = 'node-label';
  label.style.position = 'absolute';
  label.style.color = '#' + config.color.toString(16).padStart(6, '0');
  label.style.fontSize = '12px';
  label.style.fontFamily = 'Inter, sans-serif';
  label.style.fontWeight = '600';
  label.style.textShadow = '0 0 4px #000';
  label.style.pointerEvents = 'none';
  label.style.whiteSpace = 'nowrap';
  label.innerText = concept || ai;
  labelsContainer.appendChild(label);
  node.userData.label = label;
  
  // Connect to Core or another random node (Neuronal Edges)
  const targetNode = thoughtNodes.length > 0 && Math.random() > 0.3 
      ? thoughtNodes[Math.floor(Math.random() * thoughtNodes.length)] 
      : coreNode;
      
  createEdge(node, targetNode, config.color);
  
  createInkSplat(position, config.color);
  
  brainGroup.add(node);
  thoughtNodes.push(node);
  
  node.scale.set(0.01, 0.01, 0.01);
  gsapAnimation(node.scale, { x: 1, y: 1, z: 1 }, 1.0, "back.out");
  
  addThoughtToUI(ai, concept || text.substring(0, 30), config.color);
  updateNeuralPressure();
  
  if (thoughtNodes.length > 60) removeOldestNode();
  
  return node;
}

function createEdge(nodeA, nodeB, color) {
  const material = new THREE.LineBasicMaterial({
     color: color, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending
  });
  const geometry = new THREE.BufferGeometry().setFromPoints([nodeA.position, nodeB.position]);
  const line = new THREE.Line(geometry, material);
  
  brainGroup.add(line);
  edges.push({ line, nodeA, nodeB });
}

function createInkSplat(position, color) {
  const particleCount = 20;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  
  for (let i = 0; i < particleCount; i++) {
    positions[i*3] = position.x;
    positions[i*3+1] = position.y;
    positions[i*3+2] = position.z;
    velocities.push({ x: (Math.random()-0.5)*1.5, y: (Math.random()-0.5)*1.5, z: (Math.random()-0.5)*1.5 });
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: color, size: 0.5, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  
  let frame = 0;
  function animateSplat() {
    frame++;
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i*3] += velocities[i].x; pos[i*3+1] += velocities[i].y; pos[i*3+2] += velocities[i].z;
    }
    particles.geometry.attributes.position.needsUpdate = true;
    material.opacity -= 0.02;
    if (material.opacity > 0 && frame < 50) requestAnimationFrame(animateSplat);
    else { scene.remove(particles); geometry.dispose(); material.dispose(); }
  }
  animateSplat();
}

function addThoughtToUI(ai, concept, color) {
  const container = document.getElementById('thoughts-list');
  const div = document.createElement('div');
  div.className = 'thought';
  div.style.borderLeftColor = '#' + color.toString(16).padStart(6, '0');
  div.innerHTML = `<div class="thought-ai">${AI_CONFIG[ai]?.name || ai}</div><div class="thought-text">${concept}</div>`;
  container.insertBefore(div, container.firstChild);
  if (container.children.length > 8) container.removeChild(container.lastChild);
}

function updateNeuralPressure() {
  const percent = Math.min((thoughtNodes.length / 60) * 100, 100);
  document.getElementById('node-count').textContent = thoughtNodes.length;
  document.getElementById('pressure-text').textContent = Math.floor(percent) + '%';
  document.getElementById('pressure-bar').style.width = percent + '%';
}

function removeOldestNode() {
  const old = thoughtNodes.shift();
  if (old) {
    if (old.userData.label) old.userData.label.remove();
    createInkSplat(old.position, 0xff0000);
    brainGroup.remove(old);
    
    // Clean up connected edges
    for (let i = edges.length - 1; i >= 0; i--) {
      if (edges[i].nodeA === old || edges[i].nodeB === old) {
         brainGroup.remove(edges[i].line);
         edges.splice(i, 1);
      }
    }
    old.geometry.dispose(); old.material.dispose();
  }
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(thoughtNodes);
  
  thoughtNodes.forEach(node => {
    node.material.emissiveIntensity = 1.0;
    if (node.userData.label) node.userData.label.style.transform = "scale(1)";
  });
  
  if (intersects.length > 0) {
    document.body.style.cursor = 'pointer';
    intersects[0].object.material.emissiveIntensity = 2.5;
    if (intersects[0].object.userData.label) {
        intersects[0].object.userData.label.style.transform = "scale(1.5)";
        intersects[0].object.userData.label.style.zIndex = "999";
    }
  } else {
    document.body.style.cursor = 'default';
  }
}

function onMouseClick(event) {
  if (!isInitialized) return;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(thoughtNodes);
  
  if (intersects.length > 0) {
    const node = intersects[0].object;
    alert(`Concept: ${node.userData.concept}\nAI: ${node.userData.ai}\nText: ${node.userData.text}`);
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

const tempV = new THREE.Vector3();

// Loop
function animate() {
  requestAnimationFrame(animate);
  if (!isInitialized) return;
  
  controls.update();
  
  if (brainGroup) {
      // Gentle structure rotation
      brainGroup.rotation.y += 0.0005;
      brainGroup.rotation.z += 0.0002;
  }
  
  const time = Date.now() * 0.001;
  thoughtNodes.forEach((node, i) => {
    node.position.y += Math.sin(time * 2 + i) * 0.02;
    
    // Project 3D vector to 2D screen coordinates for text labels
    if (node.userData.label) {
        tempV.copy(node.position);
        node.localToWorld(tempV);
        tempV.project(camera);
        
        // Hide if behind camera
        if (tempV.z > 1) {
            node.userData.label.style.display = 'none';
        } else {
            node.userData.label.style.display = 'block';
            const x = (tempV.x *  .5 + .5) * window.innerWidth;
            const y = (tempV.y * -.5 + .5) * window.innerHeight;
            
            node.userData.label.style.transform = `translate(-50%, -50%) translate(${x}px,${y - 15}px)`;
            
            // Fade out labels if zoomed too far away (opacity curve)
            const dist = camera.position.distanceTo(node.position);
            node.userData.label.style.opacity = Math.max(0, 1 - (dist / 150));
        }
    }
  });
  
  // Update edges geometry endpoints
  edges.forEach(edge => {
     const positions = edge.line.geometry.attributes.position.array;
     positions[0] = edge.nodeA.position.x; positions[1] = edge.nodeA.position.y; positions[2] = edge.nodeA.position.z;
     positions[3] = edge.nodeB.position.x; positions[4] = edge.nodeB.position.y; positions[5] = edge.nodeB.position.z;
     edge.line.geometry.attributes.position.needsUpdate = true;
  });
  
  composer.render();
}

function gsapAnimation(target, props, duration, ease) {
  const start = {}; const change = {}; const startTime = performance.now();
  for (let key in props) { start[key] = target[key]; change[key] = props[key] - target[key]; }
  
  function update(currentTime) {
    const elapsed = (currentTime - startTime) / 1000;
    const t = Math.min(elapsed / duration, 1);
    const easeT = ease === "back.out" ? (t < 1 ? 1 - Math.pow(1 - t, 3) : 1) : (t < 1 ? t * (2 - t) : 1);
    for (let key in props) target[key] = start[key] + change[key] * easeT;
    if (t < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function addDemoNodes() {
  createThoughtNode('openai', 'RAG is better than long context for precise retrieval', 'RAG Vectors');
  setTimeout(() => createThoughtNode('claude', 'LLMs can be viewed as compilers for natural language', 'LLM Compiler'), 500);
  setTimeout(() => createThoughtNode('gemini', 'Obsidian markdown workflows enable Zettelkasten', 'Knowledge Graphs'), 1000);
  setTimeout(() => createThoughtNode('kimi', 'Vector database search requires embedding optimization', 'Embedding Logic'), 1500);
  setTimeout(() => createThoughtNode('deepsleep', 'Consolidating memories during idle time', 'Dream Consolidation'), 2000);
  setTimeout(() => createThoughtNode('claude', 'System prompt architecture bounds recursive alignment', 'Alignment Boundaries'), 2500);
  setTimeout(() => createThoughtNode('openai', 'Speculative decoding reduces TTFT in production', 'Token Metrics'), 3000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'NEW_THOUGHT' && isInitialized) {
        const conceptStr = request.concepts ? request.concepts.map(c=>c.name).join(', ') : request.text.substring(0,20);
        createThoughtNode(request.ai, request.text, conceptStr);
        sendResponse({success: true});
      }
    });
}
window._handleExtMsg = (request) => {
    if (request.type === 'NEW_THOUGHT' && isInitialized) {
        const conceptStr = request.concepts && request.concepts.length ? request.concepts.map(c=>c.name).join(', ') : request.text.substring(0,20);
        createThoughtNode(request.ai, request.text, conceptStr);
    }
};
