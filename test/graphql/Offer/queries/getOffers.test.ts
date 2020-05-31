import { gql } from "apollo-server";
import Database from "../../../../src/config/Database";

import { CareerRepository } from "../../../../src/models/Career";
import { CompanyRepository } from "../../../../src/models/Company";
import { OfferRepository } from "../../../../src/models/Offer";
import { UserRepository } from "../../../../src/models/User";

import { CareerGenerator, TCareerGenerator } from "../../../generators/Career";
import { companyMocks } from "../../../models/Company/mocks";
import { OfferMocks } from "../../../models/Offer/mocks";
import { testClientFactory } from "../../../mocks/testClientFactory";

const GET_OFFERS = gql`
  query {
    getOffers {
      uuid
    }
  }
`;

describe("getOffers", () => {
  let careers: TCareerGenerator;

  beforeAll(async () => {
    Database.setConnection();
    await CompanyRepository.truncate();
    await CareerRepository.truncate();
    await UserRepository.truncate();
    careers = CareerGenerator.model();
  });

  afterAll(() => Database.close());

  describe("when offers exists", () => {
    let offer1;
    let offer2;
    const createOffers = async () => {
      const { uuid } = await CompanyRepository.create(companyMocks.companyData());
      const career1 = await careers.next().value;
      const career2 = await careers.next().value;
      const offerAttributes1 = OfferMocks.withOneCareer(uuid, career1.code);
      const offerAttributes2 = OfferMocks.withOneCareer(uuid, career2.code);
      offer1 = await OfferRepository.create(offerAttributes1);
      offer2 = await OfferRepository.create(offerAttributes2);
    };

    beforeAll(() => createOffers());

    it("returns two offers if two offers were created", async () => {
      const { apolloClient } = await testClientFactory.user();
      const { data, errors } = await apolloClient.query({ query: GET_OFFERS });
      expect(errors).toBeUndefined();
      expect(data!.getOffers).toHaveLength(2);
    });

    it("returns two offers with there own uuid", async () => {
      const { apolloClient } = await testClientFactory.user();
      const { data, errors } = await apolloClient.query({ query: GET_OFFERS });
      expect(errors).toBeUndefined();
      expect(data!.getOffers).toMatchObject(
        [
          { uuid: offer1.uuid },
          { uuid: offer2.uuid }
        ]
      );
    });
  });

  describe("when no offers exists", () => {
    beforeEach(() => Promise.all([
      CompanyRepository.truncate(),
      CareerRepository.truncate(),
      UserRepository.truncate()
    ]));

    it("returns no offers when no offers were created", async () => {
      const { apolloClient } = await testClientFactory.user();
      const { data, errors } = await apolloClient.query({ query: GET_OFFERS });

      expect(errors).toBeUndefined();
      expect(data!.getOffers).toHaveLength(0);
    });
  });
});
