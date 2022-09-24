import { adminTypes } from "./Admin";
import { companyTypes } from "./Company";
import { offerTypes } from "./Offer";
import { applicantTypes } from "./Applicant";
import { jobApplicationTypes } from "./JobApplication";
import { careerTypes } from "./Career/Types";
import { userTypes } from "./User/Types";
import { capabilityTypes } from "./Capability";
import { translationTypes } from "./Translation";
import { approvalStatusTypes } from "./ApprovalStatus";
import { adminTaskTypes } from "./AdminTask/Types";
import { adminSettingsTypes } from "./AdminSettings/Types";
import { companyNotificationTypes } from "./CompanyNotification";
import { applicantNotificationTypes } from "./ApplicantNotification";
import { adminNotificationTypes } from "./AdminNotification";
import { companyUserTypes } from "./CompanyUser";
import { surveyTypes } from "$graphql/Survey";
import { semesterTypes } from "$graphql/Semester";
import { departmentTypes } from "$graphql/Department";
import { courseTypes } from "$graphql/Course";
import { questionTypes } from "$graphql/Question";
import { answerTypes } from "$graphql/Answer";

export const types = [
  ...adminTypes,
  ...companyTypes,
  ...offerTypes,
  ...applicantTypes,
  ...careerTypes,
  ...userTypes,
  ...capabilityTypes,
  ...jobApplicationTypes,
  ...translationTypes,
  ...approvalStatusTypes,
  ...adminTaskTypes,
  ...adminSettingsTypes,
  ...companyNotificationTypes,
  ...applicantNotificationTypes,
  ...adminNotificationTypes,
  ...companyUserTypes,
  ...surveyTypes,
  ...semesterTypes,
  ...departmentTypes,
  ...courseTypes,
  ...questionTypes,
  ...answerTypes
];
