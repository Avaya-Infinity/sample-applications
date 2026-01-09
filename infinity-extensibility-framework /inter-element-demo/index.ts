import r2wc from "@r2wc/react-to-web-component";
import Element from "./Element";

// Convert React component to web component and register it
const WebElement = r2wc(Element, {
  props: {
    // No props needed for this demo
  },
});

// Register as custom element
customElements.define("inter-element-demo", WebElement);
