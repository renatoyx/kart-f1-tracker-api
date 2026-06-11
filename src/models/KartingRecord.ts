export interface KartingRecord {
  id: number
  driverId: number
  year: number
  championship: string
  category: string | null
  team: string | null
  chassis: string | null
  engine: string | null
  result: string | null
  createdAt: string
}

export type CreateKartingRecordInput = Omit<
  KartingRecord,
  'id' | 'createdAt'
>

export interface SharedChampionship {
  year: number
  championship: string
  category: string | null
  driver1: {
    driverId: number
    chassis: string | null
    engine: string | null
    result: string | null
  }
  driver2: {
    driverId: number
    chassis: string | null
    engine: string | null
    result: string | null
  }
}
