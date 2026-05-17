import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateSpaceDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class InviteMemberDto {
  @IsString()
  usuario_id: string;

  @IsEnum(['editor', 'revisor', 'observador'])
  rol: string;
}

export class UpdateMemberRoleDto {
  @IsEnum(['editor', 'revisor', 'observador'])
  rol: string;
}
