/**
 * Dark Pattern Shield - Phishing Detector
 * Detects fake websites and potential phishing attempts
 */

const PhishingDetector = {
    // Known legitimate domains for popular brands
    legitimateDomains: {
        'amazon': ['amazon.com', 'amazon.in', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.ca', 'amazon.co.jp'],
        'google': ['google.com', 'google.co.in', 'google.co.uk', 'gmail.com', 'youtube.com'],
        'facebook': ['facebook.com', 'fb.com', 'instagram.com', 'whatsapp.com'],
        'microsoft': ['microsoft.com', 'live.com', 'outlook.com', 'office.com', 'xbox.com'],
        'apple': ['apple.com', 'icloud.com', 'itunes.com'],
        'paypal': ['paypal.com'],
        'netflix': ['netflix.com'],
        'twitter': ['twitter.com', 'x.com'],
        'linkedin': ['linkedin.com'],
        'ebay': ['ebay.com', 'ebay.in', 'ebay.co.uk']
    },

    // Common typosquatting patterns
    typosquattingPatterns: [
        { original: 'a', fake: ['@', '4'] },
        { original: 'e', fake: ['3'] },
        { original: 'i', fake: ['1', 'l', '!'] },
        { original: 'o', fake: ['0'] },
        { original: 's', fake: ['5', '$'] },
        { original: 'g', fake: ['9'] },
        { original: 'l', fake: ['1', 'i'] },
        { original: 'm', fake: ['rn'] },
        { original: 'w', fake: ['vv'] },
        { original: 'c', fake: ['k'] }
    ],

    // Suspicious TLDs commonly used in phishing
    suspiciousTLDs: [
        '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work',
        '.click', '.link', '.download', '.racing', '.win'
    ],

    /**
     * Main phishing detection function
     * @param {string} url - The URL to analyze
     * @returns {Object} - Detection result with threat level and details
     */
    analyze(url) {
        const result = {
            isPhishing: false,
            threatLevel: 0, // 0-100
            threats: [],
            domain: '',
            url: url
        };

        try {
            // Handle local files
            if (url.startsWith('file://')) {
                return this.analyzeLocalFile(url);
            }

            const urlObj = new URL(url);
            result.domain = urlObj.hostname.toLowerCase();

            // Run all detection checks
            const checks = [
                this.checkLocalFile(url),
                this.checkTyposquatting(result.domain),
                this.checkSuspiciousTLD(result.domain),
                this.checkSuspiciousSubdomain(result.domain),
                this.checkDomainSimilarity(result.domain),
                this.checkIPAddress(result.domain)
            ];

            // Combine all threats
            checks.forEach(check => {
                if (check.detected) {
                    result.threats.push(check);
                    result.threatLevel = Math.max(result.threatLevel, check.severity);
                }
            });

            // Determine if it's phishing based on threat level
            result.isPhishing = result.threatLevel >= 70;

        } catch (error) {
            console.error('PhishingDetector: Error analyzing URL', error);
        }

        return result;
    },

    /**
     * Analyze local files (often used for fake website testing)
     */
    analyzeLocalFile(url) {
        const filename = url.split('/').pop() || '';
        const suspiciousNames = ['amazon', 'google', 'paypal', 'facebook', 'login', 'signin', 'bank'];

        let threatLevel = 85; // Local files pretending to be brands are high threat
        const threats = [{
            detected: true,
            type: 'Local File Website',
            description: 'This page is loaded from a local file, not a real website',
            severity: 85,
            details: 'Legitimate websites are never served directly from your computer\'s file system'
        }];

        // Check if it's pretending to be a known brand
        for (const name of suspiciousNames) {
            if (filename.toLowerCase().includes(name)) {
                threats.push({
                    detected: true,
                    type: 'Brand Impersonation',
                    description: `This local file appears to be impersonating ${name}`,
                    severity: 95,
                    details: `The filename contains "${name}" but this is not the official ${name} website`
                });
                threatLevel = 95;
                break;
            }
        }

        return {
            isPhishing: true,
            threatLevel: threatLevel,
            threats: threats,
            domain: 'file://',
            url: url
        };
    },

    /**
     * Check if URL is a local file
     */
    checkLocalFile(url) {
        if (url.startsWith('file://')) {
            return {
                detected: true,
                type: 'Local File',
                description: 'Page served from local file system',
                severity: 85,
                details: 'Legitimate websites are accessed via http:// or https://'
            };
        }
        return { detected: false };
    },

    /**
     * Check for typosquatting attempts
     */
    checkTyposquatting(domain) {
        for (const [brand, legitDomains] of Object.entries(this.legitimateDomains)) {
            for (const legitDomain of legitDomains) {
                // Calculate similarity
                const similarity = this.calculateSimilarity(domain, legitDomain);

                // If domain is very similar but not exact match
                if (similarity > 0.7 && domain !== legitDomain) {
                    // Check if it's a typosquatting pattern
                    const hasTypo = this.hasCommonTypo(domain, legitDomain);

                    if (hasTypo || similarity > 0.85) {
                        return {
                            detected: true,
                            type: 'Typosquatting',
                            description: `This domain closely resembles ${legitDomain}`,
                            severity: 90,
                            details: `Possible attempt to impersonate ${brand}. The official domain is ${legitDomain}`
                        };
                    }
                }
            }
        }
        return { detected: false };
    },

    /**
     * Check if domain has common typo patterns
     */
    hasCommonTypo(suspected, legitimate) {
        // Check for character substitutions
        for (const pattern of this.typosquattingPatterns) {
            for (const fakeChar of pattern.fake) {
                const typoVersion = legitimate.replace(new RegExp(pattern.original, 'g'), fakeChar);
                if (suspected === typoVersion) {
                    return true;
                }
            }
        }

        // Check for missing or extra characters
        if (Math.abs(suspected.length - legitimate.length) === 1) {
            const longer = suspected.length > legitimate.length ? suspected : legitimate;
            const shorter = suspected.length > legitimate.length ? legitimate : suspected;

            for (let i = 0; i < longer.length; i++) {
                const removed = longer.slice(0, i) + longer.slice(i + 1);
                if (removed === shorter) {
                    return true;
                }
            }
        }

        // Check for character swaps
        for (let i = 0; i < legitimate.length - 1; i++) {
            const swapped = legitimate.slice(0, i) +
                legitimate[i + 1] +
                legitimate[i] +
                legitimate.slice(i + 2);
            if (suspected === swapped) {
                return true;
            }
        }

        return false;
    },

    /**
     * Check for suspicious TLD
     */
    checkSuspiciousTLD(domain) {
        for (const tld of this.suspiciousTLDs) {
            if (domain.endsWith(tld)) {
                return {
                    detected: true,
                    type: 'Suspicious Domain Extension',
                    description: `The ${tld} extension is commonly used in phishing attacks`,
                    severity: 60,
                    details: 'Legitimate companies typically use standard extensions like .com, .org, or country codes'
                };
            }
        }
        return { detected: false };
    },

    /**
     * Check for suspicious subdomains
     */
    checkSuspiciousSubdomain(domain) {
        const parts = domain.split('.');

        // Check for brand names in subdomain (e.g., amazon-login.suspicious.com)
        if (parts.length > 2) {
            const subdomain = parts.slice(0, -2).join('.');

            for (const brand of Object.keys(this.legitimateDomains)) {
                if (subdomain.includes(brand)) {
                    const mainDomain = parts.slice(-2).join('.');
                    const isLegit = this.legitimateDomains[brand].includes(domain);

                    if (!isLegit) {
                        return {
                            detected: true,
                            type: 'Suspicious Subdomain',
                            description: `Subdomain contains "${brand}" but main domain is ${mainDomain}`,
                            severity: 85,
                            details: `This may be an attempt to impersonate ${brand}. Check the full domain carefully.`
                        };
                    }
                }
            }
        }
        return { detected: false };
    },

    /**
     * Calculate similarity between two domains using Levenshtein distance
     */
    calculateSimilarity(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        const distance = matrix[str2.length][str1.length];
        const maxLength = Math.max(str1.length, str2.length);
        return 1 - (distance / maxLength);
    },

    /**
     * Check domain similarity to known brands
     */
    checkDomainSimilarity(domain) {
        const baseDomain = domain.split('.')[0]; // Get the main part before TLD

        for (const [brand, legitDomains] of Object.entries(this.legitimateDomains)) {
            const similarity = this.calculateSimilarity(baseDomain, brand);

            if (similarity > 0.7 && baseDomain !== brand) {
                const isActuallyLegit = legitDomains.includes(domain);

                if (!isActuallyLegit) {
                    return {
                        detected: true,
                        type: 'Similar Domain Name',
                        description: `Domain name is similar to "${brand}"`,
                        severity: 75,
                        details: `This domain closely resembles ${brand} but may not be legitimate`
                    };
                }
            }
        }
        return { detected: false };
    },

    /**
     * Check if domain is an IP address (suspicious for major brands)
     */
    checkIPAddress(domain) {
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;

        if (ipPattern.test(domain)) {
            return {
                detected: true,
                type: 'IP Address',
                description: 'Website is accessed via IP address instead of domain name',
                severity: 70,
                details: 'Legitimate websites typically use domain names, not IP addresses'
            };
        }
        return { detected: false };
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.PhishingDetector = PhishingDetector;
}
