
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import api from '../api/axios';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const COLORS = ['#1D6A39','#e74c3c'];

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState([]);
  const [summary, setSummary] = useState({});
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    api.get('/groups/' + id).then(r => setGroup(r.data));
    api.get('/members/' + id).then(r => setMembers(r.data));
    api.get('/contributions/' + id + '/summary').then(r => setSummary(r.data));
  }, [id]);

  useEffect(() => {
    api.get('/contributions/' + id + '/status/' + selectedMonth + '/' + selectedYear)
       .then(r => setStatus(r.data));
  }, [id, selectedMonth, selectedYear]);

  const addMember = async () => {
    if (!email) return;
    try {
      await api.post('/members/' + id, { email });
      setMessage('Member added successfully!');
      setEmail('');
      const r = await api.get('/members/' + id);
      setMembers(r.data);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response && err.response.data ? err.response.data.error : 'Error adding member');
    }
  };

  const paidCount = status.filter(s => s.status === 'paid').length;
  const unpaidCount = status.filter(s => s.status === 'unpaid').length;
  const pieData = [
    { name: 'Paid', value: paidCount },
    { name: 'Not Paid', value: unpaidCount },
  ];

  if (!group) return React.createElement('div', {style:{textAlign:'center',marginTop:80}}, 'Loading group...');

  return (
    <div style={{maxWidth:960,margin:'0 auto',padding:24}}>

      <button onClick={() => navigate('/')} style={{background:'none',border:'none',color:'#1F4E79',cursor:'pointer',fontSize:15,marginBottom:16,fontWeight:'bold'}}>
        Back to Dashboard
      </button>

      <div style={{background:'#1F4E79',borderRadius:12,padding:24,marginBottom:24,color:'#fff'}}>
        <h2 style={{marginBottom:4}}>{group.name}</h2>
        <p style={{opacity:0.8}}>{group.description || 'No description'}</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:28}}>
        {[
          {label:'Monthly Target', value:'KES ' + Number(group.monthly_target).toLocaleString(), icon:'Target'},
          {label:'Total Collected', value:'KES ' + Number(summary.total_collected || 0).toLocaleString(), icon:'Money'},
          {label:'Total Members', value:members.length, icon:'Members'},
        ].map(c => (
          <div key={c.label} style={{background:'#fff',borderRadius:10,padding:20,boxShadow:'0 2px 8px rgba(0,0,0,0.06)',textAlign:'center'}}>
            <p style={{color:'#888',fontSize:13,marginBottom:4}}>{c.label}</p>
            <p style={{color:'#1F4E79',fontWeight:'bold',fontSize:22}}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:12,marginBottom:20,alignItems:'center',flexWrap:'wrap'}}>
        <h3 style={{color:'#1F4E79',margin:0}}>Status for:</h3>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{padding:8,borderRadius:6,border:'1px solid #ccc',fontSize:14}}>
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{padding:8,borderRadius:6,border:'1px solid #ccc',fontSize:14}}>
          {[2024,2025,2026,2027].map(y => <option key={y}>{y}</option>)}
        </select>
        <button onClick={() => navigate('/group/' + id + '/contribute')} style={{background:'#1F4E79',color:'#fff',border:'none',padding:'10px 18px',borderRadius:8,cursor:'pointer',fontSize:14,fontWeight:'bold'}}>
          + Log Payment
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:24,marginBottom:32}}>
        <div style={{background:'#fff',borderRadius:10,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#1F4E79',color:'#fff'}}>
                <th style={{padding:'12px 14px',textAlign:'left',fontSize:14}}>Member</th>
                <th style={{padding:'12px 14px',textAlign:'left',fontSize:14}}>Status</th>
                <th style={{padding:'12px 14px',textAlign:'left',fontSize:14}}>Amount (KES)</th>
                <th style={{padding:'12px 14px',textAlign:'left',fontSize:14}}>Date Paid</th>
              </tr>
            </thead>
            <tbody>
              {status.length === 0 ? (
                <tr><td colSpan={4} style={{textAlign:'center',padding:20,color:'#888'}}>No data for this month</td></tr>
              ) : (
                status.map((s, i) => (
                  <tr key={s.id} style={{background:i%2===0?'#f9f9f9':'#fff'}}>
                    <td style={{padding:'12px 14px',fontSize:14}}>{s.full_name}</td>
                    <td style={{padding:'12px 14px',fontSize:14,color:s.status==='paid'?'#1D6A39':'#c0392b',fontWeight:'bold'}}>
                      {s.status === 'paid' ? 'Paid' : 'Not Paid'}
                    </td>
                    <td style={{padding:'12px 14px',fontSize:14}}>
                      {s.amount_paid > 0 ? 'KES ' + Number(s.amount_paid).toLocaleString() : '-'}
                    </td>
                    <td style={{padding:'12px 14px',fontSize:14}}>
                      {s.paid_at ? new Date(s.paid_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{background:'#fff',borderRadius:10,padding:16,boxShadow:'0 2px 8px rgba(0,0,0,0.06)',textAlign:'center'}}>
          <h4 style={{color:'#1F4E79',marginBottom:8}}>Payment Summary</h4>
          <PieChart width={240} height={200}>
            <Pie data={pieData} cx={120} cy={90} outerRadius={80} dataKey='value' label>
              {pieData.map((entry, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
          <p style={{color:'#1D6A39',fontWeight:'bold'}}>{paidCount} Paid</p>
          <p style={{color:'#c0392b',fontWeight:'bold'}}>{unpaidCount} Not Paid</p>
        </div>
      </div>

      <div style={{background:'#f0f4f8',borderRadius:10,padding:20,marginBottom:24}}>
        <h3 style={{color:'#1F4E79',marginBottom:12}}>Add a Member by Email</h3>
        {message && (
          <p style={{background:message.includes('success')?'#d9ead3':'#ffe5e5',color:message.includes('success')?'#1D6A39':'#c0392b',padding:10,borderRadius:6,marginBottom:12}}>
            {message}
          </p>
        )}
        <div style={{display:'flex',gap:12}}>
          <input
            placeholder='Enter member email address'
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{flex:1,padding:10,border:'1px solid #ccc',borderRadius:8,fontSize:14,boxSizing:'border-box'}}
          />
          <button onClick={addMember} style={{background:'#1F4E79',color:'#fff',border:'none',padding:'10px 18px',borderRadius:8,cursor:'pointer',fontSize:14,fontWeight:'bold'}}>
            Add Member
          </button>
        </div>
      </div>

      <div style={{background:'#fff',borderRadius:10,padding:20,boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
        <h3 style={{color:'#1F4E79',marginBottom:16}}>All Members ({members.length})</h3>
        {members.map((m, i) => (
          <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:i < members.length-1?'1px solid #eee':'none'}}>
            <div>
              <p style={{fontWeight:'bold',color:'#333',margin:0}}>{m.full_name}</p>
              <p style={{color:'#888',fontSize:13,margin:0}}>{m.email}</p>
            </div>
            <p style={{fontSize:12,color:'#aaa'}}>Joined {new Date(m.joined_at).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
