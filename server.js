// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('DEVK Callback Form API is running');
});

// Ensure saved/ exists
const SAVE_DIR = path.join(__dirname, 'saved');
if (!fs.existsSync(SAVE_DIR)) {
  fs.mkdirSync(SAVE_DIR, { recursive: true });
}

// Escape helper
function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

app.post('/api/callback', (req, res, next) => {
  try {
    const {
      isCustomer,
      customerNumber,
      firstName,
      lastName,
      zipCode,
      city,
      profession,
      employer,
      email,
      contactTime,
      insuranceInterests = [],
      comments,
      privacy
    } = req.body;

    // Basic validation
    if (!isCustomer) return res.status(400).json({ error: 'isCustomer is required' });
    if (isCustomer === 'yes' && !customerNumber)
      return res.status(400).json({ error: 'Customer number required' });
    if (isCustomer === 'no' && (!firstName || !lastName || !email))
      return res.status(400).json({ error: 'Name and email required for non-customers' });
    if (!privacy) return res.status(400).json({ error: 'Privacy consent required' });

    // File naming
    const now = new Date();
    const stamp = now.toISOString().replace(/[:.]/g, '-');
    const fileName = `callback-${stamp}.html`;
    const filePath = path.join(SAVE_DIR, fileName);

    // Interests as text
    const interestsText = Array.isArray(insuranceInterests)
      ? insuranceInterests.map(esc).join(', ')
      : esc(insuranceInterests);

    // HTML content (with link to external CSS)
    const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Rückrufanfrage ${esc(fileName)}</title>
<link rel="stylesheet" href="../style.css">
</head>
<body>
  <div class="wrap">
    <h1>DEVK Rückrufanfrage</h1>
    <div class="meta">Gespeichert am: ${esc(now.toLocaleString())}</div>
    <dl>
      <dt>Kunde</dt><dd>${isCustomer === 'yes' ? 'Ja' : 'Nein'}</dd>
      ${isCustomer === 'yes'
        ? `<dt>Kundennummer</dt><dd>${esc(customerNumber)}</dd>`
        : `
          <dt>Vorname</dt><dd>${esc(firstName)}</dd>
          <dt>Nachname</dt><dd>${esc(lastName)}</dd>
          <dt>PLZ</dt><dd>${esc(zipCode)}</dd>
          <dt>Wohnort</dt><dd>${esc(city)}</dd>
          <dt>Beruf</dt><dd>${esc(profession)}</dd>
          <dt>Arbeitgeber</dt><dd>${esc(employer)}</dd>
        `}
      <dt>E-Mail</dt><dd>${esc(email)}</dd>
      <dt>Kontaktzeit</dt><dd>${esc(contactTime)}</dd>
      <dt>Interessiert an</dt><dd>${interestsText}</dd>
      <dt>Kommentar</dt><dd>${esc(comments)}</dd>
      <dt>Datenschutz</dt><dd>${privacy ? 'zugestimmt' : 'nicht zugestimmt'}</dd>
    </dl>
  </div>
</body>
</html>`;

    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Saved HTML: ${filePath}`);

    return res.json({ success: true, file: fileName });
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err?.stack || err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

