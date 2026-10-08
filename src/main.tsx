import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safeguard against browser extensions attempting to overwrite window.fetch
try {
  let activeFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    get() {
      return activeFetch;
    },
    set(val) {
      activeFetch = val;
    },
    configurable: true,
    enumerable: true,
  });
} catch (_) {
  // Ignore descriptor failure
}

// Suppress extension-injected errors
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (
      event.filename?.startsWith('chrome-extension://') ||
      event.message?.includes('Cannot set property fetch')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason?.message?.includes('Cannot set property fetch') ||
      event.reason?.stack?.includes('chrome-extension://')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
