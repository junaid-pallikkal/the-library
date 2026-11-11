import React from 'react'
import { useLibrary } from '@/lib/libraryState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Bookmark } from 'lucide-react'

export const MemberPortalView: React.FC = () => {
  const {
    currentMember,
    setCurrentMember,
    members,
    borrowings,
    requests,
    reservations,
    cancelReservation,
  } = useLibrary()

  const memberBorrowings = borrowings.filter(
    (b) => b.memberId === currentMember.id && (b.status === 'active' || b.status === 'overdue')
  )

  const memberRequests = requests.filter((r) => r.memberId === currentMember.id)
  const memberReservations = reservations.filter((r) => r.memberId === currentMember.id)

  return (
    <div className="space-y-8">
      {/* Member Profile Overview (Flat Layout) */}
      <div className="p-6 rounded-lg bg-card border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {currentMember.fullName}
            </h2>
            <Badge
              variant="outline"
              className={
                currentMember.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }
            >
              {currentMember.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            {currentMember.memberCode} • {currentMember.email} • Expires {currentMember.membershipExpiry}
          </p>
        </div>

        {/* Member Switcher for Pair Testing */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Test as:</span>
          <select
            value={currentMember.id}
            onChange={(e) => {
              const target = members.find((m) => m.id === e.target.value)
              if (target) setCurrentMember(target)
            }}
            className="text-xs bg-secondary border border-border/80 rounded px-2.5 py-1.5 font-medium"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats summary row (Flat stats, no nested cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-card border border-border/60">
          <div className="text-xs text-muted-foreground font-medium">
            Active Loans
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">
            {memberBorrowings.length} / {currentMember.maxBorrowLimit}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Maximum allocation allowed
          </div>
        </div>

        <div className="p-4 rounded-lg bg-card border border-border/60">
          <div className="text-xs text-muted-foreground font-medium">
            Pending Requests
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">
            {memberRequests.filter((r) => r.status === 'pending').length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Awaiting circulation desk approval
          </div>
        </div>

        <div className="p-4 rounded-lg bg-card border border-border/60">
          <div className="text-xs text-muted-foreground font-medium">
            Queue Reservations
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">
            {memberReservations.filter((r) => r.status === 'waiting').length}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            Automatic allocation upon book return
          </div>
        </div>
      </div>

      {/* Active Borrowings Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-forest" />
          Currently Borrowed Books ({memberBorrowings.length})
        </h3>

        {memberBorrowings.length > 0 ? (
          <div className="space-y-2">
            {memberBorrowings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-lg bg-card border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {b.bookTitle}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="font-mono">Copy: {b.barcode}</span>
                    <span>•</span>
                    <span>Borrowed: {b.borrowedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Due Date</div>
                    <div
                      className={`text-xs font-mono font-bold ${
                        b.status === 'overdue' ? 'text-red-600' : 'text-foreground'
                      }`}
                    >
                      {b.dueDate}
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={
                      b.status === 'overdue'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }
                  >
                    {b.status === 'overdue' ? 'OVERDUE' : 'ON TIME'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-card/40">
            No active borrowings. Browse the catalog to borrow volumes.
          </div>
        )}
      </div>

      {/* Reservation Queue Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-amber-700" />
          Active Reservations ({memberReservations.length})
        </h3>

        {memberReservations.length > 0 ? (
          <div className="space-y-2">
            {memberReservations.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-lg bg-card border border-border/60 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    {r.bookTitle}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Reserved on {r.createdAt}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-800 border-amber-200"
                  >
                    Queue #{r.queuePosition}
                  </Badge>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => cancelReservation(r.id)}
                    className="text-xs text-red-600 hover:text-red-700 h-7"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-card/40">
            No books in reservation queue.
          </div>
        )}
      </div>
    </div>
  )
}
