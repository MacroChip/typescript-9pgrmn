"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uint8ToB64 = exports.uint8ToText = exports.textToUint8 = exports.b64ToUint8 = exports.btoa = exports.atob = void 0;
exports.atob = globalThis.atob || ((src) => {
    return Buffer.from(src, 'base64').toString('binary');
});
exports.btoa = globalThis.btoa || ((src) => {
    return Buffer.from(src, 'binary').toString('base64');
});
function b64ToUint8(b64) {
    return Uint8Array.from((0, exports.atob)(b64), c => c.charCodeAt(0));
}
exports.b64ToUint8 = b64ToUint8;
function textToUint8(text) {
    return Uint8Array.from(text, c => c.charCodeAt(0));
}
exports.textToUint8 = textToUint8;
function uint8ToText(bytes) {
    return Array.from(bytes).map(b => String.fromCharCode(b)).join('');
}
exports.uint8ToText = uint8ToText;
function uint8ToB64(bytes) {
    return (0, exports.btoa)(uint8ToText(bytes));
}
exports.uint8ToB64 = uint8ToB64;
//# sourceMappingURL=utils.js.map