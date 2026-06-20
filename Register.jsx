import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api'; // Centralized Axios instance with base URL configuration

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend validation check
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    try {
      setLoading(true);
      
      // Sent payload with expected schema structure and default user role context
      await api.post('/auth/register', {
        name,
        email,
        password,
        role: 'candidate' 
      });

      setSuccess('Registration successful! Redirecting to login...');
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      
      // Seamlessly redirect to the login panel after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Background organic liquid blobs for visual morphism effect */}
      <div className="liquid-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* Centered Liquid Glass Box Container */}
      <div className="liquid-glass-box">
        <h2>Candidate Register</h2>
        
        {error && (
          <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>
            {success}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Create a password"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <p className="switch-auth-text">
          Already have an account? <span onClick={() => navigate('/login')}>Login here</span>
        </p>
      </div>
    </div>
  );
};

export default Register;