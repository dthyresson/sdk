import { db } from "@/db";
import { link } from "@/app/shared/links";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/app/components/ui/table";
import { formatDistanceToNow } from "date-fns";

export async function List() {
  const emails = await db.emailSubmission.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-auto mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email Submissions</h1>
        <a
          className="bg-blue-500 text-white rounded-md p-2"
          href={link("/emails/new")}
        >
          New Email
        </a>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Summary</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails?.map((email: any) => (
            <TableRow key={email.id}>
              <TableCell>
                <a
                  href={link("/emails/:id", { id: email.id })}
                  className="text-blue-600 hover:underline"
                >
                  {email.summary || email.id}
                </a>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(email.createdAt), {
                  addSuffix: true,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
