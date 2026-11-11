import React, { useState } from 'react'
import type { CopyCondition } from '@/types/library'
import { ItemFormModal } from '@/components/modals/ItemFormModal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useLibrary } from '@/lib/libraryState'

interface ReturnBookModalProps {
  isOpen: boolean
  onClose: () => void
  preselectedBorrowingId?: string
}

export const ReturnBookModal: React.FC<ReturnBookModalProps> = ({
  isOpen,
  onClose,
  preselectedBorrowingId,
}) => {
  const { borrowings, returnBook } = useLibrary()

  const activeLoans = borrowings.filter(
    (b) => b.status === 'active' || b.status === 'overdue'
  )

  const [selectedBorrowingId, setSelectedBorrowingId] = useState(
    preselectedBorrowingId || activeLoans[0]?.id || ''
  )
  const [condition, setCondition] = useState<CopyCondition>('good')
  const [notes, setNotes] = useState('')

  const selectedLoan = borrowings.find((b) => b.id === selectedBorrowingId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBorrowingId) return

    returnBook(selectedBorrowingId, condition, notes)
    onClose()
  }

  return (
    <ItemFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Process Book Return"
      description="Record book check-in, inspect condition, and re-allocate to shelf or reservation queue."
      submitText="Confirm Return"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Active Loan Selector */}
        <div>
          <label className="text-[11px] font-bold uppercase text-muted-foreground mb-1 block">
            Select Active Loan / Barcode
          </label>
          {activeLoans.length > 0 ? (
            <Select
              value={selectedBorrowingId || activeLoans[0]?.id}
              onValueChange={setSelectedBorrowingId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose loaned item" />
              </SelectTrigger>
              <SelectContent>
                {activeLoans.map((loan) => (
                  <SelectItem key={loan.id} value={loan.id}>
                    {loan.bookTitle} ({loan.barcode}) — {loan.memberName}
                    {loan.status === 'overdue' ? ' [OVERDUE]' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-3 bg-secondary text-muted-foreground text-xs rounded border">
              No active borrowings currently recorded.
            </div>
          )}
        </div>

        {selectedLoan && (
          <div className="p-3 bg-secondary/50 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Borrower:</span>
              <span className="font-semibold text-foreground">
                {selectedLoan.memberName} ({selectedLoan.memberCode})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date:</span>
              <span
                className={`font-mono font-medium ${
                  selectedLoan.status === 'overdue' ? 'text-red-600 font-bold' : ''
                }`}
              >
                {selectedLoan.dueDate}
              </span>
            </div>
          </div>
        )}

        {/* Condition Assessment */}
        <div>
          <label className="text-[11px] font-bold uppercase text-muted-foreground mb-1 block">
            Condition Upon Inspection
          </label>
          <Select
            value={condition}
            onValueChange={(val) => setCondition(val as CopyCondition)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Assess condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent — Pristine</SelectItem>
              <SelectItem value="good">Good — Minor shelf wear</SelectItem>
              <SelectItem value="fair">Fair — Readable, worn binding</SelectItem>
              <SelectItem value="damaged">Damaged — Needs Bindery/Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Input
          placeholder="Inspection notes or damage assessment (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </ItemFormModal>
  )
}
