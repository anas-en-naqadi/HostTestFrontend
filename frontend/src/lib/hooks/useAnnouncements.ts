import { useState } from 'react';
import { 
  fetchAnnouncements, 
  deleteAnnouncement as apiDeleteAnnouncement,
  createAnnouncement as apiCreateAnnouncement,
  updateAnnouncement as apiUpdateAnnouncement
} from '@/lib/api/announcement';
import { Announcement } from '@/types/announcement.types';
import { toast } from 'sonner';


export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const fetchAnnouncementsData = async () => {
    setIsLoading(true);
    try {
      const response = await fetchAnnouncements();
      setAnnouncements(response);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      toast.error("Failed to load announcements");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAnnouncement = async (id: number) => {
    setIsPending(true);
    try {
      await apiDeleteAnnouncement(id);
      toast.success("Announcement deleted successfully");
      return true;
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      toast.error("Failed to delete announcement");
      return false;
    } finally {
      setIsPending(false);
    }
  };

  const createAnnouncement = async (data: Partial<Announcement>) => {
    setIsPending(true);
    try {
      const response = await apiCreateAnnouncement(data);
      toast.success("Announcement created successfully");
      return response;
    } catch (error) {
      console.error("Failed to create announcement:", error);
      toast.error("Failed to create announcement");
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  const updateAnnouncement = async (id: number, data: Partial<Announcement>) => {
    setIsPending(true);
    try {
      const response = await apiUpdateAnnouncement(id, data);
      toast.success("Announcement updated successfully");
      return response;
    } catch (error) {
      console.error("Failed to update announcement:", error);
      toast.error("Failed to update announcement");
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    announcements,
    isLoading,
    isPending,
    fetchAnnouncements: fetchAnnouncementsData,
    deleteAnnouncement,
    createAnnouncement,
    updateAnnouncement
  };
};

export default useAnnouncements;