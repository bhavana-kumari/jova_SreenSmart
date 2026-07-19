/**
 * components/DragDropUploader.jsx
 * -------------------------------
 * Drag-and-drop + click-to-upload for multiple PDF/DOCX resumes.
 */

import { useCallback, useRef, useState } from "react";
import { HiOutlineCloudArrowUp, HiOutlineDocument, HiXMark } from "react-icons/hi2";

const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * @param {{ files: File[], onChange: (files: File[]) => void, error?: string }} props
 */
export default function DragDropUploader({ files, onChange, error }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  /** Keep only PDF / DOCX and avoid duplicate names */
  const mergeFiles = useCallback(
    (incoming) => {
      const allowed = incoming.filter((f) => {
        const name = f.name.toLowerCase();
        return name.endsWith(".pdf") || name.endsWith(".docx");
      });

      const map = new Map();
      [...files, ...allowed].forEach((f) => map.set(`${f.name}-${f.size}`, f));
      onChange([...map.values()]);
    },
    [files, onChange]
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    mergeFiles([...e.dataTransfer.files]);
  };

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragOver
            ? "border-brand-600 bg-brand-50"
            : error
              ? "border-rose-300 bg-rose-50/50"
              : "border-slate-300 bg-white hover:border-brand-500 hover:bg-brand-50/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            mergeFiles([...e.target.files]);
            e.target.value = "";
          }}
        />
        <HiOutlineCloudArrowUp className="mx-auto h-10 w-10 text-brand-600" />
        <p className="mt-3 font-display text-base font-semibold text-ink">
          Drag &amp; drop resumes here
        </p>
        <p className="mt-1 text-sm text-muted">
          or click to browse · PDF &amp; DOCX · multiple files
        </p>
      </div>

      {error && <p className="text-sm text-fit-not">{error}</p>}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <HiOutlineDocument className="h-5 w-5 shrink-0 text-brand-600" />
                <span className="truncate text-sm font-medium text-ink">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="rounded-lg p-1.5 text-muted hover:bg-rose-50 hover:text-fit-not transition"
                aria-label={`Remove ${file.name}`}
              >
                <HiXMark className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
