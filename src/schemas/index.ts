import z from "zod";
import { WeekDaySchema } from "../enums/week-day.enum.js";

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
});

export const WorkoutPlanSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  workoutDays: z.array(
    z.object({
      name: z.string(),
      weekDay: WeekDaySchema,
      isRestDay: z.boolean(),
      estimatedDurationInSeconds: z.number(),
      exercises: z.array(
        z.object({
          order: z.number(),
          name: z.string(),
          sets: z.number(),
          reps: z.number(),
          restTimeInSeconds: z.number(),
        }),
      ),
    }),
  ),
});

export const StartWorkoutSessionSchema = z.object({
  userWorkoutSessionId: z.uuid(),
});

export const UpdateWorkoutSessionBodySchema = z.object({
  finishedAt: z.iso.datetime(),
});

export const UpdateWorkoutSessionSchema = z.object({
  id: z.uuid(),
  startedAt: z.iso.datetime(),
  finishedAt: z.iso.datetime(),
});
