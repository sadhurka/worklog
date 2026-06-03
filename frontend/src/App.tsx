import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useWorkEntries } from './hooks/useWorkEntries';
import WorkTable from './components/WorkTable';
import EntryForm from './components/EntryForm';
import FilterBar from './components/FilterBar';
import { WorkEntry } from './types';

export default function App() {
  const { entries, loading, filters, setFilters, deleteEntry, addEntry, editEntry } = useWorkEntries();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);

  const handleFormSuccess = (entry: WorkEntry) => {
    if (editingEntry) {
      editEntry(entry);
    } else {
      addEntry(entry);
    }
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleEdit = (entry: WorkEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  return (
    <div className="app">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="logo">🏗</div>
            <div>
              <h1>Site Work Log</h1>
              <p>Construction progress tracker</p>
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={() => { setEditingEntry(null); setShowForm(true); }}
          >
            + Add Entry
          </button>
        </div>
      </header>

      <main className="main">
        <div className="toolbar">
          <FilterBar filters={filters} onChange={setFilters} />
          <div className="entry-count">
            {!loading && (
              <span>{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span>
            )}
          </div>
        </div>

        <WorkTable
          entries={entries}
          loading={loading}
          onDelete={deleteEntry}
          onEdit={handleEdit}
        />
      </main>

      {showForm && (
        <EntryForm
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
          editEntry={editingEntry}
        />
      )}
    </div>
  );
}
