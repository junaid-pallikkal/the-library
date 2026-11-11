import React, { useState, useEffect } from 'react'
import type { Member } from '@/types/library'
import { ItemFormModal } from '@/components/modals/ItemFormModal'
import { Input } from '@/components/ui/input'

interface MemberFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (memberData: Omit<Member, 'id' | 'activeLoansCount' | 'registeredAt'>) => void
  initialData?: Member | null
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [memberCode, setMemberCode] = useState('')
  const [maxBorrowLimit, setMaxBorrowLimit] = useState('5')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName)
      setEmail(initialData.email)
      setPhone(initialData.phone)
      setMemberCode(initialData.memberCode)
      setMaxBorrowLimit(initialData.maxBorrowLimit.toString())
      setAddress(initialData.address || '')
    } else {
      setFullName('')
      setEmail('')
      setPhone('')
      setMemberCode(`MEM-2026-${Math.floor(100 + Math.random() * 900)}`)
      setMaxBorrowLimit('5')
      setAddress('')
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim()) return

    const expiry = new Date()
    expiry.setFullYear(expiry.getFullYear() + 1)

    onSave({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || '+1 (555) 000-0000',
      memberCode: memberCode.trim(),
      status: initialData ? initialData.status : 'active',
      maxBorrowLimit: parseInt(maxBorrowLimit) || 5,
      membershipExpiry: expiry.toISOString().split('T')[0],
      address: address.trim() || undefined,
    })

    onClose()
  }

  return (
    <ItemFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={initialData ? `Edit Member Profile` : `Register New Member`}
      description="Add patron to the membership ledger with circulation privileges."
      submitText={initialData ? 'Update Member' : 'Create Membership'}
      maxWidth="md"
    >
      <div className="space-y-4">
        <Input
          placeholder="Full Legal Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoFocus
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Official Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            placeholder="Contact Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Member Accession Code"
            value={memberCode}
            onChange={(e) => setMemberCode(e.target.value)}
            required
          />
          <Input
            placeholder="Borrowing Limit (Default: 5)"
            type="number"
            value={maxBorrowLimit}
            onChange={(e) => setMaxBorrowLimit(e.target.value)}
            required
          />
        </div>

        <Input
          placeholder="Residential / Department Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
    </ItemFormModal>
  )
}
