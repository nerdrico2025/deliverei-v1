export declare const StatusPedido: {
    readonly PENDENTE: "PENDENTE";
    readonly CONFIRMADO: "CONFIRMADO";
    readonly EM_PREPARO: "EM_PREPARO";
    readonly SAIU_ENTREGA: "SAIU_ENTREGA";
    readonly ENTREGUE: "ENTREGUE";
    readonly CANCELADO: "CANCELADO";
};
export type StatusPedidoType = typeof StatusPedido[keyof typeof StatusPedido];
export declare class FiltrarPedidosDto {
    status?: StatusPedidoType;
    dataInicio?: string;
    dataFim?: string;
    usuarioId?: string;
    page?: number;
    limit?: number;
}
