
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AddContribution() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [group, setGroup] = useState(null);
  const [form, setForm] = useState({
    user_id: '',
    amount: '',
    month: MONTHS[new Date().getMonth()],
    year: new Date().getFullYear(),
    notes: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/members/' + id).then(r => setMembers(r.data));
    api.get('/groups/' + id).then(r => {
      setGroup(r.data);
      setForm(f => ({...f, amount: r.data.monthly_target}));
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/contributions', { ...form, group_id: id });
      setMessage('Payment recorded successfully!');
      setTimeout(() => navigate('/group/' + id), 1500);
    } catch (err) {
      setError(err.response && err.response.data ? err.response.data.error : 'Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth:480,margin:'40px auto',padding:24,background:'#fff',borderRadius:12,boxShadow:'0 4px 20px rgba(0,0,0,0.1)'}}>
      <button onClick={() => navigate('/group/' + id)} style={{background:'none',border:'none',color:'#1F4E79',cursor:'pointer',marginBottom:16,fontWeight:'bold',fontSize:15}}>
        Back to Group
      </button>

      <h2 style={{color:'#1F4E79',marginBottom:4}}>Log a Contribution</h2>
      {group && <p style={{color:'#666',marginBottom:20}}>Group: <strong>{group.name}</strong></p>}

      {message && (
        <p style={{background:'#d9ead3',padding:12,borderRadius:8,marginBottom:16,color:'#1D6A39',fontWeight:'bold'}}>
          {message}
        </p>
      )}
      {error && (
        <p style={{background:'#ffe5e5',padding:12,borderRadius:8,marginBottom:16,color:'#c0392b'}}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label style={{display:'block',fontWeight:'bold',color:'#1F4E79',marginBottom:6,fontSize:14}}>Member</label>
        <select
          style={{width:'100%',padding:11,border:'1px solid #ccc',borderRadius:8,fontSize:15,marginBottom:14,boxSizing:'border-box'}}
          value={form.user_id}
          onChange={e => setForm({...form, user_id: e.target.value})}
          required
        >
          <option value=''>-- Select member --</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
        </select>

        <label style={{display:'block',fontWeight:'bold',color:'#1F4E79',marginBottom:6,fontSize:14}}>Amount (KES)</label>
        <input
          style={{width:'100%',padding:11,border:'1px solid #ccc',borderRadius:8,fontSize:15,marginBottom:14,boxSizing:'border-box'}}
          type='number'
          value={form.amount}
          onChange={e => setForm({...form, amount: e.target.value})}
          required
        />

        <label style={{display:'block',fontWeight:'bold',color:'#1F4E79',marginBottom:6,fontSize:14}}>Month</label>
        <select
          style={{width:'100%',padding:11,border:'1px solid #ccc',borderRadius:8,fontSize:15,marginBottom:14,boxSizing:'border-box'}}
          value={form.month}
          onChange={e => setForm({...form, month: e.target.value})}
        >
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </select>

        <label style={{display:'block',fontWeight:'bold',color:'#1F4E79',marginBottom:6,fontSize:14}}>Year</label>
        <select
          style={{width:'100%',padding:11,border:'1px solid #ccc',borderRadius:8,fontSize:15,marginBottom:14,boxSizing:'border-box'}}
          value={form.year}
          onChange={e => setForm({...form, year: e.target.value})}
        >
          {[2024,2025,2026,2027].map(y => <option key={y}>{y}</option>)}
        </select>

        <label style={{display:'block',fontWeight:'bold',color:'#1F4E79',marginBottom:6,fontSize:14}}>Notes (optional)</label>
        <input
          style={{width:'100%',padding:11,border:'1px solid #ccc',borderRadius:8,fontSize:15,marginBottom:20,boxSizing:'border-box'}}
          placeholder='e.g. Paid via M-Pesa'
          value={form.notes}
          onChange={e => setForm({...form, notes: e.target.value})}
        />

        <button
          type='submit'
          disabled={loading}
          style={{width:'100%',padding:13,background:'#1F4E79',color:'#fff',border:'none',borderRadius:8,fontSize:16,cursor:'pointer',fontWeight:'bold'}}
        >
          {loading ? 'Recording...' : 'Record Payment'}
        </button>
      </form>
    </div>
  );
}
