# Inter-Element Communication Demo

This sample demonstrates the inter-element communication functionality of the Infinity Extensibility Framework using the `inter-element` BroadcastChannel.

The demo is packaged as a custom web component `<inter-element-demo>` using the `@r2wc/react-to-web-component` library.

## Usage

To use the web component in your HTML:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Inter-Element Demo</title>
  </head>
  <body>
    <inter-element-demo></inter-element-demo>
    <script
      type="module"
      src="./dist/inter-element-demo/inter-element-demo.es.js"
    ></script>
  </body>
</html>
```

## Features

- **Send Messages**: Send typed messages to other element instances
- **Watch Messages**: Receive messages from other instances using an AsyncIterator
- **Type Safety**: Full TypeScript generic support for message types

## API Methods

### `sendInterElementMessage<T>(message: T): void`

Sends a message to all other element instances listening on the `inter-element` channel.

**Parameters:**

- `message` - The message to send (must be serializable)

**Example:**

```typescript
interface MyMessage {
  from: string;
  text: string;
  timestamp: number;
}

const message: MyMessage = {
  from: "Element-1",
  text: "Hello, World!",
  timestamp: Date.now(),
};

api.sendInterElementMessage(message);
```

### `watchInterElementMessages<T>(): AsyncIterableIterator<T>`

Returns an AsyncIterableIterator that yields messages as they arrive from other element instances.

**Returns:**

- `AsyncIterableIterator<T>` - An async iterator that yields messages of type T

**Example:**

```typescript
// Using for-await-of loop
for await (const message of api.watchInterElementMessages<MyMessage>()) {
  console.log("Received:", message);
  // Process the message
}

// Using async/await with manual iteration
const iterator = api.watchInterElementMessages<MyMessage>();
while (true) {
  const { value, done } = await iterator.next();
  if (done) break;
  console.log("Received:", value);
}
```

## How to Test

1. **Start the development server:**

   ```bash
   cd Samples
   npm run dev
   # or
   npm run dev:inter-element-demo
   ```

2. **Open multiple browser tabs/windows** pointing to the same URL

3. **Send messages** from any tab and watch them appear in all tabs in real-time

## Use Cases

- **Element Coordination**: Synchronize state across multiple element instances
- **Broadcast Events**: Notify all instances when important events occur
- **Shared Data**: Share data updates between elements without a central state manager
- **Multi-Tab Communication**: Communicate between the same element running in different tabs/windows

## TypeScript Generic Support

Both functions support TypeScript generics for type safety:

```typescript
// Define your message type
interface StatusUpdate {
  status: "online" | "offline" | "busy";
  userId: string;
  timestamp: number;
}

// Send with type checking
api.sendInterElementMessage<StatusUpdate>({
  status: "online",
  userId: "user123",
  timestamp: Date.now(),
});

// Receive with type checking
for await (const update of api.watchInterElementMessages<StatusUpdate>()) {
  // update is typed as StatusUpdate
  console.log(`User ${update.userId} is now ${update.status}`);
}
```

## Important Notes

- Messages are only sent to element instances within the same browser context (same origin)
- Messages must be serializable (JSON-compatible)
- The watcher is an infinite iterator - you need to manage its lifecycle (e.g., with AbortController)
- Remember to clean up resources by calling `api.destroy()` when done
