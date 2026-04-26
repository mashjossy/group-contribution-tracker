const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/groups',        require('./routes/groups'));
app.use('/api/members',       require('./routes/members'));
app.use('/api/contributions', require('./routes/contributions'));

app.get('/', (req, res) => res.send('Server is running!'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));