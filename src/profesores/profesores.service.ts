import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { UpdateProfesorDto } from './dto/update-profesor.dto';
import { Profesor } from './entities/profesor.entity';

@Injectable()
export class ProfesoresService {
  constructor(
    @InjectRepository(Profesor)
    private profesoresRepository: Repository<Profesor>,
  ) { }

  async create(createProfesorDto: CreateProfesorDto) {
    const newProfesor = this.profesoresRepository.create(createProfesorDto);
    return await this.profesoresRepository.save(newProfesor);
  }

  async findAll() {
    return await this.profesoresRepository.find();
  }

  async findOne(id: number) {
    const profesor = await this.profesoresRepository.findOneBy({ id });
    if (!profesor) {
      throw new NotFoundException(`Profesor con id ${id} no encontrado`);
    }
    return profesor;
  }

  async update(id: number, updateProfesorDto: UpdateProfesorDto) {
    const profesor = await this.findOne(id);
    const profesorActualizado = { ...profesor, ...updateProfesorDto };
    await this.profesoresRepository.save(profesorActualizado);
    return profesorActualizado;
  }

  async remove(id: number) {
    const profesor = await this.findOne(id);
    await this.profesoresRepository.remove(profesor);
  }
}
