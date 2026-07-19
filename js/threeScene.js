/**
 * Three.js 3D Personal Portfolio & Interactive Game Engine
 * Features a pure 3D Raycaster Drag-and-Drop system for the introductory game.
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
        
        // Game-specific 3D Meshes
        this.gameActive = true;
        this.create3DGameElements();
        
        this.hookInteractionEvents();
        this.loop();
    }

    initEngine() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x030811, 0.015);

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 25);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x030811, 1);
        this.container.appendChild(this.renderer.domElement);

        // Raycasting & Drag Interaction States
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Flat movement plane at z=0
        this.intersection = new THREE.Vector3();
        
        this.isDragging = false;
        this.selectedObject = null;

        this.mouseX = 0;
        this.mouseY = 0;
    }

    createLighting() {
        const ambientLight = new THREE.AmbientLight(0x07111F, 1.5);
        this.scene.add(ambientLight);

        this.pointLightEmerald = new THREE.PointLight(0x00C896, 3, 50);
        this.pointLightEmerald.position.set(15, 10, 10);
        this.scene.add(this.pointLightEmerald);

        this.pointLightCyan = new THREE.PointLight(0x00E5FF, 2, 50);
        this.pointLightCyan.position.set(-15, -10, 5);
        this.scene.add(this.pointLightCyan);
    }

    create3DGameElements() {
        this.gameGroup = new THREE.Group();

        // 1. Create the 3D Rx Prescription Vial (Target)
        const vialGeom = new THREE.CylinderGeometry(2, 2, 5, 32, 1, true);
        const vialMat = new THREE.MeshPhongMaterial({ 
            color: 0x00E5FF, 
            transparent: true, 
            opacity: 0.3, 
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        this.vialMesh = new THREE.Mesh(vialGeom, vialMat);
        this.vialMesh.position.set(-6, 0, 0);
        this.vialMesh.name = "vialTarget";
        this.gameGroup.add(this.vialMesh);

        // 2. Create the Correct Treatment Capsule (Draggable)
        this.capsuleMesh = new THREE.Group();
        this.capsuleMesh.name = "correctPill";
        
        const capGeom = new THREE.SphereGeometry(0.8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const bodyGeom = new THREE.CylinderGeometry(0.8, 0.8, 1.4, 16, 1, true);
        const greenMat = new THREE.MeshPhongMaterial({ color: 0x00C896, shininess: 50 });
        const whiteMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, shininess: 50 });

        const top = new THREE.Mesh(capGeom, greenMat); top.position.y = 0.7;
        const bottom = new THREE.Mesh(capGeom, whiteMat); bottom.rotation.x = Math.PI; bottom.position.y = -0.7;
        const body = new THREE.Mesh(bodyGeom, greenMat);

        this.capsuleMesh.add(top, bottom, body);
        this.capsuleMesh.position.set(6, 0, 0); // Positioned across from the vial
        this.gameGroup.add(this.capsuleMesh);

        this.scene.add(this.gameGroup);
    }

    createDnaHelix() {
        this.dnaGroup = new THREE.Group();
        const totalNodes = 40;
        const radius = 4;
        const strandSpacing = 0.5;

        const sphereGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const lineGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1, 8);
        const emeraldMaterial = new THREE.MeshPhongMaterial({ color: 0x00C896 });
        const cyanMaterial = new THREE.MeshPhongMaterial({ color: 0x00E5FF });

        for (let i = 0; i < totalNodes; i++) {
            const alpha = (i / totalNodes) * Math.PI * 4;
            const yPosition = (i - (totalNodes / 2)) * strandSpacing;

            const x1 = Math.cos(alpha) * radius; const z1 = Math.sin(alpha) * radius;
            const node1 = new THREE.Mesh(sphereGeometry, emeraldMaterial);
            node1.position.set(x1, yPosition, z1);
            this.dnaGroup.add(node1);

            const x2 = Math.cos(alpha + Math.PI) * radius; const z2 = Math.sin(alpha + Math.PI) * radius;
            const node2 = new THREE.Mesh(sphereGeometry, cyanMaterial);
            node2.position.set(x2, yPosition, z2);
            this.dnaGroup.add(node2);

            const rungMesh = new THREE.Mesh(lineGeometry, new THREE.MeshPhongMaterial({ color: 0x2D3748, transparent: true, opacity: 0.2 }));
            rungMesh.position.set((x1 + x2) / 2, yPosition, (z1 + z2) / 2);
            rungMesh.scale.y = radius * 2;
            rungMesh.rotation.z = alpha;
            this.dnaGroup.add(rungMesh);
        }

        this.dnaGroup.position.set(14, -2, -5);
        this.scene.add(this.dnaGroup);
    }

    createFloatingCapsules() {
        this.capsulesArray = [];
        for (let i = 0; i < 6; i++) {
            const cap = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.8, 4, 8), new THREE.MeshPhongMaterial({ color: 0x07111F }));
            cap.position.set((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 25, (Math.random() - 0.5) * 20);
            cap.userData = { driftY: 0.005 + Math.random() * 0.01, initialY: cap.position.y };
            this.scene.add(cap);
            this.capsulesArray.push(cap);
        }
    }

    createLabParticles() {
        const particleCount = 100;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++) { positions[i] = (Math.random() - 0.5) * 60; }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particleCloud = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x00E5FF, size: 0.1, transparent: true, opacity: 0.5 }));
        this.scene.add(this.particleCloud);
    }

    hookInteractionEvents() {
        window.addEventListener('pointermove', (e) => {
            this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
            
            this.pointer.x = this.mouseX;
            this.pointer.y = this.mouseY;

            if (this.isDragging && this.selectedObject) {
                this.raycaster.setFromCamera(this.pointer, this.camera);
                if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
                    this.selectedObject.position.copy(this.intersection);
                }
            }
        });

        window.addEventListener('pointerdown', () => {
            if (!this.gameActive) return;
            this.raycaster.setFromCamera(this.pointer, this.camera);
            const intersects = this.raycaster.intersectObjects(this.gameGroup.children, true);
            
            if (intersects.length > 0) {
                // Crawl up to find the group structural root container
                let rootObj = intersects[0].object;
                while (rootObj.parent && rootObj.parent !== this.gameGroup) {
                    rootObj = rootObj.parent;
                }
                if (rootObj.name === "correctPill") {
                    this.isDragging = true;
                    this.selectedObject = rootObj;
                    this.container.style.cursor = 'grabbing';
                }
            }
        });

        window.addEventListener('pointerup', () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.container.style.cursor = 'none';

            // Spatial Distance Target Verification Check
            const distance = this.capsuleMesh.position.distanceTo(this.vialMesh.position);
            const dropThreshold = 3.5; 

            if (distance < dropThreshold) {
                this.gameActive = false;
                window.dispatchEvent(new CustomEvent('clinicalGameSuccess'));
                
                // Beautiful Animate Out of 3D Game items
                gsap.to(this.gameGroup.position, { y: -30, duration: 1, ease: "power3.in" });
            } else {
                // Snap pill cleanly back to original staging area layout
                gsap.to(this.capsuleMesh.position, { x: 6, y: 0, z: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
                window.dispatchEvent(new CustomEvent('clinicalGameFailed'));
            }
            this.selectedObject = null;
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    loop() {
        requestAnimationFrame(() => this.loop());
        const time = performance.now() * 0.001;

        if (this.dnaGroup) this.dnaGroup.rotation.y = time * 0.12;
        if (this.particleCloud) this.particleCloud.rotation.y = time * 0.01;

        this.capsulesArray.forEach(cap => {
            cap.position.y = cap.userData.initialY + Math.sin(time + cap.userData.initialY) * 0.4;
        });

        // Soft cursor parallax tracking adjustments
        const targetX = this.mouseX * 2;
        const targetY = this.mouseY * 1.5;
        this.camera.position.x += (targetX - this.camera.position.x) * 0.05;
        this.camera.position.y += (targetY - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener('DOMContentLoaded', () => { window.AppLabScene = new LaboratoryScene(); });
