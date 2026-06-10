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
