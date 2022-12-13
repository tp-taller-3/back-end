import { UUID } from "../../../models/UUID";

const uuid = UUID.generate();
export const florencia = {
  user: {
    uuid: uuid,
    email: "test123@gmail.com",
    name: "Florencia",
    surname: "Villanustre",
    dni: "23126859",
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
