import { Module } from '@nestjs/common';
import { AlumnosModule } from './alumnos/alumnos.module';
import { ProfesoresModule } from './profesores/profesores.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    AlumnosModule,
    ProfesoresModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'database-lab.cpuxsdaeysug.us-east-1.rds.amazonaws.com',
      port: 3306,
      username: 'admin',
      password: 'adminPedro',
      database: 'database-lab',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
