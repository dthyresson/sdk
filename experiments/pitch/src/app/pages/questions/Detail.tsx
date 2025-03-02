import { RouteContext } from "@redwoodjs/sdk/router";
import { getQuestion } from "@/app/pages/questions/functions";
import { link } from "@/app/shared/links";
import { UploadForm } from "./UploadForm";

export async function Detail({ params, ctx }: RouteContext<{ id: string }>) {
  const question = await getQuestion(params.id);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{question.questionText} {question.id}</h1>
      <UploadForm questionId={question.id} />
    </div>
  );
}
