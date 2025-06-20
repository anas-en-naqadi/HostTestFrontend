
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
  lesson_type:string;
  noted_at: number;
created_at?:string;
module_order_position:number;
lesson_order_position:number;
module_title:string;
lesson_title:string;
};