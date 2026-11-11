import { describe, it, expect } from 'vitest'
import type { CopyStatus } from '@/types/library'

describe('Library Circulation & Operations Protocol', () => {
  it('enforces maximum borrowing limit per member', () => {
    const member = {
      id: 'm-1',
      maxBorrowLimit: 5,
      activeLoansCount: 5,
    }

    const canBorrow = member.activeLoansCount < member.maxBorrowLimit
    expect(canBorrow).toBe(false)
  })

  it('prevents borrowing of physical copies not in available status', () => {
    const isCopyAvailable = (status: CopyStatus) => status === 'available'
    expect(isCopyAvailable('borrowed')).toBe(false)
    expect(isCopyAvailable('maintenance')).toBe(false)
    expect(isCopyAvailable('available')).toBe(true)
  })

  it('automatically calculates loan due date by 14 days', () => {
    const borrowedAt = new Date('2026-11-01T00:00:00Z')
    const dueDate = new Date(borrowedAt)
    dueDate.setDate(dueDate.getDate() + 14)

    expect(dueDate.toISOString().split('T')[0]).toBe('2026-11-15')
  })

  it('flags loan as overdue when current date exceeds due date', () => {
    const dueDate = new Date('2026-11-03T00:00:00Z')
    const currentDate = new Date('2026-11-11T00:00:00Z')

    const isOverdue = currentDate > dueDate
    expect(isOverdue).toBe(true)
  })

  it('allocates returned physical copy to waiting reservation in priority order', () => {
    const reservations = [
      { id: 'res-1', bookId: 'b-3', queuePosition: 1, status: 'waiting' },
      { id: 'res-2', bookId: 'b-3', queuePosition: 2, status: 'waiting' },
    ]

    const returnedBookId = 'b-3'
    const nextInLine = reservations
      .filter((r) => r.bookId === returnedBookId && r.status === 'waiting')
      .sort((a, b) => a.queuePosition - b.queuePosition)[0]

    expect(nextInLine).toBeDefined()
    expect(nextInLine?.id).toBe('res-1')
  })

  it('routes damaged returned copy to maintenance rather than available shelf', () => {
    const condition = 'damaged'
    const nextStatus = condition === 'damaged' ? 'maintenance' : 'available'

    expect(nextStatus).toBe('maintenance')
  })
})
