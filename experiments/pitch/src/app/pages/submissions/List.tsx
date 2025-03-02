import { RouteContext } from "@redwoodjs/sdk/router";
import { getLatestSubmissions } from "@/app/services/submissions";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/app/components/ui/table";
import { link } from "@/app/shared/links";
import { formatDistanceToNow, format, differenceInHours } from "date-fns";
import { cn } from "@/app/lib/utils";
import type { Context } from "@/worker";

const SubmissionStatus = ({ status }: { status: string }) => (
  <span
    className={cn(
      "inline-block px-2 py-1 text-sm font-medium rounded-md",
      status === "COMPLETED" && "bg-green-500 text-green-50",
      status === "IN_PROGRESS" && "bg-yellow-500 text-yellow-50",
      "bg-blue-500 text-blue-50", // default state
    )}
  >
    {status
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ")}
  </span>
);

export async function List({ ctx }: { ctx: Context }) {
  const submissions = await getLatestSubmissions();

  return (
    <div className="max-w-auto mx-auto p-6">
      <nav className="flex gap-2 mb-6 items-center">
        <a href={link("/")} className="hover:underline">
          Home
        </a>
        <div className="h-4 w-px bg-gray-300"></div>
        <a href={link("/submissions")} className="hover:underline">
          Requests to Pitch {ctx?.session?.userId}
        </a>
      </nav>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Requests to Pitch</h1>
        <div className="flex gap-2">
          <a
            href={link("/wizard/start")}
            className="bg-blue-500 text-white rounded-md p-2"
          >
            New Request
          </a>
          <a
            href={link("/emails/new")}
            className="bg-blue-500 text-white rounded-md p-2"
          >
            New Email
          </a>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>By</TableHead>
            <TableHead>Request</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission: any) => (
            <TableRow key={submission.id}>
              <TableCell>
                <a
                  className="underline-offset-4 hover:underline"
                  href={link(
                    submission.emailSubmission
                      ? "/emails/:id"
                      : "/submissions/:id",
                    { id: submission.emailSubmission?.id || submission.id },
                  )}
                >
                  {submission.user.email || submission.user.email}
                </a>
              </TableCell>
              <TableCell>
                {submission.emailSubmission ? "Email" : "Questionnaire"}
              </TableCell>
              <TableCell>{submission.questionSet.name}</TableCell>
              <TableCell>
                {(() => {
                  const date = new Date(submission.createdAt);
                  return differenceInHours(new Date(), date) > 24
                    ? format(date, "MMM d, yyyy h:mm a")
                    : formatDistanceToNow(date, { addSuffix: true });
                })()}
              </TableCell>
              <TableCell>
                {(() => {
                  const date = new Date(submission.updatedAt);
                  return differenceInHours(new Date(), date) > 24
                    ? format(date, "MMM d, yyyy h:mm a")
                    : formatDistanceToNow(date, { addSuffix: true });
                })()}
              </TableCell>
              <TableCell>
                <SubmissionStatus status={submission.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
