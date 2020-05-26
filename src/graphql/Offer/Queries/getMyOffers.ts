import { GraphQLOffer } from "../Types/GraphQLOffer";
import { OfferRepository } from "../../../models/Offer";
import { List } from "../../fieldTypes";
import { ICompanyUser } from "src/graphqlContext";

const getMyOffers = {
  type: List(GraphQLOffer),
  resolve: (
    _: undefined,
    __: undefined,
    { currentUser }: { currentUser: ICompanyUser }) =>
      OfferRepository.findByCompanyUuid(currentUser.companyUuid)
};

export { getMyOffers };