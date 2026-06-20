import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import VideoBackground from '../../components/VideoBackground';

const CandidateDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasBooked, setHasBooked] = useState(false);
  const [bookedDetails, setBookedDetails] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const slotRes = await api.get('/slots/available');
      setSlots(slotRes.data);

      const historyRes = await api.get('/slots/history');
      const activeBooking = historyRes.data.find(b => b.status === 'booked');
      if (activeBooking) {
        setHasBooked(true);
        setBookedDetails(activeBooking.slotId);
      } else {
        setHasBooked(false);
        setBookedDetails(null);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to sync with backend slot database.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const bookSlot = async (slotId) => {
    try {
      setBookingLoading(true);
      setMessage({ type: '', text: '' });
      await api.post(`/slots/book/${slotId}`);
      setMessage({ type: 'success', text: 'Interview slot successfully reserved!' });
      await fetchDashboardData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Booking request failed.' });
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'TBD Date';
    if (dateString.includes('-') && dateString.split('-').length === 3) {
      const [year, month, day] = dateString.split('-');
      const parsedDate = new Date(year, month - 1, day);
      return parsedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
    return dateString;
  };

  return (
    <VideoBackground>
      <div style={{ padding: '40px', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: 'transparent' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <header className="liquid-glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderRadius: '16px', marginBottom: '30px' }}>
            <div>
              <h1 style={{ color: '#0f172a', fontSize: '24px', margin: 0, fontWeight: '700' }}>Welcome, {user?.name || 'Candidate'}!</h1>
              <p style={{ color: '#334155', fontSize: '14px', margin: '4px 0 0 0', fontWeight: '500' }}>Candidate Interview Slot Booking Portal</p>
            </div>
            <button onClick={logout} style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
              Logout
            </button>
          </header>

          {message.text && (
            <div style={{ padding: '15px 20px', borderRadius: '12px', marginBottom: '25px', fontSize: '15px', fontWeight: '600', backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)', color: message.type === 'error' ? '#dc2626' : '#16a34a' }}>
              {message.text}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
            <div className="liquid-glass-card" style={{ padding: '30px', borderRadius: '16px' }}>
              <h2 style={{ color: '#0f172a', marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>Available Options Formulated for You</h2>
              
              {loading ? (
                <p>Querying slot options...</p>
              ) : hasBooked ? (
                <p style={{ color: '#16a34a', fontWeight: '600' }}>🎉 You have successfully selected your interview window. Check the status side card panel for details!</p>
              ) : slots.length === 0 ? (
                <p>No open options currently posted for your account email by HR.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {slots.map((slot) => (
                    <div key={slot._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.25)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '12px' }}>
                      <div>
                        <h4 style={{ color: '#0f172a', margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600' }}>{formatDisplayDate(slot.date)}</h4>
                        <p style={{ color: '#1e293b', margin: 0, fontSize: '14px', fontWeight: '500' }}>⏰ {slot.startTime} - {slot.endTime}</p>
                        
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ padding: '4px 10px', backgroundColor: 'rgba(224, 242, 254, 0.6)', color: '#0369a1', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>Host: {slot.interviewer}</span>
                          
                          {/* ⚡ NEW: Added Interview Type Badge */}
                          <span style={{ padding: '4px 10px', backgroundColor: 'rgba(59,130,246,0.1)', color: '#2563eb', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{slot.interviewType}</span>

                          {/* ⚡ NEW: Added Mode Badge */}
                          <span style={{ padding: '4px 10px', backgroundColor: 'rgba(100,116,139,0.1)', color: '#475569', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>{slot.mode}</span>
                          
                          <span style={{ padding: '4px 10px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#d97706', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                            Seats: {slot.availableSeats} / {slot.capacity} left
                          </span>
                        </div>
                      </div>

                      <button onClick={() => bookSlot(slot._id)} disabled={bookingLoading} style={{ padding: '12px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', opacity: bookingLoading ? 0.7 : 1 }}>
                        Select Option
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="liquid-glass-card" style={{ padding: '30px', borderRadius: '16px', height: 'fit-content' }}>
              <h2 style={{ color: '#0f172a', marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>Your Booking Status</h2>
              {hasBooked && bookedDetails ? (
                <div style={{ padding: '15px', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                  <p style={{ color: '#065f46', fontWeight: '700', fontSize: '15px', margin: '0 0 4px 0' }}>✓ Confirmed Selection</p>
                  <p style={{ color: '#0f172a', fontSize: '13px', margin: '2px 0', fontWeight: '600' }}>👨‍💼 Host: {bookedDetails.interviewer}</p>
                  <p style={{ color: '#334155', fontSize: '13px', margin: '2px 0', fontWeight: '500' }}>📅 Date: {formatDisplayDate(bookedDetails.date)}</p>
                  <p style={{ color: '#334155', fontSize: '13px', margin: '2px 0', fontWeight: '500' }}>⏰ Time: {bookedDetails.startTime} - {bookedDetails.endTime}</p>
                  <p style={{ color: '#334155', fontSize: '13px', margin: '2px 0', fontWeight: '500' }}>📌 Mode: {bookedDetails.mode} ({bookedDetails.interviewType})</p>
                </div>
              ) : (
                <div style={{ padding: '15px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '12px', borderLeft: '4px solid #475569' }}>
                  <p style={{ color: '#0f172a', fontWeight: '600', fontSize: '15px' }}>Pending Selection</p>
                  <p style={{ color: '#334155', fontSize: '13px', marginTop: '4px', lineHeight: '1.4' }}>Please select one of the open options generated for your email address.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </VideoBackground>
  );
};

export default CandidateDashboard;