# Test Sites for Dark Pattern Detection

This folder contains **completely fictional fake websites** for testing the Dark Pattern Shield extension.

## ⚠️ THESE ARE NOT REAL BRANDS - For Testing Only!

All websites in this folder use **fictional company names**. They are safe educational examples for testing your extension.

---

## Test Files

### 1. [fake-securebank.html](file:///C:/Users/saipr/OneDrive/idea%20spirit/test-sites/fake-securebank.html)
**Fictional Company**: SecureBank (Banking)
- **Tests**: Local file detection
- **Expected Threat**: 85% (Local File Website)
- **Dark Patterns**: Fake urgency ("unusual login detected")

### 2. [fake-shopmart.html](file:///C:/Users/saipr/OneDrive/idea%20spirit/test-sites/fake-shopmart.html)
**Fictional Company**: ShopMart (E-commerce)
- **Tests**: Local file detection + dark patterns
- **Expected Threat**: 85% (Local File Website)
- **Dark Patterns**: 
  - Fake urgency ("LIMITED TIME OFFER")
  - Scarcity ("Only 3 spots remaining")
  - Forced action ("Login now to claim")

### 3. [fake-streamflix.html](file:///C:/Users/saipr/OneDrive/idea%20spirit/test-sites/fake-streamflix.html)
**Fictional Company**: StreamFlix (Streaming Service)
- **Tests**: Local file detection + dark patterns
- **Expected Threat**: 85% (Local File Website)
- **Dark Patterns**:
  - Fake urgency ("trial expires in 24 hours")
  - Fear tactics ("avoid losing access")

---

## How to Test

### Step 1: Reload Extension
1. Go to `chrome://extensions/`
2. Find "Dark Pattern Shield"
3. Click the reload icon 🔄

### Step 2: Open Test Files
Drag any HTML file to Chrome, or navigate to:
- `file:///C:/Users/saipr/OneDrive/idea spirit/test-sites/fake-securebank.html`
- `file:///C:/Users/saipr/OneDrive/idea spirit/test-sites/fake-shopmart.html`
- `file:///C:/Users/saipr/OneDrive/idea spirit/test-sites/fake-streamflix.html`

### Step 3: Verify Detection
**Expected Results**:
- 🚨 **Phishing Alert**: Full-screen warning popup for local file detection
- 🛡️ **Dark Pattern Detection**: Highlights on urgency/scarcity text
- 📊 **Badge**: Extension badge shows threat count

---

## What Each Page Tests

### fake-securebank.html
- ✅ Banking-style phishing page
- ✅ Professional design
- ✅ Warning message to create urgency
- ✅ Login form credential harvesting

### fake-shopmart.html 
- ✅ E-commerce phishing
- ✅ Multiple urgency tactics
- ✅ Fake scarcity ("only 3 spots")
- ✅ Persuasive benefits list
- ✅ Premium member manipulation

### fake-streamflix.html
- ✅ Subscription service phishing
- ✅ Trial expiration fear
- ✅ Premium features bait
- ✅ Dark themed design

---

## Additional Tests

### Your Fake Amazon
Don't forget to test with your existing fake Amazon:
- Location: `C:\Users\saipr\OneDrive\fake amazon\index.html`
- Expected: 95% threat (local file + brand impersonation)

---

## Safety Notes

✅ **100% Safe for Testing**:
- Completely fictional company names
- No real brands imitated
- Local HTML files only
- No backend or data submission
- Educational purposes only

🎓 **Learning Value**:
- Understand how phishing sites look
- See how dark patterns manipulate users
- Test your extension's detection capabilities
- Practice identifying fake websites

---

## Key Detection Triggers

Your extension will catch these because:
1. **File Protocol**: `file://` URLs are flagged
2. **Dark Pattern Text**: Urgency, scarcity, fear keywords
3. **Visual Manipulation**: Prominent "accept" buttons
4. **Suspicious Design**: Login forms on local files

Happy testing! 🛡️
