import { NotFoundError } from "../errors/index.js";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  workoutPlanId: string;
  workoutDayId: string;
  sessionId: string;
  finishedAt: string;
}

interface OutputDto {
  id: string;
  startedAt: string;
  finishedAt: string;
}

export class UpdateWorkoutSession {
  async execute(dto: InputDto): Promise<OutputDto> {
    const workoutPlan = await prisma.workoutPlan.findUnique({
      where: { id: dto.workoutPlanId },
    });

    if (!workoutPlan || workoutPlan.userId !== dto.userId) {
      throw new NotFoundError("Workout plan not found");
    }

    const workoutDay = await prisma.workoutDay.findUnique({
      where: { id: dto.workoutDayId, workoutPlanId: dto.workoutPlanId },
    });

    if (!workoutDay) {
      throw new NotFoundError("Workout day not found");
    }

    const session = await prisma.workoutSession.findUnique({
      where: { id: dto.sessionId, workoutDayId: dto.workoutDayId },
    });

    if (!session) {
      throw new NotFoundError("Workout session not found");
    }

    const updatedSession = await prisma.workoutSession.update({
      where: { id: dto.sessionId },
      data: { finishedAt: new Date(dto.finishedAt) },
    });

    return {
      id: updatedSession.id,
      startedAt: updatedSession.startedAt.toISOString(),
      finishedAt: updatedSession.finishedAt!.toISOString(),
    };
  }
}
