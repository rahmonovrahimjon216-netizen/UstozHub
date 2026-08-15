import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

const StudentModal = ({ isOpen, onClose, onSave, student = null, classes = [] }) => {
  const [form, setForm] = useState({
    fullName: '',
    className: '',
    phone: '',
    parentPhone: '',
    studentId: '',
  });

  useEffect(() => {
    if (student) {
      const cls = classes.find(c => c.id === student.classId);
      setForm({
        fullName: student.fullName || '',
        className: cls ? cls.name : (student.classId || (classes[0]?.name || '9-A')),
        phone: student.phone || '',
        parentPhone: student.parentPhone || '',
        studentId: student.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    } else {
      setForm({
        fullName: '',
        className: classes[0]?.name || '9-A',
        phone: '',
        parentPhone: '',
        studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }
  }, [student, isOpen, classes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Map typed className to existing classId if matched, or keep the typed className directly!
    const matchedClass = classes.find(c => c.name.toLowerCase() === form.className.trim().toLowerCase());
    const finalData = {
      ...form,
      classId: matchedClass ? matchedClass.id : form.className.trim(),
    };
    onSave(finalData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={student ? "O'quvchini tahrirlash" : "Yangi o'quvchi qo'shish"} size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Full Name */}
        <div>
          <label className="label">F.I.Sh (Ism va Familiya) *</label>
          <input
            type="text"
            required
            value={form.fullName}
            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
            className="input-field"
            placeholder="Ali Valiyev"
          />
        </div>

        {/* Class Manual Input + Autocomplete list */}
        <div>
          <label className="label">Sinf (Qo'lda yozing, masalan: 9-A, 10-B, 8-V) *</label>
          <input
            type="text"
            required
            list="class-suggestions"
            value={form.className}
            onChange={e => setForm(f => ({ ...f, className: e.target.value }))}
            className="input-field"
            placeholder="Masalan: 9-A yoki 10-B"
          />
          <datalist id="class-suggestions">
            {classes.map(c => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          <p className="text-[11px] text-gray-400 mt-1">Sinf nomini o'zingiz erkin yozishingiz yoki ro'yxatdan tanlashingiz mumkin.</p>
        </div>

        {/* Phone Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">O'quvchining telefoni</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="input-field"
              placeholder="+998 90 123 45 67"
            />
          </div>

          <div>
            <label className="label">Ota-onasining telefoni</label>
            <input
              type="tel"
              value={form.parentPhone}
              onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))}
              className="input-field"
              placeholder="+998 90 987 65 43"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button type="button" onClick={onClose} className="btn-secondary">
            Bekor qilish
          </button>
          <button type="submit" className="btn-primary">
            {student ? 'Saqlash' : "+ O'quvchi qo'shish"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentModal;
