
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#f0f4f8'}}>
      <div style={{background:'#fff',padding:40,borderRadius:12,boxShadow:'0 4px 20px rgba(0,0,0,0.1)',width:380}}>
        <h2 style={{textAlign:'center',color:'#1F4E79'}}>💰 ContriTracker</h2>
        <h3 style={{textAlign:'center',color:'#555',fontWeight:'normal',marginBottom:24}}>Sign In</h3>
        {error && <p style={{background:'#ffe5e5',color:'#c0392b',padding:10,borderRadius:6,marginBottom:16,textAlign:'center'}}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={{width:'100%',padding:12,marginBottom:16,borderRadius:8,border:'1px solid #ccc',fontSize:15,boxSizing:'border-box'}} name='email' type='email' placeholder='Email address' value={form.email} onChange={handleChange} required />
          <input style={{width:'100%',padding:12,marginBottom:16,borderRadius:8,border:'1px solid #ccc',fontSize:15,boxSizing:'border-box'}} name='password' type='password' placeholder='Password' value={form.password} onChange={handleChange} required />
          <button style={{width:'100%',padding:13,background:'#1F4E79',color:'#fff',border:'none',borderRadius:8,fontSize:16,cursor:'pointer'}} type='submit' disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:16}}>No account? <Link to='/register'>Register here</Link></p>
      </div>
    </div>
  );
}
