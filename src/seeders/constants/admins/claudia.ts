import { UUID } from "../../../models/UUID";

const uuid = UUID.generate();
export const claudia = {
  user: {
    uuid: uuid,
    email: "test123@gmail.com",
    name: "Claudia",
    surname: "Matteo",
    dni: "16558891",
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
