export interface GenericServerBuilder<T> {
    start(address: string, credentials?: any): void;
}
export declare function serverBuilder<T>(protoPath: string, packageName: string): T & GenericServerBuilder<T>;
export declare type ClientFactoryConstructor<T> = new (address: string, credentials?: any, options?: any) => T;
export declare function clientFactory<T>(protoPath: string, packageName: string): ClientFactoryConstructor<T>;
