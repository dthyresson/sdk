import { defineLinks } from "@redwoodjs/sdk/router";

export const link = defineLinks([
  "/",
  "/submissions",
  "/submissions/:id",
  "/submissions/:id/edit",
  "/submissions/:id/questions/:questionId/upload",
  "/files/:key",
  "/questions/:id",
  "/questions/:id/upload",
  "/wizard/start",
  "/emails",
  "/emails/new",
  "/emails/:id",
  "/user/logout",
  "/user/login",
  "/user/profile",
]);
