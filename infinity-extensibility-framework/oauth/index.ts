import r2wc from "@r2wc/react-to-web-component";
import OAuthDemo from "./Element";

// Convert React component to web component
const WebElement = r2wc(OAuthDemo, {
  props: {
    "client-id": "string",
    "redirect-uri": "string",
  },
});

// Register the custom element
customElements.define("oauth-demo", WebElement);
