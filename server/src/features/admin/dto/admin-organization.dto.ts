import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class OrganizationFilterDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}