import { GraphDB, AI_COLORS } from './db.js';

// Setup Cytoscape (headless layout engine)
import cytoscape from 'https://unpkg.com/cytoscape@3.26.0/dist/cytoscape.min.mjs';
import cola from 'https://unpkg.com/cytoscape-cola@2.5.1/cytoscape-cola.mjs';
cytoscape.use(cola);

// -------------- THREE.JS OVERLAY LAYER --------------
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050508, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
// Adjusted for Cytoscape coordinates mapping
camera.position.set(0, 0, 800);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.getElementById('canvas-container').appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Post-Processing (Cinematic Bloom & Glow)
const renderScene = new THREE.RenderPass(scene, camera);
const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 2.5, 0.4, 0.1);
const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Collections for Sync
const webGLNodes = {};
const webGLEdges = {};

// Convert hex color to THREE.Color carefully
function getThreeColor(hexStr) {
  if (!hexStr) return new THREE.Color(0xffffff);
  return new THREE.Color(hexStr);
}

// Map Cytoscape coordinates to ThreeJS Coordinates roughly in center
function mapCoords(pos) {
  return {
    x: pos.x - window.innerWidth / 2,
    y: -(pos.y - window.innerHeight / 2),
    z: 0
  };
}

// Particle splat effect
function createInkSplat(position, color) {
  const particleCount = 20;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;
    velocities.push({
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 8,
      z: (Math.random() - 0.5) * 8
    });
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: color, size: 4, transparent: true, opacity: 1, blending: THREE.AdditiveBlending
  });
  
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  
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
    if (material.opacity > 0 && frame < 50) requestAnimationFrame(animateSplat);
    else scene.remove(particles);
  }
  animateSplat();
}

function syncNodeVisuals(nodeData, position) {
  const mapped = mapCoords(position);
  if (!webGLNodes[nodeData.id]) {
      // Create new ThreeJS node
      const isDream = (nodeData.aiSource === 'deepsleep_beta');
      const size = nodeData.importance ? (nodeData.importance * 3 + 10) : 15;
      
      const geo = isDream ? new THREE.IcosahedronGeometry(size*1.5, 0) : new THREE.SphereGeometry(size, 32, 32);
      const color = getThreeColor(nodeData.color);
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: isDream ? 2 : 1.2,
        transparent: true,
        opacity: 0.9,
        wireframe: isDream
      });
      
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(mapped.x, mapped.y, mapped.z);
      scene.add(mesh);
      
      const parts = [];
      if (isDream) {
         // Add dream particles
         const pGeo = new THREE.BufferGeometry();
         const pPos = new Float32Array(30 * 3);
         for(let k=0; k<30; k++) {
            pPos[k*3] = mapped.x + (Math.random()-0.5)*50;
            pPos[k*3+1] = mapped.y + Math.random()*30;
            pPos[k*3+2] = mapped.z + (Math.random()-0.5)*50;
         }
         pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
         const pMat = new THREE.PointsMaterial({ color: color, size: 2, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
         const mist = new THREE.Points(pGeo, pMat);
         scene.add(mist);
         parts.push(mist);
         
         gsap.to(mesh.rotation, { x: Math.PI*2, y: Math.PI*2, duration: 10, repeat: -1, ease: "none" });
         gsap.to(mat, { emissiveIntensity: 0.5, duration: 2, repeat: -1, yoyo: true });
      } else {
         // Enter animation
         mesh.scale.set(0.01, 0.01, 0.01);
         gsap.to(mesh.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: "elastic.out(1, 0.3)" });
      }

      webGLNodes[nodeData.id] = { mesh, parts, isDream, baseSize: size };
      createInkSplat(mesh.position, color);
  } else {
      // Update existing
      const n = webGLNodes[nodeData.id];
      n.mesh.position.set(mapped.x, mapped.y, mapped.z);
      
      if (n.isDream && n.parts.length > 0) {
         const pPos = n.parts[0].geometry.attributes.position.array;
         for(let k=0; k<30; k++) {
             pPos[k*3] = mapped.x + (Math.random()-0.5)*50;
             pPos[k*3+1] = mapped.y + Math.random()*30;
             pPos[k*3+2] = mapped.z + (Math.random()-0.5)*50;
         }
         n.parts[0].geometry.attributes.position.needsUpdate = true;
      }
      
      // Update size dynamically if importance changed
      const targetSize = nodeData.importance ? (nodeData.importance * 3 + 10) : 15;
      const scaleFactor = targetSize / n.baseSize;
      n.mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }
}

function syncEdgeVisuals(edgeData, sourcePos, targetPos) {
  const p1 = mapCoords(sourcePos);
  const p2 = mapCoords(targetPos);
  
  if (!webGLEdges[edgeData.id]) {
      const geo = new THREE.BufferGeometry().setFromPoints([
         new THREE.Vector3(p1.x, p1.y, p1.z),
         new THREE.Vector3(p2.x, p2.y, p2.z)
      ]);
      const mat = new THREE.LineBasicMaterial({
         color: 0xffffff,
         transparent: true,
         opacity: edgeData.strength ? edgeData.strength * 0.5 : 0.3,
         blending: THREE.AdditiveBlending
      });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      webGLEdges[edgeData.id] = { line };
  } else {
      const line = webGLEdges[edgeData.id].line;
      const positions = line.geometry.attributes.position.array;
      positions[0] = p1.x; positions[1] = p1.y; positions[2] = p1.z;
      positions[3] = p2.x; positions[4] = p2.y; positions[5] = p2.z;
      line.geometry.attributes.position.needsUpdate = true;
  }
}

// Loop to constantly sync cytoscape physics to THREE.js rendering
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  
  if (cy) {
      // Sync Nodes
      cy.nodes().forEach(node => {
         syncNodeVisuals(node.data(), node.position());
      });
      // Sync Edges
      cy.edges().forEach(edge => {
         syncEdgeVisuals(edge.data(), edge.source().position(), edge.target().position());
      });
      
      // Map camera zoom/pan if user drags Cytoscape directly? 
      // Actually we let THREE OrbitControls handle camera, Cytoscape is just for layout.
  }
  
  composer.render();
}
animate();


// -------------- CYTOSCAPE HEADLESS PHYSICS LAYER --------------
let cy;
async function initGraph() {
  const { nodes, edges } = await GraphDB.getAllData();
  
  const elements = [
    ...nodes.map(n => ({
      data: { id: n.id, name: n.name, aiSource: n.aiSource, color: n.color, importance: n.importance }
    })),
    ...edges.map(e => ({
      data: { id: e.id, source: e.source, target: e.target, type: e.type, strength: e.strength }
    }))
  ];

  cy = cytoscape({
    container: document.getElementById('cy'),
    elements: elements,
    style: [ { selector: 'node', style: { 'width': 40, 'height': 40 } }, { selector: 'edge', style: { 'width': 2 } } ],
    layout: {
      name: 'cola',
      infinite: true,
      fit: false,
      padding: 50,
      randomize: true
    }
  });

  updateMemoryStats(nodes.length);
}

function addThoughtToStream(ai, text, color) {
  const container = document.getElementById('thoughts-list');
  const div = document.createElement('div');
  div.className = 'thought';
  div.style.borderLeftColor = color || '#fff';
  
  const aiName = ai.charAt(0).toUpperCase() + ai.slice(1);
  div.innerHTML = `
    <div class="ai-label">${aiName}</div>
    <div class="thought-text">${text.substring(0, 100)}${text.length > 100 ? '...' : ''}</div>
  `;
  container.insertBefore(div, container.firstChild);
  if (container.children.length > 10) container.removeChild(container.lastChild);
}

function updateMemoryStats(nodeCount) {
  const percent = Math.min((nodeCount / 200) * 100, 100);
  document.getElementById('memory-percent').textContent = Math.floor(percent) + '%';
  document.getElementById('memory-fill').style.width = percent + '%';
  document.getElementById('memory-stat').textContent = `Nodes: ${nodeCount} / 200`;
  
  if (percent > 80) document.getElementById('memory-warning').style.opacity = '1';
  else document.getElementById('memory-warning').style.opacity = '0';
  
  // Bloom intensity increases with pressure
  gsap.to(bloomPass, { strength: 1.5 + (percent/100)*2, duration: 1.0 });
}

// Connection to extensions / background
const handleExtMsg = async (msg) => {
  if (msg.type === 'NEW_THOUGHT') {
    addThoughtToStream(msg.ai, msg.text, AI_COLORS[msg.ai]);
    
    // Chromatic / bloom flash when thought hits!
    const originalBloom = bloomPass.strength;
    bloomPass.strength = originalBloom + 2.0;
    gsap.to(bloomPass, { strength: originalBloom, duration: 1.5, ease: "power2.out" });

    msg.concepts.forEach((concept, i) => {
      if (!cy.getElementById(concept.dbId).length) {
         cy.add({
            group: 'nodes',
            data: { id: concept.dbId, name: concept.name, color: AI_COLORS[msg.ai] || '#ffffff', aiSource: msg.ai, importance: 1 },
            position: { x: window.innerWidth / 2 + (Math.random()-0.5)*200, y: window.innerHeight / 2 + (Math.random()-0.5)*200 }
         });
      }
    });

    msg.relationships.forEach(rel => {
       if (rel.dbId && !cy.getElementById(rel.dbId).length) {
           cy.add({
              group: 'edges',
              data: { id: rel.dbId, source: rel.sourceDbId, target: rel.targetDbId, type: rel.type, strength: 0.8 }
           });
       }
    });
    
    cy.layout({ name: 'cola', randomize: false, maxSimulationTime: 2000 }).run();
    updateMemoryStats(cy.nodes().length);
    
    const { nodes } = await GraphDB.getAllData();
    nodes.forEach(n => {
       const cyNode = cy.getElementById(n.id);
       if (cyNode.length) cyNode.data('importance', n.importance);
    });
  }
};

// Bind to chrome if available, or window fallback for localhost
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(handleExtMsg);
}
// For demo.html
window._handleExtMsg = handleExtMsg;

// Handle window resize dynamically ensuring the cinematic look scales
window.addEventListener('resize', () => {
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();
   renderer.setSize(window.innerWidth, window.innerHeight);
   composer.setSize(window.innerWidth, window.innerHeight);
});

// Init on load
initGraph();
