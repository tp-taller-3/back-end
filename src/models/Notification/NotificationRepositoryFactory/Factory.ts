import {
  CompanyNewJobApplicationNotification,
  CompanyNotificationRepository
} from "$models/CompanyNotification";
import { TNotification } from "../Model";

const repositoryMapper = {
  [CompanyNewJobApplicationNotification.name]: CompanyNotificationRepository
};

export const NotificationRepositoryFactory = {
  getRepositoryFor: (notification: TNotification) => {
    const repository = repositoryMapper[notification.constructor.name];
    if (!repository) throw new Error(`no repository found for ${notification.constructor.name}`);

    return repository;
  }
};