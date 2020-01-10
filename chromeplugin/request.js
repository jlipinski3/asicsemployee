//background script notifies content script that the tab changed
chrome.tabs.onUpdated.addListener(function (tabId , info) {
  if (info.status === 'complete') {
    chrome.tabs.sendMessage(tabId, 'content-change');
  }
});