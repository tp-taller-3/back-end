import { Course } from "..";

export const CourseRepository = {
  findByDepartmentUuid: ({ departmentUuid }: { departmentUuid: string }) =>
    Course.findAll({ where: { departmentUuid } })
};
