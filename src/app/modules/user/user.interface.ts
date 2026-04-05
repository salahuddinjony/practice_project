
export type User = {
  id: number
  password: string
  needsPasswordReset?: boolean
  role: 'admin' | 'user' | 'faculty'
  isDeleted?: boolean
  status?: 'in-progress' | 'active' | 'inactive' | 'pending'| 'blocked'
}

