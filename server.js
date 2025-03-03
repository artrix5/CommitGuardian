const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

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

// Create a proxy endpoint for Azure ML calls
app.post('/api/azure-ml-proxy', async (req, res) => {
  // ... existing Azure ML proxy code remains the same ...
});

// Add new proxy endpoint for commit analysis
app.post('/analyze', async (req, res) => {
  try {
    console.log('Received analysis request:', req.body);

    const backendUrl = 'http://localhost:8000/analyze';

    const response = await axios({
      method: 'post',
      url: backendUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      data: req.body,
      timeout: 15000 // 15 seconds timeout
    });

    console.log('Backend response:', response.data);
    res.status(200).json(response.data);

  } catch (error) {
    console.error('Error in /analyze proxy:', error.message);

    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      res.status(500).json({ 
        error: 'No response from backend', 
        message: 'Unable to connect to analysis service' 
      });
    } else {
      // Something happened in setting up the request
      console.error('Error setting up request:', error.message);
      res.status(500).json({ 
        error: 'Error processing request', 
        message: error.message 
      });
    }
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
  console.log(`======================================================`);
});