# Agent Status Auto Manager

This sample element demonstrates automatic agent status management based on interaction updates.

## Features

- Listens to `onInteractionUpdate` events from the ElementAPI
- Automatically sets agent status to **"busy"** when interaction status becomes **"connected"**
- Automatically sets agent status to **"ready"** when interaction status changes away from **"connected"**
- Displays real-time event log of all status changes
- Shows current interaction status and agent status

## How It Works

The element uses the ElementAPI to:

1. **Get User Info** - Retrieves the current user's ID needed for agent status changes
2. **Listen to Interaction Updates** - Subscribes to `onInteractionUpdated` events
3. **Track Status Changes** - Monitors when the interaction status changes to/from "connected"
4. **Update Agent Status** - Calls `setAgentStatus` API to change the agent's status automatically

## Usage

### Development Mode

```bash
npm run dev:agent-status-auto
```

Then open your browser to the URL shown in the terminal (typically http://localhost:5173)

### Build

```bash
npm run build:agent-status-auto
```

The built files will be in `dist/agent-status-auto/`

## Integration

To integrate this element into your application:

1. Include the built JavaScript file:
```html
<script src="agent-status-auto.umd.js"></script>
```

2. Add the custom element to your HTML:
```html
<agent-status-auto></agent-status-auto>
```

## API Methods Used

- `getUserInfo()` - Get the current user's information
- `onInteractionUpdated(callback)` - Subscribe to interaction update events
- `setAgentStatus(userId, status)` - Change the agent's status

## Event Flow

```
Interaction Status: "connected"
    ↓
Element detects change
    ↓
Calls setAgentStatus(userId, { id: "busy", name: "busy" })
    ↓
Agent Status: "busy"

---

Interaction Status: "wrapup" (or any status != "connected")
    ↓
Element detects change from "connected"
    ↓
Calls setAgentStatus(userId, { id: "ready", name: "ready" })
    ↓
Agent Status: "ready"
```

## Notes

- The element requires a valid user session to function properly
- Agent status changes are logged in the event log with timestamps
- Errors are displayed if the status change fails
- The element cleans up all event listeners when unmounted

