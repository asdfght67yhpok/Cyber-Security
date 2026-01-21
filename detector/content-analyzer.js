/**
 * Dark Pattern Shield - Content Analyzer
 * Analyzes page content to detect phishing attempts
 */

const ContentAnalyzer = {
    // Known brand keywords to look for
    brandKeywords: [
        'amazon', 'google', 'gmail', 'facebook', 'paypal', 'netflix',
        'microsoft', 'apple', 'icloud', 'twitter', 'instagram',
        'linkedin', 'ebay', 'walmart', 'bank', 'chase', 'wells fargo',
        'citibank', 'american express', 'visa', 'mastercard'
    ],

    // Suspicious patterns that indicate phishing
    suspiciousPatterns: [
        /account.*suspend/i,
        /account.*limit/i,
        /verify.*account/i,
        /confirm.*identity/i,
        /unusual.*activity/i,
        /security.*alert/i,
        /click.*here.*verify/i,
        /update.*payment/i,
        /expires?.*\d+.*hours?/i,
        /action.*required/i,
        /reactivate.*account/i
    ],

    /**
     * Analyze page content for phishing indicators
     */
    analyzePage() {
        const result = {
            isPhishing: false,
            threatLevel: 0,
            threats: [],
            indicators: []
        };

        // Check 1: Login form on suspicious domain
        const hasLoginForm = this.detectLoginForm();
        const hasBrandMention = this.detectBrandMention();
        const domainTrusted = this.isDomainTrusted();

        if (hasLoginForm && hasBrandMention && !domainTrusted) {
            result.threats.push({
                detected: true,
                type: 'Suspicious Login Page',
                description: 'Login form found with brand mentions on untrusted domain',
                severity: 85,
                details: 'This page requests credentials but is not from the official website'
            });
            result.threatLevel = Math.max(result.threatLevel, 85);
        }

        // Check 2: Urgency tactics
        const urgencyScore = this.detectUrgencyTactics();
        if (urgencyScore > 0) {
            result.indicators.push({
                type: 'Urgency Tactics',
                score: urgencyScore,
                details: 'Page uses pressure tactics to rush your decision'
            });
            result.threatLevel += urgencyScore;
        }

        // Check 3: Credential harvesting
        const harvestingRisk = this.detectCredentialHarvesting();
        if (harvestingRisk > 70) {
            result.threats.push({
                detected: true,
                type: 'Credential Harvesting',
                description: 'Page appears designed to steal login credentials',
                severity: 90,
                details: 'Multiple suspicious indicators suggest this is a phishing attempt'
            });
            result.threatLevel = Math.max(result.threatLevel, 90);
        }

        // Check 4: Mismatched branding
        const brandMismatch = this.detectBrandMismatch();
        if (brandMismatch) {
            result.threats.push({
                detected: true,
                type: 'Brand Impersonation',
                description: `Page appears to impersonate ${brandMismatch.brand}`,
                severity: 85,
                details: `Content mentions "${brandMismatch.brand}" but domain is ${window.location.hostname}`
            });
            result.threatLevel = Math.max(result.threatLevel, 85);
        }

        result.isPhishing = result.threatLevel >= 70;
        return result;
    },

    /**
     * Detect login forms
     */
    detectLoginForm() {
        // Look for password inputs
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        if (passwordInputs.length === 0) return false;

        // Look for email/username inputs
        const emailInputs = document.querySelectorAll(
            'input[type="email"], input[type="text"][name*="email"], input[name*="user"], input[placeholder*="email" i], input[placeholder*="username" i]'
        );

        return emailInputs.length > 0 && passwordInputs.length > 0;
    },

    /**
     * Detect brand mentions in page content
     */
    detectBrandMention() {
        const pageText = document.body.innerText.toLowerCase();
        const title = document.title.toLowerCase();

        for (const brand of this.brandKeywords) {
            if (pageText.includes(brand) || title.includes(brand)) {
                return brand;
            }
        }
        return null;
    },

    /**
     * Check if current domain is trusted
     */
    isDomainTrusted() {
        const hostname = window.location.hostname.toLowerCase();

        // Local files are never trusted for login
        if (window.location.protocol === 'file:') return false;

        // Check against known legitimate domains
        if (window.WhitelistManager) {
            return window.WhitelistManager.isWhitelisted(window.location.href);
        }

        return false;
    },

    /**
     * Detect urgency and pressure tactics
     */
    detectUrgencyTactics() {
        const pageText = document.body.innerText;
        let score = 0;

        for (const pattern of this.suspiciousPatterns) {
            if (pattern.test(pageText)) {
                score += 15;
            }
        }

        return Math.min(score, 50); // Max 50 points from urgency
    },

    /**
     * Detect credential harvesting attempts
     */
    detectCredentialHarvesting() {
        let risk = 0;

        // Has login form
        if (this.detectLoginForm()) risk += 30;

        // Has brand mention
        if (this.detectBrandMention()) risk += 20;

        // Not on official domain
        if (!this.isDomainTrusted()) risk += 30;

        // Has urgency language
        if (this.detectUrgencyTactics() > 0) risk += 20;

        return risk;
    },

    /**
     * Detect brand impersonation
     */
    detectBrandMismatch() {
        const mentionedBrand = this.detectBrandMention();
        if (!mentionedBrand) return null;

        const hostname = window.location.hostname.toLowerCase();

        // Check if domain actually belongs to the brand
        const brandInDomain = hostname.includes(mentionedBrand);
        const isTrusted = this.isDomainTrusted();

        // If brand is mentioned but not in trusted domain
        if (mentionedBrand && !isTrusted && this.detectLoginForm()) {
            return {
                brand: mentionedBrand,
                domain: hostname
            };
        }

        return null;
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.ContentAnalyzer = ContentAnalyzer;
}
