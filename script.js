/**
 * Three.js 3D Pharmaceutical Laboratory Scene Engine Module
 * Built from scratch with mathematical primitives for hardware acceleration.
 */

class LaboratoryScene {
    constructor() {
        this.container = document.getElementById('three-canvas-container');
        if (!this.container) return;

        this.initEngine();
        this.createLighting();
        this.createDnaHelix();
        this.createFloatingCapsules();
        this.createLabParticles();
        this.hookInteractionEvents();
        this.loop();
    }

    initEngine() {
        // Initialize Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x030811, 0.015);

        // Initialize Camera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 30;

        // Initialize WebGL Antialiased Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x030811, 1);
        this.container.appendChild(this.renderer.domElement);

        // Interaction state caching
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetCameraX = 0;
        this.targetCameraY = 0;
    }

    createLighting() {
        // Ambient soft lab environment light
        const ambientLight = new THREE.AmbientLight(0x07111F, 1.5);
        this.scene.add(ambientLight);

        // Primary Emerald directional glow light
        this.pointLightEmerald = new THREE.PointLight(0x00C896, 3, 50);
        this.pointLightEmerald.position.set(15, 10, 10);
        this.scene.add(this.pointLightEmerald);

        // Secondary Cyan filling rim light
        this.pointLightCyan = new THREE.PointLight(0x00E5FF, 2, 50);
        this.pointLightCyan.position.set(-15, -10, 5);
        this.scene.add(this.pointLightCyan);
    }

    createDnaHelix() {
        this.dnaGroup = new THREE.Group();
        
        // Procedural construction parameters for double helix strands
        const totalNodes = 40;
        const radius = 4;
        const strandSpacing = 0.5;

        const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const lineGeometry = new THREE.CylinderGeometry(0.04, 0.04, 1, 8);

        // Shared premium glowing materials
        const emeraldMaterial = new THREE.MeshPhongMaterial({ color: 0x00C896, emissive: 0x003311, shininess: 30 });
        const cyanMaterial = new THREE.MeshPhongMaterial({ color: 0x00E5FF, emissive: 0x002233, shininess: 30 });

        this.helixNodes = [];

        for (let i = 0; i < totalNodes; i++) {
            const alpha = (i / totalNodes) * Math.PI * 4; // Helix winding factor
            const yPosition = (i - (totalNodes / 2)) * strandSpacing;

            // Strand 1 Node computation
            const x1 = Math.cos(alpha) * radius;
            const z1 = Math.sin(alpha) * radius;
            const node1 = new THREE.Mesh(sphereGeometry, emeraldMaterial);
            node1.position.set(x1, yPosition, z1);
            this.dnaGroup.add(node1);

            // Strand 2 Node computation (180 degrees phase shifted)
            const x2 = Math.cos(alpha + Math.PI) * radius;
            const z2 = Math.sin(alpha + Math.PI) * radius;
            const node2 = new THREE.Mesh(sphereGeometry, cyanMaterial);
            node2.position.set(x2, yPosition, z2);
            this.dnaGroup.add(node2);

            // Connecting chemical bond base pair rung logic
            const rungMesh = new THREE.Mesh(lineGeometry, new THREE.MeshPhongMaterial({ color: 0x2D3748, transparent: true, opacity: 0.4 }));
            rungMesh.position.set((x1 + x2) / 2, yPosition, (z1 + z2) / 2);
            
            // Orient rung along connecting trajectory axis vector
            rungMesh.scale.y = radius * 2;
            rungMesh.rotation.z = alpha;
            this.dnaGroup.add(rungMesh);
        }

        this.dnaGroup.position.set(12, 0, -5); // Offset to sit elegantly on the side of viewport layout
        this.scene.add(this.dnaGroup);
    }

    createFloatingCapsules() {
        this.capsulesArray = [];
        const totalCapsules = 6;

        for (let i = 0; i < totalCapsules; i++) {
            const capsuleContainer = new THREE.Group();

            // Construct capsule halves inside localized matrix space
            const capGeom = new THREE.SphereGeometry(0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            const bodyGeom = new THREE.CylinderGeometry(0.6, 0.6, 1.2, 16, 1, true);

            const greenMat = new THREE.MeshPhongMaterial({ color: 0x00C896, shininess: 40 });
            const whiteMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 40 });

            const topHalf = new THREE.Mesh(capGeom, greenMat);
            topHalf.position.y = 0.6;
            
            const bottomHalf = new THREE.Mesh(capGeom, whiteMat);
            bottomHalf.rotation.x = Math.PI;
            bottomHalf.position.y = -0.6;

            const midBody = new THREE.Mesh(bodyGeom, greenMat);

            capsuleContainer.add(topHalf);
            capsuleContainer.add(bottomHalf);
            capsuleContainer.add(midBody);

            // Disperse scatter coordinates within bounding limits
            capsuleContainer.position.set(
                (Math.random() - 0.5) * 35,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 15
            );

            capsuleContainer.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            
            // Assign distinct drift acceleration speeds
            capsuleContainer.userData = {
                driftSpeedY: 0.005 + Math.random() * 0.01,
                rotSpeedX: 0.002 + Math.random() * 0.005,
                rotSpeedY: 0.002 + Math.random() * 0.005,
                initialY: capsuleContainer.position.y
            };

            this.scene.add(capsuleContainer);
            this.capsulesArray.push(capsuleContainer);
        }
    }

    createLabParticles() {
        const particleCount = 120;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 50;     // X vector coordinates
            positions[i + 1] = (Math.random() - 0.5) * 30; // Y vector coordinates
            positions[i + 2] = (Math.random() - 0.5) * 30; // Z vector coordinates
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // Create high performance floating particle point map canvas texture textures
        const material = new THREE.PointsMaterial({
            color: 0x00E5FF,
            size: 0.15,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particleCloud = new THREE.Points(geometry, material);
        this.scene.add(this.particleCloud);
    }

    hookInteractionEvents() {
        window.addEventListener('mousemove', (e) => {
            // Standardize raw tracking vectors to screen space matrix [-1, 1]
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    loop() {
        requestAnimationFrame(() => this.loop());

        const clockTime = performance.now() * 0.001;

        // Rotate primary DNA model structural layout
        if (this.dnaGroup) {
            this.dnaGroup.rotation.y = clockTime * 0.15;
            this.dnaGroup.position.y = Math.sin(clockTime * 0.5) * 0.5;
        }

        // Handle animation matrices for individual floating medical capsules
        this.capsulesArray.forEach(capsule => {
            capsule.rotation.x += capsule.userData.rotSpeedX;
            capsule.rotation.y += capsule.userData.rotSpeedY;
            capsule.position.y = capsule.userData.initialY + Math.sin(clockTime * 2 + capsule.userData.initialY) * 0.6;
        });

        // Drift background particle points smoothly
        if (this.particleCloud) {
            this.particleCloud.rotation.y = clockTime * 0.02;
        }

        // Apply interpolated smooth damp mouse camera lag controls
        this.targetCameraX = this.mouseX * 3;
        this.targetCameraY = this.mouseY * 2;

        this.camera.position.x += (this.targetCameraX - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.targetCameraY - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }
}

// Instantiate engine pipeline on runtime initialization
window.addEventListener('DOMContentLoaded', () => {
    window.AppLabScene = new LaboratoryScene();
});
