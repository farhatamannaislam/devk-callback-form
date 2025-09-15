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
