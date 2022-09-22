export class SurveyNotFoundError extends Error {
  public static buildMessage(uuid?: string) {
    if (!uuid) return "Survey not found";
    return `Survey with uuid: ${uuid} does not exist`;
  }

  constructor(uuid?: string) {
    super(SurveyNotFoundError.buildMessage(uuid));
  }
}
