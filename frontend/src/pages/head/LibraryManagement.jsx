import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  UserCheck,
  RotateCcw,
  DollarSign,
  FileText,
  Bookmark
} from 'lucide-react';
import api from '../../services/api';

export default function LibraryManagement() {
  const [activeTab, setActiveTab] = useState('books'); // 'books', 'issues', 'fines'
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [stats, setStats] = useState({ totalBooks: 0, totalCopies: 0, availableCopies: 0, issuedCopies: 0, overdueIssues: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Modals
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title: '', author: '', isbn: '', targetClass: '', subject: '', quantity: 1, availableCopies: 1, price: 0, publisher: '', rackLocation: ''
  });

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    bookId: '', borrowerType: 'Student', studentId: '', teacherId: '', borrowerName: '', borrowerRollNo: '', dueDate: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, iRes, sRes, tRes] = await Promise.all([
        api.get('/library/books'),
        api.get('/library/issues'),
        api.get('/students'),
        api.get('/teachers')
      ]);

      const booksList = bRes.data.data || bRes.data || [];
      const issuesList = iRes.data.data || iRes.data || [];
      setBooks(booksList);
      setIssues(issuesList);
      setStudents(sRes.data.data || sRes.data || []);
      setTeachers(tRes.data.data || tRes.data || []);

      // Calculate stats
      let totalC = 0;
      let availC = 0;
      booksList.forEach(b => {
        totalC += (b.quantity || 0);
        availC += (b.availableCopies !== undefined ? b.availableCopies : b.quantity || 0);
      });
      const activeIss = issuesList.filter(i => i.status === 'Issued');
      const overdue = issuesList.filter(i => i.status === 'Issued' && new Date(i.dueDate) < new Date());

      setStats({
        totalBooks: booksList.length,
        totalCopies: totalC,
        availableCopies: availC,
        issuedCopies: activeIss.length,
        overdueIssues: overdue.length
      });
    } catch (err) {
      console.error('Error fetching library data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      if (editingBook) {
        await api.put(`/library/books/${editingBook._id}`, bookForm);
      } else {
        await api.post('/library/books', bookForm);
      }
      setShowAddBookModal(false);
      setEditingBook(null);
      resetBookForm();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving book');
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await api.delete(`/library/books/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting book');
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    try {
      await api.post('/library/issues', issueForm);
      setShowIssueModal(false);
      resetIssueForm();
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error issuing book');
    }
  };

  const handleReturnBook = async (issueId) => {
    const finePaid = window.prompt('Enter fine amount collected (if any):', '0');
    if (finePaid === null) return;
    try {
      await api.put(`/library/issues/${issueId}/return`, { finePaid: parseFloat(finePaid) || 0 });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error returning book');
    }
  };

  const resetBookForm = () => {
    setBookForm({
      title: '', author: '', isbn: '', targetClass: '', subject: '', quantity: 1, availableCopies: 1, price: 0, publisher: '', rackLocation: ''
    });
  };

  const resetIssueForm = () => {
    setIssueForm({
      bookId: '', borrowerType: 'Student', studentId: '', teacherId: '', borrowerName: '', borrowerRollNo: '', dueDate: ''
    });
  };

  const openEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      targetClass: book.targetClass || '',
      subject: book.subject || '',
      quantity: book.quantity || 1,
      availableCopies: book.availableCopies || 1,
      price: book.price || 0,
      publisher: book.publisher || '',
      rackLocation: book.rackLocation || ''
    });
    setShowAddBookModal(true);
  };

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
                          b.author.toLowerCase().includes(search.toLowerCase()) ||
                          (b.isbn && b.isbn.toLowerCase().includes(search.toLowerCase()));
    const matchesSubject = !selectedSubject || b.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjectsList = Array.from(new Set(books.map(b => b.subject).filter(Boolean)));

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            Library Management System
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage school books catalogue, issuance, returns, and borrower records cleanly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition text-slate-600"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { resetIssueForm(); setShowIssueModal(true); }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <UserCheck className="w-4 h-4" /> Issue Book
          </button>
          <button
            onClick={() => { setEditingBook(null); resetBookForm(); setShowAddBookModal(true); }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Add New Book
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Titles</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalBooks}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Copies</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalCopies}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Bookmark className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Available Copies</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.availableCopies}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Issued Books</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.issuedCopies}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Overdue Issues</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats.overdueIssues}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab('books')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'books' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Book Catalogue ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'issues' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <RotateCcw className="w-4 h-4" /> Issue & Return History ({issues.length})
        </button>
      </div>

      {/* TAB 1: BOOK CATALOGUE */}
      {activeTab === 'books' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-3 mb-4 justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by book title, author, or ISBN..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Subjects</option>
              {subjectsList.map((sub, i) => (
                <option key={i} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading library catalogue...</div>
          ) : filteredBooks.length === 0 ? (
            <div className="py-12 text-center text-slate-400">No books found in the catalogue.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-medium">
                    <th className="py-3 px-4">Book Title</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">ISBN</th>
                    <th className="py-3 px-4">Subject / Class</th>
                    <th className="py-3 px-4 text-center">Available / Total</th>
                    <th className="py-3 px-4">Rack Location</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.map((book) => {
                    const available = book.availableCopies !== undefined ? book.availableCopies : book.quantity;
                    return (
                      <tr key={book._id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-semibold text-slate-800">{book.title}</td>
                        <td className="py-3 px-4 text-slate-600">{book.author}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-xs">{book.isbn || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium mr-1">
                            {book.subject || 'General'}
                          </span>
                          {book.targetClass && (
                            <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-medium">
                              Class {book.targetClass}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-medium">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            available > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {available} / {book.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{book.rackLocation || 'Shelf A-1'}</td>
                        <td className="py-3 px-4 text-slate-600 font-medium">₹{book.price || 0}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => openEditBook(book)}
                            className="p-1 text-slate-500 hover:text-indigo-600 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book._id)}
                            className="p-1 text-slate-500 hover:text-rose-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ISSUES & RETURNS */}
      {activeTab === 'issues' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 text-base">Active Book Issues & History</h3>
            <span className="text-xs text-slate-500">Total Transactions: {issues.length}</span>
          </div>

          {issues.length === 0 ? (
            <div className="py-12 text-center text-slate-400">No book issue records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-medium">
                    <th className="py-3 px-4">Book Title</th>
                    <th className="py-3 px-4">Borrower Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Fine Collected</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {issues.map((iss) => {
                    const isOverdue = iss.status === 'Issued' && new Date(iss.dueDate) < new Date();
                    return (
                      <tr key={iss._id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-semibold text-slate-800">{iss.bookId?.title || 'Book Item'}</td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {iss.borrowerName} {iss.borrowerRollNo ? `(${iss.borrowerRollNo})` : ''}
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase">{iss.borrowerType}</td>
                        <td className="py-3 px-4 text-slate-600">{new Date(iss.issueDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-slate-600 font-medium">{new Date(iss.dueDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          {iss.status === 'Returned' ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                              <CheckCircle className="w-3 h-3" /> Returned
                            </span>
                          ) : isOverdue ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                              <AlertCircle className="w-3 h-3" /> Overdue
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                              <Clock className="w-3 h-3" /> Issued
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">₹{iss.finePaid || 0}</td>
                        <td className="py-3 px-4 text-right">
                          {iss.status === 'Issued' && (
                            <button
                              onClick={() => handleReturnBook(iss._id)}
                              className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-semibold transition"
                            >
                              Return Book
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD / EDIT BOOK */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingBook ? 'Edit Book Record' : 'Add New Book to Library'}
              </h3>
              <button
                onClick={() => setShowAddBookModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={bookForm.title}
                  onChange={e => setBookForm({ ...bookForm, title: e.target.value })}
                  placeholder="e.g. NCERT Science Class 10"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Author *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.author}
                    onChange={e => setBookForm({ ...bookForm, author: e.target.value })}
                    placeholder="Author Name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ISBN Number</label>
                  <input
                    type="text"
                    value={bookForm.isbn}
                    onChange={e => setBookForm({ ...bookForm, isbn: e.target.value })}
                    placeholder="978-3-16-148410-0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={bookForm.subject}
                    onChange={e => setBookForm({ ...bookForm, subject: e.target.value })}
                    placeholder="e.g. Science, Maths, English"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Class</label>
                  <input
                    type="text"
                    value={bookForm.targetClass}
                    onChange={e => setBookForm({ ...bookForm, targetClass: e.target.value })}
                    placeholder="e.g. 10 or All"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bookForm.quantity}
                    onChange={e => {
                      const qty = parseInt(e.target.value) || 1;
                      setBookForm({ ...bookForm, quantity: qty, availableCopies: qty });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={bookForm.price}
                    onChange={e => setBookForm({ ...bookForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rack / Shelf</label>
                  <input
                    type="text"
                    value={bookForm.rackLocation}
                    onChange={e => setBookForm({ ...bookForm, rackLocation: e.target.value })}
                    placeholder="Shelf B-4"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Publisher</label>
                <input
                  type="text"
                  value={bookForm.publisher}
                  onChange={e => setBookForm({ ...bookForm, publisher: e.target.value })}
                  placeholder="NCERT / Oxford / McGraw Hill"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
                >
                  {editingBook ? 'Update Book' : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE BOOK */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">Issue Book to Student or Teacher</h3>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueBook} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Book *</label>
                <select
                  required
                  value={issueForm.bookId}
                  onChange={e => setIssueForm({ ...issueForm, bookId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Choose a Book --</option>
                  {books.filter(b => (b.availableCopies !== undefined ? b.availableCopies : b.quantity) > 0).map(b => (
                    <option key={b._id} value={b._id}>
                      {b.title} (Available: {b.availableCopies !== undefined ? b.availableCopies : b.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Borrower Category *</label>
                  <select
                    value={issueForm.borrowerType}
                    onChange={e => setIssueForm({ ...issueForm, borrowerType: e.target.value, borrowerName: '' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Student">Student</option>
                    <option value="Teacher">Teacher</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Return Due Date *</label>
                  <input
                    type="date"
                    required
                    value={issueForm.dueDate}
                    onChange={e => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {issueForm.borrowerType === 'Student' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
                  <select
                    required
                    onChange={e => {
                      const st = students.find(s => s._id === e.target.value);
                      if (st) {
                        setIssueForm({
                          ...issueForm,
                          studentId: st._id,
                          borrowerName: st.name,
                          borrowerRollNo: st.rollNumber || ''
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.name} (Class {s.classId?.name || ''} - Roll #{s.rollNumber || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Teacher *</label>
                  <select
                    required
                    onChange={e => {
                      const t = teachers.find(tc => tc._id === e.target.value);
                      if (t) {
                        setIssueForm({
                          ...issueForm,
                          teacherId: t._id,
                          borrowerName: t.name || t.fullName || 'Teacher'
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Choose Teacher --</option>
                    {teachers.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.name || t.fullName} ({t.subjectSpecialization || 'Faculty'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
