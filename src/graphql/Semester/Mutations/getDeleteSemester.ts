import { nonNull, ID } from "$graphql/fieldTypes";
import { GraphQLSemester } from "$graphql/Semester/Types/GraphQLSemester";
import { SemesterRepository } from "$models/Semester";

export const deleteSemester = {
  type: GraphQLSemester,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (_: undefined, { uuid }: IDeactivateAdminAccount) => {
    const semester = await SemesterRepository.findBySemesterUuid(uuid);
    await SemesterRepository.delete(semester);
    return semester;
  }
};

interface IDeactivateAdminAccount {
  uuid: string;
}
