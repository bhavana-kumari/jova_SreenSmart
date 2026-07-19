/**
 * services/api.js
 * ---------------
 * Axios helpers for talking to the ScreenSmart backend.
 * Frontend only uploads files + JD — extraction/AI stay on the server.
 */

import axios from "axios";

// Empty baseURL → Vite proxy forwards /api to http://localhost:4000
const api = axios.create({
  baseURL: "",
  timeout: 120000, // screening multiple resumes can take a while
});

/**
 * Screens candidates by uploading JD text + resume files.
 *
 * @param {string} jobDescription - Raw JD text from the textarea
 * @param {File[]} resumeFiles - PDF/DOCX File objects
 * @returns {Promise<object[]>} Array of screening results from the backend
 */
export async function screenCandidates(jobDescription, resumeFiles) {
  const formData = new FormData();
  formData.append("jobDescription", jobDescription);

  // Backend accepts field name "resumes" (and also "resumes[]")
  resumeFiles.forEach((file) => {
    formData.append("resumes", file);
  });

  const response = await api.post("/api/screen", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // Backend returns an array of candidate results
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * Maps Axios / network errors into friendly recruiter-facing messages.
 * @param {unknown} error
 * @returns {string}
 */
export function getFriendlyError(error) {
  if (!error) return "Something went wrong. Please try again.";

  if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
    return "Server unavailable. Make sure the backend is running on port 4000.";
  }

  if (error.code === "ECONNABORTED") {
    return "The request timed out. Try fewer resumes or try again.";
  }

  const serverMessage = error.response?.data?.error;
  if (serverMessage) return serverMessage;

  if (error.response?.status === 400) {
    return "Upload failed. Check your job description and resume files.";
  }

  if (error.response?.status >= 500) {
    return "Server error while screening. Please try again in a moment.";
  }

  return error.message || "Network error. Please try again.";
}

export default api;
