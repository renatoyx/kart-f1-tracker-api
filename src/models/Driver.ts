export interface Driver {
  id: number
  name: string
  nationality: string
  birthDate: string | null
  createdAt: string
}

export type CreateDriverInput = Omit<Driver, 'id' | 'createdAt'>
