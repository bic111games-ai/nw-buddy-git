import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

// Sprawdź, czy aplikacja jest spakowana (produkcja) czy nie (dewelopment)
const isDev = !app.isPackaged;

// Ustal ścieżkę bazową
const basePath = isDev ? process.cwd() : app.getAppPath();

// Skonstruuj poprawną ścieżkę do bazy danych
const dbPath = isDev
  ? path.join(basePath, 'apps', 'electron', 'data', 'faktoria.sqlite')
  : path.join(process.resourcesPath, 'data', 'faktoria.sqlite');

// Sprawdzenie, czy baza istnieje, w celach diagnostycznych
if (!fs.existsSync(dbPath)) {
  console.error(`BŁĄD: Baza danych nie została znaleziona pod ścieżką: ${dbPath}`);
  throw new Error('Database not found!');
} else {
  console.log(`INFO: Znaleziono bazę danych pod ścieżką: ${dbPath}`);
}

const db = new Database(dbPath, { readonly: true });

export function getAuctions({ limit = 50, offset = 0 } = {}) {
  if (!db) {
    throw new Error("Baza danych nie została zainicjalizowana.");
  }
  const stmt = db.prepare('SELECT * FROM aukcje LIMIT ? OFFSET ?');
  return stmt.all(limit, offset);
}

export function getBuyOrders({ limit = 50, offset = 0 } = {}) {
  if (!db) {
    throw new Error("Baza danych nie została zainicjalizowana.");
  }
  const stmt = db.prepare('SELECT * FROM zlecenia_kupna LIMIT ? OFFSET ?');
  return stmt.all(limit, offset);
}