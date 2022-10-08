import { Course } from "..";

export const CourseRepository = {
  findBySemesterUuid: ({ semesterUuid }: { semesterUuid: string }) =>
    Course.findAll({ where: { semesterUuid } })
};
