import { QueryInterface } from "sequelize";
import { Environment } from "../../config/Environment";
import { UUID } from "../../models/UUID";

export = {
  up: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() !== Environment.PRODUCTION) return;
    const claudiaUserUuid = UUID.generate();
    const dianaUserUuid = UUID.generate();
    const florenciaUserUuid = UUID.generate();
    const lucasUserUuid = UUID.generate();
    await queryInterface.bulkInsert("Users", [
      {
        uuid: claudiaUserUuid,
        email: "test123@gmail.com",
        name: "Claudia",
        surname: "Matteo",
        dni: "16558891",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: dianaUserUuid,
        email: "test123@gmail.com",
        name: "Diana",
        surname: "Scasserra",
        dni: "33362763",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: florenciaUserUuid,
        email: "test123@gmail.com",
        name: "Florencia",
        surname: "Villanustre",
        dni: "23126859",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        uuid: lucasUserUuid,
        email: "test123@gmail.com",
        name: "Lucas",
        surname: "Macias",
        dni: "30923624",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    return queryInterface.bulkInsert("Admins", [
      {
        userUuid: claudiaUserUuid,
        secretary: "extension",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userUuid: dianaUserUuid,
        secretary: "extension",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userUuid: florenciaUserUuid,
        secretary: "extension",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userUuid: lucasUserUuid,
        secretary: "extension",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface: QueryInterface) => {
    if (Environment.NODE_ENV() !== Environment.PRODUCTION) return;
    await queryInterface.bulkDelete("Admins", {});
    return queryInterface.bulkDelete("Users", {});
  }
};
