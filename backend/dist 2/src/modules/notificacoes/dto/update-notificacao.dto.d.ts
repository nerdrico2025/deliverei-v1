import { CreateNotificacaoDto } from './create-notificacao.dto';
declare const UpdateNotificacaoDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateNotificacaoDto>>;
export declare class UpdateNotificacaoDto extends UpdateNotificacaoDto_base {
    lida?: boolean;
}
export {};
