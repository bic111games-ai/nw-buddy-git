"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuctions = getAuctions;
exports.getBuyOrders = getBuyOrders;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
// Sprawdź, czy aplikacja jest spakowana (produkcja) czy nie (dewelopment)
const isDev = !electron_1.app.isPackaged;
// Ustal ścieżkę bazową
const basePath = isDev ? process.cwd() : electron_1.app.getAppPath();
// Skonstruuj poprawną ścieżkę do bazy danych
const dbPath = isDev
    ? path_1.default.join(basePath, 'apps', 'electron', 'data', 'faktoria.sqlite')
    : path_1.default.join(process.resourcesPath, 'data', 'faktoria.sqlite');
// Sprawdzenie, czy baza istnieje, w celach diagnostycznych
if (!fs_1.default.existsSync(dbPath)) {
    console.error(`BŁĄD: Baza danych nie została znaleziona pod ścieżką: ${dbPath}`);
    throw new Error('Database not found!');
}
else {
    console.log(`INFO: Znaleziono bazę danych pod ścieżką: ${dbPath}`);
}
const db = new better_sqlite3_1.default(dbPath, { readonly: true });
function getAuctions({ limit = 50, offset = 0 } = {}) {
    if (!db) {
        throw new Error("Baza danych nie została zainicjalizowana.");
    }
    const stmt = db.prepare('SELECT * FROM aukcje LIMIT ? OFFSET ?');
    return stmt.all(limit, offset);
}
function getBuyOrders({ limit = 50, offset = 0 } = {}) {
    if (!db) {
        throw new Error("Baza danych nie została zainicjalizowana.");
    }
    const stmt = db.prepare('SELECT * FROM zlecenia_kupna LIMIT ? OFFSET ?');
    return stmt.all(limit, offset);
}
//# sourceMappingURL=database.js.map