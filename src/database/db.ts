import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
const databasePath = path.resolve(currentDirectory, '../../data/kart-f1-tracker.db')

mkdirSync(path.dirname(databasePath), { recursive: true })

export const database = open({
  filename: databasePath,
  driver: sqlite3.Database,
})

export async function initDb(): Promise<void> {
  const db = await database

  await db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      nationality TEXT NOT NULL,
      birth_date TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS karting_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      driver_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      championship TEXT NOT NULL,
      category TEXT,
      team TEXT,
      chassis TEXT,
      engine TEXT,
      result TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES drivers (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_karting_records_driver_id
      ON karting_records (driver_id);

    CREATE INDEX IF NOT EXISTS idx_karting_records_year
      ON karting_records (year);
  `)
}
