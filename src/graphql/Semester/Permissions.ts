import { isAdmin } from "$graphql/Rules";

export const semesterPermissions = {
  Mutation: {
    deleteSemester: isAdmin
  }
};
