# Dark Pattern Shield

**AI-Powered Dark Pattern Detection Browser Extension**

A Chrome browser extension that uses NLP-based analysis to detect deceptive UI patterns (dark patterns) in real-time and warn users before they are misled.

## 🛡️ Features

- **Real-time Detection**: Automatically scans pages for dark patterns as you browse
- **10 Pattern Categories**: Detects confirmshaming, hidden costs, fake urgency, scarcity, tricky wording, visual manipulation, forced action, preselection, misdirection, and cookie manipulation
- **NLP Analysis**: Uses sentiment analysis and manipulation scoring to identify deceptive text
- **Visual Warnings**: Highlights suspicious elements with informative tooltips
- **Customizable**: Adjust sensitivity levels and overlay preferences
- **Privacy-First**: All analysis happens locally in your browser

## 📦 Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the `idea spirit` folder containing this extension
6. The shield icon will appear in your browser toolbar

## 🚀 Usage

1. **Browse normally** - the extension scans pages automatically
2. **Click the extension icon** to see scan results
3. **Detected patterns** are highlighted on the page
4. **Hover over highlights** to see details about the dark pattern
5. **Click items in the popup** to jump to that element on the page

## ⚙️ Settings

- **Protection Toggle**: Enable/disable scanning
- **Sensitivity Level**: Low, Medium, or High detection threshold
- **Show Overlay**: Toggle visual highlights on/off
- **Sound Notifications**: Alert sounds for high-risk patterns

## 🎯 Detected Dark Patterns

| Pattern | Description |
|---------|-------------|
| Confirmshaming | Guilt-tripping language to pressure decisions |
| Hidden Costs | Fees revealed only at checkout |
| Fake Urgency | Countdown timers and false time pressure |
| Scarcity | False claims about limited availability |
| Tricky Wording | Confusing double-negatives and opt-outs |
| Visual Manipulation | Button size/color disparities |
| Forced Action | Mandatory actions to proceed |
| Preselection | Pre-checked options against user interest |
| Cookie Manipulation | Deceptive cookie consent banners |
| Misdirection | Hidden important information |

## 🧪 Testing

Open `test-dark-patterns.html` in your browser to see the extension detect various dark pattern examples.

## 📁 Project Structure

```
idea spirit/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup UI
├── popup.css              # Popup styles
├── popup.js               # Popup controller
├── content.js             # Page content script
├── background.js          # Service worker
├── test-dark-patterns.html # Test page with examples
├── detector/
│   ├── patterns.js        # Pattern definitions
│   ├── nlp.js             # NLP analysis module
│   └── analyzer.js        # Main detection engine
├── ui/
│   ├── overlay.js         # Warning overlay system
│   └── styles.css         # Injected page styles
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🔒 Privacy

- No data is collected or transmitted
- All analysis is performed locally in your browser
- No external API calls are made
- Your browsing history stays private

## 📄 License

MIT License - Free to use, modify, and distribute.

---

**Made with 💜 to promote ethical web design and protect user privacy.**
