document.addEventListener('DOMContentLoaded', () => {
    const subjectDropdown = document.getElementById('subject-dropdown');
    const examplesSection = document.getElementById('examples-section');
    const examplesContainer = document.getElementById('examples-container');
    const examplesTitle = document.getElementById('examples-title');
    const assessmentSection = document.getElementById('assessment-section');
    const assessmentForm = document.getElementById('assessment-form');
    const assessmentTitle = document.getElementById('assessment-title');
    const startAssessmentBtn = document.getElementById('start-assessment-btn');
    const submitAssessmentBtn = document.getElementById('submit-assessment-btn');
    const assessmentResultsDiv = document.getElementById('assessment-results');
    const scoreParagraph = document.getElementById('score');
    const feedbackParagraph = document.getElementById('feedback');
    const loadingStatus = document.getElementById('loading-status');

    const API_BASE_URL = 'http://localhost:3000/api'; // Your backend URL

    let currentSubject = '';
    let currentAssessmentData = [];

    // --- Fetch Subjects ---
    function fetchSubjects() {
        setLoadingStatus('Loading subjects...');
        fetch(`${API_BASE_URL}/subjects`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(subjects => {
                populateSubjectDropdown(subjects);
                setLoadingStatus('');
            })
            .catch(error => {
                console.error('Error fetching subjects:', error);
                setLoadingStatus('Error loading subjects. Is the backend running?');
            });
    }

    function populateSubjectDropdown(subjects) {
        subjectDropdown.innerHTML = '<option value="">-- Choose Subject --</option>'; // Reset
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject.charAt(0).toUpperCase() + subject.slice(1); // Capitalize
            subjectDropdown.appendChild(option);
        });
    }

    function setLoadingStatus(message) {
        loadingStatus.textContent = message;
    }

    // --- Fetch Examples ---
    function fetchExamples(subject) {
        setLoadingStatus(`Loading examples for ${subject}...`);
        hideElement(assessmentSection); // Hide assessment when loading new examples
        hideElement(startAssessmentBtn); // Hide assessment button initially

        fetch(`${API_BASE_URL}/examples/${subject}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(examples => {
                displayExamples(subject, examples);
                setLoadingStatus('');
                showElement(examplesSection);
                // Only show assessment button if examples were loaded successfully
                if (examples && examples.length > 0) {
                    showElement(startAssessmentBtn);
                    startAssessmentBtn.disabled = false; // Enable button
                } else {
                    startAssessmentBtn.disabled = true; // Disable if no examples
                }
            })
            .catch(error => {
                console.error(`Error fetching examples for ${subject}:`, error);
                examplesContainer.innerHTML = `<p style="color: red;">Error loading examples. Please try again.</p>`;
                setLoadingStatus('');
                showElement(examplesSection); // Show section to display error
                startAssessmentBtn.disabled = true; // Keep disabled on error
                hideElement(startAssessmentBtn);
            });
    }

    function displayExamples(subject, examples) {
        examplesTitle.textContent = `${subject.charAt(0).toUpperCase() + subject.slice(1)} Examples`;
        examplesContainer.innerHTML = ''; // Clear previous examples

        if (!examples || examples.length === 0) {
            examplesContainer.innerHTML = '<p>No examples found for this subject.</p>';
            return;
        }

        examples.forEach(example => {
            const card = document.createElement('div');
            card.classList.add('example-card');
            card.innerHTML = `
                <h3>${example.concept}</h3>
                <p><strong>Real World Example:</strong> ${example.realWorldExample}</p>
                <p><strong>Explanation:</strong> ${example.explanation}</p>
            `;
            examplesContainer.appendChild(card);
        });
    }

  // --- Fetch Assessment ---
function fetchAssessment(subject) {
    setLoadingStatus(`Loading assessment for ${subject}...`);
    hideElement(assessmentResultsDiv); // Hide previous results
    submitAssessmentBtn.disabled = true; // Disable submit until loaded

    fetch(`${API_BASE_URL}/assessment/${subject}`)
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Assessment not available for this subject.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(assessment => {
            currentAssessmentData = assessment; // Store assessment data
            displayAssessment(subject, assessment);
            setLoadingStatus('');
            showElement(assessmentSection);
            submitAssessmentBtn.disabled = false; // Enable submit button
        })
        .catch(error => {
            console.error(`Error fetching assessment for ${subject}:`, error);
            assessmentForm.innerHTML = `<p style="color: red;">${error.message}</p>`;
            setLoadingStatus('');
            showElement(assessmentSection); // Show section to display error
            hideElement(submitAssessmentBtn); // Hide submit button if assessment failed to load
        });
}

function displayAssessment(subject, assessment) {
    assessmentTitle.textContent = `${subject.charAt(0).toUpperCase() + subject.slice(1)} Assessment`;
    assessmentForm.innerHTML = ''; // Clear previous form

    if (!assessment || assessment.length === 0) {
        assessmentForm.innerHTML = '<p>No assessment questions available for this subject.</p>';
        hideElement(submitAssessmentBtn);
        return;
    }

    assessment.forEach((question, index) => {
        const questionBlock = document.createElement('div');
        questionBlock.classList.add('question-block');
        questionBlock.setAttribute('data-question-id', question.id);

        let optionsHTML = '';
        // Randomize options order (optional but good practice)
        const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);

        shuffledOptions.forEach((option, optionIndex) => {
            // Use index and question id for unique radio button names per question
            const radioName = `question_${index}`;
            const radioId = `q${index}_option${optionIndex}`;
            optionsHTML += `
                <label for="${radioId}">
                    <input type="radio" name="${radioName}" id="${radioId}" value="${option}" required>
                    ${option}
                </label>
            `;
        });

        questionBlock.innerHTML = `
            <p>${index + 1}. ${question.questionText}</p>
            ${optionsHTML}
        `;
        assessmentForm.appendChild(questionBlock);
    });
    showElement(submitAssessmentBtn); // Ensure submit button is visible
}

// --- Handle Assessment Submission ---
function handleSubmitAssessment() {
    const formData = new FormData(assessmentForm);
    let score = 0;
    let totalQuestions = currentAssessmentData.length;
    let userAnswers = {};

    // Get user answers from the form
    currentAssessmentData.forEach((question, index) => {
        const questionId = question.id;
        const selectedOption = formData.get(`question_${index}`);
        userAnswers[questionId] = selectedOption; // Store user's selection

        // Check if the selected answer is correct
        if (selectedOption && selectedOption === question.correctAnswer) {
            score++;
        }
    });

    displayResults(score, totalQuestions);
}

function displayResults(score, totalQuestions) {
    scoreParagraph.textContent = `Your Score: ${score} out of ${totalQuestions}`;
    let feedback = '';
    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    if (percentage >= 80) {
        feedback = 'Excellent work!';
    } else if (percentage >= 60) {
        feedback = 'Good job! Review the examples for missed concepts.';
    } else {
        feedback = 'Keep practicing! Go through the examples again to solidify your understanding.';
    }
    feedbackParagraph.textContent = feedback;

    showElement(assessmentResultsDiv);
    // Scroll to results smoothly
    assessmentResultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// --- Event Listeners ---
subjectDropdown.addEventListener('change', (event) => {
    currentSubject = event.target.value;
    if (currentSubject) {
        fetchExamples(currentSubject);
        hideElement(assessmentSection); // Hide assessment when subject changes
        hideElement(assessmentResultsDiv); // Hide results
    } else {
        hideElement(examplesSection);
        hideElement(assessmentSection);
        hideElement(startAssessmentBtn);
        hideElement(assessmentResultsDiv);
    }
});

startAssessmentBtn.addEventListener('click', () => {
    if (currentSubject) {
        fetchAssessment(currentSubject);
    }
});

submitAssessmentBtn.addEventListener('click', () => {
    // Basic validation: Check if all questions are answered
    const radioGroups = assessmentForm.querySelectorAll('input[type="radio"]');
    const questionCount = currentAssessmentData.length;
    let answeredCount = 0;
    const groupNames = new Set();

    radioGroups.forEach(radio => groupNames.add(radio.name)); // Find unique question groups

    groupNames.forEach(name => {
        if (assessmentForm.querySelector(`input[name="${name}"]:checked`)) {
            answeredCount++;
        }
    });

    if (answeredCount < questionCount) {
        alert('Please answer all questions before submitting.');
        return;
    }

    handleSubmitAssessment();
}); // <--- added closing bracket here