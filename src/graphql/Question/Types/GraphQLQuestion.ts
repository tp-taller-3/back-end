import { GraphQLObjectType } from "graphql";
import { GraphQLDateTime } from "graphql-iso-date";
import { List, nonNull } from "$graphql/fieldTypes";
import { GraphQLBoolean, GraphQLString } from "graphql/type/scalars";

import { Question } from "$models";
import { GraphQLAnswer } from "$graphql/Answer/Types/GraphQLAnswer";

export const GraphQLQuestion = new GraphQLObjectType<Question>({
  name: "Question",
  fields: () => ({
    uuid: {
      type: GraphQLString
    },
    isPublic: {
      type: nonNull(GraphQLBoolean)
    },
    questionText: {
      type: nonNull(GraphQLString)
    },
    category: {
      type: nonNull(GraphQLString)
    },
    answers: {
      type: List(nonNull(GraphQLAnswer)),
      resolve: question => question.getAnswers()
    },
    teacherName: {
      type: GraphQLString,
      resolve: async question => (await question.getTeacher())?.fullName
    },
    updatedAt: {
      type: nonNull(GraphQLDateTime)
    },
    createdAt: {
      type: nonNull(GraphQLDateTime)
    }
  })
});
