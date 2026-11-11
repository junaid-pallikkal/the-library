import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { Book } from '@/types/library'
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  BookmarkPlus,
  CheckCircle2,
  Clock,
  Sparkles,
  RotateCcw,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Tactile3DShelfProps {
  books: Book[]
  onSelectBook: (book: Book) => void
  onInspectBook: (book: Book) => void
  onRequestBorrow?: (bookId: string) => void
  onReserve?: (bookId: string) => void
}

export const Tactile3DShelf: React.FC<Tactile3DShelfProps> = ({
  books,
  onSelectBook,
  onInspectBook,
  onRequestBorrow,
  onReserve,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Fluid 2nd-order damped harmonic physics engine
  const [scrollPos, setScrollPos] = useState(0)
  const targetPosRef = useRef(0)
  const velocityRef = useRef(0)
  const currentPosRef = useRef(0)

  // Selection & UI controls
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredVirtualIdx, setHoveredVirtualIdx] = useState<number | null>(null)
  const [isInspectorOpen, setIsInspectorOpen] = useState(true)
  const showVolumeDetails = true

  // Fluid mouse perspective tilt tracking with 2nd-order spring lag
  const mouseTargetRef = useRef({ x: 0, y: 0, isOverCover: false })
  const [smoothTilt, setSmoothTilt] = useState({ x: 0, y: 0 })

  // Drag interaction state
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragStartTarget = useRef(0)
  const dragPositions = useRef<{ x: number; time: number }[]>([])

  // 3 copies to create an endless wrapping archival shelf
  const copyCount = 3
  const virtualCount = books.length * copyCount

  // Physical 3D Book Geometry Dimensions (Shared common coordinate origin)
  // Hardcover book proportions: Width W = 205px, Height H = 295px, Thickness T = 44px
  const T = 44 // Book Thickness / Spine Width (px)
  const H = 295 // Book Height (px)
  const W = 205 // Book Cover Width / Depth (px)
  const gap = 18 // Spacing between volumes on the shelf

  const updateTargetPos = useCallback((newTarget: number | ((prev: number) => number)) => {
    const val = typeof newTarget === 'function' ? newTarget(targetPosRef.current) : newTarget
    targetPosRef.current = val
  }, [])

  // High-performance 2nd-order Spring Physics Loop (Semi-implicit Euler)
  useEffect(() => {
    let animId: number
    let lastTime = performance.now()

    const updatePhysics = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.04)
      lastTime = now

      if (!isDragging) {
        // Natural frequency omega (rad/s) and critically tuned damping ratio zeta
        const omega = 7.6
        const zeta = 0.94 // Silky organic ease-out with physical micro-settle

        const displacement = currentPosRef.current - targetPosRef.current
        const springForce = -(omega * omega) * displacement
        const dampingForce = -(2 * zeta * omega) * velocityRef.current
        const accel = springForce + dampingForce

        velocityRef.current += accel * dt
        currentPosRef.current += velocityRef.current * dt

        if (Math.abs(displacement) < 0.0002 && Math.abs(velocityRef.current) < 0.0005) {
          currentPosRef.current = targetPosRef.current
          velocityRef.current = 0
        }
      } else {
        // Direct tracking during touch/drag with soft lag
        const diff = targetPosRef.current - currentPosRef.current
        currentPosRef.current += diff * (1 - Math.exp(-28 * dt))
        velocityRef.current = diff / (dt || 0.016)
      }

      setScrollPos(currentPosRef.current)

      // Dynamic mouse tilt lag with organic spring damping
      setSmoothTilt((prev) => {
        const isHover = mouseTargetRef.current.isOverCover
        const targetX = isHover ? mouseTargetRef.current.y * -8.0 : 0
        const targetY = isHover ? mouseTargetRef.current.x * 11.0 : 0
        const springK = 7.0
        return {
          x: prev.x + (targetX - prev.x) * (1 - Math.exp(-springK * dt)),
          y: prev.y + (targetY - prev.y) * (1 - Math.exp(-springK * dt)),
        }
      })

      animId = requestAnimationFrame(updatePhysics)
    }

    animId = requestAnimationFrame(updatePhysics)
    return () => cancelAnimationFrame(animId)
  }, [isDragging])

  // Sync active book when rounded position shifts
  useEffect(() => {
    const rawIdx = Math.round(scrollPos) % books.length
    const normalizedIdx = (rawIdx + books.length) % books.length
    if (normalizedIdx !== activeIndex && books[normalizedIdx]) {
      setActiveIndex(normalizedIdx)
      onSelectBook(books[normalizedIdx])
    }
  }, [scrollPos, books, activeIndex, onSelectBook])

  // Mouse tilt tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width - 0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5

    const isCenter = Math.abs(relX) < 0.32 && Math.abs(relY) < 0.45
    mouseTargetRef.current = {
      x: relX * 2,
      y: relY * 2,
      isOverCover: isCenter,
    }
  }

  const handleMouseLeave = () => {
    mouseTargetRef.current = { x: 0, y: 0, isOverCover: false }
    setHoveredVirtualIdx(null)
  }

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        updateTargetPos((t) => Math.round(t) - 1)
      } else if (e.key === 'ArrowRight') {
        updateTargetPos((t) => Math.round(t) + 1)
      } else if (e.key === 'Enter') {
        if (books[activeIndex]) {
          onInspectBook(books[activeIndex])
        }
      }
    },
    [activeIndex, books, onInspectBook, updateTargetPos]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Wheel scrubbing with natural momentum
  const handleWheel = (e: React.WheelEvent) => {
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(delta) > 3) {
      updateTargetPos((t) => t + (delta > 0 ? 0.35 : -0.35))
    }
  }

  // Drag interaction with kinetic throw velocity
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    dragStartX.current = e.clientX
    dragStartTarget.current = targetPosRef.current
    dragPositions.current = [{ x: e.clientX, time: performance.now() }]
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragStartX.current
    const step = dx / 90 // 90px drag per book unit
    updateTargetPos(dragStartTarget.current - step)

    const now = performance.now()
    dragPositions.current.push({ x: e.clientX, time: now })
    if (dragPositions.current.length > 5) {
      dragPositions.current.shift()
    }
  }

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false)

      // Calculate throw momentum from recent touch velocity
      let throwVelocity = 0
      if (dragPositions.current.length >= 2) {
        const first = dragPositions.current[0]
        const last = dragPositions.current[dragPositions.current.length - 1]
        const dt = (last.time - first.time) / 1000
        if (dt > 0.01) {
          const speedPxPerSec = (last.x - first.x) / dt
          throwVelocity = -speedPxPerSec / 550
        }
      }

      // Smoothly snap to nearest integer + velocity throw
      const rawTarget = targetPosRef.current + Math.max(-1.5, Math.min(1.5, throwVelocity))
      updateTargetPos(Math.round(rawTarget))
    }
  }

  // Navigation jump actions
  const prevBook = () => updateTargetPos((t) => Math.round(t) - 1)
  const nextBook = () => updateTargetPos((t) => Math.round(t) + 1)
  const jumpToBook = (idx: number) => {
    const currentLoop = Math.floor(scrollPos / books.length)
    updateTargetPos(currentLoop * books.length + idx)
  }

  // Full reset to volume 0 and initial state
  const handleReset = () => {
    jumpToBook(0)
    mouseTargetRef.current = { x: 0, y: 0, isOverCover: false }
    setSmoothTilt({ x: 0, y: 0 })
  }

  const activeBook = books[activeIndex] || books[0]

  // Category clean classification tag generator
  const getCategoryCode = (category: string) => {
    if (/literary/i.test(category)) return 'LIT • 813'
    if (/romance|historical/i.test(category)) return 'HIST • 940'
    if (/philosophy/i.test(category)) return 'PHIL • 100'
    if (/mystery|noir/i.test(category)) return 'MYST • 823'
    if (/western/i.test(category)) return 'WEST • 813'
    if (/science|sci-fi/i.test(category)) return 'SCI • 500'
    return category.slice(0, 4).toUpperCase()
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      className="relative w-full select-none"
    >
      {/* ========================================================================= */}
      {/* 1. TOP TIMELINE NAVIGATION: Synchronized Pills & Shelf Controls          */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 px-1">
        {/* Horizontal Scrollable Book Selector Pills (Full Title, No Truncation) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 w-full sm:w-auto scrollbar-none">
          {books.map((b, i) => {
            const isActive = i === activeIndex
            return (
              <button
                key={b.id}
                onClick={() => jumpToBook(i)}
                className={`px-3.5 py-1.5 text-xs rounded-full border transition-all duration-300 whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-forest text-white border-forest shadow-md scale-102 ring-2 ring-forest/25 font-bold'
                    : 'bg-card text-muted-foreground border-border/70 hover:border-forest/40 hover:text-foreground hover:bg-secondary/60 font-medium'
                }`}
                title={`Select ${b.title} (${b.publicationYear})`}
              >
                <span className="font-mono text-[11px] opacity-90">{b.publicationYear}</span>
                <span className="opacity-40">•</span>
                <span className="font-serif tracking-tight">{b.title}</span>
              </button>
            )
          })}
        </div>

        {/* Global Toolbar Controls: Reset & Toggle Volume Info */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs h-8 gap-1.5 bg-card hover:bg-secondary border-border/70"
            title="Reset bookshelf to initial volume"
          >
            <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Reset</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className="text-xs h-8 gap-1.5 bg-card hover:bg-secondary border-border/70"
            title={isInspectorOpen ? 'Hide inspection card' : 'Open inspection card'}
          >
            {isInspectorOpen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
                <span>Collapse Inspector</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-forest dark:text-emerald-400" />
                <span>Bibliographic Inspect</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEDICATED LAYOUT: 3D SHELF STAGE + SEPARATE DOCKED INSPECTOR PANEL     */}
      {/* ========================================================================= */}
      <div
        className={`w-full grid transition-all duration-500 gap-5 items-start ${
          isInspectorOpen
            ? 'grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]'
            : 'grid-cols-1'
        }`}
      >
        {/* ======================================================================= */}
        {/* LEFT COLUMN: 3D PERSPECTIVE BOOKSHELF STAGE                            */}
        {/* ======================================================================= */}
        <div className="relative w-full rounded-2xl border border-border/60 bg-gradient-to-b from-paper/60 via-card/40 to-paper/80 dark:from-zinc-950/60 dark:via-zinc-900/40 dark:to-zinc-950/80 p-2 sm:p-4 overflow-hidden shadow-xs min-h-[440px] md:min-h-[480px] flex flex-col justify-between">
          {/* 3D Perspective Canvas Container */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-full h-[400px] md:h-[430px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
            style={{
              perspective: '2000px',
              perspectiveOrigin: '50% 48%',
            }}
          >
            {/* Archival Polished Hardwood Shelf Rail with Brass Bevel */}
            <div className="absolute top-[82%] w-[94%] max-w-4xl h-6 bg-gradient-to-r from-stone-400 via-stone-200 to-stone-400 dark:from-stone-900 dark:via-stone-700 dark:to-stone-900 rounded-sm shadow-lg border-t border-white/50 dark:border-white/10 pointer-events-none">
              <div className="w-full h-1 bg-black/25 shadow-inner" />
              <div className="w-full h-0.5 bg-yellow-600/25" />
            </div>

            {/* Deep Ambient Floor Drop Shadow */}
            <div className="absolute top-[84%] w-[88%] max-w-3xl h-14 bg-black/20 dark:bg-black/60 blur-2xl rounded-full pointer-events-none" />

            {/* 3D Preserved Shelf Container (Holds All Physical Book Objects) */}
            <div className="relative preserve-3d flex items-center justify-center">
              {Array.from({ length: virtualCount }).map((_, vIdx) => {
                const bIdx = vIdx % books.length
                const book = books[bIdx]

                // Relative continuous index r to current scroll float
                const r = vIdx - (scrollPos + books.length)

                // Culling distant books out of viewport
                if (Math.abs(r) > 6.8) return null

                // Smoothstep spacing B(r): continuous non-jumping separation for active book
                const B =
                  Math.abs(r) < 1
                    ? (r + Math.sin(Math.PI * r) / Math.PI) / 2
                    : r > 0
                    ? 0.5
                    : -0.5

                // Symmetrical horizontal offset: active turned book gets ample breathing space
                const posX = r * (T + gap) + (W - T + 1.8 * gap) * B

                // Openness factor (1 = active cover facing viewer, 0 = on shelf spine-out)
                const dist = Math.max(0, 1 - Math.abs(r))
                const openness = dist * dist * (3 - 2 * dist) // Smooth cubic hermite curve

                // Subtle hover lift on unselected shelf spines
                const isHovered = hoveredVirtualIdx === vIdx && openness < 0.4
                const liftY = openness * -24 + (isHovered ? -18 : 0)

                // Dynamic inertial sway during motion
                const swayZ = Math.max(-3.0, Math.min(3.0, velocityRef.current * -0.4 * (1 - openness)))

                // Physical Hardcover Rotation:
                // Rest position on shelf: Spine faces camera (+Z).
                // Front cover is on the LEFT (-X, facing -X).
                // Back cover is on the RIGHT (+X, facing +X).
                // Fore-edge (pages) is at the back (-Z, facing -Z).
                // When pulled out (openness -> 1):
                // Rotate around Y by +78 degrees (with slight mouse parallax).
                // The front cover turns towards the viewer!
                // The spine rotates to the LEFT edge (-X), securely bound to the front cover!
                // The inner page block (fore-edge) rotates to the RIGHT edge (+X)!
                // The back cover rotates behind the book (-Z)!
                const targetRotY = openness * 78 + (openness > 0.25 ? smoothTilt.y * openness : 0)
                const rotX = (openness > 0.25 ? smoothTilt.x * openness : 0) + openness * 3.0
                const rotZ = -3.2 * openness + swayZ
                const transZ = openness * 145

                // Dynamic Shading: spine darkens as it folds inward; cover brightens as it turns outward
                const spineShade = openness * 0.55
                const coverShade = (1 - openness) * 0.45

                return (
                  <div
                    key={vIdx}
                    onMouseEnter={() => setHoveredVirtualIdx(vIdx)}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (openness > 0.8) {
                        onInspectBook(book)
                      } else {
                        updateTargetPos((t) => Math.round(t + r))
                      }
                    }}
                    className="absolute top-1/2 left-1/2 preserve-3d cursor-pointer"
                    style={{
                      width: `${T}px`,
                      height: `${H}px`,
                      transform: `translate(-50%, -50%) translate3d(${posX}px, ${liftY}px, ${transZ}px) rotateZ(${rotZ}deg) rotateX(${rotX}deg) rotateY(${targetRotY}deg)`,
                      zIndex: Math.round(100 - Math.abs(r) * 10),
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* Physical Shelf Contact Shadow */}
                    <div
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 blur-md pointer-events-none transition-all"
                      style={{
                        width: `${openness > 0.5 ? W * 0.95 : T * 1.2}px`,
                        height: `${openness > 0.5 ? 24 : 12}px`,
                        opacity: 0.3 + openness * 0.4,
                        transform: `translateZ(-15px) rotateX(90deg)`,
                      }}
                    />

                    {/* =================================================================== */}
                    {/* 1. PHYSICAL BOUND ARCHIVAL SPINE (Spine faces +Z on shelf)          */}
                    {/* Centered at Z = +W/2. When rotated +78deg, sits at the LEFT of cover*/}
                    {/* =================================================================== */}
                    <div
                      className="absolute inset-0 backface-hidden rounded-xs flex flex-col justify-between overflow-hidden book-spine-lighting shadow-2xl border-r border-black/40"
                      style={{
                        width: `${T}px`,
                        height: `${H}px`,
                        transform: `translate3d(0, 0, ${W / 2}px)`,
                        backgroundColor: book.coverColor,
                        color: '#FAF8F5',
                      }}
                    >
                      {/* Dynamic Spine Shading Filter Overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none bg-black transition-opacity duration-150"
                        style={{ opacity: spineShade }}
                      />

                      {/* Top Silk Two-Tone Chevron Headband */}
                      <div className="relative z-10 w-full h-2.5 bg-[repeating-linear-gradient(45deg,#d4af37,#d4af37_3px,#1b382b_3px,#1b382b_6px)] shadow-xs" />

                      {/* Raised Embossed Rib 1 */}
                      <div className="relative z-10 mx-1 h-1.5 raised-rib rounded-xs" />

                      {/* Top Category Block in Gold Foil Monogram */}
                      <div className="relative z-10 text-[8.5px] uppercase font-bold tracking-widest text-center font-mono gold-foil-text px-1">
                        {getCategoryCode(book.category)}
                      </div>

                      {/* Raised Embossed Rib 2 */}
                      <div className="relative z-10 mx-1 h-1.5 raised-rib rounded-xs" />

                      {/* Centered Spine Title: Pristine Vertical Typographic Stamp */}
                      <div className="relative z-10 flex-1 flex items-center justify-center my-1 px-0.5 overflow-hidden">
                        <svg
                          viewBox="0 0 44 140"
                          className="w-10 h-32 select-none"
                          style={{ filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.9))' }}
                        >
                          <text
                            x="50%"
                            y="50%"
                            textAnchor="middle"
                            dominantBaseline="central"
                            transform="rotate(90 22 70)"
                            className="fill-[#FAF0CB] font-serif font-bold text-[10.5px] tracking-widest uppercase"
                          >
                            {book.title.length > 20 ? book.title.slice(0, 18) + '…' : book.title}
                          </text>
                        </svg>
                      </div>

                      {/* Raised Embossed Rib 3 */}
                      <div className="relative z-10 mx-1 h-1.5 raised-rib rounded-xs" />

                      {/* Archival Accession Call Label (Physical Paper Tag) */}
                      <div className="relative z-10 mx-1.5 py-1 px-1 rounded-xs accession-tag text-center space-y-0.5">
                        <div className="text-[8.5px] font-mono font-bold tracking-wider leading-none">
                          {book.publicationYear}
                        </div>
                        <div className="text-[7.5px] font-mono tracking-tighter uppercase font-semibold leading-none truncate opacity-90">
                          {book.author.split(' ').pop()}
                        </div>
                      </div>

                      {/* Raised Embossed Rib 4 */}
                      <div className="relative z-10 mx-1 h-1.5 raised-rib rounded-xs" />

                      {/* Bottom Silk Two-Tone Footband */}
                      <div className="relative z-10 w-full h-2.5 bg-[repeating-linear-gradient(45deg,#d4af37,#d4af37_3px,#1b382b_3px,#1b382b_6px)] shadow-xs" />
                    </div>

                    {/* =================================================================== */}
                    {/* 2. PHYSICAL FRONT COVER (On shelf at X = -T/2, facing -X)          */}
                    {/* When rotated +78deg, turns towards the viewer. Attached at spine.   */}
                    {/* =================================================================== */}
                    <div
                      className="absolute backface-hidden rounded-xs p-5 flex flex-col justify-between overflow-hidden shadow-2xl book-board-bevel"
                      style={{
                        width: `${W}px`,
                        height: `${H}px`,
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) translate3d(${-T / 2}px, 0, 0) rotateY(-90deg)`,
                        backgroundColor: book.coverColor,
                        color: '#FAF8F5',
                        boxShadow: `0 38px 75px -20px rgba(15, 12, 8, ${0.5 * openness + 0.15})`,
                      }}
                    >
                      {/* Dynamic Cover Shading Filter Overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none bg-black transition-opacity duration-150"
                        style={{ opacity: coverShade }}
                      />

                      {/* French Joint (Deep Book Hinge Crease 8px from spine at right edge in rest) */}
                      <div className="absolute top-0 bottom-0 right-2.5 w-1.5 book-joint-crease pointer-events-none z-20" />

                      {/* Library Buckram Tactile Cloth Grain Texture */}
                      <div className="absolute inset-0 opacity-14 book-cloth-texture pointer-events-none z-10" />

                      {/* Gold Foil Double Debossed Fillet Border Frame */}
                      <div className="absolute inset-3 border border-yellow-500/40 rounded-xs pointer-events-none z-10" />
                      <div className="absolute inset-4 border border-yellow-500/20 rounded-xs pointer-events-none z-10" />

                      {/* Header Banner: Genre & Publication Year */}
                      <div className="relative z-10 flex items-center justify-between border-b border-yellow-500/30 pb-2 pr-3">
                        <span className="text-[10px] uppercase tracking-widest font-mono gold-foil-text font-bold">
                          {book.category}
                        </span>
                        <span className="text-[10px] font-mono font-bold gold-foil-text">
                          {book.publicationYear}
                        </span>
                      </div>

                      {/* Centered Book Cover Title & Gold Foil Stamping */}
                      <div className="relative z-10 space-y-2 my-auto pr-3 pl-1 text-center">
                        <h3 className="text-xl font-bold tracking-tight leading-snug font-serif gold-foil-text">
                          {book.title}
                        </h3>
                        {book.authorKanji && (
                          <p className="text-xs tracking-widest text-emerald-200/90 font-serif">
                            {book.authorKanji}
                          </p>
                        )}
                        <div className="w-12 h-0.5 bg-yellow-500/40 mx-auto my-1.5" />
                        <p className="text-xs text-white/95 font-medium font-serif italic">
                          {book.author}
                        </p>
                      </div>

                      {/* Footer Accession Status & Interactive Inspect Hint */}
                      <div className="relative z-10 pt-2 border-t border-yellow-500/30 flex items-center justify-between text-[11px] pr-3">
                        <span className="font-mono text-emerald-300 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {book.availableCopies} Available
                        </span>
                        <span className="text-[9px] font-mono uppercase gold-foil-text tracking-wider">
                          Inspect Volume
                        </span>
                      </div>

                      {/* Silk Crimson Bookmark Ribbon Marker Tail extending past bottom */}
                      <div className="absolute bottom-0 left-7 w-4 h-7 bg-red-800 shadow-md transform translate-y-3.5 z-30 pointer-events-none [clip-path:polygon(0_0,100%_0,100%_100%,50%_75%,0_100%)]" />
                    </div>

                    {/* =================================================================== */}
                    {/* 3. PHYSICAL BACK COVER (On shelf at X = +T/2, facing +X)           */}
                    {/* Centered at X = +T/2, parallel behind front cover when turned.      */}
                    {/* =================================================================== */}
                    <div
                      className="absolute backface-hidden rounded-xs p-5 flex flex-col justify-between overflow-hidden shadow-2xl book-board-bevel"
                      style={{
                        width: `${W}px`,
                        height: `${H}px`,
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) translate3d(${T / 2}px, 0, 0) rotateY(90deg)`,
                        backgroundColor: book.coverColor,
                        color: '#FAF8F5',
                      }}
                    >
                      <div className="absolute inset-0 opacity-14 book-cloth-texture pointer-events-none" />
                      <div className="absolute inset-3 border border-yellow-500/30 rounded-xs pointer-events-none" />
                      <div className="absolute inset-4 border border-yellow-500/15 rounded-xs pointer-events-none" />

                      {/* French Joint Crease on Back Cover near spine */}
                      <div className="absolute top-0 bottom-0 left-2.5 w-1.5 book-joint-crease pointer-events-none z-20" />

                      {/* Rear Archival Colophon Stamp */}
                      <div className="relative z-10 m-auto text-center space-y-2 opacity-85">
                        <div className="w-9 h-9 rounded-full border border-yellow-500/40 mx-auto flex items-center justify-center font-serif text-sm gold-foil-text font-bold">
                          L
                        </div>
                        <div className="text-[9px] font-mono uppercase tracking-widest gold-foil-text font-bold">
                          The Library Press
                        </div>
                        <div className="text-[8px] font-mono opacity-80">
                          Archival Edition • {book.publisher}
                        </div>
                      </div>

                      {/* Barcode & ISBN Stamp on lower back cover */}
                      <div className="relative z-10 p-2 bg-paper/90 dark:bg-zinc-900/90 rounded border border-border/40 text-center font-mono text-[8px] space-y-0.5 text-foreground">
                        <div className="font-semibold">{book.isbn}</div>
                        <div className="text-muted-foreground tracking-widest uppercase">Archival Accession</div>
                      </div>
                    </div>

                    {/* =================================================================== */}
                    {/* 4. TOP PAGE EDGE (Head - Inset Paper Block between covers)          */}
                    {/* =================================================================== */}
                    <div
                      className="absolute backface-hidden page-block-strata border border-stone-400/80 shadow-inner"
                      style={{
                        width: `${T - 4}px`,
                        height: `${W - 6}px`,
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) translate3d(0, ${-H / 2 + 2}px, 0) rotateX(90deg)`,
                        opacity: openness > 0.15 ? 1 : 0,
                      }}
                    />

                    {/* =================================================================== */}
                    {/* 5. BOTTOM PAGE EDGE (Tail - Inset Paper Block between covers)       */}
                    {/* =================================================================== */}
                    <div
                      className="absolute backface-hidden page-block-strata border border-stone-400/80 shadow-inner"
                      style={{
                        width: `${T - 4}px`,
                        height: `${W - 6}px`,
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) translate3d(0, ${+H / 2 - 2}px, 0) rotateX(-90deg)`,
                        opacity: openness > 0.15 ? 1 : 0,
                      }}
                    />

                    {/* =================================================================== */}
                    {/* 6. FORE-EDGE PAGE BLOCK (Opposite Spine - Opens on the Right)       */}
                    {/* Centered at Z = -W/2. When rotated +78deg, sits on the RIGHT.      */}
                    {/* =================================================================== */}
                    <div
                      className="absolute backface-hidden fore-edge-strata border border-stone-400/80 shadow-inner"
                      style={{
                        width: `${T - 4}px`,
                        height: `${H - 6}px`,
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) translate3d(0, 0, ${-W / 2 + 2}px) rotateY(180deg)`,
                        opacity: openness > 0.15 ? 1 : 0,
                      }}
                    />
                  </div>
                )
              })}
            </div>

            {/* Floating Navigation Arrows safely docked at the canvas edges */}
            <div className="absolute top-1/2 left-3 -translate-y-1/2 z-30 pointer-events-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={prevBook}
                className="w-10 h-10 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-xl hover:bg-forest hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
                aria-label="Previous volume"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="absolute top-1/2 right-3 -translate-y-1/2 z-30 pointer-events-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={nextBook}
                className="w-10 h-10 rounded-full bg-card/95 backdrop-blur-md border border-border shadow-xl hover:bg-forest hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
                aria-label="Next volume"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Subtitle / Interaction Bar below Shelf Canvas */}
          <div className="pt-2 px-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/30">
            <span className="font-mono text-[11px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-forest dark:bg-emerald-400 inline-block animate-pulse" />
              Volume {activeIndex + 1} of {books.length} Active
            </span>
            <span className="text-[11px] opacity-80 hidden sm:inline">
              Drag horizontally or use arrow keys to navigate the collection
            </span>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* RIGHT COLUMN: INDEPENDENT BIBLIOGRAPHIC INSPECTION CARD                */}
        {/* ======================================================================= */}
        {isInspectorOpen && activeBook && (
          <div className="w-full rounded-2xl bg-card border border-border/80 p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header with Title & Close Action */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-forest dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Bibliographic Inspect
              </span>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="outline"
                  className={
                    activeBook.availableCopies > 0
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 text-[10px]'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 text-[10px]'
                  }
                >
                  {activeBook.availableCopies > 0
                    ? `${activeBook.availableCopies} of ${activeBook.totalCopies} Available`
                    : 'Waitlist Queue'}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsInspectorOpen(false)}
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  title="Close inspection panel"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Book Identity */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground font-serif leading-tight">
                {activeBook.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium flex-wrap">
                <span className="text-foreground font-semibold">{activeBook.author}</span>
                {activeBook.authorRomaji && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px]">{activeBook.authorRomaji}</span>
                  </>
                )}
                <span>•</span>
                <span>{activeBook.publicationYear}</span>
              </div>
            </div>

            {/* Book Description */}
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {activeBook.description}
            </p>

            {/* Collapsible Volume Details Section */}
            {showVolumeDetails && (
              <div className="space-y-3 pt-3 border-t border-border/40">
                {/* Shelf Location & Call Number */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-secondary/40 rounded-lg text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Call Location</span>
                    <span className="text-foreground font-medium truncate block">
                      {activeBook.shelfLocation}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">ISBN Code</span>
                    <span className="text-foreground font-medium truncate block">
                      {activeBook.isbn}
                    </span>
                  </div>
                </div>

                {/* Physical Accession Copies */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground font-bold flex items-center justify-between">
                    <span>Accession Holdings</span>
                    <span>({activeBook.copies?.length || 0} Physical)</span>
                  </div>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {activeBook.copies?.slice(0, 3).map((copy) => (
                      <div
                        key={copy.id}
                        className="flex items-center justify-between p-1.5 rounded bg-secondary/30 text-xs font-mono"
                      >
                        <span className="font-semibold text-foreground">{copy.barcode}</span>
                        <span className="flex items-center gap-1 text-[11px]">
                          {copy.status === 'available' ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Available
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {copy.status}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                onClick={() => onInspectBook(activeBook)}
                className="w-full bg-forest hover:bg-forest/90 text-white text-xs gap-2 py-2 shadow-sm cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                Inspect Full Volume Details
              </Button>

              {activeBook.availableCopies > 0 ? (
                <Button
                  variant="outline"
                  onClick={() => onRequestBorrow?.(activeBook.id)}
                  className="w-full text-xs gap-1.5 cursor-pointer"
                >
                  Request to Borrow
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => onReserve?.(activeBook.id)}
                  className="w-full text-xs gap-1.5 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 cursor-pointer"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  Join Reservation Queue
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
