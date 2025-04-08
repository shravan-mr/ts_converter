// Create context menu item on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convert-timestamp",
    title: "Convert Timestamp to IST",
    contexts: ["selection"],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convert-timestamp" && tab?.id) {
    chrome.tabs
      .sendMessage(tab.id, {
        action: "convertSelection",
        text: info.selectionText,
      })
      .catch((error) => {
        console.error(
          "[_ts Converter] Error sending selection to content script:",
          error.message
        );
      });
  }
});
