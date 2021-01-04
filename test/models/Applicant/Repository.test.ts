import { UniqueConstraintError, ValidationError } from "sequelize";
import { ApplicantNotFound, ApplicantWithNoCareersError } from "$models/Applicant/Errors";
import {
  ForbiddenCurrentCareerYearError,
  MissingApprovedSubjectCountError
} from "$models/Applicant/ApplicantCareer/Errors";

import { CareerRepository } from "$models/Career";
import {
  ApplicantRepository,
  ApplicantType,
  IApplicantEditable,
  ISection
} from "$models/Applicant";
import { Applicant, ApplicantKnowledgeSection, Career } from "$models";
import { ApprovalStatus } from "$models/ApprovalStatus";
import { ApplicantCareersRepository } from "$models/Applicant/ApplicantCareer";
import { UserRepository } from "$models/User";
import { CapabilityRepository } from "$models/Capability";

import { ApplicantGenerator } from "$generators/Applicant";
import { CareerGenerator } from "$generators/Career";
import { get, set } from "lodash";
import { mockItemsPerPage } from "$mocks/config/PaginationConfig";

describe("ApplicantRepository", () => {
  let firstCareer: Career;
  let secondCareer: Career;

  beforeAll(async () => {
    await UserRepository.truncate();
    await CareerRepository.truncate();
    await CapabilityRepository.truncate();

    firstCareer = await CareerGenerator.instance();
    secondCareer = await CareerGenerator.instance();
  });

  describe("getType", () => {
    it("creates a graduate", async () => {
      const applicant = await ApplicantGenerator.instance.graduate();
      expect(await applicant.getType()).toEqual(ApplicantType.graduate);
    });

    it("creates a student", async () => {
      const applicant = await ApplicantGenerator.instance.student();
      expect(await applicant.getType()).toEqual(ApplicantType.student);
    });

    it("creates an applicant that is a student for one career and a graduate for another one", async () => {
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      expect(await applicant.getType()).toEqual(ApplicantType.both);
    });

    it("throws an error if the applicant has no careers", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      await expect(applicant.getType()).rejects.toThrowErrorWithMessage(
        ApplicantWithNoCareersError,
        ApplicantWithNoCareersError.buildMessage(applicant.uuid)
      );
    });
  });

  describe("Get", () => {
    it("retrieves applicant by padron", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const persistedApplicant = await ApplicantRepository.findByPadron(applicant.padron);
      expect(applicant.uuid).toEqual(persistedApplicant.uuid);
    });

    it("retrieves applicant by uuid", async () => {
      const applicant = await ApplicantGenerator.instance.withMinimumData();
      const persistedApplicant = await ApplicantRepository.findByUuid(applicant.uuid);
      expect(applicant.uuid).toEqual(persistedApplicant.uuid);
    });

    it("throws ApplicantNotFound if the applicant doesn't exists", async () => {
      const { padron } = ApplicantGenerator.data.minimum();
      await expect(ApplicantRepository.findByPadron(padron)).rejects.toThrow(ApplicantNotFound);
    });

    describe("findLatest", () => {
      let student: Applicant;
      let graduate: Applicant;
      let studentAndGraduate: Applicant;

      const generateApplicants = async () => {
        return [
          await ApplicantGenerator.instance.student({ career: firstCareer }),
          await ApplicantGenerator.instance.graduate({ career: firstCareer }),
          await ApplicantGenerator.instance.studentAndGraduate({
            finishedCareer: firstCareer,
            careerInProgress: secondCareer
          })
        ];
      };

      beforeAll(async () => {
        await ApplicantRepository.truncate();
        [student, graduate, studentAndGraduate] = await generateApplicants();
      });

      it("returns the latest applicant first", async () => {
        const applicants = await ApplicantRepository.findLatest();
        expect(applicants.shouldFetchMore).toEqual(false);
        expect(applicants.results).toEqual([
          expect.objectContaining({
            uuid: studentAndGraduate.uuid,
            padron: studentAndGraduate.padron,
            approvalStatus: ApprovalStatus.approved
          }),
          expect.objectContaining({
            uuid: graduate.uuid,
            padron: graduate.padron,
            approvalStatus: ApprovalStatus.approved
          }),
          expect.objectContaining({
            uuid: student.uuid,
            padron: student.padron,
            approvalStatus: ApprovalStatus.approved
          })
        ]);
      });

      it("returns students", async () => {
        const applicants = await ApplicantRepository.findLatest({
          applicantType: ApplicantType.student
        });
        expect(applicants.shouldFetchMore).toEqual(false);
        expect(applicants.results.map(({ uuid }) => uuid)).toEqual([
          studentAndGraduate.uuid,
          student.uuid
        ]);
      });

      it("returns graduates", async () => {
        const applicants = await ApplicantRepository.findLatest({
          applicantType: ApplicantType.graduate
        });
        expect(applicants.shouldFetchMore).toEqual(false);
        expect(applicants.results.map(({ uuid }) => uuid)).toEqual([
          studentAndGraduate.uuid,
          graduate.uuid
        ]);
      });

      it("returns applicants that are students and graduates", async () => {
        const applicants = await ApplicantRepository.findLatest({
          applicantType: ApplicantType.both
        });
        expect(applicants.shouldFetchMore).toEqual(false);
        expect(applicants.results.map(({ uuid }) => uuid)).toEqual([
          studentAndGraduate.uuid,
          graduate.uuid,
          student.uuid
        ]);
      });

      it("returns applicants that are in the first career", async () => {
        const applicants = await ApplicantRepository.findLatest({
          careerCodes: [firstCareer.code]
        });
        expect(applicants.shouldFetchMore).toEqual(false);
        expect(applicants.results.map(({ uuid }) => uuid)).toEqual([
          studentAndGraduate.uuid,
          graduate.uuid,
          student.uuid
        ]);
      });

      it("returns applicants that are in the second career", async () => {
        const applicants = await ApplicantRepository.findLatest({
          careerCodes: [secondCareer.code]
        });
        expect(applicants.shouldFetchMore).toEqual(false);
        expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
      });

      it("returns applicants where only the name matches", async () => {
        const name = "STUDENT";
        const studentUser = await UserRepository.findByUuid(student.userUuid);
        studentUser.name = name;
        await UserRepository.save(studentUser);
        const applicants = await ApplicantRepository.findLatest({ name });
        expect(applicants.shouldFetchMore).toEqual(false);
        expect(applicants.results.map(({ uuid }) => uuid)).toEqual([student.uuid]);
      });

      it("returns applicants where only the surname matches", async () => {
        const surname = "GRADUATE_SURNAME";
        const graduateUser = await UserRepository.findByUuid(graduate.userUuid);
        graduateUser.surname = surname;
        await UserRepository.save(graduateUser);
        const applicants = await ApplicantRepository.findLatest({ name: surname });
        expect(applicants.shouldFetchMore).toEqual(false);
        expect(applicants.results.map(({ uuid }) => uuid)).toEqual([graduate.uuid]);
      });

      it("returns applicants where the name or the surname have a part of the name", async () => {
        const name = "eric";
        const studentAndGraduateUser = await UserRepository.findByUuid(studentAndGraduate.userUuid);
        studentAndGraduateUser.surname = "erica";
        await UserRepository.save(studentAndGraduateUser);
        const applicants = await ApplicantRepository.findLatest({ name });
        expect(applicants.shouldFetchMore).toEqual(false);
        expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
      });

      it("returns students in the first career", async () => {
        const applicants = await ApplicantRepository.findLatest({
          applicantType: ApplicantType.student,
          careerCodes: [firstCareer.code]
        });
        expect(applicants.shouldFetchMore).toEqual(false);
        expect(applicants.results.map(({ uuid }) => uuid)).toEqual([student.uuid]);
      });

      it("returns students in the second career", async () => {
        const applicants = await ApplicantRepository.findLatest({
          applicantType: ApplicantType.student,
          careerCodes: [secondCareer.code]
        });
        expect(applicants.shouldFetchMore).toEqual(false);
        expect(applicants.results.map(({ uuid }) => uuid)).toEqual([studentAndGraduate.uuid]);
      });

      it("returns graduates in the first career", async () => {
        const applicants = await ApplicantRepository.findLatest({
          applicantType: ApplicantType.graduate,
          careerCodes: [firstCareer.code]
        });
        expect(applicants.shouldFetchMore).toEqual(false);
        expect(applicants.results.map(({ uuid }) => uuid)).toEqual([
          studentAndGraduate.uuid,
          graduate.uuid
        ]);
      });

      describe("fetchMore", () => {
        let applicant4: Applicant;
        let applicant5: Applicant;
        let applicant6: Applicant;
        let applicant7: Applicant;

        beforeAll(async () => {
          [applicant4, applicant5, applicant6] = await generateApplicants();
          [applicant7, ,] = await generateApplicants();
        });

        it("gets the next 3 Applicants", async () => {
          const itemsPerPage = 3;
          mockItemsPerPage(itemsPerPage);

          const updatedBeforeThan = {
            dateTime: applicant7.updatedAt,
            uuid: applicant7.uuid
          };

          const applicants = await ApplicantRepository.findLatest({ updatedBeforeThan });
          expect(applicants.results).toEqual([
            expect.objectContaining({
              uuid: applicant6.uuid,
              padron: applicant6.padron,
              approvalStatus: ApprovalStatus.approved
            }),
            expect.objectContaining({
              uuid: applicant5.uuid,
              padron: applicant5.padron,
              approvalStatus: ApprovalStatus.approved
            }),
            expect.objectContaining({
              uuid: applicant4.uuid,
              padron: applicant4.padron,
              approvalStatus: ApprovalStatus.approved
            })
          ]);
          expect(applicants.shouldFetchMore).toBe(true);
        });
      });
    });
  });

  describe("Update", () => {
    const sectionsData = [
      {
        title: "myTitle",
        text: "some description",
        displayOrder: 1
      },
      {
        title: "second section",
        text: "other description",
        displayOrder: 2
      }
    ];

    const newSectionsData = (uuid: string) => [
      {
        uuid: uuid,
        title: "second section",
        text: "new some description",
        displayOrder: 2
      },
      {
        title: "Third section",
        text: "some other description",
        displayOrder: 3
      }
    ];

    const expectSectionsToContainData = (sections: ApplicantKnowledgeSection[], data: ISection[]) =>
      expect(sections).toEqual(
        expect.arrayContaining(data.map(sectionData => expect.objectContaining(sectionData)))
      );

    const expectToUpdateProperty = async (attributeKey: string, newValue: string) => {
      const { uuid } = await ApplicantGenerator.instance.withMinimumData();
      let newProps: IApplicantEditable = { uuid };
      newProps = set(newProps, attributeKey, newValue);
      const applicant = await ApplicantRepository.update(newProps);
      const user = await UserRepository.findByUuid(applicant.userUuid);
      expect(get({ ...applicant.toJSON(), user }, attributeKey)).toEqual(
        get(newProps, attributeKey)
      );
    };

    it("updates all props", async () => {
      const { uuid } = await ApplicantGenerator.instance.graduate();
      const newCareer = await CareerGenerator.instance();
      const newProps: IApplicantEditable = {
        uuid,
        user: {
          name: "newName",
          surname: "newSurname"
        },
        description: "newDescription",
        capabilities: ["CSS", "clojure"],
        careers: [
          {
            careerCode: newCareer.code,
            approvedSubjectCount: 20,
            currentCareerYear: 3,
            isGraduate: false
          }
        ],
        experienceSections: [
          {
            title: "Devartis",
            text: "I was the project manager",
            displayOrder: 1
          },
          {
            title: "Google",
            text: "I am the CEO of google in ireland",
            displayOrder: 2
          }
        ],
        knowledgeSections: [
          {
            title: "title",
            text: "some description",
            displayOrder: 1
          }
        ],
        links: [
          {
            name: "someName",
            url: "https://some.url"
          }
        ]
      };
      const applicant = await ApplicantRepository.update(newProps);
      const applicantCareers = await applicant.getApplicantCareers();
      const capabilities = await applicant.getCapabilities();
      const sections = await applicant.getKnowledgeSections();
      const experienceSections = await applicant.getExperienceSections();
      const links = await applicant.getLinks();
      const user = await UserRepository.findByUuid(applicant.userUuid);

      expect(applicant).toBeObjectContaining({ description: newProps.description });
      expect(user).toBeObjectContaining(newProps.user!);
      expect(capabilities.map(c => c.description)).toEqual(
        expect.arrayContaining(newProps.capabilities!)
      );
      expect(applicantCareers).toEqual(
        newProps.careers?.map(career => expect.objectContaining(career))
      );
      expect(links).toEqual(newProps.links?.map(link => expect.objectContaining(link)));
      expect(sections).toEqual(
        newProps.knowledgeSections?.map(section => expect.objectContaining(section))
      );
      expect(experienceSections).toEqual(
        newProps.experienceSections?.map(section => expect.objectContaining(section))
      );
    });

    it("updates name", async () => {
      await expectToUpdateProperty("user.name", "newName");
    });

    it("updates surname", async () => {
      await expectToUpdateProperty("user.surname", "newSurname");
    });

    it("updates email", async () => {
      await expectToUpdateProperty("user.email", "newEmail@gmail.com");
    });

    it("updates description", async () => {
      await expectToUpdateProperty("description", "newDescription");
    });

    it("updates by adding new capabilities", async () => {
      const capabilities = ["CSS", "clojure"];
      const applicant = await ApplicantGenerator.instance.withMinimumData({ capabilities });
      expect((await applicant.getCapabilities()).map(c => c.description)).toEqual(
        expect.arrayContaining(capabilities)
      );

      const newCapabilities = ["Python", "clojure"];
      const changeOneProps: IApplicantEditable = {
        uuid: applicant.uuid,
        capabilities: newCapabilities
      };

      await ApplicantRepository.update(changeOneProps);
      expect((await applicant.getCapabilities()).map(c => c.description)).toEqual(
        expect.arrayContaining(newCapabilities)
      );
    });

    it("updates by deleting all capabilities if none is provided", async () => {
      const capabilities = ["CSS", "clojure"];
      const applicant = await ApplicantGenerator.instance.withMinimumData({ capabilities });

      expect((await applicant.getCapabilities()).map(capability => capability.description)).toEqual(
        expect.arrayContaining(capabilities)
      );

      await ApplicantRepository.update({ uuid: applicant.uuid });
      expect(await applicant.getCapabilities()).toHaveLength(0);
    });

    it("updates by keeping only the new careers", async () => {
      const applicant = await ApplicantGenerator.instance.studentAndGraduate();
      const newProps: IApplicantEditable = {
        uuid: applicant.uuid,
        careers: [
          {
            careerCode: firstCareer.code,
            approvedSubjectCount: 20,
            currentCareerYear: 3,
            isGraduate: false
          },
          {
            careerCode: secondCareer.code,
            approvedSubjectCount: 20,
            currentCareerYear: 3,
            isGraduate: false
          }
        ]
      };

      const updatedApplicant = await ApplicantRepository.update(newProps);
      expect((await updatedApplicant.getCareers()).map(career => career.code)).toEqual(
        expect.arrayContaining([firstCareer.code, secondCareer.code])
      );

      const thirdCareer = await CareerGenerator.instance();
      const updatedProps: IApplicantEditable = {
        uuid: applicant.uuid,
        careers: [
          {
            careerCode: thirdCareer.code,
            isGraduate: true
          },
          {
            careerCode: secondCareer.code,
            isGraduate: true
          }
        ]
      };

      await ApplicantRepository.update(updatedProps);
      expect((await updatedApplicant.getCareers()).map(career => career.code)).toEqual(
        expect.arrayContaining([thirdCareer.code, secondCareer.code])
      );
    });

    it("updates by keeping only the new knowledgeSections", async () => {
      const { uuid } = await ApplicantGenerator.instance.withMinimumData();
      const applicant = await ApplicantRepository.update({ uuid, knowledgeSections: sectionsData });
      const initialSections = await applicant.getKnowledgeSections();
      expectSectionsToContainData(initialSections, sectionsData);

      const secondSection = initialSections.find(({ title }) => title === sectionsData[1].title);

      const updatedApplicant = await ApplicantRepository.update({
        uuid,
        knowledgeSections: newSectionsData(secondSection!.uuid)
      });
      const updatedSections = await updatedApplicant.getKnowledgeSections();

      expectSectionsToContainData(updatedSections, newSectionsData(secondSection!.uuid));
    });

    it("updates by keeping only the new experienceSections", async () => {
      const { uuid } = await ApplicantGenerator.instance.withMinimumData();
      const applicant = await ApplicantRepository.update({
        uuid,
        experienceSections: sectionsData
      });

      const initialExperienceSections = await applicant.getExperienceSections();
      expectSectionsToContainData(initialExperienceSections, sectionsData);
      const secondSection = initialExperienceSections.find(
        ({ title }) => title === sectionsData[1].title
      );

      const updatedApplicant = await ApplicantRepository.update({
        uuid,
        experienceSections: newSectionsData(secondSection!.uuid)
      });
      const updatedExperienceSections = await updatedApplicant.getExperienceSections();
      expectSectionsToContainData(updatedExperienceSections, newSectionsData(secondSection!.uuid));
    });

    it("updates deleting all experienceSections if none is provided", async () => {
      const { uuid } = await ApplicantGenerator.instance.withMinimumData();
      let updatedApplicant = await ApplicantRepository.update({
        uuid,
        experienceSections: sectionsData
      });

      const initialExperienceSections = await updatedApplicant.getExperienceSections();
      expect(initialExperienceSections).toHaveLength(sectionsData.length);

      updatedApplicant = await ApplicantRepository.update({ uuid, experienceSections: [] });
      expect(await updatedApplicant.getExperienceSections()).toHaveLength(0);
    });

    it("updates deleting all sections if none is provided", async () => {
      const { uuid } = await ApplicantGenerator.instance.withMinimumData();
      let updatedApplicant = await ApplicantRepository.update({
        uuid,
        knowledgeSections: sectionsData
      });

      const initialSections = await updatedApplicant.getKnowledgeSections();
      expect(initialSections).toHaveLength(sectionsData.length);

      updatedApplicant = await ApplicantRepository.update({ uuid, knowledgeSections: [] });
      expect(await updatedApplicant.getKnowledgeSections()).toHaveLength(0);
    });

    it("updates by keeping only the new links", async () => {
      const { uuid } = await ApplicantGenerator.instance.student();
      const linksData = [
        {
          name: "LinkedIn",
          url: "https://www.linkedin.com/in/dylan-alvarez-89430b88/"
        },
        {
          name: "GitHub",
          url: "https://github.com"
        }
      ];
      const applicant = await ApplicantRepository.update({
        uuid,
        links: linksData
      });
      expect((await applicant.getLinks()).map(({ url, name }) => ({ url, name }))).toEqual(
        expect.arrayContaining(linksData)
      );
      const newLinksData = [
        {
          name: "GitHub",
          url: "https://github.com"
        },
        {
          name: "Google",
          url: "http://www.google.com"
        }
      ];
      const updatedApplicant = await ApplicantRepository.update({
        uuid,
        links: newLinksData
      });
      expect(
        (await updatedApplicant.getLinks()).map(({ url, name }) => ({
          url,
          name
        }))
      ).toEqual(expect.arrayContaining(newLinksData));
    });

    it("updates by deleting all links if none is provided", async () => {
      const { uuid } = await ApplicantGenerator.instance.student();
      const applicant = await ApplicantRepository.update({
        uuid,
        links: [
          {
            name: "GitHub",
            url: "https://github.com"
          },
          {
            name: "Google",
            url: "http://www.google.com"
          }
        ]
      });
      await ApplicantRepository.update({ uuid });
      expect((await applicant.getLinks()).length).toEqual(0);
    });

    it("does not throw an error when adding an existing capability", async () => {
      const { uuid } = await ApplicantGenerator.instance.withMinimumData({ capabilities: ["GO"] });
      await expect(
        ApplicantRepository.update({ uuid, capabilities: ["GO"] })
      ).resolves.not.toThrow();
    });

    it("updates currentCareerYear and approvedSubjectCount of applicant careers", async () => {
      const career = await CareerGenerator.instance();
      const applicant = await ApplicantGenerator.instance.withMinimumData({
        careers: [
          {
            careerCode: career.code,
            isGraduate: false,
            currentCareerYear: 2,
            approvedSubjectCount: 10
          }
        ]
      });
      const newApplicantCareerData = {
        careerCode: career.code,
        currentCareerYear: 3,
        approvedSubjectCount: 17,
        isGraduate: false
      };
      await ApplicantRepository.update({ uuid: applicant.uuid, careers: [newApplicantCareerData] });

      const updatedApplicantCareer = await ApplicantCareersRepository.findByApplicantAndCareer(
        applicant.uuid,
        career.code
      );
      expect(updatedApplicantCareer).toBeObjectContaining(newApplicantCareerData);
    });

    it("updates by deleting all applicant careers if none is provided", async () => {
      const career = await CareerGenerator.instance();
      const applicant = await ApplicantGenerator.instance.withMinimumData({
        careers: [{ careerCode: career.code, isGraduate: true }]
      });
      const newApplicantCareerData = [{ careerCode: career.code, isGraduate: true }];
      await ApplicantRepository.update({
        uuid: applicant.uuid,
        careers: newApplicantCareerData
      });
      expect((await applicant.getCareers()).length).toEqual(1);
      await ApplicantRepository.update({ uuid: applicant.uuid });
      expect((await applicant.getCareers()).length).toEqual(0);
    });

    describe("with wrong parameters", () => {
      it("throws an error if currentCareerYear is present for a graduated", async () => {
        const { uuid } = await ApplicantGenerator.instance.withMinimumData();
        const { code: careerCode } = await CareerGenerator.instance();
        const dataToUpdate = {
          uuid,
          careers: [
            {
              careerCode,
              currentCareerYear: 3,
              isGraduate: true
            }
          ]
        };
        await expect(
          ApplicantRepository.update(dataToUpdate)
        ).rejects.toThrowBulkRecordErrorIncluding([
          {
            errorClass: ValidationError,
            message: ForbiddenCurrentCareerYearError.buildMessage()
          }
        ]);
      });

      it("throws an error if approvedSubjectCount is missing for a non graduate", async () => {
        const { uuid } = await ApplicantGenerator.instance.withMinimumData();
        const { code: careerCode } = await CareerGenerator.instance();
        const dataToUpdate = {
          uuid,
          careers: [
            {
              careerCode,
              currentCareerYear: 3,
              isGraduate: false
            }
          ]
        };
        await expect(
          ApplicantRepository.update(dataToUpdate)
        ).rejects.toThrowBulkRecordErrorIncluding([
          {
            errorClass: ValidationError,
            message: MissingApprovedSubjectCountError.buildMessage()
          }
        ]);
      });

      it("does not update if two knowledgeSections have the same displayOrder", async () => {
        const { uuid } = await ApplicantGenerator.instance.withMinimumData();
        const applicant = await ApplicantRepository.update({
          uuid,
          knowledgeSections: sectionsData
        });
        const sectionsDataWithSameDisplayOrder = [
          {
            ...sectionsData[0],
            displayOrder: 2
          },
          {
            ...sectionsData[0],
            displayOrder: 2
          }
        ];
        await expect(
          ApplicantRepository.update({ uuid, knowledgeSections: sectionsDataWithSameDisplayOrder })
        ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");

        const sections = await applicant.getKnowledgeSections();
        expect(sections).toEqual(
          expect.arrayContaining(sectionsData.map(data => expect.objectContaining(data)))
        );
      });

      it("does not update if two experienceSections have the same displayOrder", async () => {
        const { uuid } = await ApplicantGenerator.instance.withMinimumData();
        const applicant = await ApplicantRepository.update({
          uuid,
          experienceSections: sectionsData
        });

        const sectionsDataWithSameDisplayOrder = [
          {
            ...sectionsData[0],
            displayOrder: 2
          },
          {
            ...sectionsData[0],
            displayOrder: 2
          }
        ];
        await expect(
          ApplicantRepository.update({ uuid, experienceSections: sectionsDataWithSameDisplayOrder })
        ).rejects.toThrowErrorWithMessage(UniqueConstraintError, "Validation error");

        const sections = await applicant.getExperienceSections();
        expect(sections).toEqual(
          expect.arrayContaining(sectionsData.map(data => expect.objectContaining(data)))
        );
      });
    });
  });
});
