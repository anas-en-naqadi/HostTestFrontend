
import axiosClient from "../axios";

interface lessonProgressBody {
    lesson_id : number ;
    slug:string;
    completed_at : Date;   
}


export const storeLessonProgress = async (
    payload: lessonProgressBody
  ) => {
    const response = await axiosClient.post<lessonProgressBody>(
      "/lesson-progress",
      payload
    );
    return response;
  };
  