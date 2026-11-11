import React, { createContext, useContext, useState } from 'react'
import type {
  Book,
  BookCopy,
  Member,
  Borrowing,
  BorrowingRequest,
  Reservation,
  AuditLog,
  UserRole,
  LibraryOverviewStats,
} from '@/types/library'

const INITIAL_BOOKS: Book[] = [
  {
    id: 'b-1',
    title: 'The Silent Valley',
    subtitle: 'A Chronicle of Exile and Memory',
    author: 'Leon Vasari',
    authorRomaji: 'SHIZUKANA TANI',
    authorKanji: '静かな谷',
    category: 'Literary Fiction',
    isbn: '978-0-14-312774-1',
    publicationYear: 1958,
    publisher: 'Kanto Heritage Press',
    edition: 'First Hardcover Edition',
    language: 'English / Japanese Translation',
    description:
      'A schoolteacher returns to the secluded mountain village that exiled her father thirty years prior, unraveling centuries of guarded family secrets and forgotten salt trade archives.',
    shelfLocation: 'Floor 2, Bay 4, Shelf A',
    coverColor: '#1B382B',
    isFeatured: true,
    totalCopies: 4,
    availableCopies: 2,
    copies: [
      {
        id: 'c-101',
        bookId: 'b-1',
        barcode: 'BC-1001-A',
        copyNumber: 1,
        shelfLocation: 'Floor 2, Bay 4, Shelf A-1',
        condition: 'excellent',
        status: 'available',
        acquisitionDate: '2023-01-15',
      },
      {
        id: 'c-102',
        bookId: 'b-1',
        barcode: 'BC-1001-B',
        copyNumber: 2,
        shelfLocation: 'Floor 2, Bay 4, Shelf A-1',
        condition: 'good',
        status: 'borrowed',
        acquisitionDate: '2023-01-15',
      },
      {
        id: 'c-103',
        bookId: 'b-1',
        barcode: 'BC-1001-C',
        copyNumber: 3,
        shelfLocation: 'Floor 2, Bay 4, Shelf A-1',
        condition: 'fair',
        status: 'available',
        acquisitionDate: '2023-06-20',
      },
      {
        id: 'c-104',
        bookId: 'b-1',
        barcode: 'BC-1001-D',
        copyNumber: 4,
        shelfLocation: 'Floor 2, Bay 4, Shelf A-1',
        condition: 'damaged',
        status: 'maintenance',
        acquisitionDate: '2024-02-10',
      },
    ],
  },
  {
    id: 'b-2',
    title: 'The Blue Hour',
    subtitle: 'Conversations Along the Harbor Wall',
    author: 'Elena Rostova',
    authorRomaji: 'AO NO TOKI',
    authorKanji: '青の刻',
    category: 'Historical Romance',
    isbn: '978-0-374-11487-9',
    publicationYear: 1962,
    publisher: 'Archipelago Books',
    edition: 'Collector Foil Edition',
    language: 'English',
    description:
      'Over one long autumn evening in an abandoned harbor town, a solitary widow and an unannounced stranger trade small half-truths until the twilight gives way to midnight.',
    shelfLocation: 'Floor 2, Bay 4, Shelf B',
    coverColor: '#1F3FB0',
    isFeatured: true,
    totalCopies: 3,
    availableCopies: 1,
    copies: [
      {
        id: 'c-201',
        bookId: 'b-2',
        barcode: 'BC-1002-A',
        copyNumber: 1,
        shelfLocation: 'Floor 2, Bay 4, Shelf B-1',
        condition: 'excellent',
        status: 'available',
        acquisitionDate: '2023-03-12',
      },
      {
        id: 'c-202',
        bookId: 'b-2',
        barcode: 'BC-1002-B',
        copyNumber: 2,
        shelfLocation: 'Floor 2, Bay 4, Shelf B-1',
        condition: 'good',
        status: 'borrowed',
        acquisitionDate: '2023-03-12',
      },
      {
        id: 'c-203',
        bookId: 'b-2',
        barcode: 'BC-1002-C',
        copyNumber: 3,
        shelfLocation: 'Floor 2, Bay 4, Shelf B-1',
        condition: 'good',
        status: 'borrowed',
        acquisitionDate: '2023-09-01',
      },
    ],
  },
  {
    id: 'b-3',
    title: 'River of Salt',
    subtitle: 'An Odyssean Descent',
    author: 'Kazuo Shiraishi',
    authorRomaji: 'SHIO NO KAWA',
    authorKanji: '塩の川',
    category: 'Philosophy & Essays',
    isbn: '978-0-553-21311-7',
    publicationYear: 1964,
    publisher: 'Meridian Publishing',
    edition: 'Revised Translation',
    language: 'English',
    description:
      'Two estranged brothers haul a heavy timber salt barge downriver toward an industrializing port city that no longer has need for anything they carry.',
    shelfLocation: 'Floor 1, Bay 2, Shelf D',
    coverColor: '#8B4513',
    isFeatured: true,
    totalCopies: 2,
    availableCopies: 0,
    copies: [
      {
        id: 'c-301',
        bookId: 'b-3',
        barcode: 'BC-1003-A',
        copyNumber: 1,
        shelfLocation: 'Floor 1, Bay 2, Shelf D-2',
        condition: 'good',
        status: 'borrowed',
        acquisitionDate: '2022-11-04',
      },
      {
        id: 'c-302',
        bookId: 'b-3',
        barcode: 'BC-1003-B',
        copyNumber: 2,
        shelfLocation: 'Floor 1, Bay 2, Shelf D-2',
        condition: 'fair',
        status: 'borrowed',
        acquisitionDate: '2022-11-04',
      },
    ],
  },
  {
    id: 'b-4',
    title: 'Noon in Ashes',
    subtitle: 'The White Desert Reckoning',
    author: 'Mateo Cardenas',
    authorRomaji: 'HAI NO SHOGO',
    authorKanji: '灰の正午',
    category: 'Western & Frontier',
    isbn: '978-0-679-73276-1',
    publicationYear: 1971,
    publisher: 'Sundown Classics',
    edition: 'Centennial Clothbound',
    language: 'English',
    description:
      'A solitary rider crosses an expansive chalk desert to settle an ancestral debt, only to realize too late the identity of the person who dispatched him.',
    shelfLocation: 'Floor 1, Bay 5, Shelf C',
    coverColor: '#9A3412',
    isFeatured: true,
    totalCopies: 3,
    availableCopies: 2,
    copies: [
      {
        id: 'c-401',
        bookId: 'b-4',
        barcode: 'BC-1004-A',
        copyNumber: 1,
        shelfLocation: 'Floor 1, Bay 5, Shelf C-1',
        condition: 'excellent',
        status: 'available',
        acquisitionDate: '2023-05-18',
      },
      {
        id: 'c-402',
        bookId: 'b-4',
        barcode: 'BC-1004-B',
        copyNumber: 2,
        shelfLocation: 'Floor 1, Bay 5, Shelf C-1',
        condition: 'excellent',
        status: 'available',
        acquisitionDate: '2023-05-18',
      },
      {
        id: 'c-403',
        bookId: 'b-4',
        barcode: 'BC-1004-C',
        copyNumber: 3,
        shelfLocation: 'Floor 1, Bay 5, Shelf C-1',
        condition: 'good',
        status: 'borrowed',
        acquisitionDate: '2023-05-18',
      },
    ],
  },
  {
    id: 'b-5',
    title: 'The Green Road',
    subtitle: 'Cartography of the Unseen',
    author: 'Julian Vance',
    authorRomaji: 'MIDORI NO MICHI',
    authorKanji: '緑の道',
    category: 'Mystery & Detective',
    isbn: '978-0-14-044913-6',
    publicationYear: 1969,
    publisher: 'Blackwood Press',
    edition: 'Second Printing',
    language: 'English',
    description:
      'A cartographer surveying a forgotten colonial road deep in the temperate rainforest repeatedly detects solitary fresh footprints that remain exactly one day ahead of his compass.',
    shelfLocation: 'Floor 2, Bay 1, Shelf C',
    coverColor: '#2D4A22',
    isFeatured: true,
    totalCopies: 2,
    availableCopies: 1,
    copies: [
      {
        id: 'c-501',
        bookId: 'b-5',
        barcode: 'BC-1005-A',
        copyNumber: 1,
        shelfLocation: 'Floor 2, Bay 1, Shelf C-1',
        condition: 'good',
        status: 'available',
        acquisitionDate: '2023-07-22',
      },
      {
        id: 'c-502',
        bookId: 'b-5',
        barcode: 'BC-1005-B',
        copyNumber: 2,
        shelfLocation: 'Floor 2, Bay 1, Shelf C-1',
        condition: 'fair',
        status: 'borrowed',
        acquisitionDate: '2023-07-22',
      },
    ],
  },
  {
    id: 'b-6',
    title: 'Light in the Storm',
    subtitle: 'Beacon Station Chronicles',
    author: 'Clara Holmgren',
    authorRomaji: 'ARASHI NO HI',
    authorKanji: '嵐の灯',
    category: 'Literary Fiction',
    isbn: '978-0-393-31283-6',
    publicationYear: 1978,
    publisher: 'Nordic Echoes',
    edition: 'Illustrated Cloth',
    language: 'English',
    description:
      'A veteran lighthouse keeper and his teenage son endure a torrential three-day gale alongside an uncommunicative shipwrecked sailor who steadfastly refuses to reveal his origin.',
    shelfLocation: 'Floor 3, Bay 2, Shelf E',
    coverColor: '#1E293B',
    isFeatured: true,
    totalCopies: 3,
    availableCopies: 3,
    copies: [
      {
        id: 'c-601',
        bookId: 'b-6',
        barcode: 'BC-1006-A',
        copyNumber: 1,
        shelfLocation: 'Floor 3, Bay 2, Shelf E-1',
        condition: 'excellent',
        status: 'available',
        acquisitionDate: '2024-01-10',
      },
      {
        id: 'c-602',
        bookId: 'b-6',
        barcode: 'BC-1006-B',
        copyNumber: 2,
        shelfLocation: 'Floor 3, Bay 2, Shelf E-1',
        condition: 'excellent',
        status: 'available',
        acquisitionDate: '2024-01-10',
      },
      {
        id: 'c-603',
        bookId: 'b-6',
        barcode: 'BC-1006-C',
        copyNumber: 3,
        shelfLocation: 'Floor 3, Bay 2, Shelf E-1',
        condition: 'good',
        status: 'available',
        acquisitionDate: '2024-01-10',
      },
    ],
  },
]

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm-1',
    memberCode: 'MEM-2026-001',
    fullName: 'Sophia Al-Mansoor',
    email: 'sophia.almansoor@university.edu',
    phone: '+1 (555) 234-8901',
    status: 'active',
    maxBorrowLimit: 5,
    activeLoansCount: 2,
    membershipExpiry: '2027-01-01',
    address: '42 Academic Way, Suite 3B',
    registeredAt: '2024-01-10',
  },
  {
    id: 'm-2',
    memberCode: 'MEM-2026-002',
    fullName: 'Alexander Wright',
    email: 'a.wright@research.org',
    phone: '+1 (555) 876-5432',
    status: 'active',
    maxBorrowLimit: 5,
    activeLoansCount: 1,
    membershipExpiry: '2026-12-31',
    address: '108 Beacon Boulevard',
    registeredAt: '2024-02-15',
  },
  {
    id: 'm-3',
    memberCode: 'MEM-2026-003',
    fullName: 'Mei-Ling Chen',
    email: 'ml.chen@institute.ac.jp',
    phone: '+1 (555) 432-1098',
    status: 'active',
    maxBorrowLimit: 5,
    activeLoansCount: 2,
    membershipExpiry: '2027-06-30',
    address: '15 Maple Court, Apt 2',
    registeredAt: '2024-03-01',
  },
  {
    id: 'm-4',
    memberCode: 'MEM-2026-004',
    fullName: 'David K. O’Connor',
    email: 'david.oconnor@civic.gov',
    phone: '+1 (555) 901-2345',
    status: 'suspended',
    maxBorrowLimit: 3,
    activeLoansCount: 1,
    membershipExpiry: '2026-08-15',
    address: '77 Old Harbor Lane',
    registeredAt: '2023-09-12',
  },
]

const INITIAL_BORROWINGS: Borrowing[] = [
  {
    id: 'bor-1',
    memberId: 'm-1',
    memberName: 'Sophia Al-Mansoor',
    memberCode: 'MEM-2026-001',
    bookId: 'b-1',
    bookTitle: 'The Silent Valley',
    copyId: 'c-102',
    barcode: 'BC-1001-B',
    borrowedAt: '2026-11-01',
    dueDate: '2026-11-15',
    status: 'active',
  },
  {
    id: 'bor-2',
    memberId: 'm-1',
    memberName: 'Sophia Al-Mansoor',
    memberCode: 'MEM-2026-001',
    bookId: 'b-2',
    bookTitle: 'The Blue Hour',
    copyId: 'c-202',
    barcode: 'BC-1002-B',
    borrowedAt: '2026-10-20',
    dueDate: '2026-11-03', // Overdue
    status: 'overdue',
    fineAmount: 4.5,
  },
  {
    id: 'bor-3',
    memberId: 'm-2',
    memberName: 'Alexander Wright',
    memberCode: 'MEM-2026-002',
    bookId: 'b-2',
    bookTitle: 'The Blue Hour',
    copyId: 'c-203',
    barcode: 'BC-1002-C',
    borrowedAt: '2026-11-04',
    dueDate: '2026-11-18',
    status: 'active',
  },
  {
    id: 'bor-4',
    memberId: 'm-3',
    memberName: 'Mei-Ling Chen',
    memberCode: 'MEM-2026-003',
    bookId: 'b-3',
    bookTitle: 'River of Salt',
    copyId: 'c-301',
    barcode: 'BC-1003-A',
    borrowedAt: '2026-11-05',
    dueDate: '2026-11-19',
    status: 'active',
  },
  {
    id: 'bor-5',
    memberId: 'm-3',
    memberName: 'Mei-Ling Chen',
    memberCode: 'MEM-2026-003',
    bookId: 'b-3',
    bookTitle: 'River of Salt',
    copyId: 'c-302',
    barcode: 'BC-1003-B',
    borrowedAt: '2026-11-02',
    dueDate: '2026-11-16',
    status: 'active',
  },
]

const INITIAL_REQUESTS: BorrowingRequest[] = [
  {
    id: 'req-1',
    memberId: 'm-2',
    memberName: 'Alexander Wright',
    memberCode: 'MEM-2026-002',
    bookId: 'b-5',
    bookTitle: 'The Green Road',
    requestType: 'borrow',
    status: 'pending',
    requestedAt: '2026-11-11 09:30',
  },
  {
    id: 'req-2',
    memberId: 'm-1',
    memberName: 'Sophia Al-Mansoor',
    memberCode: 'MEM-2026-001',
    bookId: 'b-1',
    bookTitle: 'The Silent Valley',
    requestType: 'renewal',
    status: 'pending',
    requestedAt: '2026-11-11 11:15',
  },
]

const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-1',
    memberId: 'm-1',
    memberName: 'Sophia Al-Mansoor',
    bookId: 'b-3',
    bookTitle: 'River of Salt',
    queuePosition: 1,
    status: 'waiting',
    createdAt: '2026-11-08',
  },
  {
    id: 'res-2',
    memberId: 'm-2',
    memberName: 'Alexander Wright',
    bookId: 'b-3',
    bookTitle: 'River of Salt',
    queuePosition: 2,
    status: 'waiting',
    createdAt: '2026-11-09',
  },
]

interface LibraryContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  currentMember: Member
  setCurrentMember: (m: Member) => void
  books: Book[]
  members: Member[]
  borrowings: Borrowing[]
  requests: BorrowingRequest[]
  reservations: Reservation[]
  auditLogs: AuditLog[]
  stats: LibraryOverviewStats

  // Actions
  addBook: (book: Omit<Book, 'id' | 'totalCopies' | 'availableCopies'>) => void
  editBook: (id: string, data: Partial<Book>) => void
  deleteBook: (id: string) => void

  addCopy: (bookId: string, copy: Omit<BookCopy, 'id' | 'bookId'>) => void
  updateCopyStatus: (copyId: string, status: BookCopy['status'], condition?: BookCopy['condition']) => void
  deleteCopy: (copyId: string) => void

  addMember: (member: Omit<Member, 'id' | 'activeLoansCount' | 'registeredAt'>) => void
  editMember: (id: string, data: Partial<Member>) => void
  toggleMemberStatus: (id: string) => void
  deleteMember: (id: string) => void

  issueBook: (memberId: string, copyId: string, loanDays?: number) => void
  returnBook: (borrowingId: string, condition: BookCopy['condition'], notes?: string) => void

  approveRequest: (requestId: string) => void
  rejectRequest: (requestId: string, reason: string) => void

  requestBorrowOnline: (bookId: string) => void
  placeReservation: (bookId: string) => void
  cancelReservation: (reservationId: string) => void

  becomeMember: (data: { fullName: string; email: string; phone: string; address?: string }) => Member
  loginAs: (newRole: UserRole, memberId?: string) => void
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined)

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('admin')
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS)
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS)
  const [currentMember, setCurrentMember] = useState<Member>(INITIAL_MEMBERS[0])
  const [borrowings, setBorrowings] = useState<Borrowing[]>(INITIAL_BORROWINGS)
  const [requests, setRequests] = useState<BorrowingRequest[]>(INITIAL_REQUESTS)
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'aud-1',
      actorId: 'usr-admin',
      actorName: 'System Architect',
      actorRole: 'admin',
      action: 'system_initialized',
      entityType: 'library',
      entityId: 'root',
      details: 'Digital library ecosystem and catalog initialized with 6 primary titles',
      timestamp: '2026-11-11 08:00',
    },
  ])

  // Recalculate book totals and stats whenever copies/borrowings update
  const stats: LibraryOverviewStats = {
    totalTitles: books.length,
    totalPhysicalCopies: books.reduce((acc, b) => acc + (b.copies?.length || 0), 0),
    availableCopies: books.reduce(
      (acc, b) => acc + (b.copies?.filter((c) => c.status === 'available').length || 0),
      0
    ),
    borrowedCopies: borrowings.filter((b) => b.status === 'active' || b.status === 'overdue').length,
    reservedCopies: reservations.filter((r) => r.status === 'waiting').length,
    damagedCopies: books.reduce(
      (acc, b) => acc + (b.copies?.filter((c) => c.condition === 'damaged' || c.status === 'maintenance').length || 0),
      0
    ),
    overdueLoans: borrowings.filter((b) => b.status === 'overdue').length,
    activeMembers: members.filter((m) => m.status === 'active').length,
    pendingRequests: requests.filter((r) => r.status === 'pending').length,
  }

  const logAudit = (action: string, entityType: string, entityId: string, details: string) => {
    const entry: AuditLog = {
      id: `aud-${Date.now()}`,
      actorId: role === 'admin' ? 'usr-admin' : role === 'librarian' ? 'usr-lib-1' : currentMember.id,
      actorName: role === 'admin' ? 'Head Librarian (Admin)' : role === 'librarian' ? 'Staff Desk' : currentMember.fullName,
      actorRole: role,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toLocaleString(),
    }
    setAuditLogs((prev) => [entry, ...prev])
  }

  // Book Title Actions
  const addBook = (bookData: Omit<Book, 'id' | 'totalCopies' | 'availableCopies'>) => {
    const newId = `b-${Date.now()}`
    const defaultCopy: BookCopy = {
      id: `c-${Date.now()}-1`,
      bookId: newId,
      barcode: `BC-${Math.floor(1000 + Math.random() * 9000)}-A`,
      copyNumber: 1,
      shelfLocation: bookData.shelfLocation,
      condition: 'excellent',
      status: 'available',
      acquisitionDate: new Date().toISOString().split('T')[0],
    }

    const newBook: Book = {
      ...bookData,
      id: newId,
      totalCopies: 1,
      availableCopies: 1,
      copies: [defaultCopy],
    }

    setBooks((prev) => [newBook, ...prev])
    logAudit('book_created', 'books', newId, `Added new title "${newBook.title}" with copy ${defaultCopy.barcode}`)
  }

  const editBook = (id: string, data: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...data } : b))
    )
    logAudit('book_updated', 'books', id, `Updated metadata for book ID ${id}`)
  }

  const deleteBook = (id: string) => {
    const target = books.find((b) => b.id === id)
    setBooks((prev) => prev.filter((b) => b.id !== id))
    logAudit('book_deleted', 'books', id, `Deleted book title "${target?.title || id}"`)
  }

  // Physical Copy Actions
  const addCopy = (bookId: string, copyData: Omit<BookCopy, 'id' | 'bookId'>) => {
    const copyId = `c-${Date.now()}`
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== bookId) return b
        const existingCopies = b.copies || []
        const newCopy: BookCopy = {
          ...copyData,
          id: copyId,
          bookId,
        }
        const updatedCopies = [...existingCopies, newCopy]
        const available = updatedCopies.filter((c) => c.status === 'available').length
        return {
          ...b,
          copies: updatedCopies,
          totalCopies: updatedCopies.length,
          availableCopies: available,
        }
      })
    )
    logAudit('copy_added', 'book_copies', copyId, `Added copy ${copyData.barcode} to book ${bookId}`)
  }

  const updateCopyStatus = (copyId: string, status: BookCopy['status'], condition?: BookCopy['condition']) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (!b.copies?.some((c) => c.id === copyId)) return b
        const updatedCopies = b.copies.map((c) => {
          if (c.id === copyId) {
            return {
              ...c,
              status,
              condition: condition || c.condition,
            }
          }
          return c
        })
        const available = updatedCopies.filter((c) => c.status === 'available').length
        return {
          ...b,
          copies: updatedCopies,
          availableCopies: available,
        }
      })
    )
    logAudit('copy_status_changed', 'book_copies', copyId, `Updated copy ${copyId} status to ${status}`)
  }

  const deleteCopy = (copyId: string) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (!b.copies?.some((c) => c.id === copyId)) return b
        const updatedCopies = b.copies.filter((c) => c.id !== copyId)
        const available = updatedCopies.filter((c) => c.status === 'available').length
        return {
          ...b,
          copies: updatedCopies,
          totalCopies: updatedCopies.length,
          availableCopies: available,
        }
      })
    )
    logAudit('copy_deleted', 'book_copies', copyId, `Deleted physical copy ${copyId}`)
  }

  // Member Actions
  const addMember = (memberData: Omit<Member, 'id' | 'activeLoansCount' | 'registeredAt'>) => {
    const newId = `m-${Date.now()}`
    const newMember: Member = {
      ...memberData,
      id: newId,
      activeLoansCount: 0,
      registeredAt: new Date().toISOString().split('T')[0],
    }
    setMembers((prev) => [newMember, ...prev])
    logAudit('member_registered', 'members', newId, `Registered member ${newMember.fullName} (${newMember.memberCode})`)
  }

  const editMember = (id: string, data: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)))
    logAudit('member_updated', 'members', id, `Updated profile for member ${id}`)
  }

  const toggleMemberStatus = (id: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const next = m.status === 'active' ? 'suspended' : 'active'
          logAudit('member_status_toggled', 'members', id, `Member status changed to ${next}`)
          return { ...m, status: next }
        }
        return m
      })
    )
  }

  const deleteMember = (id: string) => {
    const target = members.find((m) => m.id === id)
    setMembers((prev) => prev.filter((m) => m.id !== id))
    logAudit('member_deleted', 'members', id, `Removed member record ${target?.fullName || id}`)
  }

  // Issue & Return Operations
  const issueBook = (memberId: string, copyId: string, loanDays: number = 14) => {
    const member = members.find((m) => m.id === memberId)
    let foundBook: Book | undefined
    let foundCopy: BookCopy | undefined

    for (const b of books) {
      const c = b.copies?.find((copy) => copy.id === copyId)
      if (c) {
        foundBook = b
        foundCopy = c
        break
      }
    }

    if (!member || !foundBook || !foundCopy) return

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + loanDays)

    const newBorrowing: Borrowing = {
      id: `bor-${Date.now()}`,
      memberId: member.id,
      memberName: member.fullName,
      memberCode: member.memberCode,
      bookId: foundBook.id,
      bookTitle: foundBook.title,
      copyId: foundCopy.id,
      barcode: foundCopy.barcode,
      borrowedAt: new Date().toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'active',
    }

    setBorrowings((prev) => [newBorrowing, ...prev])
    updateCopyStatus(foundCopy.id, 'borrowed')
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, activeLoansCount: m.activeLoansCount + 1 } : m))
    )

    logAudit('copy_issued', 'borrowings', newBorrowing.id, `Issued "${foundBook.title}" (Copy: ${foundCopy.barcode}) to ${member.fullName}`)
  }

  const returnBook = (borrowingId: string, condition: BookCopy['condition'], notes?: string) => {
    const borrowing = borrowings.find((b) => b.id === borrowingId)
    if (!borrowing) return

    // Update borrowing status
    setBorrowings((prev) =>
      prev.map((b) =>
        b.id === borrowingId
          ? { ...b, status: 'returned', returnedAt: new Date().toISOString().split('T')[0] }
          : b
      )
    )

    // Check if there are reservations waiting for this book title
    const nextReservation = reservations.find(
      (r) => r.bookId === borrowing.bookId && r.status === 'waiting'
    )

    const nextCopyStatus = nextReservation ? 'reserved' : condition === 'damaged' ? 'maintenance' : 'available'

    updateCopyStatus(borrowing.copyId, nextCopyStatus, condition)

    if (nextReservation) {
      setReservations((prev) =>
        prev.map((r) =>
          r.id === nextReservation.id
            ? { ...r, status: 'allocated', allocatedCopyId: borrowing.copyId }
            : r
        )
      )
      logAudit(
        'reservation_allocated',
        'reservations',
        nextReservation.id,
        `Returned copy ${borrowing.barcode} automatically allocated to reservation for ${nextReservation.memberName}`
      )
    }

    setMembers((prev) =>
      prev.map((m) =>
        m.id === borrowing.memberId ? { ...m, activeLoansCount: Math.max(0, m.activeLoansCount - 1) } : m
      )
    )

    logAudit('book_returned', 'returns', borrowingId, `Returned copy ${borrowing.barcode}. Condition: ${condition}${notes ? ` (Notes: ${notes})` : ''}`)
  }

  // Approvals
  const approveRequest = (requestId: string) => {
    const req = requests.find((r) => r.id === requestId)
    if (!req) return

    // Find first available copy of requested book
    const book = books.find((b) => b.id === req.bookId)
    const availableCopy = book?.copies?.find((c) => c.status === 'available')

    if (availableCopy) {
      issueBook(req.memberId, availableCopy.id, 14)
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
      )
      logAudit('request_approved', 'borrowing_requests', requestId, `Approved borrowing request for ${req.memberName}`)
    } else {
      // If no copy available, place in reservation
      placeReservation(req.bookId)
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: 'approved' } : r))
      )
    }
  }

  const rejectRequest = (requestId: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected', rejectionReason: reason } : r))
    )
    logAudit('request_rejected', 'borrowing_requests', requestId, `Rejected request: ${reason}`)
  }

  // Online member actions
  const requestBorrowOnline = (bookId: string) => {
    const book = books.find((b) => b.id === bookId)
    if (!book) return

    const newReq: BorrowingRequest = {
      id: `req-${Date.now()}`,
      memberId: currentMember.id,
      memberName: currentMember.fullName,
      memberCode: currentMember.memberCode,
      bookId: book.id,
      bookTitle: book.title,
      requestType: 'borrow',
      status: 'pending',
      requestedAt: new Date().toLocaleString(),
    }

    setRequests((prev) => [newReq, ...prev])
    logAudit('member_borrow_requested', 'borrowing_requests', newReq.id, `${currentMember.fullName} requested to borrow "${book.title}"`)
  }

  const placeReservation = (bookId: string) => {
    const book = books.find((b) => b.id === bookId)
    if (!book) return

    const countForBook = reservations.filter((r) => r.bookId === bookId && r.status === 'waiting').length

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      memberId: currentMember.id,
      memberName: currentMember.fullName,
      bookId: book.id,
      bookTitle: book.title,
      queuePosition: countForBook + 1,
      status: 'waiting',
      createdAt: new Date().toISOString().split('T')[0],
    }

    setReservations((prev) => [...prev, newRes])
    logAudit('reservation_placed', 'reservations', newRes.id, `${currentMember.fullName} reserved "${book.title}" (Queue #${newRes.queuePosition})`)
  }

  const cancelReservation = (reservationId: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== reservationId))
    logAudit('reservation_cancelled', 'reservations', reservationId, `Cancelled reservation ${reservationId}`)
  }

  const becomeMember = (data: { fullName: string; email: string; phone: string; address?: string }): Member => {
    const newMember: Member = {
      id: `m-${Date.now()}`,
      memberCode: `MEM-${new Date().getFullYear()}-${String(members.length + 1).padStart(3, '0')}`,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      address: data.address || 'Standard Registered Patron',
      status: 'active',
      maxBorrowLimit: 5,
      activeLoansCount: 0,
      membershipExpiry: `${new Date().getFullYear() + 1}-12-31`,
      registeredAt: new Date().toISOString().split('T')[0],
    }
    setMembers((prev) => [newMember, ...prev])
    setCurrentMember(newMember)
    setRole('member')
    logAudit(
      'member_registered',
      'member',
      newMember.id,
      `New member registered: ${newMember.fullName} (${newMember.memberCode})`
    )
    return newMember
  }

  const loginAs = (newRole: UserRole, memberId?: string) => {
    setRole(newRole)
    if (memberId) {
      const found = members.find((m) => m.id === memberId)
      if (found) setCurrentMember(found)
    }
    logAudit(
      'session_authenticated',
      'auth',
      newRole === 'member' && memberId ? memberId : `usr-${newRole}`,
      `User session signed in with role: ${newRole}`
    )
  }

  return (
    <LibraryContext.Provider
      value={{
        role,
        setRole,
        currentMember,
        setCurrentMember,
        books,
        members,
        borrowings,
        requests,
        reservations,
        auditLogs,
        stats,
        addBook,
        editBook,
        deleteBook,
        addCopy,
        updateCopyStatus,
        deleteCopy,
        addMember,
        editMember,
        toggleMemberStatus,
        deleteMember,
        issueBook,
        returnBook,
        approveRequest,
        rejectRequest,
        requestBorrowOnline,
        placeReservation,
        cancelReservation,
        becomeMember,
        loginAs,
      }}
    >
      {children}
    </LibraryContext.Provider>
  )
}

export const useLibrary = () => {
  const context = useContext(LibraryContext)
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider')
  }
  return context
}
