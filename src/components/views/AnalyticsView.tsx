import React from 'react'
import { useLibrary } from '@/lib/libraryState'
import { FlatCard } from '@/components/common/FlatCard'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Download, TrendingUp, BookOpen, AlertCircle, BarChart3 } from 'lucide-react'

export const AnalyticsView: React.FC = () => {
  const { books, borrowings, members, auditLogs, stats } = useLibrary()

  // 1. Monthly circulation chart data (Borrowings vs Returns)
  const circulationData = [
    { month: 'Jun', borrowings: 18, returns: 14 },
    { month: 'Jul', borrowings: 24, returns: 20 },
    { month: 'Aug', borrowings: 31, returns: 28 },
    { month: 'Sep', borrowings: 42, returns: 37 },
    { month: 'Oct', borrowings: 48, returns: 44 },
    { month: 'Nov (Current)', borrowings: borrowings.length + 12, returns: 8 },
  ]

  // 2. Category Distribution
  const categoryMap: Record<string, number> = {}
  books.forEach((b) => {
    categoryMap[b.category] = (categoryMap[b.category] || 0) + 1
  })
  const categoryData = Object.entries(categoryMap).map(([name, count]) => ({
    name,
    value: count,
  }))

  // 3. Condition breakdown of all physical copies
  let excellent = 0
  let good = 0
  let fair = 0
  let damaged = 0

  books.forEach((b) => {
    b.copies?.forEach((c) => {
      if (c.condition === 'excellent') excellent++
      else if (c.condition === 'good') good++
      else if (c.condition === 'fair') fair++
      else if (c.condition === 'damaged') damaged++
    })
  })

  const conditionData = [
    { name: 'Excellent', count: excellent, color: '#166534' },
    { name: 'Good', count: good, color: '#1B382B' },
    { name: 'Fair', count: fair, color: '#B45309' },
    { name: 'Damaged (Repair)', count: damaged, color: '#B91C1C' },
  ]

  const PIE_COLORS = ['#1B382B', '#1F3FB0', '#8B4513', '#9A3412', '#2D4A22', '#1E293B']

  // CSV Export Handlers
  const exportCatalogCSV = () => {
    const headers = ['ID', 'Title', 'Author', 'Category', 'ISBN', 'Year', 'TotalCopies', 'AvailableCopies', 'Shelf']
    const rows = books.map((b) => [
      b.id,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.author.replace(/"/g, '""')}"`,
      `"${b.category}"`,
      b.isbn,
      b.publicationYear,
      b.totalCopies,
      b.availableCopies,
      `"${b.shelfLocation}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `the_library_catalog_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportCirculationCSV = () => {
    const headers = ['LoanID', 'BookTitle', 'Barcode', 'MemberName', 'MemberCode', 'BorrowedAt', 'DueDate', 'Status']
    const rows = borrowings.map((b) => [
      b.id,
      `"${b.bookTitle.replace(/"/g, '""')}"`,
      b.barcode,
      `"${b.memberName.replace(/"/g, '""')}"`,
      b.memberCode,
      b.borrowedAt,
      b.dueDate,
      b.status,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `the_library_circulation_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportAuditCSV = () => {
    const headers = ['ID', 'Actor', 'Role', 'Action', 'EntityType', 'Details', 'Timestamp']
    const rows = auditLogs.map((a) => [
      a.id,
      `"${a.actorName}"`,
      a.actorRole,
      a.action,
      a.entityType,
      `"${a.details.replace(/"/g, '""')}"`,
      a.timestamp,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `the_library_audit_log_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const collectionUtilization =
    stats.totalPhysicalCopies > 0
      ? Math.round((stats.borrowedCopies / stats.totalPhysicalCopies) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-forest" />
            Operational Analytics & Compliance Reporting
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Realtime circulation telemetry, inventory health metrics, and audit exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={exportCatalogCSV}
            className="text-xs gap-1.5 h-8"
          >
            <Download className="w-3.5 h-3.5" /> Export Catalog CSV
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={exportCirculationCSV}
            className="text-xs gap-1.5 h-8"
          >
            <Download className="w-3.5 h-3.5" /> Export Loans CSV
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={exportAuditCSV}
            className="text-xs gap-1.5 h-8"
          >
            <Download className="w-3.5 h-3.5" /> Export Audit CSV
          </Button>
        </div>
      </div>

      {/* High-level KPI Row (Flat cards only) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FlatCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-bold uppercase tracking-wider">Utilization Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {collectionUtilization}%
          </div>
          <p className="text-[11px] text-muted-foreground">
            {stats.borrowedCopies} of {stats.totalPhysicalCopies} physical copies currently on loan
          </p>
        </FlatCard>

        <FlatCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-bold uppercase tracking-wider">Circulation Velocity</span>
            <BookOpen className="w-4 h-4 text-forest" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {(stats.borrowedCopies / Math.max(1, members.length)).toFixed(2)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Average active loans per registered member
          </p>
        </FlatCard>

        <FlatCard className="p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-bold uppercase tracking-wider">Overdue Risk Exposure</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {stats.overdueLoans} Items
          </div>
          <p className="text-[11px] text-muted-foreground">
            Items past standard 14-day checkout window
          </p>
        </FlatCard>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Circulation Bar Chart */}
        <FlatCard className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Monthly Circulation Volume
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Borrowings vs. returns velocity across recent months
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={circulationData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" fontSize={11} stroke="#888" />
                <YAxis fontSize={11} stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="borrowings" fill="#1B382B" name="Borrowings" radius={[3, 3, 0, 0]} />
                <Bar dataKey="returns" fill="#4B7B64" name="Returns" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FlatCard>

        {/* Category Breakdown Chart */}
        <FlatCard className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Archival Category Distribution
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Proportion of catalog titles by literary genre
              </p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </FlatCard>

        {/* Physical Copy Condition Distribution */}
        <FlatCard className="p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Physical Inventory Condition Audit
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Preservation ratings across all {stats.totalPhysicalCopies} registered physical copies
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {conditionData.map((cond) => (
              <div
                key={cond.name}
                className="p-3 bg-secondary/40 rounded-lg border border-border/40 text-xs space-y-1"
              >
                <div className="text-muted-foreground text-[11px]">{cond.name}</div>
                <div className="text-xl font-bold font-mono text-foreground">
                  {cond.count} Copies
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${stats.totalPhysicalCopies > 0 ? (cond.count / stats.totalPhysicalCopies) * 100 : 0}%`,
                      backgroundColor: cond.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </FlatCard>
      </div>
    </div>
  )
}
