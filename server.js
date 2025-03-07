// server.js - With enhanced debugging and environment variables
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

// Get Azure ML credentials from environment variables
const AZURE_ML_ENDPOINT = process.env.AZURE_ML_ENDPOINT;
const AZURE_ML_API_KEY = process.env.AZURE_ML_API_KEY;

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Serve static files from the current directory
app.use(express.static('./'));

// Create a test endpoint to verify the server is working
app.get('/api/test', (req, res) => {
  return res.status(200).json({ message: 'Server is working correctly' });
});

// Modified proxy endpoint that uses environment variables for Azure ML
app.post('/api/azure-ml-proxy', async (req, res) => {
  try {
    const { data } = req.body; // No longer expecting azureEndpoint and apiKey in the request

    if (!AZURE_ML_ENDPOINT || !AZURE_ML_API_KEY) {
      console.error('Missing environment variables for Azure ML');
      return res.status(500).json({ error: 'Server configuration error: Missing Azure ML credentials' });
    }

    if (!data) {
      console.error('Missing data parameter in request');
      return res.status(400).json({ error: 'Missing required data parameter' });
    }

    console.log('================ AZURE ML REQUEST ================');
    console.log('Calling Azure ML endpoint:', AZURE_ML_ENDPOINT);
    console.log('API Key (first 10 chars):', AZURE_ML_API_KEY.substring(0, 10) + '...');
    console.log('Request payload sample:', JSON.stringify(data).substring(0, 500) + '...');

    try {
      const response = await axios({
        method: 'post',
        url: AZURE_ML_ENDPOINT,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AZURE_ML_API_KEY}`
        },
        data: data,
        timeout: 15000, // 15 seconds timeout
        validateStatus: () => true // Don't throw on non-2xx responses
      });

      // Log response info
      console.log('================ AZURE ML RESPONSE ================');
      console.log('Azure ML response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.status >= 400) {
        console.error('Azure ML API error:', typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2));
        return res.status(response.status).json({ 
          error: `Azure ML API returned status ${response.status}`,
          details: typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
        });
      }

      console.log('Azure ML result sample:', 
        typeof response.data === 'string'
          ? response.data.substring(0, 500) 
          : JSON.stringify(response.data).substring(0, 500) + '...'
      );
      
      return res.status(200).json(response.data);
    } catch (axiosError) {
      console.error('================ AXIOS ERROR ================');
      console.error('Error making request to Azure ML:', axiosError.message);
      
      if (axiosError.response) {
        console.error('Response status:', axiosError.response.status);
        console.error('Response headers:', axiosError.response.headers);
        console.error('Response data:', axiosError.response.data);
      } else if (axiosError.request) {
        console.error('No response received. Request details:', axiosError.request._currentUrl || axiosError.request);
      }
      
      return res.status(500).json({ 
        error: 'Error calling Azure ML API', 
        message: axiosError.message,
        code: axiosError.code
      });
    }
  } catch (error) {
    console.error('================ SERVER ERROR ================');
    console.error('Error in Azure ML proxy handler:', error.message);
    console.error(error.stack);
    
    return res.status(500).json({ 
      error: 'Server error processing request', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Default route to serve the main HTML file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Access your application at http://localhost:${PORT}`);
  console.log(`Environment check: Azure ML credentials ${AZURE_ML_ENDPOINT && AZURE_ML_API_KEY ? 'found' : 'MISSING'}`);
  console.log(`======================================================`);
});