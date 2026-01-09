# OAuth Testing Demo Element

A comprehensive **single-file** element for testing OAuth 2.0 flows with Keycloak using **popup-based authentication**. Demonstrates Implicit and PKCE flows with SSO capabilities and token information display.

## ✨ Features

- ✅ **Self-Contained**: No separate callback file needed - handles OAuth callbacks itself
- ✅ **Popup-Based**: Better UX - users stay on the same page, no reloads
- ✅ **Multiple Flows**: Test Implicit and PKCE (recommended) flows side-by-side
- ✅ **Iframe Compatible**: Works in sandboxed iframes with proper permissions
- ✅ **Token Management**: Built-in validation and user profile display
- ✅ **Single File Deployment**: Just upload one JavaScript file

## 🔒 Iframe Sandbox Permissions

Elements are embedded using `srcdoc` (opaque origin) with these permissions:

```html
<iframe
  sandbox="allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
  allow="local-network-access"
  srcdoc="<!-- element HTML content -->"
>
</iframe>
```

**Sandbox Permissions Explained:**

- `allow-scripts` - Enables JavaScript execution
- `allow-popups` - Required to open OAuth popup window
- `allow-forms` - Allows form submission for OAuth redirects
- `allow-popups-to-escape-sandbox` - Allows OAuth popup to navigate freely

**Allow Permissions Explained:**

- `local-network-access` - Allows the element to make network requests to local/private network resources

> **Note:** The `srcdoc` attribute creates an opaque (null) origin. The element runs in a fully sandboxed environment with no direct access to the parent page.

📋 **See `iframe-example.html` for a complete working example!**

## OAuth Flows

### 1. Implicit Grant Flow

- Simplest flow for browser-based applications
- Access token returned directly in URL fragment
- ⚠️ Less secure, tokens visible in browser history

### 2. Authorization Code with PKCE (Recommended)

- Most secure flow for public clients
- Uses code verifier/challenge to prevent attacks
- **No client secret required** - perfect for SPAs
- ✅ **Recommended** for modern applications

## Setup

### Prerequisites

1. **Keycloak Admin Console**: Configure your OAuth client at your Keycloak server
2. **Add Redirect URIs**: Add the page URL that loads the element to your Keycloak client

For development:

```
http://localhost:5173/
http://localhost:5174/
```

For production:

```
https://yourdomain.com/
https://yourdomain.com/your-page.html
```

⚠️ **Important**: The redirect URI must point to the page loading the `<oauth-demo>` element. The element handles callbacks itself!

### Default Configuration

Pre-configured with:

- **Realm**: `avaya`
- **Client ID**: `jashmore-web-component`

### Keycloak Client Configuration

- **Access Type**: `public`
- **Standard Flow Enabled**: ON
- **Implicit Flow Enabled**: ON (if using Implicit flow)
- **Valid Redirect URIs**: Include your application URL(s)

## Running the Demo

### Development Mode

```bash
npm run dev:oauth
```

Then open: `http://localhost:5173/oauth/`

### Build for Production

```bash
npm run build:oauth
```

Output files in `dist/oauth/`:

- `oauth.es.js` - ES module format
- `oauth.umd.js` - UMD format (for older browsers)

## Using the Element

### Basic Usage

```html
<!DOCTYPE html>
<html>
  <head>
    <script type="module" src="oauth.es.js"></script>
  </head>
  <body>
    <oauth-demo></oauth-demo>
  </body>
</html>
```

### With Custom Configuration

```html
<oauth-demo
  client-id="your-keycloak-client-id"
  redirect-uri="http://localhost:3000/"
>
</oauth-demo>
```

**Important**: The `redirect-uri` must:

- Point to the page loading this element
- Be exactly configured in Keycloak's Valid Redirect URIs
- Use the same protocol (http/https) and port

Note: The element uses the `<oauth-demo>` tag name.

### Single File Deployment

```
your-server/
├── oauth.es.js      # Single file - that's it!
└── index.html       # Your page using the element
```

## Testing Flows

All flows use **popup windows** for authentication:

### Testing Implicit Flow

1. Click "Sign in with Implicit Flow"
2. Authenticate in the popup window
3. Popup closes automatically
4. User profile displays

### Testing PKCE Flow (Recommended)

1. Click "Sign in with PKCE Flow"
2. Code verifier/challenge generated automatically
3. Authenticate in the popup window
4. Authorization code exchanged for token
5. User profile displays

### 🚫 Popup Blockers

If popup doesn't open:

- Allow popups for your domain
- Ensure OAuth triggered from user action (button click)
- Check browser extensions aren't blocking

## Token Operations

### Validate Token

- Click "Validate Token" to verify and see user info
- Test with expired tokens to see error handling

### Check Token Info

- Click "📊 Check Token Info" to view:
  - User ID and username
  - Email address
  - OAuth scopes granted
  - Timestamp of check

## Scopes Requested

- `openid` - OpenID Connect authentication
- `profile` - Basic profile information
- `email` - Email address

## Troubleshooting

### Blob URL / Iframe Issues

Pass `redirect-uri` prop explicitly:

```html
<oauth-demo redirect-uri="http://localhost:3000/"></oauth-demo>
```

### "redirect_uri_mismatch" Error

1. Go to Keycloak Admin Console
2. Navigate to your realm → Clients → your-client-id
3. Add exact redirect URI to "Valid Redirect URIs"
4. Save (note: trailing slashes matter!)

### Popup Doesn't Open

- Check browser's popup blocker
- Verify `allow-popups` in iframe sandbox
- Ensure OAuth triggered from user action

### Still Having Issues?

1. **Check browser console** - Element logs the redirect URI it's using
2. **Copy exact URI** and add to Keycloak Admin Console
3. **Wait a few seconds** after Keycloak changes
4. **Try incognito mode** to rule out cache issues

## Technical Details

### Files Structure

- **index.html** - Main demo page
- **iframe-example.html** - Iframe sandbox configuration example
- **Element.tsx** - React component with OAuth logic
- **index.ts** - Web component registration

### How It Works

1. User clicks authentication button
2. Popup opens with Keycloak OAuth URL
3. User authenticates in popup
4. Keycloak redirects with OAuth response
5. Element processes response via URL parameters
6. Popup closes automatically
7. User profile displays

### API Endpoints

All endpoints use: `/auth/realms/avaya/protocol/openid-connect/`

- **Authorization**: `/auth`
- **Token Exchange**: `/token`
- **User Info**: `/userinfo`

## Learn More

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
- [PKCE RFC](https://tools.ietf.org/html/rfc7636)
- [OpenID Connect](https://openid.net/connect/)

## License

This sample is part of the Core Extensibility Framework samples collection.
