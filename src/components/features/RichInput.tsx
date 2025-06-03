"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
  initialValue?: string;
  onChange?: (html: string) => void;
  maxChars?: number;
  placeholder?: string;
  maxHeight?: string;
  maxWidth?: string;
}

export default function RichTextEditor({
  initialValue = "",
  onChange,
  maxChars = 1000,
  maxHeight = "auto",
  placeholder = "Write your notes here...",
  maxWidth = "max-w-3xl",
}: RichTextEditorProps) {
  const [value, setValue] = useState(initialValue);
  const quillRef = useRef<ReactQuill>(null);

  // Extract plain-text from current HTML
  const plainText = useMemo(() => {
    const tmp = document.createElement("div");
    tmp.innerHTML = value;
    return tmp.textContent || tmp.innerText || "";
  }, [value]);

  const remaining = Math.max(0, maxChars - plainText.length);

  // Stable change handler
  const handleChange = useCallback(
    (html: string) => {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      const newText = tmp.textContent || tmp.innerText || "";

      if (newText.length <= maxChars) {
        setValue(html);
        onChange?.(html);
      } else {
        // trim and re-wrap
        const trimmed = newText.slice(0, maxChars);
        const wrapped = trimmed
          .split("\n")
          .map((l) => `<p>${l}</p>`)
          .join("");
        setValue(wrapped);
        onChange?.(wrapped);
      }
    },
    [maxChars, onChange]
  );

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const root = editor.root;

    // Block typing past the limit
    const onKeyDown = (e: KeyboardEvent) => {
      const navKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
      ];
      if (
        plainText.length >= maxChars &&
        !navKeys.includes(e.key) &&
        !(e.metaKey || e.ctrlKey)
      ) {
        e.preventDefault();
      }
    };

    // Capture-phase paste interceptor
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault(); // stop Quill's own paste
      const text = e.clipboardData?.getData("text") || "";
      const allowed = maxChars - plainText.length;
      if (allowed <= 0) return;
      const toPaste = text.slice(0, allowed);

      // insert trimmed text
      const sel = editor.getSelection(true);
      editor.deleteText(sel.index, sel.length);
      editor.insertText(sel.index, toPaste);
      editor.setSelection(sel.index + toPaste.length);

      // sync state
      handleChange(editor.root.innerHTML);
    };

    root.addEventListener("keydown", onKeyDown);
    root.addEventListener("paste", onPaste, true); // ← capture phase

    return () => {
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("paste", onPaste, true);
    };
  }, [plainText, maxChars, handleChange]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic"], // Bold and Italic buttons
      [{ list: "ordered" }, { list: "bullet" }], // Numbered and bulleted lists
      ["code-block"], // Code block/formatting
    ],
  };

  return (
    <div className={`relative my-4 w-full  ${maxWidth} mx-auto`}>
      {/* Add custom styling to fix dropdown visibility */}
      <style jsx global>{`
        /* Ensure dropdowns are visible above other content */
        .ql-tooltip {
          z-index: 9999 !important;
        }
        
        /* Fix for header dropdown menu */
        .ql-toolbar .ql-picker-options {
          position: absolute !important;
          top: 100% !important;
          z-index: 50 !important;
          height: auto !important;
          min-width: 100% !important;
          max-height: 200px !important;
          overflow-y: auto !important;
          background-color: white !important;
          border: 1px solid #ccc !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* Fix for header dropdown container */
        .ql-picker {
          position: relative !important;
        }
        
        /* Make sure the editor container doesn't clip dropdowns */
        .ql-container, .ql-editor {
          overflow: visible !important;
        }
        
        /* Ensure container doesn't clip dropdowns */
        .ql-toolbar.ql-snow {
          position: relative !important;
          z-index: 20 !important;
          overflow: visible !important;
        }
           .ql-editor {
          height: ${maxHeight} !important;
          min-height: ${maxHeight} !important;
          max-height: ${maxHeight} !important;
          border-radius:4px;
          overflow-y: auto !important;
        }
      `}</style>

      <div
        className={`absolute top-1 right-0 mt-1.5 mr-4 text-md font-sans font-normal ${
          remaining === 0 ? "text-red-600" : "text-gray-600"
        }`}
      >
        {remaining}
      </div>

      <div className=" rounded-lg shadow-inner">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          placeholder={placeholder}
          className={`bg-white`}
        />
      </div>
    </div>
  );
}