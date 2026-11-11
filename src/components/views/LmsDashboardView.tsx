import React, { useState } from 'react'
import { useLibrary } from '@/lib/libraryState'
import type { Book, Member } from '@/types/library'
import { FlatCard } from '@/components/common/FlatCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  BookCopy as BookCopyIcon,
  Barcode,
  Users,
  ArrowRightLeft,
  CheckCheck,
  BookmarkCheck,
  History,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'

interface LmsDashboardViewProps {
  onOpenNewBook: () => void
  onEditBook: (book: Book) => void
  onDeleteBook: (book: Book) => void
  onOpenNewCopy: (bookId: string, bookTitle: string) => void
  onDeleteCopy: (copyId: string, barcode: string) => void
  onOpenNewMember: () => void
  onEditMember: (member: Member) => void
  onDeleteMember: (member: Member) => void
  onOpenIssue: () => void
  onOpenReturn: (borrowingId?: string) => void
}

export const LmsDashboardView: React.FC<LmsDashboardViewProps> = ({
  onOpenNewBook,
  onEditBook,
  onDeleteBook,
  onOpenNewCopy,
  onDeleteCopy,
  onOpenNewMember,
  onEditMember,
  onDeleteMember,
  onOpenIssue,
  onOpenReturn,
}) => {
  const {
    role,
    books,
    members,
    borrowings,
    requests,
    reservations,
    auditLogs,
    stats,
    toggleMemberStatus,
    approveRequest,
    rejectRequest,
    cancelReservation,
  } = useLibrary()

  const [activeTab, setActiveTab] = useState<
    'overview' | 'books' | 'copies' | 'members' | 'circulation' | 'approvals' | 'reservations' | 'audit'
  >('overview')

  // Flattened list of all copies for the Copies tab
  const allCopies = books.flatMap((b) =>
    (b.copies || []).map((c) => ({
      ...c,
      bookTitle: b.title,
      author: b.author,
    }))
  )

  const activeLoans = borrowings.filter(
    (b) => b.status === 'active' || b.status === 'overdue'
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 shrink-0 p-3 rounded-lg bg-card border border-border/60 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Operations Menu ({role.toUpperCase()})
        </div>

        <button
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'bg-forest text-white'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Executive Overview
          </span>
        </button>

        <button
          onClick={() => setActiveTab('books')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'books'
              ? 'bg-forest text-white'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            <BookCopyIcon className="w-4 h-4" />
            Catalog & Titles
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10">
            {books.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('copies')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'copies'
              ? 'bg-forest text-white'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            <Barcode className="w-4 h-4" />
            Physical Copies
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10">
            {allCopies.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'members'
              ? 'bg-forest text-white'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Member Directory
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10">
            {members.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('circulation')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'circulation'
              ? 'bg-forest text-white'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            Desk Circulation
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10">
            {activeLoans.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'approvals'
              ? 'bg-forest text-white'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4" />
            Approval Center
          </span>
          {stats.pendingRequests > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold">
              {stats.pendingRequests}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'reservations'
              ? 'bg-forest text-white'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
        >
          <span className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4" />
            Reservation Queue
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10">
            {reservations.length}
          </span>
        </button>

        {role === 'admin' && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'audit'
                ? 'bg-forest text-white'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Audit Ledger
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/10">
              {auditLogs.length}
            </span>
          </button>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full space-y-6">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Executive Overview
                </h3>
                <p className="text-xs text-muted-foreground">
                  Live operational telemetry and circulation health.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={onOpenIssue}
                  className="bg-forest hover:bg-forest/90 text-white text-xs gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Issue Book
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenReturn()}
                  className="text-xs gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Return Book
                </Button>
              </div>
            </div>

            {/* Metrics Grid (Flat cards only) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <FlatCard className="p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Titles
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalTitles}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  Curated Catalog
                </div>
              </FlatCard>

              <FlatCard className="p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Holdings
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalPhysicalCopies}
                </div>
                <div className="text-[10px] text-emerald-600 font-mono font-medium">
                  {stats.availableCopies} available on shelf
                </div>
              </FlatCard>

              <FlatCard className="p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Active Loans
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {stats.borrowedCopies}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  {stats.overdueLoans} past due date
                </div>
              </FlatCard>

              <FlatCard className="p-4 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Members
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.activeMembers}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  Verified Active
                </div>
              </FlatCard>
            </div>

            {/* Activity and Overdue Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Overdue Items Alert */}
              <FlatCard className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Overdue Circulation Items
                  </h4>
                  <Badge variant="outline" className="text-red-700 bg-red-50 text-[10px]">
                    {borrowings.filter((b) => b.status === 'overdue').length} Action Required
                  </Badge>
                </div>

                <div className="space-y-2">
                  {borrowings
                    .filter((b) => b.status === 'overdue')
                    .map((b) => (
                      <div
                        key={b.id}
                        className="p-3 bg-secondary/50 rounded flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-foreground">{b.bookTitle}</div>
                          <div className="text-muted-foreground">
                            Borrower: {b.memberName} • Due: {b.dueDate}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onOpenReturn(b.id)}
                          className="text-xs h-7"
                        >
                          Process Return
                        </Button>
                      </div>
                    ))}

                  {borrowings.filter((b) => b.status === 'overdue').length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      No overdue items currently recorded.
                    </div>
                  )}
                </div>
              </FlatCard>

              {/* Pending Approvals */}
              <FlatCard className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-amber-600" />
                    Pending Patron Requests
                  </h4>
                  <span className="text-xs text-muted-foreground font-mono">
                    {requests.filter((r) => r.status === 'pending').length} Waiting
                  </span>
                </div>

                <div className="space-y-2">
                  {requests
                    .filter((r) => r.status === 'pending')
                    .map((r) => (
                      <div
                        key={r.id}
                        className="p-3 bg-secondary/50 rounded flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-foreground">{r.bookTitle}</div>
                          <div className="text-muted-foreground">
                            Requested by {r.memberName} ({r.requestType})
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon-sm"
                            onClick={() => approveRequest(r.id)}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Approve"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={() => rejectRequest(r.id, 'Resource currently restricted')}
                            className="text-red-600"
                            title="Reject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}

                  {requests.filter((r) => r.status === 'pending').length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      All requests processed.
                    </div>
                  )}
                </div>
              </FlatCard>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKS MANAGEMENT */}
        {activeTab === 'books' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Catalog & Book Titles ({books.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Add, update or archive primary bibliographic records.
                </p>
              </div>

              <Button
                size="sm"
                onClick={onOpenNewBook}
                className="bg-forest hover:bg-forest/90 text-white text-xs gap-1.5"
              >
                <Plus className="w-4 h-4" /> New Book Title
              </Button>
            </div>

            {/* Flat Table List */}
            <div className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden bg-card">
              {books.map((b) => (
                <div
                  key={b.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/30 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-foreground">
                        {b.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        ({b.publicationYear})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                      <span>Author: {b.author}</span>
                      <span>•</span>
                      <span>ISBN: {b.isbn}</span>
                      <span>•</span>
                      <span className="text-forest font-semibold">
                        {b.availableCopies}/{b.totalCopies} Copies
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenNewCopy(b.id, b.title)}
                      className="text-xs h-8 gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Copy
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onEditBook(b)}
                      title="Edit Book"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onDeleteBook(b)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete Book"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PHYSICAL COPIES INVENTORY */}
        {activeTab === 'copies' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Physical Holdings Inventory ({allCopies.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Unique barcode barcodes, condition ratings, and circulation states.
                </p>
              </div>
            </div>

            <div className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden bg-card">
              {allCopies.map((copy) => (
                <div
                  key={copy.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-secondary/30 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground bg-secondary px-2 py-0.5 rounded">
                        {copy.barcode}
                      </span>
                      <span className="font-semibold text-foreground">
                        {copy.bookTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span>Copy #{copy.copyNumber}</span>
                      <span>•</span>
                      <span>Location: {copy.shelfLocation}</span>
                      <span>•</span>
                      <span className="capitalize">Condition: {copy.condition}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="outline"
                      className={
                        copy.status === 'available'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : copy.status === 'borrowed'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }
                    >
                      {copy.status.toUpperCase()}
                    </Badge>

                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onDeleteCopy(copy.id, copy.barcode)}
                      className="text-red-500 hover:text-red-700"
                      title="Retire Copy"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: MEMBER DIRECTORY */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Member Directory ({members.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Manage registered library patrons and borrowing eligibility.
                </p>
              </div>

              <Button
                size="sm"
                onClick={onOpenNewMember}
                className="bg-forest hover:bg-forest/90 text-white text-xs gap-1.5"
              >
                <Plus className="w-4 h-4" /> Register Member
              </Button>
            </div>

            <div className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden bg-card">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-secondary/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {m.fullName}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        ({m.memberCode})
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          m.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }
                      >
                        {m.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground">
                      {m.email} • {m.phone} • Loans: {m.activeLoansCount}/{m.maxBorrowLimit}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleMemberStatus(m.id)}
                      className="text-xs h-8"
                    >
                      {m.status === 'active' ? 'Suspend' : 'Activate'}
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onEditMember(m)}
                      title="Edit Member"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => onDeleteMember(m)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DESK CIRCULATION (ISSUE & RETURN) */}
        {activeTab === 'circulation' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Circulation Desk & Active Loans ({activeLoans.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Check out books, record returns, and calculate overdue fees.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={onOpenIssue}
                  className="bg-forest hover:bg-forest/90 text-white text-xs gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Issue Book
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onOpenReturn()}
                  className="text-xs gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Return Book
                </Button>
              </div>
            </div>

            <div className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden bg-card">
              {borrowings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-secondary/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">
                        {b.bookTitle}
                      </span>
                      <span className="font-mono text-muted-foreground">
                        [{b.barcode}]
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      Borrower: {b.memberName} ({b.memberCode}) • Due: {b.dueDate}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      variant="outline"
                      className={
                        b.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : b.status === 'overdue'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-secondary text-muted-foreground'
                      }
                    >
                      {b.status.toUpperCase()}
                    </Badge>

                    {b.status !== 'returned' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onOpenReturn(b.id)}
                        className="text-xs h-7"
                      >
                        Check In / Return
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: APPROVAL CENTER */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-border/40">
              <h3 className="text-lg font-bold text-foreground">
                Approval Center ({requests.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Review member online requests for book loans and renewals.
              </p>
            </div>

            <div className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden bg-card">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-sm text-foreground">
                      {r.bookTitle}
                    </div>
                    <div className="text-muted-foreground mt-0.5">
                      Requested by {r.memberName} ({r.memberCode}) • Type: {r.requestType.toUpperCase()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.status === 'pending' ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => approveRequest(r.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                        >
                          Approve Request
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectRequest(r.id, 'Resource allocation rejected')}
                          className="text-red-600 hover:text-red-700 text-xs h-8"
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Badge variant="outline" className="capitalize">
                        {r.status}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}

              {requests.length === 0 && (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No requests in the queue.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: RESERVATION QUEUE */}
        {activeTab === 'reservations' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-border/40">
              <h3 className="text-lg font-bold text-foreground">
                Reservation Priority Queue ({reservations.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Automatic allocation queues for borrowed titles.
              </p>
            </div>

            <div className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden bg-card">
              {reservations.map((r) => (
                <div
                  key={r.id}
                  className="p-4 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-sm text-foreground">
                      {r.bookTitle}
                    </div>
                    <div className="text-muted-foreground mt-0.5">
                      Patron: {r.memberName} • Placed on {r.createdAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-amber-50 text-amber-800">
                      Queue #{r.queuePosition}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelReservation(r.id)}
                      className="text-red-600 h-7 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}

              {reservations.length === 0 && (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No reservations currently waiting.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="pb-3 border-b border-border/40">
              <h3 className="text-lg font-bold text-foreground">
                Immutable System Audit Logs ({auditLogs.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Tamper-proof operational ledger tracking all staff & member transactions.
              </p>
            </div>

            <div className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden bg-card font-mono text-[11px]">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-bold text-foreground">
                      [{log.actorRole.toUpperCase()}] {log.actorName}
                    </span>
                    <span>{log.timestamp}</span>
                  </div>
                  <div className="text-foreground">
                    <span className="text-forest font-bold">{log.action}</span> on{' '}
                    <span className="text-muted-foreground">{log.entityType}</span>
                  </div>
                  <div className="text-muted-foreground text-[10px]">
                    {log.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
