import React from 'react'
import { useLibrary } from '@/lib/libraryState'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, AlertTriangle, CheckCircle2, Bookmark, Clock } from 'lucide-react'

interface NotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { borrowings, requests, reservations } = useLibrary()

  const overdueItems = borrowings.filter((b) => b.status === 'overdue')
  const pendingReqs = requests.filter((r) => r.status === 'pending')
  const allocatedHolds = reservations.filter((r) => r.status === 'allocated')

  const totalNotifications =
    overdueItems.length + pendingReqs.length + allocatedHolds.length

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 gap-5 bg-card">
        <DialogHeader className="pb-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-forest" />
              Operational Notices
            </DialogTitle>
            <Badge variant="outline" className="text-xs">
              {totalNotifications} Alerts
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            System notices, overdue warnings, and circulation hold events.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {/* Overdue Warnings */}
          {overdueItems.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-red-700 dark:text-red-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Overdue Circulation
                </span>
                <span className="font-mono text-[11px]">{item.dueDate}</span>
              </div>
              <p className="text-foreground/90 font-medium">
                &ldquo;{item.bookTitle}&rdquo; is past its due date.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Borrower: {item.memberName} ({item.memberCode}) • Barcode: {item.barcode}
              </p>
            </div>
          ))}

          {/* Pending Approval Requests */}
          {pendingReqs.map((req) => (
            <div
              key={req.id}
              className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Borrow Request Pending
                </span>
                <span className="text-[10px] uppercase font-mono">{req.requestType}</span>
              </div>
              <p className="text-foreground/90 font-medium">
                {req.memberName} requested &ldquo;{req.bookTitle}&rdquo;.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Requires staff authorization at the circulation desk.
              </p>
            </div>
          ))}

          {/* Allocated Reservation Holds */}
          {allocatedHolds.map((res) => (
            <div
              key={res.id}
              className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4" /> Reservation Ready
                </span>
                <span className="text-[10px] font-mono">48h Hold Active</span>
              </div>
              <p className="text-foreground/90 font-medium">
                Physical copy ready for {res.memberName}.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Book: &ldquo;{res.bookTitle}&rdquo; has been set aside at the desk.
              </p>
            </div>
          ))}

          {totalNotifications === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-60" />
              <span>All circulation records and member queues are clear.</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-border/40 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Dismiss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
