import React, { useState, useEffect } from 'react';
import { getParentsApi, createParentApi, updateParentApi, deleteParentApi } from '../../services/api';
import { Users, UserPlus, Search, Phone, Mail, Briefcase, MapPin, Trash2, Edit } from 'lucide-react';

export default function ParentManagement() {
  const [parents, setParents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParent, setEditingParent] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    relation: 'Father',
    phone: '',
    email: '',
    occupation: '',
    address: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getParentsApi({ search: search || undefined });
      if (res.data.success) setParents(res.data.parents);
    } catch (err) {
      console.error('Failed to load parents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenAdd = () => {
    setEditingParent(null);
    setFormData({ name: '', relation: 'Father', phone: '', email: '', occupation: '', address: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingParent(p);
    setFormData({
      name: p.name || '',
      relation: p.relation || 'Father',
      phone: p.phone || '',
      email: p.email || '',
      occupation: p.occupation || '',
      address: p.address || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingParent) {
        await updateParentApi(editingParent._id, formData);
      } else {
        await createParentApi(formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving parent record');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parent profile?')) return;
    try {
      await deleteParentApi(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting parent record');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-xl">
        <div>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
            Guardian & Family Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black mt-2">Parents Directory</h1>
          <p className="text-xs text-slate-300 mt-1">Directory of parents, contact information, and linked students.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/30 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Parent</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search parents by name, phone, email, occupation..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 shadow-sm">
            Search
          </button>
        </form>
      </div>

      {/* Parents Table */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600" />
          Total Registered: <span className="text-purple-600 font-extrabold">{parents.length}</span> Parents
        </h2>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-600 font-bold">Loading parents roster...</div>
        ) : parents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-medium">No parents found. Click "Add New Parent" to register.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
              <thead className="bg-slate-100 text-slate-800 font-black uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Guardian Name</th>
                  <th className="px-4 py-3">Relation</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Occupation</th>
                  <th className="px-4 py-3">Linked Children</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parents.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900">{p.name}</span>
                      {p.email && <span className="block text-[11px] text-slate-400">{p.email}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px]">
                        {p.relation}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{p.phone}</td>
                    <td className="px-4 py-3 text-slate-600">{p.occupation || '—'}</td>
                    <td className="px-4 py-3">
                      {p.students && p.students.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.students.map((st) => (
                            <span key={st._id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold">
                              {st.name} ({st.class?.name || 'Cls'})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None linked</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{p.address || '—'}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-heading font-black text-slate-900">
              {editingParent ? 'Edit Parent Record' : 'Add New Parent'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Relation</label>
                  <select
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98290 XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Business / Government Service"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Address</label>
                <textarea
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-500/20"
                >
                  Save Parent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
