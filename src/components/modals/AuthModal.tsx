import React, { useState } from 'react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useLibrary } from '@/lib/libraryState'
import type { UserRole } from '@/types/library'
import {
  Shield,
  Library,
  CheckCircle2,
  Sparkles,
  UserPlus,
  LogIn,
} from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { role, currentMember, members, loginAs, becomeMember } = useLibrary()

  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin')

  // Sign up form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleRoleSelect = (targetRole: UserRole, memberId?: string) => {
    loginAs(targetRole, memberId)
    onClose()
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !email.trim()) return

    const newMem = becomeMember({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || '+1 (555) 000-0000',
      address: address.trim() || undefined,
    })

    setSuccessMsg(`Welcome, ${newMem.fullName}! Your membership code is ${newMem.memberCode}.`)
    setTimeout(() => {
      setSuccessMsg('')
      onClose()
    }, 1800)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Identity & Access Gateway"
      description="Select system role or register for patron borrowing privileges."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Tab switchers */}
        <div className="flex border-b border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'signin'
                ? 'border-forest text-forest dark:text-emerald-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Switch Role</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'border-forest text-forest dark:text-emerald-400'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Become a Member</span>
          </button>
        </div>

        {/* TAB 1: SIGN IN / SWITCH ROLE */}
        {activeTab === 'signin' && (
          <div className="space-y-4 pt-1">
            {/* Staff Level Access */}
            <div className="space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Staff & Operations Access
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    role === 'admin'
                      ? 'border-forest bg-forest/10 dark:bg-forest/20 ring-1 ring-forest'
                      : 'border-border/70 hover:border-forest/50 bg-card hover:bg-secondary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Shield className="w-4 h-4 text-forest dark:text-emerald-400" />
                    {role === 'admin' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-foreground">Admin</div>
                  <div className="text-[10px] text-muted-foreground">Full Authority & LMS</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('librarian')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    role === 'librarian'
                      ? 'border-forest bg-forest/10 dark:bg-forest/20 ring-1 ring-forest'
                      : 'border-border/70 hover:border-forest/50 bg-card hover:bg-secondary/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Library className="w-4 h-4 text-forest dark:text-emerald-400" />
                    {role === 'librarian' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-foreground">Librarian</div>
                  <div className="text-[10px] text-muted-foreground">Circulation & Desk</div>
                </button>
              </div>
            </div>

            {/* Patron / Member Access */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                  Patron / Member Accounts
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {members.filter((m) => m.status === 'active').length} Active
                </span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {members.map((m) => {
                  const isCurrent = role === 'member' && currentMember.id === m.id
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleRoleSelect('member', m.id)}
                      className={`p-2.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-forest bg-forest/10 dark:bg-forest/20'
                          : 'border-border/60 hover:bg-secondary/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center font-bold text-[11px] text-foreground">
                          {m.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <span>{m.fullName}</span>
                            {isCurrent && (
                              <Badge variant="outline" className="text-[9px] py-0 px-1.5 bg-forest text-white">
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground">
                            {m.memberCode} • {m.activeLoansCount}/{m.maxBorrowLimit} Loans
                          </div>
                        </div>
                      </div>

                      <Button
                        variant={isCurrent ? 'secondary' : 'ghost'}
                        size="sm"
                        className="text-[11px] h-7"
                      >
                        {isCurrent ? 'Signed In' : 'Sign In'}
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BECOME A MEMBER (SIGN UP) */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5 pt-1">
            {successMsg ? (
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  {successMsg}
                </div>
                <div className="text-[10px] text-muted-foreground">Redirecting to member view...</div>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0" />
                  <span>
                    Patron registration grants access to online borrowing requests, search catalogs, and reservation holds.
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-muted-foreground mb-1 block">
                    Full Name *
                  </label>
                  <Input
                    placeholder="e.g. Eleanor Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase text-muted-foreground mb-1 block">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="eleanor@archive.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase text-muted-foreground mb-1 block">
                      Phone Number
                    </label>
                    <Input
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-muted-foreground mb-1 block">
                    Address / Institution
                  </label>
                  <Input
                    placeholder="12 University Place, Suite 4"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onClose} className="text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-forest hover:bg-forest/90 text-white text-xs gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" />
                    Create Member Account
                  </Button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </Modal>
  )
}
