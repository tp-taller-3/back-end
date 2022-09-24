import { ID, List, nonNull } from "$graphql/fieldTypes";
import { GraphQLQuestion } from "../Types/GraphQLQuestion";
import { QuestionRepository } from "$models/Question/Repository";
import { Context } from "$graphql/Context";

export const getQuestions = {
  type: List(nonNull(GraphQLQuestion)),
  args: {
    courseUuid: {
      type: nonNull(ID)
    }
  },
  resolve: (_: undefined, { courseUuid }: { courseUuid: string }, { currentUser }: Context) => {
    const currentUserDNI: string = (currentUser as any)?.dni || "92834";
    return QuestionRepository.findByCourseUuid({ courseUuid, currentUserDNI });
  }
};
