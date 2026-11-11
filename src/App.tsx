import { useState, useEffect } from 'react'
import { LibraryProvider, useLibrary } from '@/lib/libraryState'
import type { Book, BookCopy, Member } from '@/types/library'
import { GrainOverlay } from '@/components/common/GrainOverlay'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Header } from '@/components/layout/Header'
import { Tactile3DShelf } from '@/components/hero/Tactile3DShelf'
import { CatalogView } from '@/components/views/CatalogView'
import { MemberPortalView } from '@/components/views/MemberPortalView'
import { LmsDashboardView } from '@/components/views/LmsDashboardView'
import { AnalyticsView } from '@/components/views/AnalyticsView'
import { BookDetailModal } from '@/components/modals/BookDetailModal'
import { BookFormModal } from '@/components/modals/BookFormModal'
import { CopyFormModal } from '@/components/modals/CopyFormModal'
import { MemberFormModal } from '@/components/modals/MemberFormModal'
import { IssueBookModal } from '@/components/modals/IssueBookModal'
import { ReturnBookModal } from '@/components/modals/ReturnBookModal'
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal'
import { AuthModal } from '@/components/modals/AuthModal'
import { FlatCard } from '@/components/common/FlatCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Search,
  ArrowRight,
  MapPin,
} from 'lucide-react'

function LibraryAppContent() {
  const {
    role,
    books,
    addBook,
    editBook,
    deleteBook,
    addCopy,
    deleteCopy,
    addMember,
    editMember,
    deleteMember,
    requestBorrowOnline,
    placeReservation,
  } = useLibrary()

  // Navigation state
  const [currentView, setCurrentView] = useState<
    'shelf' | 'catalog' | 'portal' | 'dashboard' | 'analytics'
  >('shelf')

  // Sidebar responsive & open/close states
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  // Auth & Identity Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Home Shelf embedded catalog search & filters
  const [homeSearchQuery, setHomeSearchQuery] = useState('')
  const [homeCategory, setHomeCategory] = useState('all')

  const homeCategories = ['all', ...Array.from(new Set(books.map((b) => b.category)))]

  const homeFilteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(homeSearchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(homeSearchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(homeSearchQuery.toLowerCase()) ||
      b.isbn.toLowerCase().includes(homeSearchQuery.toLowerCase())
    const matchesCat = homeCategory === 'all' || b.category === homeCategory
    return matchesSearch && matchesCat
  })

  // Enforce Member Access Redirection (Members cannot view LMS Internal Dashboard or Analytics)
  useEffect(() => {
    if (role === 'member' && (currentView === 'dashboard' || currentView === 'analytics')) {
      setCurrentView('shelf')
    }
  }, [role, currentView])

  // Selected book for 3D inspection / details modal
  const [inspectedBook, setInspectedBook] = useState<Book | null>(null)

  // Book Form Modal (Create / Edit)
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)

  // Copy Form Modal
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)
  const [copyTargetBook, setCopyTargetBook] = useState<{ id: string; title: string } | null>(null)

  // Member Form Modal (Create / Edit)
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  // Circulation modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [returnBorrowingId, setReturnBorrowingId] = useState<string | undefined>()

  // Delete Confirmation Modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'book' | 'copy' | 'member'
    id: string
    name: string
  } | null>(null)

  // Handlers
  const handleOpenNewBook = () => {
    setEditingBook(null)
    setIsBookModalOpen(true)
  }

  const handleEditBook = (book: Book) => {
    setEditingBook(book)
    setIsBookModalOpen(true)
  }

  const handleSaveBook = (data: Omit<Book, 'id' | 'totalCopies' | 'availableCopies'>) => {
    if (editingBook) {
      editBook(editingBook.id, data)
    } else {
      addBook(data)
    }
  }

  const handleOpenNewCopy = (bookId: string, bookTitle: string) => {
    setCopyTargetBook({ id: bookId, title: bookTitle })
    setIsCopyModalOpen(true)
  }

  const handleSaveCopy = (data: Omit<BookCopy, 'id' | 'bookId'>) => {
    if (copyTargetBook) {
      addCopy(copyTargetBook.id, data)
    }
  }

  const handleOpenNewMember = () => {
    setEditingMember(null)
    setIsMemberModalOpen(true)
  }

  const handleEditMember = (member: Member) => {
    setEditingMember(member)
    setIsMemberModalOpen(true)
  }

  const handleSaveMember = (data: Omit<Member, 'id' | 'activeLoansCount' | 'registeredAt'>) => {
    if (editingMember) {
      editMember(editingMember.id, data)
    } else {
      addMember(data)
    }
  }

  const handleOpenReturn = (borrowingId?: string) => {
    setReturnBorrowingId(borrowingId)
    setIsReturnModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'book') {
      deleteBook(deleteTarget.id)
    } else if (deleteTarget.type === 'copy') {
      deleteCopy(deleteTarget.id)
    } else if (deleteTarget.type === 'member') {
      deleteMember(deleteTarget.id)
    }
    setDeleteTarget(null)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans">
      {/* Ambient Paper Grain Overlay */}
      <GrainOverlay />

      {/* Main Persistent Editorial Sidebar */}
      <AppSidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenNewBook={handleOpenNewBook}
        onOpenIssue={() => setIsIssueModalOpen(true)}
        isOpen={isDesktopSidebarOpen}
        onToggle={() => setIsDesktopSidebarOpen((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Application Area (Slides smoothly when desktop sidebar opens/closes) */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isDesktopSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'
        }`}
      >
        <Header
          currentView={currentView}
          onNavigate={setCurrentView}
          onOpenNewBook={handleOpenNewBook}
          onOpenIssue={() => setIsIssueModalOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          isSidebarOpen={isDesktopSidebarOpen}
          onToggleSidebar={() => setIsDesktopSidebarOpen((prev) => !prev)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Content Container */}
        <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* VIEW 1: TACTILE 3D SHELF HERO & FEATURED ARCHIVE */}
          {currentView === 'shelf' && (
            <div className="space-y-10">
              {/* Editorial Hero Banner */}
              <div className="text-center max-w-2xl mx-auto space-y-2 pt-2">
                <span className="text-[11px] font-mono tracking-widest uppercase font-bold text-forest dark:text-emerald-400 bg-forest/10 dark:bg-forest/20 px-3 py-1 rounded-full">
                  Tactile Archive • Interactive Shelf
                </span>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground font-serif leading-tight">
                  Curated Physical Volumes & Rare Editions
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  Interact with our physical archives. Click any spine, drag, or use keyboard arrows to pull
                  volumes out of the shelf in 3D space with dynamic perspective tilt.
                </p>
              </div>

              {/* Perfected 3D Tactile Shelf Component with Integrated Inspector Side Panel */}
              <Tactile3DShelf
                books={books}
                onSelectBook={() => {}}
                onInspectBook={(b) => setInspectedBook(b)}
                onRequestBorrow={(id) => requestBorrowOnline(id)}
                onReserve={(id) => placeReservation(id)}
              />

              {/* UNDER ANIMATED SHELF: EMBEDDED CATALOG WITH DIRECT OPTION TO FULL CATALOG PAGE */}
              <div className="space-y-6 pt-6 border-t border-border/60">
                {/* Section Header with Direct Full Catalog Page Option */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-forest dark:text-emerald-400">
                        Bibliographic Archive
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {books.length} Volumes in System
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground font-serif mt-1">
                      Accession Catalog & Holdings Explorer
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Search physical volumes, review copy holdings, or jump to the full bibliographic catalog.
                    </p>
                  </div>

                  <Button
                    onClick={() => setCurrentView('catalog')}
                    className="bg-forest hover:bg-forest/90 text-white text-xs gap-2 shrink-0 cursor-pointer shadow-xs self-start sm:self-auto"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Go to Full Catalog Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Search & Category Filter Chips */}
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search collection by title, author, category, or ISBN..."
                      value={homeSearchQuery}
                      onChange={(e) => setHomeSearchQuery(e.target.value)}
                      className="pl-9 text-xs h-9 bg-card border-border/80"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                    {homeCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setHomeCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                          homeCategory === cat
                            ? 'bg-forest text-white border-forest shadow-xs'
                            : 'bg-card text-muted-foreground border-border/70 hover:bg-secondary/50'
                        }`}
                      >
                        {cat === 'all' ? 'All Genres' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flat Cards Grid (Strictly Flat - No nested cards as per Rule 2.3) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {homeFilteredBooks.map((book) => (
                    <FlatCard
                      key={book.id}
                      clickable
                      onClick={() => setInspectedBook(book)}
                      className="flex flex-col justify-between h-full group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-muted-foreground">
                            {book.category}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {book.publicationYear}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-base text-foreground group-hover:text-forest dark:group-hover:text-emerald-400 transition-colors leading-snug font-serif">
                            {book.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {book.author}
                          </p>
                        </div>

                        <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
                          {book.description}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground text-[11px] truncate max-w-[130px]">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          {book.shelfLocation}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={
                              book.availableCopies > 0
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 text-[10px]'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 text-[10px]'
                            }
                          >
                            {book.availableCopies > 0
                              ? `${book.availableCopies} Available`
                              : 'Waitlist'}
                          </Badge>

                          {book.availableCopies > 0 ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                requestBorrowOnline(book.id)
                              }}
                              className="h-7 text-[11px] text-forest dark:text-emerald-400 hover:bg-forest/10 px-2 cursor-pointer"
                            >
                              Request
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                placeReservation(book.id)
                              }}
                              className="h-7 text-[11px] text-amber-700 dark:text-amber-400 hover:bg-amber-50 px-2 cursor-pointer"
                            >
                              Reserve
                            </Button>
                          )}
                        </div>
                      </div>
                    </FlatCard>
                  ))}
                </div>

                {/* Bottom Navigation Banner */}
                <div className="p-6 rounded-2xl bg-secondary/40 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-foreground font-serif">
                      Looking for more titles or specific catalog filters?
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Access comprehensive faceted search, barcode lookup, copy condition logs, and author archives.
                    </div>
                  </div>

                  <Button
                    onClick={() => setCurrentView('catalog')}
                    className="bg-forest hover:bg-forest/90 text-white text-xs gap-2 shrink-0 cursor-pointer shadow-xs"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open Full Catalog Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: CATALOG EXPLORATION */}
          {currentView === 'catalog' && (
            <CatalogView
              books={books}
              onInspectBook={(b) => setInspectedBook(b)}
              onOpenNewBook={handleOpenNewBook}
              role={role}
            />
          )}

          {/* VIEW 3: MEMBER PORTAL */}
          {currentView === 'portal' && <MemberPortalView />}

          {/* VIEW 4: INTERNAL LMS OPERATIONS (ADMIN & LIBRARIAN) */}
          {currentView === 'dashboard' && (
            <LmsDashboardView
              onOpenNewBook={handleOpenNewBook}
              onEditBook={handleEditBook}
              onDeleteBook={(b) =>
                setDeleteTarget({ type: 'book', id: b.id, name: b.title })
              }
              onOpenNewCopy={handleOpenNewCopy}
              onDeleteCopy={(id, barcode) =>
                setDeleteTarget({ type: 'copy', id, name: `Copy ${barcode}` })
              }
              onOpenNewMember={handleOpenNewMember}
              onEditMember={handleEditMember}
              onDeleteMember={(m) =>
                setDeleteTarget({ type: 'member', id: m.id, name: m.fullName })
              }
              onOpenIssue={() => setIsIssueModalOpen(true)}
              onOpenReturn={handleOpenReturn}
            />
          )}

          {/* VIEW 5: OPERATIONAL ANALYTICS & CSV EXPORT */}
          {currentView === 'analytics' && <AnalyticsView />}
        </div>

        {/* Footer */}
        <footer className="border-t border-border/40 py-5 text-center text-xs text-muted-foreground mt-auto bg-card/40">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              © {new Date().getFullYear()} The Library • Complete Digital Ecosystem
            </span>
            <span className="font-mono text-[11px]">
              Active Role: <strong className="text-foreground">{role.toUpperCase()}</strong>
            </span>
          </div>
        </footer>
      </div>

      {/* MODAL 1: Book Details Popup Modal */}
      <BookDetailModal
        book={inspectedBook}
        isOpen={Boolean(inspectedBook)}
        onClose={() => setInspectedBook(null)}
      />

      {/* MODAL 2: Create / Edit Book Title Modal */}
      <BookFormModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSave={handleSaveBook}
        initialData={editingBook}
      />

      {/* MODAL 3: Physical Copy Accession Modal */}
      <CopyFormModal
        bookId={copyTargetBook?.id || ''}
        bookTitle={copyTargetBook?.title || ''}
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        onSave={handleSaveCopy}
      />

      {/* MODAL 4: Create / Edit Member Modal */}
      <MemberFormModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        onSave={handleSaveMember}
        initialData={editingMember}
      />

      {/* MODAL 5: Circulation Issue Modal */}
      <IssueBookModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
      />

      {/* MODAL 6: Circulation Return Modal */}
      <ReturnBookModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        preselectedBorrowingId={returnBorrowingId}
      />

      {/* MODAL 7: System Identity & Member Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* MODAL 8: Mandatory Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemName={deleteTarget?.name || 'this item'}
        itemType={deleteTarget?.type || 'item'}
      />
    </div>
  )
}

export default function App() {
  return (
    <LibraryProvider>
      <LibraryAppContent />
    </LibraryProvider>
  )
}
