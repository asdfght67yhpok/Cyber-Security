/**
 * Dark Pattern Shield - Content Script
 * Main entry point for page analysis
 */

(function () {
    'use strict';

    // State
    let isActive = true;
    let settings = {
        sensitivity: 'medium',
        showOverlay: true
    };
    let lastScanResults = null;
    let observer = null;

    /**
     * Initialize extension on page
     */
    function init() {
        console.log('🛡️ Dark Pattern Shield: Initializing...');

        // Initialize overlay system
        if (window.OverlayManager) {
            window.OverlayManager.init();
        }

        // Load saved settings
        loadSettings();

        // Initial scan after page loads
        if (document.readyState === 'complete') {
            performScan();
        } else {
            window.addEventListener('load', () => {
                setTimeout(performScan, 500);
            });
        }

        // Set up mutation observer for dynamic content
        setupObserver();

        // Listen for messages from popup/background
        chrome.runtime.onMessage.addListener(handleMessage);

        console.log('🛡️ Dark Pattern Shield: Ready');
    }

    /**
     * Load settings from storage
     */
    async function loadSettings() {
        try {
            const result = await chrome.storage.local.get(['settings', 'isActive']);
            if (result.settings) {
                settings = { ...settings, ...result.settings };
            }
            if (result.isActive !== undefined) {
                isActive = result.isActive;
            }
        } catch (e) {
            // Use defaults
        }
    }

    /**
     * Handle messages from popup/background
     */
    function handleMessage(message, sender, sendResponse) {
        switch (message.action) {
            case 'scan':
                if (message.settings) {
                    settings = { ...settings, ...message.settings };
                }
                const results = performScan();
                sendResponse(results);
                return true;

            case 'toggleProtection':
                isActive = message.isActive;
                if (!isActive && window.OverlayManager) {
                    window.OverlayManager.clearHighlights();
                    window.OverlayManager.hideBadge();
                } else if (isActive) {
                    performScan();
                }
                sendResponse({ success: true });
                return true;

            case 'toggleOverlay':
                if (window.OverlayManager) {
                    window.OverlayManager.toggle(message.show);
                    if (message.show && lastScanResults) {
                        window.OverlayManager.highlightThreats(lastScanResults.threats);
                    }
                }
                sendResponse({ success: true });
                return true;

            case 'highlight':
                if (window.OverlayManager) {
                    window.OverlayManager.highlightById(message.elementId);
                }
                sendResponse({ success: true });
                return true;

            case 'getStatus':
                sendResponse({
                    isActive,
                    settings,
                    lastScan: lastScanResults
                });
                return true;
        }
    }

    /**
     * Perform page scan
     */
    function performScan() {
        if (!isActive) {
            return { threats: [], scannedElements: 0 };
        }

        console.log('🛡️ Dark Pattern Shield: Scanning page...');

        try {
            // Run analyzer
            if (window.DarkPatternAnalyzer) {
                lastScanResults = window.DarkPatternAnalyzer.scanPage(settings.sensitivity);

                // Update overlay if enabled
                if (settings.showOverlay && window.OverlayManager) {
                    window.OverlayManager.highlightThreats(lastScanResults.threats);
                }

                console.log(`🛡️ Dark Pattern Shield: Found ${lastScanResults.threats.length} threats in ${lastScanResults.scannedElements} elements`);

                // Notify background script
                try {
                    chrome.runtime.sendMessage({
                        action: 'scanComplete',
                        results: {
                            threats: lastScanResults.threats.length,
                            url: window.location.href
                        }
                    });
                } catch (e) {
                    // Background might not be available
                }

                return lastScanResults;
            }
        } catch (error) {
            console.error('🛡️ Dark Pattern Shield: Scan error', error);
        }

        return { threats: [], scannedElements: 0 };
    }

    /**
     * Set up mutation observer for dynamic content
     */
    function setupObserver() {
        if (observer) return;

        let scanTimeout = null;

        observer = new MutationObserver((mutations) => {
            if (!isActive) return;

            // Check if mutations are relevant
            const hasRelevantChanges = mutations.some(mutation => {
                // Check added nodes
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) { // Element node
                        const tag = node.tagName?.toLowerCase();
                        const classes = node.className?.toLowerCase?.() || '';

                        // Check for relevant elements
                        if (tag === 'div' || tag === 'dialog' || tag === 'form') {
                            if (classes.includes('cookie') || classes.includes('consent') ||
                                classes.includes('modal') || classes.includes('popup') ||
                                classes.includes('banner') || classes.includes('newsletter')) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            });

            if (hasRelevantChanges) {
                // Debounce rescans
                clearTimeout(scanTimeout);
                scanTimeout = setTimeout(() => {
                    console.log('🛡️ Dark Pattern Shield: Detected new content, rescanning...');
                    performScan();
                }, 1000);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Clean up on unload
     */
    function cleanup() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        if (window.OverlayManager) {
            window.OverlayManager.destroy();
        }
    }

    // Handle page unload
    window.addEventListener('beforeunload', cleanup);

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
