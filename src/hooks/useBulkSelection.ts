import { useState, useCallback, useMemo } from 'react';

export function useBulkSelection<T extends { id: string }>(items: T[] | undefined) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isAllSelected = useMemo(() => {
    if (!items?.length) return false;
    return items.every((item) => selectedIds.has(item.id));
  }, [items, selectedIds]);

  const isPartiallySelected = useMemo(() => {
    if (!items?.length) return false;
    const selectedCount = items.filter((item) => selectedIds.has(item.id)).length;
    return selectedCount > 0 && selectedCount < items.length;
  }, [items, selectedIds]);

  const selectedCount = useMemo(() => {
    return selectedIds.size;
  }, [selectedIds]);

  const selectedItems = useMemo(() => {
    return items?.filter((item) => selectedIds.has(item.id)) || [];
  }, [items, selectedIds]);

  const toggleItem = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (!items?.length) return;
    
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  }, [items, isAllSelected]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  return {
    selectedIds,
    selectedCount,
    selectedItems,
    isAllSelected,
    isPartiallySelected,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
  };
}
