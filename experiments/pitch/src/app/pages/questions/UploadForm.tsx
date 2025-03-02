"use client";
import { link } from "src/shared/links";

export function UploadForm({
  questionId,
}: {
  questionId: string;
}) {
  return (
    <div className="flex p-2 border border-gray-200 print:hidden">
      <input
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const formData = new FormData();
          formData.append("file", file);

          try {
            const response = await fetch(
              link("/questions/:id/upload", { id: questionId }),
              {
                method: "POST",
                body: formData,
              },
            );

            if (!response.ok) {
              throw new Error("Upload failed");
            }
            const data = (await response.json()) as { key: string };
          } catch (error) {
            console.error("Error uploading file:", error);
          }
        }}
      />
    </div>
  );
}
