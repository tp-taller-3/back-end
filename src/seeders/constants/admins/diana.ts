import { UUID } from "../../../models/UUID";

const uuid = UUID.generate();
export const diana = {
  user: {
    uuid: uuid,
    email: "test123@gmail.com",
    name: "Diana",
    surname: "Scasserra",
    dni: "33362763",
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
