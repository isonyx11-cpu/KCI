/**
 * Timing-Based Pharmaceutical Stabilization Gate Game Solution
 */

class TimingMatrixGame {
    constructor() {
        this.gameOverlay = document.getElementById('game-gate');
        this.portfolioWrapper = document.getElementById('main-portfolio');
        this.reactorButton = document.getElementById('reactorCapsule');
        this.statusLabel = document.getElementById('gameStatusLabel');

        if (!this.gameOverlay || !this.reactorButton) return;

        this.colorsArray = ['#FF3B30', '#FF9500', '#5856D6', '#00C896', '#00E5FF']; 
        this.currentIndex = 0;
        this.isGameActive = true;

        this.startColorCycleLoop();
        this.bindInteractionHook();
    }

    startColorCycleLoop() {
        if (!this.isGameActive) return;

        this.cycleInterval = setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.colorsArray.length;
            const currentActiveColor = this.colorsArray[this.currentIndex];

            gsap.to(this.reactorButton, {
                backgroundColor: currentActiveColor + "22", 
                borderColor: currentActiveColor,
                boxShadow: `0 0 25px ${currentActiveColor}`,
                duration: 0.2
            });
        }, 650);
    }

    bindInteractionHook() {
        this.reactorButton.addEventListener('click', () => {
            if (!this.isGameActive) return;

            if (this.colorsArray[this.currentIndex] === '#00C896') {
                this.executeAccessGrantedSequence();
            } else {
                this.executeAccessDeniedSequence();
            }
        });
    }

    executeAccessGrantedSequence() {
        this.isGameActive = false;
        clearInterval(this.cycleInterval);

        this.statusLabel.textContent = "Molecular Integrity Stabilized. Deactivating Bio-Locks...";
        this.statusLabel.style.color = "var(--primary-emerald)";

        gsap.to(this.reactorButton, { scale: 1.2, boxShadow: "0 0 40px #00C896", duration: 0.3 });

        const transitionTimeline = gsap.timeline();

        transitionTimeline.to(this.gameOverlay, {
            opacity: 0,
            y: -60,
            duration: 1,
            ease: "power4.inOut",
            onComplete: () => {
                this.gameOverlay.style.display = 'none';
            }
        });

        transitionTimeline.to(this.portfolioWrapper, {
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
            onStart: () => {
                this.portfolioWrapper.classList.remove('portfolio-hidden');
            }
        }, "-=0.6");
    }

    executeAccessDeniedSequence() {
        this.statusLabel.textContent = "Compound Unstable! Mismatched frequency profile. Recalibrating matrix...";
        this.statusLabel.style.color = "#FF3B30";

        gsap.fromTo(this.reactorButton, { x: -12 }, { x: 0, duration: 0.4, ease: "rough", clearProps: "x" });
    }
}

window.addEventListener('DOMContentLoaded', () => { new TimingMatrixGame(); });
