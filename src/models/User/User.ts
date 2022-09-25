import { AttributeNotDefinedError, InvalidAttributeFormatError } from "$models/Errors";
import { ICredentials } from "./Interface";
import { Nullable } from "$models/SequelizeModel";
import { UUID } from "$models/UUID";
import { isNil } from "lodash";

export class User {
  public uuid: Nullable<string>;
  public name: string;
  public surname: string;
  public email: string;
  public credentials: ICredentials;

  constructor(attributes: IUserAttributes) {
    this.setUuid(attributes.uuid);
    this.setName(attributes.name);
    this.setSurname(attributes.surname);
    this.setEmail(attributes.email);
    this.setCredentials(attributes.credentials);
  }

  public setUuid(uuid: Nullable<string>) {
    if (uuid && !UUID.validate(uuid)) throw new InvalidAttributeFormatError("uuid");
    this.uuid = uuid;
  }

  public setAttributes(attributes: IUserEditAttributes) {
    if (attributes.name) this.setName(attributes.name);
    if (attributes.surname) this.setSurname(attributes.surname);
    if (attributes.email) this.setEmail(attributes.email);
  }

  private setName(name: string) {
    if (isNil(name)) throw new AttributeNotDefinedError("name");
    this.name = name;
  }

  private setSurname(surname: string) {
    if (isNil(surname)) throw new AttributeNotDefinedError("surname");
    this.surname = surname;
  }

  private setEmail(email: string) {
    const attributeName = "email";
    if (isNil(email)) throw new AttributeNotDefinedError(attributeName);
    this.email = email;
  }

  private setCredentials(credentials: ICredentials) {
    if (isNil(credentials)) throw new AttributeNotDefinedError("credentials");
    this.credentials = credentials;
  }
}

interface IUserEditAttributes {
  name?: string;
  surname?: string;
  email?: string;
}

export interface IUserAttributes {
  uuid?: Nullable<string>;
  name: string;
  surname: string;
  email: string;
  credentials: ICredentials;
}
