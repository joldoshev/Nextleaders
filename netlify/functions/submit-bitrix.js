const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
      headers: { 'Allow': 'POST' }
    };
  }

    const bitrixWebhookUrl = 'https://nextgeneration.bitrix24.kz/rest/55843/ti4fotjmrh46o7zy/crm.lead.add.json';

  try {
    const data = JSON.parse(event.body);

    // Basic validation
    if (!data.Name || !data.Email || !data.Phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'All fields are required.' })
      };
    }

    // Prepare the data for Bitrix24 in the required format
    const leadData = new URLSearchParams({
      'fields[TITLE]': 'New Lead from Website',
      'fields[NAME]': data.Name,
      'fields[EMAIL][0][VALUE]': data.Email,
      'fields[EMAIL][0][VALUE_TYPE]': 'WORK',
      'fields[PHONE][0][VALUE]': data.Phone,
      'fields[PHONE][0][VALUE_TYPE]': 'WORK',
      'fields[SOURCE_ID]': 'WEB',
      'params[REGISTER_SONET_EVENT]': 'Y'
    }).toString();

    const response = await fetch(bitrixWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: leadData
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      return {
        statusCode: response.status,
        body: JSON.stringify({ success: false, message: 'Bitrix24 API Error', details: errorDetails })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Lead successfully created in Bitrix24.' })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Internal Server Error', error: error.message })
    };
  }
};
