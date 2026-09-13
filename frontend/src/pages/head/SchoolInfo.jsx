import React, { useState, useEffect } from 'react';
import { getSchoolInfoApi, updateSchoolInfoApi } from '../../services/api';
import { School, Building, Phone, Mail, MapPin, Award, CheckCircle2, Save } from 'lucide-react';

export default function SchoolInfo() {
  const [info, setInfo] = useState({
    schoolName: '',
    subtitle: '',
    address: '',
    contactNumber: '',
    email: '',
    academicSession: '',
    motto: '',
    affiliation: ''
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        const res = await getSchoolInfoApi();
        if (res.data.success && res.data.schoolInfo) {
          setInfo(res.data.schoolInfo);
        }
      } catch (err) {
        console.error('Failed loading school info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSchoolInfoApi(info);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating school information');
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shadow-xl">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
            Institutional Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-black mt-2">School Profile & Information</h1>
          <p className="text-xs text-slate-300 mt-1">Official institution credentials, campus address, affiliation and mottos.</p>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          School Information saved successfully!
        </div>
      )}

      {/* Form Card */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-3xl">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-semibold">Loading school settings...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Official Institution Name</label>
              <input
                type="text"
                required
                value={info.schoolName}
                onChange={(e) => setInfo({ ...info, schoolName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Campus Subtitle / City</label>
                <input
                  type="text"
                  value={info.subtitle}
                  onChange={(e) => setInfo({ ...info, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Current Academic Session</label>
                <input
                  type="text"
                  value={info.academicSession}
                  onChange={(e) => setInfo({ ...info, academicSession: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">School Motto / Tagline</label>
              <input
                type="text"
                value={info.motto}
                onChange={(e) => setInfo({ ...info, motto: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Board Affiliation / Accreditation</label>
              <input
                type="text"
                value={info.affiliation}
                onChange={(e) => setInfo({ ...info, affiliation: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Complete Campus Address</label>
              <textarea
                rows="2"
                value={info.address}
                onChange={(e) => setInfo({ ...info, address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={info.contactNumber}
                  onChange={(e) => setInfo({ ...info, contactNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Official Email</label>
                <input
                  type="email"
                  value={info.email}
                  onChange={(e) => setInfo({ ...info, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save School Information</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
