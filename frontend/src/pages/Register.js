
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display:'flex',justifyContent:'center',alignItems:'center',minHeight:'100vh',background:'#f0f4f8'}}>
      <div style={{background:'#fff',padding:40,borderRadius:12,boxShadow:'0 4px 20px rgba(0,0,0,0.1)',width:380}}>
        <h2 style={{textAlign:'center',color:'#1F4E79'}}>💰 ContriTracker</h2>
        <h3 style={{textAlign:'center',color:'#555',fontWeight:'normal',marginBottom:24}}>Create Account</h3>
        {error && <p style={{background:'#ffe5e5',color:'#c0392b',padding:10,borderRadius:6,marginBottom:16,textAlign:'center'}}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input style={{width:'100%',padding:12,marginBottom:16,borderRadius:8,border:'1px solid #ccc',fontSize:15,boxSizing:'border-box'}} name='full_name' type='text' placeholder='Full Name' value={form.full_name} onChange={handleChange} required />
          <input style={{width:'100%',padding:12,marginBottom:16,borderRadius:8,border:'1px solid #ccc',fontSize:15,boxSizing:'border-box'}} name='email' type='email' placeholder='Email address' value={form.email} onChange={handleChange} required />
          <input style={{width:'100%',padding:12,marginBottom:16,borderRadius:8,border:'1px solid #ccc',fontSize:15,boxSizing:'border-box'}} name='password' type='password' placeholder='Password' value={form.password} onChange={handleChange} required />
          <button style={{width:'100%',padding:13,background:'#1F4E79',color:'#fff',border:'none',borderRadius:8,fontSize:16,cursor:'pointer'}} type='submit' disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:16}}>Already have an account? <Link to='/login'>Sign in here</Link></p>
      </div>
    </div>
  );
}
