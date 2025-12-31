export declare function validateEntityExists<T>(entity: T | null, entityName: string): T;
export declare function validateOwnershipOrAdmin(entityUserId: string, currentUserId: string, isAdmin?: boolean): void;
