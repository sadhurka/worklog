import React, { useState, useEffect } from 'react';
import { WorkEntryFormData, FormErrors, WorkType, WorkEntry } from '../types';
import { createEntry, updateEntry, fetchWorkTypes } from '../api/client';
import toast from 'react-hot-toast';

const UNITS = ['m³', 'm²', 'm', 't', 'pcs', 'kg', 'l', 'h'];

interface Props {
  onSuccess: (entry: WorkEntry) => void;
  onCancel: () => void;
  editEntry?: WorkEntry | null;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function validate(data: WorkEntryFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.date) errors.date = 'Date is required';
  else if (new Date(data.date) > new Date()) errors.date = 'Date cannot be in the future';

  if (!data.workType) errors.workType = 'Work type is required';
  else if (data.workType.length < 2) errors.workType = 'Must be at least 2 characters';


if (!data.volume) {
  errors.volume = 'Volume is required';
} else {
  const parsedVolume = parseFloat(data.volume);
  if (isNaN(parsedVolume) || parsedVolume <= 0) {
    errors.volume = 'Must be greater than 0';
  } else if (!/^\d+(\.\d{1,2})?$/.test(data.volume)) {
    errors.volume = 'Volume must have up to 2 decimal places';
  }
}

  if (!data.unit) errors.unit = 'Unit is required';

  if (!data.performer) errors.performer = 'Performer is required';
  else if (data.performer.length < 3) errors.performer = 'Must be at least 3 characters';

  return errors;
}

export default function EntryForm({ onSuccess, onCancel, editEntry }: Props) {
  const [formData, setFormData] = useState<WorkEntryFormData>({
    date: editEntry ? editEntry.date.split('T')[0] : getToday(),
    workType: editEntry?.work_type || '',
    volume: editEntry ? String(editEntry.volume) : '',
    unit: editEntry?.unit || '',
    performer: editEntry?.performer || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWorkTypes()
      .then(setWorkTypes)
      .catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof WorkEntryFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const entry = editEntry
        ? await updateEntry(editEntry.id, formData)
        : await createEntry(formData);
      toast.success(editEntry ? 'Entry updated!' : 'Entry added!');
      onSuccess(entry);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{editEntry ? 'Edit Entry' : 'Add Entry'}</h2>
          <button className="close-btn" onClick={onCancel} type="button">✕</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                max={getToday()}
                onChange={handleChange}
                className={errors.date ? 'error' : ''}
              />
              {errors.date && <span className="error-msg">{errors.date}</span>}
            </div>

            <div className="field">
              <label htmlFor="workType">Type of Work</label>
              {workTypes.length > 0 ? (
                <select
                  id="workType"
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                  className={errors.workType ? 'error' : ''}
                >
                  <option value="">Select work type...</option>
                  {workTypes.map(wt => (
                    <option key={wt.id} value={wt.name}>{wt.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  id="workType"
                  type="text"
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                  placeholder="e.g. Partition masonry"
                  className={errors.workType ? 'error' : ''}
                />
              )}
              {errors.workType && <span className="error-msg">{errors.workType}</span>}
            </div>

            <div className="field field-row">
              <div className="field-sub">
                <label htmlFor="volume">Volume</label>
                <input
                  id="volume"
                  type="number"
                  name="volume"
                  value={formData.volume}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className={errors.volume ? 'error' : ''}
                />
                {errors.volume && <span className="error-msg">{errors.volume}</span>}
              </div>

              <div className="field-sub">
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className={errors.unit ? 'error' : ''}
                >
                  <option value="">Select...</option>
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                {errors.unit && <span className="error-msg">{errors.unit}</span>}
              </div>
            </div>

            <div className="field">
              <label htmlFor="performer">Performer</label>
              <input
                id="performer"
                type="text"
                name="performer"
                value={formData.performer}
                onChange={handleChange}
                placeholder="e.g. Ivanov I. I."
                className={errors.performer ? 'error' : ''}
              />
              {errors.performer && <span className="error-msg">{errors.performer}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : editEntry ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
