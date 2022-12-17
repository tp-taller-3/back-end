import { UUID } from "../../../models/UUID";

const uuid = UUID.generate();
export const lucas = {
  user: {
    uuid: uuid,
    email: "test123@gmail.com",
    name: "Lucas",
    surname: "Macias",
    dni: "30923624",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  admin: {
    userUuid: uuid,
    secretary: "extension",
    createdAt: new Date(),
    updatedAt: new Date()
  }
};
