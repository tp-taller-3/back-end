import { createTestClient } from "apollo-server-testing";
import { apolloErrorConverter } from "$src/FormatErrors";
import { CurrentUser, CurrentUserBuilder } from "$models/CurrentUser";
import { ApolloServer as Server } from "apollo-server-express";
import { schema } from "$graphql/Schema";
import { expressContextMock, IExpressContext } from "./ExpressContext";

export const defaultCurrentUser = CurrentUserBuilder.build({
  uuid: "5bca6c9d-8367-4500-be05-0db55066b2a1",
  email: "test@test.test",
  applicant: { uuid: "f1866416-bbb7-4890-9c19-603ac02c3dec" }
});

const LoggedInTestClient = ({
  currentUser = defaultCurrentUser,
  expressContext = expressContextMock()
}: IClient) =>
  createTestClient(
    new Server({
      schema,
      formatError: apolloErrorConverter({ logger: false }),
      context: () => ({
        ...expressContext,
        currentUser
      })
    })
  );

const LoggedOutTestClient = ({ expressContext = expressContextMock() }: IClient) =>
  createTestClient(
    new Server({
      schema,
      formatError: apolloErrorConverter({ logger: false }),
      context: () => expressContext
    })
  );

export const client = {
  loggedIn: ({
    currentUser = defaultCurrentUser,
    expressContext = expressContextMock()
  }: IClient = {}) => LoggedInTestClient({ currentUser, expressContext }),
  loggedOut: ({ expressContext = expressContextMock() }: IClient = {}) =>
    LoggedOutTestClient({ expressContext })
};

interface IClient {
  currentUser?: CurrentUser;
  expressContext?: IExpressContext;
}
