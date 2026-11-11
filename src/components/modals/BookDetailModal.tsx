import React from 'react'
import type { Book } from '@/types/library'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookOpen, MapPin, Tag, CheckCircle2, Clock, BookmarkPlus } from 'lucide-react'
import { useLibrary } from '@/lib/libraryState'

interface BookDetailModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
  onRequestBorrow?: (bookId: string) => void
  onReserve?: (bookId: string) => void
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  isOpen,
  onClose,
  onRequestBorrow,
  onReserve,
}) => {
  const { requestBorrowOnline, placeReservation } = useLibrary()

  if (!book) return null

  const handleBorrow = () => {
    if (onRequestBorrow) {
      onRequestBorrow(book.id)
    } else {
      requestBorrowOnline(book.id)
    }
    onClose()
  }

  const handleReserve = () => {
    if (onReserve) {
      onReserve(book.id)
    } else {
      placeReservation(book.id)
    }
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={book.title}
      description={book.subtitle || `${book.author} (${book.publicationYear})`}
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                book.availableCopies > 0
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }
            >
              {book.availableCopies > 0
                ? `${book.availableCopies} Available`
                : 'All Copies Borrowed'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>

            {book.availableCopies > 0 ? (
              <Button
                onClick={handleBorrow}
                className="bg-forest hover:bg-forest/90 text-white gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Request to Borrow
              </Button>
            ) : (
              <Button
                onClick={handleReserve}
                className="bg-amber-700 hover:bg-amber-800 text-white gap-2"
              >
                <BookmarkPlus className="w-4 h-4" />
                Join Reservation Queue
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Author & Meta bar */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground border-b border-border/40 pb-3">
          <span className="font-semibold text-foreground text-sm">
            {book.author}
          </span>
          {book.authorKanji && (
            <span className="font-serif text-forest dark:text-emerald-400">
              {book.authorKanji}
            </span>
          )}
          <span>•</span>
          <span className="flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            {book.category}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            {book.shelfLocation}
          </span>
        </div>

        {/* Synopsis / Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Overview
          </h4>
          <p className="text-sm leading-relaxed text-foreground/90 font-normal">
            {book.description}
          </p>
        </div>

        {/* Publication Specs in clean columns (No nested cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-secondary/50 rounded-lg text-xs">
          <div>
            <div className="text-muted-foreground text-[11px]">ISBN</div>
            <div className="font-mono font-medium text-foreground mt-0.5">
              {book.isbn}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[11px]">Publisher</div>
            <div className="font-medium text-foreground mt-0.5 truncate">
              {book.publisher}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[11px]">Edition</div>
            <div className="font-medium text-foreground mt-0.5">
              {book.edition || 'Standard'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-[11px]">Language</div>
            <div className="font-medium text-foreground mt-0.5">
              {book.language}
            </div>
          </div>
        </div>

        {/* Physical Copies Section (Flat rows, strictly no nested cards) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Physical Holdings ({book.copies?.length || 0})
            </h4>
            <span className="text-[11px] text-muted-foreground font-mono">
              Floor Shelf: {book.shelfLocation}
            </span>
          </div>

          <div className="divide-y divide-border/40 border border-border/40 rounded-lg overflow-hidden">
            {book.copies?.map((copy) => (
              <div
                key={copy.id}
                className="flex items-center justify-between p-3 text-xs bg-card"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-foreground">
                    {copy.barcode}
                  </span>
                  <span className="text-muted-foreground">
                    Copy #{copy.copyNumber}
                  </span>
                  <span className="capitalize text-[11px] px-2 py-0.5 rounded bg-secondary text-muted-foreground font-medium">
                    {copy.condition} condition
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {copy.status === 'available' ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Available
                    </span>
                  ) : copy.status === 'borrowed' ? (
                    <span className="flex items-center gap-1 text-amber-600 font-semibold text-[11px]">
                      <Clock className="w-3.5 h-3.5" /> On Loan
                    </span>
                  ) : (
                    <span className="text-muted-foreground font-medium text-[11px] capitalize">
                      {copy.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
