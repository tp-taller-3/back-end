import { GraphQLObjectType } from "graphql";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLInt } from "graphql/type/scalars";

export const GraphQLSemesterStatistics = new GraphQLObjectType({
  name: "SemesterStatistics",
  fields: () => ({
    courseCount: {
      type: nonNull(GraphQLInt)
    }
  })
});
