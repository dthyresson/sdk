import { defineApp } from "@redwoodjs/sdk/worker";
import { index, layout, prefix, route } from "@redwoodjs/sdk/router";
import { Document } from "src/Document";
import { Home } from "@/app/pages/Home";
import { List } from "@/app/pages/submissions/List";
import { Detail } from "@/app/pages/submissions/Detail";
import { Detail as QuestionDetail } from "@/app/pages/questions/Detail";
import { List as EmailList } from "@/app/pages/emails/List";
import { Detail as EmailDetail } from "@/app/pages/emails/Detail";
import { New as EmailNew } from "@/app/pages/emails/New";
import { Edit } from "@/app/pages/submissions/Edit";

import { emailInfo } from "@/app/services/agents";
import { setupDb } from "./db";

import { sessions, setupSessionStore } from "./session/store";
import { Session } from "./session/durableObject";

export { SessionDurableObject } from "./session/durableObject";

import { db } from "@/db";
// import { RouteContext } from "@redwoodjs/sdk/router";
import { Start as WizardStart } from "./app/pages/wizard/Start";
import { setupLangbase } from "./langbase";
import { authRoutes } from "src/pages/auth/routes";

export type Context = {
  id: string;
  session: Session | null;
};

const app = defineApp<Context>([
  async ({ ctx, env, request }) => {
    try {
      await setupDb(env);
    } catch (error) {
      console.error("Error setting up db", error);
    }
    try {
      await setupLangbase(env);
    } catch (error) {
      console.error("Error setting up langbase", error);
    }

    setupSessionStore(env);

    ctx.session = await sessions.load(request);
  },
  layout<Context>(Document, [
    prefix<Context>("/user", authRoutes),

    index<Context>([List]),
    route("/hello", function ({ ctx }: { ctx: Context }) {
      return new Response(`Hello, world! ${ctx.session?.userId}`);
    }),
    route("/home", [Home]),
    route("/files/*", async ({ request, params, env }) => {
      try {
        console.log("Serving file", params);
        const key = params["$0"];
        const object = await env.R2.get(key);

        if (!object) {
          return new Response("File not found", { status: 404 });
        }

        const headers = new Headers();
        headers.set(
          "Content-Type",
          object.httpMetadata?.contentType || "application/octet-stream",
        );

        // For direct viewing in browser (like images)
        if (request.headers.get("Accept")?.includes("image/")) {
          return new Response(object.body, { headers });
        }

        // For file downloads
        headers.set(
          "Content-Disposition",
          `attachment; filename="${key.split("/").pop()}"`,
        );
        return new Response(object.body, { headers });
      } catch (error) {
        console.error("Error serving file:", error);
        return new Response("Error serving file", { status: 500 });
      }
    }),
    prefix("/submissions", [
      // @ts-ignore
      route<Context>("/", List),
      route<Context>("/:id", Detail),
      route<Context>("/:id/edit", Edit),
      route<Context>(
        "/:id/questions/:questionId/upload",
        async ({ request, params, env, ctx }) => {
          console.log("Uploading file for question", params.id);
          if (
            request.method !== "POST" &&
            !request.headers
              .get("content-type")
              ?.includes("multipart/form-data")
          ) {
            return new Response("Method not allowed", { status: 405 });
          }

          console.log("Uploading file for question", params.id);

          const formData = await request.formData();
          const file = formData.get("file") as File;

          // Stream the file directly to R2
          const r2ObjectKey = `submissions/${params.id}/questions/${params.questionId}/files/${Date.now()}-${file.name}`;
          await env.R2.put(r2ObjectKey, file.stream(), {
            httpMetadata: {
              contentType: file.type,
            },
          });

          console.log("Updating answer", params.id, "with", r2ObjectKey);

          return new Response(JSON.stringify({ objectKey: r2ObjectKey }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        },
      ),
    ]),
    prefix("/questions", [route<Context>("/:id", QuestionDetail)]),
    prefix("/emails", [
      route<Context>("/", EmailList),
      route<Context>("/new", EmailNew),
      route<Context>("/:id", EmailDetail),
    ]),
  ]),
  route("/wizard/start", [WizardStart]),
  route("/api/submissions/:id/questions", async ({ params }) => {
    const submission = await db.submission.findUnique({
      where: { id: params.id },
      include: { questionSet: { include: { questions: true } } },
    });
    return new Response(JSON.stringify(submission.questionSet.questions));
  }),
  route(
    "/api/submissions/:submissionId/answers/:questionId",
    async ({ params }) => {
      const answer = await db.answer.findUnique({
        where: {
          submissionId_questionId: {
            submissionId: params.submissionId,
            questionId: params.questionId,
          },
        },
      });
      return new Response(JSON.stringify({ value: answer?.answerText }), {
        headers: { "Content-Type": "application/json" },
      });
    },
  ),
  route("/api/submissions/:id/complete", async ({ params }) => {
    try {
      await db.submission.update({
        where: { id: params.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        },
      });

      //here i want to query all the submission's questions and answers
      const submission = await db.submission.findUnique({
        where: { id: params.id },
        include: {
          questionSet: {
            include: {
              questions: {
                include: { answers: { include: { question: true } } },
              },
            },
          },
        },
      });

      // the save to submission.raw the questions and answers as json
      await db.submission.update({
        where: { id: params.id },
        data: {
          raw: submission,
        },
      });

      return new Response(null, { status: 200 });
    } catch (error) {
      console.error("Error completing submission", error);
      return new Response("Error completing submission", { status: 500 });
    }
  }),
  route("/api/emails", async ({ request, env }) => {
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { content } = await request.json();

      const info = await emailInfo(content);

      // get first question set
      const questionSet = await db.questionSet.findFirst({
        where: {
          isActive: true,
        },
      });

      // Create both emailSubmission and submission in a single operation
      const emailSubmission = await db.emailSubmission.create({
        data: {
          content,
          summary: info.summary,
          submission: {
            create: {
              user: {
                connectOrCreate: {
                  where: { email: info.sender.email },
                  create: { email: info.sender.email },
                },
              },
              questionSet: {
                connect: {
                  id: questionSet.id,
                },
              },
              status: "COMPLETED",
              completedAt: new Date(),
            },
          },
        },
        include: {
          submission: true,
        },
      });

      await env.QUEUE.send({
        version: "2025-02-26",
        action: "download",
        emailSubmissionId: emailSubmission.id,
      });

      return new Response(JSON.stringify(emailSubmission), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error creating email submission:", error);
      return new Response("Error creating email submission", { status: 500 });
    }
  }),
]);

export default {
  fetch: app.fetch,
  async scheduled(event, env, ctx) {
    console.log("cron event", event);
    // Write code for updating your API
    switch (event.cron) {
      case "1 * * * *":
        // Every one minutes
        console.log("Every one minutes");
        break;
      case "*/2 * * * *":
        // Every two minutes
        console.log("Every two minutes");
        break;
      case "*/3 * * * *":
        // Every three minutes
        console.log("Every three minutes");
        break;
    }
    console.log("cron processed");
  },
  async queue(batch: any, env: Env): Promise<void> {
    await setupDb(env);
    for (const message of batch.messages) {
      if (message.body.action === "download") {
        console.log("Sleeping for 20 seconds");
        await new Promise((resolve) => setTimeout(resolve, 20000));
        console.log("Downloading message", message);
        // sleep for 20 seconds
        await new Promise((resolve) => setTimeout(resolve, 20000));
        console.log("Downloaded message", message);
      }
    }
  },
} satisfies ExportHandler<Env>;
