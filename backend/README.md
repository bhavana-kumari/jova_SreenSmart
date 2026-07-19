# ScreenSmart — AI Screening & Scoring Module

**Team Member 2** · Upload resumes → extract → structure → explainable Gemini screening → n8n on Strong Fit.

## Flow

1. Frontend sends **multipart/form-data**: `jobDescription` + multiple `resumes` (PDF/DOCX)
2. Extract plain text (pdf-parse / mammoth)
3. Structure resume + JD with Gemini
4. Reuse **existing** AI screening module (compare → Gemini fit → n8n)
5. Return an **array** of results to the frontend

## Setup

```bash
npm install
cp .env.example .env
# Fill GEMINI_API_KEY, N8N_WEBHOOK, PORT
npm start
```

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio / Gemini API key |
| `N8N_WEBHOOK` | No* | Webhook URL for Strong Fit candidates |
| `PORT` | No | Defaults to `5000` |
| `GEMINI_MODEL` | No | Defaults to `gemini-flash-lite-latest` |

\*If unset, Strong Fit screening still works; webhook is skipped with a warning.

## API

### `GET /health`

```json
{ "status": "ok", "module": "ai-screening" }
```

### `POST /api/screen` (primary — file upload)

`Content-Type: multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| `jobDescription` | text | Raw job description string |
| `resumes` | file(s) | One or more PDF / DOCX resumes |

**Success response (200)** — array:

```json
[
  {
    "candidateName": "Rahul Sharma",
    "email": "rahul@gmail.com",
    "fit": "Strong Fit",
    "reason": "Candidate satisfies all mandatory requirements.",
    "matchedSkills": ["Python", "SQL", "AWS Certification"],
    "missingSkills": ["Kubernetes"],
    "confidence": "High",
    "fileName": "rahul.pdf"
  }
]
```

### `POST /api/screen/json` (legacy — structured JSON)

```json
{
  "resume": {
    "name": "Rahul Sharma",
    "email": "rahul@gmail.com",
    "skills": ["Python", "SQL", "Docker"],
    "experience": 4,
    "certifications": ["AWS Certified Developer"]
  },
  "jobDescription": {
    "requiredSkills": ["Python", "SQL", "AWS Certification"],
    "preferredSkills": ["Docker", "Kubernetes"],
    "minimumExperience": 3
  }
}
```

## Fit logic (unchanged)

| Fit | Rule |
|-----|------|
| **Strong Fit** | All mandatory requirements met |
| **Possible Fit** | Exactly one mandatory miss |
| **Not Fit** | Two or more mandatory misses |

## Folder structure

```
middleware/   Multer upload (PDF/DOCX only)
controllers/  HTTP handlers
services/     Gemini client, screening pipeline, n8n (existing logic reused)
routes/       Express routes
utils/        PDF/DOCX extract, resume/JD structure, adapters
prompts/      Screening + extraction prompts
config/       Environment
```

## Example curl (multipart)

```bash
curl -X POST http://localhost:5000/api/screen \
  -F "jobDescription=We need a Python developer with SQL, AWS Certification. Preferred: Docker, Kubernetes. Min 3 years." \
  -F "resumes=@./rahul.pdf" \
  -F "resumes=@./priya.docx"
```
