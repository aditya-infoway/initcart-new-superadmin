import { useState } from "react";

interface ImageFieldProps {
  label: string;
  hint: string;
  preview?: string;
  previewClassName: string;
  error?: string;
  onPick: (file: File | undefined) => void;
}

export function ImageField({
  label,
  hint,
  preview,
  previewClassName,
  error,
  onPick,
}: ImageFieldProps) {
  const [selectedName, setSelectedName] = useState("");

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-dark-100">
        {label}
      </label>
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setSelectedName(file?.name || "");
          onPick(file);
          e.target.value = ""; // allow picking the same file again
        }}
        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary-700 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-450 dark:bg-dark-700 dark:text-white dark:file:bg-primary/15 dark:file:text-primary-300"
      />

      <div className="mt-2 flex items-center gap-3">
        {preview ? (
          <img src={preview} alt={`${label} preview`} className={previewClassName} />
        ) : null}
        <div className="text-xs text-gray-400 dark:text-dark-300">
          {hint}
          {selectedName ? (
            <span className="mt-1 block break-all text-gray-500 dark:text-dark-300">
              {selectedName}
            </span>
          ) : null}
        </div>
      </div>

      {error ? <p className="mt-1 text-sm text-error">{error}</p> : null}
    </div>
  );
}