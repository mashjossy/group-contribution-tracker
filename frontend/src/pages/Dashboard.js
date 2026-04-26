import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const [groups, setGroups]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name:'', description:'', monthly_target:'' });
  const [error, setError]       = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/groups')
      .then(res => { setGroups(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const createGroup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/groups', form);
      setShowForm(false);
      setForm({ name:'', description:'', monthly_target:'' });
      const res = await api.get('/groups');
      setGroups(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating group');
    }
  };

  if (loading) return (
    <div style={{textAlign:'center', marginTop:80}}>
      <p style={{fontSize:18, color:'#888'}}>Loading your groups...</p>
    </div>
  );

  return (
    <div style={{maxWidth:900, margin:'0 auto', padding:24}}>

      {/* Header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24}}>
        <div>
          <h2 style={{color:'#1F4E79', marginBottom:4}}>Welcome, {user?.full_name} 👋</h2>
          <p style={{color:'#888', fontSize:14}}>Manage your contribution groups below</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle}>
          {showForm ? 'Cancel' : '+ New Group'}
        </button>
      </div>

      {/* Create Group Form */}
      {showForm && (
        <div style={{background:'#f8fafc', border:'1px solid #dde', borderRadius:12, padding:24, marginBottom:28}}>
          <h3 style={{color:'#1F4E79', marginBottom:16}}>Create a New Group</h3>
          {error && <p style={{color:'#c0392b', marginBottom:12}}>{error}</p>}
          <form onSubmit={createGroup}>
            <input
              style={inputStyle}
              placeholder='Group Name (e.g. Cousins Circle)'
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              required
            />
            <input
              style={inputStyle}
              placeholder='Description (optional)'
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
            <input
              style={inputStyle}
              placeholder='Monthly Target (KES)'
              type='number'
              value={form.monthly_target}
              onChange={e => setForm({...form, monthly_target: e.target.value})}
              required
            />
            <button type='submit' style={btnStyle}>Create Group</button>
          </form>
        </div>
      )}

      {/* Groups List */}
      {groups.length === 0 ? (
        <div style={{textAlign:'center', marginTop:80, color:'#888'}}>
          <p style={{fontSize:60}}>💰</p>
          <h3>No groups yet!</h3>
          <p>Click "+ New Group" to create your first contribution group.</p>
        </div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:20}}>
          {groups.map(g => (
            <div
              key={g.id}
              onClick={() => navigate(`/group/${g.id}`)}
              style={cardStyle}
              onMouseOver={e => e.currentTarget.style.transform='translateY(-4px)'}
              onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}
            >
              <div style={{fontSize:32, marginBottom:8}}>👥</div>
              <h3 style={{color:'#1F4E79', marginBottom:6}}>{g.name}</h3>
              <p style={{color:'#666', fontSize:14, marginBottom:12}}>{g.description || 'No description'}</p>
              <div style={{borderTop:'1px solid #eee', paddingTop:12}}>
                <p style={{fontWeight:'bold', color:'#2E75B6', fontSize:18}}>
                  KES {Number(g.monthly_target).toLocaleString()}
                </p>
                <p style={{fontSize:12, color:'#888'}}>per month</p>
                <p style={{fontSize:13, color:'#555', marginTop:6}}>
                  👤 {g.member_count} member{g.member_count !== '1' ? 's' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  background: '#1F4E79',
  color: '#fff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: 15,
  fontWeight: 'bold'
};

const cardStyle = {
  background: '#fff',
  border: '1px solid #dde',
  borderRadius: 12,
  padding: 20,
  cursor: 'pointer',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  transition: 'transform 0.2s'
};

const inputStyle = {
  width: '100%',
  padding: 11,
  marginBottom: 12,
  border: '1px solid #ccc',
  borderRadius: 8,
  fontSize: 15,
  boxSizing: 'border-box'
};