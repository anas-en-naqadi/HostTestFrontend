import { useMutation } from '@tanstack/react-query';
import { deleteNote, storeNote, updateNote } from '@/lib/api/course/manageNotes';
// Custom hook for login using React Query
export const useStoreNote = () => {
  return useMutation({
    mutationFn: storeNote
  });
};
export const useUpdateNote = () => {
    return useMutation({
      mutationFn: updateNote
    });
  };
  export const useDeleteNote = () => {
    return useMutation({
      mutationFn: deleteNote
    });
  };