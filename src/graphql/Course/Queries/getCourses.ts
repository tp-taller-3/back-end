import { ID, List, nonNull } from "$graphql/fieldTypes";
import { GraphQLCourse } from "../Types/GraphQLCourse";
import { CourseRepository } from "$models/Course/Repository";

export const getCourses = {
  type: List(nonNull(GraphQLCourse)),
  args: {
    semesterUuid: {
      type: nonNull(ID)
    }
  },
  resolve: (_: undefined, { semesterUuid }: { semesterUuid: string }) =>
    CourseRepository.findBySemesterUuid({ semesterUuid })
};
