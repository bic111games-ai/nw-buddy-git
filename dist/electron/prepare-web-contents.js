"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareWebContents = prepareWebContents;
const electron_1 = require("electron");
function prepareWebContents(contents, window) {
    contents.session.webRequest.onBeforeSendHeaders((details, callback) => {
        callback({ requestHeaders: Object.assign({ Origin: '*' }, details.requestHeaders) });
    });
    contents.session.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: Object.assign(Object.assign({}, details.responseHeaders), { 'access-control-allow-origin': ['*'] }),
        });
    });
    contents.setWindowOpenHandler(({ url }) => {
        if (isExternalUrl(url)) {
            electron_1.shell.openExternal(url);
        }
        else {
            window.webContents.send('open-tab', url);
        }
        return {
            action: 'deny',
        };
    });
}
function isExternalUrl(url) {
    return false;
}
//# sourceMappingURL=prepare-web-contents.js.map