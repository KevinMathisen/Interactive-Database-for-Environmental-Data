const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const port = 3000; 

// Middleware to enable CORS (Cross-Origin Resource Sharing) for development purposes
// Without this the CORS policy: No 'Access-Control-Allow-Origin' header will block requests from the client
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Handle favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Handle requests for json data
app.get('/:endpoint', (req, res) => {

	// log the request
	console.log(`GET request for ${req.params.endpoint}`);

	// Extract the json file name from the request
	const { endpoint } = req.params;
	const filePath = path.join(__dirname, 'data', `${endpoint}.json`);

	// Read the json file specified in the request, send it as a response if it exists
	fs.readFile(filePath, (err, data) => {
		if (err) {
			console.error(err);
			res.status(500).send('Could not read json file');
			return;
		}
		res.json(JSON.parse(data));
	});
});

app.listen(port, () => {
  console.log(`Postgrest mock server listening at http://localhost:${port}`);
});