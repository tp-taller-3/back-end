import { List, nonNull } from "$graphql/fieldTypes";
import { SemesterRepository } from "$models/Semester";
import { GraphQLSemester } from "../Types/GraphQLSemester";

export const getSemesters = {
  type: List(nonNull(GraphQLSemester)),
  resolve: () => SemesterRepository.findAll()
};
