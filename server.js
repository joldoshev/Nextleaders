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
const BITRIX_WEBHOOK_URL = process.env.BITRIX_WEBHOOK_URL || 'https://nextgeneration.bitrix24.kz/rest/5584/ti4fotjmrh46o7zy/'; // Fallback for local testing

// Handle form submissions at the /submit endpoint
app.post('/submit', (req, res) => {
  console.log('Received form submission:', req.body);
  const { Name, Email, Phone, Selectbox, Selectbox_2 } = req.body;

  // Basic validation
  if (!Name || !Phone) {
    return res.status(400).json({
      success: false,
      message: 'Name and Phone are required.',
      received_body: req.body // for debugging
    });
  }

  // Immediately respond to the client to make the form feel fast.
  res.redirect('/spasibo');

  // --- Process the Bitrix24 request in the background ---
  const fields = {
    'fields[TITLE]': `New Lead from Website - ${Name}`,
    'fields[NAME]': Name,
    'fields[PHONE][0][VALUE]': Phone,
    'fields[PHONE][0][VALUE_TYPE]': 'WORK',
    'fields[SOURCE_ID]': 'WEB',
    'params[REGISTER_SONET_EVENT]': 'Y'
  };

  if (Email) {
    fields['fields[EMAIL][0][VALUE]'] = Email;
    fields['fields[EMAIL][0][VALUE_TYPE]'] = 'WORK';
  }

  let comments = [];
  if (Selectbox) {
      comments.push(`Role: ${Selectbox}`);
  }
  if (Selectbox_2) {
      comments.push(`Grade: ${Selectbox_2}`);
  }
  if (comments.length > 0) {
      fields['fields[COMMENTS]'] = comments.join('\n');
  }

  const leadData = new URLSearchParams(fields).toString();

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
