export declare function isPortAvailable(port: number): Promise<boolean>;
export declare function findAvailablePort(basePort: number, maxAttempts?: number): Promise<number>;
export declare function checkPortStatus(port: number): Promise<{
    available: boolean;
    message: string;
}>;
