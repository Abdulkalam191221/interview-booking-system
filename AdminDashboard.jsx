import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import VideoBackground from '../../components/VideoBackground';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state for candidates
  const [searchQuery, setSearchQuery] = useState('');

  // Form states 
  const [formData, setFormData] = useState({
    date: '', startTime: '10:00 AM', endTime: '11:00 AM',
    interviewer: '', interviewType: 'Technical', mode: 'Online', capacity: 1
  });
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  // ⚡ UPGRADED: Edit states now hold EVERY field
  const [editState, setEditState] = useState(null);
  const [editFormData, setEditFormData] = useState({ 
    date: '', startTime: '', endTime: '', interviewer: '', interviewType: '', mode: '', capacity: 1 
  });

  const fetchData = async () => {
    try {
      const [historyRes, slotsRes] = await Promise.all([
        api.get('/slots/history'),
        api.get('/slots/available')
      ]);
      setBookings(historyRes.data);
      setSlots(slotsRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleEditChange = (e) => setEditFormData({ ...editFormData, [e.target.name]: e.target.value });

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setFormMessage({ type: '', text: '' });

    try {
      const res = await api.post('/slots/schedule-direct', formData);
      setFormMessage({ type: 'success', text: res.data.message });
      setFormData({ ...formData, interviewer: '', date: '', capacity: 1 });
      fetchData();
    } catch (err) {
      setFormMessage({ type: 'error', text: err.response?.data?.message || 'Failed to initialize slot.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm("Are you sure you want to delete this interview slot?")) return;
    try {
      await api.delete(`/slots/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to delete slot. Check server console.");
    }
  };

  const handleSaveEdit = async (id) => {
    try {
      await api.put(`/slots/${id}`, editFormData);
      setEditState(null);
      fetchData();
    } catch (err) {
      alert("Failed to update slot.");
    }
  };

  const uniqueCandidates = Array.from(
    new Map(bookings.map(b => [b.candidate?.email, b.candidate])).values()
  ).filter(c => c && c.name);

  const filteredCandidates = uniqueCandidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status === 'booked' || !b.status).length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;

  return (
    <VideoBackground>
      <div style={{ padding: '40px', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: 'transparent' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <header className="liquid-glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderRadius: '16px', marginBottom: '30px' }}>
            <div>
              <h1 style={{ color: '#0f172a', fontSize: '24px', margin: 0, fontWeight: '700' }}>HR Management Control Panel</h1>
              <p style={{ color: '#334155', fontSize: '14px', margin: '4px 0 0 0', fontWeight: '500' }}>Welcome back, {user?.name || 'HR Admin'}</p>
            </div>
            <button onClick={logout} style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              Logout
            </button>
          </header>

          <div className="liquid-glass-card animate-fade-in-up delay-1" style={{ padding: '25px 30px', borderRadius: '16px', marginBottom: '30px' }}>
            <h2 style={{ color: '#0f172a', fontSize: '18px', margin: '0 0 15px 0', fontWeight: '700' }}>Create Public Interview Slot</h2>
            {formMessage.text && (
              <div style={{ padding: '12px 15px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', fontWeight: '600', backgroundColor: formMessage.type === 'error' ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34, 197, 94, 0.12)', color: formMessage.type === 'error' ? '#dc2626' : '#16a34a' }}>
                {formMessage.text}
              </div>
            )}
            <form onSubmit={handleScheduleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#334155', fontWeight: '600', marginBottom: '4px' }}>Assigned Interviewer</label>
                <input required type="text" name="interviewer" value={formData.interviewer} onChange={handleChange} placeholder="e.g. Sarah Jenkins" style={{ width: '90%', padding: '10px', border: '1px solid rgba(15,23,42,0.15)', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.4)', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#334155', fontWeight: '600', marginBottom: '4px' }}>Interview Date</label>
                <input required type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: '90%', padding: '9px', border: '1px solid rgba(15,23,42,0.15)', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.4)', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#334155', fontWeight: '600', marginBottom: '4px' }}>Start Time</label>
                <input required type="text" name="startTime" value={formData.startTime} onChange={handleChange} placeholder="10:00 AM" style={{ width: '90%', padding: '10px', border: '1px solid rgba(15,23,42,0.15)', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.4)', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#334155', fontWeight: '600', marginBottom: '4px' }}>End Time</label>
                <input required type="text" name="endTime" value={formData.endTime} onChange={handleChange} placeholder="11:00 AM" style={{ width: '90%', padding: '10px', border: '1px solid rgba(15,23,42,0.15)', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.4)', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#334155', fontWeight: '600', marginBottom: '4px' }}>Person Capacity</label>
                <input required type="number" min="1" name="capacity" value={formData.capacity} onChange={handleChange} style={{ width: '90%', padding: '10px', border: '1px solid rgba(15,23,42,0.15)', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.4)', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#334155', fontWeight: '600', marginBottom: '4px' }}>Interview Type</label>
                <select name="interviewType" value={formData.interviewType} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid rgba(15,23,42,0.15)', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
                  <option value="Technical">Technical</option>
                  <option value="HR">HR</option>
                  <option value="Managerial">Managerial</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#334155', fontWeight: '600', marginBottom: '4px' }}>Mode</label>
                <select name="mode" value={formData.mode} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid rgba(15,23,42,0.15)', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
              <button type="submit" disabled={submitLoading} style={{ padding: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', gridColumn: 'span 2' }}>
                {submitLoading ? 'Generating...' : 'Create Slot'}
              </button>
            </form>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
            <div className="liquid-glass-card" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
              <h3 style={{ margin: 0, color: '#475569', fontSize: '14px', fontWeight: '600' }}>Total Slots Booked</h3>
              <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>{totalBookings}</p>
            </div>
            <div className="liquid-glass-card" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #22c55e' }}>
              <h3 style={{ margin: 0, color: '#475569', fontSize: '14px', fontWeight: '600' }}>Confirmed Interviews</h3>
              <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>{activeBookings}</p>
            </div>
            <div className="liquid-glass-card" style={{ padding: '20px', borderRadius: '12px', borderLeft: '4px solid #f97316' }}>
              <h3 style={{ margin: 0, color: '#475569', fontSize: '14px', fontWeight: '600' }}>Cancelled Openings</h3>
              <p style={{ margin: '10px 0 0 0', fontSize: '28px', fontWeight: '700', color: '#0f172a' }}>{cancelledBookings}</p>
            </div>
          </div>

          {/* ⚡ UPGRADED: Manage Existing Slots Table */}
          <div className="liquid-glass-card" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
            <h2 style={{ color: '#0f172a', marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>Manage Interview Slots</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(15, 23, 42, 0.08)', color: '#475569', fontSize: '14px' }}>
                  <th style={{ padding: '12px' }}>Date & Time</th>
                  <th style={{ padding: '12px' }}>Interviewer</th>
                  <th style={{ padding: '12px' }}>Type & Mode</th>
                  <th style={{ padding: '12px' }}>Capacity</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => {
                  const slotId = slot._id || slot.id;
                  const isEditing = editState === slotId;

                  return (
                    <tr key={slotId} style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.04)', color: '#1e293b' }}>
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input type="date" name="date" value={editFormData.date} onChange={handleEditChange} style={{ padding: '4px', fontSize: '12px' }} />
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <input type="text" name="startTime" value={editFormData.startTime} onChange={handleEditChange} placeholder="Start" style={{ padding: '4px', fontSize: '12px', width: '70px' }} />
                              <input type="text" name="endTime" value={editFormData.endTime} onChange={handleEditChange} placeholder="End" style={{ padding: '4px', fontSize: '12px', width: '70px' }} />
                            </div>
                          </div>
                        ) : (
                          <>{slot.date} <br/> <span style={{ fontSize: '12px', color: '#64748b' }}>{slot.startTime} - {slot.endTime}</span></>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input type="text" name="interviewer" value={editFormData.interviewer} onChange={handleEditChange} style={{ padding: '6px', width: '120px' }} />
                        ) : (slot.interviewer)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <select name="interviewType" value={editFormData.interviewType} onChange={handleEditChange} style={{ padding: '4px', fontSize: '12px' }}>
                              <option value="Technical">Technical</option>
                              <option value="HR">HR</option>
                              <option value="Managerial">Managerial</option>
                            </select>
                            <select name="mode" value={editFormData.mode} onChange={handleEditChange} style={{ padding: '4px', fontSize: '12px' }}>
                              <option value="Online">Online</option>
                              <option value="Offline">Offline</option>
                            </select>
                          </div>
                        ) : (
                          <>
                            <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: 'rgba(59,130,246,0.1)', color: '#2563eb', borderRadius: '4px', marginRight: '6px' }}>{slot.interviewType}</span>
                            <span style={{ fontSize: '12px', padding: '4px 8px', backgroundColor: 'rgba(100,116,139,0.1)', color: '#475569', borderRadius: '4px' }}>{slot.mode}</span>
                          </>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {isEditing ? (
                          <input type="number" min="1" name="capacity" value={editFormData.capacity} onChange={handleEditChange} style={{ padding: '6px', width: '60px' }} />
                        ) : (
                          <span style={{ fontWeight: 'bold', color: slot.availableSeats === 0 ? '#ef4444' : '#10b981' }}>{slot.availableSeats} / {slot.capacity}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', gap: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSaveEdit(slotId)} style={{ padding: '6px 12px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                            <button onClick={() => setEditState(null)} style={{ padding: '6px 12px', backgroundColor: '#94a3b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { 
                              setEditState(slotId); 
                              setEditFormData({ 
                                date: slot.date, startTime: slot.startTime, endTime: slot.endTime, 
                                interviewer: slot.interviewer, interviewType: slot.interviewType, 
                                mode: slot.mode, capacity: slot.capacity 
                              }); 
                            }} style={{ padding: '6px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                            <button onClick={() => handleDeleteSlot(slotId)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="liquid-glass-card" style={{ padding: '30px', borderRadius: '16px', marginBottom: '30px' }}>
            <h2 style={{ color: '#0f172a', marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>Active Candidate Booking Selections</h2>
            {loading ? <p>Loading master list data...</p> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid rgba(15, 23, 42, 0.08)', color: '#475569', fontSize: '14px' }}>
                    <th style={{ padding: '12px' }}>Candidate Name</th>
                    <th style={{ padding: '12px' }}>Email Address</th>
                    <th style={{ padding: '12px' }}>Assigned Panelist</th>
                    <th style={{ padding: '12px' }}>Scheduled Date/Time</th>
                    <th style={{ padding: '12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const currentStatus = booking.status || 'booked';
                    return (
                      <tr key={booking._id || Math.random()} style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.04)', color: '#1e293b' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{booking.candidate?.name || 'Public Registration'}</td>
                        <td style={{ padding: '12px' }}>{booking.candidate?.email || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{booking.slotId?.interviewer || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{booking.slotId ? `${booking.slotId.date} @ ${booking.slotId.startTime}` : 'N/A'}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', backgroundColor: currentStatus === 'booked' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: currentStatus === 'booked' ? '#15803d' : '#b91c1c' }}>
                            {currentStatus.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="liquid-glass-card" style={{ padding: '30px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#0f172a', margin: 0, fontSize: '18px', fontWeight: '700' }}>Candidate Directory</h2>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid rgba(15,23,42,0.15)', width: '300px', fontSize: '14px' }}
              />
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(15, 23, 42, 0.08)', color: '#475569', fontSize: '14px' }}>
                  <th style={{ padding: '12px' }}>Candidate Name</th>
                  <th style={{ padding: '12px' }}>Email Address</th>
                  <th style={{ padding: '12px' }}>Total Bookings</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate, idx) => {
                    const bookingCount = bookings.filter(b => b.candidate?.email === candidate.email).length;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(15, 23, 42, 0.04)', color: '#1e293b' }}>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{candidate.name}</td>
                        <td style={{ padding: '12px' }}>{candidate.email}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', backgroundColor: '#e2e8f0', color: '#334155' }}>
                            {bookingCount} Bookings
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No candidates found matching your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </VideoBackground>
  );
};

export default AdminDashboard;