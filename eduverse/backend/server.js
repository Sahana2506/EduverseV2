// Endpoint to get examples for a specific subject
app.get('/api/examples/:subject', (req, res) => {
    const subject = req.params.subject;
    const filePath = path.join(dataDir, `${subject}_examples.json`); // Fix: Use backticks for template literal

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading examples file for ${subject}:`, err); // Fix: Use backticks for template literal
            // Check if the error is because the file doesn't exist
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: `Examples not found for subject: ${subject}` }); // Fix: Use backticks for template literal
            }
            // Otherwise, it's a server error
            return res.status(500).json({ error: `Failed to read examples for subject: ${subject}` }); // Fix: Use backticks for template literal
        }

        try {
            const examples = JSON.parse(data);
            res.json(examples);
        } catch (parseErr) {
            console.error(`Error parsing JSON for ${subject} examples:`, parseErr); // Fix: Use backticks for template literal
            res.status(500).json({ error: `Failed to parse example data for subject: ${subject}` }); // Fix: Use backticks for template literal
        }
    });
});

// Endpoint to get assessment questions for a specific subject
app.get('/api/assessment/:subject', (req, res) => {
    const subject = req.params.subject;
    const filePath = path.join(dataDir, `${subject}_assessment.json`); // Fix: Use backticks for template literal

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading assessment file for ${subject}:`, err); // Fix: Use backticks for template literal
             if (err.code === 'ENOENT') {
                return res.status(404).json({ error: `Assessment not found for subject: ${subject}` }); // Fix: Use backticks for template literal
            }
            return res.status(500).json({ error: `Failed to read assessment for subject: ${subject}` }); // Fix: Use backticks for template literal
        }

        try {
            const assessment = JSON.parse(data);
            // Optional: Shuffle questions or options here if desired
            res.json(assessment);
        } catch (parseErr) {
            console.error(`Error parsing JSON for ${subject} assessment:`, parseErr); // Fix: Use backticks for template literal
            res.status(500).json({ error: `Failed to parse assessment data for subject: ${subject}` }); // Fix: Use backticks for template literal
        }
    });
});