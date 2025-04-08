# CosmosDB _ts Converter

A Chrome extension that converts Azure Cosmos DB `_ts` timestamps to human-readable IST (Indian Standard Time) format directly in the Azure portal.

## Features

- 🕒 Converts Unix timestamps to IST format with date and time
- ⏰ Shows relative time (e.g., "5 minutes ago")
- 📋 Works with clipboard content
- 📝 Maintains conversion history (last 50 entries)
- 🎯 Simple one-click conversion
- 🔄 Real-time updates
- 🎨 Clean, modern UI with toast notifications

## How It Works

The extension adds a persistent "Convert Copied _ts" button in the Azure portal. When clicked, it:

1. Reads the clipboard content
2. Extracts timestamps using various patterns:
   - `_ts` fields in JSON
   - URL parameters
   - Plain Unix timestamps (10 or 13 digits)
3. Converts the timestamp to IST
4. Displays a toast notification with:
   - Original timestamp
   - Converted date/time
   - Relative time

## Technical Implementation

- Uses Manifest V3
- Content script injects UI elements and handles conversions
- Implements debouncing for better performance
- Features a robust timestamp extraction system
- Stores conversion history using Chrome Storage API
- Modern toast notification system for feedback

### Timestamp Detection Patterns

The extension can detect timestamps in various formats:
```javascript
- "_ts": 1234567890
- '_ts': 1234567890
- _ts=1234567890
- timestamp=1234567890
- Plain 10-digit Unix timestamps
- Plain 13-digit Unix timestamps
```

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

## Usage

1. Copy any text containing a CosmosDB timestamp
2. Click the "Convert Copied _ts" button in the bottom-right corner
3. View the converted timestamp in IST format

The extension works automatically on Azure portal pages and provides instant feedback through toast notifications.

## Permissions

- `activeTab`: For accessing page content
- `storage`: For saving conversion history
- `clipboardRead`: For reading clipboard content
- `contextMenus`: For right-click menu options
- `scripting`: For dynamic script injection

## Author

Created by Shravan MR
