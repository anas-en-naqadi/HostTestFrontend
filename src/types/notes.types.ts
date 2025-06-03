
export type NoteMetaData = {
  activeLessonTitle?: string;
  activeModuleTitle?: string;
  lessonId?: number;
  moduleOrderPosition: number;
  lessonOrderPosition: number;
  lesson_content_type:string;
};
export type Note = {
  id: number;
  lesson_id:number;
  content: string;
  noted_at: number;
created_at?:string;
};