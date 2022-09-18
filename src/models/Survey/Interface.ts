import { IPaginatedInput } from "$graphql/Pagination/Types/GraphQLPaginatedInput";

export interface IFindAll {
  createdBeforeThan?: IPaginatedInput;
}
