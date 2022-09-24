import { ID, List, nonNull } from "$graphql/fieldTypes";
import { DepartmentRepository } from "$models/Department";
import { GraphQLDepartment } from "../Types/GraphQLDepartment";

export const getDepartments = {
  type: List(nonNull(GraphQLDepartment)),
  args: {
    semesterUuid: {
      type: nonNull(ID)
    }
  },
  resolve: (_: undefined, { semesterUuid }: { semesterUuid: string }) =>
    DepartmentRepository.findBySemesterUuid({ semesterUuid })
};
