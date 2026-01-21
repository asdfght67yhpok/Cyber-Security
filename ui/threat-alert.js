/**
 * Dark Pattern Shield - Threat Alert Manager
 * Shows prominent warnings for phishing attempts and dangerous websites
 */

const ThreatAlertManager = {
    alertElement: null,
    isShowing: false,
    currentThreat: null,

    /**
     * Initialize the threat alert system
     */
    init() {
        this.createAlertElement();
        this.injectStyles();
    },

    /**
     * Inject CSS styles for the threat alert
     */
    injectStyles() {
        if (document.getElementById('dp-threat-alert-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'dp-threat-alert-styles';
        styles.textContent = `
            /* Threat Alert Overlay */
            .dp-threat-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #000000;
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                opacity: 0;
                animation: dp-threat-fade-in 0.3s ease forwards;
                box-shadow: inset 0 0 0 8px #ff0000,
                            inset 0 0 40px rgba(255, 0, 0, 0.5);
            }

            .dp-threat-overlay::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                border: 8px solid #ff0000;
                pointer-events: none;
                animation: dp-border-pulse 2s ease-in-out infinite;
                box-shadow: 0 0 40px rgba(255, 0, 0, 0.8),
                            inset 0 0 40px rgba(255, 0, 0, 0.4);
            }

            .dp-threat-overlay::after {
                content: '⚠️ DANGER ⚠️';
                position: absolute;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                font-family: 'Inter', -apple-system, sans-serif;
                font-size: 24px;
                font-weight: 900;
                color: #ff0000;
                text-shadow: 0 0 20px rgba(255, 0, 0, 1);
                letter-spacing: 4px;
                animation: dp-danger-pulse 1s ease-in-out infinite;
                z-index: 1;
            }

            @keyframes dp-border-pulse {
                0%, 100% { 
                    border-color: #ff0000;
                    box-shadow: 0 0 40px rgba(255, 0, 0, 0.8),
                                inset 0 0 40px rgba(255, 0, 0, 0.4);
                }
                50% { 
                    border-color: #ff4444;
                    box-shadow: 0 0 80px rgba(255, 0, 0, 1),
                                inset 0 0 80px rgba(255, 0, 0, 0.6);
                }
            }

            @keyframes dp-danger-pulse {
                0%, 100% { 
                    opacity: 0.8;
                    transform: translateX(-50%) scale(1);
                    text-shadow: 0 0 20px rgba(255, 0, 0, 1);
                }
                50% { 
                    opacity: 1;
                    transform: translateX(-50%) scale(1.05);
                    text-shadow: 0 0 40px rgba(255, 0, 0, 1), 0 0 60px rgba(255, 0, 0, 0.8);
                }
            }

            @keyframes dp-threat-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .dp-threat-card {
                background: #000000;
                border: 4px solid #ff0000;
                border-radius: 20px;
                max-width: 600px;
                width: 100%;
                padding: 40px;
                position: relative;
                box-shadow: 0 0 100px rgba(255, 0, 0, 0.8),
                            inset 0 0 80px rgba(255, 0, 0, 0.15);
                animation: dp-threat-slide-up 0.4s ease forwards, dp-threat-glow 2s ease-in-out infinite;
                transform: translateY(30px);
                z-index: 2;
            }

            .dp-threat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 8px;
                background: repeating-linear-gradient(
                    45deg,
                    #ff0000,
                    #ff0000 10px,
                    #000000 10px,
                    #000000 20px
                );
                border-radius: 20px 20px 0 0;
                animation: dp-stripe-move 1s linear infinite;
            }

            @keyframes dp-stripe-move {
                0% { background-position: 0 0; }
                100% { background-position: 28px 0; }
            }

            @keyframes dp-threat-slide-up {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            @keyframes dp-threat-glow {
                0%, 100% { 
                    box-shadow: 0 0 100px rgba(255, 0, 0, 0.8),
                                inset 0 0 80px rgba(255, 0, 0, 0.15);
                    border-color: #ff0000;
                }
                50% { 
                    box-shadow: 0 0 140px rgba(255, 0, 0, 1),
                                inset 0 0 100px rgba(255, 0, 0, 0.25);
                    border-color: #ff4444;
                }
            }

            .dp-threat-header {
                text-align: center;
                margin-bottom: 30px;
            }

            .dp-threat-icon {
                width: 100px;
                height: 100px;
                margin: 0 auto 20px;
                background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 50px;
                animation: dp-threat-pulse 1.5s ease-in-out infinite;
                box-shadow: 0 0 50px rgba(255, 0, 0, 0.8),
                            inset 0 0 30px rgba(0, 0, 0, 0.5);
                border: 3px solid #ff4444;
            }

            @keyframes dp-threat-pulse {
                0%, 100% { 
                    transform: scale(1); 
                    box-shadow: 0 0 50px rgba(255, 0, 0, 0.8),
                                inset 0 0 30px rgba(0, 0, 0, 0.5);
                }
                50% { 
                    transform: scale(1.1); 
                    box-shadow: 0 0 80px rgba(255, 0, 0, 1),
                                inset 0 0 40px rgba(0, 0, 0, 0.3);
                }
            }

            .dp-threat-title {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 32px;
                font-weight: 700;
                color: #ff0000;
                margin: 0 0 10px 0;
                text-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
                animation: dp-title-pulse 2s ease-in-out infinite;
            }

            @keyframes dp-title-pulse {
                0%, 100% { text-shadow: 0 0 20px rgba(255, 0, 0, 0.8); }
                50% { text-shadow: 0 0 30px rgba(255, 0, 0, 1); }
            }

            .dp-threat-subtitle {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 16px;
                color: rgba(255, 255, 255, 0.9);
                margin: 0;
            }

            .dp-threat-body {
                margin-bottom: 30px;
            }

            .dp-threat-domain {
                background: rgba(255, 0, 0, 0.15);
                border: 2px solid #ef4444;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 20px;
                text-align: center;
                box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
            }

            .dp-threat-domain-label {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 12px;
                color: #ff6b6b;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 8px;
                font-weight: 600;
            }

            .dp-threat-domain-url {
                font-family: 'Courier New', monospace;
                font-size: 16px;
                color: #ff4444;
                font-weight: 600;
                word-break: break-all;
                text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
            }

            .dp-threat-details {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                padding: 20px;
            }

            .dp-threat-item {
                display: flex;
                align-items: start;
                gap: 12px;
                margin-bottom: 15px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }

            .dp-threat-item:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
            }

            .dp-threat-item-icon {
                font-size: 20px;
                flex-shrink: 0;
            }

            .dp-threat-item-content {
                flex: 1;
            }

            .dp-threat-item-type {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 14px;
                font-weight: 600;
                color: #fca5a5;
                margin-bottom: 5px;
            }

            .dp-threat-item-description {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 13px;
                color: rgba(255, 255, 255, 0.7);
                line-height: 1.5;
            }

            .dp-threat-actions {
                display: flex;
                gap: 15px;
                flex-direction: column;
            }

            .dp-threat-btn {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 16px;
                font-weight: 600;
                padding: 16px 24px;
                border-radius: 12px;
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
                text-align: center;
            }

            .dp-threat-btn-primary {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
            }

            .dp-threat-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
            }

            .dp-threat-btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .dp-threat-btn-secondary:hover {
                background: rgba(255, 255, 255, 0.15);
                color: white;
            }

            .dp-threat-footer {
                margin-top: 20px;
                text-align: center;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.4);
            }

            .dp-threat-shield-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                color: rgba(255, 255, 255, 0.5);
            }

            @media (max-width: 640px) {
                .dp-threat-card {
                    padding: 30px 20px;
                }

                .dp-threat-title {
                    font-size: 24px;
                }

                .dp-threat-subtitle {
                    font-size: 14px;
                }
            }
        `;
        document.head.appendChild(styles);
    },

    /**
     * Create the alert element
     */
    createAlertElement() {
        if (this.alertElement) return;

        this.alertElement = document.createElement('div');
        this.alertElement.className = 'dp-threat-overlay';
        this.alertElement.style.display = 'none';
        this.alertElement.innerHTML = `
            <div class="dp-threat-card">
                <div class="dp-threat-header">
                    <div class="dp-threat-icon">⚠️</div>
                    <h1 class="dp-threat-title">Security Warning</h1>
                    <p class="dp-threat-subtitle">This website may be attempting to steal your information</p>
                </div>

                <div class="dp-threat-body">
                    <div class="dp-threat-domain">
                        <div class="dp-threat-domain-label">Suspicious Website</div>
                        <div class="dp-threat-domain-url"></div>
                    </div>

                    <div class="dp-threat-details"></div>
                </div>

                <div class="dp-threat-actions">
                    <button class="dp-threat-btn dp-threat-btn-primary" data-action="leave">
                        🛡️ Leave This Site (Recommended)
                    </button>
                    <button class="dp-threat-btn dp-threat-btn-secondary" data-action="dismiss">
                        I Understand the Risks
                    </button>
                </div>

                <div class="dp-threat-footer">
                    <div class="dp-threat-shield-badge">
                        Protected by Dark Pattern Shield
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.alertElement);

        // Add event listeners
        this.alertElement.querySelector('[data-action="leave"]').addEventListener('click', () => {
            this.leaveSite();
        });

        this.alertElement.querySelector('[data-action="dismiss"]').addEventListener('click', () => {
            this.dismiss();
        });
    },

    /**
     * Show threat alert
     * @param {Object} threat - Threat detection result from PhishingDetector
     */
    show(threat) {
        if (!this.alertElement || this.isShowing) return;

        this.currentThreat = threat;
        this.isShowing = true;

        // Update domain display
        const domainUrl = threat.domain || threat.url || window.location.hostname;
        this.alertElement.querySelector('.dp-threat-domain-url').textContent = domainUrl;

        // Update threat details
        const detailsContainer = this.alertElement.querySelector('.dp-threat-details');
        detailsContainer.innerHTML = '';

        if (threat.threats && threat.threats.length > 0) {
            threat.threats.forEach(item => {
                const threatItem = document.createElement('div');
                threatItem.className = 'dp-threat-item';
                threatItem.innerHTML = `
                    <div class="dp-threat-item-icon">⚠️</div>
                    <div class="dp-threat-item-content">
                        <div class="dp-threat-item-type">${item.type}</div>
                        <div class="dp-threat-item-description">${item.details || item.description}</div>
                    </div>
                `;
                detailsContainer.appendChild(threatItem);
            });
        } else {
            detailsContainer.innerHTML = `
                <div class="dp-threat-item">
                    <div class="dp-threat-item-icon">⚠️</div>
                    <div class="dp-threat-item-content">
                        <div class="dp-threat-item-type">Suspicious Activity Detected</div>
                        <div class="dp-threat-item-description">This website shows characteristics of a phishing or fake site.</div>
                    </div>
                </div>
            `;
        }

        // Show the alert
        this.alertElement.style.display = 'flex';

        // Log for debugging
        console.log('🛡️ Dark Pattern Shield: Showing threat alert', threat);
    },

    /**
     * Dismiss the alert
     */
    dismiss() {
        if (!this.alertElement) return;

        this.alertElement.style.display = 'none';
        this.isShowing = false;

        console.log('🛡️ Dark Pattern Shield: Threat alert dismissed by user');
    },

    /**
     * Leave the site (go back or close tab)
     */
    leaveSite() {
        console.log('🛡️ Dark Pattern Shield: User chose to leave site');

        // Try to go back in history
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // If no history, show a safe page
            window.location.href = 'about:blank';
        }
    },

    /**
     * Check if alert is currently showing
     */
    isAlertShowing() {
        return this.isShowing;
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.ThreatAlertManager = ThreatAlertManager;
}
