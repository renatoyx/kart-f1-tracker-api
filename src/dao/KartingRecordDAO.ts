import { database } from '../database/db.js'
import type {
  CreateKartingRecordInput,
  KartingRecord,
} from '../models/KartingRecord.js'

interface KartingRecordRow {
  id: number
  driver_id: number
  year: number
  championship: string
  category: string | null
  team: string | null
  chassis: string | null
  engine: string | null
  result: string | null
  created_at: string
}

function mapKartingRecord(row: KartingRecordRow): KartingRecord {
  return {
    id: row.id,
    driverId: row.driver_id,
    year: row.year,
    championship: row.championship,
    category: row.category,
    team: row.team,
    chassis: row.chassis,
    engine: row.engine,
    result: row.result,
    createdAt: row.created_at,
  }
}

export class KartingRecordDAO {
  async findAll(): Promise<KartingRecord[]> {
    const db = await database
    const rows = await db.all<KartingRecordRow[]>(
      'SELECT * FROM karting_records ORDER BY year DESC, id DESC',
    )

    return rows.map(mapKartingRecord)
  }

  async findById(id: number): Promise<KartingRecord | undefined> {
    const db = await database
    const row = await db.get<KartingRecordRow>(
      'SELECT * FROM karting_records WHERE id = ?',
      id,
    )

    return row ? mapKartingRecord(row) : undefined
  }

  async findByDriverId(driverId: number): Promise<KartingRecord[]> {
    const db = await database
    const rows = await db.all<KartingRecordRow[]>(
      `
        SELECT *
        FROM karting_records
        WHERE driver_id = ?
        ORDER BY year DESC, id DESC
      `,
      driverId,
    )

    return rows.map(mapKartingRecord)
  }

  async create(input: CreateKartingRecordInput): Promise<KartingRecord> {
    const db = await database
    const result = await db.run(
      `
        INSERT INTO karting_records (
          driver_id,
          year,
          championship,
          category,
          team,
          chassis,
          engine,
          result
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      input.driverId,
      input.year,
      input.championship,
      input.category,
      input.team,
      input.chassis,
      input.engine,
      input.result,
    )

    const kartingRecord = await this.findById(result.lastID!)

    if (!kartingRecord) {
      throw new Error('Karting record was not found after insertion')
    }

    return kartingRecord
  }
}
