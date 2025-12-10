import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { Alumno } from './entities/alumno.entity';

@Injectable()
export class AlumnosService {
  constructor(
    @InjectRepository(Alumno)
    private alumnosRepository: Repository<Alumno>,
  ) { }

  async create(createAlumnoDto: CreateAlumnoDto): Promise<Alumno> {
    const nuevoAlumno = this.alumnosRepository.create(createAlumnoDto);
    return await this.alumnosRepository.save(nuevoAlumno);
  }

  async findAll(): Promise<Alumno[]> {
    return await this.alumnosRepository.find();
  }

  async findOne(id: number): Promise<Alumno> {
    const alumno = await this.alumnosRepository.findOneBy({ id });
    if (!alumno) {
      throw new NotFoundException(`Alumno con id ${id} no encontrado`);
    }
    return alumno;
  }

  async update(id: number, updateAlumnoDto: any): Promise<Alumno> {
    await this.alumnosRepository.update(id, updateAlumnoDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.alumnosRepository.delete(id);
  }
}