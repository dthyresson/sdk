"use client";

import React, { useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { updateAnswer } from "@/app/services/submissions";
import { Toaster } from "@/app/components/ui/sonner";
import { toast } from "sonner";

export function AnswerForm({
  submissionId,
  answerId,
  questionText,
  answerText,
}: {
  submissionId: string;
  answerId: string;
  questionText: string;
  answerText: string;
}) {
  const [theAnswerText, setTheAnswerText] = useState(answerText || "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!theAnswerText) return;

    setIsSaving(true);
    try {
      await updateAnswer(answerId, theAnswerText);
      toast.success("Answer saved successfully", {
        description: `Answer updated from "${answerText}" to "${theAnswerText}"`,
      });
      // timeout to allow toast to appear
      setTimeout(() => {
        window.location.href = `/submissions/${submissionId}`;
      }, 1000);
    } catch (error) {
      console.error("Failed to update answer:", error);
      toast.error("Failed to save answer");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Toaster />
      <Card>
        <CardHeader>
          <CardTitle>Question</CardTitle>
          <p className="mt-2 text-gray-600">{questionText}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="answer" className="block mb-2 font-medium">
                Answer
              </label>
              <Input
                id="answer"
                value={theAnswerText}
                onChange={(e) => setTheAnswerText(e.target.value)}
              />
            </div>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </form>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </>
  );
}
