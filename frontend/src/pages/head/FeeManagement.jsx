import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  getFeeClassOverviewApi, getFeeStructuresApi, createFeeStructureApi, deleteFeeStructureApi,
  getStudentFeeLedgerApi, applyFeeDiscountApi, getFeePaymentsApi, recordFeePaymentApi,
  getFeeReportsApi, getClassesApi, getStudentsApi, deleteFeeReceiptApi, updateFeeReceiptApi
} from '../../services/api';
import { 
  DollarSign, Receipt, PlusCircle, Search, CreditCard, CheckCircle2, Filter, Printer, Download,
  Layers, Users, Calendar, AlertTriangle, ShieldCheck, Tag, FileText, ArrowRight, Eye, Check, X,
  Clock, Landmark, PieChart, BarChart3, HelpCircle, Trash2, Edit3
} from 'lucide-react';

export default function FeeManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview'; // 'overview' | 'collect' | 'structures' | 'receipts' | 'reports'

  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  
  // Filters
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSection, setSelectedSection] = useState('A');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [searchQuery, setSearchQuery] = useState('');

  // Class Overview Data
  const [overviewData, setOverviewData] = useState({
    metrics: { totalStudents: 0, totalDemandedFee: 0, totalCollectedFee: 0, totalPendingFee: 0 },
    students: []
  });

  // Structures & Receipts Data
  const [structures, setStructures] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [reportsData, setReportsData] = useState(null);

  // Modals state
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedStudentLedger, setSelectedStudentLedger] = useState(null);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [editReceiptForm, setEditReceiptForm] = useState({
    amount: '',
    paymentMethod: 'Cash',
    transactionRefNo: '',
    remarks: '',
    feeType: 'Tuition Fee'
  });

  // Forms
  const [collectForm, setCollectForm] = useState({
    studentId: '',
    amount: '',
    feeType: 'Tuition Fee',
    paymentMethod: 'Cash',
    transactionRefNo: '',
    remarks: ''
  });

  const [discountForm, setDiscountForm] = useState({
    studentId: '',
    studentName: '',
    discountAmount: 0,
    reason: 'Merit / Need-Based Scholarship',
    authorizedBy: 'Head Administrator'
  });

  const [structureForm, setStructureForm] = useState({
    classId: '',
    academicYear: '2026-2027',
    feeHeads: [
      { headName: 'Tuition Fee', amount: 18000, frequency: 'Annual' },
      { headName: 'Exam Fee', amount: 3000, frequency: 'Annual' },
      { headName: 'Computer & Lab Fee', amount: 4500, frequency: 'Annual' },
      { headName: 'Development Fee', amount: 4500, frequency: 'Annual' }
    ],
    installments: [
      { installmentNo: 1, title: 'Installment 1 (Apr)', dueDate: '2026-04-10', amount: 7500 },
      { installmentNo: 2, title: 'Installment 2 (Jul)', dueDate: '2026-07-10', amount: 7500 },
      { installmentNo: 3, title: 'Installment 3 (Oct)', dueDate: '2026-10-10', amount: 7500 },
      { installmentNo: 4, title: 'Installment 4 (Jan)', dueDate: '2026-01-10', amount: 7500 }
    ]
  });

  // Sync tab with URL search parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Fetch initial classes & students dropdowns
  useEffect(() => {
    const loadInitialMeta = async () => {
      try {
        const [clsRes, stdRes] = await Promise.all([
          getClassesApi(),
          getStudentsApi()
        ]);
        if (clsRes.data.success) setClasses(clsRes.data.classes || []);
        if (stdRes.data.success) setStudentsList(stdRes.data.students || []);
      } catch (err) {
        console.error('Failed to load classes or students:', err);
      }
    };
    loadInitialMeta();
  }, []);

  // Fetch tab-specific data
  const loadTabData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'overview') {
        const res = await getFeeClassOverviewApi({
          classId: selectedClassId || undefined,
          section: selectedSection || undefined,
          academicYear
        });
        if (res.data.success) {
          setOverviewData({
            metrics: res.data.metrics,
            students: res.data.students
          });
        }
      } else if (activeTab === 'structures') {
        const res = await getFeeStructuresApi({ academicYear });
        if (res.data.success) setStructures(res.data.structures || []);
      } else if (activeTab === 'receipts' || activeTab === 'collect') {
        const res = await getFeePaymentsApi({ search: searchQuery || undefined });
        if (res.data.success) setReceipts(res.data.receipts || []);
      } else if (activeTab === 'reports') {
        const res = await getFeeReportsApi({ academicYear });
        if (res.data.success) setReportsData(res.data.reports);
      }
    } catch (err) {
      console.error('Error fetching tab data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData();
  }, [activeTab, selectedClassId, selectedSection, academicYear]);

  // Handle student ledger viewing
  const handleOpenLedger = async (studentId) => {
    try {
      const res = await getStudentFeeLedgerApi(studentId, { academicYear });
      if (res.data.success) {
        setSelectedStudentLedger(res.data.ledger);
        setIsLedgerModalOpen(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch student ledger');
    }
  };

  // Open discount modal
  const handleOpenDiscountModal = (studentLedger) => {
    setDiscountForm({
      studentId: studentLedger.studentId,
      studentName: studentLedger.studentName,
      discountAmount: studentLedger.discountAmount || 0,
      reason: studentLedger.discountReason || 'Merit / Need-Based Scholarship',
      authorizedBy: studentLedger.discountAuthorizedBy || 'Head Administrator'
    });
    setIsDiscountModalOpen(true);
  };

  // Submit discount
  const handleDiscountSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await applyFeeDiscountApi({ ...discountForm, academicYear });
      if (res.data.success) {
        alert('Discount / Scholarship updated successfully!');
        setIsDiscountModalOpen(false);
        loadTabData();
        if (isLedgerModalOpen && selectedStudentLedger?.studentId === discountForm.studentId) {
          handleOpenLedger(discountForm.studentId);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply discount');
    }
  };
  // Delete / Cancel receipt
  const handleDeleteReceipt = async (receiptId, receiptNo) => {
    if (!window.confirm(`Are you sure you want to delete / cancel receipt ${receiptNo}? This action will permanently remove this transaction.`)) return;
    try {
      const res = await deleteFeeReceiptApi(receiptId);
      if (res.data?.success) {
        alert(`Receipt ${receiptNo} removed successfully.`);
        loadTabData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete receipt');
    }
  };

  // Open edit receipt modal
  const handleOpenEditReceipt = (receipt) => {
    setEditingReceipt(receipt);
    setEditReceiptForm({
      amount: receipt.amount || '',
      paymentMethod: receipt.paymentMethod || 'Cash',
      transactionRefNo: receipt.transactionRefNo || '',
      remarks: receipt.remarks || '',
      feeType: receipt.feeType || 'Tuition Fee'
    });
  };

  // Save edit receipt
  const handleSaveEditReceipt = async (e) => {
    e.preventDefault();
    try {
      const res = await updateFeeReceiptApi(editingReceipt._id, editReceiptForm);
      if (res.data?.success) {
        alert(`Receipt ${editingReceipt.receiptNo} updated successfully.`);
        setEditingReceipt(null);
        loadTabData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update receipt');
    }
  };

  // Open collect modal pre-filled for a specific student
  const handleOpenCollectModalForStudent = (studentId, pendingAmt = 0) => {
    setCollectForm({
      studentId,
      amount: pendingAmt > 0 ? pendingAmt : '',
      feeType: 'Tuition Fee (Quarterly)',
      paymentMethod: 'Cash',
      transactionRefNo: '',
      remarks: ''
    });
    setIsCollectModalOpen(true);
  };

  // Submit payment
  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await recordFeePaymentApi({ ...collectForm, academicYear });
      if (res.data.success) {
        setSelectedReceipt(res.data.receipt);
        setIsCollectModalOpen(false);
        loadTabData();
        if (isLedgerModalOpen && selectedStudentLedger?.studentId === collectForm.studentId) {
          handleOpenLedger(collectForm.studentId);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording fee payment');
    }
  };

  // Submit new Fee Structure
  const handleStructureSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createFeeStructureApi(structureForm);
      if (res.data.success) {
        alert('Class Fee Structure saved successfully!');
        setIsStructureModalOpen(false);
        loadTabData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving fee structure');
    }
  };

  // Delete Fee Structure
  const handleDeleteStructure = async (id) => {
    if (!window.confirm('Are you sure you want to remove this fee structure?')) return;
    try {
      await deleteFeeStructureApi(id);
      loadTabData();
    } catch (err) {
      alert('Error removing fee structure');
    }
  };

  // Head items helper
  const addFeeHeadRow = () => {
    setStructureForm(prev => ({
      ...prev,
      feeHeads: [...prev.feeHeads, { headName: 'New Fee Head', amount: 1000, frequency: 'Annual' }]
    }));
  };

  const updateFeeHeadRow = (idx, field, val) => {
    const updated = [...structureForm.feeHeads];
    updated[idx][field] = field === 'amount' ? Number(val) : val;
    setStructureForm(prev => ({ ...prev, feeHeads: updated }));
  };

  const removeFeeHeadRow = (idx) => {
    const updated = structureForm.feeHeads.filter((_, i) => i !== idx);
    setStructureForm(prev => ({ ...prev, feeHeads: updated }));
  };

  // Installment helper
  const updateInstallmentRow = (idx, field, val) => {
    const updated = [...structureForm.installments];
    updated[idx][field] = field === 'amount' ? Number(val) : val;
    setStructureForm(prev => ({ ...prev, installments: updated }));
  };

  const filteredStudents = overviewData.students.filter(st => 
    !searchQuery || 
    st.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    st.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none">
      {/* ERP Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
              NVP ERP v2.4 • Complete Financial Engine
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
              Session {academicYear}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black mt-2 tracking-tight">
            Fee & Ledger Management
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Class-wise fee demand, student ledgers, scholarships, installment tracking, computerized receipts & advanced collection reporting.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setStructureForm({
                classId: classes[0]?._id || '',
                academicYear,
                feeHeads: [
                  { headName: 'Tuition Fee', amount: 18000, frequency: 'Annual' },
                  { headName: 'Exam Fee', amount: 3000, frequency: 'Annual' },
                  { headName: 'Computer & Lab Fee', amount: 4500, frequency: 'Annual' },
                  { headName: 'Development Fee', amount: 4500, frequency: 'Annual' }
                ],
                installments: [
                  { installmentNo: 1, title: 'Installment 1 (Apr)', dueDate: '2026-04-10', amount: 7500 },
                  { installmentNo: 2, title: 'Installment 2 (Jul)', dueDate: '2026-07-10', amount: 7500 },
                  { installmentNo: 3, title: 'Installment 3 (Oct)', dueDate: '2026-10-10', amount: 7500 },
                  { installmentNo: 4, title: 'Installment 4 (Jan)', dueDate: '2026-01-10', amount: 7500 }
                ]
              });
              setIsStructureModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition backdrop-blur-sm"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Class Fee Structure</span>
          </button>
          
          <button
            onClick={() => {
              setCollectForm({
                studentId: studentsList[0]?._id || '',
                amount: '',
                feeType: 'Tuition Fee (Quarterly)',
                paymentMethod: 'Cash',
                transactionRefNo: '',
                remarks: ''
              });
              setIsCollectModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Collect Fee / New Receipt</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Bar matching ERP prompt requirement */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => switchTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Class Fee Dashboard</span>
          </button>
          
          <button
            onClick={() => switchTab('structures')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'structures' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Fee Structures</span>
          </button>

          <button
            onClick={() => switchTab('receipts')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'receipts' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span>Receipt Registry</span>
          </button>

          <button
            onClick={() => switchTab('reports')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
              activeTab === 'reports' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>Fee Reports & Analytics</span>
          </button>
        </div>

        {/* Global Academic Session Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-600 uppercase">Session:</span>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="2026-2027">2026-2027 (Active)</option>
            <option value="2025-2026">2025-2026 (Archive)</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: CLASS FEE DASHBOARD (CLASS-WISE & SECTION-WISE OVERVIEW)
         ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Select Class:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500 min-w-36"
                >
                  <option value="">All Classes (PG to 7)</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>Class {c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Section:</span>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>
            </div>

            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search student name or admission no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Top 4 Summary Cards matching user requirement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Enrolled Students</span>
                <div className="text-2xl font-heading font-black text-slate-900 mt-1">
                  {overviewData.metrics.totalStudents} Students
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">Active in selected criteria</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Demanded Fee</span>
                <div className="text-2xl font-heading font-black text-indigo-900 mt-1">
                  ₹{overviewData.metrics.totalDemandedFee.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">Base Fee after Discounts</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Collected</span>
                <div className="text-2xl font-heading font-black text-emerald-600 mt-1">
                  ₹{overviewData.metrics.totalCollectedFee.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Realized in bank / cash</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Pending Fee Dues</span>
                <div className="text-2xl font-heading font-black text-rose-600 mt-1">
                  ₹{overviewData.metrics.totalPendingFee.toLocaleString('en-IN')}
                </div>
                <p className="text-[11px] text-rose-600 font-semibold mt-0.5">Outstanding collection</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Student Table */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                Student Fee Ledger & Status Table ({filteredStudents.length} Records)
              </h2>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500 font-semibold">Calculating live fee ledger...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">No student records found in selected class/section.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="px-4 py-3">Student / Admission No</th>
                      <th className="px-4 py-3">Class & Sec</th>
                      <th className="px-4 py-3 text-right">Total Fee</th>
                      <th className="px-4 py-3 text-right">Discount</th>
                      <th className="px-4 py-3 text-right">Net Payable</th>
                      <th className="px-4 py-3 text-right">Paid</th>
                      <th className="px-4 py-3 text-right">Pending</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((st) => (
                      <tr key={st.studentId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{st.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ADM: {st.admissionNo} • Roll #{st.rollNo}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {st.className} - {st.section}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-700">
                          ₹{st.totalBaseFee.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-amber-600">
                          {st.discountAmount > 0 ? `-₹${st.discountAmount.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">
                          ₹{st.netPayableFee.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold text-emerald-600">
                          ₹{st.totalPaid.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold text-rose-600">
                          ₹{st.pendingAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            st.status === 'Paid' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : st.status === 'Partial'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {st.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenLedger(st.studentId)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold inline-flex items-center gap-1 transition"
                              title="View Complete Fee Ledger & Installments"
                            >
                              <Eye className="w-3 h-3" /> Ledger
                            </button>

                            <button
                              onClick={() => handleOpenCollectModalForStudent(st.studentId, st.pendingAmount)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-xs transition"
                              title="Collect Payment"
                            >
                              <Receipt className="w-3 h-3" /> Collect
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CLASS FEE STRUCTURES SETUP
         ========================================================================= */}
      {activeTab === 'structures' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-base text-slate-900">
              Class Fee Structures (Academic Year {academicYear})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {structures.map((s) => (
              <div key={s._id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 relative">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Class {s.class?.name || s.className}
                    </span>
                    <h3 className="font-bold text-slate-900 mt-2 text-sm">{s.className} Base Fee Structure</h3>
                  </div>
                  <button
                    onClick={() => handleDeleteStructure(s._id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Fee Structure"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Fee Heads Breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fee Category Breakdown:</div>
                  {s.feeHeads?.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-700">
                      <span className="font-medium">{h.headName}</span>
                      <span className="font-bold font-mono">₹{h.amount?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                  <span className="font-bold text-slate-700 text-xs">Total Base Demanded Fee:</span>
                  <span className="text-lg font-heading font-black text-emerald-600">
                    ₹{s.totalBaseFee?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: RECEIPT REGISTRY
         ========================================================================= */}
      {activeTab === 'receipts' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              Official Computerized Receipts Registry ({receipts.length})
            </h2>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search receipt no, student, class..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Receipt No</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Ref No</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {receipts.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">{rec.receiptNo}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{rec.studentName}</td>
                    <td className="px-4 py-3 text-slate-600">{rec.className}</td>
                    <td className="px-4 py-3 font-extrabold text-slate-900">₹{rec.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      {new Date(rec.paymentDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {rec.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">
                      {rec.transactionRefNo || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReceipt(rec)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1 border border-emerald-200"
                        >
                          <Printer className="w-3 h-3" /> Print
                        </button>
                        <button
                          onClick={() => handleOpenEditReceipt(rec)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Edit Receipt Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteReceipt(rec._id, rec.receiptNo)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Delete Receipt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: REPORTS & ANALYTICS
         ========================================================================= */}
      {activeTab === 'reports' && reportsData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Collection Realized</span>
              <div className="text-2xl font-heading font-black text-emerald-600 mt-1">
                ₹{reportsData.totalCollection?.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Across {reportsData.totalReceiptsCount} transactions</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Scholarships / Discounts</span>
              <div className="text-2xl font-heading font-black text-amber-600 mt-1">
                ₹{reportsData.totalDiscountsGiven?.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Approved fee concessions</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Pending Dues Across School</span>
              <div className="text-2xl font-heading font-black text-rose-600 mt-1">
                ₹{reportsData.totalPendingAcrossSchool?.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Outstanding student fees</p>
            </div>
          </div>

          {/* Payment Mode Breakdown */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-slate-900">Payment Mode-Wise Collection Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(reportsData.modeAggregation || {}).map(([mode, amt]) => (
                <div key={mode} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">{mode}</span>
                  <div className="text-lg font-bold text-slate-900 mt-1">₹{amt.toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: STUDENT COMPLETE FEE LEDGER & INSTALLMENTS DRAWER
         ========================================================================= */}
      {isLedgerModalOpen && selectedStudentLedger && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-200">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Student Fee Ledger • Session {selectedStudentLedger.academicYear}
                </span>
                <h3 className="text-xl font-heading font-black text-slate-900 mt-1">
                  {selectedStudentLedger.studentName}
                </h3>
                <p className="text-xs text-slate-500">
                  ADM: <strong>{selectedStudentLedger.admissionNo}</strong> • {selectedStudentLedger.className} - {selectedStudentLedger.section} • Roll #{selectedStudentLedger.rollNo}
                </p>
              </div>
              <button 
                onClick={() => setIsLedgerModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Financial Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900 text-white">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Base Fee</span>
                <div className="text-base font-bold text-white mt-0.5">₹{selectedStudentLedger.totalBaseFee.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Discount</span>
                <div className="text-base font-bold text-amber-400 mt-0.5">-₹{selectedStudentLedger.discountAmount.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Paid</span>
                <div className="text-base font-bold text-emerald-400 mt-0.5">₹{selectedStudentLedger.totalPaid.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Due</span>
                <div className="text-base font-bold text-rose-400 mt-0.5">₹{selectedStudentLedger.pendingAmount.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Discount Action Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
              <div>
                <span className="font-bold text-amber-900">Scholarship / Discount:</span>{' '}
                <span className="font-bold text-amber-700">₹{selectedStudentLedger.discountAmount.toLocaleString('en-IN')}</span>{' '}
                {selectedStudentLedger.discountReason && <span className="text-amber-800">({selectedStudentLedger.discountReason})</span>}
              </div>
              <button
                onClick={() => handleOpenDiscountModal(selectedStudentLedger)}
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-[11px]"
              >
                Set Discount
              </button>
            </div>

            {/* Installments Schedule */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Installment Breakdown</h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                {selectedStudentLedger.installments?.map((inst) => (
                  <div key={inst.installmentNo} className="p-3.5 flex items-center justify-between bg-white">
                    <div>
                      <div className="font-bold text-slate-900">{inst.title}</div>
                      <div className="text-[10px] text-slate-400">Due Date: {inst.dueDate ? new Date(inst.dueDate).toLocaleDateString('en-IN') : 'N/A'}</div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="font-bold text-slate-900">₹{inst.amount.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold">Paid: ₹{inst.paidAmount?.toLocaleString('en-IN') || 0}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        inst.status === 'Paid' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : inst.status === 'Partial'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {inst.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Payment History Receipts</h4>
              <div className="space-y-2">
                {selectedStudentLedger.paymentHistory?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No payments recorded yet.</p>
                ) : (
                  selectedStudentLedger.paymentHistory?.map((p) => (
                    <div key={p._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-emerald-700">{p.receiptNo}</span> • <span className="text-slate-600">{new Date(p.paymentDate).toLocaleDateString('en-IN')}</span>
                        <div className="text-[10px] text-slate-400">{p.paymentMethod} • {p.feeType}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-slate-900 text-sm">₹{p.amount.toLocaleString('en-IN')}</span>
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold"
                        >
                          View Receipt
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setIsLedgerModalOpen(false);
                  handleOpenCollectModalForStudent(selectedStudentLedger.studentId, selectedStudentLedger.pendingAmount);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
              >
                Collect Payment For Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: APPLY DISCOUNT / SCHOLARSHIP
         ========================================================================= */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-heading font-black text-slate-900">Set Student Fee Discount / Scholarship</h3>
            <form onSubmit={handleDiscountSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Student</label>
                <input
                  type="text"
                  disabled
                  value={discountForm.studentName}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-100 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Discount Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={discountForm.discountAmount}
                  onChange={(e) => setDiscountForm({ ...discountForm, discountAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Reason for Discount *</label>
                <input
                  type="text"
                  required
                  value={discountForm.reason}
                  onChange={(e) => setDiscountForm({ ...discountForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Authorized Person *</label>
                <input
                  type="text"
                  required
                  value={discountForm.authorizedBy}
                  onChange={(e) => setDiscountForm({ ...discountForm, authorizedBy: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDiscountModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
                >
                  Save Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: COLLECT FEE PAYMENT MODAL
         ========================================================================= */}
      {isCollectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-heading font-black text-slate-900">Record Fee Payment & Issue Receipt</h3>
            <form onSubmit={handleCollectSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Select Student *</label>
                <select
                  required
                  value={collectForm.studentId}
                  onChange={(e) => setCollectForm({ ...collectForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">Choose Student</option>
                  {studentsList.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} (Class {st.class?.name} - ADM #{st.admissionNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={collectForm.amount}
                    onChange={(e) => setCollectForm({ ...collectForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Payment Method</label>
                  <select
                    value={collectForm.paymentMethod}
                    onChange={(e) => setCollectForm({ ...collectForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online Payment">Online Payment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Transaction Ref / Cheque No</label>
                <input
                  type="text"
                  placeholder="e.g. UPI-982138910 or Cheque #00128"
                  value={collectForm.transactionRefNo}
                  onChange={(e) => setCollectForm({ ...collectForm, transactionRefNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Fee Category / Installment</label>
                <input
                  type="text"
                  value={collectForm.feeType}
                  onChange={(e) => setCollectForm({ ...collectForm, feeType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Fee received at counter"
                  value={collectForm.remarks}
                  onChange={(e) => setCollectForm({ ...collectForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
                >
                  Generate Receipt & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: CLASS FEE STRUCTURE EDITOR MODAL
         ========================================================================= */}
      {isStructureModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-heading font-black text-slate-900">Define Class Fee Structure ({academicYear})</h3>
            <form onSubmit={handleStructureSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Class *</label>
                <select
                  required
                  value={structureForm.classId}
                  onChange={(e) => setStructureForm({ ...structureForm, classId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c._id} value={c._id}>Class {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Fee Heads */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 uppercase">Fee Category Heads</label>
                  <button
                    type="button"
                    onClick={addFeeHeadRow}
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-bold"
                  >
                    + Add Fee Head
                  </button>
                </div>

                {structureForm.feeHeads?.map((head, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Head Name"
                      value={head.headName}
                      onChange={(e) => updateFeeHeadRow(idx, 'headName', e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Amount"
                      value={head.amount}
                      onChange={(e) => updateFeeHeadRow(idx, 'amount', e.target.value)}
                      className="w-28 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => removeFeeHeadRow(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsStructureModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Save Fee Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: EDIT RECEIPT DETAILS MODAL
         ========================================================================= */}
      {editingReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Edit Receipt Details — {editingReceipt.receiptNo}
                </h3>
                <p className="text-xs text-slate-500">Student: <strong>{editingReceipt.studentName}</strong></p>
              </div>
              <button 
                onClick={() => setEditingReceipt(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditReceipt} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Paid Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={editReceiptForm.amount}
                  onChange={(e) => setEditReceiptForm({ ...editReceiptForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Fee Head / Type</label>
                <input
                  type="text"
                  required
                  value={editReceiptForm.feeType}
                  onChange={(e) => setEditReceiptForm({ ...editReceiptForm, feeType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={editReceiptForm.paymentMethod}
                  onChange={(e) => setEditReceiptForm({ ...editReceiptForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Online Payment">Online Portal</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transaction Ref / Cheque No</label>
                <input
                  type="text"
                  placeholder="e.g. UPI/1298401924"
                  value={editReceiptForm.transactionRefNo}
                  onChange={(e) => setEditReceiptForm({ ...editReceiptForm, transactionRefNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Remarks / Correction Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Corrected typo in amount"
                  value={editReceiptForm.remarks}
                  onChange={(e) => setEditReceiptForm({ ...editReceiptForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingReceipt(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: PROFESSIONAL COMPUTERIZED PRINTABLE RECEIPT MODAL
         ========================================================================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 border border-slate-200 printable-receipt">
            {/* Header */}
            <div className="text-center border-b pb-4 border-slate-200 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <img src="/logo.png" alt="NVP Logo" className="w-8 h-8 object-contain" />
                <h2 className="text-xl font-heading font-black text-slate-900 tracking-tight">NVP ENGLISH MEDIUM SCHOOL</h2>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold">Nimbi Jodhan, Ladnun, Nagaur, Rajasthan - 341316</p>
              <p className="text-[11px] font-black text-emerald-700 uppercase tracking-widest pt-1">
                OFFICIAL FEE PAYMENT RECEIPT ({selectedReceipt.academicYear || '2026-2027'})
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Receipt Number</p>
                <p className="font-mono font-bold text-slate-900 text-sm">{selectedReceipt.receiptNo}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Payment Date</p>
                <p className="font-bold text-slate-900">{new Date(selectedReceipt.paymentDate).toLocaleDateString('en-IN')}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Student Name</p>
                <p className="font-bold text-slate-900">{selectedReceipt.studentName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Admission No</p>
                <p className="font-mono font-bold text-slate-900">{selectedReceipt.admissionNo || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Class & Section</p>
                <p className="font-bold text-slate-900">{selectedReceipt.className} - {selectedReceipt.section || 'A'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Payment Method</p>
                <p className="font-bold text-slate-900">{selectedReceipt.paymentMethod} {selectedReceipt.transactionRefNo ? `(${selectedReceipt.transactionRefNo})` : ''}</p>
              </div>
            </div>

            {/* Fee Details Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Fee Head / Category:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.feeType}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Previous Balance Due:</span>
                <span className="font-bold font-mono">₹{selectedReceipt.previousBalance?.toLocaleString('en-IN') || 0}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 text-sm">Amount Paid:</span>
                <span className="text-2xl font-heading font-black text-emerald-600">
                  ₹{selectedReceipt.amount?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>Remaining Balance Due:</span>
                <span className="font-bold font-mono text-rose-600">₹{selectedReceipt.remainingBalance?.toLocaleString('en-IN') || 0}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-4 border-t border-slate-200">
              <div>
                <p>Received By: <strong>{selectedReceipt.receivedBy || 'Accounts Office'}</strong></p>
                <p className="text-[9px] text-slate-400 mt-0.5">Computer Generated Valid Receipt</p>
              </div>
              <div className="text-right">
                <div className="w-28 h-8 border-b border-slate-400 mb-1"></div>
                <p className="font-bold text-[10px]">Authorized Signatory</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 no-print">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
