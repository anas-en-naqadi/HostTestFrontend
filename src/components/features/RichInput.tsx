"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
  initialValue?: string;
  onChange?: (html: string) => void;
  maxChars?: number;
}

export default function RichTextEditor({
  initialValue = "",
  onChange,
  maxChars = 1000,
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
        console.log(html)
        setValue(html);
        onChange?.(html);
      } else {
        // trim and re-wrap
        const trimmed = newText.slice(0, maxChars);
        const wrapped = trimmed
          .split("\n")
          .map((l) => `<p>${l}</p>`)
          .join("");
          console.log(wrapped)
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
      e.preventDefault(); // stop Quill’s own paste
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
    <div className="relative my-4 w-full max-w-3xl mx-auto">
      <div
        className={`absolute top-1 right-0 mt-1.5 mr-4 text-md font-sans font-normal ${
          remaining === 0 ? "text-red-600" : "text-gray-600"
        }`}
      >
        {remaining}
      </div>

      <div className="border-1 border-gray-400 rounded-lg overflow-hidden shadow-inner">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={handleChange}
          modules={modules}
          placeholder="Write your notes here..."
          className="max-h-full bg-white"
        />
      </div>
    </div>
  );
}
