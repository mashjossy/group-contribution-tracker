const fs = require('fs');

let content = fs.readFileSync('src/pages/GroupDetail.js', 'utf8');

// Add isAdmin check after the pieData lines
const oldCode = `  const paidCount = status.filter(s => s.status === 'paid').length;`;

const newCode = `  // Check if logged-in user is the group admin
  const isAdmin = group && user && group.admin_id === user.id;

  const paidCount = status.filter(s => s.status === 'paid').length;`;

content = content.replace(oldCode, newCode);

// Hide Log Payment button from non-admins
content = content.replace(
  `<button onClick={() => navigate('/group/' + id + '/contribute')} style={{background:'#1F4E79',color:'#fff',border:'none',padding:'10px 18px',borderRadius:8,cursor:'pointer',fontSize:14,fontWeight:'bold'}}>
          + Log Payment
        </button>`,
  `{isAdmin && (
          <button onClick={() => navigate('/group/' + id + '/contribute')} style={{background:'#1F4E79',color:'#fff',border:'none',padding:'10px 18px',borderRadius:8,cursor:'pointer',fontSize:14,fontWeight:'bold'}}>
            + Log Payment
          </button>
        )}`
);

// Hide Add Member section from non-admins
content = content.replace(
  `<div style={{background:'#f0f4f8',borderRadius:10,padding:20,marginBottom:24}}>
        <h3 style={{color:'#1F4E79',marginBottom:12}}>Add a Member by Email</h3>`,
  `{isAdmin && <div style={{background:'#f0f4f8',borderRadius:10,padding:20,marginBottom:24}}>
        <h3 style={{color:'#1F4E79',marginBottom:12}}>Add a Member by Email</h3>`
);

// Close the isAdmin wrapper
content = content.replace(
  `          <button onClick={addMember} style={{background:'#1F4E79',color:'#fff',border:'none',padding:'10px 18px',borderRadius:8,cursor:'pointer',fontSize:14,fontWeight:'bold'}}>
            Add Member
          </button>
        </div>
      </div>`,
  `          <button onClick={addMember} style={{background:'#1F4E79',color:'#fff',border:'none',padding:'10px 18px',borderRadius:8,cursor:'pointer',fontSize:14,fontWeight:'bold'}}>
            Add Member
          </button>
        </div>
      </div>}`
);

// Add user import if not already there
if (!content.includes("import { useAuth }")) {
  content = content.replace(
    `import api from '../api/axios';`,
    `import api from '../api/axios';\nimport { useAuth } from '../context/AuthContext';`
  );
}

// Add useAuth inside component
if (!content.includes("const { user }")) {
  content = content.replace(
    `  const { id } = useParams();`,
    `  const { id } = useParams();\n  const { user } = useAuth();`
  );
}

fs.writeFileSync('src/pages/GroupDetail.js', content);
console.log('Fix applied successfully!');