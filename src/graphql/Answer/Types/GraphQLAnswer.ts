import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLInt, GraphQLString } from "graphql/type/scalars";

import { Answer } from "$models";

export const GraphQLAnswer = new GraphQLObjectType<Answer>({
  name: "Answer",
  fields: () => ({
    uuid: {
      type: GraphQLString
    },
    value: {
      type: nonNull(GraphQLString)
    },
    count: {
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
