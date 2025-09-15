// server.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic test route
app.get('/', (req, res) => {
  res.send('DEVK Callback Form API is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// POST endpoint to handle form data
app.post('/api/callback', (req, res) => {
  const formData = req.body;

  console.log('Received form submission:', formData);

  // For now just return success
  res.json({
    message: 'Form submission received',
    data: formData,
  });
});
