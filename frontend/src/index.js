import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import './styles/overflow-fix.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './store/store';

// Patch ResizeObserver to ignore non-Element errors
const OriginalResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends OriginalResizeObserver {
  constructor(callback) {
    super((entries) => {
      // Filter out non-Element entries
      const validEntries = entries.filter(entry => entry.target instanceof Element);
      if (validEntries.length > 0) {
        callback(validEntries);
      }
    });
  }
  observe(target) {
    if (target instanceof Element) {
      super.observe(target);
    }
  }
};

// Suppress Firebase and CORS errors from console that don't affect functionality
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const errorMsg = (args[0]?.toString() || '').toLowerCase();
  // Filter out harmless Firebase errors, ResizeObserver errors, and blob URL 404s
  const isHarmlessError = 
    errorMsg.includes('cross-origin') ||
    errorMsg.includes('window.closed') ||
    errorMsg.includes('accounts:lookup') ||
    errorMsg.includes('identitytoolkit') ||
    errorMsg.includes('cors') ||
    errorMsg.includes('resizeobserver') ||
    errorMsg.includes('parameter 1 is not of type') ||
    errorMsg.includes('blob:http') ||
    errorMsg.includes('err_file_not_found') ||
    (errorMsg.includes('failed to fetch') && args[0]?.includes?.('identitytoolkit'));
  
  if (!isHarmlessError) {
    originalError.apply(console, args);
  }
};

console.warn = (...args) => {
  const warnMsg = (args[0]?.toString() || '').toLowerCase();
  const isHarmlessWarn = 
    warnMsg.includes('cross-origin') ||
    warnMsg.includes('identitytoolkit') ||
    warnMsg.includes('accounts:lookup');
  
  if (!isHarmlessWarn) {
    originalWarn.apply(console, args);
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();