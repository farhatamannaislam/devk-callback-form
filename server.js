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

// POST endpoint with validation
app.post('/api/callback', (req, res, next) => {
  try {
    const { isCustomer, customerNumber, firstName, lastName, email } = req.body;

    if (!isCustomer) {
      return res.status(400).json({ error: 'Field isCustomer is required' });
    }

    if (isCustomer === 'yes' && !customerNumber) {
      return res.status(400).json({ error: 'Customer number is required for existing customers' });
    }

    if (isCustomer === 'no' && (!firstName || !lastName || !email)) {
      return res.status(400).json({ error: 'First name, last name and email are required for new customers' });
    }

    // If all good
    res.json({
      success: true,
      message: 'Form data validated and accepted',
      data: req.body,
    });
  } catch (err) {
    next(err);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
