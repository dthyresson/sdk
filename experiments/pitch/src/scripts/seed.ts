// Hint: Seeeding data should look at ./prisma/schema.prisma
import { defineScript } from "@redwoodjs/sdk/worker";
import { db, setupDb } from "../db";
// @ts-ignore
import { QuestionType } from "@prisma/client";
import { startups } from "./data";

export default defineScript(async ({ env }) => {
  try {
    setupDb(env);

    await db.$executeRawUnsafe(`\
      DELETE FROM EmailSubmission;
      DELETE FROM Answer;
      DELETE FROM Question;
      DELETE FROM QuestionSet;
      DELETE FROM Submission;
      DELETE FROM Otp;
      DELETE FROM User;
      DELETE FROM sqlite_sequence;
    `);

    // Create users from startups data
    await db.user.createMany({
      data: startups.map((startup) => ({
        name: startup.name,
        email: `founder@${startup.domain}`,
      })),
    });

    await db.questionSet.create({
      data: {
        name: "Pitch",
        versionNumber: 1,
        isActive: true,
        questions: {
          create: [
            {
              questionText: "What is your name?",
              description: "What should we call you?",
              placeholder: "Hi!",
              hint: "Please provide your full name or how you'd like us to address you.",
              questionType: QuestionType.TEXT,
              questionPosition: 0,
              isRequired: true,
            },
            {
              questionText: "Tell us about your company, product, or idea.",
              description:
                "Provide a clear and concise overview of what you're working on",
              placeholder: "We're working on ...",
              hint: "Give a clear, concise description of what your company does, the problem you're solving, and your solution. Focus on the key aspects of your product or service.",
              questionType: QuestionType.TEXT_AREA,
              questionPosition: 1,
              isRequired: true,
            },
            {
              questionText: "Where are you based?",
              description:
                "Do you have a physical address? Do you have a US entity?",
              placeholder: "We're based in ...",
              hint: "Where a company is based is a consideration for us. It's important to know if the copamny is US based or not.",
              questionType: QuestionType.TEXT_AREA,
              questionPosition: 2,
              isRequired: true,
            },
            {
              questionText: "Tell us about yourself and your team.",
              description: "Who are you and why are you working on this?",
              placeholder: "We're a team of ...",
              hint: "Who are you and why did you start this venture? Mention key team members and their roles, and why they are suited for this project.",
              questionType: QuestionType.TEXT_AREA,
              questionPosition: 3,
              isRequired: true,
            },
            {
              questionText: "How far along are you?",
              description:
                "Tell us about your journey so far and how PWV can help. When did you start? Tell us about any customers.",
              placeholder: "We've seen solid traction ...",
              hint: "Share your company's journey to date. When did you launch, and what milestones have you reached? Include any customers, partnerships, or key traction points (e.g., revenue, users, product development stage).",
              questionType: QuestionType.TEXT_AREA,
              questionPosition: 4,
              isRequired: true,
            },
            {
              questionText:
                "Have you raised? If so, from and what were the round and terms?",
              description:
                "If you have raised, please share the details. If not, please share your plans.",
              placeholder: "We're raising a seed round ...",
              hint: "If you have raised capital, provide details on the investors, the funding round, and any key terms. If you haven't raised funds yet, explain your plans for fundraising.",
              questionType: QuestionType.TEXT_AREA,
              questionPosition: 5,
              isRequired: true,
            },
            {
              questionText: "Where can we find you on LinkedIn?",
              description:
                "This helps us connect with you. Or another social profile you'd like to share.",
              placeholder: "https://linkedin.com/in/...",
              hint: "This helps us connect with you professionally. Feel free to share any other social profiles (e.g., Twitter, GitHub) that can help us learn more about you and your team.",
              questionType: QuestionType.URL,
              questionPosition: 6,
              isRequired: false,
            },
            {
              questionText:
                "Feel free to share your website here if you have one.",
              description:
                "We know you might still be in stealth mode, but if you have a website, we'd love to see it.",
              placeholder: "https://...",
              hint: "If your company has a website, please include the URL. If you are in stealth mode, that's okay, just let us know.",
              questionType: QuestionType.URL,
              questionPosition: 7,
              isRequired: false,
            },
            {
              questionText: "How did you hear about PWV?",
              description:
                "Who do you know that we might know? Were you referred by someone?",
              hint: "Let us know how you came across PWV. Were you referred by someone we know, or did you find us through another channel?",
              questionType: QuestionType.TEXT_AREA,
              questionPosition: 8,
              isRequired: true,
            },
            {
              questionText:
                "Please attach any supporting files, like a pitchdeck, demo, etc.",
              description:
                "We'll use this to help us understand your company better. Videos are great too!",
              hint: "Any additional files that help us understand your company, such as a pitch deck, product demo, or videos, are extremely helpful in our evaluation.",
              questionType: QuestionType.FILE,
              questionPosition: 9,
              isRequired: true,
            },
            {
              questionText: "What else should we know?",
              description:
                "Anything else you'd like to share with us to help us understand your company better.",
              placeholder: "Also, we're ...",
              hint: "Look for additional details or context that can help inform our decision. This could include unique aspects of the business, competitive advantages, or any other important information that hasn't been covered yet, such as future plans, partnerships, or why the request is a strong fit for investment.",
              questionType: QuestionType.TEXT_AREA,
              questionPosition: 10,
              isRequired: false,
            },
          ],
        },
      },
    });

    // const questionSet = await db.questionSet.findFirst({
    //   where: { name: "Pitch", versionNumber: 1 },
    //   include: { questions: true },
    // });

    // if (!questionSet) {
    //   throw new Error("QuestionSet not found");
    // }

    // // Create submissions for each startup
    // for (const startup of startups) {
    //   // find user by email
    //   const user = await db.user.findFirst({
    //     where: { email: `founder@${startup.domain}` },
    //   });

    //   if (!user) {
    //     throw new Error(`User not found for ${startup.name}`);
    //   }

    //   await db.submission.create({
    //     data: {
    //       userId: user.id,
    //       questionSetId: questionSet.id,
    //       status: "COMPLETED",
    //       answers: {
    //         create: questionSet.questions.map((question: any) => {
    //           let answerContent = "";

    //           // Find the submission answer for this question position
    //           const submissionAnswer = startup.submission?.find(
    //             (q) => q.questionPosition === question.questionPosition,
    //           )?.answer;

    //           // Set answer content based on question position first
    //           switch (question.questionPosition) {
    //             case 0: // Name
    //               answerContent = submissionAnswer || startup.name;
    //               break;
    //             case 1: // Company description
    //               answerContent =
    //                 submissionAnswer ||
    //                 `${startup.name} is innovating in the ${startup.sector} space.`;
    //               break;
    //             case 2: // About founder
    //               answerContent =
    //                 submissionAnswer ||
    //                 `Experienced founder with background in ${startup.sector}.`;
    //               break;
    //             case 3: // Progress
    //               answerContent =
    //                 submissionAnswer ||
    //                 "Early stage startup with MVP in development.";
    //               break;
    //             case 4: // Have you raised outside capital?
    //               answerContent = submissionAnswer
    //                 ? String(submissionAnswer === "Yes")
    //                 : "false";
    //               break;
    //             case 5: // Funding details
    //               answerContent = submissionAnswer || "";
    //               break;
    //             case 6: // LinkedIn URL
    //               answerContent =
    //                 submissionAnswer ||
    //                 `https://linkedin.com/in/${startup.name.toLowerCase().replace(/\s+/g, "-")}`;
    //               break;
    //             case 7: // Website URL
    //               answerContent = submissionAnswer
    //                 ? `https://${submissionAnswer}`
    //                 : `https://${startup.domain}`;
    //               break;
    //             case 8: // How heard about PWV
    //               answerContent = submissionAnswer || "";
    //               break;
    //             case 9: // Pitch deck file
    //               answerContent =
    //                 submissionAnswer ||
    //                 `${startup.name.toLowerCase().replace(/\s+/g, "-")}-deck.pdf`;
    //               break;
    //             case 10: // Company category
    //               answerContent = submissionAnswer || startup.sector;
    //               break;
    //             case 11: // Referral
    //               answerContent = submissionAnswer || "";
    //               break;
    //           }

    //           // Return the answer in the correct format based on question type
    //           return {
    //             questionId: question.id,
    //             ...(question.questionType === QuestionType.TEXT && {
    //               answerText: answerContent,
    //             }),
    //             ...(question.questionType === QuestionType.BOOLEAN && {
    //               answerBoolean: answerContent === "true" ? 1 : 0,
    //             }),
    //             ...(question.questionType === QuestionType.URL && {
    //               url: answerContent,
    //             }),
    //             ...(question.questionType === QuestionType.FILE && {
    //               fileUrl: answerContent,
    //             }),
    //           };
    //         }),
    //       },
    //     },
    //   });
    // }

    console.log("🌱 Finished seeding successfully");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
});
