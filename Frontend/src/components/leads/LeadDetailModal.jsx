import React, { useState } from 'react';
import { leadAPI } from '../../services/api';
import { toast } from 'react-toastify';

const LeadDetailModal = ({ lead, onClose }) => {
  const [notes, setNotes] = useState(lead.notes || []);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setLoading(true);
    try {
      const response = await leadAPI.addNote(lead._id, { content: newNote });
      setNotes(response.data.data.notes);
      setNewNote('');
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to add note');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (noteId) => {
    if (!editNoteContent.trim()) return;

    setLoading(true);
    try {
      const response = await leadAPI.updateNote(lead._id, noteId, { content: editNoteContent });
      setNotes(response.data.data.notes);
      setEditingNoteId(null);
      setEditNoteContent('');
      toast.success('Note updated successfully');
    } catch (error) {
      toast.error('Failed to update note');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    setLoading(true);
    try {
      await leadAPI.deleteNote(lead._id, noteId);
      setNotes(notes.filter(note => note._id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const startEditNote = (note) => {
    setEditingNoteId(note._id);
    setEditNoteContent(note.content);
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditNoteContent('');
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Lead Details</h2>
          <button className="close-btn" onClick={() => onClose(false)}>
            ×
          </button>
        </div>

        <div className="lead-details">
          <div className="detail-section">
            <h3>Contact Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Name:</label>
                <span>{lead.name}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{lead.email}</span>
              </div>
              <div className="detail-item">
                <label>Phone:</label>
                <span>{lead.phone}</span>
              </div>
              <div className="detail-item">
                <label>Source:</label>
                <span>{lead.source}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`badge badge-${lead.status.toLowerCase()}`}>
                  {lead.status}
                </span>
              </div>
              <div className="detail-item">
                <label>Assigned To:</label>
                <span>{lead.assignedTo?.name || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Tags</h3>
            <div className="tags-container">
              {lead.tags && lead.tags.length > 0 ? (
                lead.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))
              ) : (
                <p className="no-data">No tags</p>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h3>Timeline</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Created:</label>
                <span>{new Date(lead.createdAt).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <label>Last Updated:</label>
                <span>{new Date(lead.updatedAt).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <label>Created By:</label>
                <span>{lead.createdBy?.name || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Notes & Comments</h3>
            
            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="add-note-form">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Add a note or comment..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary btn-small"
                disabled={loading || !newNote.trim()}
              >
                Add Note
              </button>
            </form>

            {/* Notes List */}
            <div className="notes-list">
              {notes.length === 0 ? (
                <p className="no-data">No notes yet</p>
              ) : (
                notes.map((note) => (
                  <div key={note._id} className="note-item">
                    <div className="note-header">
                      <div className="note-author">
                        <strong>{note.createdBy?.name}</strong>
                        <span className="note-date">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="note-actions">
                        <button
                          onClick={() => startEditNote(note)}
                          className="btn btn-secondary btn-small"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="btn btn-danger btn-small"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {editingNoteId === note._id ? (
                      <div className="edit-note-form">
                        <textarea
                          className="form-control"
                          rows="3"
                          value={editNoteContent}
                          onChange={(e) => setEditNoteContent(e.target.value)}
                          disabled={loading}
                        />
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <button
                            onClick={() => handleUpdateNote(note._id)}
                            className="btn btn-primary btn-small"
                            disabled={loading || !editNoteContent.trim()}
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditNote}
                            className="btn btn-secondary btn-small"
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="note-content">{note.content}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
