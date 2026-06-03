import { useState } from 'react';
import { WorkEntry } from '../types';
import toast from 'react-hot-toast';

interface Props {
  entries: WorkEntry[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  onEdit: (entry: WorkEntry) => void;
}

export default function WorkTable({ entries, loading, onDelete, onEdit }: Props) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await onDelete(id);
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete entry');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading entries…</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>No entries yet</h3>
        <p>Start logging your site work by clicking "Add Entry" above.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="work-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type of Work</th>
            <th>Volume</th>
            <th>Unit</th>
            <th>Performer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.id} className={deletingId === entry.id ? 'deleting' : ''}>
              <td className="date-cell">{formatDate(entry.date)}</td>
              <td className="work-type-cell">
                <span className="work-type-badge">{entry.work_type}</span>
              </td>
              <td className="volume-cell">{entry.volume}</td>
              <td className="unit-cell">{entry.unit}</td>
              <td className="performer-cell">{entry.performer}</td>
              <td className="actions-cell">
                {confirmId === entry.id ? (
                  <div className="confirm-actions">
                    <span className="confirm-text">Delete?</span>
                    <button
                      className="btn-danger-sm"
                      onClick={() => handleDelete(entry.id)}
                      disabled={deletingId === entry.id}
                    >
                      {deletingId === entry.id ? '…' : 'Yes'}
                    </button>
                    <button className="btn-ghost-sm" onClick={() => setConfirmId(null)}>
                      No
                    </button>
                  </div>
                ) : (
                  <div className="row-actions">
                    <button
                      className="btn-edit-sm"
                      onClick={() => onEdit(entry)}
                      title="Edit entry"
                    >
                      ✎
                    </button>
                    <button
                      className="btn-delete-sm"
                      onClick={() => setConfirmId(entry.id)}
                      title="Delete entry"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
