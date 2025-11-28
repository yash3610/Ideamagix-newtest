const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  addNote,
  updateNote,
  deleteNote,
  getAllTags
} = require('../controllers/leadController');
const { importLeads, exportLeads } = require('../utils/excelHandler');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('Only Excel files are allowed'));
    }
    cb(null, true);
  }
});

// All routes require authentication
router.use(protect);

// Get all tags (accessible to all authenticated users)
router.get('/tags/all', getAllTags);

// Import/Export routes (admin only)
router.post('/import', isAdmin, upload.single('file'), importLeads);
router.get('/export', exportLeads);

// CRUD routes
router.route('/')
  .get(getLeads)
  .post(isAdmin, createLead);

router.route('/:id')
  .get(getLead)
  .put(updateLead)
  .delete(isAdmin, deleteLead);

// Notes routes
router.post('/:id/notes', addNote);
router.put('/:id/notes/:noteId', updateNote);
router.delete('/:id/notes/:noteId', deleteNote);

module.exports = router;
