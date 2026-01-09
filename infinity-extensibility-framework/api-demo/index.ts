import r2wc from "@r2wc/react-to-web-component";
import Element from "./Element";

// Convert React component to web component and register it
const WebElement = r2wc(Element, {
  props: {
    // Add any props your element needs here
  },
});

// Register as custom element
customElements.define("api-demo", WebElement);
