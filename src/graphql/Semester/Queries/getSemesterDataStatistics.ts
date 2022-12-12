import { nonNull, ID } from "../../fieldTypes";
import { CourseRepository } from "$models/Course/Repository";
import { GraphQLSemesterStatistics } from "$graphql/Semester/Types/GraphQLSemesterStatistics";

export const getSemesterStatistics = {
  type: GraphQLSemesterStatistics,
  args: {
    uuid: {
      type: nonNull(ID)
    }
  },
  resolve: (_: undefined, { uuid }: { uuid: string }) => ({
    courseCount: CourseRepository.countCourses(uuid)
  })
};
