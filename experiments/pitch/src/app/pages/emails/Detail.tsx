"use server";

import { Suspense } from "react";
import { db } from "@/db";
import { link } from "@/app/shared/links";
import { Card, CardHeader, CardContent } from "@/app/components/ui/card";
import { RouteContext } from "@redwoodjs/sdk/router";
// import { PitchRequestSummary } from "@/app/pages/submissions/PitchRequestSummary";
import { pitchRequestSummarizer } from "@/app/services/agents";

// The component can now be async
const SummaryDisplay = async ({
  emailSubmission,
}: {
  emailSubmission: any;
}) => {
  const summary = await pitchRequestSummarizer(
    emailSubmission.submission.id,
    emailSubmission.content,
  );

  return (
    <div className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
      {summary}
    </div>
  );
};

export async function Detail({ params }: RouteContext<{ id: string }>) {
  const emailSubmission = await db.emailSubmission.findUnique({
    include: {
      submission: {
        include: {
          user: true,
        },
      },
    },
    where: { id: params.id },
  });

  if (!emailSubmission) {
    return <div>Email submission not found</div>;
  }

  return (
    <div className="max-w-auto mx-auto p-6">
      <nav className="flex gap-2 mb-6 items-center">
        <a href={link("/")} className="hover:underline">
          Pith Requests
        </a>
        <a href={link("/emails")} className="hover:underline">
          Emails
        </a>
        <div className="h-4 w-px bg-gray-300"></div>
        <span>View</span>
      </nav>

      <Card>
        <CardHeader>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Email Submission</h1>
            <h2 className="text-xl text-gray-500">{emailSubmission.summary}</h2>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p>From: {emailSubmission.submission.user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Analysis</h3>
                <Suspense fallback={<div>Agents are working...</div>}>
                  {/* @ts-expect-error Async Server Component */}
                  <SummaryDisplay emailSubmission={emailSubmission} />
                </Suspense>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Original Email</h2>
                <pre className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
                  {emailSubmission.content}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
