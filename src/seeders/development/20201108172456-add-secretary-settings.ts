import { Secretary } from "../../models/Admin/Interface";
import { QueryInterface } from "sequelize";
import { Environment } from "../../config/Environment";

export = {
  up: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    return queryInterface.bulkInsert("SecretarySettings", [
      {
        secretary: Secretary.graduados,
        offerDurationInDays: 15,
        email: "seblanco@fi.uba.ar",
        emailSignature: "Encuestas de Cursos",
        automaticJobApplicationApproval: true
      },
      {
        secretary: Secretary.extension,
        offerDurationInDays: 15,
        email: "extension@fi.uba.ar",
        emailSignature: "Encuestas de Cursos",
        automaticJobApplicationApproval: false
      }
    ]);
  },
  down: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() === Environment.PRODUCTION) return;
    queryInterface.bulkDelete("SecretarySettings", {});
  }
};
