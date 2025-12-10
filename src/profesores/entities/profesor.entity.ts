import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profesor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  numeroEmpleado: number;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column()
  horasClase: number;
}
