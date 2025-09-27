"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpa = createSpa;
const electron_1 = require("electron");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function createSpa(options) {
    options = Object.assign({ isCorsEnabled: true, scheme: 'app', hostname: '-', file: 'index.html' }, options);
    if (!options.directory) {
        throw new Error('The `directory` option is required');
    }
    const publicDir = node_path_1.default.resolve(electron_1.app.getAppPath(), options.directory);
    const indexHtml = node_path_1.default.join(publicDir, options.file);
    function handler(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const pathname = node_path_1.default
                .normalize(new URL(request.url).pathname)
                .replace(/\\/gi, '/')
                .replace(/(\.\.\/)+/gi, '');
            const filePath = node_path_1.default.join(publicDir, pathname);
            const stat = node_fs_1.default.existsSync(filePath) ? node_fs_1.default.statSync(filePath) : null;
            if (stat === null || stat === void 0 ? void 0 : stat.isFile()) {
                return electron_1.net.fetch(`file://${filePath}`);
            }
            if (node_fs_1.default.existsSync(filePath + options.file)) {
                return electron_1.net.fetch(`file://${filePath + options.file}`);
            }
            return electron_1.net.fetch(`file://${indexHtml}`);
        });
    }
    electron_1.protocol.registerSchemesAsPrivileged([
        {
            scheme: options.scheme,
            privileges: {
                standard: true,
                secure: true,
                allowServiceWorkers: true,
                supportFetchAPI: true,
                corsEnabled: options.isCorsEnabled,
            },
        },
    ]);
    electron_1.app.on('ready', () => {
        const currentSession = options.partition ? electron_1.session.fromPartition(options.partition) : electron_1.session.defaultSession;
        currentSession.protocol.handle(options.scheme, handler);
    });
    return (window, opts) => __awaiter(this, void 0, void 0, function* () {
        let url = `${options.scheme}://${options.hostname}`;
        if (opts.path) {
            url += opts.path;
        }
        if (opts.query) {
            url += '?' + new URLSearchParams(opts.query).toString();
        }
        yield window.loadURL(url);
    });
}
//# sourceMappingURL=create-spa.js.map