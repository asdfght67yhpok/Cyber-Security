/**
 * Dark Pattern Shield - Pattern Definitions
 * Contains all dark pattern types, keywords, and detection rules
 */

const DarkPatterns = {
    // Pattern categories with detection rules
    patterns: {
        CONFIRMSHAMING: {
            name: 'Confirmshaming',
            description: 'Uses guilt or shame to manipulate your decision',
            severity: 'high',
            keywords: [
                // Negative self-statements
                'no thanks, i',
                'no, i don\'t want',
                'i don\'t care about',
                'i hate saving',
                'i prefer to pay full',
                'i\'m not interested in',
                'i don\'t like',
                'not for me',
                'i\'ll pass on',
                'skip and miss out',
                'no, i want to pay more',
                'decline and lose',
                'i\'d rather not save',
                'no, keep me uninformed',
                'i don\'t need help',
                'i prefer staying',
                'no, i\'ll stay',
                'continue being',
                'remain unprotected',
                'stay vulnerable'
            ],
            phrases: [
                /no,?\s*(thanks|thank you),?\s*i('ll|'m|\s+will|\s+am|\s+would|\s+prefer)/gi,
                /i\s+(don't|do not|dont)\s+(want|need|care|like)/gi,
                /skip\s+(and\s+)?(miss|lose|pay)/gi,
                /decline\s+(and\s+)?(lose|miss|pay)/gi,
                /continue\s+(without|being|to be)/gi,
                /remain\s+(un\w+|without)/gi,
                /stay\s+(un\w+|vulnerable|unprotected)/gi,
                /i('ll|'m|\s+will|\s+would)\s+pass/gi,
                /keep\s+me\s+(un\w+|in\s+the\s+dark)/gi
            ]
        },

        HIDDEN_COSTS: {
            name: 'Hidden Costs',
            description: 'Fees revealed only at checkout or in fine print',
            severity: 'high',
            keywords: [
                'processing fee',
                'service fee',
                'handling fee',
                'convenience fee',
                'booking fee',
                'administration fee',
                'platform fee',
                'transaction fee',
                'delivery fee added',
                'taxes not included',
                'additional charges',
                'extra charges apply',
                'fees may apply',
                'subject to fees',
                'plus tax',
                'excluding tax',
                'vat not included',
                'surcharge',
                'mandatory tip'
            ],
            phrases: [
                /\+\s*\$?\d+(\.\d{2})?\s*(fee|charge|tax)/gi,
                /additional\s+\$?\d+/gi,
                /(fee|charge|cost)s?\s+(may\s+)?apply/gi,
                /prices?\s+(do\s+)?not\s+include/gi,
                /subject\s+to\s+(additional\s+)?(fee|charge|cost)/gi,
                /plus\s+\$?\d+/gi,
                /\$?\d+(\.\d{2})?\s+(service|handling|booking|processing)\s+fee/gi
            ]
        },

        FAKE_URGENCY: {
            name: 'Fake Urgency',
            description: 'Creates false time pressure to rush your decision',
            severity: 'high',
            keywords: [
                'limited time',
                'act now',
                'hurry',
                'don\'t miss',
                'last chance',
                'ending soon',
                'expires today',
                'offer ends',
                'time is running out',
                'only today',
                'today only',
                'flash sale',
                'deal expires',
                'sale ends in',
                'countdown',
                'hours left',
                'minutes left',
                'seconds left',
                'before it\'s gone',
                'while supplies last',
                'going fast',
                'selling out',
                'almost gone',
                'running out'
            ],
            phrases: [
                /only\s+\d+\s*(hours?|minutes?|days?|seconds?)\s*(left|remaining)/gi,
                /(offer|sale|deal|discount)\s+(ends?|expires?)\s+(in|today|soon|tonight|tomorrow)/gi,
                /(ends?|expires?)\s+(in\s+)?\d+:\d+/gi,
                /\d+:\d+(:\d+)?\s*(left|remaining)/gi,
                /(hurry|quick|fast|rush)[,!]?\s*(before|while|limited)/gi,
                /(last|final)\s+(chance|opportunity|day|hours?)/gi,
                /time('s|\s+is)\s+(running\s+)?out/gi,
                /don'?t\s+(miss|wait|delay)/gi
            ]
        },

        SCARCITY: {
            name: 'Scarcity',
            description: 'False claims about limited availability',
            severity: 'medium',
            keywords: [
                'only',
                'left in stock',
                'remaining',
                'low stock',
                'almost sold out',
                'selling fast',
                'high demand',
                'popular item',
                'people viewing',
                'people bought',
                'in cart',
                'limited stock',
                'limited availability',
                'limited edition',
                'exclusive',
                'rare',
                'few remaining',
                'nearly gone',
                'last one'
            ],
            phrases: [
                /only\s+\d+\s*(left|remaining|available|in\s+stock)/gi,
                /\d+\s*(people|users|customers|others)\s+(are\s+)?(viewing|looking|watching|bought)/gi,
                /\d+\s+sold\s+(in\s+)?(last|past)\s+\d+\s*(hours?|days?|minutes?)/gi,
                /(low|limited)\s+stock/gi,
                /(selling|going)\s+(fast|quickly)/gi,
                /high\s+demand/gi,
                /\d+\s+(people\s+)?have\s+this\s+in\s+(their\s+)?cart/gi,
                /(almost|nearly)\s+(sold\s+out|gone)/gi
            ]
        },

        TRICKY_WORDING: {
            name: 'Tricky Wording',
            description: 'Confusing language designed to mislead',
            severity: 'high',
            keywords: [
                'uncheck to',
                'check to not',
                'opt out',
                'unsubscribe to continue',
                'don\'t not',
                'unless you',
                'by not',
                'if you don\'t',
                'failure to',
                'non-',
                'untick',
                'deselect'
            ],
            phrases: [
                /un(check|tick|select)\s+(to|if|this)/gi,
                /(check|tick|select)\s+(to\s+)?(not|avoid|prevent|stop)/gi,
                /don'?t\s+not\s+/gi,
                /unless\s+you\s+(don'?t|do\s+not)/gi,
                /by\s+(not\s+)?(un)?(checking|selecting|ticking)/gi,
                /opt\s*-?\s*out\s+(to|of|from)/gi,
                /failure\s+to\s+(un)?/gi,
                /if\s+you\s+(don'?t|do\s+not)\s+(want|wish)/gi,
                /leave\s+(un)?checked\s+(to|if)/gi
            ]
        },

        VISUAL_MANIPULATION: {
            name: 'Visual Manipulation',
            description: 'Design tricks to guide you to certain choices',
            severity: 'medium',
            // Detected via DOM analysis, not keywords
            keywords: [],
            phrases: []
        },

        FORCED_ACTION: {
            name: 'Forced Action',
            description: 'Requires unnecessary action to proceed',
            severity: 'high',
            keywords: [
                'required to continue',
                'must accept',
                'mandatory',
                'required field',
                'cannot proceed',
                'to continue, you must',
                'agree to continue',
                'accept to proceed',
                'sign up to',
                'create account to',
                'login required',
                'register to',
                'subscribe to access',
                'subscribe to view',
                'complete survey'
            ],
            phrases: [
                /(must|have\s+to|need\s+to|required\s+to)\s+(accept|agree|subscribe|sign\s*up|register|create)/gi,
                /to\s+(continue|proceed|access|view|download),?\s+(you\s+)?(must|need|have)/gi,
                /(cannot|can'?t|won'?t\s+be\s+able\s+to)\s+(proceed|continue|access)\s+(without|unless)/gi,
                /mandatory\s+(field|registration|signup|subscription)/gi,
                /(login|sign\s*in|register|sign\s*up)\s+(required|to\s+(continue|access|view))/gi,
                /subscribe\s+to\s+(access|view|continue|unlock)/gi
            ]
        },

        PRESELECTION: {
            name: 'Preselection',
            description: 'Options pre-selected against your interest',
            severity: 'medium',
            keywords: [
                'pre-selected',
                'already selected',
                'recommended',
                'suggested',
                'default',
                'automatically',
                'by default',
                'opt-in',
                'newsletter',
                'marketing',
                'promotional',
                'special offers',
                'partner offers',
                'third party'
            ],
            phrases: [
                /send\s+(me\s+)?(emails?|offers?|promotions?|news(letters?)?)/gi,
                /receive\s+(special\s+)?offers?/gi,
                /subscribe\s+(me\s+)?to/gi,
                /keep\s+me\s+(updated|informed)/gi,
                /share\s+(my\s+)?(data|information|details)\s+with/gi,
                /partner\s+offers?/gi,
                /third\s*-?\s*party/gi,
                /marketing\s+(emails?|communications?|materials?)/gi
            ]
        },

        MISDIRECTION: {
            name: 'Misdirection',
            description: 'Draws attention away from important information',
            severity: 'medium',
            keywords: [
                'terms and conditions apply',
                'see terms',
                'see details',
                'learn more',
                'click here for details',
                'subject to',
                'restrictions apply',
                'conditions apply',
                'exclusions apply',
                'read the fine print',
                'small print',
                'asterisk'
            ],
            phrases: [
                /\*+\s*(terms|conditions|restrictions|exclusions)/gi,
                /see\s+(full\s+)?(terms|details|conditions)/gi,
                /(terms|conditions|restrictions)\s+apply/gi,
                /subject\s+to\s+(terms|conditions|availability)/gi,
                /for\s+(full\s+)?(details|terms),?\s+(see|click|visit)/gi
            ]
        },

        COOKIE_MANIPULATION: {
            name: 'Cookie Manipulation',
            description: 'Tricks to get you to accept all cookies',
            severity: 'high',
            keywords: [
                'accept all',
                'accept cookies',
                'agree all',
                'allow all',
                'enable all',
                'accept and continue',
                'i agree',
                'got it',
                'ok, i understand',
                'customize',
                'manage preferences',
                'reject all',
                'decline',
                'necessary only',
                'essential only'
            ],
            phrases: [
                /accept\s+(all\s+)?(cookies?|tracking)/gi,
                /(allow|enable)\s+all\s*(cookies?)?/gi,
                /agree\s+(to\s+)?all/gi,
                /we\s+use\s+cookies?\s+to/gi,
                /by\s+(continuing|using|browsing),?\s+(you\s+)?(agree|accept|consent)/gi,
                /this\s+(site|website)\s+uses?\s+cookies?/gi
            ]
        }
    },

    // Get all pattern types
    getPatternTypes() {
        return Object.keys(this.patterns);
    },

    // Get pattern by type
    getPattern(type) {
        return this.patterns[type];
    },

    // Get severity color
    getSeverityColor(severity) {
        const colors = {
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#10b981'
        };
        return colors[severity] || colors.medium;
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.DarkPatterns = DarkPatterns;
}
