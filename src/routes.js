import { Router } from "express";

import multer from "multer";
import multerConfig from "./config/multer";

import authMiddleware from "./app/middlewares/auth";

import UserController from "./app/controllers/UserController";
import SessionController from "./app/controllers/SessionController";
import FileController from "./app/controllers/FileController";
import MeetupController from "./app/controllers/MeetupController";
import OrganizerController from "./app/controllers/OrganizerController";
import SubscriptionController from "./app/controllers/SubscriptionController";

const routes = new Router();

const upload = multer(multerConfig);

routes.post("/users", UserController.store);
routes.post("/sessions", SessionController.store);

routes.use(authMiddleware);

routes.put("/users", UserController.update);

routes.post("/meetups", MeetupController.store);
routes.put("/meetups/:id", MeetupController.update);
routes.delete("/meetups/:id", MeetupController.delete);
routes.get("/meetups", MeetupController.index);

routes.get("/organizers", OrganizerController.index);

routes.post("/subscriptions/:meetupId", SubscriptionController.store);
routes.get("/subscriptions", SubscriptionController.index);

routes.post("/files", upload.single("file"), FileController.store);

export default routes;
