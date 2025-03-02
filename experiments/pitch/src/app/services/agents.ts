import { db } from "@/db";
import { langbase } from "@/langbase";

export async function pitchRequestSummarizer(
  submissionId: string,
  content: string,
) {
  const submission = await db.submission.findUnique({
    include: {
      questionSet: {
        include: {
          questions: { orderBy: { questionPosition: "asc" } },
        },
      },
    },
    where: {
      id: submissionId,
    },
  });

  const questions = submission?.questionSet?.questions
    .map(
      (q: any) =>
        `${q.questionPosition + 1}. ${q.questionText}. \n * Hint: ${q.hint}`,
    )
    .join("\n");

  const completion = await langbase.pipe.run({
    messages: [{ role: "user", content: "" }],
    variables: [
      {
        name: "REQUEST",
        value: content,
      },
      {
        name: "QUESTIONS",
        value: questions,
      },
    ],
    stream: false,
    name: "ai-agent-pitch-request-summarizer",
  });

  return completion.choices[0].message.content;
}

interface EmailParticipant {
  name: string;
  email: string;
  company?: string;
}

interface EmailInformation {
  sender: EmailParticipant;
  recipient: EmailParticipant;
  date: string;
  subject: string;
  summary: string;
}

export async function emailInfo(content: string): Promise<EmailInformation> {
  const completion = await langbase.pipe.run({
    messages: [{ role: "user", content: "" }],
    variables: [
      {
        name: "EMAIL_CONTENT",
        value: content,
      },
    ],
    stream: false,
    name: "ai-agent-email-info",
  });

  if (!completion.choices[0].message.content) {
    throw new Error("No content returned");
  }

  return JSON.parse(completion.choices[0].message.content) as EmailInformation;
}
