const express = require('express');
const router = express.Router();
const LibraryBook = require('../models/LibraryBook');
const BookIssue = require('../models/BookIssue');
const Student = require('../models/Student');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// @route   GET /api/library/books
// @desc    Get all books in library with search and filters
// @access  Private
router.get('/books', protect, async (req, res) => {
  try {
    const { search, category, classStandard } = req.query;
    let query = {};

    if (category && category !== 'All') query.category = category;
    if (classStandard && classStandard !== 'All') query.classStandard = classStandard;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { bookCode: { $regex: search, $options: 'i' } }
      ];
    }

    const books = await LibraryBook.find(query).sort({ title: 1 });
    const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
    const availableCopies = books.reduce((sum, b) => sum + b.availableCopies, 0);
    const issuedCopies = Math.max(0, totalCopies - availableCopies);

    res.json({
      success: true,
      count: books.length,
      totalCopies,
      availableCopies,
      issuedCopies,
      books
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/library/books
// @desc    Add new book to library
// @access  Private (HEAD, PRINCIPAL, LIBRARIAN)
router.post('/books', protect, async (req, res) => {
  try {
    const data = req.body;
    if (!data.title || !data.author) {
      return res.status(400).json({ success: false, message: 'Book title and author are required.' });
    }

    if (!data.bookCode) {
      data.bookCode = `LIB-${Date.now().toString().slice(-5)}`;
    }

    data.totalCopies = Number(data.totalCopies || 1);
    data.availableCopies = Number(data.totalCopies || 1);

    const book = await LibraryBook.create(data);
    res.status(201).json({ success: true, message: 'Book added to library successfully.', book });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/library/issue
// @desc    Issue a book to student or teacher
// @access  Private
router.post('/issue', protect, async (req, res) => {
  try {
    const { bookId, borrowerType, borrowerId, dueDateDays, remarks } = req.body;

    const book = await LibraryBook.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ success: false, message: 'No available copies of this book in stock.' });
    }

    let borrowerName = '';
    let borrowerDetail = '';
    let borrowerRefObj = null;

    if (borrowerType === 'STUDENT') {
      borrowerRefObj = await Student.findById(borrowerId).populate('class', 'name section');
      if (!borrowerRefObj) {
        return res.status(404).json({ success: false, message: 'Student record not found.' });
      }
      borrowerName = borrowerRefObj.name;
      borrowerDetail = `Class ${borrowerRefObj.class?.name || ''} (${borrowerRefObj.class?.section || 'A'}) - AdmNo: ${borrowerRefObj.admissionNo}`;
    } else {
      borrowerRefObj = await User.findById(borrowerId);
      if (!borrowerRefObj) {
        return res.status(404).json({ success: false, message: 'Teacher/Staff record not found.' });
      }
      borrowerName = borrowerRefObj.name;
      borrowerDetail = `Faculty (${borrowerRefObj.role}) - ${borrowerRefObj.email}`;
    }

    const days = Number(dueDateDays || 14);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    const issueRecord = await BookIssue.create({
      book: book._id,
      bookTitle: book.title,
      bookCode: book.bookCode,
      borrowerType,
      borrowerRef: borrowerRefObj._id,
      borrowerName,
      borrowerDetail,
      dueDate,
      remarks: remarks || '',
      issuedBy: req.user._id,
      status: 'ISSUED'
    });

    book.availableCopies -= 1;
    if (book.availableCopies <= 0) book.status = 'ISSUED';
    await book.save();

    res.status(201).json({
      success: true,
      message: `Book "${book.title}" issued successfully to ${borrowerName}.`,
      issueRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/library/return/:issueId
// @desc    Return an issued book
// @access  Private
router.post('/return/:issueId', protect, async (req, res) => {
  try {
    const issueRecord = await BookIssue.findById(req.params.issueId);
    if (!issueRecord) {
      return res.status(404).json({ success: false, message: 'Issue record not found.' });
    }

    if (issueRecord.status === 'RETURNED') {
      return res.status(400).json({ success: false, message: 'Book has already been returned.' });
    }

    const book = await LibraryBook.findById(issueRecord.book);
    if (book) {
      book.availableCopies += 1;
      book.status = 'AVAILABLE';
      await book.save();
    }

    issueRecord.returnDate = new Date();
    issueRecord.status = 'RETURNED';

    // Calculate fine if overdue
    if (new Date() > issueRecord.dueDate) {
      const diffTime = Math.abs(new Date() - issueRecord.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      issueRecord.fineAmount = diffDays * 5; // Rs. 5 per day overdue
    }

    await issueRecord.save();

    res.json({
      success: true,
      message: `Book "${issueRecord.bookTitle}" returned successfully.${issueRecord.fineAmount > 0 ? ` Overdue fine: ₹${issueRecord.fineAmount}` : ''}`,
      issueRecord
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/library/issues
// @desc    Get all book issue/return history
// @access  Private
router.get('/issues', protect, async (req, res) => {
  try {
    const issues = await BookIssue.find().sort({ createdAt: -1 });
    const activeIssuedCount = issues.filter(i => i.status === 'ISSUED').length;
    const overdueCount = issues.filter(i => i.status === 'ISSUED' && new Date() > new Date(i.dueDate)).length;

    res.json({
      success: true,
      count: issues.length,
      activeIssuedCount,
      overdueCount,
      issues
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
