import { getSemesters } from "./getSemesters";
import { getSemestersPaginated } from "$graphql/Semester/Queries/getSemestersPaginated";
import { getSemesterByUuid } from "$graphql/Semester/Queries/getSemesterByUuid";

export const semesterQueries = {
  getSemesters,
  getSemestersPaginated,
  getSemesterByUuid
};
