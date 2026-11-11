import React, { useState, useEffect } from 'react'
import type { BookCopy, CopyCondition, CopyStatus } from '@/types/library'
import { ItemFormModal } from '@/components/modals/ItemFormModal'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CopyFormModalProps {
  bookId: string
  bookTitle: string
  isOpen: boolean
  onClose: () => void
  onSave: (copyData: Omit<BookCopy, 'id' | 'bookId'>) => void
  initialData?: BookCopy | null
}

export const CopyFormModal: React.FC<CopyFormModalProps> = ({
  bookTitle,
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [barcode, setBarcode] = useState('')
  const [copyNumber, setCopyNumber] = useState('1')
  const [shelfLocation, setShelfLocation] = useState('')
  const [condition, setCondition] = useState<CopyCondition>('excellent')
  const [status, setStatus] = useState<CopyStatus>('available')

  useEffect(() => {
    if (initialData) {
      setBarcode(initialData.barcode)
      setCopyNumber(initialData.copyNumber.toString())
      setShelfLocation(initialData.shelfLocation)
      setCondition(initialData.condition)
      setStatus(initialData.status)
    } else {
      setBarcode(`BC-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`)
      setCopyNumber('1')
      setShelfLocation('Floor 1, Bay 1')
      setCondition('excellent')
      setStatus('available')
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcode.trim()) return

    onSave({
      barcode: barcode.trim(),
      copyNumber: parseInt(copyNumber) || 1,
      shelfLocation: shelfLocation.trim() || 'Floor 1, Bay 1',
      condition,
      status,
      acquisitionDate: new Date().toISOString().split('T')[0],
    })

    onClose()
  }

  return (
    <ItemFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={initialData ? `Edit Copy (${initialData.barcode})` : `Add Copy to "${bookTitle}"`}
      description="Manage individual physical accession and condition state."
      submitText={initialData ? 'Update Copy' : 'Register Copy'}
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Unique Barcode (e.g. BC-1049-A)"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            required
            autoFocus
          />
          <Input
            placeholder="Copy Sequence #"
            type="number"
            value={copyNumber}
            onChange={(e) => setCopyNumber(e.target.value)}
            required
          />
        </div>

        <Input
          placeholder="Specific Shelf Placement (e.g. Floor 2, Bay 4, Shelf A-1)"
          value={shelfLocation}
          onChange={(e) => setShelfLocation(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase text-muted-foreground mb-1 block">
              Physical Condition
            </label>
            <Select
              value={condition}
              onValueChange={(val) => setCondition(val as CopyCondition)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="damaged">Damaged (Needs Repair)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-muted-foreground mb-1 block">
              Circulation Status
            </label>
            <Select
              value={status}
              onValueChange={(val) => setStatus(val as CopyStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="borrowed">Borrowed</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </ItemFormModal>
  )
}
