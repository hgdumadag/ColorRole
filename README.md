# Exam Builder & Practice

A reusable, interactive web application for building exams and supporting both practice and assessment modes.

## Features

### 1. Reusable Exam Schema
- Centralized `exam.json` defines metadata, instructions, and questions.
- Supports question types:
  - Multiple choice
  - True/False
  - Short text
  - Long text

### 2. Dual Modes
- **Practice mode**: Provides coaching hints without revealing answers.
- **Assessment mode**: Reveals correct answers with rationale after grading.

### 3. LLM-Ready Text Grading
- Text responses are sent to a configurable grading endpoint.
- Works with OpenAI (e.g., `gpt-5.2-mini`) or local LLMs via Ollama.
- Payload includes a consistent structure: exam, question, rubric, and student response.

### 4. Results Dashboard
- Tracks question completion.
- Summarizes feedback and scoring.

## Usage

1. Open `index.html` in a browser (no build tools required).
2. Edit `exam.json` to create new subjects or exams.
3. Add a grading endpoint for short/long text answers.

## Text Grading Endpoint (Expected Payload)

```json
{
  "mode": "practice",
  "exam": {"id": "math-101-midterm", "title": "Math 101 Midterm", "subject": "Algebra Basics"},
  "question": {
    "id": "q3",
    "type": "short_text",
    "prompt": "Solve for x: 4x + 6 = 18",
    "rubric": "Award 2 points for x=3 with correct steps...",
    "commonMistakes": ["Subtracting 6 incorrectly", "Dividing by 4 before isolating"]
  },
  "answer": "x = 3"
}
```

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript

## License

MIT License - feel free to use and modify for your projects!
