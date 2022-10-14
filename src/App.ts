import express from "express";
import fileUpload from "express-fileupload";
import { cors } from "./cors";
import cookieParser from "cookie-parser";
import { Logger } from "./libs/Logger";
import { Environment } from "./config/Environment";
import { ApolloServer } from "./server";
import { JWT } from "./JWT";
import { json } from "express";
import { csvUploadHandler } from "./csv-upload";

Logger.info(`Running on ${Environment.NODE_ENV()} environment`);

const App: express.Express = express();
App.use(cors());
App.use(cookieParser());
App.use(json({ limit: "1mb" }));
App.use(fileUpload({ createParentPath: true }));
App.post("/csv-upload", csvUploadHandler);
ApolloServer.applyMiddleware({ app: App, path: "/graphql" });
JWT.applyMiddleware({ app: App });

export { App };
