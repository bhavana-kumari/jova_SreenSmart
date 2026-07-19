/**
 * pages/Upload.jsx
 * ----------------
 * Recruiter uploads JD + resumes, then calls POST /api/screen.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UploadBox from "../components/UploadBox";
import DragDropUploader from "../components/DragDropUploader";
import LoadingOverlay from "../components/LoadingOverlay";
import { screenCandidates, getFriendlyError } from "../services/api";
import { useScreening } from "../context/ScreeningContext";
import { HiOutlineSparkles } from "react-icons/hi2";

export default function Upload() {
  const navigate = useNavigate();
  const { setResults, setJobDescription: saveJd } = useScreening();

  const [jobDescription, setJobDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [jdError, setJdError] = useState("");
  const [fileError, setFileError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setJdError("");
    setFileError("");
    setFormError("");

    let valid = true;
    if (!jobDescription.trim()) {
      setJdError("No Job Description entered. Paste a JD before analyzing.");
      valid = false;
    }
    if (!files.length) {
      setFileError("No resumes selected. Upload at least one PDF or DOCX file.");
      valid = false;
    }
    if (!valid) return;

    setLoading(true);
    try {
      const results = await screenCandidates(jobDescription.trim(), files);
      setResults(results);
      saveJd(jobDescription.trim());
      navigate("/dashboard");
    } catch (err) {
      setFormError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <LoadingOverlay show={loading} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            Step 1 · Screening
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">
            Resume Screening
          </h1>
          <p className="mt-2 text-sm text-muted">
            Paste the job description, upload candidate resumes, and let the
            backend AI pipeline score every fit.
          </p>
        </div>

        <form
          onSubmit={handleAnalyze}
          className="space-y-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8"
        >
          <UploadBox
            value={jobDescription}
            onChange={setJobDescription}
            error={jdError}
          />

          <div className="space-y-2">
            <p className="font-display text-sm font-semibold text-ink">
              Resume Upload
            </p>
            <DragDropUploader
              files={files}
              onChange={setFiles}
              error={fileError}
            />
          </div>

          {formError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-fit-not"
            >
              {formError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-800 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <HiOutlineSparkles className="h-4 w-4" />
            Analyze Candidates
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
