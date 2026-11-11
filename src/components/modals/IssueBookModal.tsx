import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLibrary } from '@/lib/libraryState'
import type { Member } from '@/types/library'
import {
  Search,
  CheckCircle2,
  Calendar,
  ArrowRightLeft,
  RefreshCw,
  BookOpen,
} from 'lucide-react'

interface IssueBookModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedBookId?: string
}

export const IssueBookModal: React.FC<IssueBookModalProps> = ({
  isOpen,
  onClose,
  preselectedBookId,
}) => {
  const { books, members, issueBook } = useLibrary()

  // Member search & selection state
  const [memberQuery, setMemberQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  // Book & copy selection state
  const [selectedBookId, setSelectedBookId] = useState(
    preselectedBookId || books[0]?.id || ''
  )
  const [selectedCopyId, setSelectedCopyId] = useState('')

  // Loan period state
  const [loanDays, setLoanDays] = useState(14)
  const [successReceipt, setSuccessReceipt] = useState<{
    memberName: string
    bookTitle: string
    barcode: string
    dueDate: string
  } | null>(null)

  const activeMembers = members.filter((m) => m.status === 'active')
  const currentBook = books.find((b) => b.id === selectedBookId)
  const availableCopies = currentBook?.copies?.filter((c) => c.status === 'available') || []

  // Auto-select first available copy when book changes
  useEffect(() => {
    if (availableCopies.length > 0 && !selectedCopyId) {
      setSelectedCopyId(availableCopies[0].id)
    } else if (availableCopies.length === 0) {
      setSelectedCopyId('')
    }
  }, [availableCopies, selectedCopyId])

  // Filter members ONLY when search query is entered
  const matchingMembers = memberQuery.trim()
    ? activeMembers.filter(
        (m) =>
          m.fullName.toLowerCase().includes(memberQuery.toLowerCase()) ||
          m.memberCode.toLowerCase().includes(memberQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(memberQuery.toLowerCase())
      )
    : []

  // Calculate formatted due date
  const calculatedDueDate = new Date()
  calculatedDueDate.setDate(calculatedDueDate.getDate() + loanDays)
  const formattedDueDate = calculatedDueDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember || !selectedCopyId || !currentBook) return

    const chosenCopy = availableCopies.find((c) => c.id === selectedCopyId)
    const barcodeStr = chosenCopy?.barcode || 'N/A'

    issueBook(selectedMember.id, selectedCopyId, loanDays)

    setSuccessReceipt({
      memberName: selectedMember.fullName,
      bookTitle: currentBook.title,
      barcode: barcodeStr,
      dueDate: formattedDueDate,
    })

    setTimeout(() => {
      setSuccessReceipt(null)
      setSelectedMember(null)
      setMemberQuery('')
      onClose()
    }, 2000)
  }

  const handleReset = () => {
    setSelectedMember(null)
    setMemberQuery('')
    setSuccessReceipt(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title="Circulation Desk Checkout"
      description="Instant physical loan allocation linking patron with an accession copy."
      maxWidth="lg"
    >
      {successReceipt ? (
        <div className="py-6 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground font-serif">
              Loan Successfully Issued
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Physical copy checked out to patron.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-xl bg-secondary/40 border border-border/70 text-left space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Patron:</span>
              <span className="font-bold text-foreground">{successReceipt.memberName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Volume:</span>
              <span className="font-bold text-foreground">{successReceipt.bookTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Barcode:</span>
              <span className="font-bold text-forest dark:text-emerald-400">{successReceipt.barcode}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-border/40">
              <span className="text-muted-foreground">Return Due:</span>
              <span className="font-bold text-foreground">{successReceipt.dueDate}</span>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ============================================================== */}
          {/* SECTION 1: DYNAMIC MEMBER SEARCH & SELECTION                  */}
          {/* ============================================================== */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-foreground">
                1. Select Patron / Member
              </span>
              {selectedMember && (
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="text-xs text-forest dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Change Patron
                </button>
              )}
            </div>

            {!selectedMember ? (
              <div className="space-y-2">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search by patron name, code, or email..."
                    value={memberQuery}
                    onChange={(e) => setMemberQuery(e.target.value)}
                    className="pl-9 text-xs h-10 bg-card border-border/80"
                    autoFocus
                  />
                </div>

                {/* CRITICAL: ONLY DISPLAY RESULTS WHEN SEARCHING HAS STARTED */}
                {memberQuery.trim().length === 0 ? (
                  <div className="p-3 rounded-lg border border-dashed border-border/70 text-center text-xs text-muted-foreground bg-secondary/20">
                    Type a member name or ID (e.g. <em>Sophia</em>, <em>MEM-2026-001</em>) to view and select patron.
                  </div>
                ) : matchingMembers.length > 0 ? (
                  <div className="border border-border/80 rounded-lg max-h-44 overflow-y-auto divide-y divide-border/40 bg-card shadow-sm animate-in fade-in duration-150">
                    {matchingMembers.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedMember(m)
                          setMemberQuery('')
                        }}
                        className="p-2.5 flex items-center justify-between hover:bg-forest hover:text-white cursor-pointer transition-colors group"
                      >
                        <div>
                          <div className="text-xs font-bold leading-tight flex items-center gap-2">
                            <span>{m.fullName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-secondary text-muted-foreground group-hover:bg-white/20 group-hover:text-white">
                              {m.memberCode}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground group-hover:text-white/80 mt-0.5">
                            {m.email}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-medium">
                            {m.activeLoansCount}/{m.maxBorrowLimit} Loans
                          </span>
                          <span className="text-xs font-semibold px-2 py-1 rounded bg-secondary group-hover:bg-white text-foreground group-hover:text-forest">
                            Select
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-secondary/30 text-center text-xs text-muted-foreground">
                    No active members found matching "{memberQuery}".
                  </div>
                )}
              </div>
            ) : (
              /* Selected Member Card (Flat layout) */
              <div className="p-3.5 rounded-xl border border-forest/40 bg-forest/5 dark:bg-forest/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-forest text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
                    {selectedMember.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground flex items-center gap-2">
                      <span>{selectedMember.fullName}</span>
                      <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-forest text-white">
                        Verified Patron
                      </Badge>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      {selectedMember.memberCode} • {selectedMember.email}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-mono font-bold text-foreground">
                    {selectedMember.activeLoansCount} / {selectedMember.maxBorrowLimit} Active Loans
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Eligible for Checkout
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* SECTION 2: BOOK & PHYSICAL COPY SELECTION                     */}
          {/* ============================================================== */}
          <div className="space-y-3 pt-3 border-t border-border/40">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-foreground block">
              2. Select Title & Available Copy
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Title Dropdown */}
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">
                  Archival Title
                </label>
                <Select
                  value={selectedBookId}
                  onValueChange={(val) => {
                    setSelectedBookId(val)
                    setSelectedCopyId('')
                  }}
                >
                  <SelectTrigger className="w-full text-xs h-10 bg-card border-border/80">
                    <SelectValue placeholder="Choose title" />
                  </SelectTrigger>
                  <SelectContent>
                    {books.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.title} ({b.availableCopies} available)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Physical Copy Dropdown */}
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">
                  Physical Accession Barcode
                </label>
                {availableCopies.length > 0 ? (
                  <Select
                    value={selectedCopyId}
                    onValueChange={setSelectedCopyId}
                  >
                    <SelectTrigger className="w-full text-xs h-10 bg-card border-border/80 font-mono">
                      <SelectValue placeholder="Choose barcode" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCopies.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="font-mono text-xs">
                          {c.barcode} — Copy #{c.copyNumber} ({c.condition})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs rounded-lg border border-amber-200">
                    All copies are currently checked out.
                  </div>
                )}
              </div>
            </div>

            {currentBook && (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <BookOpen className="w-3.5 h-3.5 text-forest" />
                  {currentBook.title} ({currentBook.publicationYear})
                </span>
                <span className="font-mono text-[11px]">
                  Call: {currentBook.shelfLocation}
                </span>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* SECTION 3: LOAN TERMS & DUE DATE                              */}
          {/* ============================================================== */}
          <div className="space-y-3 pt-3 border-t border-border/40">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-foreground block">
              3. Loan Terms & Due Date
            </span>

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { days: 14, label: '14 Days (Standard)' },
                { days: 21, label: '21 Days (Extended)' },
                { days: 28, label: '28 Days (Faculty)' },
              ].map((term) => (
                <button
                  key={term.days}
                  type="button"
                  onClick={() => setLoanDays(term.days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    loanDays === term.days
                      ? 'bg-forest text-white border-forest shadow-xs'
                      : 'bg-card text-muted-foreground border-border/80 hover:bg-secondary/50'
                  }`}
                >
                  {term.label}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-secondary/40 border border-border/60 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="w-4 h-4 text-forest dark:text-emerald-400" />
                Scheduled Return Due Date:
              </span>
              <span className="font-mono font-bold text-foreground">
                {formattedDueDate}
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION 4: ACTIONS & SUBMIT                                   */}
          {/* ============================================================== */}
          <div className="pt-3 border-t border-border/40 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="text-xs"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!selectedMember || !selectedCopyId}
              className="bg-forest hover:bg-forest/90 text-white text-xs gap-2 px-5 py-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Confirm Desk Checkout
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
