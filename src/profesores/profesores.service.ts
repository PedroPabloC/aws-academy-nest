// src/profesores/profesores.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { UpdateProfesorDto } from './dto/update-profesor.dto';
import { Profesor } from './entities/profesor.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ProfesoresService {
  private profesores: Profesor[] = [];

  create(createProfesorDto: CreateProfesorDto) {
    const newProfesor: Profesor = {
      id: createProfesorDto.id || uuid(),
      nombres: createProfesorDto.nombres,
      apellidos: createProfesorDto.apellidos,
      numeroEmpleado: createProfesorDto.numeroEmpleado,
      horasClase: createProfesorDto.horasClase,
    };
    this.profesores.push(newProfesor);
    return newProfesor;
  }

  findAll() {
    return this.profesores;
  }

  findOne(id: string) {
    const profesor = this.profesores.find((p) => p.id === id);
    if (!profesor) {
      throw new NotFoundException(`Profesor con id ${id} no encontrado`);
    }
    return profesor;
  }

  update(id: string, updateProfesorDto: UpdateProfesorDto) {
    const profesor = this.findOne(id);
    const index = this.profesores.findIndex((p) => p.id === id);
    const profesorActualizado = { ...profesor, ...updateProfesorDto };
    this.profesores[index] = profesorActualizado;
    return profesorActualizado;
  }

  remove(id: string) {
    const profesor = this.findOne(id);
    this.profesores = this.profesores.filter((p) => p.id !== id);
  }
}
