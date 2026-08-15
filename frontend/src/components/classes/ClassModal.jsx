import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const ClassModal = ({ isOpen, onClose, onSave, cls = null }) => {
  const [form, setForm] = useState({
    name: '',
    subject: '',
    room: '',
    schedule: '',
    description: '',
  });

  useEffect(() => {
    if (cls) {
      setForm({
        name: cls.name || '',
        subject: cls.subject || '',
        room: cls.room || '',
        schedule: cls.schedule || '',
        description: cls.description || '',
      });
    } else {
      setForm({
        name: '',
        subject: '',
        room: '',
        schedule: '',
        description: '',
      });
    }
  }, [cls, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={cls ? 'Edit Class' : 'Create New Class'} size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="label">Class Name * (e.g. 9-A, 10-B)</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="input-field"
            placeholder="9-A"
          />
        </div>

        <div>
          <label className="label">Subject *</label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            className="input-field"
            placeholder="JavaScript / Physics / Math"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Room Number</label>
            <input
              type="text"
              value={form.room}
              onChange={e => setForm(f => ({ ...f, room: e.target.value }))}
              className="input-field"
              placeholder="301"
            />
          </div>
          <div>
            <label className="label">Schedule Info</label>
            <input
              type="text"
              value={form.schedule}
              onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
              className="input-field"
              placeholder="Mon, Wed 09:00"
            />
          </div>
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            rows="3"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="input-field"
            placeholder="Class overview, learning objectives..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {cls ? 'Save Changes' : '+ Create Class'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ClassModal;
