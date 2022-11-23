import { Database } from "$config/Database";
import { nonNull, ID } from "$graphql/fieldTypes";
import { AnswerRepository } from "$models/Answer/Repository";
import { CourseRepository } from "$models/Course/Repository";
import { QuestionRepository } from "$models/Question/Repository";
import { SemesterRepository } from "$models/Semester";
import { TeacherRepository } from "$models/Teacher/Repository";
import { GraphQLSemester } from "../Types/GraphQLSemester";

export const deleteSemester = {
  type: GraphQLSemester,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: async (_: undefined, { uuid }: IDeleteSemester) => {
    await SemesterRepository.findByUuid(uuid);
    await Database.transaction(async transaction => {
      await AnswerRepository.deleteBySemesterUuid(uuid, transaction);
      await QuestionRepository.deleteBySemesterUuid(uuid, transaction);
      await TeacherRepository.deleteBySemesterUuid(uuid, transaction);
      await CourseRepository.deleteBySemesterUuid(uuid, transaction);
      await SemesterRepository.deleteById(uuid, transaction);
    });
  }
};

interface IDeleteSemester {
  uuid: string;
}
