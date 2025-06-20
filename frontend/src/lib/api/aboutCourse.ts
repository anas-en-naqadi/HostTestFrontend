import axiosClient from "../axios";

export const fetchAboutCourse = async (slug:string) => {
  const { data } = await axiosClient.get(`/courses/about-course/${slug}`);
  return data ;
};
