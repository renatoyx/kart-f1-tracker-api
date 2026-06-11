import { database } from '../database/db.js'
import type {
  CreateKartingRecordInput,
  KartingRecord,
  SharedChampionship,
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

interface SharedChampionshipRow {
  year: number
  championship: string
  category: string | null
  driver1_id: number
  driver1_chassis: string | null
  driver1_engine: string | null
  driver1_result: string | null
  driver2_id: number
  driver2_chassis: string | null
  driver2_engine: string | null
  driver2_result: string | null
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

  async findSharedChampionships(
    driver1Id: number,
    driver2Id: number,
  ): Promise<SharedChampionship[]> {
    const db = await database
    const rows = await db.all<SharedChampionshipRow[]>(
      `
        SELECT
          driver1.year,
          driver1.championship,
          driver1.category,
          driver1.driver_id AS driver1_id,
          driver1.chassis AS driver1_chassis,
          driver1.engine AS driver1_engine,
          driver1.result AS driver1_result,
          driver2.driver_id AS driver2_id,
          driver2.chassis AS driver2_chassis,
          driver2.engine AS driver2_engine,
          driver2.result AS driver2_result
        FROM karting_records AS driver1
        INNER JOIN karting_records AS driver2
          ON driver1.year = driver2.year
          AND driver1.championship = driver2.championship
          AND driver1.category IS driver2.category
        WHERE driver1.driver_id = ?
          AND driver2.driver_id = ?
        ORDER BY driver1.year DESC, driver1.championship
      `,
      driver1Id,
      driver2Id,
    )

    return rows.map((row) => {
      return {
        year: row.year,
        championship: row.championship,
        category: row.category,
        driver1: {
          driverId: row.driver1_id,
          chassis: row.driver1_chassis,
          engine: row.driver1_engine,
          result: row.driver1_result,
        },
        driver2: {
          driverId: row.driver2_id,
          chassis: row.driver2_chassis,
          engine: row.driver2_engine,
          result: row.driver2_result,
        },
      }
    })
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
