import { Module } from '@nestjs/common';
import { ProfesoresService } from './profesores.service';
import { ProfesoresController } from './profesores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profesor } from './entities/profesor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profesor])],
  controllers: [ProfesoresController],
  providers: [ProfesoresService],
})
export class ProfesoresModule {}
