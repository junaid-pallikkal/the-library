import React, { useState } from 'react'
import type { Book } from '@/types/library'
import { FlatCard } from '@/components/common/FlatCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, LayoutGrid, List, MapPin, Plus } from 'lucide-react'

interface CatalogViewProps {
  books: Book[]
  onInspectBook: (book: Book) => void
  onOpenNewBook: () => void
  role: string
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  books,
  onInspectBook,
  onOpenNewBook,
  role,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const categories = ['all', ...Array.from(new Set(books.map((b) => b.category)))]

  const filteredBooks = books.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'all' || b.category === selectedCategory

    const matchesAvailability = !onlyAvailable || b.availableCopies > 0

    return matchesSearch && matchesCategory && matchesAvailability
  })

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filters & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Bibliographic Catalog
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Search {books.length} curated archival volumes and live holdings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {role !== 'member' && (
            <Button
              size="sm"
              onClick={onOpenNewBook}
              className="bg-forest hover:bg-forest/90 text-white text-xs gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Book
            </Button>
          )}

          <div className="flex items-center border border-border/60 rounded-md bg-secondary/60 p-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-card shadow-xs' : ''}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-card shadow-xs' : ''}
              aria-label="List view"
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search Input & Category Filter Chips */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, category, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border transition-all ${
                selectedCategory === cat
                  ? 'bg-forest text-white border-forest'
                  : 'bg-card text-muted-foreground border-border/60 hover:border-forest/40'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setOnlyAvailable(!onlyAvailable)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              onlyAvailable
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-card text-muted-foreground border-border/60 hover:border-emerald-600/40'
            }`}
          >
            Available Now Only
          </button>
        </div>
      </div>

      {/* Book Grid / List - Flattened cards (Zero nested cards) */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.map((book) => (
            <FlatCard
              key={book.id}
              clickable
              onClick={() => onInspectBook(book)}
              className="flex flex-col justify-between h-full group"
            >
              <div className="space-y-3">
                {/* Book Spine Color Banner & Year */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                    {book.category}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {book.publicationYear}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-foreground group-hover:text-forest transition-colors leading-snug">
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
                <span className="flex items-center gap-1 text-muted-foreground text-[11px] truncate max-w-[140px]">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  {book.shelfLocation}
                </span>

                <Badge
                  variant="outline"
                  className={
                    book.availableCopies > 0
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }
                >
                  {book.availableCopies > 0
                    ? `${book.availableCopies} Copies Available`
                    : 'Waitlist'}
                </Badge>
              </div>
            </FlatCard>
          ))}
        </div>
      ) : (
        /* List Mode - Flat rows */
        <div className="divide-y divide-border/60 border border-border/60 rounded-lg overflow-hidden bg-card">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => onInspectBook(book)}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-secondary/40 transition-colors cursor-pointer"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">
                    {book.title}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    by {book.author}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{book.category}</span>
                  <span>•</span>
                  <span>{book.isbn}</span>
                  <span>•</span>
                  <span>{book.shelfLocation}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
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
                    : 'Reserved Queue'}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={(e) => {
                    e.stopPropagation()
                    onInspectBook(book)
                  }}
                >
                  Inspect
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredBooks.length === 0 && (
        <div className="p-12 text-center text-sm text-muted-foreground border border-dashed rounded-lg bg-card/40">
          No books matching your criteria found.
        </div>
      )}
    </div>
  )
}
