import { isAdmin } from "$graphql/Rules";

export const surveyPermissions = {
  Query: {
    getSurveys: isAdmin
  },
  Mutation: {
    saveSurvey: isAdmin
  }
};
