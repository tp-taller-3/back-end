import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLString } from "graphql/type/scalars";

import { Course } from "$models";

export const GraphQLCourse = new GraphQLObjectType<Course>({
  name: "Course",
  fields: () => ({
    uuid: {
      type: GraphQLString
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
