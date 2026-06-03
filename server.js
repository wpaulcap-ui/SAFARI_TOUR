require('dotenv').config();
const express = require('express');
const path = require('path');

const sendEmailHandler = require('./api/send-email');

const app = express();
app.use(express.json());

app.post('/api/send-email', sendEmailHandler);

// Serve static site files
app.use(express.static(path.join(__dirname, '/')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Local server running on http://localhost:${port}`);
});
