// This file includes polyfills needed by Angular and is loaded before
// the app. You can add your own extra polyfills to this file.

// Polyfills for Node.js globals
(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
  version: ''
};

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/**
 * Zone.js is required by default for Angular itself.
 */
import 'zone.js';  // Included with Angular CLI.


/***************************************************************************************************
 * APPLICATION IMPORTS
 */
