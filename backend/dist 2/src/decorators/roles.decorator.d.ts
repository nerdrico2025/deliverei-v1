declare const TipoUsuario: {
    readonly CLIENTE: "CLIENTE";
    readonly ADMIN_EMPRESA: "ADMIN_EMPRESA";
    readonly SUPER_ADMIN: "SUPER_ADMIN";
};
type TipoUsuarioType = typeof TipoUsuario[keyof typeof TipoUsuario];
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: TipoUsuarioType[]) => import("@nestjs/common").CustomDecorator<string>;
export {};
