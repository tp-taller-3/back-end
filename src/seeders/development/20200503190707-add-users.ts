import { QueryInterface } from "sequelize";
import { diana, claudia, florencia, lucas } from "../constants/admins";
import { Environment } from "../../config/Environment";

export = {
  up: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.bulkInsert("Users", [
      lucas.user,
      diana.user,
      claudia.user,
      florencia.user
    ]);
  },
  down: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.bulkDelete("Users", {});
  }
};
