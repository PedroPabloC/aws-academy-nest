import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Alumno {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombres: string;

  @Column()
  apellidos: string;

  @Column()
  matricula: string;

  @Column()
  promedio: number;

  @Column({ nullable: true })
  fotoPerfilUrl: string;

  @Column({ nullable: true })
  password: string;
}