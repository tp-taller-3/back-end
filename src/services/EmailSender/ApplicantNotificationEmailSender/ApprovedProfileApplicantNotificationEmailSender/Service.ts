import { ApprovedProfileApplicantNotification } from "$models/ApplicantNotification";
import { Sender } from "$services/EmailSender/Sender";
import { FrontEndLinksBuilder } from "$services/EmailSender/FrontEndLinksBuilder";
import { ApplicantRepository } from "$models/Applicant";
import { UserRepository } from "$models/User";
import { TranslationRepository } from "$models/Translation";
import { template } from "lodash";
import { SecretarySettingsRepository } from "$models/SecretarySettings";
import { NotificationEmailSender } from "$services/EmailSender/NotificationEmailSender";
import { ApplicantNotificationSequelizeModel } from "$models";

export const ApprovedProfileApplicantNotificationEmailSender = {
  send: async (notification: ApprovedProfileApplicantNotification) => {
    const applicant = await ApplicantRepository.findByUuid(notification.notifiedApplicantUuid);
    const applicantUser = await UserRepository.findByUuid(applicant.userUuid);
    const settings = await SecretarySettingsRepository.findByAdminUuid(notification.moderatorUuid);
    // @ts-ignore
    const { subject, body } = TranslationRepository.translate(
      "approvedProfileApplicantNotificationEmail"
    );

    const emailParams = {
      receiverEmails: [applicantUser.email],
      sender: await Sender.findByAdmin(notification.moderatorUuid),
      subject,
      body: template(body)({
        profileLink: FrontEndLinksBuilder.applicant.profileLink(),
        signature: settings.emailSignature
      })
    };
    const emailSender = new NotificationEmailSender(
      notification,
      ApplicantNotificationSequelizeModel.tableName,
      emailParams
    );
    return emailSender.send();
  }
};
