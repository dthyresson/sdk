"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { QuestionForm } from "./QuestionForm";
import { toast } from "sonner";

interface QuestionWizardProps {
  submissionId: string;
  currentQuestionIndex: number;
  questions: any[]; // Update this type to match your Question type
}

export function QuestionWizard({
  submissionId,
  currentQuestionIndex,
  questions,
}: QuestionWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(currentQuestionIndex);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!questions?.length) return <div>No questions found</div>;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleNext = async () => {
    if (isLastQuestion) {
      // disable button
      setIsSubmitting(true);
      toast.loading("Completing submission...");
      // Complete submission
      const response = await fetch(
        `/api/submissions/${submissionId}/complete`,
        {
          method: "POST",
        },
      );

      if (response.ok) {
        toast.success("Thank you for your submission!");
        setTimeout(() => {
          window.location.href = `/submissions/${submissionId}`;
        }, 1000);
      } else {
        toast.error("Failed to complete submission");
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen md:flex md:items-center md:justify-center p-4">
      <div className="container max-w-2xl w-full">
        {!isSubmitting ? (
          <Card>
            <CardHeader>
              <div className="text-sm text-muted-foreground">
                Question {currentIndex + 1} of {questions.length}
                {questions.length - currentIndex <= 3 && (
                  <span className="ml-2">
                    {questions.length - currentIndex === 3 &&
                      "- Just 3 more to go!"}
                    {questions.length - currentIndex === 2 &&
                      "- Almost there, 2 to go!"}
                    {questions.length - currentIndex === 1 && "- Last one!"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <h2 className="text-2xl font-bold">
                  {currentQuestion.questionText}
                </h2>
              </div>
              {currentQuestion.description && (
                <p className="text-muted-foreground">
                  {currentQuestion.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <QuestionForm
                question={currentQuestion}
                submissionId={submissionId}
                onComplete={handleNext}
                isLastQuestion={isLastQuestion}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
              >
                Previous
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-4">Submitting...</div>
          </div>
        )}
      </div>
    </div>
  );
}
