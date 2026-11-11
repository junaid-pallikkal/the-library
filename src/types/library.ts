export type UserRole = 'admin' | 'librarian' | 'member'

export type MemberStatus = 'active' | 'suspended' | 'expired' | 'pending'

export type CopyCondition = 'excellent' | 'good' | 'fair' | 'damaged'

export type CopyStatus =
  | 'available'
  | 'borrowed'
  | 'reserved'
  | 'maintenance'
  | 'lost'
  | 'retired'

export type BorrowingStatus = 'active' | 'returned' | 'overdue' | 'lost'

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export type ReservationStatus =
  | 'waiting'
  | 'allocated'
  | 'fulfilled'
  | 'cancelled'
  | 'expired'

export interface Author {
  id: string
  name: string
  bio?: string
  bornYear?: number
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
}

export interface BookCopy {
  id: string
  bookId: string
  barcode: string
  copyNumber: number
  shelfLocation: string
  condition: CopyCondition
  status: CopyStatus
  acquisitionDate: string
  notes?: string
}

export interface Book {
  id: string
  title: string
  subtitle?: string
  author: string
  authorRomaji?: string
  authorKanji?: string
  category: string
  isbn: string
  publicationYear: number
  publisher: string
  edition?: string
  language: string
  description: string
  shelfLocation: string
  coverColor: string
  spinePattern?: string
  isFeatured?: boolean
  totalCopies: number
  availableCopies: number
  copies?: BookCopy[]
}

export interface Member {
  id: string
  memberCode: string
  fullName: string
  email: string
  phone: string
  status: MemberStatus
  maxBorrowLimit: number
  activeLoansCount: number
  membershipExpiry: string
  address?: string
  registeredAt: string
}

export interface Borrowing {
  id: string
  memberId: string
  memberName: string
  memberCode: string
  bookId: string
  bookTitle: string
  copyId: string
  barcode: string
  borrowedAt: string
  dueDate: string
  returnedAt?: string
  status: BorrowingStatus
  fineAmount?: number
}

export interface BorrowingRequest {
  id: string
  memberId: string
  memberName: string
  memberCode: string
  bookId: string
  bookTitle: string
  requestType: 'borrow' | 'renewal'
  status: RequestStatus
  requestedAt: string
  reviewedBy?: string
  rejectionReason?: string
}

export interface Reservation {
  id: string
  memberId: string
  memberName: string
  bookId: string
  bookTitle: string
  queuePosition: number
  status: ReservationStatus
  allocatedCopyId?: string
  holdExpiresAt?: string
  createdAt: string
}

export interface AuditLog {
  id: string
  actorId: string
  actorName: string
  actorRole: UserRole
  action: string
  entityType: string
  entityId: string
  details: string
  timestamp: string
}

export interface LibraryOverviewStats {
  totalTitles: number
  totalPhysicalCopies: number
  availableCopies: number
  borrowedCopies: number
  reservedCopies: number
  damagedCopies: number
  overdueLoans: number
  activeMembers: number
  pendingRequests: number
}
