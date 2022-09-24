import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { nonNull } from "$graphql/fieldTypes";
import { GraphQLInt, GraphQLString } from "graphql/type/scalars";

import { Department } from "$models";

export const GraphQLDepartment = new GraphQLObjectType<Department>({
  name: "Department",
  fields: () => ({
    uuid: {
      type: GraphQLString
    },
    name: {
      type: nonNull(GraphQLString)
    },
    leadDNI: {
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
