import r2wc from "@r2wc/react-to-web-component";
import DomTestCard from "./Element";

// Convert React component to web component
const WebElement = r2wc(DomTestCard, {
  props: {
    theme: "string",
  },
});

// Register the custom element
customElements.define("dom-test-card", WebElement);
