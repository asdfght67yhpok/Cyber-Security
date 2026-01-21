/**
 * Dark Pattern Shield - Background Service Worker
 * Handles extension lifecycle and cross-tab communication
 */

// Track scan statistics
let stats = {
    totalScans: 0,
    totalThreats: 0,
    sitesScanned: new Set()
};

// Initialize on install
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('🛡️ Dark Pattern Shield: Extension installed');

        // Set default settings
        chrome.storage.local.set({
            isActive: true,
            settings: {
                sensitivity: 'medium',
                showOverlay: true,
                soundEnabled: false
            },
            stats: {
                totalScans: 0,
                totalThreats: 0,
                firstInstall: Date.now()
            }
        });
    } else if (details.reason === 'update') {
        console.log('🛡️ Dark Pattern Shield: Extension updated');
    }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'scanComplete':
            handleScanComplete(message.results, sender.tab);
            break;

        case 'phishingDetected':
            handlePhishingDetected(message.results, sender.tab);
            break;

        case 'getStats':
            sendResponse(stats);
            break;
    }

    return true;
});

// Handle scan completion
function handleScanComplete(results, tab) {
    stats.totalScans++;
    stats.totalThreats += results.threats;

    if (tab?.url) {
        try {
            const hostname = new URL(tab.url).hostname;
            stats.sitesScanned.add(hostname);
        } catch (e) { }
    }

    // Update badge if threats found
    if (results.threats > 0) {
        updateBadge(tab?.id, results.threats);
    } else {
        clearBadge(tab?.id);
    }
}

// Handle phishing detection
function handlePhishingDetected(results, tab) {
    console.log('🚨 Phishing detected:', results);

    // Update badge with special color for phishing
    if (tab?.id) {
        chrome.action.setBadgeText({
            tabId: tab.id,
            text: '⚠️'
        });

        chrome.action.setBadgeBackgroundColor({
            tabId: tab.id,
            color: '#dc2626'  // Darker red for phishing
        });
    }
}

// Update extension badge with threat count
function updateBadge(tabId, count) {
    if (!tabId) return;

    chrome.action.setBadgeText({
        tabId,
        text: count > 99 ? '99+' : count.toString()
    });

    chrome.action.setBadgeBackgroundColor({
        tabId,
        color: count > 5 ? '#ef4444' : '#f59e0b'
    });
}

// Clear badge
function clearBadge(tabId) {
    if (!tabId) return;

    chrome.action.setBadgeText({
        tabId,
        text: ''
    });
}

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Clear badge when navigating to new page
    if (changeInfo.status === 'loading') {
        clearBadge(tabId);
    }
});

console.log('🛡️ Dark Pattern Shield: Background service worker started');
