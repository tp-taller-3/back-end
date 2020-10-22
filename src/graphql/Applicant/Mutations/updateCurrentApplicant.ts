import { Int, List, String } from "$graphql/fieldTypes";
import { GraphQLApplicant } from "../Types/GraphQLApplicant";
import { GraphQLApplicantCareerInput } from "../Types/GraphQLApplicantCareerInput";
import { GraphQLApplicantKnowledgeSectionInputType } from "../Types/ApplicantKnowledgeSection";
import { GraphQLApplicantExperienceSectionInputType } from "../Types/ApplicantExperienceSection";
import { GraphQLUserUpdateInput } from "$graphql/User/Types/GraphQLUserUpdateInput";
import { ApplicantRepository, IApplicantEditable } from "$models/Applicant";
import { GraphQLLinkInput } from "../Types/Link";
import { IApolloServerContext } from "$graphql/Context";

export const updateCurrentApplicant = {
  type: GraphQLApplicant,
  args: {
    user: {
      type: GraphQLUserUpdateInput
    },
    padron: {
      type: Int
    },
    description: {
      type: String
    },
    careers: {
      type: List(GraphQLApplicantCareerInput)
    },
    capabilities: {
      type: List(String)
    },
    knowledgeSections: {
      type: List(GraphQLApplicantKnowledgeSectionInputType)
    },
    experienceSections: {
      type: List(GraphQLApplicantExperienceSectionInputType)
    },
    links: {
      type: List(GraphQLLinkInput)
    }
  },
  resolve: async (_: undefined, props: IApplicantEditable, { currentUser }: IApolloServerContext) =>
    ApplicantRepository.update({ ...props, uuid: currentUser.getApplicant().applicantUuid })
};
