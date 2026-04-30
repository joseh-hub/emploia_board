/**
 * @file: premium-zinc.ts
 * @responsibility: Centralize Premium Dark Mode (Zinc) Tailwind class tokens for boards (opt-in).
 * @exports: premiumZinc object with surface, card, column, input, etc.
 * @layer: styles
 */

export const premiumZinc = {
  /** Page/area background */
  surface: "bg-zinc-950",
  /** Subtle area (e.g. filter bar wrapper) */
  surfaceSubtle: "bg-zinc-950/40",
  /** Panel/expanded area */
  surfacePanel: "bg-zinc-950/50",

  /** Card/container (sections, modals inner) */
  card: "bg-zinc-900 border border-zinc-800/50 rounded-xl",
  /** Card hover */
  cardHover: "hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20",

  /** Column container */
  column: "bg-zinc-950/50 border border-zinc-800/50 rounded-xl",
  /** Column when drag-over (visual feedback only) */
  columnDragOver: "ring-2 ring-[#3F1757]/50 bg-[#3F1757]/5",

  /** Input base */
  input: "bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600",
  /** Select trigger / dropdown trigger */
  selectTrigger: "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800",
  /** Popover/Dropdown content */
  popoverContent: "bg-zinc-900 border-zinc-800",
  /** Popover sub content */
  popoverSubContent: "bg-zinc-900 border-zinc-800",

  /** Scroll gradient (left/right fade) */
  scrollGradientLeft: "bg-gradient-to-r from-zinc-950 to-transparent",
  scrollGradientRight: "bg-gradient-to-l from-zinc-950 to-transparent",
  /** Scroll arrow button */
  scrollButton: "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800",

  /** Column header badge count */
  badgeCount: "bg-zinc-900 border border-zinc-800 text-zinc-400",
  /** Column header title */
  columnHeaderTitle: "text-zinc-300 font-semibold text-sm tracking-wider",
  /** Column header border */
  columnHeaderBorder: "border-b border-zinc-800/50",

  /** Empty state text */
  emptyStateText: "text-zinc-600 text-sm",
  /** Empty state circle */
  emptyStateCircle: "border-zinc-800",

  /** Add column button (dashed) */
  addColumnButton:
    "bg-zinc-900/30 border border-dashed border-zinc-800 text-zinc-400 hover:bg-zinc-900/50 hover:border-zinc-700",
  /** Add column card (when adding) */
  addColumnCard: "bg-zinc-900 border border-zinc-800/50",

  /** Filter/toggle container */
  filterBarWrapper: "border-b border-zinc-800/50 bg-zinc-950/40",
  /** Toggle group (Board/Cards) */
  toggleGroup: "bg-zinc-900 border-zinc-800",
  toggleActive: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
  toggleInactive: "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",

  /** TopBar header (when variant premiumZinc) */
  topBarHeader: "bg-zinc-950 border-b border-zinc-800/60",
  topBarTitle: "text-zinc-100",
  topBarSearchInput: "bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600",
  topBarSearchIcon: "text-zinc-500",

  /** Loading spinner */
  loadingSpinner: "border-zinc-700 border-t-transparent",
  loadingText: "text-zinc-500",
} as const;

export type PremiumZincKeys = keyof typeof premiumZinc;
