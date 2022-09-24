import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLInt, GraphQLString } from "graphql/type/scalars";

import { Semester } from "$models";

export const GraphQLSemester = new GraphQLObjectType<Semester>({
  name: "Semester",
  fields: () => ({
    uuid: {
      type: GraphQLString
    },
    year: {
      type: nonNull(GraphQLInt)
    },
    semesterNumber: {
      type: nonNull(GraphQLInt)
    },
    updatedAt: {
      type: nonNull(GraphQLDateTime)
    },
    createdAt: {
      type: nonNull(GraphQLDateTime)
    }
  })
});
