/**
 * Admin Components Index
 * 
 * Központi export fájl az admin komponensekhez
 */

// Dashboard & Analytics
export { default as ActivityFeed, createActivityItem } from './ActivityFeed'

export { 
  StatCard, 
  DashboardHeader, 
  QuickActionCard, 
  AlertBanner,
  Sparkline 
} from './DashboardWidgets'

export {
  AreaChart,
  BarChart,
  DonutChart,
  ComparisonChart,
  TrendIndicator,
  ProgressRing
} from './Charts'

// Data Display
export { default as DataTable, RowActions, StatusBadge } from './DataTable'
export type { Column } from './DataTable'

// Bulk Operations
export { default as BulkActions } from './BulkActions'

// Navigation & Search
export { default as QuickSearch, InlineSearch } from './QuickSearch'
export { default as NotificationCenter, NotificationToast } from './NotificationCenter'

// Settings & Forms
export {
  SettingsSection,
  SettingsRow,
  Toggle,
  SettingsInput,
  SettingsSelect,
  SettingsTextarea,
  SettingsColorPicker,
  SettingsRadioGroup,
  SettingsCheckbox,
  SettingsActions,
  SettingsSlider
} from './SettingsPanel'

// AI Components
export { default as AIReturnPredictor } from './AIReturnPredictor'
export { default as AIAutoTagging } from './AIAutoTagging'
export { default as AIInventoryPredictor } from './AIInventoryPredictor'
