import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { GraphQLSemester } from "$graphql/Semester/Types/GraphQLSemester";
import { SemesterRepository } from "$models/Semester";

export const getSemestersPaginated = {
  type: GraphQLPaginatedResults(GraphQLSemester),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    }
  },
  resolve: (_: undefined, { updatedBeforeThan }: { updatedBeforeThan?: IPaginatedInput }) =>
    SemesterRepository.findLatest(updatedBeforeThan)
};
