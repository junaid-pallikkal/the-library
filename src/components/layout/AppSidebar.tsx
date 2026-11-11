import React from 'react'
import { useLibrary } from '@/lib/libraryState'
import type { UserRole } from '@/types/library'
import {
  Sparkles,
  BookOpen,
  Users,
  Library,
  BarChart3,
  Plus,
  ArrowRightLeft,
  Shield,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AppSidebarProps {
  currentView: 'shelf' | 'catalog' | 'portal' | 'dashboard' | 'analytics'
  onNavigate: (view: 'shelf' | 'catalog' | 'portal' | 'dashboard' | 'analytics') => void
  onOpenNewBook: () => void
  onOpenIssue: () => void
  isOpen: boolean
  onToggle: () => void
  isMobileOpen?: boolean
  onCloseMobile?: () => void
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onNavigate,
  onOpenNewBook,
  onOpenIssue,
  isOpen,
  onToggle,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { role, setRole, books, stats } = useLibrary()

  const roles: { id: UserRole; label: string; icon: React.ReactNode }[] = [
    { id: 'admin', label: 'Admin', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'librarian', label: 'Librarian', icon: <Library className="w-3.5 h-3.5" /> },
    { id: 'member', label: 'Member', icon: <Users className="w-3.5 h-3.5" /> },
  ]

  const navItems: {
    id: 'shelf' | 'catalog' | 'portal' | 'dashboard' | 'analytics'
    label: string
    sublabel: string
    icon: React.ReactNode
    badge?: string | number
  }[] = [
    {
      id: 'shelf',
      label: '3D Archive Shelf',
      sublabel: 'Kinetic Rare Editions',
      icon: <Sparkles className="w-4 h-4" />,
      badge: `${books.length} Vol`,
    },
    {
      id: 'catalog',
      label: role === 'member' ? 'Search & Request Books' : 'Bibliographic Catalog',
      sublabel: role === 'member' ? 'Browse & Request Borrowing' : 'Search & Faceted Filters',
      icon: <BookOpen className="w-4 h-4" />,
      badge: stats.availableCopies,
    },
    {
      id: 'portal',
      label: 'Member Portal',
      sublabel: 'Loans, Dues & Holds',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'dashboard',
      label: 'LMS Operations',
      sublabel: 'Desk & Physical Copies',
      icon: <Library className="w-4 h-4" />,
      badge: stats.overdueLoans > 0 ? `${stats.overdueLoans} Due` : undefined,
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      sublabel: 'Telemetry & CSV Export',
      icon: <BarChart3 className="w-4 h-4" />,
    },
  ]

  // Enforce Member RBAC: members only have access to 3D shelf, searching/requesting books, and portal
  const visibleNavItems =
    role === 'member'
      ? navItems.filter((i) => i.id === 'shelf' || i.id === 'catalog' || i.id === 'portal')
      : navItems

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Floating Toggle Button when Sidebar is closed on Desktop */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="hidden lg:flex fixed top-4 left-4 z-40 items-center gap-2 px-3 py-2 rounded-lg bg-card/90 hover:bg-card border border-border/70 shadow-md backdrop-blur-md text-xs font-semibold text-foreground transition-all duration-300 hover:scale-105"
          title="Open Sidebar"
        >
          <PanelLeftOpen className="w-4 h-4 text-forest" />
          <span>Menu</span>
        </button>
      )}

      {/* Sidebar Container with Smooth Moving Slide Transition */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 bg-card border-r border-border/60 flex flex-col justify-between transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] shadow-xl lg:shadow-none ${
          // Desktop toggle
          isOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'
        } ${
          // Mobile toggle
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Brand Header with Close/Collapse Toggle */}
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <div
            onClick={() => {
              onNavigate('shelf')
              onCloseMobile?.()
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-forest text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              L
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-foreground leading-none">
                The Library
              </div>
              <div className="text-[9px] font-mono tracking-wider text-muted-foreground uppercase mt-0.5">
                Archival Ecosystem
              </div>
            </div>
          </div>

          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            className="hidden lg:flex text-muted-foreground hover:text-foreground"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </Button>

          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onCloseMobile}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        </div>

        {/* Middle: Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Views */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
              Navigation
            </div>

            {visibleNavItems.map((item) => {
              const active = currentView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id)
                    onCloseMobile?.()
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-forest text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <span
                      className={`${
                        active ? 'text-white' : 'text-forest dark:text-emerald-400'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <div>
                      <div className="leading-tight">{item.label}</div>
                      <div
                        className={`text-[10px] font-normal leading-tight mt-0.5 ${
                          active ? 'text-white/80' : 'text-muted-foreground'
                        }`}
                      >
                        {item.sublabel}
                      </div>
                    </div>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        active
                          ? 'bg-white/20 text-white'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Quick Desk Actions for Staff */}
          {role !== 'member' && (
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-mono">
                Circulation Actions
              </div>

              <div className="grid grid-cols-2 gap-2 px-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onOpenIssue()
                    onCloseMobile?.()
                  }}
                  className="w-full text-[11px] h-8 gap-1.5 justify-center bg-card hover:bg-forest hover:text-white transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Checkout
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    onOpenNewBook()
                    onCloseMobile?.()
                  }}
                  className="w-full bg-forest hover:bg-forest/90 text-white text-[11px] h-8 gap-1 justify-center"
                >
                  <Plus className="w-3.5 h-3.5" /> New Title
                </Button>
              </div>
            </div>
          )}

          {/* Live Floor Occupancy & Health Widget (Flat layout) */}
          {role !== 'member' ? (
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-forest dark:text-emerald-400" /> Facility Telemetry
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Holdings on Loan:</span>
                  <span className="font-mono font-bold text-foreground">
                    {stats.borrowedCopies} / {stats.totalPhysicalCopies}
                  </span>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-forest rounded-full"
                    style={{
                      width: `${stats.totalPhysicalCopies > 0 ? (stats.borrowedCopies / stats.totalPhysicalCopies) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/30">
                <span>Active Overdue:</span>
                <span
                  className={`font-mono font-bold ${
                    stats.overdueLoans > 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {stats.overdueLoans}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-forest/10 dark:bg-forest/20 border border-forest/30 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-forest dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Patron Privileges
                </span>
                <Badge variant="outline" className="text-[9px] bg-forest text-white py-0 px-1.5">
                  Active
                </Badge>
              </div>

              <div className="space-y-1 text-[11px] text-muted-foreground">
                <div className="flex justify-between">
                  <span>Borrowing Limit:</span>
                  <span className="font-mono font-bold text-foreground">5 Books Max</span>
                </div>
                <div className="flex justify-between">
                  <span>Loan Period:</span>
                  <span className="font-mono font-bold text-foreground">14 Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Reserve Holds:</span>
                  <span className="font-mono font-bold text-foreground">Available</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom: Role Simulator & Patron Context */}
        <div className="p-4 border-t border-border/40 bg-secondary/30 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-mono font-semibold">Simulated Role:</span>
            <Badge
              variant="outline"
              className="text-[10px] font-mono uppercase bg-forest/10 text-forest border-forest/30"
            >
              {role}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border/60">
            {roles.map((r) => {
              const active = role === r.id
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`py-1 text-[10px] font-bold rounded-md transition-all ${
                    active
                      ? 'bg-forest text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
        </div>
      </aside>
    </>
  )
}
