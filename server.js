require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { marked } = require('marked');

// Import mock commits
const mockCommits = require('./mock_data/mock_commits.js').default;

// Azure OpenAI imports
const { OpenAI } = require('openai');

// Get credentials from environment variables
const AZURE_ML_ENDPOINT = process.env.AZURE_ML_ENDPOINT;
const AZURE_ML_API_KEY = process.env.AZURE_ML_API_KEY;
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_MODEL = process.env.AZURE_OPENAI_MODEL || 'gpt-4o-mini';

// Initialize Azure OpenAI Client
const openai = new OpenAI({
  apiKey: AZURE_OPENAI_API_KEY,
  baseURL: AZURE_OPENAI_ENDPOINT,
  defaultQuery: { 'api-version': '2024-02-01' },
  defaultHeaders: {
    'Authorization': `Bearer ${AZURE_OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    'azureml-model-deployment': 'rg-ent-poc-euwe-stranirad-sluih'
  }
});

// Configure marked to render clean HTML
marked.setOptions({
  gfm: true,           // GitHub Flavored Markdown
  breaks: true,        // Support line breaks
  pedantic: false,     // Disable pedantic mode
  sanitize: false,     // Allow HTML tags
  smartypants: true    // Use "smart" typographic punctuation
});

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Serve static files from the current directory
app.use(express.static('./'));

// Proxy endpoint for Azure ML
app.post('/api/azure-ml-proxy', async (req, res) => {
  try {
    const { data } = req.body;

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


// Endpoint for generating commit suggestions
app.get('/api/suggestions/:commitId', async (req, res) => {
  try {
    const { commitId } = req.params;

    // Find the specific commit from mock data
    const commitData = mockCommits.find(commit => commit.hash === commitId);

    if (!commitData) {
      return res.status(404).json({ error: 'Commit not found' });
    }

    // Set a timeout to ensure the request doesn't hang indefinitely
    const timeoutId = setTimeout(() => {
      console.log(`Request for commit ${commitId} timed out after 10 seconds`);
      // Return a basic response with empty suggestions if GPT times out
      return res.status(200).json({
        commit_id: commitId,
        repository: commitData.repo,
        suggestions: [],
        markdown: "Analysis is taking longer than expected. Please try again.",
        renderedMarkdown: "<p>Analysis is taking longer than expected. Please try again.</p>"
      });
    }, 10000); // 10 second timeout

    // Construct the request body for the GPT-4o-mini model
    const requestBody = JSON.stringify({
      prompt: `Analyze the provided JSON file, which contains details about a commit. Your task is to:

    1. **Summarize the Commit:** Provide a concise and clear summary of what the commit does.  
    2. **Assess Merge Risks:** Identify potential risks when merging the commit. Consider:
       - If the commit is too large or modifies too many files.
       - If tests are failing or missing.
       - If it introduces potential breaking changes.
    3. **Analyze Security Vulnerabilities:** Examine the code for security risks and provide recommendations to fix them.

Repository: ${commitData.repo}
Commit Hash: ${commitData.hash}
Author: ${commitData.author}
Message: ${commitData.message}

Code Changes:
- Files Changed: ${commitData.files.length}
- Language: ${commitData.programming_language}
- Lines Added: ${commitData.lines_added}
- Lines Deleted: ${commitData.lines_deleted}

Specific Files:
${commitData.files.map(file =>
        `- ${file.name} (${file.type})`
      ).join('\n')}

Code Details:
${commitData.files.map(file =>
        `\n--- ${file.name} ---\n${file.code}`
      ).join('\n')}

Provide recommendations with markdown formatting, using bold, lists, and emphasis.`
    });

    const requestHeaders = new Headers({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.AZURE_OPENAI_API_KEY}`,
      "azureml-model-deployment": "rg-ent-poc-euwe-stranirad-sluih"
    });

    const url = "";

    console.log("Sending request to GPT-4o-mini");

    try {
      // Use Promise with a timeout for the fetch operation
      const fetchPromise = fetch(url, {
        method: "POST",
        body: requestBody,
        headers: requestHeaders
      });
      
      // Race the fetch against a 7-second timeout (shorter than our overall timeout)
      const response = await Promise.race([
        fetchPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('GPT API timeout')), 7000)
        )
      ]);

      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error("Request failed with status code", response.status);
        throw new Error("GPT-4o-mini request failed");
      }

      const json = await response.json();
      console.log("GPT-4o-mini response received");

      // Validate the response
      if (!json || !json.output) {
        throw new Error("Invalid response from GPT-4o-mini: Missing 'output' field");
      }

      // Convert markdown to HTML
      const renderedMarkdown = marked.parse(json.output);

      // Return suggestions with rendered markdown
      return res.json({
        commit_id: commitId,
        repository: commitData.repo,
        suggestions: [],  // This will be populated by frontend
        markdown: json.output,  // Original markdown
        renderedMarkdown: renderedMarkdown  // HTML-rendered markdown
      });
    } catch (fetchError) {
      // Clear the timeout since we're handling the error
      clearTimeout(timeoutId);
      
      console.error("Error fetching GPT response:", fetchError.message);
      
      // Generate a simple fallback response instead of failing
      const fallbackMarkdown = `
## Commit Analysis

**Summary:** This commit appears to be related to ${commitData.message}

**Potential Merge Risks:**
- Changes span across ${commitData.files.length} files
- This is a ${commitData.lines_added + commitData.lines_deleted > 200 ? 'large' : 'moderate'} commit with ${commitData.lines_added} lines added and ${commitData.lines_deleted} lines deleted

**Recommendations:**
- Review all code changes carefully
- Ensure adequate test coverage
- Consider breaking large changes into smaller, focused commits
      `;
      
      const renderedFallback = marked.parse(fallbackMarkdown);
      
      return res.json({
        commit_id: commitId,
        repository: commitData.repo,
        suggestions: [],
        markdown: fallbackMarkdown,
        renderedMarkdown: renderedFallback,
        is_fallback: true
      });
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({
      error: 'Failed to generate suggestions',
      details: error.message
    });
  }
});

// Create a test endpoint to verify the server is working
app.get('/api/test', (req, res) => {
  return res.status(200).json({ message: 'Server is working correctly' });
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
  console.log(`Environment check: Azure OpenAI credentials ${AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_API_KEY ? 'found' : 'MISSING'}`);
  console.log(`======================================================`);
});