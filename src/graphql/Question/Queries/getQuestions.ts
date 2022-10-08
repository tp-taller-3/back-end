import { ID, List, nonNull } from "$graphql/fieldTypes";
import { GraphQLQuestion } from "../Types/GraphQLQuestion";
import { QuestionRepository } from "$models/Question/Repository";
import { Context } from "$graphql/Context";
import { UserSequelizeModel } from "$models";

export const getQuestions = {
  type: List(nonNull(GraphQLQuestion)),
  args: {
    courseUuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (
    _: undefined,
    { courseUuid }: { courseUuid: string },
    { currentUser }: Context
  ) => {
    let user: UserSequelizeModel | null = null;
    if (currentUser) user = await UserSequelizeModel.findByPk(currentUser.uuid);
    return QuestionRepository.findByCourseUuid({ courseUuid, currentUserDNI: user?.dni });
  }
};
