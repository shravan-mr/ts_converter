(() => {
  // Utility functions
  const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  // Convert Unix timestamp to IST and relative time
  function convertTimestampToIST(ts) {
    try {
      if (!ts || isNaN(ts)) throw new Error("Invalid timestamp");

      const date = new Date(ts * 1000);
      const now = new Date();
      const diffMs = now - date;

      // Validate date
      if (date.toString() === "Invalid Date")
        throw new Error("Invalid date conversion");

      // Time units in milliseconds
      const TIME_UNITS = {
        second: 1000,
        minute: 60000,
        hour: 3600000,
        day: 86400000,
        week: 604800000,
      };

      // Calculate relative time
      let relativeTime;
      if (diffMs < TIME_UNITS.minute) {
        const seconds = Math.floor(diffMs / TIME_UNITS.second);
        relativeTime = `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
      } else if (diffMs < TIME_UNITS.hour) {
        const minutes = Math.floor(diffMs / TIME_UNITS.minute);
        relativeTime = `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
      } else if (diffMs < TIME_UNITS.day) {
        const hours = Math.floor(diffMs / TIME_UNITS.hour);
        relativeTime = `${hours} hour${hours !== 1 ? "s" : ""} ago`;
      } else if (diffMs < TIME_UNITS.week) {
        const days = Math.floor(diffMs / TIME_UNITS.day);
        relativeTime = `${days} day${days !== 1 ? "s" : ""} ago`;
      } else {
        const weeks = Math.floor(diffMs / TIME_UNITS.week);
        relativeTime = `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
      }

      const formatted = date.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      return { formatted, relative: relativeTime };
    } catch (e) {
      console.error("[_ts Converter] Conversion error:", e);
      throw new Error("Failed to convert timestamp");
    }
  }

  // Toast notification system
  const Toast = {
    init() {
      if (document.getElementById("ts-toast-style")) return;

      const style = document.createElement("style");
      style.id = "ts-toast-style";
      style.textContent = `
        .ts-toast {
          position: fixed;
          bottom: 80px;
          right: 20px;
          padding: 14px 20px;
          border-radius: 8px;
          z-index: 10000;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          background-color: #4CAF50;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
          max-width: 300px;
          line-height: 1.4;
        }
        .ts-toast.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .ts-toast-error { background-color: #e74c3c; }
        .ts-toast-info { background-color: #2c3e50; }
        .ts-toast-success { background-color: #4CAF50; }
      `;
      document.head.appendChild(style);
    },

    show(message, { type = "success", duration = 3000 } = {}) {
      const id = "ts-converter-notification";
      let notification = document.getElementById(id);

      if (!notification) {
        notification = document.createElement("div");
        notification.id = id;
        document.body.appendChild(notification);
      }

      notification.className = `ts-toast ts-toast-${type}`;
      notification.innerHTML = message;

      requestAnimationFrame(() => {
        notification.classList.add("visible");

        setTimeout(() => {
          notification.classList.remove("visible");
          setTimeout(() => notification?.remove(), 300);
        }, duration);
      });
    },
  };

  // Timestamp extraction and validation
  function extractTimestamp(text) {
    if (!text) return null;

    const patterns = [
      /"_ts"\s*:\s*(\d+)/,
      /'_ts'\s*:\s*(\d+)/,
      /_ts=(\d+)/,
      /timestamp["']?\s*[=:]\s*["']?(\d+)["']?/i,
      /\b(\d{13})\b/,
      /\b(\d{10})\b/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match?.[1]) {
        const ts = parseInt(match[1], 10);
        const year = new Date(
          ts * (match[1].length === 13 ? 1 : 1000)
        ).getFullYear();
        if (year >= 2000 && year <= 2100) return ts;
      }
    }

    return null;
  }

  // Main conversion function
  async function convertTimestamps() {
    try {
      const clipboardText = await navigator.clipboard.readText();

      if (!clipboardText) {
        throw new Error(
          "Clipboard is empty. Copy a text with _ts value first."
        );
      }

      const ts = extractTimestamp(clipboardText);
      if (!ts) {
        throw new Error(
          "No valid timestamp found. Copy a text containing _ts."
        );
      }

      const { formatted, relative } = convertTimestampToIST(ts);
      const resultHtml = `
        <div><strong>Original:</strong> ${ts}</div>
        <div><strong>Converted:</strong> ${formatted}</div>
        <div><strong>Relative:</strong> ${relative}</div>
      `;

      // Store conversion in history
      chrome.storage.local.get(["conversionHistory"], (result) => {
        const history = result.conversionHistory || [];
        const newEntry = {
          timestamp: Date.now(),
          originalValue: ts,
          convertedValue: `${formatted} (${relative})`,
        };
        history.push(newEntry);
        // Keep only last 50 entries
        if (history.length > 50) history.shift();
        chrome.storage.local.set({ conversionHistory: history });
      });

      Toast.show(resultHtml, { type: "info", duration: 8000 });
    } catch (err) {
      Toast.show(err.message, { type: "error" });
      console.error("[_ts Converter]", err);
    }
  }

  // UI Components
  function createToggleButton() {
    const button = document.createElement("button");
    button.id = "ts-converter-button";
    button.textContent = "Convert Copied _ts";

    Object.assign(button.style, {
      position: "fixed",
      bottom: "30px",
      right: "30px",
      backgroundColor: "#0078d4",
      color: "white",
      border: "none",
      padding: "12px 20px",
      borderRadius: "4px",
      cursor: "pointer",
      zIndex: "10000",
      fontSize: "14px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      fontWeight: "bold",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    });

    const toggleHover = (e) => {
      button.style.backgroundColor =
        e.type === "mouseover" ? "#106ebe" : "#0078d4";
    };

    button.addEventListener("mouseover", toggleHover);
    button.addEventListener("mouseout", toggleHover);
    button.addEventListener("click", debounce(convertTimestamps, 300));

    return button;
  }

  // Initialize extension
  function initialize() {
    Toast.init();
    document.body.appendChild(createToggleButton());
  }

  // Message handling
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case "convertTimestamp":
        convertTimestamps();
        break;
      case "convertSelection":
        if (!message.text) break;

        const ts = extractTimestamp(message.text);
        if (!ts) {
          Toast.show("No valid timestamp found in selection", {
            type: "error",
          });
          break;
        }

        try {
          const { formatted, relative } = convertTimestampToIST(ts);
          const resultHtml = `
            <div><strong>Original:</strong> ${ts}</div>
            <div><strong>Converted:</strong> ${formatted}</div>
            <div><strong>Relative:</strong> ${relative}</div>
          `;

          // Store conversion in history
          chrome.storage.local.get(["conversionHistory"], (result) => {
            const history = result.conversionHistory || [];
            const newEntry = {
              timestamp: Date.now(),
              originalValue: ts,
              convertedValue: `${formatted} (${relative})`,
            };
            history.push(newEntry);
            // Keep only last 50 entries
            if (history.length > 50) history.shift();
            chrome.storage.local.set({ conversionHistory: history });
          });

          Toast.show(resultHtml, { type: "info", duration: 8000 });
        } catch (err) {
          Toast.show("Failed to convert timestamp", { type: "error" });
        }
        break;
    }
  });

  // Start the extension
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
