// DeepSleep Hub - 3D Neural Visualization

console.log('🧠 Brain.js loading...');

// Global variables
let scene, camera, renderer, controls, composer;
let brainGroup, thoughtNodes = [], edges = [];
let raycaster, mouse;
let isInitialized = false;
let labelsContainer;
let nodeInjectMem = {};

// Lobe storage
const logicalLobes = {};

// AI Color Configuration
const AI_CONFIG = {
  openai: { color: 0xffffff, name: 'ChatGPT' },
  claude: { color: 0xf97316, name: 'Claude' },
  gemini: { color: 0xa855f7, name: 'Gemini' },
  kimi: { color: 0xef4444, name: 'Kimi' },
  codex: { color: 0x3b82f6, name: 'Codex' },
  deepsleep: { color: 0xfbbf24, name: 'DeepSleep', special: 'dream' }
};

function init() {
  console.log('Initializing Three.js...');

  try {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);
    scene.fog = new THREE.FogExp2(0x050508, 0.008);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 80);

    const canvasContainer = document.getElementById('canvas-container');
    labelsContainer = document.getElementById('labels-container');
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050508, 1);
    canvasContainer.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 200;
    controls.enablePan = true; // Allow moving the brain left/right/up/down
    controls.panSpeed = 1.0;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5; // Spins slowly by itself but stops when you grab it!

    const renderScene = new THREE.RenderPass(scene, camera);
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.strength = 1.2;

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    scene.add(new THREE.AmbientLight(0x404040, 2));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // 1. CREATE BIOLOGICAL MESH LOBES
    createBiologicalBrain();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    window.addEventListener('click', onMouseClick);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onWindowResize);

    document.getElementById('loading').style.display = 'none';
    isInitialized = true;
    console.log('🚀 Brain initialization complete!');

    animate();

    setTimeout(() => { addDemoNodes(); }, 1000);

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    document.getElementById('loading').innerHTML = `<span style="color: #ef4444;">Error: ${error.message}</span>`;
  }
}

function createBiologicalBrain() {
  const lobeConfigs = [
    { name: 'frontal', color: 0xffffff, pos: [0, 8, 14], scale: 1.8, ai: 'openai' },
    { name: 'parietal', color: 0x3b82f6, pos: [0, 14, -4], scale: 1.6, ai: 'codex' },
    { name: 'temporal_right', color: 0xf97316, pos: [12, 2, 2], scale: 1.4, ai: 'claude' },
    { name: 'temporal_left', color: 0xf97316, pos: [-12, 2, 2], scale: 1.4, ai: 'claude' },
    { name: 'occipital', color: 0xa855f7, pos: [0, 4, -15], scale: 1.3, ai: 'gemini' },
    { name: 'cerebellum', color: 0xef4444, pos: [0, -8, -10], scale: 1.1, ai: 'kimi' },
    { name: 'core', color: 0xfbbf24, pos: [0, -1, -2], scale: 1.0, ai: 'deepsleep' }
  ];
  
  lobeConfigs.forEach(config => {
    // We use a base radius of 8 to pack them closely
    const geometry = new THREE.SphereGeometry(8, 64, 64);
    const posAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < posAttribute.count; i++) {
        vertex.fromBufferAttribute(posAttribute, i);
        const noise1 = Math.sin(vertex.x * 0.8) * Math.cos(vertex.y * 0.8) * Math.sin(vertex.z * 0.8);
        const noise2 = Math.sin(vertex.x * 2.0) * Math.cos(vertex.y * 2.0) * 0.3;
        vertex.multiplyScalar(1 + (noise1 * 0.4) + (noise2 * 0.15));
        posAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    geometry.computeVertexNormals();
    
    const material = new THREE.MeshStandardMaterial({
      color: config.color, emissive: config.color, emissiveIntensity: 0.3, roughness: 0.3, metalness: 0.7, transparent: true, opacity: 0.65
    });
    
    const lobe = new THREE.Mesh(geometry, material);
    lobe.position.set(...config.pos);
    lobe.scale.setScalar(config.scale);
    lobe.userData = { isLobe: true, ai: config.ai, name: config.name };
    
    // Macro Label
    if (labelsContainer) {
       const mLabel = document.createElement('div');
       mLabel.className = 'macro-label';
       mLabel.style.position = 'absolute';
       mLabel.style.color = '#' + config.color.toString(16).padStart(6, '0');
       mLabel.style.fontSize = '16px';
       mLabel.style.fontFamily = 'Inter, sans-serif';
       mLabel.style.fontWeight = '800';
       mLabel.style.textTransform = 'uppercase';
       mLabel.style.letterSpacing = '1px';
       mLabel.style.textShadow = '0 4px 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,1)';
       mLabel.style.pointerEvents = 'none';
       mLabel.style.whiteSpace = 'nowrap';
       mLabel.style.transition = 'opacity 0.3s ease';
       mLabel.innerText = config.ai + ' Cluster';
       labelsContainer.appendChild(mLabel);
       lobe.userData.macroLabel = mLabel;
    }

    brainGroup.add(lobe);
    logicalLobes[config.name] = lobe;
    // Map AI to logical lobe (handle multiple lobes for the same AI, like temporal left/right)
    if (!logicalLobes[config.ai]) {
        logicalLobes[config.ai] = [lobe];
    } else {
        logicalLobes[config.ai].push(lobe);
    }
  });
}

function createThoughtNode(ai, text, concept) {
  if (!isInitialized) return;

  const config = AI_CONFIG[ai] || AI_CONFIG.openai;
  
  // Get corresponding lobe instances for this AI
  const lobeSubArr = logicalLobes[ai] || logicalLobes['openai'];
  // If multiple lobes match (like temporal left/right), pick one randomly
  const baseLobe = lobeSubArr[Math.floor(Math.random() * lobeSubArr.length)];
  const basePos = baseLobe.position;
  
  // 2. SPAWN EXACTLY INSIDE THE LOBE BOUNDARY
  // The lobe radius is 8 * scale. We want nodes strictly contained inside.
  const lobeRadius = 8 * baseLobe.scale.x;
  const radiusOffset = Math.random() * (lobeRadius - 1.5); // Stay slightly inside the surface
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);
  
  const position = new THREE.Vector3(
    basePos.x + radiusOffset * Math.sin(phi) * Math.cos(theta),
    basePos.y + radiusOffset * Math.sin(phi) * Math.sin(theta),
    basePos.z + radiusOffset * Math.cos(phi)
  );

  let geometry = config.special === 'dream' ? new THREE.IcosahedronGeometry(0.8, 0) : new THREE.SphereGeometry(0.5, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: config.color, emissive: config.color, emissiveIntensity: 2.0, transparent: true, opacity: 1.0, roughness: 0.2, metalness: 0.8 });
  
  const node = new THREE.Mesh(geometry, material);
  node.position.copy(position);
  node.userData = { type: 'thought', ai: ai, text: text, concept: concept };

  // FLASH THE LOBE IT SURFACED IN (Visual reflection)
  gsapAnimation(baseLobe.material, { emissiveIntensity: 0.8 }, 0.2, "power2.out");
  setTimeout(() => {
     gsapAnimation(baseLobe.material, { emissiveIntensity: 0.1 }, 1.0, "power2.out");
  }, 300);

  // 3. CREATE CSS2D HTML LABEL
  if (labelsContainer) {
      const label = document.createElement('div');
      label.className = 'node-label';
      label.style.position = 'absolute';
      label.style.color = '#' + config.color.toString(16).padStart(6, '0');
      label.style.fontSize = '12px';
      label.style.fontFamily = 'Inter, sans-serif';
      label.style.fontWeight = '700';
      label.style.textShadow = '0 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,1), 0 0 1px rgba(255,255,255,0.5)';
      label.style.pointerEvents = 'none';
      label.style.whiteSpace = 'nowrap';
      label.innerText = concept || ai;
      label.style.transition = 'opacity 0.2s';
      labelsContainer.appendChild(label);
      node.userData.label = label;
  }

  // 4. CONNECT NEURONAL EDGES (Keep them neatly connected, staying in brain mostly)
  const targetNode = thoughtNodes.length > 5 && Math.random() > 0.4 ? thoughtNodes[Math.floor(Math.random() * thoughtNodes.length)] : baseLobe;
  createEdge(node, targetNode, config.color);
      
  createInkSplat(position, config.color);

  brainGroup.add(node);
  thoughtNodes.push(node);
  
  nodeInjectMem[ai] = concept || text.substring(0, 30);

  node.scale.set(0.01, 0.01, 0.01);
  gsapAnimation(node.scale, { x: 1.5, y: 1.5, z: 1.5 }, 0.6, "back.out");

  addThoughtToUI(ai, concept || text.substring(0, 30), config.color);
  updateNeuralPressure();

  if (thoughtNodes.length > 60) removeOldestNode();

  return node;
}

function createEdge(nodeA, nodeB, color) {
  const material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
  const geometry = new THREE.BufferGeometry().setFromPoints([nodeA.position, nodeB.position]);
  const line = new THREE.Line(geometry, material);
  brainGroup.add(line);
  edges.push({ line, nodeA, nodeB });
}

function createInkSplat(position, color) {
  const particleCount = 30;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;
    velocities.push({ x: (Math.random() - 0.5) * 1.5, y: (Math.random() - 0.5) * 1.5, z: (Math.random() - 0.5) * 1.5 });
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: color, size: 0.6, transparent: true, opacity: 1, blending: THREE.AdditiveBlending });
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  let frame = 0;
  function animateSplat() {
    frame++;
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] += velocities[i].x; pos[i * 3 + 1] += velocities[i].y; pos[i * 3 + 2] += velocities[i].z;
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
  
  thoughtNodes.forEach(node => { node.material.emissiveIntensity = 1.0; });
  
  if (intersects.length > 0) {
    document.body.style.cursor = 'pointer';
    intersects[0].object.material.emissiveIntensity = 3.0;
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
    // alert(`Concept: ${node.userData.concept}\nAI: ${node.userData.ai}\nText: ${node.userData.text}`);
    const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
    const y = (tempV.y * -0.5 + 0.5) * window.innerHeight;
    
    // Ensure popup stays on screen
    const pWidth = 350;
    const pHeight = 200;
    let finalX = x;
    let finalY = y;
    if (x + pWidth > window.innerWidth) finalX = window.innerWidth - pWidth - 20;
    if (y + pHeight > window.innerHeight) finalY = window.innerHeight - pHeight - 20;
    
    popup.style.left = finalX + 'px';
    popup.style.top = finalY + 'px';
    document.body.appendChild(popup);
    
    // Click outside to close
    setTimeout(() => {
        const closeHnd = () => { popup.remove(); window.removeEventListener('click', closeHnd); };
        window.addEventListener('click', closeHnd);
    }, 100);
  } else {
    // Reset view
    gsapAnimation(camera.position, { x: 0, y: 30, z: 80 }, 1.5, "power2.out");
    gsapAnimation(controls.target, { x: 0, y: 0, z: 0 }, 1.5, "power2.out");
    
    const lobeIntersects = raycaster.intersectObjects(Object.values(logicalLobes).flat());
    if (lobeIntersects.length > 0) {
        const lobe = lobeIntersects[0].object;
        createThoughtNode(lobe.userData.ai, "Manual Node Injection: Exploratory Thought Process", "Manual Pulse");
    }
  }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        const keys = Object.keys(AI_CONFIG);
        const rAi = keys[Math.floor(Math.random() * keys.length)];
        createThoughtNode(rAi, "Universal Spontaneous Neural Injection Fired", "Spontaneous Injection");
    }
});

function onRightClick(event) {
  event.preventDefault();
  if (!isInitialized) return;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(thoughtNodes);
  
  if (intersects.length > 0) {
      const node = intersects[0].object;
      alert(`[SYSTEM] Accessing origin chat for trace ID ${node.id}...\nSource LLM: ${node.userData.ai.toUpperCase()}\nText Context: "${node.userData.text}"`);
  } else {
      const lobeIntersects = raycaster.intersectObjects(Object.values(logicalLobes).flat());
      if (lobeIntersects.length > 0) {
         const lobe = lobeIntersects[0].object;
         alert(`[SYSTEM] Inspecting macro region.\nStructural Domain: ${lobe.userData.name.toUpperCase()}\nHost Architecture: ${lobe.userData.ai.toUpperCase()}`);
      }
  }
}

window.addEventListener('contextmenu', onRightClick);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

const tempV = new THREE.Vector3();

function animate() {
  requestAnimationFrame(animate);
  if (!isInitialized) return;
  
  controls.update();

  const time = Date.now() * 0.001;
  const globalDist = camera.position.length();

  thoughtNodes.forEach((node, i) => {
    node.position.y += Math.sin(time * 2 + i) * 0.02;
    
    // 5. PROJECT 3D VECTOR TO 2D SCREEN FOR TEXT LABELS
    if (node.userData.label) {
        tempV.copy(node.position);
        node.localToWorld(tempV);
        tempV.project(camera);
        
        if (tempV.z > 1) {
            node.userData.label.style.display = 'none';
        } else {
            node.userData.label.style.display = 'block';
            const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
            const y = (tempV.y * -0.5 + 0.5) * window.innerHeight;
            node.userData.label.style.transform = `translate(-50%, -50%) translate(${x}px,${y - 20}px)`;
            
            // Multi-level zoom mappings
            // Level 1: > 100 (Far) - Only macro lobes visible
            // Level 2: 60 to 100 (Medium) - Macro lobes fade out, medium labels appear
            // Level 3: 30 to 60 (Close) - Tiny nodes fully bright and sharp
            // Level 4: < 30 (Super Close) - Maximum interactivity
            
            if (globalDist > 90) {
               node.userData.label.style.opacity = 0; // Level 1: Labels hidden
               node.material.opacity = 0.2; // Nodes fade
            } else if (globalDist > 50) {
               // Level 2: Nodes fading in, labels visible but soft
               node.userData.label.style.opacity = ((90 - globalDist) / 40) * 0.6;
               node.material.opacity = 0.5;
               node.userData.label.style.transform = `translate(-50%, -50%) translate(${x}px,${y - 12}px) scale(0.8)`;
            } else {
               // Level 3 & 4: Deep focus
               node.userData.label.style.opacity = 1;
               node.material.opacity = 1.0;
               node.userData.label.style.transform = `translate(-50%, -50%) translate(${x}px,${y - 20}px) scale(1.1)`;
               
               if (globalDist < 30) {
                  node.userData.label.style.transform = `translate(-50%, -50%) translate(${x}px,${y - 25}px) scale(1.3)`;
                  node.userData.label.style.zIndex = 100;
               }
            }
        }
    }
  });

  // Calculate Macro Label screen positions & Multi-level Zoom Opacity
  Object.values(logicalLobes).flat().forEach(lobe => {
      if (lobe.userData.macroLabel) {
          tempV.copy(lobe.position);
          lobe.localToWorld(tempV);
          tempV.project(camera);
          
          if (tempV.z > 1) {
              lobe.userData.macroLabel.style.display = 'none';
          } else {
              lobe.userData.macroLabel.style.display = 'block';
              const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
              const y = (tempV.y * -0.5 + 0.5) * window.innerHeight;
              lobe.userData.macroLabel.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
              
              // Only visible at Level 1 & 2
              if (globalDist > 100) {
                  lobe.userData.macroLabel.style.opacity = 0.8;
              } else if (globalDist > 60) {
                  lobe.userData.macroLabel.style.opacity = ((globalDist - 60) / 40);
              } else {
                  lobe.userData.macroLabel.style.opacity = 0; // Hidden closely
              }
              
              // Latest concept logic
              if (nodeInjectMem && nodeInjectMem[lobe.userData.ai]) {
                  lobe.userData.macroLabel.innerText = nodeInjectMem[lobe.userData.ai];
              }
          }
      }
  });
  
  // Animate dynamic synapse trails
  edges.forEach((edge, i) => {
     const positions = edge.line.geometry.attributes.position.array;
     positions[0] = edge.nodeA.position.x; positions[1] = edge.nodeA.position.y; positions[2] = edge.nodeA.position.z;
     positions[3] = edge.nodeB.position.x; positions[4] = edge.nodeB.position.y; positions[5] = edge.nodeB.position.z;
     edge.line.geometry.attributes.position.needsUpdate = true;

     // Level-based Edge Opacity & Dynamic Pulsing
     if (globalDist > 100) {
         edge.line.material.opacity = 0; // Level 1 (Faded)
     } else if (globalDist > 50) {
         edge.line.material.opacity = ((100 - globalDist) / 50) * 0.2; // Medium glow
     } else {
         edge.line.material.opacity = 0.6 + Math.sin(time * 3 + i) * 0.4; // Synapse Pulse (Level 3/4)
     }
     
     // Thicken or narrow line based on thought scale
     edge.line.material.linewidth = globalDist < 40 ? 2 : 1; 
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
  createThoughtNode('openai', 'RAG is better than long context for precise retrieval', 'RAG vs Context');
  setTimeout(() => createThoughtNode('claude', 'LLMs can be viewed as compilers for natural language', 'LLM Compilers'), 500);
  setTimeout(() => createThoughtNode('gemini', 'Obsidian markdown workflows enable Zettelkasten', 'Knowledge Graph'), 1000);
  setTimeout(() => createThoughtNode('kimi', 'Vector database search requires embedding optimization', 'Vectors Setup'), 1500);
  setTimeout(() => createThoughtNode('deepsleep', 'Consolidating memories during idle time', 'Base Consolidation'), 2000);
  setTimeout(() => createThoughtNode('claude', 'System prompt architecture bounds recursive alignment', 'Alignment Chains'), 2500);
  setTimeout(() => createThoughtNode('openai', 'Speculative decoding reduces TTFT in production', 'Token Metrics'), 3000);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'NEW_THOUGHT' && isInitialized) {
      const conceptStr = request.concepts ? request.concepts.map(c => c.name).join(', ') : request.text.substring(0, 20);
      createThoughtNode(request.ai, request.text, conceptStr);
      sendResponse({ success: true });
    }
  });
}
window._handleExtMsg = (request) => {
  if (request.type === 'NEW_THOUGHT' && isInitialized) {
    const conceptStr = request.concepts ? request.concepts.map(c => c.name).join(', ') : request.text.substring(0, 20);
    createThoughtNode(request.ai, request.text, conceptStr);
  }
};
