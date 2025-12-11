import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { Alumno } from './entities/alumno.entity';

import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class AlumnosService {
  // Clientes AWS
  private snsClient = new SNSClient({ region: 'us-east-1' });
  private dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
  private docClient = DynamoDBDocumentClient.from(this.dynamoClient);
  private s3Client = new S3Client({ region: 'us-east-1' }); // Cliente S3

  // ⚠️ CONFIGURACIÓN: REEMPLAZA CON TUS DATOS REALES
  private topicArn =
    'arn:aws:sns:us-east-1:TU_CUENTA_ID:NotificacionCalificaciones';
  private bucketName = 'nombre-de-tu-bucket-unico'; // Escribe aquí el nombre de tu bucket S3

  constructor(
    @InjectRepository(Alumno)
    private alumnosRepository: Repository<Alumno>,
  ) { }

  // --- CRUD BÁSICO ---

  async create(createAlumnoDto: CreateAlumnoDto): Promise<Alumno> {
    const nuevoAlumno = this.alumnosRepository.create(createAlumnoDto);
    return await this.alumnosRepository.save(nuevoAlumno);
  }

  async findAll(): Promise<Alumno[]> {
    return await this.alumnosRepository.find();
  }

  async findOne(id: number): Promise<Alumno> {
    const alumno = await this.alumnosRepository.findOneBy({ id });
    if (!alumno)
      throw new NotFoundException(`Alumno con id ${id} no encontrado`);
    return alumno;
  }

  async update(id: number, updateAlumnoDto: any): Promise<Alumno> {
    await this.alumnosRepository.update(id, updateAlumnoDto);
    return this.findOne(id);
  }

  // --- LÓGICA AWS (SNS, DYNAMO, S3) ---

  async enviarNotificacion(id: number) {
    const alumno = await this.findOne(id);
    const mensaje = `Hola ${alumno.nombres}, tus calificaciones están listas.`;

    const command = new PublishCommand({
      TopicArn: this.topicArn,
      Message: mensaje,
      Subject: `Calificaciones UADY`,
    });

    await this.snsClient.send(command);
    return { message: 'Notificación enviada' };
  }

  // CORRECCIÓN PARA PASAR SessionApiTest
  async login(id: number, passwordInput: string) {
    const alumno = await this.findOne(id);

    // Verificamos contra la contraseña REAL del alumno en la BD
    // El test crea un alumno con password y espera que coincida
    if (alumno.password !== passwordInput) {
      throw new BadRequestException('Contraseña incorrecta');
    }

    const sessionId = uuidv4();
    const fecha = Math.floor(Date.now() / 1000);
    // Genera string de 128 caracteres (64 bytes * 2 hex)
    const sessionString = crypto.randomBytes(64).toString('hex');

    const command = new PutCommand({
      TableName: 'sesiones-alumnos',
      Item: {
        id: sessionId,
        fecha: fecha,
        alumnoId: id,
        active: true,
        sessionString: sessionString,
      },
    });

    await this.docClient.send(command);

    return { sessionString };
  }

  async verifySession(sessionString: string) {
    const command = new ScanCommand({
      TableName: 'sesiones-alumnos',
      FilterExpression: 'sessionString = :s',
      ExpressionAttributeValues: { ':s': sessionString },
    });

    const result = await this.docClient.send(command);

    if (result.Items && result.Items.length > 0) {
      const session = result.Items[0];
      if (session.active === true) return { valid: true };
    }

    throw new BadRequestException('Sesión inválida');
  }

  async logout(sessionString: string) {
    const scanCommand = new ScanCommand({
      TableName: 'sesiones-alumnos',
      FilterExpression: 'sessionString = :s',
      ExpressionAttributeValues: { ':s': sessionString },
    });

    const scanResult = await this.docClient.send(scanCommand);

    if (!scanResult.Items || scanResult.Items.length === 0) {
      throw new NotFoundException('Sesión no encontrada');
    }

    const sessionId = scanResult.Items[0].id;

    const updateCommand = new UpdateCommand({
      TableName: 'sesiones-alumnos',
      Key: { id: sessionId },
      UpdateExpression: 'set active = :status',
      ExpressionAttributeValues: { ':status': false },
    });

    await this.docClient.send(updateCommand);
    return { message: 'Logout exitoso' };
  }

  // IMPLEMENTACIÓN PARA PASAR S3ApiTest
  async uploadProfilePicture(id: number, file: Express.Multer.File) {
    // 1. Verificar que el alumno existe
    const alumno = await this.findOne(id);

    // 2. Definir Key (nombre archivo) único
    const key = `fotos-perfil/${id}-${Date.now()}.jpg`;

    // 3. Subir a S3
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Nota: Si tu bucket no tiene políticas públicas automáticas,
      // podrías necesitar ACL: 'public-read' aquí, pero AWS ya lo deshabilita por defecto.
      // Asegúrate que tu Bucket Policy permita GetObject público.
    });

    await this.s3Client.send(command);

    // 4. Construir la URL pública
    const url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;

    // 5. Guardar la URL en la base de datos MySQL (Importante para el test)
    // El test hace un GET después y espera ver la URL.
    await this.alumnosRepository.update(id, { fotoPerfilUrl: url });

    return { fotoPerfilUrl: url };
  }
}
