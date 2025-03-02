import { link } from "src/shared/links";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { format, isToday, isYesterday, differenceInHours } from "date-fns";

export function SubmissionCard({ submission }: { submission: any }) {
  if (!submission) return null;

  const formatDateTime = (date: Date) => {
    const now = new Date();
    const dateObj = new Date(date);
    const hours = differenceInHours(now, dateObj);

    if (hours < 2) {
      return format(dateObj, "'at' p");
    } else if (isToday(dateObj)) {
      return format(dateObj, "'Today at' p");
    } else if (isYesterday(dateObj)) {
      return format(dateObj, "'Yesterday at' p");
    } else {
      return format(dateObj, "EEEE MMM d 'at' p");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <a
          href={link("/submissions/:id", { id: submission.id })}
          className="text-2xl font-medium hover:text-blue-600 transition-colors"
        >
          {submission.user.name} Pitch Request
        </a>
        <div className="flex items-center text-sm text-gray-500">
          <span>
            Submitted {formatDateTime(new Date(submission.updatedAt))}
          </span>
          {submission.status === "COMPLETED" && (
            <>
              <span className="mx-2">•</span>
              <span>
                Completed {formatDateTime(new Date(submission.completedAt))}
              </span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {submission.answers.map((answer: any) => (
          <div
            key={answer.id}
            className="flex flex-col space-y-1 border-b pb-4"
          >
            <div className="flex items-start gap-4">
              <span className="text-sm font-medium text-gray-600 w-6 text-right">
                {answer.question.questionPosition + 1}
              </span>
              <div className="flex-1">
                <span className="text-lg font-bold text-gray-600 block">
                  {answer.question.questionText}
                </span>
                <div className="text-gray-800 whitespace-pre-wrap break-words mt-2">
                  {(() => {
                    switch (answer.question.questionType) {
                      case "TEXT":
                      case "TEXT_AREA":
                        return answer.answerText;
                      case "NUMBER":
                        return answer.answerNumber;
                      case "BOOLEAN":
                        return answer.answerBoolean ? "Yes" : "No";
                      case "CURRENCY":
                        return `${answer.currencyType} ${answer.answerCurrency?.toFixed(2)}`;
                      case "FILE":
                        if (answer.fileUrl) {
                          // also show the file image inline or doc
                          const fileUrl = link("/files/:key", {
                            key: answer.fileUrl,
                          });
                          const fileType = fileUrl.split(".").pop();
                          const isImage =
                            fileType === "png" ||
                            fileType === "jpg" ||
                            fileType === "jpeg" ||
                            fileType === "gif" ||
                            fileType === "webp" ||
                            fileType === "svg" ||
                            fileType === "pdf";
                          return (
                            <>
                              {isImage && (
                                <img
                                  src={fileUrl}
                                  alt="File"
                                  className="w-full object-cover"
                                />
                              )}

                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                Download File
                              </a>
                            </>
                          );
                        }
                      case "DATE":
                        return answer.answerDate
                          ? format(new Date(answer.answerDate), "PP")
                          : null;
                      case "DATETIME":
                        return answer.answerDatetime
                          ? format(new Date(answer.answerDatetime), "PPp")
                          : null;
                      case "PHONE":
                        return answer.phone;
                      case "URL":
                        return answer.url ? (
                          <a
                            href={answer.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {answer.url}
                          </a>
                        ) : null;
                      default:
                        return "Unknown answer type";
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
