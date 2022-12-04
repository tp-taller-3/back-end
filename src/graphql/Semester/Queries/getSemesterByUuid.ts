import { nonNull, ID } from "../../fieldTypes";
import { GraphQLSemester } from "$graphql/Semester/Types/GraphQLSemester";
import { SemesterRepository } from "$models/Semester";

export const getSemesterByUuid = {
  type: GraphQLSemester,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: (_: undefined, { uuid }: { uuid: string }) => SemesterRepository.findBySemesterUuid(uuid)
};
