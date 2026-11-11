import React, { useState, useEffect } from 'react'
import type { Book } from '@/types/library'
import { ItemFormModal } from '@/components/modals/ItemFormModal'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface BookFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (bookData: Omit<Book, 'id' | 'totalCopies' | 'availableCopies'>) => void
  initialData?: Book | null
}

export const BookFormModal: React.FC<BookFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [author, setAuthor] = useState('')
  const [authorKanji, setAuthorKanji] = useState('')
  const [category, setCategory] = useState('')
  const [isbn, setIsbn] = useState('')
  const [year, setYear] = useState('2024')
  const [publisher, setPublisher] = useState('')
  const [shelfLocation, setShelfLocation] = useState('')
  const [language, setLanguage] = useState('English')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title)
      setSubtitle(initialData.subtitle || '')
      setAuthor(initialData.author)
      setAuthorKanji(initialData.authorKanji || '')
      setCategory(initialData.category)
      setIsbn(initialData.isbn)
      setYear(initialData.publicationYear.toString())
      setPublisher(initialData.publisher)
      setShelfLocation(initialData.shelfLocation)
      setLanguage(initialData.language)
      setDescription(initialData.description)
    } else {
      setTitle('')
      setSubtitle('')
      setAuthor('')
      setAuthorKanji('')
      setCategory('')
      setIsbn(`978-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`)
      setYear('2024')
      setPublisher('Heritage Editions')
      setShelfLocation('Floor 1, Bay 1, Shelf A')
      setLanguage('English')
      setDescription('')
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !author.trim()) return

    onSave({
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      author: author.trim(),
      authorKanji: authorKanji.trim() || undefined,
      category: category.trim() || 'General Literature',
      isbn: isbn.trim(),
      publicationYear: parseInt(year) || 2024,
      publisher: publisher.trim() || 'Heritage Editions',
      shelfLocation: shelfLocation.trim() || 'Floor 1, Bay 1',
      language: language.trim() || 'English',
      description: description.trim() || 'No description provided.',
      coverColor: '#1B382B',
      isFeatured: false,
    })

    onClose()
  }

  return (
    <ItemFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={initialData ? 'Edit Book Record' : 'New Book Title'}
      description="Enter official bibliographic details for library accession."
      submitText={initialData ? 'Update Book' : 'Add to Catalog'}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Title & Subtitle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Book Title (e.g. The Silent Valley)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
          <Input
            placeholder="Subtitle / Translation"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>

        {/* Authors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Primary Author Name"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
          <Input
            placeholder="Author Kanji / Original Script (Optional)"
            value={authorKanji}
            onChange={(e) => setAuthorKanji(e.target.value)}
          />
        </div>

        {/* Category, Year, ISBN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Category / Genre"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Input
            placeholder="Publication Year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
          <Input
            placeholder="ISBN Barcode"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
          />
        </div>

        {/* Location & Publisher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Floor & Shelf Location (e.g. Floor 2, Bay 4)"
            value={shelfLocation}
            onChange={(e) => setShelfLocation(e.target.value)}
          />
          <Input
            placeholder="Publisher Name"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
          />
        </div>

        {/* Description */}
        <Textarea
          placeholder="Brief synopsis, historical context, or edition summary..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>
    </ItemFormModal>
  )
}
