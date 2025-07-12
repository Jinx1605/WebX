// Utility functions for WebX UI components
window.Utils = {
  // Query shorthand utility
  $(selector, context = document) {
    const elements = context.querySelectorAll(selector);
    return elements.length === 1 ? elements[0] : Array.from(elements);
  },

  // Single element query shorthand
  $$(selector, context = document) {
    return context.querySelector(selector);
  },

  // Get element dimensions including offset
  getDimensions(element) {
    if (!element) return { width: 0, height: 0 };
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width || element.offsetWidth,
      height: rect.height || element.offsetHeight,
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX
    };
  },

  // Static counter for z-index management 
  _zIndexCounter: 10,

  // Get next z-index value
  getNextZIndex() {
    return ++this._zIndexCounter;
  },

  // Drag and Resize utility
  DragResize: {
    init(element, options = {}) {
      const defaults = {
        handle: element,
        containment: document.body,
        minWidth: 500,
        minHeight: 135,
        zIndex: 10,
        onDragStart: null,
        onDrag: null,
        onDragEnd: null,
        onResizeStart: null,
        onResize: null,
        onResizeEnd: null
      };

      const settings = { ...defaults, ...options };
      
      // Set initial z-index if not already set
      if (!element.style.zIndex) {
        element.style.zIndex = settings.zIndex;
      }

      // Initialize dragging
      this._initDrag(element, settings);

      // Initialize resizing if enabled
      if (settings.resizable !== false) {
        this._initResize(element, settings);
      }

      return {
        destroy: () => {
          this._removeDrag(element);
          this._removeResize(element);
        },
        bringToFront: () => {
          element.style.zIndex = Utils.getNextZIndex();
        }
      };
    },

    _initDrag(element, settings) {
      const handle = settings.handle;
      let isDragging = false;
      let startX, startY, initialLeft, initialTop;

      const onMouseDown = (e) => {
        if (e.button !== 0) return; // Only left mouse button
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = element.offsetLeft;
        initialTop = element.offsetTop;

        // Bring window to front
        element.style.zIndex = Utils.getNextZIndex();

        // Call onDragStart callback
        settings.onDragStart?.();

        // Add active class
        element.classList.add('dragging');

        // Prevent text selection
        e.preventDefault();
      };

      const onMouseMove = (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        // Apply containment
        if (settings.containment) {
          const container = settings.containment.getBoundingClientRect();
          const elem = element.getBoundingClientRect();

          newLeft = Math.max(0, Math.min(newLeft, container.width - elem.width));
          newTop = Math.max(0, Math.min(newTop, container.height - elem.height));
        }

        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;

        // Call onDrag callback
        settings.onDrag?.();
      };

      const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;

        // Remove active class
        element.classList.remove('dragging');

        // Call onDragEnd callback
        settings.onDragEnd?.();
      };

      handle.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      // Store event listeners for cleanup
      element._dragListeners = {
        mousedown: onMouseDown,
        mousemove: onMouseMove,
        mouseup: onMouseUp
      };
    },

    _initResize(element, settings) {
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      resizeHandle.style.cssText = `
        position: absolute;
        bottom: 0;
        right: 0;
        width: 15px;
        height: 15px;
        cursor: se-resize;
        z-index: 1000;
      `;
      element.appendChild(resizeHandle);

      let isResizing = false;
      let startX, startY, startW, startH;

      const onMouseDown = (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startW = element.offsetWidth;
        startH = element.offsetHeight;

        // Call onResizeStart callback
        settings.onResizeStart?.();

        // Add active class
        element.classList.add('resizing');
        e.preventDefault();
      };

      const onMouseMove = (e) => {
        if (!isResizing) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const newWidth = Math.max(settings.minWidth, startW + dx);
        const newHeight = Math.max(settings.minHeight, startH + dy);

        element.style.width = `${newWidth}px`;
        element.style.height = `${newHeight}px`;

        // Resize content if specified
        if (settings.alsoResize) {
          const elements = element.querySelectorAll(settings.alsoResize);
          elements.forEach(el => {
            el.style.width = '100%';
            el.style.height = `${newHeight - settings.contentOffset}px`;
          });
        }

        // Call onResize callback
        settings.onResize?.();
      };

      const onMouseUp = () => {
        if (!isResizing) return;
        isResizing = false;

        // Remove active class
        element.classList.remove('resizing');

        // Call onResizeEnd callback
        settings.onResizeEnd?.();
      };

      resizeHandle.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      // Store event listeners for cleanup
      element._resizeListeners = {
        mousedown: onMouseDown,
        mousemove: onMouseMove,
        mouseup: onMouseUp,
        handle: resizeHandle
      };
    },

    _removeDrag(element) {
      if (element._dragListeners) {
        const { mousedown, mousemove, mouseup } = element._dragListeners;
        element.removeEventListener('mousedown', mousedown);
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        delete element._dragListeners;
      }
    },

    _removeResize(element) {
      if (element._resizeListeners) {
        const { mousedown, mousemove, mouseup, handle } = element._resizeListeners;
        handle.removeEventListener('mousedown', mousedown);
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
        handle.remove();
        delete element._resizeListeners;
      }
    }
  }
};
