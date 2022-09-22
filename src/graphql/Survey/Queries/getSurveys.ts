import { GraphQLSurvey } from "../Types/GraphQLSurvey";
import {
  GraphQLPaginatedInput,
  IPaginatedInput
} from "$graphql/Pagination/Types/GraphQLPaginatedInput";
import { GraphQLPaginatedResults } from "$graphql/Pagination/Types/GraphQLPaginatedResults";
import { SurveyRepository } from "$models/Survey";

export const getSurveys = {
  type: GraphQLPaginatedResults(GraphQLSurvey),
  args: {
    updatedBeforeThan: {
      type: GraphQLPaginatedInput
    }
  },
  resolve: (_: undefined, { updatedBeforeThan }: { updatedBeforeThan?: IPaginatedInput }) =>
    SurveyRepository.findAll({ createdBeforeThan: updatedBeforeThan })
};
