import express from "express";
import path from "path";
import Youch from "youch";
import * as Sentry from "@sentry/node";
import "express-async-errors";

import "./database";
import sentryConfig from "./config/sentry";

import routes from "./routes";

class App {
  constructor() {
    this.express = express();

    this.middleware();
    this.routes();
    this.exceptionHandler();

    Sentry.init(sentryConfig);
  }

  middleware() {
    this.express.use(Sentry.Handlers.requestHandler());
    this.express.use(express.json());
    this.express.use(
      "/files",
      express.static(path.resolve(__dirname, "..", "tmp", "uploads"))
    );
  }

  routes() {
    this.express.use(routes);
    this.express.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.express.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === "development") {
        const errors = await new Youch(err, req).toJSON();

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: "Internal server error" });
    });
  }
}

export default new App().express;
