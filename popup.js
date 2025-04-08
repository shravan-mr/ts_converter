document.addEventListener("DOMContentLoaded", () => {
  const historyContainer = document.getElementById("historyContainer");
  const clearButton = document.getElementById("clearHistory");

  const loadHistory = () => {
    chrome.storage.local.get(["conversionHistory"], (result) => {
      const history = result.conversionHistory || [];

      if (history.length === 0) {
        historyContainer.innerHTML =
          '<div class="no-history">No conversions yet</div>';
        return;
      }

      historyContainer.innerHTML = history
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 3)
        .map(
          (item) => `
              <div class="history-item">
                <div class="value">
                  <strong>_ts:</strong> ${item.originalValue}<br>
                  <strong>Time:</strong> ${item.convertedValue.split(" (")[0]}
                </div>
              </div>
            `
        )
        .join("");
    });
  };

  clearButton.addEventListener("click", () => {
    chrome.storage.local.set({ conversionHistory: [] }, loadHistory);
  });

  loadHistory();

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.conversionHistory) {
      loadHistory();
    }
  });
});
