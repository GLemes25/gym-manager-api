import dayjs from "dayjs";
import { prisma } from "../lib/db.js";

interface InputDto {
  userId: string;
}

interface OutputDto {
  userId: string;
  userName: string;
  weightInGrams: number;
  heightInCentimeters: number;
  birthDate: string;
  bodyFatPercentage: number;
}

export class GetUserTrainData {
  async execute(dto: InputDto): Promise<OutputDto | null> {
    const user = await prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      return null;
    }

    if (
      user.weightInGrams === null ||
      user.heightInCentimeters === null ||
      user.birthDate === null ||
      user.bodyFatPercentage === null
    ) {
      return null;
    }

    return {
      userId: user.id,
      userName: user.name,
      weightInGrams: user.weightInGrams,
      heightInCentimeters: user.heightInCentimeters,
      birthDate: dayjs.utc(user.birthDate).format("YYYY-MM-DD"),
      bodyFatPercentage: user.bodyFatPercentage,
    };
  }
}
