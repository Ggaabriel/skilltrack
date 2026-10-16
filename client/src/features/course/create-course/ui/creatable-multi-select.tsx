import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

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

export type SelectableItem = {
  id: number;
  name: string;
};

type CreatableMultiSelectProps = {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  createLabel: string;
  items: SelectableItem[];
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
  onCreate: (name: string) => Promise<SelectableItem>;
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
  isLoading = false,
  isCreating = false,
  disabled = false,
}: CreatableMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const normalizedSearch = search.trim();

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(normalizedSearch.toLowerCase()),
  );

  const exactMatch = items.some(
    (item) => item.name.toLowerCase() === normalizedSearch.toLowerCase(),
  );

  const canCreate = normalizedSearch.length > 0 && !exactMatch;

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  function toggleItem(item: SelectableItem) {
    const isSelected = selectedIds.includes(item.id);

    onSelectedIdsChange(
      isSelected
        ? selectedIds.filter((id) => id !== item.id)
        : [...selectedIds, item.id],
    );
  }

  async function handleCreate() {
    if (!canCreate || isCreating || disabled) {
      return;
    }

    setCreateError(null);

    try {
      const createdItem = await onCreate(normalizedSearch);

      onSelectedIdsChange([...selectedIds, createdItem.id]);
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
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
            disabled={disabled || isLoading}
          >
            {selectedItems.length > 0
              ? `Selected: ${selectedItems.length}`
              : isLoading
                ? "Loading..."
                : placeholder}

            <ChevronsUpDown className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
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
                        className={`mr-2 size-4 ${
                          selected ? "opacity-100" : "opacity-0"
                        }`}
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
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <Badge key={item.id} variant="secondary">
              {item.name}
            </Badge>
          ))}
        </div>
      )}

      {createError && <p className="text-sm text-destructive">{createError}</p>}
    </div>
  );
}
