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
} from '@nestjs/common';
import { AlumnosService } from './alumnos.service';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('alumnos')
export class AlumnosController {
  constructor(private readonly alumnosService: AlumnosService) { }

  // --- Endpoints existentes ---

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.alumnosService.findOne(+id);
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
}
