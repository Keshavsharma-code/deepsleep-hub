/* brain.js - DeepSleep Hub v3.0 3D Visualizer */

let scene, camera, renderer, nodes = [], lines = [];
let raycaster, mouse, hoveredNode = null;
const tooltip = document.getElementById('tooltip');

const COLORS = {
    chatgpt: 0x10a37f,
    claude: 0xd97757,
    gemini: 0x4285f4,
    kimi: 0xef4444
};

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 80;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffaa00, 2);
    pointLight.position.set(0, 0, 50);
    scene.add(pointLight);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);

    loadData();
    animate();
}

function loadData() {
    chrome.runtime.sendMessage({ type: 'GET_MEMORIES' }, (response) => {
        if (response && response.memories) {
            buildGraph(response.memories);
        }
    });
}

// Spherical distribution using Golden Angle Spiral
function buildGraph(memories) {
    const total = memories.length;
    const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
    const radius = 40;

    memories.forEach((memory, i) => {
        const y = 1 - (i / (total - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = phi * i;

        const x = Math.cos(theta) * r * radius;
        const z = Math.sin(theta) * r * radius;
        const posY = y * radius;

        createNode(memory, x, posY, z);
    });

    createLines();
}

function createNode(memory, x, y, z) {
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: COLORS[memory.source] || 0xffffff,
        emissive: COLORS[memory.source] || 0xffffff,
        emissiveIntensity: 0.2,
        shininess: 100
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    sphere.userData = memory;
    sphere.originalScale = 1;
    
    scene.add(sphere);
    nodes.push(sphere);
}

function createLines() {
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.1, transparent: true });
    for (let i = 0; i < nodes.length - 1; i++) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            nodes[i].position,
            nodes[i+1].position
        ]);
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        lines.push(line);
    }
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(nodes);

    if (intersects.length > 0) {
        if (hoveredNode !== intersects[0].object) {
            if (hoveredNode) hoveredNode.scale.set(1, 1, 1);
            hoveredNode = intersects[0].object;
            hoveredNode.scale.set(1.5, 1.5, 1.5);
            
            tooltip.style.display = 'block';
            tooltip.innerHTML = `<strong>${hoveredNode.userData.source.toUpperCase()}</strong><br>${hoveredNode.userData.text.substring(0, 50)}...`;
        }
        tooltip.style.left = (event.clientX + 10) + 'px';
        tooltip.style.top = (event.clientY + 10) + 'px';
    } else {
        if (hoveredNode) hoveredNode.scale.set(1, 1, 1);
        hoveredNode = null;
        tooltip.style.display = 'none';
    }
}

function onClick() {
    if (hoveredNode) {
        const memory = hoveredNode.userData;
        navigator.clipboard.writeText(memory.text);
        
        // Flash green
        const originalColor = hoveredNode.material.color.clone();
        hoveredNode.material.color.set(0x00ff00);
        setTimeout(() => hoveredNode.material.color.copy(originalColor), 500);
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Slow rotation of the whole mesh
    scene.rotation.y += 0.002;
    scene.rotation.x += 0.001;

    // Gentle floating for each node
    nodes.forEach((node, i) => {
        node.position.y += Math.sin(Date.now() * 0.001 + i) * 0.02;
    });

    renderer.render(scene, camera);
}

function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
