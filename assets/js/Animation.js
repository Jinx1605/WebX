// Animation Module
const Animation = {
    // Easing functions library
    easings: {
        easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
        easeOutBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        easeOutQuart: 'cubic-bezier(0.25, 1, 0.5, 1)',
        easeInOutExpo: 'cubic-bezier(0.87, 0, 0.13, 1)'
    },

    // Core animation utilities
    transitions: {
        transform: (element, props, duration = 300, easing = 'easeOutExpo') => {
            const transition = `transform ${duration}ms ${Animation.easings[easing]}`;
            element.style.transition = transition;
            Object.assign(element.style, props);
            return new Promise(resolve => {
                const onEnd = () => {
                    element.removeEventListener('transitionend', onEnd);
                    resolve();
                };
                element.addEventListener('transitionend', onEnd);
            });
        },
        
        opacity: (element, value, duration = 300, easing = 'easeOutExpo') => {
            const transition = `opacity ${duration}ms ${Animation.easings[easing]}`;
            element.style.transition = transition;
            element.style.opacity = value;
            return new Promise(resolve => {
                const onEnd = () => {
                    element.removeEventListener('transitionend', onEnd);
                    resolve();
                };
                element.addEventListener('transitionend', onEnd);
            });
        }
    },

    // Animation effects
    puff(element, options = {}) {
        const defaults = {
            duration: 840,
            scale: 1.2,
            opacity: 0,
            easing: this.easings.easeOutExpo,
            onComplete: null
        };

        const settings = { ...defaults, ...options };
        
        // Store original styles
        const originalStyles = {
            transform: element.style.transform || '',
            opacity: element.style.opacity || '',
            transition: element.style.transition || '',
            transformOrigin: element.style.transformOrigin || '',
            pointerEvents: element.style.pointerEvents || '',
            filter: element.style.filter || ''
        };

        // Setup animation
        element.style.transformOrigin = '50% 50%';
        element.style.pointerEvents = 'none';
        element.style.transition = `all ${settings.duration}ms ${settings.easing}`;
        
        // Force a reflow
        element.offsetHeight;

        // Apply transforms
        element.style.transform = `scale(${settings.scale})`;
        element.style.opacity = '0';
        element.style.filter = 'blur(10px)';

        // Cleanup
        const handleTransitionEnd = () => {
            element.removeEventListener('transitionend', handleTransitionEnd);
            Object.assign(element.style, originalStyles);
            if (typeof settings.onComplete === 'function') {
                settings.onComplete();
            }
        };

        element.addEventListener('transitionend', handleTransitionEnd);
    },

    // Helper functions
    fadeIn(element, duration = 300, easing = 'easeOutExpo') {
        // First ensure the element is visible but transparent
        element.style.opacity = '0';
        element.style.display = 'block';
        
        // Force a reflow to ensure the initial state is applied before animation starts
        void element.offsetHeight;
        
        // Add a small delay to ensure the browser has applied the initial style
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                // Then animate the opacity
                this.transitions.opacity(element, 1, duration, easing).then(resolve);
            });
        });
    },

    fadeOut(element, duration = 300, easing = 'easeOutExpo') {
        return this.transitions.opacity(element, 0, duration, easing);
    },

    scale(element, scale = 1, duration = 300, easing = 'easeOutExpo') {
        return this.transitions.transform(element, { transform: `scale(${scale})` }, duration, easing);
    },

    /**
     * Creates a genie effect animation that shrinks an element to a target point
     * @param {HTMLElement} element - The element to animate
     * @param {Object} options - Animation options
     * @param {Object} options.target - Target coordinates {x, y} to shrink to
     * @param {number} options.duration - Animation duration in ms
     * @param {string} options.easing - Easing function name
     * @param {Function} options.onComplete - Callback when animation completes
     */
    genie(element, options = {}) {
        const defaults = {
            duration: 700,
            easing: this.easings.easeOutExpo,
            target: { x: 0, y: 0 },
            onComplete: null
        };

        const settings = { ...defaults, ...options };
        
        // Store original styles and dimensions
        const rect = element.getBoundingClientRect();
        const originalStyles = {
            transform: element.style.transform || '',
            opacity: element.style.opacity || '',
            transition: element.style.transition || '',
            transformOrigin: element.style.transformOrigin || '',
            width: element.style.width || '',
            height: element.style.height || '',
            position: element.style.position || ''
        };

        // Calculate transform origin and scale factors
        const startX = rect.left + (rect.width / 2);
        const startY = rect.top + (rect.height / 2);
        const translateX = settings.target.x - startX;
        const translateY = settings.target.y - startY;
        
        // Set initial styles
        element.style.position = 'fixed';
        element.style.width = rect.width + 'px';
        element.style.height = rect.height + 'px';
        element.style.left = rect.left + 'px';
        element.style.top = rect.top + 'px';
        element.style.transformOrigin = 'center bottom';
        element.style.transition = `transform ${settings.duration}ms ${settings.easing}, opacity ${settings.duration}ms ${settings.easing}`;

        // Force reflow
        element.offsetHeight;

        // Apply the genie transform
        element.style.transform = `
            translate(${translateX}px, ${translateY}px) 
            scale(0.01, 0.01) 
            perspective(500px) 
            rotateY(0deg)
        `;
        element.style.opacity = '0';

        // Cleanup
        const handleTransitionEnd = () => {
            element.removeEventListener('transitionend', handleTransitionEnd);
            Object.assign(element.style, originalStyles);
            if (typeof settings.onComplete === 'function') {
                settings.onComplete();
            }
        };

        element.addEventListener('transitionend', handleTransitionEnd);
    },

    // Progressbar animations
    progressbar: {
        /**
         * Creates a smooth progress bar animation
         * @param {HTMLElement} element - The progress bar element
         * @param {number} value - Progress value (0-100)
         * @param {Object} options - Animation options
         */
        update(element, value, options = {}) {
            const defaults = {
                duration: 400,
                easing: 'easeOutExpo',
                onComplete: null
            };

            const settings = { ...defaults, ...options };
            
            // Ensure value is within bounds
            value = Math.max(0, Math.min(100, value));
            
            // Get or create progress bar
            let progressBar = element.querySelector('.progress-bar');
            if (!progressBar) {
                progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                progressBar.style.cssText = `
                    width: 0%;
                    height: 100%;
                    background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
                    border-radius: inherit;
                    transition: width ${settings.duration}ms ${Animation.easings[settings.easing]};
                    position: relative;
                    overflow: hidden;
                `;
                element.appendChild(progressBar);
            }

            // Create shimmer effect
            let shimmer = progressBar.querySelector('.progress-shimmer');
            if (!shimmer && value > 0) {
                shimmer = document.createElement('div');
                shimmer.className = 'progress-shimmer';
                shimmer.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
                    animation: shimmer 2s infinite;
                `;
                progressBar.appendChild(shimmer);
            }

            // Animate progress
            progressBar.style.width = value + '%';

            // Handle completion
            if (settings.onComplete) {
                setTimeout(settings.onComplete, settings.duration);
            }

            return progressBar;
        },

        /**
         * Pulses the progress bar for attention
         * @param {HTMLElement} element - The progress bar element
         * @param {Object} options - Animation options
         */
        pulse(element, options = {}) {
            const defaults = {
                duration: 600,
                scale: 1.05,
                repeat: 1
            };

            const settings = { ...defaults, ...options };
            
            return new Promise(resolve => {
                let count = 0;
                const doPulse = () => {
                    Animation.scale(element, settings.scale, settings.duration / 2, 'easeOutExpo')
                        .then(() => Animation.scale(element, 1, settings.duration / 2, 'easeOutExpo'))
                        .then(() => {
                            count++;
                            if (count < settings.repeat) {
                                doPulse();
                            } else {
                                resolve();
                            }
                        });
                };
                doPulse();
            });
        },

        /**
         * Bounces the progress bar
         * @param {HTMLElement} element - The progress bar element
         * @param {Object} options - Animation options
         */
        bounce(element, options = {}) {
            const defaults = {
                duration: 500,
                height: 1.2
            };

            const settings = { ...defaults, ...options };
            
            return Animation.transitions.transform(element, 
                { transform: `scaleY(${settings.height})` }, 
                settings.duration / 2, 'easeOutBack')
                .then(() => Animation.transitions.transform(element, 
                    { transform: 'scaleY(1)' }, 
                    settings.duration / 2, 'easeOutBack'));
        },

        /**
         * Creates a completion celebration effect
         * @param {HTMLElement} element - The progress bar element
         * @param {Object} options - Animation options
         */
        complete(element, options = {}) {
            const defaults = {
                duration: 800,
                onComplete: null
            };

            const settings = { ...defaults, ...options };
            
            // First pulse
            return Animation.progressbar.pulse(element, { repeat: 2, duration: 300 })
                .then(() => {
                    // Then fade out
                    return Animation.fadeOut(element, settings.duration, 'easeOutExpo');
                })
                .then(() => {
                    if (settings.onComplete) {
                        settings.onComplete();
                    }
                });
        }
    },

    // Loading text animations
    loadingText: {
        /**
         * Creates a typing effect for loading text
         * @param {HTMLElement} element - The text element
         * @param {string} text - The text to type
         * @param {Object} options - Animation options
         */
        typewriter(element, text, options = {}) {
            const defaults = {
                speed: 100,
                onComplete: null
            };

            const settings = { ...defaults, ...options };
            
            return new Promise(resolve => {
                let i = 0;
                element.textContent = '';
                
                const typeChar = () => {
                    if (i < text.length) {
                        element.textContent += text.charAt(i);
                        i++;
                        setTimeout(typeChar, settings.speed);
                    } else {
                        if (settings.onComplete) settings.onComplete();
                        resolve();
                    }
                };
                
                typeChar();
            });
        },

        /**
         * Creates animated dots for loading
         * @param {HTMLElement} element - The text element
         * @param {Object} options - Animation options
         */
        dots(element, options = {}) {
            const defaults = {
                baseText: 'Loading',
                maxDots: 3,
                speed: 500
            };

            const settings = { ...defaults, ...options };
            
            let dotCount = 0;
            const interval = setInterval(() => {
                dotCount = (dotCount + 1) % (settings.maxDots + 1);
                element.textContent = settings.baseText + '.'.repeat(dotCount);
            }, settings.speed);

            return {
                stop: () => clearInterval(interval)
            };
        }
    }
};

// Export the Animation module
window.Animation = Animation;
