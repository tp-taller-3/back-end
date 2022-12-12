import { getSemesters } from "./getSemesters";
import { getSemestersPaginated } from "$graphql/Semester/Queries/getSemestersPaginated";
import { getSemesterByUuid } from "$graphql/Semester/Queries/getSemesterByUuid";
import { getSemesterStatistics } from "$graphql/Semester/Queries/getSemesterDataStatistics";

export const semesterQueries = {
  getSemesters,
  getSemestersPaginated,
  getSemesterByUuid,
  getSemesterStatistics
};
