import { Department } from "..";

export const DepartmentRepository = {
  findBySemesterUuid: ({ semesterUuid }: { semesterUuid: string }) =>
    Department.findAll({ where: { semesterUuid } })
};
