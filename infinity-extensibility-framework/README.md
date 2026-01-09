# @avaya/infinity-elements-sdk Samples

CLI tool for scaffolding React-to-web-component projects.

## Installation

```bash
npm install -g @avaya/infinity-elements-sdk
```

## Usage

### Initialize a new project

```bash
infinity init my-element
cd my-element
```

> **Note:** Element names must follow the [W3C Custom Elements spec](https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name): contain a hyphen, start with lowercase letter, be all lowercase (e.g., `my-element`, `user-profile`).

### Start development server

```bash
infinity dev
```

### Build for production

```bash
infinity build
```

## What it creates

The CLI scaffolds a complete React project that compiles to a web component using r2wc:

- React component with TypeScript
- CSS Modules for styling
- Vite for building and dev server
- Ready-to-use web component

## Generated Project Structure

```
my-element/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── Element.tsx         # Your React component
    ├── Element.module.css   # CSS Module
    └── index.ts            # Web component wrapper
```

## Element Properties (Variables)

InfinityElements support configurable properties that administrators set in the Configuration UI. These are passed to your element as [HTML attributes](https://html.spec.whatwg.org/multipage/syntax.html#attributes-2) and converted to React props by r2wc.

```typescript
// Define and use props in Element.tsx
interface ElementProps {
  theme?: string;
  title?: string;
}

const Element: React.FC<ElementProps> = ({ theme = "light", title }) => (
  <div className={theme}>{title}</div>
);

// Register props in index.ts
const WebElement = r2wc(Element, React, ReactDOM, {
  props: { theme: "string", title: "string" },
});
```

All values are strings - convert as needed in your element.

```html
<my-element theme="light" title="Supervisor"></my-element>
```

## License

MIT
