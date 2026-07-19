/**
 * Advanced Pointer-Tracking Laboratory Entry Game
 * Uses high-performance absolute matrix calculations instead of fragile HTML5 Drag-and-Drop.
 */

class PhysicsAccessGame {
    constructor() {
        this.gameOverlay = document.getElementById('game-gate');
        this.portfolioWrapper = document.getElementById('main-portfolio');
        this.correctPill = document.getElementById('correctPill');
        this.vialTarget = document.getElementById('vialTarget');
        this.statusLabel = document.getElementById('gameStatusLabel');

        if (!this.gameOverlay || !this.correctPill || !this.vialTarget) return;

        this.isTracking = false;
        this.startX = 0;
        this.startY = 0;
        this.transformX = 0;
        this.transformY = 0;

        this.setupPointerInteractions();
    }

    setupPointerInteractions() {
        // Enforce smooth transition styles on the capsule through CSS injection
        this.correctPill.style.touchAction = 'none'; // Prevents mobile screen scrolling while dragging
        this.correctPill.style.willChange = 'transform';

        // 1. Capture Pointer Down (Click or Touch)
        this.correctPill.addEventListener('pointerdown', (e) => {
            this.isTracking = true;
            this.correctPill.setPointerCapture(e.pointerId);
            
            // Calculate relative starting offset
            this.startX = e.clientX - this.transformX;
            this.startY = e.clientY - this.transformY;

            gsap.to(this.correctPill, { scale: 1.1, boxShadow: "0 8px 25px rgba(0, 200, 150, 0.4)", duration: 0.2 });
            this.statusLabel.textContent = "Analyzing compound movement...";
            this.statusLabel.style.color = "var(--accent-cyan)";
        });

        // 2. Track Pointer Movement
        this.correctPill.addEventListener('pointermove', (e) => {
            if (!this.isTracking) return;

            // Compute distance delta
            this.transformX = e.clientX - this.startX;
            this.transformY = e.clientY - this.startY;

            // Instantly translate the element coordinate spaces via hardware acceleration
            this.correctPill.style.transform = `translate3d(${this.transformX}px, ${this.transformY}px, 0) scale(1.1)`;

            // Interactive hit-test proximity check
            if (this.checkCollisionMetrics()) {
                this.vialTarget.style.borderColor = "var(--primary-emerald)";
                this.vialTarget.style.background = "rgba(0, 200, 150, 0.1)";
            } else {
                this.vialTarget.style.borderColor = "rgba(0, 200, 150, 0.4)";
                this.vialTarget.style.background = "rgba(0, 200, 150, 0.03)";
            }
        });

        // 3. Pointer Release (Drop Validation)
        this.correctPill.addEventListener('pointerup', (e) => {
            if (!this.isTracking) return;
            this.isTracking = false;
            this.correctPill.releasePointerCapture(e.pointerId);

            if (this.checkCollisionMetrics()) {
                this.executeSuccessSequence();
            } else {
                this.executeFailureSequence();
            }
        });
    }

    checkCollisionMetrics() {
        const pillRect = this.correctPill.getBoundingClientRect();
        const vialRect = this.vialTarget.getBoundingClientRect();

        // High precision bounding-box overlapping calculation
        return !(
            pillRect.right < vialRect.left ||
            pillRect.left > vialRect.right ||
            pillRect.bottom < vialRect.top ||
            pillRect.top > vialRect.bottom
        );
    }

    executeSuccessSequence() {
        this.statusLabel.textContent = "Therapeutic Match Verified. Opening Clinical Core System...";
        this.statusLabel.style.color = "var(--primary-emerald)";
        this.vialTarget.style.background = "rgba(0, 200, 150, 0.25)";

        const timeline = gsap.timeline();

        // Melt capsule down into the beaker layout
        timeline.to(this.correctPill, {
            scale: 0,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in"
        });

        // Dissolve glass screen overlay seamlessly
        timeline.to(this.gameOverlay, {
            opacity: 0,
            y: -50,
            duration: 1,
            ease: "power4.inOut",
            onComplete: () => {
                this.gameOverlay.style.display = 'none';
            }
        }, "-=0.2");

        // Materialize portfolio interface gracefully
        timeline.to(this.portfolioWrapper, {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
            onStart: () => {
                this.portfolioWrapper.classList.remove('portfolio-hidden');
            }
        }, "-=0.6");
    }

    executeFailureSequence() {
        this.statusLabel.textContent = "Mismatched target. Resetting tracking array...";
        this.statusLabel.style.color = "#FF3B30";
        this.vialTarget.style.borderColor = "rgba(0, 200, 150, 0.4)";
        this.vialTarget.style.background = "rgba(0, 200, 150, 0.03)";

        // Reset variables
        this.transformX = 0;
        this.transformY = 0;

        // Snap back home utilizing a clean elastic bounce formula
        gsap.to(this.correctPill, {
            x: 0,
            y: 0,
            scale: 1,
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            duration: 0.6,
            ease: "elastic.out(1, 0.6)",
            onComplete: () => {
                this.correctPill.style.transform = "none";
                this.statusLabel.textContent = "Awaiting Match...";
                this.statusLabel.style.color = "var(--text-muted)";
            }
        });
    }
}

// Instantiate engine pipeline on lifecycle start
window.addEventListener('DOMContentLoaded', () => {
    new PhysicsAccessGame();
});
