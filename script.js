const EXAM_SOURCE = 'exam.json';

const state = {
    exam: null,
    questions: [],
    answers: {},
    feedback: {},
    mode: 'practice'
};

const elements = {
    examTitle: document.getElementById('exam-title'),
    examMeta: document.getElementById('exam-meta'),
    examInstructions: document.getElementById('exam-instructions'),
    questionsContainer: document.getElementById('questions-container'),
    resultsContainer: document.getElementById('results-container'),
    progressPill: document.getElementById('progress-pill'),
    scorePill: document.getElementById('score-pill'),
    llmEndpoint: document.getElementById('llm-endpoint'),
    llmModel: document.getElementById('llm-model')
};

function setMode(newMode) {
    state.mode = newMode;
    renderQuestions();
    renderResults();
}

function updateProgress() {
    const answered = Object.values(state.answers).filter(value => value !== null && value !== '' && value !== undefined).length;
    const total = state.questions.length;
    elements.progressPill.textContent = `${answered}/${total} answered`;
}

function updateScore() {
    const scored = state.questions.filter(question => state.feedback[question.id]?.score !== undefined);
    if (scored.length === 0) {
        elements.scorePill.textContent = 'Score: --';
        return;
    }
    const earned = scored.reduce((sum, question) => sum + (state.feedback[question.id].score || 0), 0);
    const possible = scored.reduce((sum, question) => sum + (question.grading?.maxScore || 1), 0);
    elements.scorePill.textContent = `Score: ${earned}/${possible}`;
}

async function loadExam() {
    const response = await fetch(EXAM_SOURCE);
    if (!response.ok) {
        throw new Error('Unable to load exam data');
    }
    const data = await response.json();
    state.exam = data.exam;
    state.questions = data.questions;
    state.answers = {};
    state.feedback = {};
    renderExam();
    renderQuestions();
    renderResults();
}

function renderExam() {
    if (!state.exam) return;
    elements.examTitle.textContent = state.exam.title;
    elements.examMeta.textContent = `${state.exam.subject} · ${state.exam.timeLimitMinutes} minutes`;
    elements.examInstructions.innerHTML = '';
    state.exam.instructions.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        elements.examInstructions.appendChild(li);
    });
}

function renderQuestions() {
    elements.questionsContainer.innerHTML = '';
    state.questions.forEach((question, index) => {
        const card = document.createElement('article');
        card.className = 'question-card';
        card.innerHTML = `
            <div class="question-header">
                <div>
                    <p class="eyebrow">Question ${index + 1}</p>
                    <h3>${question.prompt}</h3>
                </div>
                <div class="question-type">${question.type.replace('_', ' ')}</div>
            </div>
        `;

        const body = document.createElement('div');
        body.className = 'question-body';

        if (question.type === 'multiple_choice' || question.type === 'true_false') {
            const options = document.createElement('div');
            options.className = 'options';
            question.options.forEach((option, optionIndex) => {
                const optionId = `${question.id}-${optionIndex}`;
                const label = document.createElement('label');
                label.className = 'option';
                label.innerHTML = `
                    <input type="radio" name="${question.id}" value="${optionIndex}" id="${optionId}">
                    <span>${option}</span>
                `;
                const input = label.querySelector('input');
                input.checked = state.answers[question.id] === optionIndex;
                input.addEventListener('change', () => {
                    state.answers[question.id] = optionIndex;
                    updateProgress();
                });
                options.appendChild(label);
            });
            body.appendChild(options);
        }

        if (question.type === 'short_text' || question.type === 'long_text') {
            const textarea = document.createElement('textarea');
            textarea.rows = question.type === 'short_text' ? 3 : 6;
            textarea.placeholder = 'Type your response here...';
            textarea.value = state.answers[question.id] || '';
            textarea.addEventListener('input', () => {
                state.answers[question.id] = textarea.value.trim();
                updateProgress();
            });
            body.appendChild(textarea);

            const rubric = document.createElement('div');
            rubric.className = 'rubric';
            rubric.innerHTML = `
                <strong>Rubric:</strong>
                <p>${question.grading?.rubric || 'No rubric provided.'}</p>
            `;
            body.appendChild(rubric);
        }

        const actions = document.createElement('div');
        actions.className = 'question-actions';
        const checkBtn = document.createElement('button');
        checkBtn.className = 'secondary';
        checkBtn.textContent = state.mode === 'practice' ? 'Check & Coach' : 'Grade Answer';
        checkBtn.addEventListener('click', async () => {
            await gradeQuestion(question);
            renderResults();
            renderQuestions();
        });
        actions.appendChild(checkBtn);

        if (state.mode === 'practice') {
            const retryBtn = document.createElement('button');
            retryBtn.className = 'ghost';
            retryBtn.textContent = 'Reset Answer';
            retryBtn.addEventListener('click', () => {
                state.answers[question.id] = question.type.includes('text') ? '' : null;
                delete state.feedback[question.id];
                renderQuestions();
                renderResults();
                updateProgress();
            });
            actions.appendChild(retryBtn);
        }

        card.appendChild(body);
        card.appendChild(actions);

        const feedback = state.feedback[question.id];
        if (feedback) {
            const feedbackBlock = document.createElement('div');
            feedbackBlock.className = `feedback ${feedback.correct ? 'success' : 'warning'}`;
            feedbackBlock.innerHTML = `
                <p><strong>${feedback.title}</strong></p>
                <p>${feedback.message}</p>
                ${feedback.rationale ? `<p class="muted"><strong>Rationale:</strong> ${feedback.rationale}</p>` : ''}
            `;
            card.appendChild(feedbackBlock);
        }

        elements.questionsContainer.appendChild(card);
    });
    updateProgress();
}

function renderResults() {
    elements.resultsContainer.innerHTML = '';
    state.questions.forEach((question, index) => {
        const feedback = state.feedback[question.id];
        const result = document.createElement('div');
        result.className = 'result-card';
        result.innerHTML = `
            <div>
                <p class="eyebrow">Question ${index + 1}</p>
                <h4>${question.prompt}</h4>
            </div>
        `;
        const status = document.createElement('div');
        status.className = 'result-status';
        if (!feedback) {
            status.textContent = 'Not graded';
            status.classList.add('pending');
        } else {
            status.textContent = feedback.correct ? 'Correct' : 'Needs work';
            status.classList.add(feedback.correct ? 'correct' : 'needs-work');
        }
        result.appendChild(status);

        if (feedback) {
            const details = document.createElement('p');
            details.className = 'muted';
            details.textContent = feedback.message;
            result.appendChild(details);
        }

        elements.resultsContainer.appendChild(result);
    });
    updateScore();
}

function getSelectedAnswer(question) {
    return state.answers[question.id];
}

function evaluateChoice(question) {
    const selected = getSelectedAnswer(question);
    if (selected === null || selected === undefined) {
        return {
            correct: false,
            title: 'Answer missing',
            message: 'Select an option before checking.'
        };
    }
    const correctIndex = question.answer_key?.correct?.[0];
    const isCorrect = selected === correctIndex;
    if (state.mode === 'practice') {
        return {
            correct: isCorrect,
            title: isCorrect ? 'Great job!' : 'Try again',
            message: isCorrect
                ? 'You selected the correct option.'
                : 'Review the concept and check for common mistakes before retrying.'
        };
    }
    return {
        correct: isCorrect,
        title: isCorrect ? 'Correct' : 'Incorrect',
        message: isCorrect
            ? 'Answer is correct.'
            : `Correct answer: ${question.options[correctIndex]}`,
        rationale: question.answer_key?.rationale
    };
}

async function gradeText(question) {
    const answer = getSelectedAnswer(question);
    if (!answer) {
        return {
            correct: false,
            title: 'Answer missing',
            message: 'Enter a response before checking.'
        };
    }

    const payload = buildGradePayload(question, answer);
    const endpoint = elements.llmEndpoint.value.trim();
    const model = elements.llmModel.value.trim();

    if (!endpoint) {
        return {
            correct: false,
            title: state.mode === 'practice' ? 'Coaching hint' : 'Assessment summary',
            message: generateMockFeedback(question, answer),
            score: 0
        };
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...payload,
            model
        })
    });

    if (!response.ok) {
        return {
            correct: false,
            title: 'Grading error',
            message: 'Unable to reach grading endpoint. Verify your server and try again.'
        };
    }

    const result = await response.json();
    return {
        correct: result.correct ?? false,
        title: result.title || (state.mode === 'practice' ? 'Coaching hint' : 'Assessment summary'),
        message: result.feedback || result.message || 'No feedback provided.',
        rationale: result.rationale,
        score: result.score ?? 0
    };
}

function buildGradePayload(question, answer) {
    return {
        mode: state.mode,
        exam: {
            id: state.exam.id,
            title: state.exam.title,
            subject: state.exam.subject
        },
        question: {
            id: question.id,
            type: question.type,
            prompt: question.prompt,
            rubric: question.grading?.rubric,
            commonMistakes: question.grading?.commonMistakes || []
        },
        answer
    };
}

function generateMockFeedback(question, answer) {
    if (state.mode === 'practice') {
        return `Check your steps. A common mistake is: ${question.grading?.commonMistakes?.[0] || 'missing a key step.'} Focus on isolating the variable before simplifying.`;
    }
    return `Correct answer: consult the model to verify steps. Your response "${answer}" is missing at least one key step from the rubric.`;
}

async function gradeQuestion(question) {
    let feedback;
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
        feedback = evaluateChoice(question);
        feedback.score = feedback.correct ? (question.grading?.maxScore || 1) : 0;
    } else {
        feedback = await gradeText(question);
    }
    state.feedback[question.id] = feedback;
}

async function submitExam() {
    for (const question of state.questions) {
        await gradeQuestion(question);
    }
    renderResults();
    renderQuestions();
}

function bindEvents() {
    document.querySelectorAll('input[name="mode"]').forEach(input => {
        input.addEventListener('change', event => setMode(event.target.value));
    });

    document.getElementById('submit-exam').addEventListener('click', submitExam);
    document.getElementById('reload-exam').addEventListener('click', loadExam);
}

document.addEventListener('DOMContentLoaded', async () => {
    bindEvents();
    try {
        await loadExam();
    } catch (error) {
        elements.examTitle.textContent = 'Unable to load exam';
        elements.examMeta.textContent = error.message;
    }
});
