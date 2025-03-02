"use server";

import { db } from "@/db";

export async function getSubmission(id: string) {
  return await db.submission.findUnique({
    where: { id },
    include: {
      user: true,
      questionSet: true,
      answers: {
        include: {
          question: true,
        },
      },
    },
  });
}

export async function allSubmissions() {
  return await db.submission.findMany({
    omit: {
      raw: true,
      enriched: true,
    },
    include: {
      user: true,
      questionSet: true,
      answers: {
        include: {
          question: true,
        },
      },
    },
  });
}

export async function getLatestSubmissions() {
  return await db.submission.findMany({
    omit: {
      raw: true,
      enriched: true,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      user: true,
      questionSet: true,
      emailSubmission: true,
      answers: {
        include: { question: true },
      },
    },
  });
}

export async function getAnswer(id: string) {
  return await db.answer.findUnique({
    where: { id },
    include: {
      question: true,
      submission: true,
    },
  });
}

export async function updateAnswer(id: string, answerText: string) {
  const answer = await db.answer.update({
    where: { id },
    data: { answerText },
  });

  const submission = await db.submission.update({
    where: { id: answer.submissionId },
    data: { updatedAt: new Date() },
  });

  await db.submission.update({
    where: { id: answer.submissionId },
    data: { updatedAt: new Date() },
  });
  return answer;
}
