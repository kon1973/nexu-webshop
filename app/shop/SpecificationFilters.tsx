'use client'

import { useState, useEffect, useTransition, useMemo, useCallback, memo } from 'react'
import { ChevronDown, ChevronRight, Check, Sliders, Loader2, Search, X, Hash, ToggleLeft, FolderOpen, Folder } from 'lucide-react'
import { getSpecifications, type SpecificationFilter, type SpecificationGroup } from './actions'

export type SelectedSpec = {
  key: string
  type?: 'text' | 'boolean' | 'range'
  values?: string[]
  boolValue?: boolean
  rangeMin?: number
  rangeMax?: number
}

type Props = {
  category?: string
  selectedSpecs: SelectedSpec[]
  onSpecsChange: (specs: SelectedSpec[]) => void
}

// Memoized spec item component for better performance
const SpecItem = memo(function SpecItem({
  spec,
  isExpanded,
  hasSelection,
  selectedCount,
  onToggleExpand,
  onTextValueToggle,
  onBooleanToggle,
  isTextValueSelected,
  getBooleanValue
}: {
  spec: SpecificationFilter
  isExpanded: boolean
  hasSelection: boolean
  selectedCount: number
  onToggleExpand: () => void
  onTextValueToggle: (value: string) => void
  onBooleanToggle: (value: boolean | null) => void
  isTextValueSelected: (value: string) => boolean
  getBooleanValue: () => boolean | null
}) {
  const getTypeIcon = () => {
    switch (spec.type) {
      case 'boolean': return <ToggleLeft size={12} className="text-green-400" />
      case 'range': return <Hash size={12} className="text-blue-400" />
      default: return null
    }
  }

  return (
    <div 
      className={`rounded-lg border transition-all duration-200 overflow-hidden ${
        hasSelection 
          ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30' 
          : 'bg-[#0a0a0a] border-white/5 hover:border-white/10'
      }`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full px-2.5 py-2 md:px-3 md:py-2.5 flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {getTypeIcon()}
          <span className={`text-[11px] md:text-xs font-medium truncate ${hasSelection ? 'text-purple-300' : 'text-gray-300 group-hover:text-white'}`}>
            {spec.key}
          </span>
          {hasSelection && (
            <span className="flex-shrink-0 text-[9px] md:text-[10px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-full font-medium">
              {spec.type === 'text' || spec.type === 'range' ? selectedCount : '✓'}
            </span>
          )}
        </div>
        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown size={12} className="text-gray-500 group-hover:text-white" />
        </div>
      </button>

      {/* Content with smooth animation */}
      <div className={`grid transition-all duration-200 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-2.5 pb-2.5 md:px-3 md:pb-3 pt-0.5">
            {spec.type === 'text' && spec.values && (
              <div className="flex flex-wrap gap-1 md:gap-1.5">
                {spec.values.sort((a, b) => a.localeCompare(b, 'hu')).map((value) => {
                  const isSelected = isTextValueSelected(value)
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onTextValueToggle(value)}
                      className={`px-2 py-1 md:px-2.5 md:py-1 rounded-md text-[10px] md:text-[11px] font-medium transition-all duration-150 flex items-center gap-1 active:scale-95 ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {isSelected && <Check size={9} />}
                      <span className="truncate max-w-[100px] md:max-w-none">{value}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {spec.type === 'boolean' && (
              <div className="flex gap-1.5">
                {[
                  { value: true, label: 'Igen', count: spec.booleanCount?.true, color: 'green' },
                  { value: false, label: 'Nem', count: spec.booleanCount?.false, color: 'red' }
                ].map(({ value, label, count, color }) => {
                  const isSelected = getBooleanValue() === value
                  return (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => onBooleanToggle(isSelected ? null : value)}
                      className={`flex-1 px-2 py-1.5 rounded-md text-[10px] md:text-xs font-medium transition-all duration-150 flex items-center justify-center gap-1 active:scale-95 ${
                        isSelected
                          ? color === 'green' 
                            ? 'bg-green-600 text-white shadow-md shadow-green-500/30'
                            : 'bg-red-600 text-white shadow-md shadow-red-500/30'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {isSelected && <Check size={10} />}
                      {label}
                      {count !== undefined && count > 0 && (
                        <span className="text-[9px] opacity-70">({count})</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {spec.type === 'range' && spec.values && (
              <div className="flex flex-wrap gap-1 md:gap-1.5">
                {spec.values
                  .sort((a, b) => {
                    const numA = parseFloat(a.replace(',', '.'))
                    const numB = parseFloat(b.replace(',', '.'))
                    return numA - numB
                  })
                  .map((value) => {
                    const isSelected = isTextValueSelected(value)
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => onTextValueToggle(value)}
                        className={`px-2 py-1 md:px-2.5 md:py-1 rounded-md text-[10px] md:text-[11px] font-medium transition-all duration-150 flex items-center gap-1 active:scale-95 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {isSelected && <Check size={9} />}
                        {value}
                      </button>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

// Memoized group component for folder/directory view
const SpecGroup = memo(function SpecGroup({
  group,
  isGroupExpanded,
  onToggleGroup,
  expandedKeys,
  selectedSpecs,
  onToggleExpand,
  handleTextValueToggle,
  handleBooleanToggle,
  isTextValueSelected,
  getBooleanValue,
  getSelectedCount
}: {
  group: SpecificationGroup
  isGroupExpanded: boolean
  onToggleGroup: () => void
  expandedKeys: Set<string>
  selectedSpecs: SelectedSpec[]
  onToggleExpand: (key: string) => void
  handleTextValueToggle: (specKey: string, value: string) => void
  handleBooleanToggle: (specKey: string, value: boolean | null) => void
  isTextValueSelected: (specKey: string, value: string) => boolean
  getBooleanValue: (specKey: string) => boolean | null
  getSelectedCount: (specKey: string) => number
}) {
  const groupSelectedCount = useMemo(() => {
    return group.specs.reduce((count, spec) => {
      return count + (selectedSpecs.some(s => s.key === spec.key) ? 1 : 0)
    }, 0)
  }, [group.specs, selectedSpecs])

  const headerName = group.header || 'Egyéb'

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden bg-[#0d0d0d]">
      {/* Group Header */}
      <button
        type="button"
        onClick={onToggleGroup}
        className={`w-full px-3 py-2.5 flex items-center gap-2 text-left transition-colors ${
          isGroupExpanded ? 'bg-white/5' : 'hover:bg-white/3'
        }`}
      >
        {isGroupExpanded ? (
          <FolderOpen size={14} className="text-purple-400 flex-shrink-0" />
        ) : (
          <Folder size={14} className="text-gray-500 flex-shrink-0" />
        )}
        <span className={`text-xs font-semibold flex-1 ${isGroupExpanded ? 'text-purple-300' : 'text-gray-400'}`}>
          {headerName}
        </span>
        <span className="text-[10px] text-gray-600">
          {group.specs.length}
        </span>
        {groupSelectedCount > 0 && (
          <span className="text-[10px] bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded-full font-medium">
            {groupSelectedCount}
          </span>
        )}
        <ChevronRight 
          size={12} 
          className={`text-gray-500 transition-transform duration-200 ${isGroupExpanded ? 'rotate-90' : ''}`} 
        />
      </button>

      {/* Group Content */}
      <div className={`grid transition-all duration-200 ease-in-out ${isGroupExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="p-2 space-y-1.5 border-t border-white/5">
            {group.specs.map((spec) => (
              <SpecItem
                key={spec.key}
                spec={spec}
                isExpanded={expandedKeys.has(spec.key)}
                hasSelection={selectedSpecs.some(s => s.key === spec.key)}
                selectedCount={getSelectedCount(spec.key)}
                onToggleExpand={() => onToggleExpand(spec.key)}
                onTextValueToggle={(value) => handleTextValueToggle(spec.key, value)}
                onBooleanToggle={(value) => handleBooleanToggle(spec.key, value)}
                isTextValueSelected={(value) => isTextValueSelected(spec.key, value)}
                getBooleanValue={() => getBooleanValue(spec.key)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

export default function SpecificationFilters({ category, selectedSpecs, onSpecsChange }: Props) {
  const [specGroups, setSpecGroups] = useState<SpecificationGroup[]>([])
  const [isPending, startTransition] = useTransition()
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch available specifications using Server Action
  useEffect(() => {
    startTransition(async () => {
      const groups = await getSpecifications(category || undefined)
      setSpecGroups(groups)
      // Auto-expand groups that have selections
      const selectedKeys = new Set(selectedSpecs.map(s => s.key))
      setExpandedKeys(selectedKeys)
      
      // Auto-expand groups containing selected specs
      const groupsWithSelection = new Set<string>()
      for (const group of groups) {
        if (group.specs.some(spec => selectedKeys.has(spec.key))) {
          groupsWithSelection.add(group.header || '__uncategorized__')
        }
      }
      setExpandedGroups(groupsWithSelection)
    })
  }, [category])

  // Total spec count
  const totalSpecCount = useMemo(() => {
    return specGroups.reduce((count, group) => count + group.specs.length, 0)
  }, [specGroups])

  // Filtered groups based on search
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return specGroups

    const term = searchTerm.toLowerCase()
    return specGroups
      .map(group => ({
        ...group,
        specs: group.specs.filter(spec =>
          spec.key.toLowerCase().includes(term) ||
          spec.values?.some(v => v.toLowerCase().includes(term))
        )
      }))
      .filter(group => group.specs.length > 0)
  }, [specGroups, searchTerm])

  const toggleExpand = useCallback((key: string) => {
    setExpandedKeys(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(key)) {
        newExpanded.delete(key)
      } else {
        newExpanded.add(key)
      }
      return newExpanded
    })
  }, [])

  const toggleGroup = useCallback((header: string | null) => {
    const groupKey = header || '__uncategorized__'
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(groupKey)) {
        newExpanded.delete(groupKey)
      } else {
        newExpanded.add(groupKey)
      }
      return newExpanded
    })
  }, [])

  const handleTextValueToggle = useCallback((specKey: string, value: string) => {
    const existingSpec = selectedSpecs.find(s => s.key === specKey)
    
    if (existingSpec) {
      const values = existingSpec.values || []
      const newValues = values.includes(value)
        ? values.filter(v => v !== value)
        : [...values, value]
      
      if (newValues.length === 0) {
        onSpecsChange(selectedSpecs.filter(s => s.key !== specKey))
      } else {
        onSpecsChange(selectedSpecs.map(s => 
          s.key === specKey ? { ...s, values: newValues } : s
        ))
      }
    } else {
      onSpecsChange([...selectedSpecs, { key: specKey, type: 'text', values: [value] }])
    }
  }, [selectedSpecs, onSpecsChange])

  const handleBooleanToggle = useCallback((specKey: string, value: boolean | null) => {
    if (value === null) {
      onSpecsChange(selectedSpecs.filter(s => s.key !== specKey))
    } else {
      const existingSpec = selectedSpecs.find(s => s.key === specKey)
      if (existingSpec) {
        onSpecsChange(selectedSpecs.map(s => 
          s.key === specKey ? { ...s, boolValue: value } : s
        ))
      } else {
        onSpecsChange([...selectedSpecs, { key: specKey, type: 'boolean', boolValue: value }])
      }
    }
  }, [selectedSpecs, onSpecsChange])

  const isTextValueSelected = useCallback((specKey: string, value: string): boolean => {
    const spec = selectedSpecs.find(s => s.key === specKey)
    return spec?.values?.includes(value) ?? false
  }, [selectedSpecs])

  const getBooleanValue = useCallback((specKey: string): boolean | null => {
    const spec = selectedSpecs.find(s => s.key === specKey)
    return spec?.boolValue ?? null
  }, [selectedSpecs])

  const getSelectedCount = useCallback((specKey: string): number => {
    const spec = selectedSpecs.find(s => s.key === specKey)
    return spec?.values?.length ?? 0
  }, [selectedSpecs])

  const clearAllSpecs = useCallback(() => {
    onSpecsChange([])
  }, [onSpecsChange])

  const expandAllGroups = useCallback(() => {
    const allGroupKeys = specGroups.map(g => g.header || '__uncategorized__')
    setExpandedGroups(new Set(allGroupKeys))
  }, [specGroups])

  const collapseAllGroups = useCallback(() => {
    setExpandedGroups(new Set())
  }, [])

  if (isPending && specGroups.length === 0) {
    return (
      <div className="flex items-center justify-center py-4 md:py-6 text-gray-500">
        <Loader2 className="animate-spin mr-2" size={16} />
        <span className="text-xs md:text-sm">Specifikációk betöltése...</span>
      </div>
    )
  }

  if (totalSpecCount === 0) {
    return null
  }

  const totalSelectedSpecs = selectedSpecs.length
  const allGroupsExpanded = expandedGroups.size === specGroups.length

  return (
    <div className="space-y-3">
      {/* Header with clear and expand/collapse buttons */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Sliders size={14} /> 
          <span>Specifikációk</span>
          {totalSelectedSpecs > 0 && (
            <span className="text-purple-400 normal-case font-medium">({totalSelectedSpecs})</span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {/* Expand/Collapse all */}
          <button
            type="button"
            onClick={allGroupsExpanded ? collapseAllGroups : expandAllGroups}
            className="text-[10px] text-gray-500 hover:text-purple-400 transition-colors"
            title={allGroupsExpanded ? 'Összecsukás' : 'Kinyitás'}
          >
            {allGroupsExpanded ? <FolderOpen size={12} /> : <Folder size={12} />}
          </button>
          {totalSelectedSpecs > 0 && (
            <button
              type="button"
              onClick={clearAllSpecs}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <X size={12} />
              Törlés
            </button>
          )}
        </div>
      </div>

      {/* Search within specs - only show if there are many */}
      {totalSpecCount > 5 && (
        <div className="relative">
          <input
            type="text"
            placeholder="Keresés a specifikációkban..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 pl-8 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder-gray-600"
          />
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
            >
              <X size={12} className="text-gray-500" />
            </button>
          )}
        </div>
      )}

      {/* Grouped specs list - folder/directory view */}
      <div className="space-y-2">
        {filteredGroups.map((group) => (
          <SpecGroup
            key={group.header || '__uncategorized__'}
            group={group}
            isGroupExpanded={expandedGroups.has(group.header || '__uncategorized__')}
            onToggleGroup={() => toggleGroup(group.header)}
            expandedKeys={expandedKeys}
            selectedSpecs={selectedSpecs}
            onToggleExpand={toggleExpand}
            handleTextValueToggle={handleTextValueToggle}
            handleBooleanToggle={handleBooleanToggle}
            isTextValueSelected={isTextValueSelected}
            getBooleanValue={getBooleanValue}
            getSelectedCount={getSelectedCount}
          />
        ))}
      </div>

      {/* No results */}
      {searchTerm && filteredGroups.length === 0 && (
        <p className="text-xs text-gray-500 text-center py-2">
          Nincs találat: "{searchTerm}"
        </p>
      )}
    </div>
  )
}
