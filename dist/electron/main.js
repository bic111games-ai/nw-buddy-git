"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const config_1 = require("./config");
const create_spa_1 = require("./modules/create-spa");
const prepare_web_contents_1 = require("./prepare-web-contents");
const window_state_1 = require("./window-state");
const database_1 = require("./database");
if (process.defaultApp) {
    if (process.argv.length >= 2) {
        electron_1.app.setAsDefaultProtocolClient('nw-buddy', process.execPath, [path.resolve(process.argv[1])]);
    }
}
else {
    electron_1.app.setAsDefaultProtocolClient('nw-buddy');
}
if (!electron_1.app.requestSingleInstanceLock()) {
    electron_1.app.quit();
}
else {
    try {
        electron_1.app.on('second-instance', (event, commandLine, workingDirectory) => {
            // Someone tried to run a second instance, we should focus our window.
            if (mainWindow) {
                if (mainWindow.isMinimized()) {
                    mainWindow.restore();
                }
                mainWindow.focus();
                const deepLink = commandLine.find((it) => it.startsWith('nw-buddy://'));
                if (deepLink) {
                    mainWindow.webContents.send('open-url', deepLink);
                }
            }
        });
        // Handle the protocol.
        electron_1.app.on('open-url', (event, url) => {
            event.preventDefault();
            mainWindow.webContents.send('open-url', url);
        });
        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        electron_1.app.on('ready', createWindow);
        // Quit when all windows are closed.
        electron_1.app.on('window-all-closed', () => {
            // On OS X it is common for applications and their menu bar
            // to stay active until the user quits explicitly with Cmd + Q
            if (process.platform !== 'darwin') {
                electron_1.app.quit();
            }
        });
        electron_1.app.on('activate', () => {
            // On OS X it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (mainWindow === null) {
                createWindow();
            }
        });
    }
    catch (e) {
        // Catch Error
        // throw e;
    }
}
const menu = new electron_1.Menu();
menu.append(new electron_1.MenuItem({
    label: 'Electron',
    submenu: [
        {
            role: 'toggleDevTools',
            accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
            click: () => {
                mainWindow.webContents.openDevTools();
            },
        },
    ],
}));
electron_1.Menu.setApplicationMenu(menu);
let mainWindow = null;
const args = process.argv.slice(1);
const serve = args.some((val) => val === '--serve');
const config = (0, config_1.loadConfig)();
const winState = (0, window_state_1.windowState)({
    load: () => config.window,
    save: (state) => {
        config.window = state;
        (0, config_1.writeConfig)(config);
    },
});
const loadUrl = (0, create_spa_1.createSpa)({
    directory: path.join(__dirname, '../web-standalone/browser'),
    file: 'index.html',
});
function createWindow() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        mainWindow = new electron_1.BrowserWindow({
            x: (_a = config === null || config === void 0 ? void 0 : config.window) === null || _a === void 0 ? void 0 : _a.x,
            y: (_b = config === null || config === void 0 ? void 0 : config.window) === null || _b === void 0 ? void 0 : _b.y,
            width: (_c = config === null || config === void 0 ? void 0 : config.window) === null || _c === void 0 ? void 0 : _c.width,
            height: (_d = config === null || config === void 0 ? void 0 : config.window) === null || _d === void 0 ? void 0 : _d.height,
            resizable: true,
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: true,
                allowRunningInsecureContent: serve ? true : false,
                contextIsolation: false,
                webviewTag: true,
            },
            frame: false,
        });
        electron_1.app.whenReady().then(() => {
            winState.manage(mainWindow);
        });
        (0, prepare_web_contents_1.prepareWebContents)(mainWindow.webContents, mainWindow);
        mainWindow.webContents.on('did-attach-webview', (e, contents) => {
            (0, prepare_web_contents_1.prepareWebContents)(contents, mainWindow);
        });
        if (serve) {
            require('electron-reload')(__dirname, {
                electron: require(path.join(__dirname, '/../../node_modules/electron')),
            });
            //mainWindow.webContents.openDevTools()
            mainWindow.loadURL('http://localhost:4200/electron');
        }
        else {
            loadUrl(mainWindow, {
                path: '/electron',
            });
        }
        // Emitted when the window is closed.
        mainWindow.on('closed', () => {
            // Dereference the window object, usually you would store window
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            mainWindow = null;
        });
        electron_1.ipcMain.handle('window-close', () => __awaiter(this, void 0, void 0, function* () {
            mainWindow.close();
        }));
        electron_1.ipcMain.handle('window-minimize', () => __awaiter(this, void 0, void 0, function* () {
            mainWindow.minimize();
        }));
        electron_1.ipcMain.handle('window-maximize', () => __awaiter(this, void 0, void 0, function* () {
            mainWindow.maximize();
        }));
        electron_1.ipcMain.handle('window-unmaximize', () => __awaiter(this, void 0, void 0, function* () {
            mainWindow.unmaximize();
        }));
        electron_1.ipcMain.handle('is-window-maximized', () => __awaiter(this, void 0, void 0, function* () {
            return mainWindow.isMaximized();
        }));
        mainWindow.on('maximize', () => {
            mainWindow.webContents.send('window-change');
        });
        mainWindow.on('unmaximize', () => {
            mainWindow.webContents.send('window-change');
        });
        // Handler IPC dla danych giełdy
        electron_1.ipcMain.handle('get-auctions', (event, args) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = (0, database_1.getAuctions)(args); // Przekazanie argumentów (limit, offset)
                return { success: true, data: data };
            }
            catch (error) {
                console.error(error);
                return { success: false, error: error.message };
            }
        }));
        electron_1.ipcMain.handle('get-buy-orders', (event, args) => __awaiter(this, void 0, void 0, function* () {
            try {
                const data = (0, database_1.getBuyOrders)(args);
                return { success: true, data: data };
            }
            catch (error) {
                console.error(error);
                return { success: false, error: error.message };
            }
        }));
        return mainWindow;
    });
}
//# sourceMappingURL=main.js.map