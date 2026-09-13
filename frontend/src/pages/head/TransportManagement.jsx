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
  AlertCircle
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
        setFeedback({ type: 'success', message: 'Vehicle details updated successfully!' });
      } else {
        await createTransportApi(payload);
        setFeedback({ type: 'success', message: 'New vehicle route added successfully!' });
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
      setFeedback({ type: 'success', message: `Vehicle ${vehicleNo} deleted.` });
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
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/head-dashboard" className="text-slate-500 hover:text-slate-800 text-sm flex items-center gap-1 font-medium">
              <ArrowLeft className="w-4 h-4" /> Head Portal
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Bus className="w-7 h-7 text-indigo-600" />
            School Transport & Bus Fleet Management
          </h1>
          <p className="text-slate-600 text-sm mt-0.5">
            Manage school buses, vans, pickup stops, assigned students, and driver contact directory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTransport}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 shadow-sm transition-all"
            title="Refresh Fleet Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle / Route</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fleet Strength</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-slate-900">{totalVehicles}</h3>
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-xs">Vehicles</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Buses & Commuter Vans</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Commuters</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-indigo-700">{totalCommuters}</h3>
            <span className="p-2 bg-indigo-50 text-indigo-800 rounded-lg font-bold text-xs">
              {totalCapacity ? Math.round((totalCommuters / totalCapacity) * 100) : 0}% Filled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Out of {totalCapacity} seat capacity</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Routes</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-emerald-700">
              {vehicles.filter(v => v.status === 'active').length}
            </h3>
            <span className="p-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-xs">Active</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Ladnun, Nimbi, Jaswantgarh</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Transport Fee</p>
          <div className="flex items-center justify-between mt-2">
            <h3 className="text-2xl font-black text-amber-700">₹{totalMonthlyFee.toLocaleString('en-IN')}</h3>
            <span className="p-2 bg-amber-50 text-amber-800 rounded-lg font-bold text-xs">Est. Monthly</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Projected collection</p>
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-2 p-12 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-indigo-600" />
            Loading transport fleet...
          </div>
        ) : vehicles.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 font-medium bg-white rounded-xl border border-slate-200">
            No transport vehicles or routes registered yet. Click "Add Vehicle / Route" above.
          </div>
        ) : (
          vehicles.map((v) => {
            const pct = v.capacity ? Math.min(100, Math.round((v.assignedStudentsCount / v.capacity) * 100)) : 0;
            return (
              <div key={v._id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all">
                {/* Vehicle Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${
                      v.vehicleType?.toLowerCase().includes('van') ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      <Bus className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                          {v.vehicleNo}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          v.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {v.status?.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mt-1">{v.routeTitle}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(v)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v._id, v.vehicleNo)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Capacity & Occupancy Bar */}
                <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" /> Occupancy: {v.assignedStudentsCount} / {v.capacity} Seats
                    </span>
                    <span className="font-bold text-indigo-700">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full ${pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Driver & Conductor Details */}
                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-slate-500 font-medium">Driver:</div>
                    <div className="font-bold text-slate-900 mt-0.5">{v.driverName}</div>
                    <a href={`tel:${v.driverPhone}`} className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold mt-1">
                      <Phone className="w-3 h-3" /> {v.driverPhone}
                    </a>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="text-slate-500 font-medium">Monthly Fare:</div>
                    <div className="font-bold text-slate-900 mt-0.5 text-sm flex items-center">
                      <IndianRupee className="w-3.5 h-3.5" /> {v.monthlyFee} / student
                    </div>
                    <div className="text-slate-500 mt-1">
                      {v.conductorName ? `Staff: ${v.conductorName}` : 'Self-guided'}
                    </div>
                  </div>
                </div>

                {/* Route Pickup Points */}
                {v.pickupPoints && v.pickupPoints.length > 0 && (
                  <div className="mt-3.5">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> Key Pickup Stops:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {v.pickupPoints.map((pt, idx) => (
                        <span key={idx} className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200">
                          {pt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bus className="w-5 h-5 text-indigo-600" />
                {editingVehicle ? 'Edit Vehicle Route' : 'Register Vehicle & Route'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Registration No *</label>
                  <input
                    type="text"
                    required
                    value={formData.vehicleNo}
                    onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value.toUpperCase() })}
                    placeholder="e.g. RJ-37-PA-1001"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vehicle Type *</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="School Bus">School Bus (32-50 seater)</option>
                    <option value="Mini Bus">Mini Bus (20-30 seater)</option>
                    <option value="Van">Van (10-15 seater)</option>
                    <option value="Winger">Winger / Force Traveler</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Route Title & Coverage *</label>
                <input
                  type="text"
                  required
                  value={formData.routeTitle}
                  onChange={(e) => setFormData({ ...formData, routeTitle: e.target.value })}
                  placeholder="e.g. Route 1 - Nimbi Jodhan & Ladnun Highway"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Driver Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    placeholder="Driver name"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Driver Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.driverPhone}
                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                    placeholder="+91 98290 xxxxx"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Seating Capacity *</label>
                  <input
                    type="number"
                    min="5"
                    max="80"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Students</label>
                  <input
                    type="number"
                    min="0"
                    max={formData.capacity}
                    value={formData.assignedStudentsCount}
                    onChange={(e) => setFormData({ ...formData, assignedStudentsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Monthly Fee (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pickup Points (Comma separated)</label>
                <input
                  type="text"
                  value={formData.pickupPoints}
                  onChange={(e) => setFormData({ ...formData, pickupPoints: e.target.value })}
                  placeholder="e.g. Nimbi Bus Stand, Kalyanpura Crossing, Station Road, School Gate"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Route Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"
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
