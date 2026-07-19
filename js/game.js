/**
 * UI Event Handler Interface Link
 * Connects the 3D Raycaster physics tracking metrics instantly to the layout DOM overlay elements.
 */

class ClinicalAccessGameBridge {
    constructor() {
        this.gameOverlay = document.getElementById('game-gate');
        this.portfolioWrapper = document.getElementById('main-portfolio');
        this.statusLabel = document.getElementById('gameStatusLabel');

        if (!this.gameOverlay) return;
        this.hookCustom3DEvents();
    }

    hookCustom3DEvents() {
        // Triggered inside pointerup vector calculations if capsule is within range of the target
        window.addEventListener('clinicalGameSuccess', () => {
            this.statusLabel.textContent = "Therapeutic Match Verified. Dissolving Laboratory Locks...";
            this.statusLabel.style.color = "var(--primary-emerald)";

            const transitionTimeline = gsap.timeline();
            
            transitionTimeline.to(this.gameOverlay, {
                opacity: 0,
                backdropFilter: "blur(0px)",
                scale: 1.05,
                duration: 1.2,
                ease: "power4.inOut",
                onComplete: () => {
                    this.gameOverlay.style.display = 'none';
                }
            });

            transitionTimeline.to(this.portfolioWrapper, {
                opacity: 1,
                scale: 1,
                duration: 1.4,
                ease: "power3.out",
                onStart: () => {
                    this.portfolioWrapper.classList.remove('portfolio-hidden');
                }
            }, "-=0.8");
        });

        window.addEventListener('clinicalGameFailed', () => {
            this.statusLabel.textContent = "Contraindication Warning! Capsule snapped back to tray. Retrying compound compound values...";
            this.statusLabel.style.color = "#FF3B30";
            
            gsap.fromTo(this.statusLabel, { x: -10 }, { x: 0, duration: 0.3, ease: "rough", clearProps: "x" });
        });
    }
}

window.addEventListener('DOMContentLoaded', () => { new ClinicalAccessGameBridge(); });
