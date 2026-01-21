/**
 * Dark Pattern Shield - Popup Controller
 * Handles UI interactions and communication with content scripts
 */

class PopupController {
    constructor() {
        this.isProtectionActive = true;
        this.settings = {
            sensitivity: 'medium',
            showOverlay: true,
            soundEnabled: false
        };

        this.init();
    }

    async init() {
        await this.loadSettings();
        this.bindEvents();
        this.updateUI();
        this.requestScan();
    }

    // Load settings from storage
    async loadSettings() {
        try {
            const result = await chrome.storage.local.get(['settings', 'isActive']);
            if (result.settings) {
                this.settings = { ...this.settings, ...result.settings };
            }
            if (result.isActive !== undefined) {
                this.isProtectionActive = result.isActive;
            }
        } catch (error) {
            console.log('Using default settings');
        }
    }

    // Save settings to storage
    async saveSettings() {
        try {
            await chrome.storage.local.set({
                settings: this.settings,
                isActive: this.isProtectionActive
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    // Bind all event listeners
    bindEvents() {
        // Protection toggle
        const protectionToggle = document.getElementById('protectionToggle');
        if (protectionToggle) {
            protectionToggle.checked = this.isProtectionActive;
            protectionToggle.addEventListener('change', (e) => this.toggleProtection(e.target.checked));
        }

        // Rescan button
        const rescanBtn = document.getElementById('rescanBtn');
        if (rescanBtn) {
            rescanBtn.addEventListener('click', () => this.requestScan());
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.toggleSettings());
        }

        // Sensitivity select
        const sensitivitySelect = document.getElementById('sensitivitySelect');
        if (sensitivitySelect) {
            sensitivitySelect.value = this.settings.sensitivity;
            sensitivitySelect.addEventListener('change', (e) => {
                this.settings.sensitivity = e.target.value;
                this.saveSettings();
                this.requestScan();
            });
        }

        // Overlay toggle
        const overlayToggle = document.getElementById('overlayToggle');
        if (overlayToggle) {
            overlayToggle.checked = this.settings.showOverlay;
            overlayToggle.addEventListener('change', (e) => {
                this.settings.showOverlay = e.target.checked;
                this.saveSettings();
                this.notifyContentScript({ action: 'toggleOverlay', show: e.target.checked });
            });
        }

        // Sound toggle
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.checked = this.settings.soundEnabled;
            soundToggle.addEventListener('change', (e) => {
                this.settings.soundEnabled = e.target.checked;
                this.saveSettings();
            });
        }
    }

    // Toggle protection on/off
    async toggleProtection(isActive) {
        this.isProtectionActive = isActive;
        await this.saveSettings();

        // Update UI
        const statusValue = document.getElementById('statusValue');
        const statusDot = document.querySelector('.status-dot');
        const pulseRing = document.querySelector('.pulse-ring');

        if (statusValue) {
            statusValue.textContent = isActive ? 'Active' : 'Disabled';
            statusValue.classList.toggle('inactive', !isActive);
        }

        if (statusDot) {
            statusDot.classList.toggle('inactive', !isActive);
        }

        if (pulseRing) {
            pulseRing.style.display = isActive ? 'block' : 'none';
        }

        // Notify content script
        this.notifyContentScript({ action: 'toggleProtection', isActive });

        if (isActive) {
            this.requestScan();
        } else {
            this.clearResults();
        }
    }

    // Toggle settings panel
    toggleSettings() {
        const settingsPanel = document.getElementById('settingsPanel');
        if (settingsPanel) {
            settingsPanel.classList.toggle('active');
        }
    }

    // Request scan from content script
    async requestScan() {
        if (!this.isProtectionActive) return;

        const rescanBtn = document.getElementById('rescanBtn');
        if (rescanBtn) {
            rescanBtn.classList.add('scanning');
            rescanBtn.disabled = true;
        }

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (tab && tab.id) {
                // Request dark pattern scan
                const response = await chrome.tabs.sendMessage(tab.id, {
                    action: 'scan',
                    settings: this.settings
                });

                // Also request phishing/security status
                const statusResponse = await chrome.tabs.sendMessage(tab.id, {
                    action: 'getStatus'
                });

                if (response) {
                    this.displayResults(response, statusResponse);
                }
            }
        } catch (error) {
            console.log('Content script not available on this page');
            this.showNoAccessMessage();
        } finally {
            if (rescanBtn) {
                rescanBtn.classList.remove('scanning');
                rescanBtn.disabled = false;
            }
        }
    }

    // Display scan results
    displayResults(results, statusResponse) {
        const { threats, scannedElements } = results;

        // Check if there's an active phishing threat from statusResponse
        const hasPhishingThreat = statusResponse?.phishingThreat || false;
        const totalThreats = threats.length + (hasPhishingThreat ? 1 : 0);

        // Update stats
        const threatCount = document.getElementById('threatCount');
        const scanCount = document.getElementById('scanCount');

        if (threatCount) {
            if (hasPhishingThreat) {
                // Show red warning for phishing
                threatCount.innerHTML = `<span style="color: #ef4444; font-weight: bold;">⚠️ ${totalThreats}</span>`;
            } else {
                this.animateNumber(threatCount, threats.length);
            }
        }

        if (scanCount) {
            this.animateNumber(scanCount, scannedElements);
        }

        // Update patterns list
        const patternsList = document.getElementById('patternsList');
        if (patternsList) {
            // Check for phishing threat first
            if (hasPhishingThreat) {
                const phishingHTML = `
          <div class="pattern-item expanded phishing-alert" style="animation-delay: 0s; border: 2px solid #ef4444; background: rgba(239, 68, 68, 0.05);">
            <div class="pattern-header">
              <div class="pattern-icon" style="font-size: 32px;">🚨</div>
              <div class="pattern-title">
                <div class="pattern-type" style="color: #ef4444; font-size: 18px;">PHISHING THREAT DETECTED</div>
                <span class="pattern-confidence high">${statusResponse.phishingLevel || 90}% threat level</span>
              </div>
            </div>
            <div class="pattern-details">
              <div class="pattern-why">
                <strong style="color: #ef4444;">⚠️ This appears to be a fake website:</strong>
                <p>${statusResponse.phishingReason || 'This website shows characteristics of a phishing attempt designed to steal your information.'}</p>
              </div>
              ${statusResponse.phishingDomain ? `
              <div class="pattern-where" style="margin-top: 12px;">
                <strong>🌐 Current domain:</strong>
                <p class="detected-text" style="color: #ef4444;">${this.escapeHtml(statusResponse.phishingDomain)}</p>
              </div>
              ` : ''}
            </div>
          </div>
        `;

                // If there are also dark patterns, show both
                if (threats.length > 0) {
                    patternsList.innerHTML = phishingHTML + threats.map((threat, index) => `
            <div class="pattern-item expanded" style="animation-delay: ${(index + 1) * 0.1}s" data-element-id="${threat.elementId}">
              <div class="pattern-header">
                <div class="pattern-icon">${this.getPatternIcon(threat.type)}</div>
                <div class="pattern-title">
                  <div class="pattern-type">${threat.type}</div>
                  <span class="pattern-confidence ${threat.confidence >= 70 ? 'high' : threat.confidence >= 50 ? 'medium' : 'low'}">${threat.confidence}% confidence</span>
                </div>
              </div>
              <div class="pattern-details">
                <div class="pattern-why">
                  <strong>⚠️ Why this is a dark pattern:</strong>
                  <p>${threat.description || this.getPatternDescription(threat.type)}</p>
                </div>
                <div class="pattern-where">
                  <strong>📍 Detected text:</strong>
                  <p class="detected-text">"${this.escapeHtml(threat.text)}"</p>
                </div>
              </div>
              <button class="jump-btn" data-element-id="${threat.elementId}">🔍 Jump to Element</button>
            </div>
          `).join('');
                } else {
                    patternsList.innerHTML = phishingHTML;
                }

                // Add jump button handlers
                patternsList.querySelectorAll('.jump-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const elementId = btn.dataset.elementId;
                        this.notifyContentScript({ action: 'highlight', elementId });
                    });
                });

            } else if (results.isWhitelisted) {
                patternsList.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">✅</div>
            <p>Trusted Website</p>
            <span class="empty-hint">This site is whitelisted</span>
          </div>
        `;
                // Update stats to show secure
                const threatCount = document.getElementById('threatCount');
                if (threatCount) threatCount.innerHTML = '<span style="color:var(--success)">✓</span>';

            } else if (threats.length === 0) {
                patternsList.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🛡️</div>
            <p>No dark patterns detected on this page</p>
            <span class="empty-hint">You're safe to browse!</span>
          </div>
        `;
            } else {
                patternsList.innerHTML = threats.map((threat, index) => `
          <div class="pattern-item expanded" style="animation-delay: ${index * 0.1}s" data-element-id="${threat.elementId}">
            <div class="pattern-header">
              <div class="pattern-icon">${this.getPatternIcon(threat.type)}</div>
              <div class="pattern-title">
                <div class="pattern-type">${threat.type}</div>
                <span class="pattern-confidence ${threat.confidence >= 70 ? 'high' : threat.confidence >= 50 ? 'medium' : 'low'}">${threat.confidence}% confidence</span>
              </div>
            </div>
            <div class="pattern-details">
              <div class="pattern-why">
                <strong>⚠️ Why this is a dark pattern:</strong>
                <p>${threat.description || this.getPatternDescription(threat.type)}</p>
              </div>
              <div class="pattern-where">
                <strong>📍 Detected text:</strong>
                <p class="detected-text">"${this.escapeHtml(threat.text)}"</p>
              </div>
            </div>
            <button class="jump-btn" data-element-id="${threat.elementId}">🔍 Jump to Element</button>
          </div>
        `).join('');

                // Add click handlers to jump buttons
                patternsList.querySelectorAll('.jump-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const elementId = btn.dataset.elementId;
                        this.notifyContentScript({ action: 'highlight', elementId });
                    });
                });

                // Play alert sound if enabled
                if (this.settings.soundEnabled && threats.some(t => t.confidence >= 80)) {
                    this.playAlertSound();
                }
            }
        }
    }

    // Get description for pattern type
    getPatternDescription(type) {
        const descriptions = {
            'Confirmshaming': 'Uses guilt-tripping or shaming language to make you feel bad about declining. The "No" option is worded to make you feel foolish.',
            'Hidden Costs': 'Additional fees or charges are hidden until the final checkout step, making the actual price higher than advertised.',
            'Fake Urgency': 'Creates artificial time pressure with countdown timers or "limited time" claims to rush your decision.',
            'Scarcity': 'False claims about low stock or high demand to pressure you into buying immediately.',
            'Tricky Wording': 'Uses confusing language, double negatives, or unclear phrasing to mislead you into making unintended choices.',
            'Visual Manipulation': 'Button sizes, colors, or placement are designed to steer you toward one option over another.',
            'Forced Action': 'Requires you to perform an unwanted action (like signing up) to access basic content or features.',
            'Preselection': 'Options are pre-checked by default, hoping you won\'t notice and will accidentally agree.',
            'Misdirection': 'Important information is hidden in fine print or placed where you\'re unlikely to notice it.',
            'Cookie Manipulation': 'Cookie consent banners are designed to make accepting all cookies easier than managing preferences.'
        };
        return descriptions[type] || 'This element uses deceptive design tactics to influence your behavior.';
    }

    // Clear results
    clearResults() {
        const threatCount = document.getElementById('threatCount');
        const scanCount = document.getElementById('scanCount');
        const patternsList = document.getElementById('patternsList');

        if (threatCount) threatCount.textContent = '-';
        if (scanCount) scanCount.textContent = '-';
        if (patternsList) {
            patternsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">😴</div>
          <p>Protection is disabled</p>
          <span class="empty-hint">Enable to start scanning</span>
        </div>
      `;
        }
    }

    // Show message when script can't access page
    showNoAccessMessage() {
        const patternsList = document.getElementById('patternsList');
        if (patternsList) {
            patternsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔒</div>
          <p>Cannot scan this page</p>
          <span class="empty-hint">Extension doesn't have access to this URL</span>
        </div>
      `;
        }

        const threatCount = document.getElementById('threatCount');
        const scanCount = document.getElementById('scanCount');
        if (threatCount) threatCount.textContent = '-';
        if (scanCount) scanCount.textContent = '-';
    }

    // Animate number change
    animateNumber(element, target) {
        const start = parseInt(element.textContent) || 0;
        const duration = 500;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (target - start) * easeProgress);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    // Get icon for pattern type
    getPatternIcon(type) {
        const icons = {
            'Confirmshaming': '😔',
            'Hidden Costs': '💰',
            'Fake Urgency': '⏰',
            'Scarcity': '📉',
            'Tricky Wording': '🔤',
            'Visual Manipulation': '👁️',
            'Forced Action': '🚫',
            'Preselection': '☑️',
            'Misdirection': '🎯',
            'Cookie Manipulation': '🍪'
        };
        return icons[type] || '⚠️';
    }

    // Escape HTML for safe display
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Play alert sound
    playAlertSound() {
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleWFHICiJv9TfqH5gRDIimbjM2aOBYEo4JJe2ydihgWJMOyaVtcjYoYJjTTwnlLTH16GCY048J5S0x9ehgmNOPCeUtMfXoYJjTjwnlLTH16GCY048J5S0x9ehgmNOPCeUtMfXoYJjTjwnlLTH16GCY048J5S0x9eh');
            audio.volume = 0.3;
            audio.play().catch(() => { });
        } catch (e) { }
    }

    // Send message to content script
    async notifyContentScript(message) {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.id) {
                chrome.tabs.sendMessage(tab.id, message);
            }
        } catch (error) {
            console.log('Could not communicate with content script');
        }
    }

    // Update UI based on current state
    updateUI() {
        const protectionToggle = document.getElementById('protectionToggle');
        const statusValue = document.getElementById('statusValue');
        const statusDot = document.querySelector('.status-dot');

        if (protectionToggle) {
            protectionToggle.checked = this.isProtectionActive;
        }

        if (statusValue) {
            statusValue.textContent = this.isProtectionActive ? 'Active' : 'Disabled';
            statusValue.classList.toggle('inactive', !this.isProtectionActive);
        }

        if (statusDot) {
            statusDot.classList.toggle('inactive', !this.isProtectionActive);
        }
    }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});
