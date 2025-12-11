import {
  Controller,
  Post,
  Param,
  Body,
  Res,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Get,
  Put,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { AlumnosService } from './alumnos.service';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';

@Controller('alumnos')
export class AlumnosController {
  constructor(private readonly alumnosService: AlumnosService) { }

  // --- Endpoints existentes ---

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAlumnoDto: CreateAlumnoDto) {
    return this.alumnosService.create(createAlumnoDto);
  }

  @Get()
  findAll() {
    return this.alumnosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.alumnosService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateAlumnoDto: UpdateAlumnoDto) {
    return this.alumnosService.update(+id, updateAlumnoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.alumnosService.remove(+id);
  }

  @Post(':id/email')
  async sendEmail(@Param('id') id: string) {
    return this.alumnosService.enviarNotificacion(+id);
  }

  @Post(':id/session/login')
  async login(@Param('id') id: string, @Body('password') password: string) {
    return this.alumnosService.login(+id, password);
  }

  @Post(':id/session/verify')
  async verify(
    @Body('sessionString') sessionString: string,
    @Res() res: Response,
  ) {
    try {
      await this.alumnosService.verifySession(sessionString);
      return res.status(HttpStatus.OK).json({ valid: true });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ valid: false });
    }
  }

  @Post(':id/session/logout')
  async logout(@Body('sessionString') sessionString: string) {
    return this.alumnosService.logout(sessionString);
  }

  // --- NUEVO ENDPOINT S3 ---

  @Post(':id/fotoPerfil')
  @UseInterceptors(FileInterceptor('foto')) // 'foto' debe coincidir con .multiPart("foto", ...) del test
  async uploadFoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.alumnosService.uploadProfilePicture(+id, file);
  }

  @Delete()
  @HttpCode(HttpStatus.METHOD_NOT_ALLOWED)
  deleteBase() {
    return;
  }
}
