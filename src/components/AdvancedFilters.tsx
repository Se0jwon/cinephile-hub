import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

export interface AdvancedFilterValues {
  yearFrom: string;
  yearTo: string;
  ratingFrom: number;
  ratingTo: number;
  runtimeFrom: string;
  runtimeTo: string;
}

interface AdvancedFiltersProps {
  filters: AdvancedFilterValues;
  onFiltersChange: (filters: AdvancedFilterValues) => void;
  onReset: () => void;
}

const currentYear = new Date().getFullYear();

export const defaultAdvancedFilters: AdvancedFilterValues = {
  yearFrom: "",
  yearTo: "",
  ratingFrom: 0,
  ratingTo: 10,
  runtimeFrom: "",
  runtimeTo: "",
};

const AdvancedFilters = ({ filters, onFiltersChange, onReset }: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.yearFrom !== "" ||
    filters.yearTo !== "" ||
    filters.ratingFrom !== 0 ||
    filters.ratingTo !== 10 ||
    filters.runtimeFrom !== "" ||
    filters.runtimeTo !== "";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                고급 필터
                {hasActiveFilters && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    활성
                  </span>
                )}
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Release Year Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">개봉 연도</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="1900"
                  min={1900}
                  max={currentYear}
                  value={filters.yearFrom}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, yearFrom: e.target.value })
                  }
                  className="w-full"
                />
                <span className="text-muted-foreground">~</span>
                <Input
                  type="number"
                  placeholder={String(currentYear)}
                  min={1900}
                  max={currentYear}
                  value={filters.yearTo}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, yearTo: e.target.value })
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">평점 범위</Label>
                <span className="text-sm text-muted-foreground">
                  {filters.ratingFrom.toFixed(1)} ~ {filters.ratingTo.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  value={[filters.ratingFrom, filters.ratingTo]}
                  min={0}
                  max={10}
                  step={0.5}
                  onValueChange={([from, to]) =>
                    onFiltersChange({ ...filters, ratingFrom: from, ratingTo: to })
                  }
                  className="flex-1"
                />
              </div>
            </div>

            {/* Runtime Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">러닝타임 (분)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="0"
                  min={0}
                  max={500}
                  value={filters.runtimeFrom}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, runtimeFrom: e.target.value })
                  }
                  className="w-full"
                />
                <span className="text-muted-foreground">~</span>
                <Input
                  type="number"
                  placeholder="무제한"
                  min={0}
                  max={500}
                  value={filters.runtimeTo}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, runtimeTo: e.target.value })
                  }
                  className="w-full"
                />
              </div>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                필터 초기화
              </Button>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default AdvancedFilters;
