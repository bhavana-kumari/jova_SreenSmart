/**
 * App.jsx
 * -------
 * React Router shell for ScreenSmart pages.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScreeningProvider } from "./context/ScreeningContext";
import Landing from "./pages/Landing";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";

export default function App() {
  return (
    <ScreeningProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </ScreeningProvider>
  );
}
