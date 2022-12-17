import { QueryInterface } from "sequelize";
import { lucas, claudia, diana, florencia } from "../constants/admins";
import { Environment } from "../../config/Environment";

export = {
  up: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.bulkInsert("Admins", [
      lucas.admin,
      claudia.admin,
      diana.admin,
      florencia.admin
    ]);
  },
  down: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.bulkDelete("Admins", {});
  }
};
