import { FrontendConfig } from "$config";
import { CompanyNewJobApplicationNotification } from "$models/CompanyNotification";
import { CompanyUserRepository } from "$models/CompanyUser";
import { EmailService } from "$services/Email";
import { UserRepository } from "$models/User";
import { TranslationRepository } from "$models/Translation";
import { JobApplicationRepository } from "$models/JobApplication";
import { OfferRepository } from "$models/Offer";
import { template } from "lodash";
import { ApplicantRepository } from "$models/Applicant";
import { AdminRepository } from "$models/Admin";

const getReceiverEmails = async (companyUuid: string) => {
  const companyUsers = await CompanyUserRepository.findByCompanyUuid(companyUuid);
  const receivers = await UserRepository.findByUuids(companyUsers.map(({ userUuid }) => userUuid));
  return receivers.map(({ email }) => email);
};

const getSender = async (adminUserUuid: string) => {
  const sender = await UserRepository.findByUuid(adminUserUuid);
  return {
    email: sender.email,
    name: `${sender.name} ${sender.surname}`
  };
};

const getSignature = async (adminUserUuid: string): Promise<string> => {
  const admin = await AdminRepository.findByUserUuid(adminUserUuid);
  const signatures = TranslationRepository.translate("emailSignature");
  return signatures.find(({ key }) => key === admin.secretary).value;
};

export const CompanyNewJobApplicationEmailSender = {
  send: async (notification: CompanyNewJobApplicationNotification) => {
    const { offerUuid, applicantUuid } = await JobApplicationRepository.findByUuid(
      notification.jobApplicationUuid
    );
    const offer = await OfferRepository.findByUuid(offerUuid);
    const [subject, body] = TranslationRepository.translate(
      "companyNewJobApplicationNotificationEmail"
    );
    const applicant = await ApplicantRepository.findByUuid(applicantUuid);
    const applicantUser = await UserRepository.findByUuid(applicant.userUuid);
    const { baseUrl, subDomain, endpoints } = FrontendConfig;

    return EmailService.send({
      receiverEmails: await getReceiverEmails(notification.notifiedCompanyUuid),
      sender: await getSender(notification.moderatorUuid),
      subject: subject.value,
      body: template(body.value)({
        offerTitle: offer.title,
        offerLink: `${baseUrl}/${subDomain}/${endpoints.company.offer(offerUuid)}`,
        applicantName: `${applicantUser.name} ${applicantUser.surname}`,
        ApplicantLink: `${baseUrl}/${subDomain}/${endpoints.company.applicant(applicantUuid)}`,
        signature: await getSignature(notification.moderatorUuid)
      })
    });
  }
};
