import { WorkEntry, WorkType, WorkEntryFormData, FilterState } from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message =
      (data as { error?: string }).error ||
      (data as { errors?: Array<{ msg: string }> }).errors?.[0]?.msg ||
      `HTTP error ${res.status}`;
    throw new Error(message);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export async function fetchEntries(filters: FilterState): Promise<WorkEntry[]> {
  const params = new URLSearchParams();
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  params.set('sort', filters.sort);

  const res = await fetch(`${BASE_URL}/work-entries?${params}`);
  return handleResponse<WorkEntry[]>(res);
}

export async function createEntry(data: WorkEntryFormData): Promise<WorkEntry> {
  const res = await fetch(`${BASE_URL}/work-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: data.date,
      workType: data.workType,
      volume: parseFloat(data.volume),
      unit: data.unit,
      performer: data.performer,
    }),
  });
  return handleResponse<WorkEntry>(res);
}

export async function updateEntry(id: number, data: WorkEntryFormData): Promise<WorkEntry> {
  const res = await fetch(`${BASE_URL}/work-entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: data.date,
      workType: data.workType,
      volume: parseFloat(data.volume),
      unit: data.unit,
      performer: data.performer,
    }),
  });
  return handleResponse<WorkEntry>(res);
}

export async function deleteEntry(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/work-entries/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(res);
}

export async function fetchWorkTypes(): Promise<WorkType[]> {
  const res = await fetch(`${BASE_URL}/work-types`);
  return handleResponse<WorkType[]>(res);
}
