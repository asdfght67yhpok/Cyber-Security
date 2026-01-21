/**
 * Dark Pattern Shield - NLP Analysis Module
 * Provides text analysis, sentiment detection, and manipulation scoring
 */

const NLPAnalyzer = {
    // Negative sentiment words indicating manipulation
    manipulativeWords: {
        urgency: ['now', 'hurry', 'quick', 'fast', 'immediately', 'instant', 'rush', 'urgent', 'asap', 'today', 'tonight', 'limited'],
        fear: ['miss', 'lose', 'losing', 'lost', 'gone', 'expire', 'end', 'last', 'final', 'never', 'risk', 'danger', 'warning'],
        exclusivity: ['exclusive', 'special', 'unique', 'rare', 'limited', 'only', 'select', 'vip', 'premium', 'elite'],
        social: ['everyone', 'popular', 'trending', 'bestseller', 'favorite', 'loved', 'recommended', 'trusted', 'verified'],
        shame: ['don\'t', 'hate', 'stupid', 'fool', 'foolish', 'miss out', 'regret', 'sorry', 'mistake', 'wrong'],
        pressure: ['must', 'need', 'have to', 'required', 'mandatory', 'necessary', 'essential', 'important', 'critical']
    },

    // Positive words often used in dark patterns
    deceivingPositives: ['free', 'save', 'savings', 'discount', 'deal', 'best', 'great', 'amazing', 'incredible', 'huge', 'massive', 'bonus', 'gift', 'reward', 'win', 'winner'],

    // Double negative patterns
    doubleNegativePatterns: [
        /not\s+un/gi,
        /don'?t\s+not/gi,
        /no\s+non/gi,
        /never\s+not/gi,
        /without\s+not/gi,
        /unless\s+not/gi
    ],

    // Confusion indicators
    confusionPatterns: [
        /\bnot\b.*\bnot\b/gi,
        /\bun\w+\b.*\bun\w+\b/gi,
        /\bnon-?\w+\b.*\bnon-?\w+\b/gi,
        /opt\s*-?\s*out.*opt\s*-?\s*in/gi,
        /opt\s*-?\s*in.*opt\s*-?\s*out/gi
    ],

    /**
     * Clean and normalize text for analysis
     */
    normalizeText(text) {
        if (!text) return '';
        return text
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s'$%-]/g, ' ')
            .trim();
    },

    /**
     * Tokenize text into words
     */
    tokenize(text) {
        const normalized = this.normalizeText(text);
        return normalized.split(/\s+/).filter(word => word.length > 1);
    },

    /**
     * Calculate manipulation score (0-100)
     */
    calculateManipulationScore(text) {
        const tokens = this.tokenize(text);
        if (tokens.length === 0) return 0;

        let score = 0;
        let matches = [];

        // Check for manipulative word categories
        for (const [category, words] of Object.entries(this.manipulativeWords)) {
            for (const word of words) {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                const matchCount = (text.match(regex) || []).length;
                if (matchCount > 0) {
                    score += matchCount * 5;
                    matches.push({ category, word, count: matchCount });
                }
            }
        }

        // Check for deceiving positive words
        for (const word of this.deceivingPositives) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matchCount = (text.match(regex) || []).length;
            if (matchCount > 0) {
                score += matchCount * 3;
                matches.push({ category: 'deceiving', word, count: matchCount });
            }
        }

        // Check for double negatives
        for (const pattern of this.doubleNegativePatterns) {
            if (pattern.test(text)) {
                score += 15;
                matches.push({ category: 'doubleNegative', pattern: pattern.toString() });
            }
        }

        // Check for confusion patterns
        for (const pattern of this.confusionPatterns) {
            if (pattern.test(text)) {
                score += 10;
                matches.push({ category: 'confusion', pattern: pattern.toString() });
            }
        }

        // Normalize score based on text length
        const lengthFactor = Math.min(tokens.length / 10, 1);
        score = Math.min(score * lengthFactor, 100);

        return {
            score: Math.round(score),
            matches,
            tokens: tokens.length
        };
    },

    /**
     * Analyze sentiment of text
     */
    analyzeSentiment(text) {
        const normalized = this.normalizeText(text);

        const positiveWords = ['great', 'good', 'best', 'love', 'amazing', 'wonderful', 'excellent', 'fantastic', 'happy', 'enjoy', 'benefit', 'success', 'win', 'reward', 'free', 'save', 'easy', 'simple', 'fast', 'quick'];
        const negativeWords = ['bad', 'worst', 'hate', 'terrible', 'awful', 'horrible', 'sad', 'angry', 'fail', 'lose', 'miss', 'risk', 'danger', 'hard', 'difficult', 'slow', 'expensive', 'cost', 'pay', 'charge'];

        let positiveCount = 0;
        let negativeCount = 0;

        for (const word of positiveWords) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            positiveCount += (normalized.match(regex) || []).length;
        }

        for (const word of negativeWords) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            negativeCount += (normalized.match(regex) || []).length;
        }

        const total = positiveCount + negativeCount;
        if (total === 0) {
            return { sentiment: 'neutral', score: 0, positive: 0, negative: 0 };
        }

        const sentimentScore = (positiveCount - negativeCount) / total;
        let sentiment = 'neutral';
        if (sentimentScore > 0.2) sentiment = 'positive';
        else if (sentimentScore < -0.2) sentiment = 'negative';

        return {
            sentiment,
            score: sentimentScore,
            positive: positiveCount,
            negative: negativeCount
        };
    },

    /**
     * Detect emotional manipulation
     */
    detectEmotionalManipulation(text) {
        const normalized = this.normalizeText(text);

        const manipulationIndicators = {
            guilt: [
                /you('ll|'re| will| are)\s+missing/gi,
                /don'?t\s+you\s+want/gi,
                /are\s+you\s+sure\s+you\s+don'?t/gi,
                /most\s+people\s+(choose|select|prefer)/gi,
                /you('ll|'re| will| are)\s+one\s+of\s+the\s+few/gi
            ],
            fear: [
                /you('ll|'re| will| are)\s+(lose|losing|miss)/gi,
                /before\s+it'?s\s+too\s+late/gi,
                /won'?t\s+be\s+able\s+to/gi,
                /risk\s+(of\s+)?(losing|missing)/gi,
                /protect\s+(yourself|your)/gi
            ],
            flattery: [
                /you('re|\s+are)\s+(smart|clever|wise)/gi,
                /people\s+like\s+you/gi,
                /exclusive\s+(offer\s+)?for\s+you/gi,
                /specially?\s+(selected|chosen)/gi,
                /vip|premium\s+member/gi
            ],
            scarcity: [
                /only\s+\d+\s+(left|remaining|available)/gi,
                /limited\s+(time|quantity|stock|edition)/gi,
                /\d+\s+people\s+(are\s+)?viewing/gi,
                /selling\s+(out\s+)?fast/gi,
                /high\s+demand/gi
            ]
        };

        const detected = {};
        let totalScore = 0;

        for (const [type, patterns] of Object.entries(manipulationIndicators)) {
            detected[type] = [];
            for (const pattern of patterns) {
                const matches = normalized.match(pattern);
                if (matches) {
                    detected[type].push(...matches);
                    totalScore += matches.length * 10;
                }
            }
        }

        return {
            detected,
            totalScore: Math.min(totalScore, 100),
            hasManipulation: totalScore > 0
        };
    },

    /**
     * Check if text contains double negatives
     */
    hasDoubleNegative(text) {
        for (const pattern of this.doubleNegativePatterns) {
            if (pattern.test(text)) {
                return true;
            }
        }
        return false;
    },

    /**
     * Extract key phrases from text
     */
    extractKeyPhrases(text, maxPhrases = 5) {
        const normalized = this.normalizeText(text);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

        const phrases = [];

        // Extract phrases around manipulative words
        for (const category of Object.values(this.manipulativeWords)) {
            for (const word of category) {
                const regex = new RegExp(`([^.!?]*\\b${word}\\b[^.!?]*)`, 'gi');
                const matches = text.match(regex);
                if (matches) {
                    phrases.push(...matches.map(m => m.trim()).slice(0, 2));
                }
            }
        }

        // Remove duplicates and limit
        return [...new Set(phrases)].slice(0, maxPhrases);
    },

    /**
     * Calculate overall confidence score
     */
    calculateConfidence(manipulationScore, emotionalScore, patternMatches) {
        // Weight the different factors
        const weights = {
            manipulation: 0.35,
            emotional: 0.3,
            patterns: 0.35
        };

        // Normalize pattern matches (assume max 10 matches = 100%)
        const patternScore = Math.min(patternMatches * 10, 100);

        const confidence =
            (manipulationScore * weights.manipulation) +
            (emotionalScore * weights.emotional) +
            (patternScore * weights.patterns);

        return Math.round(Math.min(confidence, 100));
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.NLPAnalyzer = NLPAnalyzer;
}
