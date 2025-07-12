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
        return this.transitions.opacity(element, 1, duration, easing);
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
    }
};

// Export the Animation module
window.Animation = Animation;
