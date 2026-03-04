import dayjs from "dayjs";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
  weightInGrams: number;
  heightInCentimeters: number;
  birthDate: string;
  bodyFatPercentage: number;
}

interface OutputDto {
  userId: string;
  weightInGrams: number;
  heightInCentimeters: number;
  birthDate: string;
  bodyFatPercentage: number;
}

export class UpsertUserTrainData {
  async execute(dto: InputDto): Promise<OutputDto> {
    const user = await prisma.user.update({
      where: { id: dto.userId },
      data: {
        weightInGrams: dto.weightInGrams,
        heightInCentimeters: dto.heightInCentimeters,
        birthDate: new Date(dto.birthDate),
        bodyFatPercentage: dto.bodyFatPercentage,
      },
    });

    return {
      userId: user.id,
      weightInGrams: user.weightInGrams!,
      heightInCentimeters: user.heightInCentimeters!,
      birthDate: dayjs.utc(user.birthDate).format("YYYY-MM-DD"),
      bodyFatPercentage: user.bodyFatPercentage!,
    };
  }
}
