import { nonNull, String } from "../../fieldTypes";
import { GraphQLJobApplication } from "../Types/GraphQLJobApplication";
import { JobApplicationRepository } from "../../../models/JobApplication";
import { OfferRepository } from "../../../models/Offer";
import { IApplicantUser } from "../../Context";

export const saveJobApplication = {
  type: GraphQLJobApplication,
  args: {
    offerUuid: {
      type: nonNull(String)
    }
  },
  resolve: async (
    _: undefined,
    { offerUuid }: { offerUuid: string; },
    { currentUser }: { currentUser: IApplicantUser }
  ) => {
    const offer = await OfferRepository.findByUuid(offerUuid);
    return JobApplicationRepository.apply(currentUser.applicantUuid, offer);
  }
};
