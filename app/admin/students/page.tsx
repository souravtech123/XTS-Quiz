'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Plus, Trash2, Edit3, UserCheck, AlertCircle, X, Download } from 'lucide-react';
import { Student } from '@/lib/types';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State for Add Student
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    fullName: '',
    email: '',
    studentId: '',
    phone: ''
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students');
      const data = await res.json();
      setStudents(data.students || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add student');

      setShowAddModal(false);
      setNewStudent({ fullName: '', email: '', studentId: '', phone: '' });
      fetchStudents();
    } catch (err: any) {
      setModalError(err.message || 'Error adding student');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this student? All their submissions will also be removed.')) return;
    try {
      await fetch(`/api/admin/students?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      fetchStudents();
    } catch (e) {
      alert('Failed to delete student');
    }
  };

  // Filter students
  const filtered = students.filter(s => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.quizStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Student Management</h1>
          <p className="text-slate-400 text-sm mt-1">View, add, edit, or remove registered candidates.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-white text-xs flex items-center gap-2 shadow-lg shadow-purple-950"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-900">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Name, Email, or Student ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 font-semibold rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="ALL">All Statuses ({students.length})</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Submitted">Submitted</option>
          </select>
        </div>

      </div>

      {/* Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Student ID</th>
                <th className="py-4 px-6">Email / Phone</th>
                <th className="py-4 px-6">Quiz Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 font-mono text-xs">
                    Loading student data...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    No students match the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(student => (
                  <tr key={student.id} className="hover:bg-slate-900/50 transition-colors">
                    
                    <td className="py-4 px-6 font-bold text-white">
                      {student.fullName}
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-purple-300">
                      {student.studentId || 'N/A'}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-300">
                      <div>{student.email}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{student.phone}</div>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                        student.quizStatus === 'Submitted'
                          ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300'
                          : student.quizStatus === 'In Progress'
                          ? 'bg-cyan-950/80 border border-cyan-700/60 text-cyan-300'
                          : 'bg-slate-900 border border-slate-800 text-slate-400'
                      }`}>
                        {student.quizStatus}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-2 rounded-lg bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-900/60 transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative space-y-5">
            
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white">Add New Student</h3>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-950 text-red-300 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStudent.fullName}
                  onChange={e => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  placeholder="e.g. Sourav Suman"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newStudent.email}
                  onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="e.g. sourav@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Student ID / Roll No</label>
                <input
                  type="text"
                  value={newStudent.studentId}
                  onChange={e => setNewStudent({ ...newStudent, studentId: e.target.value })}
                  placeholder="e.g. XTS202603"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newStudent.phone}
                  onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 font-bold text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full py-3 rounded-xl bg-purple-600 font-bold text-white text-xs hover:bg-purple-500"
                >
                  {modalLoading ? 'Adding...' : 'Save Student'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
