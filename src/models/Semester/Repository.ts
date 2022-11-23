import { Semester } from "..";
import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { PaginationQuery } from "$models/PaginationQuery";
import { SemesterNotFound } from "$models/Semester/Errors/SemesterNotFound";

export const SemesterRepository = {
  findAll: () => Semester.findAll(),
  findLatest: (updatedBeforeThan?: IPaginatedInput) =>
    PaginationQuery.findLatest({
      updatedBeforeThan,
      query: options => Semester.findAll({ ...options })
    }),
  findBySemesterUuid: async (SemesterUuid: string) => {
    const semester = await Semester.findByPk(SemesterUuid);
    if (!semester) throw new SemesterNotFound(SemesterUuid);

    return semester;
  },
  delete: (semester: Semester) => semester.destroy()
};
