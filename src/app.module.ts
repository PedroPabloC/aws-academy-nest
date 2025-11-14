import { Module } from '@nestjs/common';
import { AlumnosModule } from './alumnos/alumnos.module';
import { ProfesoresModule } from './profesores/profesores.module';

@Module({
  imports: [AlumnosModule, ProfesoresModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
