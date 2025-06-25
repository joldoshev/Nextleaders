const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
// Replit automatically sets the port
const port = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory (e.g., index.html, css, js)
app.use(express.static(path.join(__dirname)));

// Your Bitrix24 webhook URL
const BITRIX_WEBHOOK_URL = 'https://nextgeneration.bitrix24.kz/rest/55843/ti4fotjmrh46o7zy/crm.lead.add.json';

// Handle form submissions at the /submit endpoint
app.post('/submit', async (req, res) => {
  const { Name, Email, Phone } = req.body;

  // Basic validation
  if (!Name || !Email || !Phone) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Data to be sent to Bitrix24
  const leadData = new URLSearchParams({
    'fields[TITLE]': `New Lead from Website - ${Name}`,
    'fields[NAME]': Name,
    'fields[EMAIL][0][VALUE]': Email,
    'fields[EMAIL][0][VALUE_TYPE]': 'WORK',
    'fields[PHONE][0][VALUE]': Phone,
    'fields[PHONE][0][VALUE_TYPE]': 'WORK',
    'fields[SOURCE_ID]': 'WEB',
    'params[REGISTER_SONET_EVENT]': 'Y'
  }).toString();

  try {
    const bitrixResponse = await fetch(BITRIX_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: leadData
    });

    if (!bitrixResponse.ok) {
        const errorText = await bitrixResponse.text();
        // Throw an error to be caught by the catch block
        throw new Error(`Bitrix24 API request failed: ${bitrixResponse.statusText} - ${errorText}`);
    }

    const bitrixResult = await bitrixResponse.json();

    // Check if Bitrix24 returned an error in its JSON response
    if (bitrixResult.error) {
        console.error('Bitrix24 API Error:', bitrixResult.error_description);
        return res.status(500).json({ success: false, message: `Bitrix24 Error: ${bitrixResult.error_description}` });
    }

    // Success
    res.status(200).json({ success: true, message: 'Lead submitted successfully!' });

  } catch (error) {
    console.error('Error submitting lead to Bitrix24:', error.message);
    res.status(500).json({ success: false, message: 'An internal server error occurred.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
