import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
} from 'class-validator';

export class CreateProdutoDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsOptional()
  @IsString({ message: 'Descrição deve ser uma string' })
  descricao?: string;

  @IsNumber({}, { message: 'Preço deve ser um número' })
  @IsNotEmpty({ message: 'Preço é obrigatório' })
  @Min(0, { message: 'Preço não pode ser negativo' })
  preco: number;

  @IsOptional()
  @IsString({ message: 'Imagem deve ser uma string (URL)' })
  imagem?: string;

  @IsOptional()
  @IsBoolean({ message: 'Ativo deve ser um booleano' })
  ativo?: boolean;

  @IsOptional()
  @IsInt({ message: 'Estoque deve ser um número inteiro' })
  @Min(0, { message: 'Estoque não pode ser negativo' })
  estoque?: number;

  @IsOptional()
  @IsString({ message: 'Categoria deve ser uma string' })
  categoria?: string;

  // Tags de destaque no storefront
  @IsOptional()
  @IsBoolean({ message: 'promo_tag deve ser um booleano' })
  promo_tag?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'bestseller_tag deve ser um booleano' })
  bestseller_tag?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'new_tag deve ser um booleano' })
  new_tag?: boolean;
}
