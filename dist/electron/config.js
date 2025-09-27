"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.writeConfig = writeConfig;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const filePath = path_1.default.join(electron_1.app.getPath('userData'), 'config.json');
function loadConfig() {
    try {
        return JSON.parse(fs_1.default.readFileSync(filePath).toString());
    }
    catch (e) {
        //
    }
    return {};
}
function writeConfig(config) {
    try {
        fs_1.default.writeFileSync(filePath, JSON.stringify(config, null, 2));
    }
    catch (e) {
        //
    }
}
//# sourceMappingURL=config.js.map