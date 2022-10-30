import { nonNull, ID } from "$graphql/fieldTypes";
import { SemesterRepository } from "$models/Semester";
import { GraphQLSemester } from "../Types/GraphQLSemester";

export const deleteSemester = {
  type: GraphQLSemester,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (_: undefined, { uuid }: IDeleteSemester) => {
    // Devuelve 500 este findByUuid. Como hago para que el error de not found se vea mejor?
    // En los otros ejemplos por lo que vi se hace igual que esto
    await SemesterRepository.findByUuid(uuid);
    // Borrar Answers -> Questions -> Teacher -> Course -> Semester
    // Teacer y Course es facil. Questions y answer como hago?
    await SemesterRepository.deleteById(uuid);
  }
};

interface IDeleteSemester {
  uuid: string;
}
