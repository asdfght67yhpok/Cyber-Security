/**
 * Dark Pattern Shield - Overlay Manager
 * Handles visual warnings and element highlighting
 */

const OverlayManager = {
    // Overlay state
    isEnabled: true,
    activeHighlights: new Map(),
    warningBadge: null,
    tooltipElement: null,

    // Colors for severity
    severityColors: {
        high: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#fca5a5' },
        medium: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#fcd34d' },
        low: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#6ee7b7' }
    },

    /**
     * Initialize overlay system
     */
    init() {
        this.createStyles();
        this.createTooltip();
        this.createWarningBadge();
    },

    /**
     * Inject CSS styles
     */
    createStyles() {
        if (document.getElementById('dp-shield-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'dp-shield-styles';
        styles.textContent = `
      /* Dark Pattern Shield Overlay Styles */
      
      .dp-highlight {
        position: relative !important;
        outline: 2px solid var(--dp-border-color, #ef4444) !important;
        outline-offset: 2px !important;
        background: var(--dp-bg-color, rgba(239, 68, 68, 0.1)) !important;
        transition: all 0.3s ease !important;
        z-index: 9998 !important;
      }

      .dp-highlight::before {
        content: '⚠️ ' attr(data-dp-type);
        position: absolute;
        top: -28px;
        left: 0;
        padding: 4px 10px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 11px;
        font-weight: 600;
        border-radius: 4px;
        white-space: nowrap;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        animation: dp-fade-in 0.3s ease;
      }

      .dp-highlight-pulse {
        animation: dp-pulse 2s ease-in-out infinite;
      }

      @keyframes dp-pulse {
        0%, 100% { outline-color: var(--dp-border-color, #ef4444); }
        50% { outline-color: rgba(239, 68, 68, 0.4); }
      }

      @keyframes dp-fade-in {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Warning Badge */
      .dp-warning-badge {
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 18px;
        background: linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(20px);
        z-index: 10000;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        transition: all 0.3s ease;
        cursor: pointer;
        animation: dp-slide-in 0.5s ease;
      }

      .dp-warning-badge:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 92, 246, 0.2);
        border-color: rgba(139, 92, 246, 0.5);
      }

      .dp-warning-badge.hidden {
        transform: translateX(calc(100% + 40px));
        opacity: 0;
      }

      @keyframes dp-slide-in {
        from { transform: translateX(calc(100% + 40px)); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }

      .dp-badge-icon {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
        border-radius: 8px;
        font-size: 16px;
      }

      .dp-badge-content {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .dp-badge-title {
        font-size: 13px;
        font-weight: 600;
        color: #fff;
      }

      .dp-badge-count {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.7);
      }

      .dp-badge-close {
        margin-left: 8px;
        padding: 4px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .dp-badge-close:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      /* Tooltip */
      .dp-tooltip {
        position: fixed;
        max-width: 300px;
        padding: 12px 16px;
        background: linear-gradient(135deg, rgba(30, 30, 50, 0.98) 0%, rgba(20, 20, 40, 0.98) 100%);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(20px);
        z-index: 10001;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        pointer-events: none;
        opacity: 0;
        transform: translateY(5px);
        transition: all 0.2s ease;
      }

      .dp-tooltip.visible {
        opacity: 1;
        transform: translateY(0);
      }

      .dp-tooltip-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .dp-tooltip-type {
        font-size: 13px;
        font-weight: 600;
        color: #f87171;
      }

      .dp-tooltip-severity {
        padding: 2px 8px;
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        border-radius: 4px;
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
      }

      .dp-tooltip-description {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.5;
        margin-bottom: 8px;
      }

      .dp-tooltip-text {
        font-size: 11px;
        color: rgba(255, 255, 255, 0.5);
        font-style: italic;
        padding: 8px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 6px;
        word-break: break-word;
      }

      .dp-tooltip-confidence {
        margin-top: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .dp-confidence-bar {
        flex: 1;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
      }

      .dp-confidence-fill {
        height: 100%;
        background: linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ef4444 100%);
        border-radius: 2px;
        transition: width 0.3s ease;
      }

      .dp-confidence-value {
        font-size: 11px;
        font-weight: 600;
        color: #fca5a5;
      }
    `;
        document.head.appendChild(styles);
    },

    /**
     * Create tooltip element
     */
    createTooltip() {
        if (this.tooltipElement) return;

        this.tooltipElement = document.createElement('div');
        this.tooltipElement.className = 'dp-tooltip';
        this.tooltipElement.innerHTML = `
      <div class="dp-tooltip-header">
        <span class="dp-tooltip-type"></span>
        <span class="dp-tooltip-severity"></span>
      </div>
      <div class="dp-tooltip-description"></div>
      <div class="dp-tooltip-text"></div>
      <div class="dp-tooltip-confidence">
        <div class="dp-confidence-bar">
          <div class="dp-confidence-fill"></div>
        </div>
        <span class="dp-confidence-value"></span>
      </div>
    `;
        document.body.appendChild(this.tooltipElement);
    },

    /**
     * Create warning badge
     */
    createWarningBadge() {
        if (this.warningBadge) return;

        this.warningBadge = document.createElement('div');
        this.warningBadge.className = 'dp-warning-badge hidden';
        this.warningBadge.innerHTML = `
      <div class="dp-badge-icon">🛡️</div>
      <div class="dp-badge-content">
        <div class="dp-badge-title">Dark Patterns Detected</div>
        <div class="dp-badge-count">0 potential threats found</div>
      </div>
      <button class="dp-badge-close">✕</button>
    `;
        document.body.appendChild(this.warningBadge);

        // Event listeners
        this.warningBadge.addEventListener('click', (e) => {
            if (e.target.classList.contains('dp-badge-close')) {
                this.hideBadge();
            } else {
                this.scrollToNextHighlight();
            }
        });
    },

    /**
     * Highlight detected elements
     */
    highlightThreats(threats) {
        if (!this.isEnabled) return;

        // Clear old highlights
        this.clearHighlights();

        threats.forEach((threat, index) => {
            if (threat.element && document.contains(threat.element)) {
                this.highlightElement(threat.element, threat);
            }
        });

        // Update badge
        if (threats.length > 0) {
            this.showBadge(threats.length);
        } else {
            this.hideBadge();
        }
    },

    /**
     * Highlight single element
     */
    highlightElement(element, threat) {
        const colors = this.severityColors[threat.severity] || this.severityColors.medium;

        element.classList.add('dp-highlight');
        element.setAttribute('data-dp-type', threat.type);
        element.style.setProperty('--dp-border-color', colors.border);
        element.style.setProperty('--dp-bg-color', colors.bg);

        // Store threat info
        this.activeHighlights.set(element, threat);

        // Add hover listeners
        element.addEventListener('mouseenter', (e) => this.showTooltip(e, threat));
        element.addEventListener('mouseleave', () => this.hideTooltip());
    },

    /**
     * Clear all highlights
     */
    clearHighlights() {
        for (const [element] of this.activeHighlights) {
            if (document.contains(element)) {
                element.classList.remove('dp-highlight', 'dp-highlight-pulse');
                element.removeAttribute('data-dp-type');
                element.style.removeProperty('--dp-border-color');
                element.style.removeProperty('--dp-bg-color');
            }
        }
        this.activeHighlights.clear();
    },

    /**
     * Show tooltip
     */
    showTooltip(event, threat) {
        if (!this.tooltipElement) return;

        const tooltip = this.tooltipElement;
        tooltip.querySelector('.dp-tooltip-type').textContent = threat.type;
        tooltip.querySelector('.dp-tooltip-severity').textContent = threat.severity;
        tooltip.querySelector('.dp-tooltip-description').textContent = threat.description;
        tooltip.querySelector('.dp-tooltip-text').textContent = `"${threat.text}"`;
        tooltip.querySelector('.dp-confidence-fill').style.width = `${threat.confidence}%`;
        tooltip.querySelector('.dp-confidence-value').textContent = `${threat.confidence}%`;

        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        let top = rect.bottom + 10;
        let left = rect.left;

        // Keep in viewport
        if (top + 200 > window.innerHeight) {
            top = rect.top - 200;
        }
        if (left + 300 > window.innerWidth) {
            left = window.innerWidth - 320;
        }

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.classList.add('visible');
    },

    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.tooltipElement) {
            this.tooltipElement.classList.remove('visible');
        }
    },

    /**
     * Show warning badge
     */
    showBadge(count) {
        if (!this.warningBadge) return;

        this.warningBadge.querySelector('.dp-badge-count').textContent =
            `${count} potential threat${count !== 1 ? 's' : ''} found`;
        this.warningBadge.classList.remove('hidden');
    },

    /**
     * Hide warning badge
     */
    hideBadge() {
        if (this.warningBadge) {
            this.warningBadge.classList.add('hidden');
        }
    },

    /**
     * Scroll to next highlighted element
     */
    scrollToNextHighlight() {
        const highlights = Array.from(this.activeHighlights.keys());
        if (highlights.length === 0) return;

        // Find next element below current scroll
        const scrollTop = window.scrollY;
        let nextElement = null;

        for (const element of highlights) {
            const rect = element.getBoundingClientRect();
            if (rect.top > 100) { // Below current view
                nextElement = element;
                break;
            }
        }

        // If none found, go to first
        if (!nextElement) {
            nextElement = highlights[0];
        }

        // Scroll and pulse
        nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        nextElement.classList.add('dp-highlight-pulse');
        setTimeout(() => {
            nextElement.classList.remove('dp-highlight-pulse');
        }, 2000);
    },

    /**
     * Highlight specific element by ID
     */
    highlightById(elementId) {
        console.log('🛡️ Dark Pattern Shield: Looking for element:', elementId);

        // First try to find in activeHighlights
        for (const [element, threat] of this.activeHighlights) {
            if (threat.elementId === elementId) {
                console.log('🛡️ Found element in activeHighlights');
                this.scrollAndPulse(element);
                return;
            }
        }

        // If not found, try to find by ID in DOM
        let element = document.getElementById(elementId);

        // If still not found, try data attribute
        if (!element) {
            element = document.querySelector(`[data-dp-id="${elementId}"]`);
        }

        // If still not found, try finding highlighted elements
        if (!element) {
            const highlightedElements = document.querySelectorAll('.dp-highlight');
            for (const el of highlightedElements) {
                if (el.getAttribute('data-dp-type')) {
                    element = el;
                    break;
                }
            }
        }

        if (element) {
            console.log('🛡️ Found element in DOM');
            this.scrollAndPulse(element);
        } else {
            console.log('🛡️ Element not found, scrolling to first highlight');
            // Fallback: scroll to first highlighted element
            const firstHighlight = document.querySelector('.dp-highlight');
            if (firstHighlight) {
                this.scrollAndPulse(firstHighlight);
            }
        }
    },

    /**
     * Scroll to element and add pulse animation
     */
    scrollAndPulse(element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('dp-highlight-pulse');

        // Add temporary strong highlight
        element.style.outline = '4px solid #ef4444';
        element.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.5)';

        setTimeout(() => {
            element.classList.remove('dp-highlight-pulse');
            element.style.outline = '';
            element.style.boxShadow = '';
        }, 3000);
    },

    /**
     * Toggle overlay visibility
     */
    toggle(show) {
        this.isEnabled = show;
        if (!show) {
            this.clearHighlights();
            this.hideBadge();
        }
    },

    /**
     * Destroy overlay system
     */
    destroy() {
        this.clearHighlights();

        const styles = document.getElementById('dp-shield-styles');
        if (styles) styles.remove();

        if (this.tooltipElement) {
            this.tooltipElement.remove();
            this.tooltipElement = null;
        }

        if (this.warningBadge) {
            this.warningBadge.remove();
            this.warningBadge = null;
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.OverlayManager = OverlayManager;
}
