/**
 * context/ScreeningContext.jsx
 * ----------------------------
 * Stores screening results so Upload → Dashboard can share data
 * without prop-drilling. Also persists to sessionStorage for refresh.
 */

import { createContext, useContext, useMemo, useState, useEffect } from "react";

const ScreeningContext = createContext(null);
const STORAGE_KEY = "screensmart_results";

export function ScreeningProvider({ children }) {
  const [results, setResults] = useState(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [jobDescription, setJobDescription] = useState("");

  // Keep results available if the recruiter refreshes the dashboard
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch {
      // ignore quota errors
    }
  }, [results]);

  const value = useMemo(
    () => ({
      results,
      setResults,
      jobDescription,
      setJobDescription,
      clearResults: () => {
        setResults([]);
        sessionStorage.removeItem(STORAGE_KEY);
      },
    }),
    [results, jobDescription]
  );

  return (
    <ScreeningContext.Provider value={value}>
      {children}
    </ScreeningContext.Provider>
  );
}

/** Hook — must be used inside ScreeningProvider */
export function useScreening() {
  const ctx = useContext(ScreeningContext);
  if (!ctx) {
    throw new Error("useScreening must be used within ScreeningProvider");
  }
  return ctx;
}
