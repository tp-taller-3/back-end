import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { ID, nonNull } from "$graphql/fieldTypes";
import { GraphQLString } from "graphql/type/scalars";

import { Survey } from "$models";

export const GraphQLSurvey = new GraphQLObjectType<Survey>({
  name: "Survey",
  fields: () => ({
    uuid: {
      type: nonNull(ID)
    },
    name: {
      type: nonNull(GraphQLString)
    },
    updatedAt: {
      type: nonNull(GraphQLDateTime)
    },
    createdAt: {
      type: nonNull(GraphQLDateTime)
    }
  })
});
