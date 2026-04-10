import { GraphDB, AI_COLORS } from './db.js';
import cytoscape from 'https://unpkg.com/cytoscape@3.26.0/dist/cytoscape.min.mjs';
import cola from 'https://unpkg.com/cytoscape-cola@2.5.1/cytoscape-cola.mjs';
cytoscape.use(cola);

// -------------- THREE.JS OVERLAY LAYER --------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const webGLNodes = {};

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  Object.values(webGLNodes).forEach(obj => {
    if (obj.animate) obj.animate();
  });
  renderer.render(scene, camera);
}
animate();

// Dream node effect (DeepSleep-beta)
function createDreamNode(id, position, text) {
  const geometry = new THREE.IcosahedronGeometry(1.5, 0); 
  const material = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xfbbf24,
    emissiveIntensity: 2, 
    transparent: true,
    opacity: 0.9
  });
  
  const node = new THREE.Mesh(geometry, material);
  node.position.set((position.x - window.innerWidth/2)/5, -(position.y - window.innerHeight/2)/5, 0); 
  scene.add(node);
  
  const particleCount = 30;
  const dreamGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for(let i=0; i<particleCount; i++) {
    positions[i*3] = node.position.x + (Math.random()-0.5)*30;
    positions[i*3+1] = node.position.y + Math.random()*20; 
    positions[i*3+2] = node.position.z + (Math.random()-0.5)*30;
  }
  
  dreamGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dreamMat = new THREE.PointsMaterial({
    color: 0xfbbf24,
    size: 2.0,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  const dreamMist = new THREE.Points(dreamGeo, dreamMat);
  scene.add(dreamMist);
  
  gsap.to(material, { emissiveIntensity: 0.5, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
  gsap.to(node.rotation, { x: Math.PI * 2, y: Math.PI * 2, duration: 20, repeat: -1, ease: "none" });

  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 40px Arial';
  ctx.fillText('💤', 10, 50);
  
  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.set(node.position.x, node.position.y + 20, node.position.z);
  sprite.scale.set(20, 20, 1);
  scene.add(sprite);
  
  gsap.to(sprite.position, { y: node.position.y + 40, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });

  webGLNodes[id] = { node, dreamMist, sprite, animate: () => {} };
}


// -------------- CYTOSCAPE GRAPH LAYER --------------
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
    style: [
      {
        selector: 'node',
        style: {
          'background-color': 'data(color)',
          'width': 'mapData(importance, 0, 10, 20, 80)',
          'height': 'mapData(importance, 0, 10, 20, 80)',
          'label': 'data(name)',
          'color': '#fff',
          'font-size': '12px',
          'text-valign': 'center',
          'text-halign': 'center',
          'border-width': 2,
          'border-color': '#fff',
          'text-outline-color': '#000',
          'text-outline-width': 2
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 'mapData(strength, 0, 1, 1, 8)',
          'line-color': '#444',
          'target-arrow-color': '#444',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(type)',
          'font-size': '10px',
          'color': '#888',
          'text-rotation': 'autorotate'
        }
      }
    ],
    layout: {
      name: 'cola',
      infinite: true,
      fit: false,
      padding: 50
    }
  });

  nodes.forEach(n => {
     if (n.aiSource === 'deepsleep_beta') {
       const pos = cy.getElementById(n.id).position();
       createDreamNode(n.id, pos, n.name);
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
  
  if (percent > 80) {
    document.getElementById('memory-warning').style.opacity = '1';
  } else {
    document.getElementById('memory-warning').style.opacity = '0';
  }
}

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === 'NEW_THOUGHT') {
    addThoughtToStream(msg.ai, msg.text, AI_COLORS[msg.ai]);
    
    msg.concepts.forEach((concept, i) => {
      if (!cy.getElementById(concept.dbId).length) {
         cy.add({
            group: 'nodes',
            data: { id: concept.dbId, name: concept.name, color: AI_COLORS[msg.ai] || '#ffffff', importance: 1 },
            position: { x: window.innerWidth / 2 + (Math.random()-0.5)*200, y: window.innerHeight / 2 + (Math.random()-0.5)*200 }
         });
         
         if (msg.ai === 'deepsleep_beta') {
             createDreamNode(concept.dbId, {x: window.innerWidth/2, y: window.innerHeight/2}, concept.name);
         }
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
});

// Init on load
initGraph();
