"use client";

import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/app/components/ui/card";
// @ts-ignore
import { Question } from "@prisma/client";
import { useState } from "react";
import { QuestionWizard } from "./QuestionWizard";

interface IntroCardProps {
  questions: Question[];
  submissionId: string;
}

export function IntroCard({ questions, submissionId }: IntroCardProps) {
  const [showIntro, setShowIntro] = useState(true);

  if (!showIntro) {
    return (
      <QuestionWizard
        submissionId={submissionId}
        currentQuestionIndex={0}
        questions={questions}
      />
    );
  }

  return (
    <div className="min-h-screen md:flex md:items-center md:justify-center p-4">
      <div className="container max-w-2xl w-full">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold mb-8">Pitch PWV</h2>
            <p className="text-muted-foreground">
              We'll ask you {questions.length} questions that will help us learn
              more about your startup.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            <ol className="list-decimal list-inside space-y-2">
              {questions.map((question) => (
                <li key={question.id} className="">
                  <p className="font-medium">{question.questionText}</p>
                  <p className="text-muted-foreground">
                    {question.description}
                  </p>
                </li>
              ))}
            </ol>
            <p>
              You can save your progress at any time and continue later and
              should take no more than a few minutes.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setShowIntro(false)}>Start</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
