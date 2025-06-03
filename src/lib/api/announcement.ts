import axiosInstance from '@/lib/axios';
import { Announcement } from '@/types/announcement.types';

/**
 * Fetch announcements with pagination
 */
export const fetchAnnouncements = async (): Promise<Announcement[]> => {
  const response = await axiosInstance.get('/announcements');
  return response.data.data;
};

/**
 * Create a new announcement
 */
export const createAnnouncement = async (data: Partial<Announcement>): Promise<Announcement> => {
  console.log("data for create ann : ",data)
  const response = await axiosInstance.post('/announcements', data);
  return response.data;
};

/**
 * Update an announcement
 */
export const updateAnnouncement = async (
  id: number,
  data: Partial<Announcement>
): Promise<Announcement> => {
  const response = await axiosInstance.put(`/announcements/${id}`, data);
  return response.data;
};

/**
 * Delete an announcement
 */
export const deleteAnnouncement = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/announcements/${id}`);
};