import {
  Injectable, NotFoundException, ForbiddenException, ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Space, SpaceDocument } from './schemas/space.schema';
import { CreateSpaceDto, InviteMemberDto, UpdateMemberRoleDto } from './dto/space.dto';

@Injectable()
export class SpacesService {
  constructor(@InjectModel(Space.name) private spaceModel: Model<SpaceDocument>) {}

  // Crear espacio colaborativo
  async crear(dto: CreateSpaceDto, userId: string): Promise<SpaceDocument> {
    const espacio = await this.spaceModel.create({
      ...dto,
      creador_id: new Types.ObjectId(userId),
      miembros: [{
        usuario_id: new Types.ObjectId(userId),
        rol: 'editor',  // El creador siempre es editor principal
      }],
    });
    return espacio;
  }

  // Obtener espacios donde el usuario participa
  async misEspacios(userId: string): Promise<SpaceDocument[]> {
    return this.spaceModel.find({
      'miembros.usuario_id': new Types.ObjectId(userId),
    }).populate('creador_id', 'nombre email');
  }

  // Obtener un espacio por ID
  async obtenerUno(id: string, userId: string): Promise<SpaceDocument> {
    const espacio = await this.spaceModel
      .findById(id)
      .populate('miembros.usuario_id', 'nombre email');

    if (!espacio) throw new NotFoundException('Espacio no encontrado');

    const esMiembro = espacio.miembros.some(
      m => m.usuario_id.toString() === userId,
    );
    if (!esMiembro) throw new ForbiddenException('No eres miembro de este espacio');

    return espacio;
  }

  // Invitar miembro al espacio
  async invitar(id: string, dto: InviteMemberDto, userId: string): Promise<SpaceDocument> {
    const espacio = await this.spaceModel.findById(id);
    if (!espacio) throw new NotFoundException('Espacio no encontrado');

    // Solo el creador o un editor puede invitar
    const solicitante = espacio.miembros.find(m => m.usuario_id.toString() === userId);
    if (!solicitante || solicitante.rol !== 'editor') {
      throw new ForbiddenException('Solo los editores pueden invitar miembros');
    }

    // Verificar que no esté ya en el espacio
    const yaExiste = espacio.miembros.some(m => m.usuario_id.toString() === dto.usuario_id);
    if (yaExiste) throw new ConflictException('El usuario ya es miembro de este espacio');

    espacio.miembros.push({
      usuario_id: new Types.ObjectId(dto.usuario_id),
      rol: dto.rol,
      joined_at: new Date(),
    });

    return espacio.save();
  }

  // Cambiar rol de un miembro
  async cambiarRol(
    espacioId: string, miembroId: string, dto: UpdateMemberRoleDto, userId: string,
  ): Promise<SpaceDocument> {
    const espacio = await this.spaceModel.findById(espacioId);
    if (!espacio) throw new NotFoundException('Espacio no encontrado');

    if (espacio.creador_id.toString() !== userId) {
      throw new ForbiddenException('Solo el creador puede cambiar roles');
    }

    const miembro = espacio.miembros.find(m => m.usuario_id.toString() === miembroId);
    if (!miembro) throw new NotFoundException('Miembro no encontrado');

    miembro.rol = dto.rol;
    return espacio.save();
  }

  // Eliminar miembro del espacio
  async eliminarMiembro(espacioId: string, miembroId: string, userId: string) {
    const espacio = await this.spaceModel.findById(espacioId);
    if (!espacio) throw new NotFoundException('Espacio no encontrado');

    if (espacio.creador_id.toString() !== userId && miembroId !== userId) {
      throw new ForbiddenException('No tienes permiso para esta acción');
    }

    espacio.miembros = espacio.miembros.filter(
      m => m.usuario_id.toString() !== miembroId,
    );
    return espacio.save();
  }
}
