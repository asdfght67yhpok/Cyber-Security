# 🛡️ Dark Pattern Shield - Chrome Extension

A powerful Chrome extension that protects you from dark patterns and phishing websites with real-time detection and dramatic security warnings.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/chrome-extension-yellow)

## ✨ Features

### 🎯 Dark Pattern Detection
- **Fake Urgency** - Detects artificial time pressure tactics
- **Scarcity** - Identifies false "limited stock" claims
- **Confirmshaming** - Catches guilt-tripping language
- **Hidden Costs** - Reveals undisclosed fees
- **Visual Manipulation** - Analyzes deceptive button designs
- **Misdirection** - Finds hidden information in fine print
- **And more!** - 10+ pattern types detected

### 🚨 Phishing Protection
- **URL Analysis** - Detects typosquatting (amaz0n.com)
- **Suspicious TLDs** - Flags .tk, .ml, .xyz domains
- **Subdomain Detection** - Catches amazon-login.evil.com
- **Brand Impersonation** - Identifies fake brand pages
- **Content Analysis** - Scans for credential harvesting attempts
- **Local File Detection** - Warns about fake local websites

### 🎨 User Interface
- **Full-Screen Security Alerts** - Dramatic red warnings for phishing
- **Visual Highlights** - Color-coded threat indicators on page
- **Detailed Threat Info** - Clear explanations of each pattern
- **Extension Popup** - Quick overview of detected threats
- **Customizable Settings** - Adjust sensitivity and preferences

## 📸 Screenshots

### Phishing Alert
![Phishing Alert](screenshots/phishing-alert.png)
*Dramatic full-screen warning for dangerous websites*

### Dark Pattern Detection
![Dark Pattern Highlights](screenshots/dark-patterns.png)
*Real-time highlighting of manipulative elements*

### Extension Popup
![Popup Interface](screenshots/popup.png)
*Clean interface showing threat details*

## 🚀 Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store page](#) *(Coming soon)*
2. Click "Add to Chrome"
3. Confirm installation

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the extension folder
6. Extension is now active! 🎉

## 🔧 Usage

### Automatic Protection
The extension automatically scans every webpage you visit for:
- Dark patterns
- Phishing attempts
- Suspicious domains
- Credential harvesting

### Manual Scan
Click the extension icon → **Rescan Page** button

### View Threats
- Click extension icon to see detailed threat list
- Click "Jump to Element" to highlight specific threats
- View confidence scores and explanations

### Settings
- **Sensitivity**: Low, Medium, High
- **Visual Overlay**: Toggle highlights on/off
- **Protection**: Enable/disable extension

## 🛠️ Technical Details

### Architecture
```
Dark Pattern Shield/
├── manifest.json          # Extension configuration
├── background.js          # Service worker
├── content.js            # Main page scanner
├── popup.html/js/css     # Extension UI
│
├── detector/             # Detection modules
│   ├── patterns.js       # Dark pattern definitions
│   ├── nlp.js           # Text analysis
│   ├── analyzer.js      # DOM scanner
│   ├── phishing.js      # URL-based detection
│   ├── content-analyzer.js # Page content analysis
│   └── whitelist.js     # Trusted domains
│
└── ui/                   # User interface
    ├── overlay.js        # Visual highlights
    ├── threat-alert.js   # Phishing warnings
    └── styles.css        # Overlay styles
```

### Detection Algorithms
- **Levenshtein Distance** - String similarity comparison
- **Pattern Matching** - Regex-based text analysis
- **NLP Sentiment Analysis** - Emotional manipulation detection
- **DOM Analysis** - Visual hierarchy inspection
- **Heuristic Scoring** - Multi-factor threat assessment

### Technologies Used
- **Vanilla JavaScript** - No frameworks
- **Chrome Extension APIs** - Manifest V3
- **CSS3 Animations** - Modern UI effects
- **Content Scripts** - Page injection
- **Service Workers** - Background processing

## 📊 Detection Statistics

The extension currently detects:
- **10+ Dark Pattern Types**
- **20+ Phishing Indicators**
- **100+ Suspicious Keywords**
- **15+ Suspicious TLDs**
- **10+ Major Brand Domains** (for impersonation detection)

## 🧪 Testing

### Test Sites Included
The `/test-sites/` folder contains fictional fake websites:
- `fake-securebank.html` - Banking phishing
- `fake-shopmart.html` - E-commerce scams
- `fake-streamflix.html` - Subscription phishing

### How to Test
1. Install extension
2. Open any test file in browser
3. Should see immediate security warning
4. Check popup for threat details

## 🔐 Privacy & Security

- **No Data Collection** - Extension doesn't collect or transmit your data
- **Local Processing** - All analysis happens on your device
- **No External Requests** - Works completely offline
- **Open Source** - Code is publicly auditable
- **Trusted Domains** - Whitelist prevents false positives

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Setup
```bash
# Clone repository
git clone https://github.com/yourusername/dark-pattern-shield.git

# Open in Chrome
# Go to chrome://extensions
# Enable Developer Mode
# Click "Load unpacked" and select the folder
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by consumer protection initiatives
- Built with modern web security principles
- Designed for user safety and privacy

## 📧 Contact

- **Author**: Your Name
- **Email**: your.email@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)

## 🗺️ Roadmap

- [ ] Firefox extension version
- [ ] Safari extension version
- [ ] Machine learning-based detection
- [ ] Community-reported patterns
- [ ] Real-time threat database
- [ ] Browser sync settings

---

**Made with ❤️ for a safer web**

*Protect yourself from dark patterns and phishing attempts - one website at a time!*
