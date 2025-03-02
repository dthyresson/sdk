"use server";

import { db } from "@/db";

export async function getQuestion(id: string) {
  return db.question.findUnique({ where: { id } });
}
