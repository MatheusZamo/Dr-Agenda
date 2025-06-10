"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { clinicsTable, usersToClinicsTable } from "@/db/schema";
import { protectedActionClient } from "@/lib/next-safe-action";

export const createClinic = protectedActionClient
  .schema(
    z.object({
      name: z.string().min(1, {
        message: "Nome é obrigatório.",
      }),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const [clinic] = await db
      .insert(clinicsTable)
      .values({
        name: parsedInput.name,
      })
      .returning();

    await db.insert(usersToClinicsTable).values({
      userId: ctx.user.id,
      clinicId: clinic.id,
    });

    revalidatePath("/dashboard");
  });
