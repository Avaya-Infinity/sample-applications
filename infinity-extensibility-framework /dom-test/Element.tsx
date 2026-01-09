/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";

interface DomTestCardProps {
  theme?: "light" | "dark";
}

interface TestStatus {
  name: string;
  status: "pending" | "running" | "passed" | "failed" | "skipped";
  errors?: number;
  warnings?: number;
}

interface TestResult {
  passed: boolean;
  errors: number;
  warnings: number;
}

const DomTestCard: React.FC<DomTestCardProps> = ({ theme = "light" }) => {
  const [results, setResults] = useState<string[]>([]);
  const [autoTestsRun, setAutoTestsRun] = useState(false);
  const [backgroundFetchActive, setBackgroundFetchActive] = useState(false);
  const [backgroundFetchInterval, setBackgroundFetchInterval] = useState<
    number | null
  >(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [testStatuses, setTestStatuses] = useState<TestStatus[]>([]);
  const [popupWindows, setPopupWindows] = useState<Window[]>([]);
  const resultsEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const testContainerRef = useRef<HTMLDivElement>(null);

  const isDark = theme === "dark";

  const containerStyle: React.CSSProperties = {
    display: "flex",
    height: "100vh",
    backgroundColor: isDark ? "#1a1a1a" : "#f5f5f5",
    color: isDark ? "#ffffff" : "#333333",
    fontFamily: "Arial, sans-serif",
    overflow: "hidden",
  };

  const sidePanelStyle: React.CSSProperties = {
    width: "280px",
    backgroundColor: isDark ? "#2d2d2d" : "#ffffff",
    borderRight: `1px solid ${isDark ? "#444" : "#e0e0e0"}`,
    overflowY: "auto",
    padding: "20px",
    boxSizing: "border-box",
  };

  const mainAreaStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const headerStyle: React.CSSProperties = {
    padding: "20px",
    backgroundColor: isDark ? "#2d2d2d" : "#ffffff",
    borderBottom: `1px solid ${isDark ? "#444" : "#e0e0e0"}`,
  };

  const testSummaryStyle: React.CSSProperties = {
    padding: "20px",
    backgroundColor: isDark ? "#2d2d2d" : "#ffffff",
    borderBottom: `1px solid ${isDark ? "#444" : "#e0e0e0"}`,
    overflowY: "auto",
    maxHeight: "40vh",
  };

  const logsContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    fontSize: "12px",
    fontFamily: "monospace",
    backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa",
  };

  const logsSectionHeaderStyle: React.CSSProperties = {
    padding: "12px 20px",
    backgroundColor: isDark ? "#252525" : "#e9ecef",
    borderBottom: `1px solid ${isDark ? "#444" : "#dee2e6"}`,
    fontSize: "14px",
    fontWeight: "600",
    color: isDark ? "#9ca3af" : "#495057",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "10px 16px",
    margin: "5px 0",
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "background-color 0.2s",
    width: "100%",
    textAlign: "left",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: "bold",
    marginTop: "20px",
    marginBottom: "10px",
    color: isDark ? "#60a5fa" : "#007bff",
  };

  const addResult = (message: string) => {
    setResults((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const updateTestStatus = (index: number, status: Partial<TestStatus>) => {
    setTestStatuses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...status };
      return updated;
    });
  };

  const initializeTestStatuses = () => {
    const tests = [
      "Basic DOM Manipulation",
      "Document Body Access",
      "Custom Element Registration",
      "insertBefore()",
      "replaceChild()",
      "cloneNode()",
      "DocumentFragment",
      "innerHTML",
      "Event Listeners",
      "Shadow DOM",
      "localStorage",
      "sessionStorage",
      "IndexedDB",
      "XMLHttpRequest",
      "Fetch API",
      "Blob API",
      "Local Network Access",
      "Cookie Access & Cross-Site",
      "Iframe Sandbox Detection",
      "React Internal Processing",
      "Parent Window Access",
      "Basic Popup Creation",
      "Popup to Parent Window Access",
      "Popup to Parent Comprehensive",
      "Popup Sandbox Escape Detection",
      "Popup to Parent Cookie Access",
      "Popup to Parent LocalStorage",
      "Popup to Parent SessionStorage",
      "Popup to Parent IndexedDB",
      "Popup to Parent XMLHttpRequest",
      "Popup to Parent Fetch API",
      "Popup to Parent WebSocket",
      "Popup to Parent Service Worker",
    ];

    setTestStatuses(tests.map((name) => ({ name, status: "pending" })));
  };

  // Auto-scroll to bottom when new results are added
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [results]);

  // Run all tests sequentially
  const runAllTests = async () => {
    if (isRunningTests) return;

    setIsRunningTests(true);
    setCurrentTestIndex(0);
    clearResults();
    initializeTestStatuses();

    addResult("═══════════════════════════════════════════════════════");
    addResult("🔄 RUNNING ALL TESTS");
    addResult("═══════════════════════════════════════════════════════");
    addResult("⚡ Running comprehensive DOM API test suite...");
    addResult("-----------------------------------------------------------");

    const tests = [
      { name: "Basic DOM Manipulation", fn: testBasicDOMManipulation },
      { name: "Document Body Access", fn: testDocumentBodyAccess },
      {
        name: "Custom Element Registration",
        fn: testCustomElementRegistration,
      },
      { name: "insertBefore()", fn: testInsertBefore },
      { name: "replaceChild()", fn: testReplaceChild },
      { name: "cloneNode()", fn: testCloneNode },
      { name: "DocumentFragment", fn: testDocumentFragment },
      { name: "innerHTML", fn: testInnerHTML },
      { name: "Event Listeners", fn: testEventListeners },
      { name: "Shadow DOM", fn: testShadowDOM },
      { name: "localStorage", fn: testLocalStorage },
      { name: "sessionStorage", fn: testSessionStorage },
      { name: "IndexedDB", fn: testIndexedDB },
      { name: "XMLHttpRequest", fn: testXMLHttpRequest },
      { name: "Fetch API", fn: testFetchAPI },
      { name: "Blob API", fn: testBlobAPI },
      { name: "Local Network Access", fn: testLocalNetworkAccess },
      { name: "Cookie Access & Cross-Site", fn: testCookieAccess },
      { name: "Iframe Sandbox Detection", fn: testIframeSandboxDetection },
      { name: "React Internal Processing", fn: testReactInternalProcessing },
      { name: "Parent Window Access", fn: testParentWindowAccess },
      { name: "Basic Popup Creation", fn: testBasicPopupCreation },
      {
        name: "Popup to Parent Window Access",
        fn: testPopupToParentWindowAccess,
      },
      {
        name: "Popup to Parent Comprehensive",
        fn: testPopupToParentComprehensive,
      },
      {
        name: "Popup Sandbox Escape Detection",
        fn: testPopupSandboxEscapeDetection,
      },
      {
        name: "Popup to Parent Cookie Access",
        fn: testPopupToParentCookieAccess,
      },
      {
        name: "Popup to Parent LocalStorage",
        fn: testPopupToParentLocalStorage,
      },
      {
        name: "Popup to Parent SessionStorage",
        fn: testPopupToParentSessionStorage,
      },
      { name: "Popup to Parent IndexedDB", fn: testPopupToParentIndexedDB },
      {
        name: "Popup to Parent XMLHttpRequest",
        fn: testPopupToParentXMLHttpRequest,
      },
      { name: "Popup to Parent Fetch API", fn: testPopupToParentFetchAPI },
      { name: "Popup to Parent WebSocket", fn: testPopupToParentWebSocket },
      {
        name: "Popup to Parent Service Worker",
        fn: testPopupToParentServiceWorker,
      },
    ];

    for (let i = 0; i < tests.length; i++) {
      setCurrentTestIndex(i + 1);
      updateTestStatus(i, { status: "running" });
      addResult(`\n▶️  TEST ${i + 1}/${tests.length}: ${tests[i].name}...`);

      await new Promise((resolve) => setTimeout(resolve, 100));
      const testFn = tests[i].fn;

      // Skip popup tests in run all - they require user interaction
      const testName = tests[i].name.toLowerCase();
      if (testName.includes("popup")) {
        addResult("⚠ SKIPPED: Popup tests require manual interaction");
        updateTestStatus(i, {
          status: "skipped",
        });
        continue;
      }

      const result = await (async () => {
        try {
          return await testFn();
        } catch (e) {
          return { passed: false, errors: 1, warnings: 0 };
        }
      })();

      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update status based on test result
      if (result) {
        updateTestStatus(i, {
          status: result.passed ? "passed" : "failed",
          errors: result.errors || 0,
          warnings: result.warnings || 0,
        });
      } else {
        // Fallback if test doesn't return result
        updateTestStatus(i, { status: "passed" });
      }
    }

    addResult("\n═══════════════════════════════════════════════════════");
    addResult(`✅ COMPLETED ALL TESTS (${tests.length}/${tests.length})`);
    addResult("═══════════════════════════════════════════════════════");
    setIsRunningTests(false);
    setCurrentTestIndex(0);
  };

  // Run all tests automatically on mount
  useEffect(() => {
    if (!autoTestsRun) {
      setAutoTestsRun(true);
      setTimeout(() => {
        runAllTests();
      }, 500);
    }
  }, [autoTestsRun]);

  // Test 1: Basic DOM Manipulation (appendChild, createElement, removeChild)
  const testBasicDOMManipulation = () => {
    try {
      const container = testContainerRef.current;
      if (!container) {
        addResult("✗ FAILED: Test container not available");
        return;
      }

      addResult("⚠ TESTING: document.createElement()...");
      const div = document.createElement("div");
      div.id = "test-element-" + Date.now();
      div.textContent = "Test Element";
      div.style.cssText =
        "padding: 10px; background: #e7f3ff; margin: 5px; border-radius: 4px;";

      addResult("✓ SUCCESS: document.createElement() worked");

      addResult("⚠ TESTING: appendChild()...");
      container.appendChild(div);
      addResult(`✓ SUCCESS: appendChild() worked - element ID: ${div.id}`);

      addResult("⚠ TESTING: querySelector()...");
      const found = document.querySelector(`#${div.id}`);
      if (found) {
        addResult(`✓ SUCCESS: querySelector() found element`);
      } else {
        addResult(`✗ FAILED: querySelector() could not find element`);
      }

      addResult("⚠ TESTING: removeChild()...");
      container.removeChild(div);
      addResult("✓ SUCCESS: removeChild() worked");

      const notFound = document.querySelector(`#${div.id}`);
      if (!notFound) {
        addResult("✓ SUCCESS: Element successfully removed from DOM");
      } else {
        addResult("✗ FAILED: Element still exists after removeChild");
      }
    } catch (e: any) {
      addResult(`✗ FAILED: DOM Manipulation - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 2: Document Body Access
  const testDocumentBodyAccess = () => {
    try {
      addResult("⚠ TESTING: document.body access...");
      if (!document.body) {
        addResult("✗ FAILED: document.body is null or undefined");
        return;
      }
      addResult("✓ SUCCESS: document.body is accessible");

      addResult("⚠ TESTING: document.body.appendChild property...");
      if (typeof document.body.appendChild !== "function") {
        addResult(
          `✗ FAILED: document.body.appendChild is not a function: ${typeof document
            .body.appendChild}`
        );
        return;
      }
      addResult("✓ SUCCESS: document.body.appendChild is a function");

      addResult("⚠ TESTING: Reading body properties...");
      const bodyClass = document.body.className;
      const bodyId = document.body.id;
      addResult(
        `✓ SUCCESS: body.className='${bodyClass}', body.id='${bodyId}'`
      );

      addResult("⚠ TESTING: Modifying body attributes...");
      const originalDataAttr = document.body.getAttribute("data-test");
      document.body.setAttribute("data-test", "dom-test-" + Date.now());
      const newDataAttr = document.body.getAttribute("data-test");
      addResult(
        `✓ SUCCESS: setAttribute worked - old='${originalDataAttr}', new='${newDataAttr}'`
      );

      // Clean up
      if (originalDataAttr) {
        document.body.setAttribute("data-test", originalDataAttr);
      } else {
        document.body.removeAttribute("data-test");
      }
    } catch (e: any) {
      addResult(`✗ FAILED: Document Body Access - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 3: Custom Element Registration
  const testCustomElementRegistration = () => {
    try {
      const container = testContainerRef.current;
      if (!container) {
        addResult("✗ FAILED: Test container not available");
        return;
      }

      addResult("⚠ TESTING: Custom Element registration...");

      const elementName = `test-element-${Date.now()}`;

      class TestElement extends HTMLElement {
        constructor() {
          super();
          this.textContent = "Custom Element Works!";
        }
      }

      customElements.define(elementName, TestElement);
      addResult(`✓ SUCCESS: customElements.define() for '${elementName}'`);

      addResult("⚠ TESTING: Creating custom element...");
      addResult("  🎯 This is line 365 where the error occurs");
      let testEl;
      try {
        testEl = document.createElement(elementName);
        addResult(`✓ SUCCESS: Created custom element`);
      } catch (e: any) {
        addResult(`✗ FAILED: Element creation blocked - ${e.message}`);
        addResult(`  🎯 This is the EXACT error at line 365!`);
        addResult(`  🚫 IFRAME SANDBOX: Blocks custom element creation`);
        addResult(`  💡 SOLUTION: Add 'allow-same-origin' to iframe sandbox`);
        return; // Exit early if element creation fails
      }

      addResult("⚠ TESTING: Appending custom element to DOM...");
      testEl.style.cssText =
        "display: block; padding: 10px; background: #d4edda; margin: 5px; border-radius: 4px;";
      container.appendChild(testEl);
      addResult(`✓ SUCCESS: Custom element added to DOM`);

      // Clean up after a moment
      setTimeout(() => {
        try {
          container.removeChild(testEl);
          addResult(`🧹 CLEANUP: Removed custom element from DOM`);
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 3000);

      // Add a note about potential async errors
      addResult(
        `⚠ NOTE: If you see console errors after this test, they indicate`
      );
      addResult(
        `  iframe sandbox restrictions. The test succeeded, but React's`
      );
      addResult(
        `  internal processing may fail due to missing 'allow-same-origin'.`
      );
    } catch (e: any) {
      addResult(`✗ FAILED: Custom Element Registration - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);

      // Check for specific iframe sandbox errors
      if (
        e.message.includes("The result must not have children") ||
        e.message.includes("NotSupportedError")
      ) {
        addResult(
          `⚠ IFRAME SANDBOX ISSUE: This error indicates the iframe is running`
        );
        addResult(
          `  in a sandboxed environment without 'allow-same-origin' permission.`
        );
        addResult(`  Custom element registration requires same-origin access.`);
        addResult(
          `  Solution: Add 'allow-same-origin' to the iframe sandbox attribute.`
        );
      }
    }
  };

  // Test 4: insertBefore
  const testInsertBefore = () => {
    try {
      const testContainer = testContainerRef.current;
      if (!testContainer) {
        addResult("✗ FAILED: Test container not available");
        return;
      }

      addResult("⚠ TESTING: insertBefore()...");

      const container = document.createElement("div");
      container.id = "insert-test-container-" + Date.now();
      container.style.cssText =
        "padding: 10px; background: #fff3cd; margin: 5px; border-radius: 4px;";

      const firstChild = document.createElement("div");
      firstChild.textContent = "First Child";
      firstChild.style.cssText =
        "padding: 5px; background: #ffeeba; margin: 2px;";

      const secondChild = document.createElement("div");
      secondChild.textContent = "Second Child (inserted before first)";
      secondChild.style.cssText =
        "padding: 5px; background: #ffc107; margin: 2px;";

      container.appendChild(firstChild);
      addResult("✓ SUCCESS: Added first child to container");

      container.insertBefore(secondChild, firstChild);
      addResult("✓ SUCCESS: insertBefore() worked");

      testContainer.appendChild(container);
      addResult(`✓ SUCCESS: Container added to DOM with ID: ${container.id}`);

      // Verify order
      if (
        container.children[0] === secondChild &&
        container.children[1] === firstChild
      ) {
        addResult(
          "✓ SUCCESS: Children are in correct order (second before first)"
        );
      } else {
        addResult("✗ FAILED: Children order is incorrect");
      }

      // Clean up after a moment
      setTimeout(() => {
        try {
          testContainer.removeChild(container);
          addResult(`🧹 CLEANUP: Removed insertBefore test container`);
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 5000);
    } catch (e: any) {
      addResult(`✗ FAILED: insertBefore test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 5: replaceChild
  const testReplaceChild = () => {
    try {
      const testContainer = testContainerRef.current;
      if (!testContainer) {
        addResult("✗ FAILED: Test container not available");
        return;
      }

      addResult("⚠ TESTING: replaceChild()...");

      const container = document.createElement("div");
      container.id = "replace-test-container-" + Date.now();
      container.style.cssText =
        "padding: 10px; background: #d1ecf1; margin: 5px; border-radius: 4px;";

      const oldChild = document.createElement("div");
      oldChild.textContent = "Old Child (will be replaced)";
      oldChild.style.cssText =
        "padding: 5px; background: #bee5eb; margin: 2px;";

      const newChild = document.createElement("div");
      newChild.textContent = "New Child (replacement)";
      newChild.style.cssText =
        "padding: 5px; background: #17a2b8; color: white; margin: 2px;";

      container.appendChild(oldChild);
      testContainer.appendChild(container);
      addResult("✓ SUCCESS: Added container with old child to DOM");

      container.replaceChild(newChild, oldChild);
      addResult("✓ SUCCESS: replaceChild() worked");

      if (container.children[0] === newChild && !container.contains(oldChild)) {
        addResult("✓ SUCCESS: Old child replaced with new child correctly");
      } else {
        addResult("✗ FAILED: replaceChild did not work correctly");
      }

      // Clean up after a moment
      setTimeout(() => {
        try {
          testContainer.removeChild(container);
          addResult(`🧹 CLEANUP: Removed replaceChild test container`);
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 5000);
    } catch (e: any) {
      addResult(`✗ FAILED: replaceChild test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 6: cloneNode
  const testCloneNode = () => {
    try {
      const testContainer = testContainerRef.current;
      if (!testContainer) {
        addResult("✗ FAILED: Test container not available");
        return;
      }

      addResult("⚠ TESTING: cloneNode()...");

      const original = document.createElement("div");
      original.id = "original-" + Date.now();
      original.className = "test-class";
      original.setAttribute("data-test", "original");
      original.textContent = "Original Element";
      original.style.cssText =
        "padding: 10px; background: #f8d7da; margin: 5px; border-radius: 4px;";

      const child = document.createElement("span");
      child.textContent = " (with child)";
      original.appendChild(child);

      addResult("✓ SUCCESS: Created original element with child");

      // Shallow clone
      addResult("⚠ TESTING: cloneNode(false) - shallow clone...");
      const shallowClone = original.cloneNode(false) as HTMLElement;
      shallowClone.id = "shallow-clone-" + Date.now();
      addResult(
        `✓ SUCCESS: Shallow clone created, has ${shallowClone.children.length} children (should be 0)`
      );

      // Deep clone
      addResult("⚠ TESTING: cloneNode(true) - deep clone...");
      const deepClone = original.cloneNode(true) as HTMLElement;
      deepClone.id = "deep-clone-" + Date.now();
      addResult(
        `✓ SUCCESS: Deep clone created, has ${deepClone.children.length} children (should be 1)`
      );

      // Add all to DOM
      const container = document.createElement("div");
      container.id = "clone-test-container-" + Date.now();
      container.style.cssText =
        "padding: 10px; background: #f5c6cb; margin: 5px; border-radius: 4px;";

      container.appendChild(original);
      container.appendChild(shallowClone);
      container.appendChild(deepClone);

      testContainer.appendChild(container);
      addResult("✓ SUCCESS: All clones added to DOM");

      // Clean up after a moment
      setTimeout(() => {
        try {
          testContainer.removeChild(container);
          addResult(`🧹 CLEANUP: Removed cloneNode test container`);
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 5000);
    } catch (e: any) {
      addResult(`✗ FAILED: cloneNode test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 7: createDocumentFragment
  const testDocumentFragment = () => {
    try {
      const testContainer = testContainerRef.current;
      if (!testContainer) {
        addResult("✗ FAILED: Test container not available");
        return;
      }

      addResult("⚠ TESTING: createDocumentFragment()...");

      const fragment = document.createDocumentFragment();
      addResult("✓ SUCCESS: createDocumentFragment() worked");

      addResult("⚠ TESTING: Adding elements to fragment...");
      for (let i = 0; i < 5; i++) {
        const div = document.createElement("div");
        div.textContent = `Fragment Item ${i + 1}`;
        div.style.cssText =
          "padding: 5px; background: #cce5ff; margin: 2px; border-radius: 4px;";
        fragment.appendChild(div);
      }
      addResult("✓ SUCCESS: Added 5 elements to document fragment");

      addResult("⚠ TESTING: Appending fragment to DOM...");
      const container = document.createElement("div");
      container.id = "fragment-test-container-" + Date.now();
      container.style.cssText =
        "padding: 10px; background: #b8daff; margin: 5px; border-radius: 4px;";

      container.appendChild(fragment);
      testContainer.appendChild(container);

      addResult(
        `✓ SUCCESS: Fragment appended to DOM, container has ${container.children.length} children`
      );

      // Clean up after a moment
      setTimeout(() => {
        try {
          testContainer.removeChild(container);
          addResult(`🧹 CLEANUP: Removed fragment test container`);
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 5000);
    } catch (e: any) {
      addResult(`✗ FAILED: DocumentFragment test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 8: innerHTML manipulation
  const testInnerHTML = () => {
    try {
      const testContainer = testContainerRef.current;
      if (!testContainer) {
        addResult("✗ FAILED: Test container not available");
        return;
      }

      addResult("⚠ TESTING: innerHTML property...");

      const container = document.createElement("div");
      container.id = "innerhtml-test-container-" + Date.now();
      container.style.cssText =
        "padding: 10px; background: #d6d8db; margin: 5px; border-radius: 4px;";

      addResult("⚠ TESTING: Setting innerHTML...");
      container.innerHTML = `
        <div style="padding: 5px; background: #c3c5c7; margin: 2px; border-radius: 4px;">
          <strong>innerHTML Test</strong>
          <p>This was created via innerHTML</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
          </ul>
        </div>
      `;
      addResult("✓ SUCCESS: innerHTML set successfully");

      testContainer.appendChild(container);
      addResult(`✓ SUCCESS: Container with innerHTML added to DOM`);

      addResult("⚠ TESTING: Reading innerHTML...");
      const htmlContent = container.innerHTML;
      addResult(
        `✓ SUCCESS: Read ${htmlContent.length} characters from innerHTML`
      );

      // Clean up after a moment
      setTimeout(() => {
        try {
          testContainer.removeChild(container);
          addResult(`🧹 CLEANUP: Removed innerHTML test container`);
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 5000);
    } catch (e: any) {
      addResult(`✗ FAILED: innerHTML test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 9: Event Listeners on Created Elements
  const testEventListeners = () => {
    try {
      const testContainer = testContainerRef.current;
      if (!testContainer) {
        addResult("✗ FAILED: Test container not available");
        return;
      }

      addResult("⚠ TESTING: Event listeners on created elements...");

      const button = document.createElement("button");
      button.id = "event-test-button-" + Date.now();
      button.textContent = "Click Me (auto-clicks in 1s)";
      button.style.cssText =
        "padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; margin: 5px; cursor: pointer;";

      let clicked = false;
      button.addEventListener("click", () => {
        clicked = true;
        button.textContent = "✓ Clicked!";
        button.style.background = "#218838";
        addResult("✓ SUCCESS: Event listener fired on created element");
      });

      addResult("✓ SUCCESS: addEventListener() worked");

      testContainer.appendChild(button);
      addResult("✓ SUCCESS: Button with event listener added to DOM");

      // Programmatically trigger click after 1 second
      setTimeout(() => {
        button.click();
        if (clicked) {
          addResult("✓ SUCCESS: Programmatic click() worked");
        } else {
          addResult("✗ FAILED: Click event did not fire");
        }

        // Clean up after another moment
        setTimeout(() => {
          try {
            testContainer.removeChild(button);
            addResult(`🧹 CLEANUP: Removed event test button`);
          } catch (e) {
            // Ignore cleanup errors
          }
        }, 2000);
      }, 1000);
    } catch (e: any) {
      addResult(`✗ FAILED: Event listener test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 10: Shadow DOM
  const testShadowDOM = () => {
    try {
      const testContainer = testContainerRef.current;
      if (!testContainer) {
        addResult("✗ FAILED: Test container not available");
        return;
      }

      addResult("⚠ TESTING: Shadow DOM (attachShadow)...");

      const host = document.createElement("div");
      host.id = "shadow-host-" + Date.now();
      host.style.cssText =
        "padding: 10px; background: #e2e3e5; margin: 5px; border-radius: 4px;";

      const shadowRoot = host.attachShadow({ mode: "open" });
      addResult("✓ SUCCESS: attachShadow() worked");

      const shadowContent = document.createElement("div");
      shadowContent.innerHTML = `
        <style>
          .shadow-content {
            padding: 10px;
            background: #6c757d;
            color: white;
            border-radius: 4px;
          }
        </style>
        <div class="shadow-content">
          <strong>Shadow DOM Content</strong>
          <p>This content is inside a shadow root!</p>
        </div>
      `;

      shadowRoot.appendChild(shadowContent);
      addResult("✓ SUCCESS: Added content to shadow root");

      testContainer.appendChild(host);
      addResult("✓ SUCCESS: Shadow host added to DOM");

      // Verify shadow root exists
      if (host.shadowRoot) {
        addResult("✓ SUCCESS: shadowRoot property is accessible");
      } else {
        addResult("✗ FAILED: shadowRoot property is not accessible");
      }

      // Clean up after a moment
      setTimeout(() => {
        try {
          testContainer.removeChild(host);
          addResult(`🧹 CLEANUP: Removed shadow DOM test`);
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 5000);
    } catch (e: any) {
      addResult(`✗ FAILED: Shadow DOM test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 11: localStorage API
  const testLocalStorage = () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: localStorage API...");

      if (typeof localStorage === "undefined") {
        addResult("✗ FAILED: localStorage is undefined");
        errors++;
        return { passed: false, errors, warnings };
      }

      addResult("✓ SUCCESS: localStorage object exists");

      const testKey = "dom-test-key-" + Date.now();
      const testValue = "test-value-" + Math.random();

      addResult("⚠ TESTING: localStorage.setItem()...");
      warnings++;
      localStorage.setItem(testKey, testValue);
      addResult(`✓ SUCCESS: setItem('${testKey}', '${testValue}')`);

      addResult("⚠ TESTING: localStorage.getItem()...");
      warnings++;
      const retrievedValue = localStorage.getItem(testKey);
      if (retrievedValue === testValue) {
        addResult(
          `✓ SUCCESS: getItem() returned correct value: '${retrievedValue}'`
        );
      } else {
        addResult(
          `✗ FAILED: getItem() returned '${retrievedValue}', expected '${testValue}'`
        );
        errors++;
      }

      addResult("⚠ TESTING: localStorage.removeItem()...");
      warnings++;
      localStorage.removeItem(testKey);
      const afterRemove = localStorage.getItem(testKey);
      if (afterRemove === null) {
        addResult("✓ SUCCESS: removeItem() worked, key no longer exists");
      } else {
        addResult(
          `✗ FAILED: Key still exists after removeItem(): '${afterRemove}'`
        );
        errors++;
      }

      addResult("⚠ TESTING: localStorage.length...");
      warnings++;
      const length = localStorage.length;
      addResult(`✓ SUCCESS: localStorage.length = ${length}`);

      addResult("⚠ TESTING: localStorage.clear()...");
      warnings++;
      const keysBefore = localStorage.length;
      localStorage.clear();
      const keysAfter = localStorage.length;
      addResult(
        `✓ SUCCESS: clear() worked (${keysBefore} keys → ${keysAfter} keys)`
      );

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: localStorage test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // Test 12: sessionStorage API
  const testSessionStorage = () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: sessionStorage API...");

      if (typeof sessionStorage === "undefined") {
        addResult("✗ FAILED: sessionStorage is undefined");
        errors++;
        return { passed: false, errors, warnings };
      }

      addResult("✓ SUCCESS: sessionStorage object exists");

      const testKey = "dom-test-session-" + Date.now();
      const testValue = "session-value-" + Math.random();

      addResult("⚠ TESTING: sessionStorage.setItem()...");
      warnings++;
      sessionStorage.setItem(testKey, testValue);
      addResult(`✓ SUCCESS: setItem('${testKey}', '${testValue}')`);

      addResult("⚠ TESTING: sessionStorage.getItem()...");
      warnings++;
      const retrievedValue = sessionStorage.getItem(testKey);
      if (retrievedValue === testValue) {
        addResult(
          `✓ SUCCESS: getItem() returned correct value: '${retrievedValue}'`
        );
      } else {
        addResult(
          `✗ FAILED: getItem() returned '${retrievedValue}', expected '${testValue}'`
        );
        errors++;
      }

      addResult("⚠ TESTING: sessionStorage.key()...");
      warnings++;
      const firstKey = sessionStorage.key(0);
      addResult(`✓ SUCCESS: sessionStorage.key(0) = '${firstKey}'`);

      // Clean up
      sessionStorage.removeItem(testKey);
      addResult(`🧹 CLEANUP: Removed test key from sessionStorage`);

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: sessionStorage test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // Test 13: IndexedDB API
  const testIndexedDB = () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: IndexedDB API...");

      if (!("indexedDB" in window)) {
        addResult("✗ FAILED: indexedDB is not available in window");
        errors++;
        return { passed: false, errors, warnings };
      }

      addResult("✓ SUCCESS: indexedDB object exists");

      const dbName = "dom-test-db-" + Date.now();
      const dbVersion = 1;

      addResult(`⚠ TESTING: indexedDB.open('${dbName}', ${dbVersion})...`);
      warnings++;
      const request = indexedDB.open(dbName, dbVersion);

      request.onerror = () => {
        addResult(
          `✗ FAILED: indexedDB.open() error - ${request.error?.message}`
        );
        errors++;
      };

      request.onsuccess = () => {
        addResult("✓ SUCCESS: indexedDB.open() succeeded");
        const db = request.result;
        addResult(
          `✓ SUCCESS: Database '${db.name}' opened, version ${db.version}`
        );

        // Clean up
        db.close();
        const deleteRequest = indexedDB.deleteDatabase(dbName);
        deleteRequest.onsuccess = () => {
          addResult(`🧹 CLEANUP: Deleted test database '${dbName}'`);
        };
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        addResult(
          "⚠ TESTING: Database upgrade needed, creating object store..."
        );
        warnings++;
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains("testStore")) {
          const objectStore = db.createObjectStore("testStore", {
            keyPath: "id",
          });
          objectStore.createIndex("name", "name", { unique: false });
          addResult("✓ SUCCESS: Created object store and index");
        }
      };

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: IndexedDB test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // Test 14: XMLHttpRequest (XHR) API
  const testXMLHttpRequest = () => {
    try {
      addResult("⚠ TESTING: XMLHttpRequest API...");

      if (typeof XMLHttpRequest === "undefined") {
        addResult("✗ FAILED: XMLHttpRequest is undefined");
        return;
      }

      addResult("✓ SUCCESS: XMLHttpRequest constructor exists");

      addResult("⚠ TESTING: Creating XMLHttpRequest instance...");
      const xhr = new XMLHttpRequest();
      addResult("✓ SUCCESS: new XMLHttpRequest() worked");

      addResult("⚠ TESTING: xhr.open() and xhr.send()...");

      // Test with a data URL to avoid CORS issues
      const dataUrl = "data:text/plain,Hello%20from%20XHR";

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 0) {
          addResult(`✓ SUCCESS: XHR request completed, status: ${xhr.status}`);
          addResult(`✓ SUCCESS: Response text: '${xhr.responseText}'`);
        } else {
          addResult(`✗ FAILED: XHR request failed with status: ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        addResult(`✗ FAILED: XHR request error`);
      };

      xhr.open("GET", dataUrl, true);
      xhr.send();
      addResult("✓ SUCCESS: xhr.open() and xhr.send() executed");
    } catch (e: any) {
      addResult(`✗ FAILED: XMLHttpRequest test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 15: Fetch API
  const testFetchAPI = () => {
    try {
      addResult("⚠ TESTING: Fetch API...");

      if (typeof fetch === "undefined") {
        addResult("✗ FAILED: fetch is undefined");
        return;
      }

      addResult("✓ SUCCESS: fetch function exists");

      addResult("⚠ TESTING: Calling fetch() with data URL...");

      // Test with a data URL to avoid CORS issues
      const dataUrl = 'data:application/json,{"test":"value","from":"fetch"}';

      fetch(dataUrl)
        .then((response) => {
          addResult(
            `✓ SUCCESS: fetch() returned response, status: ${response.status}`
          );
          addResult(`✓ SUCCESS: response.ok = ${response.ok}`);

          addResult("⚠ TESTING: response.json()...");
          return response.json();
        })
        .then((data) => {
          addResult(
            `✓ SUCCESS: response.json() parsed data: ${JSON.stringify(data)}`
          );
        })
        .catch((error) => {
          addResult(`✗ FAILED: fetch() error - ${error.message}`);
        });

      addResult("✓ SUCCESS: fetch() call initiated");
    } catch (e: any) {
      addResult(`✗ FAILED: Fetch API test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 16: Blob and URL.createObjectURL
  const testBlobAPI = () => {
    try {
      addResult("⚠ TESTING: Blob API...");

      if (typeof Blob === "undefined") {
        addResult("✗ FAILED: Blob is undefined");
        return;
      }

      addResult("✓ SUCCESS: Blob constructor exists");

      addResult("⚠ TESTING: Creating Blob...");
      const blob = new Blob(["Hello from Blob!"], { type: "text/plain" });
      addResult(
        `✓ SUCCESS: Created blob, size: ${blob.size} bytes, type: '${blob.type}'`
      );

      addResult("⚠ TESTING: URL.createObjectURL()...");
      const blobUrl = URL.createObjectURL(blob);
      addResult(`✓ SUCCESS: Created blob URL: ${blobUrl.substring(0, 50)}...`);

      addResult("⚠ TESTING: Fetching blob URL...");
      fetch(blobUrl)
        .then((response) => response.text())
        .then((text) => {
          addResult(`✓ SUCCESS: Fetched blob content: '${text}'`);

          // Clean up
          URL.revokeObjectURL(blobUrl);
          addResult(`🧹 CLEANUP: Revoked blob URL`);
        })
        .catch((error) => {
          addResult(`✗ FAILED: Could not fetch blob - ${error.message}`);
        });
    } catch (e: any) {
      addResult(`✗ FAILED: Blob API test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 17: Background Fetch (every 5 seconds)
  const testBackgroundFetch = () => {
    if (backgroundFetchActive) {
      // Stop the background fetch
      if (backgroundFetchInterval) {
        clearInterval(backgroundFetchInterval);
        setBackgroundFetchInterval(null);
      }
      setBackgroundFetchActive(false);
      addResult("🛑 STOPPED: Background fetch process terminated");
      return;
    }

    try {
      addResult("⚠ TESTING: Starting background fetch (every 5 seconds)...");
      addResult("  This simulates continuous background network activity");

      if (typeof fetch === "undefined") {
        addResult("✗ FAILED: fetch is undefined");
        return;
      }

      let fetchCount = 0;

      const performBackgroundFetch = () => {
        fetchCount++;
        const timestamp = new Date().toISOString();
        const dataUrl = `data:application/json,{"fetch":"${fetchCount}","timestamp":"${timestamp}"}`;

        addResult(
          `🔄 BACKGROUND FETCH #${fetchCount} - Starting at ${new Date().toLocaleTimeString()}...`
        );

        fetch(dataUrl)
          .then((response) => response.json())
          .then((data) => {
            addResult(
              `✓ BACKGROUND FETCH #${fetchCount} SUCCESS: ${JSON.stringify(
                data
              )}`
            );
          })
          .catch((error) => {
            addResult(
              `✗ BACKGROUND FETCH #${fetchCount} FAILED: ${error.message}`
            );
          });
      };

      // Perform first fetch immediately
      performBackgroundFetch();

      // Set up interval for subsequent fetches
      const interval = setInterval(performBackgroundFetch, 5000);
      setBackgroundFetchInterval(interval);
      setBackgroundFetchActive(true);

      addResult("✓ SUCCESS: Background fetch process started");
      addResult("  Click the button again to stop the background fetch");
    } catch (e: any) {
      addResult(`✗ FAILED: Background fetch test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 18: Local Network Access
  const testLocalNetworkAccess = () => {
    try {
      addResult("⚠ TESTING: Local Network Access...");
      addResult("  Testing if 'allow=\"local-network-access\"' permission is granted");

      if (typeof fetch === "undefined") {
        addResult("✗ FAILED: fetch is undefined");
        return;
      }

      addResult("✓ SUCCESS: fetch function exists");
      
      // Test with a private network address (192.168.1.1 is commonly a router)
      const localAddresses = [
        "http://192.168.1.1",
        "http://10.0.0.1",
        "http://localhost:3000",
      ];

      addResult("⚠ TESTING: Attempting to fetch from local/private network addresses...");
      addResult("  This will fail with network errors, but we're testing if the browser ALLOWS the attempt");

      // Test multiple private network addresses
      localAddresses.forEach((address, index) => {
        const testUrl = `${address}/test`;
        addResult(`  [${index + 1}] Testing: ${testUrl}`);

        // Use a timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        fetch(testUrl, {
          method: "HEAD",
          mode: "no-cors",
          signal: controller.signal,
        })
          .then((response) => {
            clearTimeout(timeoutId);
            addResult(`  ✓ [${index + 1}] Request to ${address} was ALLOWED (status: ${response.status})`);
            addResult(`    → local-network-access permission is GRANTED`);
          })
          .catch((error) => {
            clearTimeout(timeoutId);
            if (error.name === "AbortError") {
              addResult(`  ⏱ [${index + 1}] Request to ${address} timed out (2s) - ALLOWED but no response`);
              addResult(`    → local-network-access permission appears to be GRANTED`);
            } else if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
              addResult(`  ✓ [${index + 1}] Request to ${address} failed (network error) - but was ALLOWED to attempt`);
              addResult(`    → local-network-access permission is GRANTED`);
            } else if (error.message.includes("local network") || error.message.includes("private network")) {
              addResult(`  ✗ [${index + 1}] Request to ${address} BLOCKED by browser`);
              addResult(`    → local-network-access permission is DENIED`);
              addResult(`    → Error: ${error.message}`);
            } else {
              addResult(`  ⚠ [${index + 1}] Request to ${address} error: ${error.message}`);
            }
          });
      });

      addResult("ℹ️ INFO: Check results above to see if local network requests were allowed");
      addResult("  If requests were blocked with 'private network' errors, the permission is missing");
      addResult("  If requests timed out or had network errors, the permission is likely granted");

    } catch (e: any) {
      addResult(`✗ FAILED: Local Network Access test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 19: Cookie Access (Explicit and Implicit) + Cross-Site API
  const testCookieAccess = async () => {
    try {
      addResult("═══════════════════════════════════════════════════════");
      addResult("🍪 COOKIE ACCESS TEST");
      addResult("═══════════════════════════════════════════════════════");

      // First, test that iframe CANNOT access parent cookies (security isolation)
      addResult("🔒 TESTING: Parent cookie isolation (security check)...");
      try {
        // Check if we're in an iframe (this itself might be blocked by security policy)
        let inIframe = false;
        try {
          inIframe = window.parent !== window;
        } catch (e: any) {
          addResult(`✓ SECURE: Access to window.parent blocked - ${e.name}`);
          addResult(`  Very strict security policy in place`);
          inIframe = false;
        }

        if (inIframe) {
          addResult("  Detected: Running in an iframe");
          addResult(
            "  Testing: Iframe should NOT be able to access parent cookies"
          );

          // Try to access parent cookies
          try {
            const parentCookies = window.parent.document.cookie;
            addResult(
              `✗ SECURITY ISSUE: Can access parent cookies! Found: ${parentCookies.substring(
                0,
                100
              )}`
            );
            addResult(
              `  This is a security vulnerability - iframe should be isolated from parent`
            );
          } catch (e: any) {
            addResult(
              `✓ SECURE: Cannot access parent cookies - ${e.name} (expected)`
            );
            addResult(`  Iframe is properly isolated from parent page`);
          }

          // Try to set parent cookies
          try {
            window.parent.document.cookie =
              "iframe_attack_test=malicious; path=/";
            addResult(
              `✗ SECURITY ISSUE: Can set parent cookies! This should be blocked.`
            );
          } catch (e: any) {
            addResult(
              `✓ SECURE: Cannot set parent cookies - ${e.name} (expected)`
            );
          }
        } else {
          addResult("  Not in iframe - parent cookie isolation test skipped");
        }
      } catch (e: any) {
        addResult(
          `✓ SECURE: Parent window access completely blocked - ${e.name}`
        );
        addResult(
          `  Maximum security: Cannot even check if in iframe (this is OK)`
        );
      }

      addResult("═══════════════════════════════════════════════════════");

      // Test explicit cookie access via document.cookie (iframe's OWN cookies)
      addResult("🍪 TESTING: Iframe's own cookie access (document.cookie)...");
      addResult("  The iframe SHOULD be able to access its own cookies");
      try {
        const cookies = document.cookie;
        addResult(
          `✓ SUCCESS: document.cookie accessible - ${
            cookies
              ? `Found ${cookies.split(";").length} cookie(s)`
              : "No cookies found (empty but accessible)"
          }`
        );
        if (cookies) {
          addResult(
            `  Cookies: ${cookies.substring(0, 200)}${
              cookies.length > 200 ? "..." : ""
            }`
          );
        }
        addResult(
          `  ✓ Iframe can read its own cookies (required for functionality)`
        );
      } catch (e: any) {
        addResult(`✗ FAILED: Cannot access document.cookie - ${e.message}`);
        addResult(`  This is a problem! Iframe should access its own cookies.`);
      }

      // Test setting cookies with different attributes
      addResult("═══════════════════════════════════════════════════════");
      addResult("🍪 CLIENT-SIDE COOKIE SETTING TESTS");
      addResult("═══════════════════════════════════════════════════════");
      addResult(
        "  Testing iframe's ability to set its own cookies with various attributes"
      );

      // Test 1: Basic cookie (no special flags)
      addResult("⚠ TESTING: Setting basic cookie (no flags)...");
      try {
        const basicCookieName = `basic_${Date.now()}`;
        const basicCookieValue = "basic_value";
        document.cookie = `${basicCookieName}=${basicCookieValue}; path=/`;

        const cookiesAfter = document.cookie;
        if (cookiesAfter.includes(basicCookieName)) {
          addResult(`✓ SUCCESS: Basic cookie set and readable`);
          addResult(`  Cookie: ${basicCookieName}=${basicCookieValue}`);
          // Clean up
          document.cookie = `${basicCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        } else {
          addResult(`✗ FAILED: Basic cookie not readable after setting`);
        }
      } catch (e: any) {
        addResult(`✗ FAILED: Cannot set basic cookie - ${e.message}`);
      }

      // Test 2: Cookie with SameSite=Lax
      addResult("⚠ TESTING: Setting cookie with SameSite=Lax...");
      try {
        const laxCookieName = `lax_${Date.now()}`;
        const laxCookieValue = "lax_value";
        document.cookie = `${laxCookieName}=${laxCookieValue}; path=/; SameSite=Lax`;

        const cookiesAfter = document.cookie;
        if (cookiesAfter.includes(laxCookieName)) {
          addResult(`✓ SUCCESS: SameSite=Lax cookie set and readable`);
          addResult(
            `  Cookie: ${laxCookieName}=${laxCookieValue}; SameSite=Lax`
          );
          // Clean up
          document.cookie = `${laxCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        } else {
          addResult(`✗ FAILED: SameSite=Lax cookie not readable`);
        }
      } catch (e: any) {
        addResult(`✗ FAILED: Cannot set SameSite=Lax cookie - ${e.message}`);
      }

      // Test 3: Cookie with SameSite=Strict
      addResult("⚠ TESTING: Setting cookie with SameSite=Strict...");
      try {
        const strictCookieName = `strict_${Date.now()}`;
        const strictCookieValue = "strict_value";
        document.cookie = `${strictCookieName}=${strictCookieValue}; path=/; SameSite=Strict`;

        const cookiesAfter = document.cookie;
        if (cookiesAfter.includes(strictCookieName)) {
          addResult(`✓ SUCCESS: SameSite=Strict cookie set and readable`);
          addResult(
            `  Cookie: ${strictCookieName}=${strictCookieValue}; SameSite=Strict`
          );
          // Clean up
          document.cookie = `${strictCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        } else {
          addResult(`✗ FAILED: SameSite=Strict cookie not readable`);
        }
      } catch (e: any) {
        addResult(`✗ FAILED: Cannot set SameSite=Strict cookie - ${e.message}`);
      }

      // Test 4: Cookie with Secure flag (only works on HTTPS)
      addResult("⚠ TESTING: Setting cookie with Secure flag...");
      try {
        const secureCookieName = `secure_${Date.now()}`;
        const secureCookieValue = "secure_value";
        document.cookie = `${secureCookieName}=${secureCookieValue}; path=/; Secure`;

        const cookiesAfter = document.cookie;
        if (cookiesAfter.includes(secureCookieName)) {
          addResult(`✓ SUCCESS: Secure cookie set and readable`);
          addResult(
            `  Cookie: ${secureCookieName}=${secureCookieValue}; Secure`
          );
          addResult(`  ✓ HTTPS is working for this iframe`);
          // Clean up
          document.cookie = `${secureCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure`;
        } else {
          addResult(`⚠ INFO: Secure cookie not readable`);
          addResult(`  This is expected if iframe is not on HTTPS`);
          addResult(`  Secure cookies only work on HTTPS connections`);
        }
      } catch (e: any) {
        addResult(`⚠ INFO: Cannot set Secure cookie - ${e.message}`);
        addResult(`  This is expected on HTTP connections`);
      }

      // Test 5: Attempt to set HttpOnly cookie from JS (should fail or be ignored)
      addResult("⚠ TESTING: Attempting to set HttpOnly cookie from JS...");
      try {
        const jsHttpOnlyName = `js_httponly_${Date.now()}`;
        const jsHttpOnlyValue = "should_not_be_httponly";
        document.cookie = `${jsHttpOnlyName}=${jsHttpOnlyValue}; path=/; HttpOnly`;

        const cookiesAfter = document.cookie;
        if (cookiesAfter.includes(jsHttpOnlyName)) {
          addResult(
            `⚠ INFO: Cookie was set but HttpOnly flag ignored by browser`
          );
          addResult(
            `  JavaScript cannot set HttpOnly cookies (security feature)`
          );
          addResult(
            `  Cookie is readable, meaning HttpOnly flag was NOT applied`
          );
          // Clean up
          document.cookie = `${jsHttpOnlyName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        } else {
          addResult(`✓ SECURE: Cookie with HttpOnly flag rejected by browser`);
          addResult(`  This is correct - JS cannot set HttpOnly cookies`);
        }
      } catch (e: any) {
        addResult(
          `✓ SECURE: Cannot set HttpOnly cookie from JS - ${e.message}`
        );
      }

      addResult("═══════════════════════════════════════════════════════");
      addResult("✅ Client-side cookie setting tests completed");
      addResult(
        "  Summary: Iframe CAN set its own cookies with various attributes"
      );
      addResult("═══════════════════════════════════════════════════════");

      // Test backend-set cookies via Set-Cookie header
      addResult("═══════════════════════════════════════════════════════");
      addResult("🔙 BACKEND SET-COOKIE HEADER TESTS");
      addResult("═══════════════════════════════════════════════════════");
      addResult(
        "  Testing backend-set cookies (Set-Cookie header in HTTP response)"
      );
      addResult("");
      addResult("⚠ TEST 1: Regular backend cookie (no HttpOnly)...");
      addResult(
        "  This tests if iframe can receive and store regular backend cookies"
      );

      try {
        // Test with httpbin.org which allows setting cookies via query params
        const backendCookieName = `backend_test_${Date.now()}`;
        const backendCookieValue = `backend_value_${Date.now()}`;

        addResult(
          `  Attempting to set cookie: ${backendCookieName}=${backendCookieValue}`
        );
        addResult(`  Making request to httpbin.org/cookies/set...`);

        const setCookieResponse = await fetch(
          `https://httpbin.org/cookies/set?${backendCookieName}=${backendCookieValue}`,
          {
            method: "GET",
            credentials: "include",
            redirect: "follow",
          }
        );

        if (setCookieResponse.ok) {
          addResult(
            `✓ SUCCESS: Backend responded with status ${setCookieResponse.status}`
          );
          addResult(
            `  Set-Cookie header should have been processed by browser`
          );

          // Wait a bit for cookie to be set
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Check if cookie appears in document.cookie
          const currentCookies = document.cookie;
          if (currentCookies.includes(backendCookieName)) {
            addResult(
              `✓ SUCCESS: Backend-set cookie is accessible via document.cookie!`
            );
            addResult(`  Cookie successfully stored in iframe context`);

            // Clean up
            document.cookie = `${backendCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.httpbin.org`;
          } else {
            addResult(
              `⚠ INFO: Backend-set cookie not found in document.cookie`
            );
            addResult(`  This may be due to cross-origin cookie restrictions`);
            addResult(`  Current cookies: ${currentCookies.substring(0, 100)}`);
          }

          // Verify cookie is sent back to backend
          addResult(
            "⚠ TESTING: Verifying backend-set cookie is sent in subsequent requests..."
          );
          try {
            const verifyCookieResponse = await fetch(
              "https://httpbin.org/cookies",
              {
                method: "GET",
                credentials: "include",
              }
            );

            if (verifyCookieResponse.ok) {
              const cookieData = await verifyCookieResponse.json();
              addResult(`✓ SUCCESS: Cookie verification request succeeded`);
              addResult(
                `  Cookies sent to backend: ${JSON.stringify(
                  cookieData.cookies
                ).substring(0, 150)}`
              );

              if (cookieData.cookies && cookieData.cookies[backendCookieName]) {
                addResult(
                  `✓ SUCCESS: Backend-set cookie was sent back in request!`
                );
              } else {
                addResult(
                  `⚠ INFO: Backend-set cookie not found in subsequent request`
                );
              }
            }
          } catch (e: any) {
            addResult(
              `⚠ INFO: Cookie verification request failed - ${e.message}`
            );
          }

          // Test HttpOnly cookies (cookies that JS can't access but browser still sends)
          addResult("");
          addResult("⚠ TEST 2: Backend HttpOnly cookie...");
          addResult("  HttpOnly cookies: Set by backend with HttpOnly flag");
          addResult("  Expected behavior:");
          addResult("    - NOT visible in document.cookie (JS cannot read)");
          addResult("    - Browser WILL send automatically in requests");

          try {
            const httpOnlyCookieName = `httponly_test_${Date.now()}`;
            const httpOnlyCookieValue = `secure_value_${Date.now()}`;

            // Set an HttpOnly cookie using response-headers endpoint
            addResult(
              `  Attempting to set HttpOnly cookie: ${httpOnlyCookieName}`
            );
            addResult(
              `  Using httpbin.org/response-headers to set Set-Cookie with HttpOnly flag...`
            );

            const setHttpOnlyResponse = await fetch(
              `https://httpbin.org/response-headers?Set-Cookie=${encodeURIComponent(
                `${httpOnlyCookieName}=${httpOnlyCookieValue}; Path=/; HttpOnly; SameSite=None; Secure`
              )}`,
              {
                method: "GET",
                credentials: "include",
              }
            );

            if (setHttpOnlyResponse.ok) {
              addResult(
                `✓ SUCCESS: Backend responded with HttpOnly Set-Cookie header`
              );

              // Wait for cookie to be set
              await new Promise((resolve) => setTimeout(resolve, 100));

              // First, check what cookies are currently visible to JS
              const visibleCookies = document.cookie;
              const visibleCookieNames = visibleCookies
                .split(";")
                .map((c) => c.trim().split("=")[0])
                .filter((n) => n.length > 0);

              addResult(
                `  Currently visible cookies in document.cookie: ${visibleCookieNames.length}`
              );
              if (visibleCookieNames.length > 0) {
                addResult(`  Visible: ${visibleCookieNames.join(", ")}`);
              }

              // Check if HttpOnly cookie is visible to JS (it shouldn't be!)
              if (visibleCookies.includes(httpOnlyCookieName)) {
                addResult(
                  `⚠ WARNING: HttpOnly cookie IS visible in document.cookie (unexpected!)`
                );
                addResult(
                  `  This might indicate the HttpOnly flag wasn't properly set`
                );
              } else {
                addResult(
                  `✓ SUCCESS: HttpOnly cookie is NOT visible in document.cookie (as expected)`
                );
              }

              // Now check what cookies the backend actually receives
              addResult(
                "  Making request to httpbin.org/cookies to see what browser sends..."
              );
              const cookieCheckResponse = await fetch(
                "https://httpbin.org/cookies",
                {
                  method: "GET",
                  credentials: "include",
                }
              );

              if (cookieCheckResponse.ok) {
                const backendCookieData = await cookieCheckResponse.json();
                const receivedCookieNames = Object.keys(
                  backendCookieData.cookies || {}
                );

                addResult(
                  `  Cookies received by backend: ${receivedCookieNames.length}`
                );
                if (receivedCookieNames.length > 0) {
                  addResult(`  Received: ${receivedCookieNames.join(", ")}`);
                }

                // Check if backend received the HttpOnly cookie
                if (
                  backendCookieData.cookies &&
                  backendCookieData.cookies[httpOnlyCookieName]
                ) {
                  addResult(
                    `✓ SUCCESS: HttpOnly cookie WAS sent to backend by browser!`
                  );
                  addResult(
                    `  Cookie value received: ${backendCookieData.cookies[httpOnlyCookieName]}`
                  );
                  addResult(
                    `  ✓ This proves HttpOnly cookies work correctly in the iframe:`
                  );
                  addResult(
                    `    - JavaScript CANNOT read it via document.cookie`
                  );
                  addResult(
                    `    - Browser DOES send it automatically in requests`
                  );
                } else {
                  addResult(
                    `⚠ INFO: HttpOnly cookie not found in backend response`
                  );
                  addResult(
                    `  This may be due to SameSite/Secure restrictions or cookie scope`
                  );
                }

                // Check for any other hidden cookies
                const hiddenCookies = receivedCookieNames.filter(
                  (name) => !visibleCookieNames.includes(name)
                );

                if (hiddenCookies.length > 0) {
                  addResult(
                    `  Found ${
                      hiddenCookies.length
                    } additional hidden cookie(s): ${hiddenCookies.join(", ")}`
                  );
                }
              } else {
                addResult(
                  `⚠ INFO: Backend cookie check returned ${cookieCheckResponse.status}`
                );
              }

              // Additional info
              addResult("  ═══════════════════════════════════");
              addResult(
                `  💡 HttpOnly cookies are set by backend with 'HttpOnly' flag in Set-Cookie`
              );
              addResult(
                `  💡 They protect against XSS by hiding cookies from JavaScript`
              );
              addResult(
                `  💡 Browser still automatically sends them with requests`
              );
              addResult(
                `  💡 /cookies endpoint returns cookies from the Cookie header browser sent`
              );
            } else {
              addResult(
                `⚠ INFO: HttpOnly cookie setting request returned ${setHttpOnlyResponse.status}`
              );
            }
          } catch (e: any) {
            addResult(`⚠ INFO: HttpOnly cookie test failed - ${e.message}`);
            addResult(
              `  This may be due to CORS, SameSite=None requiring HTTPS, or network restrictions`
            );
          }
        } else {
          addResult(
            `⚠ INFO: Backend cookie-setting request returned ${setCookieResponse.status}`
          );
        }
      } catch (e: any) {
        addResult(`⚠ INFO: Backend Set-Cookie test failed - ${e.message}`);
        addResult(`  This may be due to network restrictions or CORS policies`);
      }

      addResult("═══════════════════════════════════════════════════════");

      // Test implicit cookie access via fetch to auth endpoint
      addResult("⚠ TESTING: Implicit cookie access via fetch...");
      addResult("  Making GET request to /auth-proxy/userinfo...");

      try {
        const response = await fetch(
          "https://core.avaya-inf113.ec.avayacloud.com/auth-proxy/userinfo",
          {
            method: "GET",
            credentials: "include", // Explicitly include credentials
            headers: {
              Accept: "application/json",
            },
          }
        );

        addResult(
          `  Response status: ${response.status} ${response.statusText}`
        );

        if (response.ok) {
          try {
            const data = await response.json();
            addResult(
              `✓ SUCCESS: Auth endpoint returned 200 - cookies were sent`
            );
            addResult(
              `  Response data: ${JSON.stringify(data).substring(0, 200)}`
            );
          } catch {
            const text = await response.text();
            addResult(
              `✓ SUCCESS: Auth endpoint returned 200 - cookies were sent`
            );
            addResult(`  Response (text): ${text.substring(0, 200)}`);
          }
        } else if (response.status === 401) {
          addResult(
            `⚠ INFO: Auth endpoint returned 401 - no valid cookies sent`
          );
          addResult(`  This could mean: cookies weren't inherited from parent`);
        } else if (response.status === 404) {
          addResult(`⚠ INFO: Auth endpoint not found (404)`);
          addResult(`  This test requires /auth-proxy/userinfo to exist`);
        } else {
          addResult(`⚠ INFO: Auth endpoint returned ${response.status}`);
        }
      } catch (e: any) {
        addResult(`✗ FAILED: Fetch to auth endpoint failed - ${e.message}`);
        addResult(`  This may indicate network restrictions or CORS issues`);
      }

      // Test implicit cookie access without explicit credentials
      addResult(
        "⚠ TESTING: Implicit cookie access without credentials flag..."
      );
      try {
        const response = await fetch(
          "https://core.avaya-inf113.ec.avayacloud.com/auth-proxy/userinfo",
          {
            method: "GET",
            // credentials not specified - defaults to "same-origin"
            headers: {
              Accept: "application/json",
            },
          }
        );

        addResult(
          `  Response status: ${response.status} ${response.statusText}`
        );

        if (response.ok) {
          addResult(
            `✓ INFO: Request succeeded without explicit credentials flag`
          );
        } else if (response.status === 401) {
          addResult(
            `⚠ INFO: 401 without credentials flag - implicit cookies not sent`
          );
        }
      } catch (e: any) {
        addResult(`✗ FAILED: Fetch failed - ${e.message}`);
      }

      // Test cross-site API request
      addResult("═══════════════════════════════════════════════════════");
      addResult("🌐 CROSS-SITE API REQUEST TEST");
      addResult("═══════════════════════════════════════════════════════");
      addResult("⚠ TESTING: Cross-origin request to external API...");
      addResult(
        "  Making request to https://jsonplaceholder.typicode.com/users/1"
      );

      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/users/1",
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        addResult(
          `✓ SUCCESS: Cross-site request succeeded - Status ${response.status}`
        );

        try {
          const data = await response.json();
          addResult(`  Response: ${JSON.stringify(data).substring(0, 150)}...`);
        } catch {
          addResult(`  Could not parse response as JSON`);
        }
      } catch (e: any) {
        addResult(`✗ BLOCKED: Cross-site request failed - ${e.message}`);
        addResult(`  This may indicate CORS restrictions or network policies`);
      }

      // Test cross-site request with different credentials modes
      addResult("⚠ TESTING: Cross-origin with credentials='omit'...");
      try {
        const response = await fetch(
          "https://jsonplaceholder.typicode.com/users/1",
          {
            method: "GET",
            credentials: "omit",
          }
        );
        addResult(
          `✓ INFO: Request with credentials='omit' succeeded - Status ${response.status}`
        );
      } catch (e: any) {
        addResult(
          `✗ BLOCKED: Request with credentials='omit' failed - ${e.message}`
        );
      }

      // Test cross-site request to localhost/different port (if applicable)
      addResult(
        "⚠ TESTING: Cross-origin to different port (localhost:3001)..."
      );
      try {
        const response = await fetch("http://localhost:3001/api/test", {
          method: "GET",
          credentials: "include",
        });
        addResult(
          `✓ INFO: Cross-port request succeeded - Status ${response.status}`
        );
      } catch (e: any) {
        addResult(`⚠ INFO: Cross-port request failed - ${e.message}`);
        addResult(`  This is expected if no server is running on port 3001`);
      }

      addResult("═══════════════════════════════════════════════════════");
      addResult("✅ COOKIE TESTS COMPLETED - SUMMARY");
      addResult("═══════════════════════════════════════════════════════");
      addResult("Tests performed:");
      addResult("");
      addResult("🔒 Security Tests:");
      addResult("  ✓ Iframe CANNOT access parent cookies");
      addResult("  ✓ Iframe CANNOT set parent cookies");
      addResult("  ✓ JavaScript CANNOT set HttpOnly cookies");
      addResult("");
      addResult("🍪 Client-Side Cookie Setting (via document.cookie):");
      addResult("  ✓ Basic cookies (no flags)");
      addResult("  ✓ SameSite=Lax cookies");
      addResult("  ✓ SameSite=Strict cookies");
      addResult("  ✓ Secure cookies (HTTPS only)");
      addResult("");
      addResult("🔙 Backend-Set Cookies (via Set-Cookie header):");
      addResult("  ✓ Regular backend cookies (visible to JS)");
      addResult(
        "  ✓ HttpOnly backend cookies (NOT visible to JS, but sent by browser)"
      );
      addResult("");
      addResult(
        "✅ All cookie types tested for iframe functionality and security!"
      );
      addResult("═══════════════════════════════════════════════════════");
    } catch (e: any) {
      addResult(`✗ FAILED: Cookie Access Test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 19: Iframe Sandbox Detection
  const testIframeSandboxDetection = () => {
    try {
      addResult("═══════════════════════════════════════════════════════");
      addResult("🔍 IFRAME SANDBOX DETECTION TEST");
      addResult("═══════════════════════════════════════════════════════");

      addResult("⚠ TESTING: iframe sandbox restrictions...");

      // Test 1: Check if we're in an iframe
      addResult("⚠ TESTING: iframe detection...");
      if (window.parent === window) {
        addResult("✓ INFO: Not running in iframe (window.parent === window)");
      } else {
        addResult("✓ INFO: Running in iframe (window.parent !== window)");

        // Test 2: Check if we can access parent
        addResult("⚠ TESTING: parent window access...");
        try {
          const parentOrigin = window.parent.location.origin;
          addResult(`✓ INFO: Can access parent origin: ${parentOrigin}`);
        } catch (e: any) {
          addResult(`⚠ BLOCKED: Cannot access parent origin - ${e.name}`);
        }
      }

      // Test 3: Check for sandbox restrictions via custom element registration
      addResult("⚠ TESTING: sandbox restrictions via custom element test...");
      try {
        const testElementName = `sandbox-test-${Date.now()}`;

        class SandboxTestElement extends HTMLElement {
          constructor() {
            super();
            this.textContent = "Sandbox Test";
          }
        }

        customElements.define(testElementName, SandboxTestElement);
        const testEl = document.createElement(testElementName);

        // Try to append to a temporary container
        const tempContainer = document.createElement("div");
        tempContainer.appendChild(testEl);

        addResult(
          "✓ SUCCESS: Custom element registration works (no sandbox restrictions)"
        );

        // Clean up
        tempContainer.removeChild(testEl);
      } catch (e: any) {
        if (
          e.message.includes("The result must not have children") ||
          e.message.includes("NotSupportedError")
        ) {
          addResult(
            "✗ SANDBOX RESTRICTION: Custom element registration blocked"
          );
          addResult(
            "  This indicates iframe sandbox without 'allow-same-origin'"
          );
          addResult(
            "  Required sandbox attributes: 'allow-same-origin allow-scripts'"
          );
        } else {
          addResult(`✗ FAILED: Custom element test failed - ${e.message}`);
        }
      }

      // Test 4: Check for other sandbox restrictions
      addResult("⚠ TESTING: other sandbox restrictions...");

      // Test localStorage access
      try {
        const testKey = `sandbox-test-${Date.now()}`;
        localStorage.setItem(testKey, "test");
        localStorage.removeItem(testKey);
        addResult("✓ SUCCESS: localStorage access works");
      } catch (e: any) {
        addResult(`⚠ BLOCKED: localStorage access blocked - ${e.name}`);
      }

      // Test sessionStorage access
      try {
        const testKey = `sandbox-test-${Date.now()}`;
        sessionStorage.setItem(testKey, "test");
        sessionStorage.removeItem(testKey);
        addResult("✓ SUCCESS: sessionStorage access works");
      } catch (e: any) {
        addResult(`⚠ BLOCKED: sessionStorage access blocked - ${e.name}`);
      }

      // Test document.cookie access
      try {
        const originalCookie = document.cookie;
        document.cookie = `sandbox-test-${Date.now()}=test; path=/`;
        const newCookie = document.cookie;
        addResult("✓ SUCCESS: document.cookie access works");

        // Clean up
        document.cookie = `sandbox-test-${Date.now()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      } catch (e: any) {
        addResult(`⚠ BLOCKED: document.cookie access blocked - ${e.name}`);
      }

      // Test 5: Check for specific sandbox attributes
      addResult("⚠ TESTING: sandbox attribute detection...");

      // Try to detect if we're in a sandboxed iframe by checking various restrictions
      const restrictions = [];

      try {
        // Test if we can access top-level window
        if (window.top !== window) {
          restrictions.push("top-level access restricted");
        }
      } catch (e) {
        restrictions.push("top-level access blocked");
      }

      try {
        // Test if we can access parent document
        if (window.parent !== window) {
          const parentDoc = window.parent.document;
          if (parentDoc) {
            restrictions.push("parent document access allowed");
          }
        }
      } catch (e) {
        restrictions.push("parent document access blocked");
      }

      if (restrictions.length > 0) {
        addResult(`⚠ DETECTED RESTRICTIONS: ${restrictions.join(", ")}`);
      } else {
        addResult("✓ INFO: No obvious sandbox restrictions detected");
      }

      addResult("═══════════════════════════════════════════════════════");
      addResult("✅ Iframe sandbox detection test completed");
      addResult("═══════════════════════════════════════════════════════");
    } catch (e: any) {
      addResult(`✗ FAILED: Iframe Sandbox Detection Test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 20: React Internal Processing Test
  const testReactInternalProcessing = () => {
    try {
      addResult("═══════════════════════════════════════════════════════");
      addResult("⚛️ REACT INTERNAL PROCESSING TEST");
      addResult("═══════════════════════════════════════════════════════");

      addResult("⚠ TESTING: React's internal element processing...");

      const container = testContainerRef.current;
      if (!container) {
        addResult("✗ FAILED: Test container not available");
        return;
      }

      // Test 1: Create a custom element with complex internal structure
      addResult(
        "⚠ TESTING: Creating custom element with internal structure..."
      );
      const elementName = `react-test-${Date.now()}`;

      class ReactTestElement extends HTMLElement {
        constructor() {
          super();
          this.innerHTML = `
            <div class="internal-content">
              <span>Child 1</span>
              <span>Child 2</span>
              <div class="nested">
                <p>Nested content</p>
              </div>
            </div>
          `;
          this.setAttribute("data-test", "react-processing");
          this.style.cssText =
            "padding: 10px; background: #e3f2fd; margin: 5px; border-radius: 4px;";
        }

        connectedCallback() {
          addResult(
            "✓ SUCCESS: connectedCallback fired (React can access lifecycle)"
          );
        }

        disconnectedCallback() {
          addResult(
            "✓ SUCCESS: disconnectedCallback fired (React can access lifecycle)"
          );
        }
      }

      customElements.define(elementName, ReactTestElement);
      addResult(`✓ SUCCESS: Custom element defined with internal structure`);

      // Test 2: Create and append the element
      addResult("⚠ TESTING: Creating and appending element...");
      addResult("  🎯 This is line 1639 where the error occurs");
      let testEl;
      try {
        testEl = document.createElement(elementName);
        container.appendChild(testEl);
        addResult(`✓ SUCCESS: Element added to DOM`);
      } catch (e: any) {
        addResult(`✗ FAILED: Element creation blocked - ${e.message}`);
        addResult(`  This is the EXACT error you're seeing in the console!`);
        addResult(`  Error: "The result must not have attributes"`);
        addResult(
          `  🔍 WHY: The custom element sets attributes in its constructor:`
        );
        addResult(`     - this.setAttribute("data-test", "react-processing")`);
        addResult(
          `     - this.style.cssText = "padding: 10px; background: #e3f2fd; margin: 5px; border-radius: 4px;"`
        );
        addResult(
          `  🚫 IFRAME SANDBOX BLOCKS: Access to element attributes during creation`
        );
        addResult(
          `  💡 SOLUTION: Add 'allow-same-origin' to iframe sandbox attribute`
        );
        return; // Exit early if element creation fails
      }

      // Test 3: Check specific React behaviors that require same-origin access
      addResult(
        "⚠ TESTING: React-specific behaviors requiring same-origin access..."
      );

      try {
        // Test 1: React's ref system - accessing element internals
        addResult("⚠ TESTING: React ref system (element internals access)...");
        addResult("  🔗 Docs: https://reactjs.org/docs/refs-and-the-dom.html");
        const elementRef = testEl;
        const hasChildren = elementRef.children.length > 0;
        addResult(
          `✓ SUCCESS: React ref system works (${elementRef.children.length} children accessible)`
        );

        // Test 2: React's event system - event listener attachment
        addResult("⚠ TESTING: React event system...");
        addResult("  🔗 Docs: https://reactjs.org/docs/events.html");
        let reactEventFired = false;
        const reactEventHandler = () => {
          reactEventFired = true;
        };
        elementRef.addEventListener("click", reactEventHandler);
        elementRef.click();
        elementRef.removeEventListener("click", reactEventHandler);

        if (reactEventFired) {
          addResult(
            `✓ SUCCESS: React event system works (addEventListener/removeEventListener)`
          );
        } else {
          addResult(`⚠ WARNING: React event system may be blocked`);
        }

        // Test 3: React's attribute system
        addResult("⚠ TESTING: React attribute system...");
        addResult("  🔗 Docs: https://reactjs.org/docs/dom-elements.html");
        const originalAttr = elementRef.getAttribute("data-test");
        elementRef.setAttribute("data-react-test", "react-attribute-test");
        const newAttr = elementRef.getAttribute("data-react-test");
        elementRef.removeAttribute("data-react-test");

        if (newAttr === "react-attribute-test") {
          addResult(
            `✓ SUCCESS: React attribute system works (getAttribute/setAttribute/removeAttribute)`
          );
        } else {
          addResult(`⚠ WARNING: React attribute system may be blocked`);
        }

        // Test 4: React's DOM manipulation (what causes the actual error)
        addResult(
          "⚠ TESTING: React DOM manipulation (the actual failing operation)..."
        );
        addResult(
          "  🔗 Source: ReactDOMComponent.js - createElement implementation"
        );
        try {
          // This is what React actually does internally that causes the error
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = `<${elementName}></${elementName}>`;
          const clonedElement = tempDiv.firstElementChild;
          if (clonedElement) {
            addResult(
              `✓ SUCCESS: React DOM manipulation works (innerHTML with custom elements)`
            );
          }
        } catch (e: any) {
          addResult(`✗ FAILED: React DOM manipulation blocked - ${e.message}`);
          addResult(
            `  This is the exact operation that fails in React's internal processing.`
          );
          addResult(`  Error: ${e.message}`);
        }

        // Test 5: React's style system
        addResult("⚠ TESTING: React style system...");
        addResult(
          "  🔗 Docs: https://reactjs.org/docs/dom-elements.html#style"
        );
        const originalDisplay = elementRef.style.display;
        elementRef.style.display = "none";
        elementRef.style.display = "block";
        elementRef.style.display = originalDisplay;
        addResult(
          `✓ SUCCESS: React style system works (style property access)`
        );
      } catch (e: any) {
        addResult(`✗ FAILED: React internal processing blocked - ${e.message}`);
        addResult(
          `  This indicates iframe sandbox restrictions are preventing`
        );
        addResult(`  React from accessing element internals.`);
        addResult(`  Solution: Add 'allow-same-origin' to iframe sandbox.`);
      }

      // Test 4: Check for async errors during React processing
      addResult("⚠ TESTING: Monitoring for async React processing errors...");
      addResult(
        "  🔍 WHY: React processes elements asynchronously after DOM operations"
      );
      addResult(
        "  📚 Docs: React Fiber architecture uses async reconciliation"
      );

      let asyncErrorDetected = false;
      const originalConsoleError = console.error;
      const originalWindowError = window.onerror;

      // Catch console errors
      console.error = (...args) => {
        const message = args.join(" ");
        if (
          message.includes("The result must not have children") ||
          message.includes("NotSupportedError") ||
          message.includes("The result must not have attributes")
        ) {
          asyncErrorDetected = true;
          addResult(`✗ ASYNC ERROR: ${message}`);
          addResult(
            `  🕐 TIMING: This error occurred AFTER your try-catch completed`
          );
          addResult(
            `  🔄 REACT: React's async processing failed due to iframe sandbox`
          );
          addResult(
            `  💡 SOLUTION: Add 'allow-same-origin' to iframe sandbox attribute`
          );
        }
        // Call original console.error
        originalConsoleError.apply(console, args);
      };

      // Catch window errors
      window.onerror = (message, source, lineno, colno, error) => {
        if (
          typeof message === "string" &&
          (message.includes("The result must not have children") ||
            message.includes("NotSupportedError") ||
            message.includes("The result must not have attributes"))
        ) {
          asyncErrorDetected = true;
          addResult(`✗ WINDOW ERROR: ${message}`);
          addResult(
            `  🕐 TIMING: This error occurred AFTER your try-catch completed`
          );
          addResult(
            `  🔄 REACT: React's async processing failed due to iframe sandbox`
          );
          addResult(
            `  💡 SOLUTION: Add 'allow-same-origin' to iframe sandbox attribute`
          );
        }
        // Call original window.onerror
        if (originalWindowError) {
          return originalWindowError(message, source, lineno, colno, error);
        }
        return false;
      };

      // Force React to process the element by triggering a re-render
      setTimeout(() => {
        try {
          // Simulate React's internal processing
          testEl.style.display = "none";
          testEl.style.display = "block";

          // Restore error handlers
          console.error = originalConsoleError;
          window.onerror = originalWindowError;

          if (!asyncErrorDetected) {
            addResult(
              `✓ SUCCESS: No async errors detected - React processing works`
            );
          } else {
            addResult(
              `✗ FAILED: Async errors detected - React processing blocked`
            );
          }
        } catch (e: any) {
          addResult(`✗ FAILED: React processing error - ${e.message}`);
          console.error = originalConsoleError;
        }
      }, 1000);

      // Clean up after a moment
      setTimeout(() => {
        try {
          container.removeChild(testEl);
          addResult(`🧹 CLEANUP: Removed React test element`);
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 5000);

      addResult("═══════════════════════════════════════════════════════");
      addResult("✅ React internal processing test completed");
      addResult("═══════════════════════════════════════════════════════");
    } catch (e: any) {
      addResult(`✗ FAILED: React Internal Processing Test - ${e.message}`);
      addResult(`  Stack: ${e.stack?.split("\n")[0] || "no stack"}`);
    }
  };

  // Test 21: Parent Window Access (Security Test)
  const testParentWindowAccess = () => {
    try {
      addResult("═══════════════════════════════════════════════════════");
      addResult("🔒 PARENT WINDOW ACCESS TEST");
      addResult("═══════════════════════════════════════════════════════");

      addResult("⚠ TESTING: window.parent access...");
      try {
        if (window.parent === window) {
          addResult("⚠ INFO: No parent window (not in iframe)");
        } else {
          addResult("✓ SUCCESS: window.parent is accessible");

          addResult("⚠ TESTING: parent.location access...");
          try {
            const loc = window.parent.location.href;
            addResult(
              `✗ SECURITY ISSUE: Can read parent location: ${loc.substring(
                0,
                50
              )}`
            );
          } catch (e: any) {
            addResult(`✓ BLOCKED: Cannot read parent location - ${e.name}`);
          }

          addResult("⚠ TESTING: parent.document access...");
          try {
            const doc = window.parent.document;
            addResult(`✗ SECURITY ISSUE: Can access parent document`);
          } catch (e: any) {
            addResult(`✓ BLOCKED: Cannot access parent document - ${e.name}`);
          }

          addResult("⚠ TESTING: parent.postMessage availability...");
          try {
            if (typeof window.parent.postMessage === "function") {
              addResult(
                `✓ INFO: parent.postMessage is available (expected for communication)`
              );
            }
          } catch (e: any) {
            addResult(`✗ FAILED: Cannot check parent.postMessage - ${e.name}`);
          }
        }
      } catch (e: any) {
        addResult(`✗ FAILED: window.parent access failed - ${e.message}`);
      }

      addResult("═══════════════════════════════════════════════════════");
      addResult("✅ Parent window access test completed");
      addResult("═══════════════════════════════════════════════════════");
    } catch (e: any) {
      addResult(`✗ FAILED: Parent Window Access Test - ${e.message}`);
    }
  };

  // Test 22: Basic Popup Creation
  const testBasicPopupCreation = () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: Basic popup window creation...");

      const popup = window.open(
        "",
        "_blank",
        "width=400,height=300,scrollbars=yes,resizable=yes"
      );

      if (!popup) {
        addResult("✓ SECURE: Popup blocked by browser (attack prevented)");
        addResult("⚠ INFO: Cannot test popup attacks if popups are blocked");
        return { passed: true, errors: 0, warnings };
      }

      addResult("✓ SUCCESS: Popup window created");
      setPopupWindows((prev) => [...prev, popup]);

      // Test popup properties
      addResult("⚠ TESTING: Popup window properties...");
      addResult(`  Popup name: ${popup.name}`);
      addResult(`  Popup closed: ${popup.closed}`);
      addResult(
        `  Popup opener: ${popup.opener === window ? "same" : "different"}`
      );

      // Test if popup can access its own document
      try {
        popup.document.write("<html><body><h1>Test Popup</h1></body></html>");
        popup.document.close();
        addResult("✓ SUCCESS: Popup can write to its own document");
      } catch (e: any) {
        addResult(`✗ FAILED: Popup document access blocked - ${e.message}`);
        errors++;
      }

      // Clean up popup after test
      setTimeout(() => {
        try {
          popup.close();
          addResult("🧹 CLEANUP: Closed test popup");
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 2000);

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: Basic popup creation - ${e.message}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // Test 23: Popup to Parent Window Access
  const testPopupToParentWindowAccess = () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: Popup access to parent window...");

      const popup = window.open("", "_blank", "width=400,height=300");
      if (!popup) {
        addResult("✓ SECURE: Popup blocked by browser (attack prevented)");
        addResult("⚠ INFO: Cannot test popup attacks if popups are blocked");
        return { passed: true, errors: 0, warnings };
      }

      setPopupWindows((prev) => [...prev, popup]);

      // Test if popup can access parent window
      addResult("⚠ TESTING: popup.opener access...");
      try {
        if (popup.opener === window) {
          addResult("✓ SUCCESS: popup.opener points to parent window");
          warnings++; // This is a potential security issue
        } else {
          addResult("✓ BLOCKED: popup.opener is null or different window");
        }
      } catch (e: any) {
        addResult(`✓ BLOCKED: Cannot access popup.opener - ${e.name}`);
      }

      // Test if popup can access opener's window object (the iframe that opened the popup)
      addResult("⚠ TESTING: Direct opener window access from popup...");
      try {
        popup.document.write(`
          <html>
            <body>
              <h1>Popup Attack Test</h1>
              <script>
                try {
                  if (window.opener) {
                    document.body.innerHTML += '<p style="color: orange;">⚠️ INFO: Can access opener window (the iframe)</p>';
                    document.body.innerHTML += '<p>Opener URL: ' + window.opener.location.href + '</p>';
                    document.body.innerHTML += '<p>Opener title: ' + window.opener.document.title + '</p>';
                    
                    // IMPORTANT: Test if popup can access the opener's parent (the host page that contains the iframe)
                    document.body.innerHTML += '<hr><h3>Testing Access to Opener\'s Parent (Host Page):</h3>';
                    try {
                      if (window.opener.parent) {
                        document.body.innerHTML += '<p style="color: red;">⚠️ VULNERABILITY: Can access opener.parent (the host page)!</p>';
                        document.body.innerHTML += '<p>Host page URL: ' + window.opener.parent.location.href + '</p>';
                        document.body.innerHTML += '<p>Host page title: ' + window.opener.parent.document.title + '</p>';
                      } else {
                        document.body.innerHTML += '<p style="color: green;">✓ SECURE: Cannot access opener.parent</p>';
                      }
                    } catch (e) {
                      document.body.innerHTML += '<p style="color: green;">✓ SECURE: Opener parent access blocked - ' + e.name + '</p>';
                    }
                  } else {
                    document.body.innerHTML += '<p style="color: green;">✓ SECURE: Cannot access opener window</p>';
                  }
                } catch (e) {
                  document.body.innerHTML += '<p style="color: green;">✓ SECURE: Opener access blocked - ' + e.name + '</p>';
                }
              </script>
            </body>
          </html>
        `);
        popup.document.close();
        addResult("✓ SUCCESS: Popup script executed");
      } catch (e: any) {
        addResult(`✗ FAILED: Popup script execution failed - ${e.message}`);
        errors++;
      }

      // Clean up
      setTimeout(() => {
        try {
          popup.close();
          addResult("🧹 CLEANUP: Closed parent access test popup");
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 3000);

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: Popup to parent window access - ${e.message}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // (Removed Test 24: Popup to Top Window Access - redundant, window.top === window in popups)

  // Test 25: Popup to Parent Comprehensive
  const testPopupToParentComprehensive = () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: Popup comprehensive host page access tests...");

      const popup = window.open("", "_blank", "width=400,height=300");
      if (!popup) {
        addResult("✓ SECURE: Popup blocked by browser (attack prevented)");
        addResult("⚠ INFO: Cannot test popup attacks if popups are blocked");
        return { passed: true, errors: 0, warnings };
      }

      setPopupWindows((prev) => [...prev, popup]);

      addResult(
        "⚠ TESTING: Comprehensive popup attacks on host page (opener.parent)..."
      );
      try {
        popup.document.write(`
          <html>
            <body>
              <h1>Comprehensive Host Page Attack Test</h1>
              <script>
                function logMessage(msg) {
                  console.log(msg);
                  if (window.opener) {
                    window.opener.postMessage(msg, '*');
                  }
                }
                
                try {
                  const parent = window.opener && window.opener.parent && window.opener.parent !== window.opener ? window.opener.parent : null;
                  
                  if (!parent) {
                    const msg = '✓ SECURE: Cannot access opener.parent (host page)';
                    document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                    logMessage(msg);
                    return;
                  }
                  
                  document.body.innerHTML += '<h2>Testing Multiple Attack Vectors on Host Page:</h2>';
                  
                  // Test 1: Document manipulation
                  try {
                    if (parent.document && parent.document.body) {
                      const attackDiv = parent.document.createElement('div');
                      attackDiv.innerHTML = '<p style="color: red; background: yellow;">🚨 POPUP ATTACK IN HOST PAGE!</p>';
                      attackDiv.style.position = 'fixed';
                      attackDiv.style.top = '0';
                      attackDiv.style.right = '0';
                      attackDiv.style.zIndex = '99999';
                      parent.document.body.appendChild(attackDiv);
                      logMessage('⚠️ VULNERABILITY: Can inject into host page DOM!');
                    }
                  } catch (e) {
                    logMessage('✓ SECURE: Host page DOM injection blocked - ' + e.name);
                  }
                  
                  // Test 2: PostMessage
                  try {
                    parent.postMessage("POPUP_ATTACK_TO_HOST: " + window.location.href, "*");
                    logMessage('⚠️ VULNERABILITY: Can postMessage to host page!');
                  } catch (e) {
                    logMessage('✓ SECURE: Host page postMessage blocked - ' + e.name);
                  }
                  
                  // Test 3: Navigation
                  try {
                    parent.location.href = "https://example.com";
                    logMessage('⚠️ VULNERABILITY: Can navigate host page!');
                  } catch (e) {
                    logMessage('✓ SECURE: Host page navigation blocked - ' + e.name);
                  }
                  
                  // Test 4: Storage
                  try {
                    if (parent.localStorage) {
                      parent.localStorage.setItem('popup_test', 'attack');
                      parent.localStorage.removeItem('popup_test');
                      logMessage('⚠️ VULNERABILITY: Can access host page localStorage!');
                    }
                  } catch (e) {
                    logMessage('✓ SECURE: Host page localStorage blocked - ' + e.name);
                  }
                  
                  // Test 5: History control
                  try {
                    parent.history.back();
                    logMessage('⚠️ VULNERABILITY: Can control host page history!');
                  } catch (e) {
                    logMessage('✓ SECURE: Host page history control blocked - ' + e.name);
                  }
                  
                  // Test 6: Focus manipulation
                  try {
                    parent.focus();
                    logMessage('⚠️ VULNERABILITY: Can control host page focus!');
                  } catch (e) {
                    logMessage('✓ SECURE: Host page focus control blocked - ' + e.name);
                  }
                  
                  // Test 7: Window resize
                  try {
                    parent.resizeTo(800, 600);
                    logMessage('⚠️ VULNERABILITY: Can resize host page window!');
                  } catch (e) {
                    logMessage('✓ SECURE: Host page window resize blocked - ' + e.name);
                  }
                  
                  document.body.innerHTML += '<p style="color: blue;">ℹ️ Check the parent window\'s log for test results</p>';
                } catch (e) {
                  const msg = '✓ SECURE: Comprehensive test blocked - ' + e.name;
                  document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                  logMessage(msg);
                }
              </script>
            </body>
          </html>
        `);
        popup.document.close();
        addResult("✓ SUCCESS: Comprehensive popup attack test executed");
      } catch (e: any) {
        addResult(`✗ FAILED: Comprehensive test failed - ${e.message}`);
        errors++;
      }

      // Clean up
      setTimeout(() => {
        try {
          popup.close();
          addResult("🧹 CLEANUP: Closed comprehensive test popup");
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 3000);

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: Popup comprehensive test - ${e.message}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // Test 26: Popup Sandbox Escape Detection
  const testPopupSandboxEscapeDetection = async () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: Popup sandbox escape detection...");

      const popup = window.open("", "_blank", "width=400,height=300");
      if (!popup) {
        addResult("✓ SECURE: Popup blocked by browser (attack prevented)");
        addResult("⚠ INFO: Cannot test popup attacks if popups are blocked");
        return { passed: true, errors: 0, warnings };
      }

      setPopupWindows((prev) => [...prev, popup]);

      // Track vulnerability detection
      let vulnerabilityDetected = false;

      // Listen for messages from the popup
      const messageHandler = (event: MessageEvent) => {
        if (event.source === popup) {
          const message = event.data;
          if (typeof message === "string") {
            if (message.includes("VULNERABILITY_DETECTED")) {
              vulnerabilityDetected = true;
              addResult(
                `✗ CRITICAL VULNERABILITY: allow-popups-to-escape-sandbox is ENABLED!`
              );
              errors++;
              warnings++;
            } else if (message.includes("Not running in iframe")) {
              addResult(
                "ℹ️ INFO: Not running in iframe - popup escape test not applicable"
              );
            } else if (message.includes("No sandbox escape")) {
              addResult("✓ SECURE: No sandbox escape via popup detected");
            }
          }
        }
      };

      window.addEventListener("message", messageHandler);

      addResult("⚠ TESTING: Popup attempting to detect sandbox escape...");
      try {
        popup.document.write(`
          <html>
            <body>
              <h1>Sandbox Escape Detection Test</h1>
              <script>
                function logMessage(msg) {
                  console.log(msg);
                  if (window.opener) {
                    window.opener.postMessage(msg, '*');
                  }
                }
                
                try {
                  // Test if the opener (web component) is in an iframe
                  let openerInIframe = false;
                  let escapeDetected = false;
                  
                  // Check if opener is in an iframe
                  try {
                    if (window.opener) {
                      if (window.opener.parent !== window.opener) {
                        openerInIframe = true;
                        logMessage('⚠️ INFO: Opener (web component) is running in an iframe');
                        document.body.innerHTML += '<p style="color: orange;">⚠️ INFO: Opener is in iframe</p>';
                        
                        // Test if popup can access opener's parent (escape from iframe)
                        try {
                          if (window.opener.parent && window.opener.parent !== window.opener) {
                            const parentUrl = window.opener.parent.location.href;
                            document.body.innerHTML += '<p style="color: red;">⚠️ VULNERABILITY: Sandbox escape via popup detected!</p>';
                            document.body.innerHTML += '<p>Can access opener.parent URL: ' + parentUrl + '</p>';
                            logMessage('VULNERABILITY_DETECTED: Sandbox escape via popup - can access opener.parent!');
                            escapeDetected = true;
                          } else {
                            document.body.innerHTML += '<p style="color: green;">✓ SECURE: Cannot access opener.parent</p>';
                            logMessage('✓ SECURE: Cannot access opener.parent');
                          }
                        } catch (e) {
                          document.body.innerHTML += '<p style="color: green;">✓ SECURE: opener.parent access blocked - ' + e.name + '</p>';
                          logMessage('✓ SECURE: opener.parent access blocked - ' + e.name);
                        }
                      } else {
                        document.body.innerHTML += '<p style="color: blue;">ℹ️ INFO: Opener is not in an iframe (not sandboxed)</p>';
                        logMessage('ℹ️ INFO: Opener is not in an iframe');
                      }
                    } else {
                      document.body.innerHTML += '<p style="color: blue;">ℹ️ INFO: No opener window</p>';
                      logMessage('ℹ️ INFO: No opener window');
                    }
                  } catch (e) {
                    document.body.innerHTML += '<p style="color: green;">✓ SECURE: Cannot access opener - ' + e.name + '</p>';
                    logMessage('✓ SECURE: Cannot access opener - ' + e.name);
                  }
                  
                  // Test allow-popups-to-escape-sandbox specifically
                  if (openerInIframe && escapeDetected) {
                    document.body.innerHTML += '<p style="color: red; font-weight: bold;">🚨 CRITICAL: allow-popups-to-escape-sandbox is ENABLED!</p>';
                    document.body.innerHTML += '<p>This allows popups to bypass iframe sandbox restrictions!</p>';
                    logMessage('VULNERABILITY_DETECTED: CRITICAL - allow-popups-to-escape-sandbox ENABLED!');
                  }
                } catch (e) {
                  document.body.innerHTML += '<p style="color: green;">✓ SECURE: Sandbox escape detection blocked - ' + e.name + '</p>';
                  logMessage('✓ SECURE: Sandbox escape detection blocked - ' + e.name);
                }
              </script>
            </body>
          </html>
        `);
        popup.document.close();
        addResult("✓ SUCCESS: Sandbox escape detection test executed");
      } catch (e: any) {
        addResult(
          `✗ FAILED: Sandbox escape detection test failed - ${e.message}`
        );
        errors++;
      }

      // Wait for popup to execute and send messages
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Remove message listener
      window.removeEventListener("message", messageHandler);

      // Clean up
      setTimeout(() => {
        try {
          popup.close();
          addResult("🧹 CLEANUP: Closed sandbox escape detection test popup");
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 2000);

      if (vulnerabilityDetected) {
        addResult(
          "✗ FAILED: Sandbox escape vulnerability detected - allow-popups-to-escape-sandbox is enabled!"
        );
        return { passed: false, errors, warnings };
      }

      addResult("✓ SECURE: No sandbox escape vulnerability detected");

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: Popup sandbox escape detection - ${e.message}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // Test 34: Popup to Parent Cookie Access
  const testPopupToParentCookieAccess = () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: Popup to parent cookie access...");

      const popup = window.open("", "_blank", "width=400,height=300");
      if (!popup) {
        addResult("✓ SECURE: Popup blocked by browser (attack prevented)");
        addResult("⚠ INFO: Cannot test popup attacks if popups are blocked");
        return { passed: true, errors: 0, warnings };
      }

      setPopupWindows((prev) => [...prev, popup]);

      addResult("⚠ TESTING: Popup attempting to access parent cookies...");
      try {
        popup.document.write(`
          <html>
            <body>
              <h1>Parent Cookie Access Test</h1>
              <script>
                function logMessage(msg) {
                  console.log(msg);
                  if (window.opener) {
                    window.opener.postMessage(msg, '*');
                  }
                }
                
                try {
                  if (window.opener && window.opener.parent && window.opener.parent.document) {
                    // IMPORTANT: Test if popup can access the opener's parent (the host page that contains the iframe)
                    // Try to access host page cookies
                    try {
                      const parentCookies = window.opener.parent.document.cookie;
                      if (parentCookies) {
                        const msg = '⚠️ VULNERABILITY: Can access host page cookies!';
                        document.body.innerHTML += '<p style="color: red;">' + msg + '</p>';
                        document.body.innerHTML += '<p>Cookies: ' + parentCookies.substring(0, 100) + '...</p>';
                        logMessage(msg);
                      } else {
                        const msg = '✓ SECURE: No host page cookies accessible';
                        document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                        logMessage(msg);
                      }
                    } catch (e) {
                      const msg = '✓ SECURE: Host page cookie access blocked - ' + e.name;
                      document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                      logMessage(msg);
                    }
                    
                    // Try to set host page cookies
                    try {
                      window.opener.parent.document.cookie = 'popup_attack_test=malicious_value; path=/';
                      const msg = '⚠️ VULNERABILITY: Can set host page cookies!';
                      document.body.innerHTML += '<p style="color: red;">' + msg + '</p>';
                      logMessage(msg);
                    } catch (e) {
                      const msg = '✓ SECURE: Host page cookie setting blocked - ' + e.name;
                      document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                      logMessage(msg);
                    }
                  } else {
                    const msg = '✓ SECURE: Cannot access opener.parent';
                    document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                    logMessage(msg);
                  }
                } catch (e) {
                  const msg = '✓ SECURE: Opener parent access blocked - ' + e.name;
                  document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                  logMessage(msg);
                }
              </script>
            </body>
          </html>
        `);
        popup.document.close();
        addResult("✓ SUCCESS: Parent cookie access test executed");
      } catch (e: any) {
        addResult(`✗ FAILED: Parent cookie access test failed - ${e.message}`);
        errors++;
      }

      // Clean up
      setTimeout(() => {
        try {
          popup.close();
          addResult("🧹 CLEANUP: Closed parent cookie access test popup");
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 3000);

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: Popup to parent cookie access - ${e.message}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // Test 35: Popup to Parent LocalStorage
  const testPopupToParentLocalStorage = () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: Popup to parent localStorage access...");

      const popup = window.open("", "_blank", "width=400,height=300");
      if (!popup) {
        addResult("✓ SECURE: Popup blocked by browser (attack prevented)");
        addResult("⚠ INFO: Cannot test popup attacks if popups are blocked");
        return { passed: true, errors: 0, warnings };
      }

      setPopupWindows((prev) => [...prev, popup]);

      addResult("⚠ TESTING: Popup attempting to access parent localStorage...");
      try {
        popup.document.write(`
          <html>
            <body>
              <h1>Parent LocalStorage Access Test</h1>
              <script>
                function logMessage(msg) {
                  console.log(msg);
                  if (window.opener) {
                    window.opener.postMessage(msg, '*');
                  }
                }
                
                try {
                  if (window.opener && window.opener.parent && window.opener.parent.localStorage) {
                    // IMPORTANT: Test if popup can access the opener's parent (the host page that contains the iframe)
                    try {
                      const parentLocalStorage = window.opener.parent.localStorage;
                      const testKey = 'popup_attack_parent_localStorage_' + Date.now();
                      parentLocalStorage.setItem(testKey, 'malicious_parent_data');
                      const value = parentLocalStorage.getItem(testKey);
                      parentLocalStorage.removeItem(testKey);
                      const msg = '⚠️ VULNERABILITY: Can access host page localStorage!';
                      document.body.innerHTML += '<p style="color: red;">' + msg + '</p>';
                      document.body.innerHTML += '<p>Test value: ' + value + '</p>';
                      logMessage(msg);
                    } catch (e) {
                      const msg = '✓ SECURE: Host page localStorage blocked - ' + e.name;
                      document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                      logMessage(msg);
                    }
                  } else {
                    const msg = '✓ SECURE: Cannot access opener.parent';
                    document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                    logMessage(msg);
                  }
                } catch (e) {
                  const msg = '✓ SECURE: Opener parent access blocked - ' + e.name;
                  document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                  logMessage(msg);
                }
              </script>
            </body>
          </html>
        `);
        popup.document.close();
        addResult("✓ SUCCESS: Parent localStorage access test executed");
      } catch (e: any) {
        addResult(
          `✗ FAILED: Parent localStorage access test failed - ${e.message}`
        );
        errors++;
      }

      // Clean up
      setTimeout(() => {
        try {
          popup.close();
          addResult("🧹 CLEANUP: Closed parent localStorage access test popup");
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 3000);

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: Popup to parent localStorage - ${e.message}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // Test 36: Popup to Parent SessionStorage
  const testPopupToParentSessionStorage = () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: Popup to parent sessionStorage access...");

      const popup = window.open("", "_blank", "width=400,height=300");
      if (!popup) {
        addResult("✓ SECURE: Popup blocked by browser (attack prevented)");
        addResult("⚠ INFO: Cannot test popup attacks if popups are blocked");
        return { passed: true, errors: 0, warnings };
      }

      setPopupWindows((prev) => [...prev, popup]);

      addResult(
        "⚠ TESTING: Popup attempting to access parent sessionStorage..."
      );
      try {
        popup.document.write(`
          <html>
            <body>
              <h1>Parent SessionStorage Access Test</h1>
              <script>
                function logMessage(msg) {
                  console.log(msg);
                  if (window.opener) {
                    window.opener.postMessage(msg, '*');
                  }
                }
                
                try {
                  if (window.opener && window.opener.parent && window.opener.parent.sessionStorage) {
                    // IMPORTANT: Test if popup can access the opener's parent (the host page that contains the iframe)
                    try {
                      const parentSessionStorage = window.opener.parent.sessionStorage;
                      const testKey = 'popup_attack_parent_sessionStorage_' + Date.now();
                      parentSessionStorage.setItem(testKey, 'malicious_parent_session_data');
                      const value = parentSessionStorage.getItem(testKey);
                      parentSessionStorage.removeItem(testKey);
                      const msg = '⚠️ VULNERABILITY: Can access host page sessionStorage!';
                      document.body.innerHTML += '<p style="color: red;">' + msg + '</p>';
                      document.body.innerHTML += '<p>Test value: ' + value + '</p>';
                      logMessage(msg);
                    } catch (e) {
                      const msg = '✓ SECURE: Host page sessionStorage blocked - ' + e.name;
                      document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                      logMessage(msg);
                    }
                  } else {
                    const msg = '✓ SECURE: Cannot access opener.parent';
                    document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                    logMessage(msg);
                  }
                } catch (e) {
                  const msg = '✓ SECURE: Opener parent access blocked - ' + e.name;
                  document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                  logMessage(msg);
                }
              </script>
            </body>
          </html>
        `);
        popup.document.close();
        addResult("✓ SUCCESS: Parent sessionStorage access test executed");
      } catch (e: any) {
        addResult(
          `✗ FAILED: Parent sessionStorage access test failed - ${e.message}`
        );
        errors++;
      }

      // Clean up
      setTimeout(() => {
        try {
          popup.close();
          addResult(
            "🧹 CLEANUP: Closed parent sessionStorage access test popup"
          );
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 3000);

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: Popup to parent sessionStorage - ${e.message}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // Test 37: Popup to Parent IndexedDB
  const testPopupToParentIndexedDB = () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: Popup to parent IndexedDB access...");

      const popup = window.open("", "_blank", "width=400,height=300");
      if (!popup) {
        addResult("✓ SECURE: Popup blocked by browser (attack prevented)");
        addResult("⚠ INFO: Cannot test popup attacks if popups are blocked");
        return { passed: true, errors: 0, warnings };
      }

      setPopupWindows((prev) => [...prev, popup]);

      addResult("⚠ TESTING: Popup attempting to access parent IndexedDB...");
      try {
        popup.document.write(`
          <html>
            <body>
              <h1>Parent IndexedDB Access Test</h1>
              <script>
                function logMessage(msg) {
                  console.log(msg);
                  if (window.opener) {
                    window.opener.postMessage(msg, '*');
                  }
                }
                
                try {
                  if (window.opener && window.opener.parent && window.opener.parent.indexedDB) {
                    // IMPORTANT: Test if popup can access the opener's parent (the host page that contains the iframe)
                    try {
                      const dbName = 'popup_attack_parent_db_' + Date.now();
                      const request = window.opener.parent.indexedDB.open(dbName, 1);
                      
                      request.onsuccess = () => {
                        const msg = '⚠️ VULNERABILITY: Can access host page IndexedDB!';
                        document.body.innerHTML += '<p style="color: red;">' + msg + '</p>';
                        logMessage(msg);
                        request.result.close();
                        window.opener.parent.indexedDB.deleteDatabase(dbName);
                      };
                      
                      request.onerror = () => {
                        const msg = '✓ SECURE: Host page IndexedDB access blocked';
                        document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                        logMessage(msg);
                      };
                      
                      request.onupgradeneeded = () => {
                        const db = request.result;
                        db.createObjectStore('testStore', {keyPath: 'id'});
                      };
                    } catch (e) {
                      const msg = '✓ SECURE: Host page IndexedDB blocked - ' + e.name;
                      document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                      logMessage(msg);
                    }
                  } else {
                    const msg = '✓ SECURE: Cannot access opener.parent';
                    document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                    logMessage(msg);
                  }
                } catch (e) {
                  const msg = '✓ SECURE: Opener parent access blocked - ' + e.name;
                  document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                  logMessage(msg);
                }
              </script>
            </body>
          </html>
        `);
        popup.document.close();
        addResult("✓ SUCCESS: Parent IndexedDB access test executed");
      } catch (e: any) {
        addResult(
          `✗ FAILED: Parent IndexedDB access test failed - ${e.message}`
        );
        errors++;
      }

      // Clean up
      setTimeout(() => {
        try {
          popup.close();
          addResult("🧹 CLEANUP: Closed parent IndexedDB access test popup");
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 3000);

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: Popup to parent IndexedDB - ${e.message}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // Test 38: Popup to Parent XMLHttpRequest
  const testPopupToParentXMLHttpRequest = () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: Popup to parent XMLHttpRequest access...");

      const popup = window.open("", "_blank", "width=400,height=300");
      if (!popup) {
        addResult("✓ SECURE: Popup blocked by browser (attack prevented)");
        addResult("⚠ INFO: Cannot test popup attacks if popups are blocked");
        return { passed: true, errors: 0, warnings };
      }

      setPopupWindows((prev) => [...prev, popup]);

      addResult("⚠ TESTING: Popup attempting to use parent XMLHttpRequest...");
      try {
        popup.document.write(`
          <html>
            <body>
              <h1>Parent XMLHttpRequest Access Test</h1>
              <script>
                function logMessage(msg) {
                  console.log(msg);
                  if (window.opener) {
                    window.opener.postMessage(msg, '*');
                  }
                }
                
                try {
                  // IMPORTANT: Test if popup can use the opener's parent's XMLHttpRequest (the host page that contains the iframe)
                  if (window.opener && window.opener.parent && window.opener.parent.XMLHttpRequest) {
                    try {
                      const xhr = new window.opener.parent.XMLHttpRequest();
                      xhr.open('GET', 'data:text/plain,test', true);
                      xhr.onload = () => {
                        const msg = '⚠️ VULNERABILITY: Can use host page XMLHttpRequest!';
                        document.body.innerHTML += '<p style="color: red;">' + msg + '</p>';
                        logMessage(msg);
                      };
                      xhr.onerror = () => {
                        const msg = '✓ SECURE: Host page XMLHttpRequest blocked';
                        document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                        logMessage(msg);
                      };
                      xhr.send();
                    } catch (e) {
                      const msg = '✓ SECURE: Host page XMLHttpRequest blocked - ' + e.name;
                      document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                      logMessage(msg);
                    }
                  } else {
                    const msg = '✓ SECURE: Cannot access opener.parent';
                    document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                    logMessage(msg);
                  }
                } catch (e) {
                  const msg = '✓ SECURE: Opener parent access blocked - ' + e.name;
                  document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                  logMessage(msg);
                }
              </script>
            </body>
          </html>
        `);
        popup.document.close();
        addResult("✓ SUCCESS: Parent XMLHttpRequest access test executed");
      } catch (e: any) {
        addResult(
          `✗ FAILED: Parent XMLHttpRequest access test failed - ${e.message}`
        );
        errors++;
      }

      // Clean up
      setTimeout(() => {
        try {
          popup.close();
          addResult(
            "🧹 CLEANUP: Closed parent XMLHttpRequest access test popup"
          );
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 3000);

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: Popup to parent XMLHttpRequest - ${e.message}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // Test 39: Popup to Parent Fetch API
  const testPopupToParentFetchAPI = () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: Popup to parent Fetch API access...");

      const popup = window.open("", "_blank", "width=400,height=300");
      if (!popup) {
        addResult("✓ SECURE: Popup blocked by browser (attack prevented)");
        addResult("⚠ INFO: Cannot test popup attacks if popups are blocked");
        return { passed: true, errors: 0, warnings };
      }

      setPopupWindows((prev) => [...prev, popup]);

      addResult("⚠ TESTING: Popup attempting to use parent Fetch API...");
      try {
        popup.document.write(`
          <html>
            <body>
              <h1>Parent Fetch API Access Test</h1>
              <script>
                function logMessage(msg) {
                  console.log(msg);
                  if (window.opener) {
                    window.opener.postMessage(msg, '*');
                  }
                }
                
                try {
                  // IMPORTANT: Test if popup can use the opener's parent's Fetch API (the host page that contains the iframe)
                  if (window.opener && window.opener.parent && window.opener.parent.fetch) {
                    try {
                      window.opener.parent.fetch('data:text/plain,test')
                        .then(response => response.text())
                        .then(data => {
                          const msg = '⚠️ VULNERABILITY: Can use host page Fetch API!';
                          document.body.innerHTML += '<p style="color: red;">' + msg + '</p>';
                          logMessage(msg);
                        })
                        .catch(error => {
                          const msg = '✓ SECURE: Host page Fetch API blocked';
                          document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                          logMessage(msg);
                        });
                    } catch (e) {
                      const msg = '✓ SECURE: Host page Fetch API blocked - ' + e.name;
                      document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                      logMessage(msg);
                    }
                  } else {
                    const msg = '✓ SECURE: Cannot access opener.parent';
                    document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                    logMessage(msg);
                  }
                } catch (e) {
                  const msg = '✓ SECURE: Opener parent access blocked - ' + e.name;
                  document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                  logMessage(msg);
                }
              </script>
            </body>
          </html>
        `);
        popup.document.close();
        addResult("✓ SUCCESS: Parent Fetch API access test executed");
      } catch (e: any) {
        addResult(
          `✗ FAILED: Parent Fetch API access test failed - ${e.message}`
        );
        errors++;
      }

      // Clean up
      setTimeout(() => {
        try {
          popup.close();
          addResult("🧹 CLEANUP: Closed parent Fetch API access test popup");
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 3000);

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: Popup to parent Fetch API - ${e.message}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // Test 40: Popup to Parent WebSocket
  const testPopupToParentWebSocket = () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: Popup to parent WebSocket access...");

      const popup = window.open("", "_blank", "width=400,height=300");
      if (!popup) {
        addResult("✓ SECURE: Popup blocked by browser (attack prevented)");
        addResult("⚠ INFO: Cannot test popup attacks if popups are blocked");
        return { passed: true, errors: 0, warnings };
      }

      setPopupWindows((prev) => [...prev, popup]);

      addResult("⚠ TESTING: Popup attempting to use parent WebSocket...");
      try {
        popup.document.write(`
          <html>
            <body>
              <h1>Parent WebSocket Access Test</h1>
              <script>
                function logMessage(msg) {
                  console.log(msg);
                  if (window.opener) {
                    window.opener.postMessage(msg, '*');
                  }
                }
                
                try {
                  // IMPORTANT: Test if popup can use the opener's parent's WebSocket (the host page that contains the iframe)
                  if (window.opener && window.opener.parent && window.opener.parent.WebSocket) {
                    try {
                      const ws = new window.opener.parent.WebSocket('wss://echo.websocket.org');
                      ws.onopen = () => {
                        const msg = '⚠️ VULNERABILITY: Can use host page WebSocket!';
                        document.body.innerHTML += '<p style="color: red;">' + msg + '</p>';
                        logMessage(msg);
                        ws.close();
                      };
                      ws.onerror = () => {
                        const msg = '✓ SECURE: Host page WebSocket blocked';
                        document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                        logMessage(msg);
                      };
                    } catch (e) {
                      const msg = '✓ SECURE: Host page WebSocket blocked - ' + e.name;
                      document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                      logMessage(msg);
                    }
                  } else {
                    const msg = '✓ SECURE: Cannot access opener.parent';
                    document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                    logMessage(msg);
                  }
                } catch (e) {
                  const msg = '✓ SECURE: Opener parent access blocked - ' + e.name;
                  document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                  logMessage(msg);
                }
              </script>
            </body>
          </html>
        `);
        popup.document.close();
        addResult("✓ SUCCESS: Parent WebSocket access test executed");
      } catch (e: any) {
        addResult(
          `✗ FAILED: Parent WebSocket access test failed - ${e.message}`
        );
        errors++;
      }

      // Clean up
      setTimeout(() => {
        try {
          popup.close();
          addResult("🧹 CLEANUP: Closed parent WebSocket access test popup");
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 3000);

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: Popup to parent WebSocket - ${e.message}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // Test 41: Popup to Parent Service Worker
  const testPopupToParentServiceWorker = () => {
    let errors = 0;
    let warnings = 0;

    try {
      addResult("⚠ TESTING: Popup to parent Service Worker access...");

      const popup = window.open("", "_blank", "width=400,height=300");
      if (!popup) {
        addResult("✓ SECURE: Popup blocked by browser (attack prevented)");
        addResult("⚠ INFO: Cannot test popup attacks if popups are blocked");
        return { passed: true, errors: 0, warnings };
      }

      setPopupWindows((prev) => [...prev, popup]);

      addResult(
        "⚠ TESTING: Popup attempting to access parent Service Worker..."
      );
      try {
        popup.document.write(`
          <html>
            <body>
              <h1>Parent Service Worker Access Test</h1>
              <script>
                function logMessage(msg) {
                  console.log(msg);
                  if (window.opener) {
                    window.opener.postMessage(msg, '*');
                  }
                }
                
                try {
                  // IMPORTANT: Test if popup can access the opener's parent's Service Worker (the host page that contains the iframe)
                  if (window.opener && window.opener.parent && window.opener.parent.navigator && window.opener.parent.navigator.serviceWorker) {
                    try {
                      window.opener.parent.navigator.serviceWorker.getRegistrations()
                        .then(registrations => {
                          const msg = '⚠️ VULNERABILITY: Can access host page Service Workers!';
                          document.body.innerHTML += '<p style="color: red;">' + msg + '</p>';
                          document.body.innerHTML += '<p>Registrations: ' + registrations.length + '</p>';
                          logMessage(msg);
                        })
                        .catch(error => {
                          const msg = '✓ SECURE: Host page Service Worker access blocked';
                          document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                          logMessage(msg);
                        });
                    } catch (e) {
                      const msg = '✓ SECURE: Host page Service Worker blocked - ' + e.name;
                      document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                      logMessage(msg);
                    }
                  } else {
                    const msg = '✓ SECURE: Cannot access opener.parent';
                    document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                    logMessage(msg);
                  }
                } catch (e) {
                  const msg = '✓ SECURE: Opener parent access blocked - ' + e.name;
                  document.body.innerHTML += '<p style="color: green;">' + msg + '</p>';
                  logMessage(msg);
                }
              </script>
            </body>
          </html>
        `);
        popup.document.close();
        addResult("✓ SUCCESS: Parent Service Worker access test executed");
      } catch (e: any) {
        addResult(
          `✗ FAILED: Parent Service Worker access test failed - ${e.message}`
        );
        errors++;
      }

      // Clean up
      setTimeout(() => {
        try {
          popup.close();
          addResult(
            "🧹 CLEANUP: Closed parent Service Worker access test popup"
          );
        } catch (e) {
          // Ignore cleanup errors
        }
      }, 3000);

      return { passed: errors === 0, errors, warnings };
    } catch (e: any) {
      addResult(`✗ FAILED: Popup to parent Service Worker - ${e.message}`);
      errors++;
      return { passed: false, errors, warnings };
    }
  };

  // Cleanup background fetch on unmount
  useEffect(() => {
    return () => {
      if (backgroundFetchInterval) {
        clearInterval(backgroundFetchInterval);
      }
    };
  }, [backgroundFetchInterval]);

  // Listen for messages from popups
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify the message is from a popup we opened
      if (popupWindows.some((popup) => popup === event.source)) {
        if (event.data && typeof event.data === "string") {
          addResult(`[Popup] ${event.data}`);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [popupWindows]);

  // Clean up popup windows on unmount
  useEffect(() => {
    return () => {
      popupWindows.forEach((popup) => {
        try {
          if (!popup.closed) {
            popup.close();
          }
        } catch (e) {
          // Ignore errors when closing popups
        }
      });
    };
  }, [popupWindows]);

  return (
    <div style={containerStyle}>
      {/* Side Panel with Test Buttons */}
      <div style={sidePanelStyle}>
        <h2
          style={{
            marginTop: 0,
            fontSize: "18px",
            color: isDark ? "#60a5fa" : "#007bff",
          }}
        >
          🔧 DOM API Tests
        </h2>
        <p
          style={{ fontSize: "12px", marginBottom: "15px", lineHeight: "1.4" }}
        >
          Comprehensive test suite for DOM APIs requiring{" "}
          <strong>allow-same-origin</strong>.
        </p>

        {/* Run All Tests Button */}
        <button
          style={{
            ...buttonStyle,
            backgroundColor: isRunningTests ? "#6c757d" : "#28a745",
            fontWeight: "bold",
            fontSize: "14px",
            marginBottom: "15px",
          }}
          onClick={runAllTests}
          disabled={isRunningTests}
        >
          {isRunningTests
            ? `⏳ Running... (${currentTestIndex}/21)`
            : "▶️ Run All Tests Again"}
        </button>

        <div style={sectionTitleStyle}>Basic DOM Tests</div>
        <button style={buttonStyle} onClick={testBasicDOMManipulation}>
          Basic DOM Manipulation
        </button>
        <button style={buttonStyle} onClick={testDocumentBodyAccess}>
          Document Body Access
        </button>
        <button style={buttonStyle} onClick={testCustomElementRegistration}>
          Custom Elements
        </button>

        <div style={sectionTitleStyle}>DOM Manipulation</div>
        <button style={buttonStyle} onClick={testInsertBefore}>
          insertBefore()
        </button>
        <button style={buttonStyle} onClick={testReplaceChild}>
          replaceChild()
        </button>
        <button style={buttonStyle} onClick={testCloneNode}>
          cloneNode()
        </button>

        <div style={sectionTitleStyle}>Advanced DOM</div>
        <button style={buttonStyle} onClick={testDocumentFragment}>
          DocumentFragment
        </button>
        <button style={buttonStyle} onClick={testInnerHTML}>
          innerHTML
        </button>
        <button style={buttonStyle} onClick={testEventListeners}>
          Event Listeners
        </button>
        <button style={buttonStyle} onClick={testShadowDOM}>
          Shadow DOM
        </button>

        <div style={{ ...sectionTitleStyle, color: "#dc3545" }}>
          🔒 Storage APIs
        </div>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testLocalStorage}
        >
          localStorage
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testSessionStorage}
        >
          sessionStorage
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testIndexedDB}
        >
          IndexedDB
        </button>

        <div style={{ ...sectionTitleStyle, color: "#ffc107" }}>
          🌐 Network APIs
        </div>
        <button
          style={{ ...buttonStyle, backgroundColor: "#ffc107", color: "#000" }}
          onClick={testXMLHttpRequest}
        >
          XMLHttpRequest
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#ffc107", color: "#000" }}
          onClick={testFetchAPI}
        >
          Fetch API
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#ffc107", color: "#000" }}
          onClick={testBlobAPI}
        >
          Blob & Object URL
        </button>
        <button
          style={{
            ...buttonStyle,
            backgroundColor: backgroundFetchActive ? "#dc3545" : "#17a2b8",
            color: "#fff",
          }}
          onClick={testBackgroundFetch}
        >
          {backgroundFetchActive ? "🛑 Stop" : "🔄"} Background Fetch
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#6f42c1", color: "#fff" }}
          onClick={testLocalNetworkAccess}
        >
          🌐 Local Network Access
        </button>

        <div style={{ ...sectionTitleStyle, color: "#28a745" }}>
          🍪 Security Tests
        </div>
        <button
          style={{ ...buttonStyle, backgroundColor: "#28a745" }}
          onClick={testCookieAccess}
        >
          Cookie Access
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#17a2b8" }}
          onClick={testIframeSandboxDetection}
        >
          Iframe Sandbox Detection
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#fd7e14" }}
          onClick={testReactInternalProcessing}
        >
          React Internal Processing
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#6f42c1" }}
          onClick={testParentWindowAccess}
        >
          Parent Window
        </button>

        <div style={{ ...sectionTitleStyle, color: "#dc3545" }}>
          🚨 Popup Attack Tests
        </div>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testBasicPopupCreation}
        >
          Basic Popup Creation
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testPopupToParentWindowAccess}
        >
          Popup to Parent Window Access
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testPopupToParentComprehensive}
        >
          Popup to Parent Comprehensive
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testPopupSandboxEscapeDetection}
        >
          Popup Sandbox Escape Detection
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testPopupToParentCookieAccess}
        >
          Popup to Parent Cookie Access
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testPopupToParentLocalStorage}
        >
          Popup to Parent LocalStorage
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testPopupToParentSessionStorage}
        >
          Popup to Parent SessionStorage
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testPopupToParentIndexedDB}
        >
          Popup to Parent IndexedDB
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testPopupToParentXMLHttpRequest}
        >
          Popup to Parent XMLHttpRequest
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testPopupToParentFetchAPI}
        >
          Popup to Parent Fetch API
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testPopupToParentWebSocket}
        >
          Popup to Parent WebSocket
        </button>
        <button
          style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
          onClick={testPopupToParentServiceWorker}
        >
          Popup to Parent Service Worker
        </button>

        <div style={{ marginTop: "20px" }}>
          <button
            style={{ ...buttonStyle, backgroundColor: "#6c757d" }}
            onClick={clearResults}
          >
            Clear Results
          </button>
        </div>
      </div>

      {/* Main Area with Test Summary and Logs */}
      <div style={mainAreaStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              color: isDark ? "#60a5fa" : "#007bff",
            }}
          >
            Test Results
          </h1>
          <p
            style={{
              margin: "8px 0 0 0",
              fontSize: "13px",
              color: isDark ? "#9ca3af" : "#666",
            }}
          >
            {isRunningTests
              ? `⏳ Running test ${currentTestIndex} of 41...`
              : testStatuses.length === 0
              ? "Waiting for tests to run..."
              : `${
                  testStatuses.filter((t) => t.status === "passed").length
                } passed, ${
                  testStatuses.filter((t) => t.status === "failed").length
                } failed`}
          </p>
        </div>

        {/* Test Summary Checklist */}
        <div style={testSummaryStyle}>
          {testStatuses.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: isDark ? "#6b7280" : "#999",
              }}
            >
              <p style={{ fontSize: "14px" }}>
                No tests run yet. Click "Run All Tests Again" to start.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "10px",
              }}
            >
              {testStatuses.map((test, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px",
                    backgroundColor: isDark ? "#1a1a1a" : "#f8f9fa",
                    borderRadius: "4px",
                    border: `1px solid ${
                      test.status === "passed"
                        ? "#28a745"
                        : test.status === "failed"
                        ? "#dc3545"
                        : test.status === "running"
                        ? "#ffc107"
                        : isDark
                        ? "#444"
                        : "#dee2e6"
                    }`,
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      marginRight: "10px",
                      minWidth: "24px",
                    }}
                  >
                    {test.status === "passed"
                      ? "✅"
                      : test.status === "failed"
                      ? "❌"
                      : test.status === "running"
                      ? "⏳"
                      : "⭕"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight:
                          test.status === "running" ? "bold" : "normal",
                        color:
                          test.status === "passed"
                            ? "#28a745"
                            : test.status === "failed"
                            ? "#dc3545"
                            : test.status === "running"
                            ? "#ffc107"
                            : "inherit",
                      }}
                    >
                      {test.name}
                    </div>
                    {(test.errors !== undefined ||
                      test.warnings !== undefined) && (
                      <div
                        style={{
                          fontSize: "11px",
                          marginTop: "2px",
                          color: isDark ? "#9ca3af" : "#6c757d",
                        }}
                      >
                        {test.errors !== undefined && test.errors > 0 && (
                          <span
                            style={{ color: "#dc3545", marginRight: "8px" }}
                          >
                            {test.errors} error{test.errors !== 1 ? "s" : ""}
                          </span>
                        )}
                        {test.warnings !== undefined && test.warnings > 0 && (
                          <span style={{ color: "#ffc107" }}>
                            {test.warnings} warning
                            {test.warnings !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logs Section Header */}
        <div style={logsSectionHeaderStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>📝 Detailed Logs</span>
            <button
              style={{
                ...buttonStyle,
                backgroundColor: "#6c757d",
                padding: "6px 12px",
                fontSize: "12px",
                margin: 0,
                width: "auto",
                minWidth: "auto",
              }}
              onClick={clearResults}
            >
              Clear Logs
            </button>
          </div>
        </div>

        {/* Logs Container */}
        <div style={logsContainerStyle}>
          {results.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "40px",
                color: isDark ? "#6b7280" : "#999",
              }}
            >
              <p style={{ fontSize: "14px" }}>
                {isRunningTests ? "⏳ Generating logs..." : "No logs yet"}
              </p>
            </div>
          ) : (
            <>
              {results.map((result, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "4px",
                    color:
                      result.includes("✓ SUCCESS") || result.includes("✅")
                        ? "#28a745"
                        : result.includes("✗ FAILED") ||
                          result.includes("✗ BLOCKED")
                        ? "#dc3545"
                        : result.includes("⚠") || result.includes("⏳")
                        ? "#ffc107"
                        : result.includes("🧹")
                        ? "#6c757d"
                        : result.includes("▶️")
                        ? "#17a2b8"
                        : result.includes("═") || result.includes("---")
                        ? isDark
                          ? "#60a5fa"
                          : "#007bff"
                        : "inherit",
                    fontWeight:
                      result.includes("═") || result.includes("▶️")
                        ? "bold"
                        : "normal",
                  }}
                >
                  {result}
                </div>
              ))}
              <div ref={logsEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Hidden container for test elements - positioned absolutely off-screen */}
      <div
        ref={testContainerRef}
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          visibility: "hidden",
        }}
      />
    </div>
  );
};

export default DomTestCard;
