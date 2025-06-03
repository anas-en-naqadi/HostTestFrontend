"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import ReactQuill from "react-quill-new";
import DOMPurify from "isomorphic-dompurify";
import RichTextEditor from "@/components/features/RichInput";
import {
  PlusCircle,
  Search,
  Trash,
  ListFilter,
  Pen,
  RotateCcw,
} from "lucide-react";

import { Note, NoteMetaData } from "@/types/notes.types";
import {
  useDeleteNote,
  useStoreNote,
  useUpdateNote,
} from "@/lib/hooks/course/useStoreNotes";
import { toast } from "sonner";

interface NoteProps {
  notes: Note[];
  noteMetaData: NoteMetaData;
  currentTime: number;
}

export default function Notes({ currentTime, noteMetaData, notes }: NoteProps) {
  const [notesHtml, setNotesHtml] = useState<string>("");
  const [pickedNoteTime, setPickedNoteTime] = useState<number>(0);
  const [showRichText, setShowRichText] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(notes);
  const [allNotes, setAllNotes] = useState<Note[]>(notes);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const { mutateAsync: storeNote, isPending } = useStoreNote();
  const { mutateAsync: updateNote, isPending: isUPending } = useUpdateNote();
  const { mutateAsync: deleteNote, isPending: canDelete } = useDeleteNote();
  const [lectureFilter, setLectureFilter] = useState<"all" | "current">("all");
  const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent");
  const [editingContent, setEditingContent] = useState<string>("");
  const filterBoxRef = useRef<HTMLDivElement>(null);

  // Initialize filtered notes when component mounts or notes/metadata changes
  useEffect(() => {
    if (notes) {
      setAllNotes(notes);
    }

  }, [notes]);

  function startEdit(note: Note) {
    setShowRichText(false);
    setEditingId(note.id);
    setEditingContent(note.content);
  }

  function cancelEdit() {
    setShowRichText(false);
    setEditingId(null);
    setEditingContent("");
  }

  const saveNotes = async () => {
    if (!notesHtml.trim()) {
      setShowRichText(false);
      return;
    }

    if (isPending) return;
    if (notesHtml === "<p><br></p>") {
      toast.warning("The note text is empty!");
      return;
    }

    const note = {
      lesson_id: noteMetaData.lessonId!,
      content: notesHtml,
      noted_at: pickedNoteTime!,
    };

    try {
      const response = await storeNote(note);
      // Immediately update the state with the new note
      setAllNotes(prev => [response.data, ...prev]);
      setLectureFilter("current"); // Switch to current lecture view
      setNotesHtml("");
      setShowRichText(false);
      toast.success("Note saved successfully!");
    } catch (error) {
      console.error("Failed to save note:", error);
      toast.error("Failed to save note. Please try again.");
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${formattedSeconds}`;
  };

  function handleShowRichTextInput() {
    setPickedNoteTime(currentTime);
    setShowRichText(true);
  }

  function handleSearchInput(keyword: string) {
    setSearchKeyword(keyword);
    applyFilters(keyword);
  }

  // Reset all filters to default values
  const resetFilters = () => {
    setLectureFilter("all");
    setSortOrder("recent");
    setSearchKeyword("");
    applyFilters("");
  };

  const resetButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      // if click inside filter box or on the toggle button or on reset button → ignore
      if (
        filterBoxRef.current?.contains(target) ||
        filterButtonRef.current?.contains(target) ||
        resetButtonRef.current?.contains(target)
      ) {
        return;
      }
      setIsFilterOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Central filter & sort routine
  const applyFilters = useCallback((keyword = searchKeyword) => {
    if (!allNotes) return;

    let result = [...allNotes];

    // 1) Apply search filter if keyword exists
    if (keyword) {
      const lowercaseKeyword = keyword.toLowerCase();
      result = result.filter(note =>
        note.content.toLowerCase().includes(lowercaseKeyword) ||
        noteMetaData?.activeModuleTitle?.toLowerCase().includes(lowercaseKeyword) ||
        noteMetaData?.activeLessonTitle?.toLowerCase().includes(lowercaseKeyword)
      );
    }

    // 2) Filter by lecture
    if (lectureFilter === "current") {
      result = result.filter(note => note.lesson_id === noteMetaData.lessonId);
    }

    // 3) Sort
    result = result.sort((a, b) => {
      const aTime = new Date(a.created_at!).getTime();
      const bTime = new Date(b.created_at!).getTime();
      return sortOrder === "recent" ? bTime - aTime : aTime - bTime;
    });

    setFilteredNotes(result);
  }, [allNotes, lectureFilter, sortOrder, noteMetaData, searchKeyword]);

  // Re-apply whenever dependencies change
  useEffect(() => {
    applyFilters();
    setShowRichText(false);
  }, [applyFilters, lectureFilter, sortOrder, allNotes, noteMetaData]);

  // Handlers for toggles
  const toggleLectureFilter = (mode: "all" | "current") => {
    setLectureFilter(mode);
  };

  const toggleSortOrder = (order: "recent" | "oldest") => {
    setSortOrder(order);
  };

  // Update note function with proper error handling and immediate filtering
  const handleUpdateNote = async (note: Note) => {
    if (isUPending) return;

    try {
      const updatedNoteData = {
        note_id: note.id,
        lesson_id: note.lesson_id,
        content: editingContent,
        noted_at: note.noted_at,
      };

      const response = await updateNote(updatedNoteData);

      // Immediately update both state collections with the updated note
      const updatedNote = response.data;

      setAllNotes(prev =>
        prev.map(n => n.id === note.id ? updatedNote : n)
      );

      // Also update filtered notes immediately to ensure UI consistency
      setFilteredNotes(prev =>
        prev.map(n => n.id === note.id ? updatedNote : n)
      );

      // Reset editing state
      setEditingId(null);
      setEditingContent("");
      toast.success("Note updated successfully!");
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Failed to update note. Please try again.");
    }
  };



  return (
    <>
      <div className="p-4 flex flex-col w-full gap-12 h-full overflow-x-hidden">
        {/* Note creation box */}
        <div className="w-full">
          {!showRichText && (
            <button
              type="button"
              onClick={() => handleShowRichTextInput()}
              className="border-1 border-gray-400 cursor-pointer focus:border-blue-400 focus:ring-1 p-3 flex justify-between rounded-md w-full items-center text-gray-500 font-sans text-sm lg:text-md"
            >
              Create a new note {noteMetaData.lesson_content_type === "video" && `at ${formatTime(currentTime)}`}
              <PlusCircle size={18} />
            </button>
          )}
          {showRichText && (
            <div className="w-full flex flex-col">
              <div className="flex gap-4 w-full flex-wrap lg:flex-nowrap">
                {noteMetaData.lesson_content_type === "video" && (
                  <span className="bg-cyan-800 mt-3.5 text-white font-bold p-1 text-[13px] font-sans rounded-full w-14 text-center h-fit">
                    {formatTime(pickedNoteTime)}
                  </span>
                )}
                <RichTextEditor
                  initialValue={notesHtml}
                  onChange={(html) => setNotesHtml(html)}
                />
              </div>
              <div className="flex justify-end w-full gap-4 font-sans font-normal lg:font-semibold text-sm lg:text-md">
                <button
                  type="button"
                  className="border-none hover:bg-gray-200 p-1.5 font-semibold lg:font-bold cursor-pointer rounded-sm"
                  onClick={() => setShowRichText(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={saveNotes}
                  className={`rounded-md bg-cyan-800 text-white text-center px-3 py-1 ${isPending ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:bg-cyan-700'}`}
                >
                  {isPending ? "Saving note..." : "Save note"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filter bar */}
        {allNotes && allNotes.length > 0 && (
          <div className="flex gap-4 flex-col-reverse lg:flex-row w-full">
            <div className="relative">
              <button
                type="button"
                ref={filterButtonRef}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="text-gray-500/80 font-sans focus:bg-[#5CB5BD33] focus:text-[#136A86] lg:w-[101px] w-full cursor-pointer hover:bg-gray-200 h-[3.2rem] flex bg-gray-100/80 font-normal text-md rounded-md p-3 items-center justify-center gap-2"
              >
                <ListFilter size={20} /> Filter
              </button>
              {isFilterOpen && (
                <div ref={filterBoxRef} className="absolute top-full left-0 mt-2 font-sans bg-white rounded-lg shadow-lg z-50 p-10 grid grid-cols-1 sm:grid-cols-2 w-full lg:w-fit lg:grid-cols-[auto_auto] gap-8">
                  {/* Lecture filter options */}
                  <div className="flex flex-col gap-3">
                    <h2 className="font-bold text-[#5CB5BD]">Lecture</h2>
                    <label className="flex items-center text-gray-600 gap-2 whitespace-nowrap">
                      <input
                        type="radio"
                        className="h-4 w-4 rounded-md"
                        checked={lectureFilter === "all"}
                        onChange={() => toggleLectureFilter("all")}
                        name="lecture"
                      /> All lectures
                    </label>
                    <label className="flex items-center text-gray-600 gap-2 whitespace-nowrap">
                      <input
                        type="radio"
                        className="h-4 w-4"
                        name="lecture"
                        checked={lectureFilter === "current"}
                        onChange={() => toggleLectureFilter("current")}
                      /> Current lecture
                    </label>
                  </div>

                  {/* Sort options */}
                  <div className="flex flex-col gap-3 mb-10">
                    <h2 className="font-bold text-[#5CB5BD]">Sort by</h2>
                    <label className="flex items-center text-gray-600 gap-2 whitespace-nowrap">
                      <input
                        type="radio"
                        className="h-4 w-4"
                        name="sort"
                        checked={sortOrder === "recent"}
                        onChange={() => toggleSortOrder("recent")}
                      /> Most Recent
                    </label>
                    <label className="flex items-center text-gray-600 gap-2 whitespace-nowrap">
                      <input
                        type="radio"
                        className="h-4 w-4"
                        name="sort"
                        checked={sortOrder === "oldest"}
                        onChange={() => toggleSortOrder("oldest")}
                      /> Oldest
                    </label>
                  </div>

                  {/* Reset filter button */}
                  <button
                    type="button"
                    ref={resetButtonRef}
                    onClick={resetFilters}
                    className="bg-[#136A86] hover:bg-[#5CB5BD] absolute cursor-pointer -right-6 bottom-7 lg:-right-2 lg:bottom-6 transform -translate-x-1/2 text-white flex gap-1 items-center justify-center text-center rounded-md text-xs w-[97px] h-[26px]"
                  >
                    <RotateCcw size={10} />
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* Search bar */}
            <div className="relative flex-1 text-lg text-gray-500/80">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                size={22}
              />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search by keyword"
                className="w-full pl-10 pr-4 py-3 text-md h-fit rounded-lg bg-gray-100/80 focus:outline-none focus:ring-1 focus:ring-cyan-700"
              />
            </div>
          </div>
        )}

        {/* No matching notes message */}
        {filteredNotes.length === 0 && allNotes.length > 0 && (
          <div className="text-center text-gray-500 py-8">
            No notes match your current filters
          </div>
        )}

        {/* Notes list */}
        {filteredNotes.map((note) => {
          const isEditing = editingId === note.id;

          return (
            <div
              key={note.id}
              className="flex justify-start flex-wrap lg:flex-nowrap gap-4 w-full"
            >
              {
                noteMetaData.lesson_content_type === "video" && (
                  <span className="bg-cyan-800 text-white font-bold p-1 text-[13px] font-sans rounded-full w-14 text-center h-fit">
                    {formatTime(note.noted_at)}
                  </span>
                )
              }
              <div className="flex flex-col w-full gap-4">
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap lg:flex-nowrap gap-1 lg:gap-4 items-center">
                    <h1 className="font-extrabold text-sm lg:text-md">
                      {noteMetaData.moduleOrderPosition}.{" "}
                      {noteMetaData.activeModuleTitle}
                    </h1>
                    <h2 className="font-semibold text-xs lg:text-sm pt-0.5">
                      {noteMetaData.lessonOrderPosition}.{" "}
                      {noteMetaData.activeLessonTitle}
                    </h2>
                  </div>
                  <div className="flex gap-2 lg:gap-4 items-center text-gray-600">
                    <Pen
                      onClick={() => startEdit(note)}
                      size={16}
                      className="cursor-pointer hover:text-cyan-700"
                    />
                    <Trash
                      size={16}
                      className={`
                        inline-flex items-center
                        ${canDelete
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:text-red-600 cursor-pointer'
                        }
                      `}
                      onClick={async () => {
                        if (canDelete) return;
                        try {
                          await deleteNote(note.id);

                          // Update both state collections immediately
                          setAllNotes(prev => prev.filter(n => n.id !== note.id));
                          setFilteredNotes(prev => prev.filter(n => n.id !== note.id));

                          toast.success("Note deleted successfully!");
                        } catch (error) {
                          console.error("Failed to delete note:", error);
                          toast.error("Failed to delete note. Please try again.");
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="w-full flex flex-col gap-8">
                  <div

                  >
                    {isEditing ? (
                      <RichTextEditor
                        initialValue={editingContent}
                        onChange={(value) => setEditingContent(value)}
                      />
                    ) : (
                      <ReactQuill
                        value={isEditing ? DOMPurify.sanitize(editingContent)  : DOMPurify.sanitize(note.content) }
                        readOnly={!isEditing}
                        modules={{ toolbar: isEditing ? true : false }}

                        theme={"snow"}
                        className={`p-2 rounded-sm  ${isEditing ? "bg-white" : "bg-[#E4F4F9] my-quill"
                          }`}
                      />
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex justify-end w-full gap-4 font-sans font-semibold text-md">
                      <button
                        type="button"
                        className="border-none hover:bg-gray-200 p-1.5 font-bold cursor-pointer rounded-sm"
                        onClick={() => cancelEdit()}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isUPending}
                        onClick={() => handleUpdateNote(note)}
                        className={`rounded-md bg-cyan-800 text-white text-center px-3 py-1 ${isUPending ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:bg-cyan-700'}`}
                      >
                        {isUPending ? "Updating note..." : "Update note"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Message when no notes exist */}
        {allNotes.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            You haven{"'"}t created any notes yet. Create your first note by clicking the button above.
          </div>
        )}
      </div>
    </>
  );
}