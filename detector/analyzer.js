/**
 * Dark Pattern Shield - Main Analyzer
 * Coordinates pattern detection and DOM analysis
 */

const DarkPatternAnalyzer = {
    // Sensitivity thresholds
    sensitivityLevels: {
        low: { minConfidence: 70, minMatches: 3 },
        medium: { minConfidence: 50, minMatches: 2 },
        high: { minConfidence: 30, minMatches: 1 }
    },

    // Elements to scan
    targetSelectors: [
        // Cookie banners
        '[class*="cookie"]',
        '[id*="cookie"]',
        '[class*="consent"]',
        '[id*="consent"]',
        '[class*="gdpr"]',
        '[id*="gdpr"]',
        '[class*="privacy"]',
        '[id*="privacy-banner"]',

        // Modals and popups
        '[class*="modal"]',
        '[class*="popup"]',
        '[class*="overlay"]',
        '[class*="dialog"]',
        '[role="dialog"]',
        '[role="alertdialog"]',

        // Notifications
        '[class*="notification"]',
        '[class*="banner"]',
        '[class*="toast"]',
        '[class*="alert"]',

        // Forms and checkout
        '[class*="checkout"]',
        '[class*="cart"]',
        '[class*="subscribe"]',
        '[class*="newsletter"]',
        '[class*="signup"]',
        '[class*="opt"]',

        // Buttons and CTAs
        'button',
        '[class*="btn"]',
        '[class*="button"]',
        '[class*="cta"]',
        'a[href*="subscribe"]',
        'a[href*="signup"]',

        // Labels and checkboxes
        'label',
        'input[type="checkbox"]',

        // Urgency indicators
        '[class*="timer"]',
        '[class*="countdown"]',
        '[class*="stock"]',
        '[class*="limited"]',
        '[class*="urgent"]'
    ],

    /**
     * Main analysis function
     */
    analyzeElement(element, sensitivity = 'medium') {
        const text = this.extractText(element);
        if (!text || text.length < 5) return null;

        const threshold = this.sensitivityLevels[sensitivity] || this.sensitivityLevels.medium;
        const detections = [];

        // Run pattern matching
        const patternResults = this.matchPatterns(text);

        // Run NLP analysis
        const manipulationResult = window.NLPAnalyzer.calculateManipulationScore(text);
        const emotionalResult = window.NLPAnalyzer.detectEmotionalManipulation(text);

        // Combine results
        for (const [patternType, matches] of Object.entries(patternResults)) {
            if (matches.length >= threshold.minMatches) {
                const pattern = window.DarkPatterns.getPattern(patternType);
                const confidence = window.NLPAnalyzer.calculateConfidence(
                    manipulationResult.score,
                    emotionalResult.totalScore,
                    matches.length
                );

                if (confidence >= threshold.minConfidence) {
                    const elementId = this.generateElementId(element);
                    // Add data attribute to element for easy lookup
                    element.setAttribute('data-dp-id', elementId);

                    detections.push({
                        type: pattern.name,
                        description: pattern.description,
                        severity: pattern.severity,
                        confidence,
                        text: this.truncateText(text, 100),
                        matches: matches.slice(0, 3),
                        element: element,
                        elementId: elementId
                    });
                }
            }
        }

        // Check for visual manipulation
        const visualIssues = this.analyzeVisualManipulation(element);
        if (visualIssues.detected && visualIssues.confidence >= threshold.minConfidence) {
            const elementId = this.generateElementId(element);
            // Add data attribute to element for easy lookup
            element.setAttribute('data-dp-id', elementId);

            detections.push({
                type: 'Visual Manipulation',
                description: visualIssues.description,
                severity: 'medium',
                confidence: visualIssues.confidence,
                text: visualIssues.details,
                matches: [],
                element: element,
                elementId: elementId
            });
        }

        return detections;
    },

    /**
     * Extract clean text from element
     */
    extractText(element) {
        if (!element) return '';

        // Get text content
        let text = element.textContent || element.innerText || '';

        // Also get aria labels and titles
        const ariaLabel = element.getAttribute('aria-label');
        const title = element.getAttribute('title');
        const placeholder = element.getAttribute('placeholder');

        if (ariaLabel) text += ' ' + ariaLabel;
        if (title) text += ' ' + title;
        if (placeholder) text += ' ' + placeholder;

        // Clean up whitespace
        return text.replace(/\s+/g, ' ').trim();
    },

    /**
     * Match text against all patterns
     */
    matchPatterns(text) {
        const normalizedText = text.toLowerCase();
        const results = {};

        for (const [patternType, pattern] of Object.entries(window.DarkPatterns.patterns)) {
            results[patternType] = [];

            // Check keywords
            for (const keyword of pattern.keywords) {
                if (normalizedText.includes(keyword.toLowerCase())) {
                    results[patternType].push({ type: 'keyword', value: keyword });
                }
            }

            // Check regex patterns
            for (const regex of pattern.phrases) {
                // Clone regex to avoid state issues
                const testRegex = new RegExp(regex.source, regex.flags);
                const matches = text.match(testRegex);
                if (matches) {
                    results[patternType].push({ type: 'phrase', value: matches[0] });
                }
            }
        }

        return results;
    },

    /**
     * Analyze visual manipulation tactics
     */
    analyzeVisualManipulation(element) {
        const result = {
            detected: false,
            confidence: 0,
            description: '',
            details: ''
        };

        // Check for button size disparities
        const buttons = element.querySelectorAll('button, [class*="btn"], [role="button"], a[class*="button"]');
        if (buttons.length >= 2) {
            const sizes = Array.from(buttons).map(btn => {
                const rect = btn.getBoundingClientRect();
                return {
                    element: btn,
                    area: rect.width * rect.height,
                    text: btn.textContent?.toLowerCase() || ''
                };
            });

            // Find accept/reject patterns
            const acceptBtn = sizes.find(s =>
                s.text.includes('accept') || s.text.includes('agree') ||
                s.text.includes('allow') || s.text.includes('yes') ||
                s.text.includes('continue') || s.text.includes('ok')
            );
            const rejectBtn = sizes.find(s =>
                s.text.includes('reject') || s.text.includes('decline') ||
                s.text.includes('deny') || s.text.includes('no') ||
                s.text.includes('manage') || s.text.includes('customize')
            );

            if (acceptBtn && rejectBtn) {
                const sizeRatio = acceptBtn.area / (rejectBtn.area || 1);
                if (sizeRatio > 2) {
                    result.detected = true;
                    result.confidence = Math.min(50 + (sizeRatio * 5), 90);
                    result.description = 'Button sizes favor accepting over rejecting';
                    result.details = `Accept button is ${Math.round(sizeRatio)}x larger than reject option`;
                }
            }
        }

        // Check for low contrast text
        const links = element.querySelectorAll('a, span, small');
        for (const link of links) {
            const style = window.getComputedStyle(link);
            const fontSize = parseFloat(style.fontSize);
            const opacity = parseFloat(style.opacity);
            const color = style.color;

            // Check for very small or faded text
            if (fontSize < 10 || opacity < 0.5) {
                const text = link.textContent?.toLowerCase() || '';
                if (text.includes('privacy') || text.includes('terms') ||
                    text.includes('opt') || text.includes('unsubscribe')) {
                    result.detected = true;
                    result.confidence = 70;
                    result.description = 'Important options are visually de-emphasized';
                    result.details = 'Privacy/opt-out options use small or faded text';
                    break;
                }
            }
        }

        return result;
    },

    /**
     * Scan entire page
     */
    scanPage(sensitivity = 'medium') {
        const threats = [];
        const scannedElements = new Set();
        let elementCount = 0;

        // Build selector string
        const selector = this.targetSelectors.join(', ');

        try {
            const elements = document.querySelectorAll(selector);

            for (const element of elements) {
                // Skip if already scanned or too small
                if (scannedElements.has(element)) continue;
                if (!this.isVisible(element)) continue;

                scannedElements.add(element);
                elementCount++;

                const detections = this.analyzeElement(element, sensitivity);
                if (detections && detections.length > 0) {
                    threats.push(...detections);
                }
            }
        } catch (error) {
            console.error('Dark Pattern Shield: Scan error', error);
        }

        // Remove duplicates based on text similarity
        const uniqueThreats = this.deduplicateThreats(threats);

        return {
            threats: uniqueThreats,
            scannedElements: elementCount,
            timestamp: Date.now()
        };
    },

    /**
     * Check if element is visible
     */
    isVisible(element) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0'
        );
    },

    /**
     * Generate unique ID for element
     */
    generateElementId(element) {
        if (element.id) return element.id;

        // Create a unique path
        let path = '';
        let current = element;

        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            if (current.id) {
                selector += '#' + current.id;
            } else if (current.className && typeof current.className === 'string') {
                selector += '.' + current.className.split(' ').filter(c => c).join('.');
            }
            path = selector + (path ? ' > ' + path : '');
            current = current.parentElement;
        }

        return 'dp-' + this.hashString(path);
    },

    /**
     * Simple string hash
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    },

    /**
     * Remove duplicate threats
     */
    deduplicateThreats(threats) {
        const seen = new Set();
        return threats.filter(threat => {
            const key = threat.type + ':' + threat.text.substring(0, 50);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    },

    /**
     * Truncate text for display
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.DarkPatternAnalyzer = DarkPatternAnalyzer;
}
