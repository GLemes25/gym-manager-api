import z from "zod";

export const WeekDaySchema = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);
export type WeekDayType = z.infer<typeof WeekDaySchema>;
