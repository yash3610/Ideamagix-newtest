import React, { useState } from 'react';
import { leadAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const LeadDetailModal = ({ lead, onClose }) => {
  const [notes, setNotes] = useState(lead.notes || []);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setLoading(true);
    try {
      await leadAPI.addNote(lead._id, { content: newNote });
      toast.success('Note added successfully');
      
      // Refresh lead data
      const response = await leadAPI.getOne(lead._id);
      setNotes(response.data.data.notes);
      setNewNote('');
    } catch (error) {
      toast.error('Failed to add note');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      await leadAPI.deleteNote(lead._id, noteId);
      toast.success('Note deleted');
      setNotes(notes.filter((n) => n._id !== noteId));
    } catch (error) {
      toast.error('Failed to delete note');
      console.error(error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Lead Details</h2>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        <div className="lead-details">
          <div className="detail-section">
            <h3>Contact Information</h3>
            <div className="detail-grid">
              <div>
                <strong>Name:</strong>
                <p>{lead.name}</p>
              </div>
              <div>
                <strong>Email:</strong>
                <p>{lead.email}</p>
              </div>
              <div>
                <strong>Phone:</strong>
                <p>{lead.phone}</p>
              </div>
              <div>
                <strong>Source:</strong>
                <p>{lead.source}</p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Lead Status</h3>
            <div className="detail-grid">
              <div>
                <strong>Status:</strong>
                <p>
                  <span className={`badge badge-${lead.status.toLowerCase()}`}>
                    {lead.status}
                  </span>
                </p>
              </div>
              <div>
                <strong>Assigned To:</strong>
                <p>{lead.assignedTo?.name || 'Unassigned'}</p>
              </div>
              <div>
                <strong>Created:</strong>
                <p>{new Date(lead.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <strong>Updated:</strong>
                <p>{new Date(lead.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Tags</h3>
            <div className="tags-container">
              {lead.tags.length === 0 ? (
                <p>No tags</p>
              ) : (
                lead.tags.map((tag, idx) => (
                  <span key={idx} className="tag">
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="detail-section">
            <h3>Notes</h3>
            <div className="notes-section">
              <div className="add-note">
                <textarea
                  className="form-control"
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows="3"
                />
                <button
                  onClick={handleAddNote}
                  className="btn btn-primary"
                  disabled={loading || !newNote.trim()}
                >
                  Add Note
                </button>
              </div>

              <div className="notes-list">
                {notes.length === 0 ? (
                  <p>No notes yet</p>
                ) : (
                  notes.map((note) => (
                    <div key={note._id} className="note-item">
                      <div className="note-header">
                        <strong>{note.createdBy?.name}</strong>
                        <small>{new Date(note.createdAt).toLocaleString()}</small>
                      </div>
                      <p>{note.content}</p>
                      {note.createdBy?._id === user.id && (
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="btn-icon"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
