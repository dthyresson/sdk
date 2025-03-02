"use server";

import { db } from "@/db";
// @ts-ignore
import { QuestionType } from "@prisma/client";

interface SaveAnswerParams {
  submissionId: string;
  questionId: string;
  value: string;
  type: QuestionType;
}

export async function saveAnswer({
  submissionId,
  questionId,
  value,
  type,
}: SaveAnswerParams) {
  const data: any = {};

  switch (type) {
    case "TEXT":
    case "TEXT_AREA":
      data.answerText = value;
      break;
    case "BOOLEAN":
      data.answerBoolean = value === "true" ? 1 : 0;
      break;
    case "NUMBER":
      data.answerNumber = parseFloat(value);
      break;
    case "FILE":
      data.fileUrl = value;
      break;
    case "DATE":
      data.answerDate = new Date(value);
      break;
    case "DATETIME":
      data.answerDatetime = new Date(value);
      break;
    case "PHONE":
      data.phone = value;
      break;
    case "CURRENCY":
      // Assuming currency value is sent as a number string
      data.answerCurrency = parseFloat(value);
      data.currencyType = "USD";
      // Note: You might want to add currencyType handling if it's sent separately
      break;
    case "URL":
      data.url = value;
      break;
  }

  return db.answer.upsert({
    where: {
      submissionId_questionId: {
        submissionId,
        questionId,
      },
    },
    create: {
      submissionId,
      questionId,
      ...data,
    },
    update: {
      ...data,
    },
  });
}

export async function completeSubmission(submissionId: string) {
  return db.submission.update({
    where: { id: submissionId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });
}
