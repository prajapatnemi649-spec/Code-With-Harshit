// =========================================================================
// CODE WITH HARSHIT - GOD-TIER 3D DIGITAL VORTEX & WORMHOLE ENGINE
// Concept: Cyber Helix Spiral + Quantum Torus Singularity + Dynamic Energy Waves
// =========================================================================

let scene, camera, renderer;
let vortexParticles, waveMesh, singularityCore, singularityRings = [];
let particlePositions, particleColors, particleAngles, particleRadii, particleSpeeds;
let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
let scrollData = { speed: 0, lastY: 0, progress: 0 };

const TOTAL_PARTICLES = window.innerWidth < 768 ? 18000 : 38000;
const VORTEX_LENGTH = 7000;

function initGodTierUniverse() {
    const container = document.getElementById('webgl-container');
    if (!container) return;

    // 1. Scene Setup & Deep Space Atmosphere
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x010409, 0.00045);

    // 2. Camera Configuration
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 9000);
    camera.position.set(0, 0, 1400);

    // 3. Ultra-Smooth WebGL Renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    // =========================================================
    // 4. 🌀 3D HELICAL DIGITAL VORTEX (WORMHOLE PARTICLES)
    // =========================================================
    const vortexGeo = new THREE.BufferGeometry();
    particlePositions = new Float32Array(TOTAL_PARTICLES * 3);
    particleColors = new Float32Array(TOTAL_PARTICLES * 3);
    particleAngles = new Float32Array(TOTAL_PARTICLES);
    particleRadii = new Float32Array(TOTAL_PARTICLES);
    particleSpeeds = new Float32Array(TOTAL_PARTICLES);

    for (let i = 0; i < TOTAL_PARTICLES; i++) {
        const i3 = i * 3;
        
        // Helical Vortex Math
        const zProg = Math.random();
        const z = 1500 - (zProg * VORTEX_LENGTH);
        const radius = 180 + Math.pow(zProg, 1.4) * 1600 + (Math.random() - 0.5) * 200;
        const angle = Math.random() * Math.PI * 2;

        particlePositions[i3] = Math.cos(angle) * radius;
        particlePositions[i3 + 1] = Math.sin(angle) * radius;
        particlePositions[i3 + 2] = z;

        particleAngles[i] = angle;
        particleRadii[i] = radius;
        particleSpeeds[i] = (Math.random() * 0.008 + 0.003) * (Math.random() > 0.5 ? 1 : -1);

        // Cyberpunk Plasma Color Palette
        const p = Math.random();
        if (p < 0.45) {
            // Neon Cyan (#00f2fe)
            particleColors[i3] = 0.0; particleColors[i3 + 1] = 0.95; particleColors[i3 + 2] = 1.0;
        } else if (p < 0.8) {
            // Quantum Violet / Electric Purple (#9d4edd)
            particleColors[i3] = 0.61; particleColors[i3 + 1] = 0.3; particleColors[i3 + 2] = 0.87;
        } else {
            // Star Diamond White / Gold Spark
            particleColors[i3] = 0.98; particleColors[i3 + 1] = 0.98; particleColors[i3 + 2] = 1.0;
        }
    }

    vortexGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    vortexGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const vortexMat = new THREE.PointsMaterial({
        size: window.innerWidth < 768 ? 2.4 : 2.0,
        vertexColors: true,
        transparent: true,
        opacity: 0.88,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    vortexParticles = new THREE.Points(vortexGeo, vortexMat);
    scene.add(vortexParticles);

    // =========================================================
    // 5. 🌊 3D CYBER ENERGY WAVE RIBBON (WARPING TERRAIN)
    // =========================================================
    const waveGeo = new THREE.PlaneGeometry(3500, 7000, 36, 60);
    const waveMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
        transparent: true,
        opacity: 0.18
    });
    waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.rotation.x = -Math.PI / 2.2;
    waveMesh.position.set(0, -600, -2000);
    scene.add(waveMesh);

    // =========================================================
    // 6. ⚡ SINGULARITY CORE (3D TORUS-KNOT BLACK-HOLE)
    // =========================================================
    const torusGeo = new THREE.TorusKnotGeometry(220, 45, 120, 16, 2, 3);
    const torusMat = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });
    singularityCore = new THREE.Mesh(torusGeo, torusMat);
    singularityCore.position.set(0, 0, -2800);
    scene.add(singularityCore);

    // Shockwave Neon Rings around Singularity
    for (let i = 0; i < 6; i++) {
        const ringGeo = new THREE.RingGeometry(350 + i * 80, 354 + i * 80, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: i % 2 === 0 ? 0x00f2fe : 0xa855f7,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.35 - (i * 0.04)
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.z = -2400 - (i * 250);
        scene.add(ring);
        singularityRings.push(ring);
    }

    // =========================================================
    // 7. 🖱️ LISTENERS & SCROLL SPEED TRACKING
    // =========================================================
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScrollAction);

    // Connect GSAP Camera Flight
    setupCameraScrollFlight();

    // Start 60 FPS Render Loop
    animate();
}

function onMouseMove(e) {
    mouse.targetX = (e.clientX - window.innerWidth / 2) * 0.15;
    mouse.targetY = (e.clientY - window.innerHeight / 2) * 0.15;
}

function onScrollAction() {
    const currentY = window.scrollY;
    scrollData.speed = Math.min(Math.abs(currentY - scrollData.lastY) * 0.2, 40);
    scrollData.lastY = currentY;

    clearTimeout(scrollData.timer);
    scrollData.timer = setTimeout(() => {
        scrollData.speed = 0;
    }, 100);
}

function setupCameraScrollFlight() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // 🚀 CAMERA SPLINE ROLLERCOASTER DIVE
    gsap.timeline({
        scrollTrigger: {
            trigger: "#main-content",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.4
        }
    })
    .to(camera.position, {
        z: -3400,
        y: 220,
        ease: "none"
    }, 0)
    .to(camera.rotation, {
        z: Math.PI * 1.8, // Crazy 3D Barrel Roll
        x: -0.25,
        ease: "none"
    }, 0);

    // Singularity Core Scale & Warp on Scroll
    gsap.to(singularityCore.scale, {
        x: 2.8,
        y: 2.8,
        z: 2.8,
        scrollTrigger: {
            trigger: "#main-content",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        }
    });
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// =========================================================
// 8. 🌀 REAL-TIME 60 FPS SHADER SIMULATION
// =========================================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();
    const positions = vortexParticles.geometry.attributes.position.array;
    const warpMultiplier = 1 + scrollData.speed * 0.2;

    // A. Helical Vortex Whirlpool Animation
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
        const i3 = i * 3;

        // Angle rotation based on depth
        particleAngles[i] += particleSpeeds[i] * warpMultiplier;

        // Dynamic vortex breathing wave
        const dynamicRadius = particleRadii[i] + Math.sin(elapsed * 2 + positions[i3 + 2] * 0.003) * 35;

        // Mouse Gravitational Pull
        const pullFactor = Math.max(0, 1 - Math.abs(positions[i3 + 2] - camera.position.z) / 2500);
        const mouseShiftX = (mouse.x * pullFactor) * 0.4;
        const mouseShiftY = (mouse.y * pullFactor) * 0.4;

        positions[i3] = Math.cos(particleAngles[i]) * dynamicRadius + mouseShiftX;
        positions[i3 + 1] = Math.sin(particleAngles[i]) * dynamicRadius + mouseShiftY;

        // Hyperspeed Fly-through on Scroll
        positions[i3 + 2] += (1.8 + scrollData.speed * 1.8);
        if (positions[i3 + 2] > camera.position.z + 400) {
            positions[i3 + 2] = camera.position.z - VORTEX_LENGTH;
        }
    }
    vortexParticles.geometry.attributes.position.needsUpdate = true;

    // B. Cyber Energy Wave Surface Distortion (Sine Terrain)
    if (waveMesh) {
        const wavePos = waveMesh.geometry.attributes.position;
        for (let i = 0; i < wavePos.count; i++) {
            const u = wavePos.getX(i);
            const v = wavePos.getY(i);
            const zWave = Math.sin(u * 0.004 + elapsed * 3) * Math.cos(v * 0.003 + elapsed * 2) * (70 + scrollData.speed * 4);
            wavePos.setZ(i, zWave);
        }
        wavePos.needsUpdate = true;
    }

    // C. Singularity Torus-Knot Morph
    if (singularityCore) {
        singularityCore.rotation.x = elapsed * 0.45;
        singularityCore.rotation.y = elapsed * 0.65;
        singularityCore.rotation.z = elapsed * 0.3;
    }

    // D. Neon Shockwave Rings Pulse
    singularityRings.forEach((ring, idx) => {
        ring.rotation.z = elapsed * (0.2 + idx * 0.05) * (idx % 2 === 0 ? 1 : -1);
        const pulse = 1 + Math.sin(elapsed * 2.5 + idx) * 0.05;
        ring.scale.set(pulse, pulse, 1);
    });

    // E. Smooth Parallax Camera Lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    camera.position.x = mouse.x * 0.6;
    camera.position.y = -mouse.y * 0.6;

    renderer.render(scene, camera);
}

// Auto Initialize
window.addEventListener('DOMContentLoaded', initGodTierUniverse);