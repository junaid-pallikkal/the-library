import React from 'react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/button'

export interface ItemFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void | Promise<void>
  title: string
  description?: string
  submitText?: string
  isSubmitting?: boolean
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  submitText = 'Save',
  isSubmitting = false,
  children,
  maxWidth = 'md',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      maxWidth={maxWidth}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-forest hover:bg-forest/90 text-white dark:bg-forest dark:hover:bg-forest/80"
          >
            {isSubmitting ? 'Saving...' : submitText}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {children}
      </form>
    </Modal>
  )
}
