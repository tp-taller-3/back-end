import { CareerRepository } from "../../../src/models/Career";
import { ApplicantRepository, Errors, IApplicantEditable } from "../../../src/models/Applicant";

import Database from "../../../src/config/Database";
import { careerMocks } from "../Career/mocks";
import { applicantMocks } from "./mocks";
import { CapabilityRepository } from "../../../src/models/Capability";

describe("ApplicantRepository", () => {
  beforeAll(async () => {
    await Database.setConnection();
  });

  afterAll(async () => {
    await Database.close();
  });

  it("creates a new applicant", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career.code]);
    const applicant = await ApplicantRepository.create(applicantData);
    const applicantCareers = await applicant.getCareers();

    expect(applicant).toEqual(expect.objectContaining({
      uuid: applicant.uuid,
      name: applicantData.name,
      surname: applicantData.surname,
      padron: applicantData.padron,
      description: applicantData.description
    }));
    expect(applicantCareers[0]).toMatchObject({
      code: career.code,
      description: career.description,
      credits: career.credits,
      CareerApplicant: {
        applicantUuid: applicant.uuid,
        careerCode: career.code,
        creditsCount: applicantData.careers[0].creditsCount
      }
    });
    expect(applicant.careers[0].description).toEqual(career.description);
    expect(applicant.capabilities[0].description).toEqual(applicantData.capabilities[0]);
  });

  it("can retreive an applicant by padron", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career.code]);
    await ApplicantRepository.create(applicantData);

    const applicant = await ApplicantRepository.findByPadron(applicantData.padron);

    expect(applicant).toEqual(expect.objectContaining({
      uuid: applicant.uuid,
      name: applicantData.name,
      surname: applicantData.surname,
      padron: applicantData.padron,
      description: applicantData.description
    }));

    const applicantCareers = await applicant.getCareers();
    expect(applicantCareers[0]).toMatchObject({
      code: career.code,
      description: career.description,
      credits: career.credits,
      CareerApplicant: {
        applicantUuid: applicant.uuid,
        careerCode: career.code,
        creditsCount: applicantData.careers[0].creditsCount
      }
    });
    expect(applicant.capabilities[0].description).toEqual(applicantData.capabilities[0]);
  });

  it("can retreive an applicant by uuid", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career.code]);
    const savedApplicant = await ApplicantRepository.create(applicantData);

    const applicant = await ApplicantRepository.findByUuid(savedApplicant.uuid);

    expect(applicant).toEqual(expect.objectContaining({
      uuid: applicant.uuid,
      name: applicantData.name,
      surname: applicantData.surname,
      padron: applicantData.padron,
      description: applicantData.description
    }));

    const applicantCareers = await applicant.getCareers();
    expect(applicantCareers[0]).toMatchObject({
      code: career.code,
      description: career.description,
      credits: career.credits,
      CareerApplicant: {
        applicantUuid: applicant.uuid,
        careerCode: career.code,
        creditsCount: applicantData.careers[0].creditsCount
      }
    });
    expect(applicant.capabilities[0].description).toEqual(applicantData.capabilities[0]);
  });

  it("can delete an applicant by uuid", async () => {
    const career = await CareerRepository.create(careerMocks.careerData());
    const applicantData = applicantMocks.applicantData([career.code]);
    const savedApplicant = await ApplicantRepository.create(applicantData);

    await ApplicantRepository.deleteByUuid(savedApplicant.uuid);

    const applicant = await ApplicantRepository.findByUuid(savedApplicant.uuid);

    expect(applicant).toBeNull();
  });

  it("can create an applicant without a career and without capabilities", async () => {
    const applicantData = applicantMocks.applicantData([]);
    const savedApplicant = await ApplicantRepository.create({
      ...applicantData,
      capabilities: []
    });

    const applicant = await ApplicantRepository.findByUuid(savedApplicant.uuid);

    expect(applicant).not.toBeNull();
  });

  it("raise ApplicantNotFound if the aplicant doesn't exists", async () => {
    const applicantData = applicantMocks.applicantData([]);

    await expect(ApplicantRepository.findByPadron(applicantData.padron))
      .rejects.toThrow(Errors.ApplicantNotFound);
  });

  describe("Update", () => {
    it("Should update all props", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career.code]);
      const applicant = await ApplicantRepository.create(applicantData);
      const newCareer = await CareerRepository.create(careerMocks.careerData());
      const newProps: IApplicantEditable = {
        name: "newName",
        surname: "newSurname",
        description: "newDescription",
        capabilities: ["CSS", "clojure"],
        careers: [
          {
            code: newCareer.code,
            creditsCount: 8
          }
        ]
      };
      await ApplicantRepository.update(applicant, newProps);
      const capabilities = await CapabilityRepository.findByDescription(
        [...newProps.capabilities, ...applicantData.capabilities]
      );
      expect(applicant).toEqual(expect.objectContaining({
        name: newProps.name,
        surname: newProps.surname,
        description: newProps.description
      }));

      expect(
        applicant.capabilities.map(capability => capability.description)
      ).toEqual(expect.arrayContaining(
        capabilities.map(capability => capability.description)
      ));
      expect(
        applicant.careers.map(aCareer => aCareer.code)
      ).toEqual(expect.arrayContaining([career.code, newCareer.code]));
    });

    it("Should update name", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career.code]);
      const applicant = await ApplicantRepository.create(applicantData);
      const newProps: IApplicantEditable = { name: "newName" };
      await ApplicantRepository.update(applicant, newProps);
      expect(applicant).toEqual(expect.objectContaining({
        name: newProps.name
      }));
    });

    it("Should update surname", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career.code]);
      const applicant = await ApplicantRepository.create(applicantData);
      const newProps: IApplicantEditable = { surname: "newSurname" };
      await ApplicantRepository.update(applicant, newProps);
      expect(applicant).toEqual(expect.objectContaining({
        surname: newProps.surname
      }));
    });

    it("Should update description", async () => {
      const career = await CareerRepository.create(careerMocks.careerData());
      const applicantData = applicantMocks.applicantData([career.code]);
      const applicant = await ApplicantRepository.create(applicantData);
      const newProps: IApplicantEditable = { description: "newdescription" };
      await ApplicantRepository.update(applicant, newProps);
      expect(applicant).toEqual(expect.objectContaining({
        description: newProps.description
      }));
    });
  });
});
