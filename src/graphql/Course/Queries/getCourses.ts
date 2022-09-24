import { ID, List, nonNull } from "$graphql/fieldTypes";
import { GraphQLCourse } from "../Types/GraphQLCourse";
import { CourseRepository } from "$models/Course/Repository";

export const getCourses = {
  type: List(nonNull(GraphQLCourse)),
  args: {
    departmentUuid: {
      type: nonNull(ID)
    }
  },
  resolve: (_: undefined, { departmentUuid }: { departmentUuid: string }) =>
    CourseRepository.findByDepartmentUuid({ departmentUuid })
};
