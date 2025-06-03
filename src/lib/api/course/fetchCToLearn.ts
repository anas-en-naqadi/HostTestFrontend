import axiosClient from "@/lib/axios";


export const fetchCourseToLearn = async (slug:string) => {
  const { data } = await axiosClient.get(`/courses/${slug}`);
  return data.data ;
};
