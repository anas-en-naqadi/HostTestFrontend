import axiosClient from "@/lib/axios";

export const storeNote = async (note:{lesson_id:number,content:string,noted_at: number}) => {
    try {
      const {data,status}= await axiosClient.post(`/notes`,note);
      if(status===201){  
        return data;
      }
    } catch (error) {
      throw error;
    }
  };
  
  export const updateNote = async (note:{note_id:number,lesson_id:number,content:string,noted_at:number}) => {
    try {
      const {data,status}= await axiosClient.put(`/notes/${note.note_id}`,note);
      if(status===200){  
        return data;
      }
    } catch (error) {
      throw error;
    }
  };
  export const deleteNote = async (noteId:number) => {
    try {
      const {data,status}= await axiosClient.delete(`/notes/${noteId}`);
      if(status===200){  
        return data;
      }
    } catch (error) {
      throw error;
    }
  };