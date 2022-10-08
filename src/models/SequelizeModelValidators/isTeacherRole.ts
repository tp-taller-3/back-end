import { teacherRoles } from "$models/TeacherRole";

export const isTeacherRole = {
  validate: {
    isIn: {
      msg: `TeacherRole must be one of these values: ${teacherRoles}`,
      args: [teacherRoles]
    }
  }
};
