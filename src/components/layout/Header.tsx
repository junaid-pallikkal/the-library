import React, { useState } from 'react'
import { useLibrary } from '@/lib/libraryState'
import {
  Shield,
  Users,
  Library,
  ArrowRightLeft,
  Plus,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  LogIn,
  UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationDrawer } from '@/components/layout/NotificationDrawer'

interface HeaderProps {
  currentView: 'shelf' | 'catalog' | 'portal' | 'dashboard' | 'analytics'
  onNavigate: (view: 'shelf' | 'catalog' | 'portal' | 'dashboard' | 'analytics') => void
  onOpenNewBook: () => void
  onOpenIssue: () => void
  onOpenAuth: () => void
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
  onOpenMobileSidebar?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  onOpenNewBook,
  onOpenIssue,
  onOpenAuth,
  isSidebarOpen = true,
  onToggleSidebar,
  onOpenMobileSidebar,
}) => {
  const { role, currentMember, borrowings, requests, reservations } = useLibrary()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const overdueCount = borrowings.filter((b) => b.status === 'overdue').length
  const pendingCount = requests.filter((r) => r.status === 'pending').length
  const holdCount = reservations.filter((r) => r.status === 'allocated').length
  const totalNotifs = overdueCount + pendingCount + holdCount

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-paper/90 dark:bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Sidebar Toggles & Brand */}
          <div className="flex items-center gap-2">
            {onOpenMobileSidebar && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onOpenMobileSidebar}
                className="lg:hidden text-foreground hover:bg-secondary mr-1 cursor-pointer"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}

            {onToggleSidebar && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onToggleSidebar}
                className="hidden lg:flex text-muted-foreground hover:text-foreground hover:bg-secondary mr-1 transition-transform cursor-pointer"
                title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="w-4 h-4 text-forest dark:text-emerald-400" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4 text-forest dark:text-emerald-400" />
                )}
              </Button>
            )}

            <div
              onClick={() => onNavigate('shelf')}
              className="cursor-pointer flex items-center gap-3 shrink-0 group"
            >
              <div className="w-8 h-8 rounded-md bg-forest text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                L
              </div>
              <div>
                <div className="text-sm font-bold tracking-widest uppercase text-foreground leading-none">
                  The Library
                </div>
                <div className="text-[10px] font-mono tracking-wider text-muted-foreground uppercase mt-0.5">
                  Digital Archives & LMS
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Actions, Notifications & Identity/Auth Gateway */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Circulation Quick Actions (Staff Only: Admin & Librarian) */}
            {role !== 'member' && (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onOpenIssue}
                  className="text-xs h-8 gap-1.5 bg-card hover:bg-forest hover:text-white transition-colors border-border/80 cursor-pointer"
                  title="Issue physical volume loan"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Desk Checkout</span>
                </Button>

                <Button
                  size="sm"
                  onClick={onOpenNewBook}
                  className="bg-forest hover:bg-forest/90 text-white text-xs h-8 gap-1.5 shadow-xs cursor-pointer"
                  title="Accession new volume into catalog"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Title</span>
                </Button>
              </div>
            )}

            {/* Notification Bell with Live Counter */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsNotificationsOpen(true)}
              className="relative text-foreground hover:bg-secondary cursor-pointer"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              {totalNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              )}
            </Button>

            {/* Identity & Account Pill / Login & Sign Up Trigger */}
            <div className="flex items-center gap-1.5 pl-1 border-l border-border/60">
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/70 bg-card hover:bg-secondary/60 text-xs transition-all cursor-pointer shadow-xs group"
                title="Manage identity, switch role, or register patron account"
              >
                {role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5 text-forest dark:text-emerald-400 shrink-0" />
                ) : role === 'librarian' ? (
                  <Library className="w-3.5 h-3.5 text-forest dark:text-emerald-400 shrink-0" />
                ) : (
                  <Users className="w-3.5 h-3.5 text-forest dark:text-emerald-400 shrink-0" />
                )}

                <div className="text-left hidden sm:block">
                  <div className="text-[11px] font-bold leading-tight text-foreground group-hover:text-forest transition-colors">
                    {role === 'admin'
                      ? 'Admin'
                      : role === 'librarian'
                      ? 'Librarian'
                      : currentMember.fullName.split(' ')[0]}
                  </div>
                  <div className="text-[9px] font-mono text-muted-foreground uppercase leading-none">
                    {role === 'member' ? currentMember.memberCode : 'Staff'}
                  </div>
                </div>

                <span className="text-[10px] text-muted-foreground underline pl-1 hidden md:inline">
                  Switch
                </span>
              </button>

              {role !== 'member' ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onOpenAuth}
                  className="hidden xl:flex text-xs h-8 text-forest dark:text-emerald-400 hover:bg-forest/10 cursor-pointer gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Join as Patron</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onOpenAuth}
                  className="hidden xl:flex text-xs h-8 text-forest dark:text-emerald-400 hover:bg-forest/10 cursor-pointer gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Staff Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Notification Drawer Modal */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  )
}
