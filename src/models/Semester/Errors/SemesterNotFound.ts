export class SemesterNotFound extends Error {
  constructor(field: string) {
    super(`Semester with uuid: ${field} does not exist`);
  }
}
