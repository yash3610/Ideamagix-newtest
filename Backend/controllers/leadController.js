const Lead = require('../models/Lead');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all leads with filters
// @route   GET /api/leads
// @access  Private
exports.getLeads = async (req, res) => {
  try {
    const {
      status,
      tags,
      assignedTo,
      dateFrom,
      dateTo,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = {};

    // For agents, only show their assigned leads
    if (req.user.role === 'agent') {
      query.assignedTo = req.user._id;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Filter by assigned agent
    if (assignedTo && req.user.role !== 'agent') {
      query.assignedTo = assignedTo;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Search by name, email, or phone
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('notes.createdBy', 'name email')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Lead.countDocuments(query);

    res.json({
      success: true,
      count: leads.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: leads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
exports.getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email role')
      .populate('notes.createdBy', 'name email');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if agent is authorized to view this lead
    if (req.user.role === 'agent' && 
        lead.assignedTo && 
        lead.assignedTo._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this lead'
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Private (Admin only)
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, source, status, tags, assignedTo } = req.body;

    const lead = await Lead.create({
      name,
      email,
      phone,
      source,
      status: status || 'New',
      tags: tags || [],
      assignedTo,
      createdBy: req.user._id
    });

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'CREATE_LEAD',
      resource: 'lead',
      resourceId: lead._id,
      details: `Created lead: ${name}`,
      ipAddress: req.ip
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedLead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
exports.updateLead = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if agent is authorized to update this lead
    if (req.user.role === 'agent' && 
        lead.assignedTo && 
        lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead'
      });
    }

    const { name, email, phone, source, status, tags, assignedTo } = req.body;

    // Update fields
    if (name) lead.name = name;
    if (email) lead.email = email;
    if (phone) lead.phone = phone;
    if (source) lead.source = source;
    if (status) lead.status = status;
    if (tags) lead.tags = tags;
    
    // Only admins can reassign leads
    if (assignedTo && (req.user.role === 'superadmin' || req.user.role === 'subadmin')) {
      lead.assignedTo = assignedTo;
    }

    await lead.save();

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'UPDATE_LEAD',
      resource: 'lead',
      resourceId: lead._id,
      details: `Updated lead: ${lead.name}`,
      ipAddress: req.ip
    });

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('notes.createdBy', 'name email');

    res.json({
      success: true,
      data: updatedLead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private (Admin only)
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    await lead.deleteOne();

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'DELETE_LEAD',
      resource: 'lead',
      resourceId: lead._id,
      details: `Deleted lead: ${lead.name}`,
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add note to lead
// @route   POST /api/leads/:id/notes
// @access  Private
exports.addNote = async (req, res) => {
  try {
    const { content } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check authorization for agents
    if (req.user.role === 'agent' && 
        lead.assignedTo && 
        lead.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add notes to this lead'
      });
    }

    lead.notes.push({
      content,
      createdBy: req.user._id
    });

    await lead.save();

    // Log activity
    await ActivityLog.create({
      user: req.user._id,
      action: 'ADD_NOTE',
      resource: 'lead',
      resourceId: lead._id,
      details: `Added note to lead: ${lead.name}`,
      ipAddress: req.ip
    });

    const updatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('notes.createdBy', 'name email');

    res.json({
      success: true,
      data: updatedLead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update note
// @route   PUT /api/leads/:id/notes/:noteId
// @access  Private
exports.updateNote = async (req, res) => {
  try {
    const { content } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const note = lead.notes.id(req.params.noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Only the creator can update the note
    if (note.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this note'
      });
    }

    note.content = content;
    await lead.save();

    const updatedLead = await Lead.findById(lead._id)
      .populate('notes.createdBy', 'name email');

    res.json({
      success: true,
      data: updatedLead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete note
// @route   DELETE /api/leads/:id/notes/:noteId
// @access  Private
exports.deleteNote = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const note = lead.notes.id(req.params.noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Only the creator or admin can delete the note
    if (note.createdBy.toString() !== req.user._id.toString() && 
        req.user.role === 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this note'
      });
    }

    lead.notes.pull(req.params.noteId);
    await lead.save();

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all unique tags
// @route   GET /api/leads/tags/all
// @access  Private
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Lead.distinct('tags');

    res.json({
      success: true,
      count: tags.length,
      data: tags
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
