const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Directory where your example and assessment JSON files are stored
const dataDir = path.join(__dirname, 'data'); // Make sure 'data' folder exists

// Endpoint to get examples for a specific subject
app.get('/api/examples/:subject', (req, res) => {
    const subject = req.params.subject;
    const filePath = path.join(dataDir, `${subject}_examples.json`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading examples file for ${subject}:`, err);
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: `Examples not found for subject: ${subject}` });
            }
            return res.status(500).json({ error: `Failed to read examples for subject: ${subject}` });
        }

        try {
            const examples = JSON.parse(data);
            res.json(examples);
        } catch (parseErr) {
            console.error(`Error parsing JSON for ${subject} examples:`, parseErr);
            res.status(500).json({ error: `Failed to parse example data for subject: ${subject}` });
        }
    });
});

// Endpoint to get assessment questions for a specific subject
app.get('/api/assessment/:subject', (req, res) => {
    const subject = req.params.subject;
    const filePath = path.join(dataDir, `${subject}_assessment.json`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading assessment file for ${subject}:`, err);
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: `Assessment not found for subject: ${subject}` });
            }
            return res.status(500).json({ error: `Failed to read assessment for subject: ${subject}` });
        }

        try {
            const assessment = JSON.parse(data);
            res.json(assessment);
        } catch (parseErr) {
            console.error(`Error parsing JSON for ${subject} assessment:`, parseErr);
            res.status(500).json({ error: `Failed to parse assessment data for subject: ${subject}` });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
