export class SemesterNotFound extends Error {
  public static buildMessage(semesterUuid?: string) {
    if (!semesterUuid) return "Semester not found";
    return `Semester with uuid: ${semesterUuid} does not exist`;
  }

  constructor(semesterUuid?: string) {
    super(SemesterNotFound.buildMessage(semesterUuid));
  }
}
