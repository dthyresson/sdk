"use client";

import { useState, useEffect } from "react";
// @ts-ignore
import { Question } from "@prisma/client";

export function useQuestionSet(submissionId: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(
          `/api/submissions/${submissionId}/questions`,
        );
        if (!response.ok) throw new Error("Failed to fetch questions");
        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuestions();
  }, [submissionId]);

  return { questions, isLoading, error };
}
