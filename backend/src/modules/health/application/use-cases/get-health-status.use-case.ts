import { Injectable } from '@nestjs/common';
import { HealthStatus } from '@modules/health/domain/health-status';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

@Injectable()
export class GetHealthStatusUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(): Promise<HealthStatus> {
    await this.prismaService.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      service: 'app-finanzas-backend',
      database: 'connected'
    };
  }
}
