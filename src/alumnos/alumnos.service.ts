import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { Alumno } from './entities/alumno.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AlumnosService {
  private alumnos: Alumno[] = [];

  create(createAlumnoDto: CreateAlumnoDto) {
    const newAlumno: Alumno = {
      // Si el DTO trae un ID, úsalo. Si no, genera uno.
      id: createAlumnoDto.id || uuid(),
      nombres: createAlumnoDto.nombres,
      apellidos: createAlumnoDto.apellidos,
      matricula: createAlumnoDto.matricula,
      promedio: createAlumnoDto.promedio,
    };
    this.alumnos.push(newAlumno);
    return newAlumno;
  }

  findAll() {
    return this.alumnos;
  }

  findOne(id: string) {
    const alumno = this.alumnos.find((a) => a.id === id);
    if (!alumno) {
      // Esto dispara un 404 Not Found
      throw new NotFoundException(`Alumno con id ${id} no encontrado`);
    }
    return alumno;
  }

  update(id: string, updateAlumnoDto: UpdateAlumnoDto) {
    const alumno = this.findOne(id);
    const index = this.alumnos.findIndex((a) => a.id === id);

    const alumnoActualizado = { ...alumno, ...updateAlumnoDto };
    this.alumnos[index] = alumnoActualizado;

    return alumnoActualizado;
  }

  remove(id: string) {
    const alumno = this.findOne(id);
    this.alumnos = this.alumnos.filter((a) => a.id !== id);
  }
}
