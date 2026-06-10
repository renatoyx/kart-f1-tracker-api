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
