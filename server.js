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
// Your Bitrix24 webhook URL - now loaded from an environment variable
const BITRIX_WEBHOOK_URL = process.env.BITRIX_WEBHOOK_URL;

// Handle form submissions at the /submit endpoint
app.post('/submit', (req, res) => {
  const { Name, Email, Phone } = req.body;

  // Basic validation
  if (!Name || !Email || !Phone) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  // Immediately respond to the client to make the form feel fast.
  res.status(200).json({ success: true, message: 'Thank you! Your submission has been received and is being processed.' });

  // --- Process the Bitrix24 request in the background ---
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

  // This is a "fire-and-forget" request. We don't wait for the Bitrix24 API.
  // We use an async IIFE to handle the API call without blocking the main thread.
  (async () => {
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
        throw new Error(`Bitrix24 API request failed: ${bitrixResponse.statusText} - ${errorText}`);
      }

      const bitrixResult = await bitrixResponse.json();

      if (bitrixResult.error) {
        console.error('Bitrix24 API Error:', bitrixResult.error_description);
      } else {
        console.log('Lead submitted successfully to Bitrix24.');
      }

    } catch (error) {
      // Log any errors to the server console for debugging.
      console.error('Error submitting lead to Bitrix24 in the background:', error.message);
    }
  })();
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Export the app for Vercel
module.exports = app;
