import * as React from "react"
import { useLocation } from "react-router-dom"
import { Switch } from "../ui/switch"
import { Layers, ChevronRight, Pencil, Target, Flame } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { useMap } from "../../contexts/MapContext"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

export function MapControls() {
  const location = useLocation()
  const [isGeoOpen, setIsGeoOpen] = React.useState(true)
  const [isTerritoryOpen, setIsTerritoryOpen] = React.useState(true)
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(true)
  const {
    stateLayerVisible,
    countyLayerVisible,
    zipLayerVisible,
    branchLayerVisible,
    representativeLayerVisible,
    heatMapLayerVisible,
    isDrawingMode,
    territoryTypeVisibility,
    territoryTypes,
    setStateLayerVisible,
    setCountyLayerVisible,
    setZipLayerVisible,
    setBranchLayerVisible,
    setRepresentativeLayerVisible,
    setHeatMapLayerVisible,
    setIsDrawingMode,
    setTerritoryTypeVisibility,
  } = useMap()

  // Track expanded state for category types
  const [expandedCategories, setExpandedCategories] = React.useState<{ [key: string]: boolean }>({});

  // Toggle category expansion
  const toggleCategory = (categoryCode: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryCode]: !prev[categoryCode]
    }));
  };

  // Toggle category and all its children
  const toggleCategoryVisibility = (categoryCode: string, checked: boolean) => {
    const childTypes = territoryTypes.filter(t => t.parentType === categoryCode);
    childTypes.forEach(childType => {
      setTerritoryTypeVisibility(childType.code, checked);
    });
    setTerritoryTypeVisibility(categoryCode, checked);
  };

  // Check if all children of a category are visible
  const isCategoryFullyVisible = (categoryCode: string) => {
    const childTypes = territoryTypes.filter(t => t.parentType === categoryCode);
    return childTypes.every(childType => territoryTypeVisibility[childType.code] ?? true);
  };

  // Show on any map-related pages
  if (!location.pathname.includes('/map') && 
      !location.pathname.includes('/territories') && 
      !location.pathname.includes('/my-territory') &&
      !location.pathname.includes('/advanced-mapping')) {
    return null
  }

  return (
    <div className="py-4">
      <div className="space-y-4">
        <h2 className="px-6 text-sm font-medium text-muted-foreground">Map Controls</h2>
        
        {/* Geo Layers Section */}
        <Collapsible
          open={isGeoOpen}
          onOpenChange={setIsGeoOpen}
          className="space-y-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-2 text-sm font-medium text-foreground hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>Geo Layers</span>
            </div>
            <ChevronRight
              className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200",
                isGeoOpen && "rotate-90"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            <div className="flex items-center justify-between px-6 py-2">
              <span className="text-sm text-muted-foreground">States</span>
              <div className="pr-6">
                <Switch
                  checked={stateLayerVisible}
                  onCheckedChange={setStateLayerVisible}
                />
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-2">
              <span className="text-sm text-muted-foreground">Counties</span>
              <div className="pr-6">
                <Switch
                  checked={countyLayerVisible}
                  onCheckedChange={setCountyLayerVisible}
                />
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-2">
              <span className="text-sm text-muted-foreground">ZIP Codes</span>
              <div className="pr-6">
                <Switch
                  checked={zipLayerVisible}
                  onCheckedChange={setZipLayerVisible}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Territory Layers Section */}
        <Collapsible
          open={isTerritoryOpen}
          onOpenChange={setIsTerritoryOpen}
          className="space-y-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-2 text-sm font-medium text-foreground hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>Territory Layers</span>
            </div>
            <ChevronRight
              className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200",
                isTerritoryOpen && "rotate-90"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {/* System Territory Types */}
            <div className="flex items-center justify-between px-6 py-2">
              <span className="text-sm text-muted-foreground">Branch Territories</span>
              <div className="pr-6">
                <Switch
                  checked={branchLayerVisible}
                  onCheckedChange={setBranchLayerVisible}
                />
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-2">
              <span className="text-sm text-muted-foreground">Representative Territories</span>
              <div className="pr-6">
                <Switch
                  checked={representativeLayerVisible}
                  onCheckedChange={setRepresentativeLayerVisible}
                />
              </div>
            </div>

            {/* Divider between system and custom types */}
            <div className="h-px bg-border mx-6 my-2" />

            {/* Custom Territory Types */}
            {territoryTypes
              .filter(type => !type.isSystem && type.isCategory)
              .map(category => (
                <div key={category.code} className="space-y-1">
                  {/* Category header with toggle and expand/collapse */}
                  <div className="flex items-center justify-between px-6 py-2">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => toggleCategory(category.code)}
                        className="p-1 hover:bg-muted/50 rounded-sm"
                      >
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-200",
                            expandedCategories[category.code] && "rotate-90"
                          )}
                        />
                      </button>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <div className="pr-6">
                      <Switch
                        checked={isCategoryFullyVisible(category.code)}
                        onCheckedChange={(checked) => toggleCategoryVisibility(category.code, checked)}
                      />
                    </div>
                  </div>

                  {/* Child types */}
                  {expandedCategories[category.code] && territoryTypes
                    .filter(t => t.parentType === category.code)
                    .map(childType => (
                      <div key={childType.code} className="flex items-center justify-between px-6 py-2 pl-12">
                        <span className="text-sm text-muted-foreground">{childType.name}</span>
                        <div className="pr-6">
                          <Switch
                            checked={territoryTypeVisibility[childType.code] ?? true}
                            onCheckedChange={(checked) => setTerritoryTypeVisibility(childType.code, checked)}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              ))}

            {/* Standalone types (not categories or children) */}
            {territoryTypes
              .filter(type => !type.isSystem && !type.isCategory && !type.parentType)
              .map(type => (
                <div key={type.code} className="flex items-center justify-between px-6 py-2">
                  <span className="text-sm text-muted-foreground">{type.name}</span>
                  <div className="pr-6">
                    <Switch
                      checked={territoryTypeVisibility[type.code] ?? true}
                      onCheckedChange={(checked) => setTerritoryTypeVisibility(type.code, checked)}
                    />
                  </div>
                </div>
              ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Advanced Layers Section */}
        <Collapsible
          open={isAdvancedOpen}
          onOpenChange={setIsAdvancedOpen}
          className="space-y-2"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-2 text-sm font-medium text-foreground hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              <span>Advanced Layers</span>
            </div>
            <ChevronRight
              className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200",
                isAdvancedOpen && "rotate-90"
              )}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            <div className="flex items-center justify-between px-6 py-2">
              <span className="text-sm text-muted-foreground">Heat Map</span>
              <div className="pr-6">
                <Switch
                  checked={heatMapLayerVisible}
                  onCheckedChange={setHeatMapLayerVisible}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      <div className="px-6 mt-4">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-start gap-2 font-medium",
            isDrawingMode && "bg-primary/10 text-primary hover:bg-primary/20"
          )}
          onClick={() => setIsDrawingMode(!isDrawingMode)}
        >
          <Pencil className="h-4 w-4" />
          Draw Territory
        </Button>
      </div>
    </div>
  )
}
