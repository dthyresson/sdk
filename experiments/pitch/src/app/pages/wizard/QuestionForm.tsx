"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { saveAnswer } from "./functions";
// @ts-ignore
import type { Question } from "@prisma/client";
import { Label } from "@/app/components/ui/label";
import { Skeleton } from "@/app/components/ui/skeleton";
import { link } from "src/shared/links";

interface QuestionFormProps {
  question: Question;
  submissionId: string;
  onComplete: () => void;
  isLastQuestion?: boolean;
}

export function QuestionForm({
  question,
  submissionId,
  onComplete,
  isLastQuestion = false,
}: QuestionFormProps) {
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadExistingAnswer() {
      setIsLoading(true);
      setValue(""); // Clear any previous value
      try {
        const response = await fetch(
          `/api/submissions/${submissionId}/answers/${question.id}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.value) {
            setValue(data.value);
          }
        }
      } catch (error) {
        console.error("Failed to load answer:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadExistingAnswer();
  }, [question.id, submissionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await saveAnswer({
        submissionId,
        questionId: question.id,
        value,
        type: question.questionType,
      });
      setValue(""); // Clear the form after successful save
      onComplete();
    } catch (error) {
      console.error("Failed to save answer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = () => {
    const inputElement = (() => {
      switch (question.questionType) {
        case "TEXT":
          return (
            <Input
              placeholder={question.placeholder || "Enter your answer"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          );

        case "TEXT_AREA":
          return (
            <Textarea
              placeholder={question.placeholder || "Enter your answer"}
              value={value}
              rows={12}
              onChange={(e) => setValue(e.target.value)}
            />
          );

        case "BOOLEAN":
          return (
            <div className="flex gap-4">
              <Button
                variant={value === "true" ? "default" : "outline"}
                onClick={() => setValue("true")}
              >
                Yes
              </Button>
              <Button
                variant={value === "false" ? "default" : "outline"}
                onClick={() => setValue("false")}
              >
                No
              </Button>
            </div>
          );

        case "PHONE":
          return (
            <Input
              type="tel"
              placeholder="555-867-5309"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          );

        case "URL":
          return (
            <Input
              type="url"
              placeholder="https://example.com"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          );

        case "FILE":
          return (
            <div>
              <Input
                type="file"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Set a temporary value to enable the button while uploading
                    setValue("uploading");

                    // Create a FormData object to upload the file
                    const formData = new FormData();
                    // add question id
                    formData.append("questionId", question.id);
                    // add submission id
                    formData.append("submissionId", submissionId);
                    formData.append("file", file);

                    try {
                      const response = await fetch(
                        link("/submissions/:id/questions/:questionId/upload", {
                          id: submissionId,
                          questionId: question.id,
                        }),
                        {
                          method: "POST",
                          body: formData,
                        },
                      );

                      if (response.ok) {
                        const data = await response.json();
                        // Save the R2 file URL/key instead of just the filename
                        setValue(data.objectKey);
                      } else {
                        console.error("Failed to upload file");
                        // Reset value if upload fails
                        setValue("");
                      }
                    } catch (error) {
                      console.error("Error uploading file:", error);
                      // Reset value if upload fails
                      setValue("");
                    }
                  }
                }}
              />
              {value === "uploading" && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Uploading file...
                </div>
              )}
              {value && value !== "uploading" && (
                <div className="mt-2 text-sm text-green-600">
                  File uploaded successfully
                </div>
              )}
            </div>
          );

        default:
          return (
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
          );
      }
    })();

    return (
      <div className="space-y-2">
        {inputElement}

        {question.isRequired && (
          <Label className="flex justify-end text-destructive ml-1">
            {" "}
            Required *
          </Label>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        renderInput()
      )}
      <Button
        type="submit"
        disabled={
          isSubmitting ||
          (question.isRequired && !value) ||
          (question.questionType === "FILE" && value === "uploading") ||
          isLoading
        }
        className="w-full"
      >
        {isSubmitting ? "Saving..." : isLastQuestion ? "Submit" : "Continue →"}
      </Button>
    </form>
  );
}
