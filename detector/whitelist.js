/**
 * Dark Pattern Shield - Whitelist Manager
 * Defines trusted domains that should be exempted from scanning
 */

const WhitelistManager = {
    /**
     * List of regex patterns for trusted websites
     * These sites will be SKIPPED by the scanner
     */
    trustedPatterns: [
        // Search Engines
        /^https?:\/\/(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?/i,
        /^https?:\/\/(www\.)?bing\.com/i,

        // Major Tech/Social
        /^https?:\/\/(www\.)?github\.com/i,
        /^https?:\/\/(www\.)?stackoverflow\.com/i,
        /^https?:\/\/(www\.)?microsoft\.com/i,
        /^https?:\/\/(www\.)?apple\.com/i,

        // Localhost/Dev (Optional, keep enabled for testing usually, but whitelisting for now as example)
        // /^http:\/\/localhost/i,
        // /^http:\/\/127\.0\.0\.1/i
    ],

    /**
     * Check if the current URL is whitelisted
     * @param {string} url - The URL to check
     * @returns {boolean} - True if whitelisted, False otherwise
     */
    isWhitelisted(url) {
        if (!url) return false;

        return this.trustedPatterns.some(pattern => pattern.test(url));
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.WhitelistManager = WhitelistManager;
}
