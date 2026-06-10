import { database } from '../database/db.js'
import type { CreateDriverInput, Driver } from '../models/Driver.js'

interface DriverRow {
  id: number
  name: string
  nationality: string
  birth_date: string | null
  created_at: string
}

function mapDriver(row: DriverRow): Driver {
  return {
    id: row.id,
    name: row.name,
    nationality: row.nationality,
    birthDate: row.birth_date,
    createdAt: row.created_at,
  }
}

export class DriverDAO {
  async findAll(): Promise<Driver[]> {
    const db = await database
    const rows = await db.all<DriverRow[]>('SELECT * FROM drivers ORDER BY name')

    return rows.map(mapDriver)
  }

  async findById(id: number): Promise<Driver | undefined> {
    const db = await database
    const row = await db.get<DriverRow>(
      'SELECT * FROM drivers WHERE id = ?',
      id,
    )

    return row ? mapDriver(row) : undefined
  }

  async create(input: CreateDriverInput): Promise<Driver> {
    const db = await database
    const result = await db.run(
      `
        INSERT INTO drivers (name, nationality, birth_date)
        VALUES (?, ?, ?)
      `,
      input.name,
      input.nationality,
      input.birthDate,
    )

    const driver = await this.findById(result.lastID!)

    if (!driver) {
      throw new Error('Driver was not found after insertion')
    }

    return driver
  }
}
