import React, { useState, useEffect } from 'react';
import { 
  Bus, 
  MapPin, 
  Phone, 
  User, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Edit3, 
  Users, 
  IndianRupee, 
  ShieldCheck, 
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
  Compass,
  Navigation
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTransportApi, createTransportApi, updateTransportApi, deleteTransportApi } from '../../services/api';

const TransportManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    vehicleNo: '',
    vehicleType: 'School Bus',
    routeTitle: '',
    driverName: '',
    driverPhone: '',
    conductorName: '',
    conductorPhone: '',
    capacity: 32,
    assignedStudentsCount: 0,
    monthlyFee: 1200,
    pickupPoints: '',
    status: 'active'
  });

  const fetchTransport = async () => {
    setLoading(true);
    try {
      const res = await getTransportApi();
      if (res.data?.success) {
        setVehicles(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading transport data:', err);
      setFeedback({ type: 'error', message: 'Failed to load transport fleet data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransport();
  }, []);

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      vehicleNo: '',
      vehicleType: 'School Bus',
      routeTitle: '',
      driverName: '',
      driverPhone: '',
      conductorName: '',
      conductorPhone: '',
      capacity: 32,
      assignedStudentsCount: 0,
      monthlyFee: 1200,
      pickupPoints: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const openEditModal = (v) => {
    setEditingVehicle(v);
    setFormData({
      vehicleNo: v.vehicleNo,
      vehicleType: v.vehicleType || 'School Bus',
      routeTitle: v.routeTitle,
      driverName: v.driverName,
      driverPhone: v.driverPhone,
      conductorName: v.conductorName || '',
      conductorPhone: v.conductorPhone || '',
      capacity: v.capacity,
      assignedStudentsCount: v.assignedStudentsCount || 0,
      monthlyFee: v.monthlyFee || 1000,
      pickupPoints: Array.isArray(v.pickupPoints) ? v.pickupPoints.join(', ') : '',
      status: v.status || 'active'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const payload = {
        ...formData,
        pickupPoints: formData.pickupPoints ? formData.pickupPoints.split(',').map(s => s.trim()).filter(Boolean) : []
      };

      if (editingVehicle) {
        await updateTransportApi(editingVehicle._id, payload);
        setFeedback({ type: 'success', message: 'Vehicle route details updated successfully!' });
      } else {
        await createTransportApi(payload);
        setFeedback({ type: 'success', message: 'New vehicle route added to fleet successfully!' });
      }
      setShowModal(false);
      fetchTransport();
    } catch (err) {
      console.error('Error saving vehicle:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save vehicle details' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, vehicleNo) => {
    if (!window.confirm(`Are you sure you want to remove vehicle ${vehicleNo}?`)) return;
    try {
      await deleteTransportApi(id);
      setFeedback({ type: 'success', message: `Vehicle ${vehicleNo} removed from fleet.` });
      fetchTransport();
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      setFeedback({ type: 'error', message: 'Failed to delete vehicle' });
    }
  };

  // Metrics
  const totalVehicles = vehicles.length;
  const totalCapacity = vehicles.reduce((sum, v) => sum + (Number(v.capacity) || 0), 0);
  const totalCommuters = vehicles.reduce((sum, v) => sum + (Number(v.assignedStudentsCount) || 0), 0);
  const totalMonthlyFee = vehicles.reduce((sum, v) => sum + ((Number(v.assignedStudentsCount) || 0) * (Number(v.monthlyFee) || 0)), 0);

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* ERP Premium Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-sky-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/head-dashboard" className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" /> Head Portal
            </Link>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider">
              NVP ERP v2.4 • Transport Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black mt-2 tracking-tight flex items-center gap-3">
            <Bus className="w-8 h-8 text-indigo-400 shrink-0" />
            School Transport & Bus Fleet Management
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Live bus fleet monitoring, pickup route mapping, student commuter counts, driver phone directory & official fare schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchTransport}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition backdrop-blur-sm"
            title="Refresh Fleet Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle / Route</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between gap-3 shadow-xs ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Fleet Strength</span>
            <div className="text-2xl font-heading font-black text-slate-900 mt-1">
              {totalVehicles} Vehicles
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Buses & Commuter Vans</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Bus className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Commuters</span>
            <div className="text-2xl font-heading font-black text-indigo-700 mt-1">
              {totalCommuters} <span className="text-xs font-bold text-slate-500">Students</span>
            </div>
            <p className="text-[11px] text-indigo-600 font-bold mt-0.5">
              {totalCapacity ? Math.round((totalCommuters / totalCapacity) * 100) : 0}% Filled ({totalCapacity} Total Seats)
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Fleet Routes</span>
            <div className="text-2xl font-heading font-black text-emerald-600 mt-1">
              {vehicles.filter(v => v.status === 'active').length} Routes
            </div>
            <p className="text-[11px] text-emerald-700 font-bold mt-0.5">Ladnun, Nimbi, Hudas, Koyal</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Navigation className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Transport Revenue</span>
            <div className="text-2xl font-heading font-black text-amber-700 mt-1">
              ₹{totalMonthlyFee.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Projected monthly fee</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Official Transport Fare Chart Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-heading font-black text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Official NVP Transport / Fare Chart (2026-2027)
            </h2>
            <p className="text-xs text-slate-500">Approved installment structure based on distance and route coverage.</p>
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
            {vehicles.length} Active Bus Routes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Route / Coverage Area</th>
                <th className="px-4 py-3 text-right">Total Annual Fare</th>
                <th className="px-4 py-3 text-right">1st Installment (Adm. Time)</th>
                <th className="px-4 py-3 text-right rounded-r-xl">2nd Installment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map((v) => {
                const total = v.totalFare || (v.monthlyFee ? v.monthlyFee * 10 : 5500);
                const inst1 = v.firstInstallment || Math.round(total * 0.55);
                const inst2 = v.secondInstallment || (total - inst1);
                return (
                  <tr key={v._id || v.routeTitle} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{v.routeTitle}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-indigo-900 font-mono text-sm">
                      ₹{total.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700 font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 inline-block">
                        ₹{inst1.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-amber-700 font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 inline-block">
                        ₹{inst2.toLocaleString('en-IN')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet Vehicles & Routes Cards Grid */}
      <div className="space-y-4">
        <h2 className="font-heading font-black text-base text-slate-900 flex items-center gap-2">
          <Bus className="w-5 h-5 text-indigo-600" />
          Registered Fleet Vehicles & Live Route Status
        </h2>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 font-semibold bg-white rounded-3xl border border-slate-200">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-indigo-600" />
            Loading transport fleet...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            No transport vehicles or routes registered yet. Click "Add Vehicle / Route" above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {vehicles.map((v) => {
              const pct = v.capacity ? Math.min(100, Math.round((v.assignedStudentsCount / v.capacity) * 100)) : 0;
              return (
                <div 
                  key={v._id} 
                  className="group relative bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all duration-200 overflow-hidden flex flex-col justify-between"
                >
                  {/* Top Gradient Accent Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-500" />

                  <div className="p-5 space-y-4">
                    {/* Top Row: Registration License Plate & Actions */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {/* Yellow Metallic Style Plate */}
                          <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-mono font-black text-xs tracking-widest border border-amber-500 shadow-2xs">
                            {v.vehicleNo}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            v.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {v.status || 'ACTIVE'}
                          </span>
                        </div>
                        <h3 className="font-heading font-black text-slate-900 text-sm mt-1">
                          {v.routeTitle}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(v)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition border border-slate-100"
                          title="Edit Route"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v._id, v.vehicleNo)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-slate-100"
                          title="Delete Vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Occupancy & Seating Progress */}
                    <div className="bg-slate-50/80 rounded-2xl p-3 space-y-2 border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-indigo-600" />
                          Occupancy: {v.assignedStudentsCount} / {v.capacity} Seats
                        </span>
                        <span className="font-mono text-indigo-700">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Driver & Monthly Fare Grid */}
                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-indigo-700 tracking-wider">Driver Contact</span>
                        <div className="font-bold text-slate-900 truncate">{v.driverName}</div>
                        <a 
                          href={`tel:${v.driverPhone}`} 
                          className="text-indigo-600 hover:text-indigo-800 font-mono font-bold flex items-center gap-1 text-[11px]"
                        >
                          <Phone className="w-3 h-3" /> {v.driverPhone}
                        </a>
                      </div>

                      <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">Monthly Fare</span>
                        <div className="font-mono font-black text-emerald-950 text-sm">
                          ₹{v.monthlyFee} <span className="text-[10px] font-normal text-slate-600">/ student</span>
                        </div>
                        <div className="text-[10px] font-semibold text-slate-500 truncate">
                          {v.conductorName ? `Staff: ${v.conductorName}` : 'Self-guided'}
                        </div>
                      </div>
                    </div>

                    {/* Pickup Stops Pills */}
                    {v.pickupPoints && v.pickupPoints.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500" /> Key Pickup Stops:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {v.pickupPoints.map((pt, idx) => (
                            <span 
                              key={idx} 
                              className="text-[11px] bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-xl border border-slate-200/80"
                            >
                              {pt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-lg font-heading font-black text-slate-900 flex items-center gap-2">
                <Bus className="w-5 h-5 text-indigo-600" />
                {editingVehicle ? 'Edit Vehicle Route' : 'Register Vehicle & Route'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Vehicle Registration No *</label>
                  <input
                    type="text"
                    required
                    value={formData.vehicleNo}
                    onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value.toUpperCase() })}
                    placeholder="e.g. RJ-37-PA-1001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Vehicle Type *</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="School Bus">School Bus (32-50 seater)</option>
                    <option value="Mini Bus">Mini Bus (20-30 seater)</option>
                    <option value="Van">Van (10-15 seater)</option>
                    <option value="Winger">Winger / Force Traveler</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Route Title & Coverage *</label>
                <input
                  type="text"
                  required
                  value={formData.routeTitle}
                  onChange={(e) => setFormData({ ...formData, routeTitle: e.target.value })}
                  placeholder="e.g. Route 1 - Nimbi Jodhan & Ladnun Highway"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Driver Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    placeholder="Driver name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Driver Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    placeholder="+91 98290 xxxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Seating Capacity *</label>
                  <input
                    type="number"
                    min="5"
                    max="80"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Assigned Students</label>
                  <input
                    type="number"
                    min="0"
                    max={formData.capacity}
                    value={formData.assignedStudentsCount}
                    onChange={(e) => setFormData({ ...formData, assignedStudentsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Monthly Fee (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Pickup Points (Comma separated)</label>
                <input
                  type="text"
                  value={formData.pickupPoints}
                  onChange={(e) => setFormData({ ...formData, pickupPoints: e.target.value })}
                  placeholder="e.g. Nimbi Bus Stand, Kalyanpura Crossing, Station Road, School Gate"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Route Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active Service</option>
                  <option value="maintenance">Under Maintenance</option>
                  <option value="inactive">Inactive / Off-duty</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportManagement;
