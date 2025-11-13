import { IsString, IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CreateAlumnoDto {
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsString()
  @IsNotEmpty()
  matricula: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  promedio: number;
}
