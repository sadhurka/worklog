import { useState, useEffect, useCallback } from 'react';
import { WorkEntry, FilterState } from '../types';
import { fetchEntries, deleteEntry as apiDeleteEntry } from '../api/client';
import toast from 'react-hot-toast';

const DEFAULT_FILTERS: FilterState = { from: '', to: '', sort: 'desc' };

export function useWorkEntries() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEntries(filters);
      setEntries(data);
    } catch {
      toast.error('Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const deleteEntry = async (id: number) => {
    await apiDeleteEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const addEntry = (entry: WorkEntry) => {
    setEntries(prev => {
      const updated = [entry, ...prev];
      // Respect sort
      return updated.sort((a, b) => {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return filters.sort === 'desc' ? diff : -diff;
      });
    });
  };

  const editEntry = (updated: WorkEntry) => {
    setEntries(prev => prev.map(e => (e.id === updated.id ? updated : e)));
  };

  return { entries, loading, filters, setFilters, deleteEntry, addEntry, editEntry, reload: load };
}
