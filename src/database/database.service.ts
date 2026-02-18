// prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'src/generated/prisma/client';

@Injectable()
export class DatabaseService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private pool: Pool;

    constructor(private config: ConfigService) {
        // Создаем пул соединений pg
        const connectionString = config.getOrThrow<string>('DATABASE_URL');
        const pool = new Pool({ connectionString });
        // Оборачиваем его в адаптер Prisma
        const adapter = new PrismaPg(pool);

        // Передаем адаптер в родительский класс PrismaClient
        super({ adapter });
        this.pool = pool;
    }

    async onModuleInit() {
        // Устанавливаем соединение при старте модуля
        await this.$connect();
    }

    async onModuleDestroy() {
        // Корректно закрываем всё при выключении
        await this.$disconnect();
        await this.pool.end();
    }
}
