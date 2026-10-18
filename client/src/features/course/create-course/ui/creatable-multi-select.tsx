
import { useState } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type SelectableItem = {
  id: number;
  name: string;
};

export type CreatableMultiSelectLayout = "vertical" | "horizontal";

type CreatableMultiSelectProps = {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  createLabel: string;
  items: SelectableItem[];
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
  onCreate: (name: string) => Promise<SelectableItem>;
  layout?: CreatableMultiSelectLayout;
  isLoading?: boolean;
  isCreating?: boolean;
  disabled?: boolean;
};

export function CreatableMultiSelect({
  label,
  placeholder,
  searchPlaceholder,
  createLabel,
  items,
  selectedIds,
  onSelectedIdsChange,
  onCreate,
  layout = "vertical",
  isLoading = false,
  isCreating = false,
  disabled = false,
}: CreatableMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const isHorizontal = layout === "horizontal";
  const normalizedSearch = search.trim();
  const normalizedSearchLower = normalizedSearch.toLowerCase();

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(normalizedSearchLower),
  );

  const exactMatch = items.some(
    (item) => item.name.toLowerCase() === normalizedSearchLower,
  );

  const canCreate = normalizedSearch.length > 0 && !exactMatch;

  const selectedItems = items.filter((item) =>
    selectedIds.includes(item.id),
  );

  function toggleItem(item: SelectableItem) {
    const isSelected = selectedIds.includes(item.id);

    onSelectedIdsChange(
      isSelected
        ? selectedIds.filter((id) => id !== item.id)
        : [...selectedIds, item.id],
    );
  }

  async function handleCreate() {
    if (!canCreate || isCreating || disabled) return;

    setCreateError(null);

    try {
      const createdItem = await onCreate(normalizedSearch);

      onSelectedIdsChange(
        selectedIds.includes(createdItem.id)
          ? selectedIds
          : [...selectedIds, createdItem.id],
      );

      setSearch("");
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : `Failed to create ${label.toLowerCase()}.`,
      );
    }
  }

  return (
    <div
      className={cn(
        isHorizontal
          ? "flex min-w-0 flex-wrap items-center gap-2"
          : "space-y-2",
      )}
    >
      <div
        className={cn(
          "text-sm font-medium",
          isHorizontal && "shrink-0",
        )}
      >
        {label}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "justify-between font-normal",
              isHorizontal
                ? "h-8 w-auto min-w-[132px] max-w-full gap-2 px-2"
                : "w-full",
            )}
            disabled={disabled || isLoading}
          >
            <span className="truncate">
              {selectedItems.length > 0
                ? `Selected: ${selectedItems.length}`
                : isLoading
                  ? "Loading..."
                  : placeholder}
            </span>

            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className={cn(
            "p-0",
            isHorizontal
              ? "w-64"
              : "w-[var(--radix-popover-trigger-width)]",
          )}
        >
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={(value) => {
                setSearch(value);
                setCreateError(null);
              }}
            />

            <CommandList>
              {filteredItems.length === 0 && !canCreate && (
                <div className="p-3 text-sm text-muted-foreground">
                  Nothing found.
                </div>
              )}

              <CommandGroup>
                {filteredItems.map((item) => {
                  const selected = selectedIds.includes(item.id);

                  return (
                    <CommandItem
                      key={item.id}
                      value={item.name}
                      onSelect={() => toggleItem(item)}
                    >
                      <Check
                        className={cn(
                          "mr-2 size-4",
                          selected ? "opacity-100" : "opacity-0",
                        )}
                      />

                      {item.name}
                    </CommandItem>
                  );
                })}

                {canCreate && (
                  <CommandItem
                    value={`create-${normalizedSearch}`}
                    disabled={isCreating || disabled}
                    onSelect={() => void handleCreate()}
                  >
                    <Plus className="mr-2 size-4" />

                    {isCreating
                      ? "Creating..."
                      : `${createLabel} "${normalizedSearch}"`}
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedItems.length > 0 && (
        <div
          className={cn(
            "flex flex-wrap gap-2",
            isHorizontal && "min-w-0 items-center gap-1.5",
          )}
        >
          {selectedItems.map((item) => (
            <Badge
              key={item.id}
              variant="secondary"
              className={cn(isHorizontal && "gap-1")}
            >
              {item.name}

              <button
                type="button"
                className="ml-1 rounded-sm outline-none hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/50"
                onClick={() => toggleItem(item)}
                disabled={disabled}
                aria-label={`Remove ${item.name}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {createError && (
        <p
          className={cn(
            "text-sm text-destructive",
            isHorizontal && "basis-full",
          )}
        >
          {createError}
        </p>
      )}
    </div>
  );
}
