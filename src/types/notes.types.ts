
export type NoteMetaData = {
  activeLessonTitle?: string;
  activeModuleTitle?: string;
  lessonId?: number;
  moduleOrderPosition: number;
  lessonOrderPosition: number;
};
export type Note = {
  id: number;
  lesson_id:number;
  content: string;
  noted_at: number;
created_at?:string;
};