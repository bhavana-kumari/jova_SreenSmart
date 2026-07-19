# ScreenSmart — AI Screening & Scoring Module

**Team Member 2** · Resume vs JD screening with explainable Gemini output + n8n Strong Fit webhook.

## What this module does

1. Receives **Resume JSON** + **Job Description JSON**
2. Validates both payloads
3. Compares skills deterministically
4. Calls **Gemini** for an explainable fit decision
5. Returns structured JSON to the frontend
6. If `fit === "Strong Fit"`, POSTs to `N8N_WEBHOOK` for interview scheduling

## What this module does NOT do

Auth · Resume parsing · Frontend · DB models · Google Calendar · Gmail · n8n workflows

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

### `POST /api/screen`

**Request**

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

**Success response (200)**

```json
{
  "fit": "Strong Fit",
  "matchedSkills": ["Python", "SQL", "AWS Certification", "Docker"],
  "missingSkills": ["Kubernetes"],
  "reason": "Candidate satisfies all mandatory requirements.",
  "confidence": "High",
  "candidateName": "Rahul Sharma",
  "email": "rahul@gmail.com"
}
```

### Fit logic

| Fit | Rule |
|-----|------|
| **Strong Fit** | All mandatory requirements met (required skills + min experience) |
| **Possible Fit** | Exactly one mandatory miss |
| **Not Fit** | Two or more mandatory misses |

Preferred-skill gaps alone do **not** downgrade Strong Fit.

## Folder structure

```
controllers/   # HTTP handlers
services/      # Skill compare, Gemini, n8n
routes/        # Express routes
utils/         # Validators + safe JSON parse
prompts/       # Gemini prompt builder
config/        # Environment loading
```

## Error responses

| Case | Status |
|------|--------|
| Missing / invalid Resume or JD | `400` |
| Gemini API / invalid JSON | `502` |
| Network failure (Gemini) | `503` |
| Webhook failure | Screening still `200`; `webhookWarning` set |

## Example curl

```bash
curl -X POST http://localhost:5000/api/screen \
  -H "Content-Type: application/json" \
  -d "{\"resume\":{\"name\":\"Rahul Sharma\",\"email\":\"rahul@gmail.com\",\"skills\":[\"Python\",\"SQL\",\"Docker\"],\"experience\":4,\"certifications\":[\"AWS Certified Developer\"]},\"jobDescription\":{\"requiredSkills\":[\"Python\",\"SQL\",\"AWS Certification\"],\"preferredSkills\":[\"Docker\",\"Kubernetes\"],\"minimumExperience\":3}}"
```
