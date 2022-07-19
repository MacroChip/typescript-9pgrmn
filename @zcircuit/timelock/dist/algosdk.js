"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.algosdk = void 0;
// Should only trigger the require when used in nodejs context
//    - otherwise expects algosdk to be available on the window in a browser context
exports.algosdk = globalThis.algosdk || require('algosdk');
//# sourceMappingURL=algosdk.js.map