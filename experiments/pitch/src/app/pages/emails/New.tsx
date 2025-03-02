"use client";

import { useState } from "react";
import { db } from "@/db";
import { link } from "@/app/shared/links";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { toast } from "sonner";

export function New() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
        }),
      });

      if (!response.ok) {
        // Get error message from response if available
        const errorData = await response.text();
        throw new Error(`Failed to create email submission: ${errorData}`);
      }

      const data = await response.json();
      console.log("Created email submission:", data); // Add logging

      toast.success("Email submission created successfully");
      window.location.href = link("/emails");
    } catch (error) {
      console.error("Error creating email submission:", error);
      toast.error(`Failed to create email submission`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <nav className="flex gap-2 mb-6 items-center">
        <a href={link("/emails")} className="hover:underline">
          Emails
        </a>
        <div className="h-4 w-px bg-gray-300"></div>
        <span>New Email Submission</span>
      </nav>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <h1 className="text-2xl font-bold">New Email Submission</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Email Submission"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
