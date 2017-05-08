import * as os from 'os';
import * as grpc from 'grpc';
import { Observable } from 'rxjs/Observable';

type DynamicMethods = { [name: string]: any; };



/**
 *  Adds the grpc Metadata to an error object with the erver stack
 *
 * @param {*} error
 * @returns {*} error with property metadata
 */
function addErrorMetaData(error: any): any {
  try {
    if (!error.metadata) {
      error.metadata = new grpc.Metadata;
    }

    // if custom error already has a emtadata member remember it
    let serverMetadata = null;
    if (! (error.metadata instanceof grpc.Metadata) ) {
      serverMetadata = error.metadata;
      error.metadata = new grpc.Metadata();
    }

    // now set server error metadata
    error.metadata.add('server-error', error.name);
    error.metadata.add('server-message', error.message);

    if ( error.stack ) {
      if        (typeof error.stack.join === 'function') {
        error.metadata.add('server-stack-bin', Buffer.from(error.stack.join('\n')));
      } else if (typeof error.stack === 'string') {
        error.metadata.add('server-stack-bin', Buffer.from(error.stack));
      } else {
        error.metadata.add('server-stack-bin', Buffer.from(error.stack + '') );
      }
    }

    error.metadata.add('server-name', os.hostname());

    // now json stringifie oroginal metadata. may throw circular error
    if ( serverMetadata ) {
      error.metadata.add('serverMetadata-bin', Buffer.from(JSON.stringify(serverMetadata, null, ' ')));
    }

    return error;

  } catch (e) {
    return error;
  }

}

function convertErrorMetaData(error: any): any {
  let newMetadata: any = {};

  if (error.metadata instanceof grpc.Metadata) {
    let keyMap = error.metadata.getMap();
    for ( let key in keyMap) {
      if (typeof keyMap[key] === 'string') {
        newMetadata[key] = keyMap[key];
      } else if (keyMap[key] instanceof Buffer) {
        newMetadata[key.replace('-bin', '')] = keyMap[key].toString();
      }
    }

    error.metadata = newMetadata;
  }

  return error;
}


export interface GenericServerBuilder<T> {
  start(address: string, credentials?: any): void;
}

export function serverBuilder<T>(protoPath: string, packageName: string): T & GenericServerBuilder<T> {
  const server = new grpc.Server();

  const builder: DynamicMethods = <GenericServerBuilder<T>> {
    start(address: string, credentials?: any) {
      server.bind(address, credentials || grpc.ServerCredentials.createInsecure());
      server.start();
    }
  };

  const pkg = grpc.load(protoPath)[packageName];
  for (const name of getServiceNames(pkg)) {
    builder[`add${name}`] = function(rxImpl: DynamicMethods) {
      server.addProtoService(pkg[name].service, createService(pkg[name], rxImpl));
      return this;
    };
  }

  return builder as any;
}

function createService(Service: any, rxImpl: DynamicMethods) {
  const service: DynamicMethods = {};
  for (const name in Service.prototype) {
    if (typeof rxImpl[name] === 'function') {
      service[name] = createMethod(rxImpl, name, Service.prototype);
    }
  }
  return service;
}

function createMethod(rxImpl: DynamicMethods, name: string, serviceMethods: DynamicMethods) {
  return serviceMethods[name].responseStream
    ? createStreamingMethod(rxImpl, name)
    : createUnaryMethod(rxImpl, name);
}

function createUnaryMethod(rxImpl: DynamicMethods, name: string) {
  return function(call: any, callback: any) {
    const response: Observable<any> = rxImpl[name](call.request);
    response.subscribe(
      data => callback(null, data),
      error => callback(addErrorMetaData(error))
    );
  };
}

function createStreamingMethod(rxImpl: DynamicMethods, name: string) {
  return async function(call: any, callback: any) {
    const response: Observable<any> = rxImpl[name](call.request);
    try {
      await response.forEach(data => call.write(data));
    } catch (e) {
      throw addErrorMetaData(e);
    }
    call.end();
  };
}

export type ClientFactoryConstructor<T> = new(address: string, credentials?: any, options?: any) => T;

export function clientFactory<T>(protoPath: string, packageName: string) {
  class Constructor {

    readonly __args: any[];
    constructor(address: string, credentials?: any, options: any = undefined) {
      this.__args = [
        address,
        credentials || grpc.credentials.createInsecure(),
        options
      ];
    }

  }

  const prototype: DynamicMethods = Constructor.prototype;
  const pkg = grpc.load(protoPath)[packageName];
  for (const name of getServiceNames(pkg)) {
    prototype[`get${name}`] = function(this: Constructor) {
      return createServiceClient(pkg[name], this.__args);
    };
  }

  return <any> Constructor as ClientFactoryConstructor<T>;
}

function getServiceNames(pkg: any) {
  return Object.keys(pkg).filter(name => pkg[name].service);
}

function createServiceClient(GrpcClient: any, args: any[]) {
  const grpcClient = new GrpcClient(...args);
  const rxClient: DynamicMethods = {};
  for (const name of Object.keys(GrpcClient.prototype)) {
    rxClient[name] = createClientMethod(grpcClient, name);
  }
  return rxClient;
}

function createClientMethod(grpcClient: DynamicMethods, name: string) {
  return grpcClient[name].responseStream
    ? createStreamingClientMethod(grpcClient, name)
    : createUnaryClientMethod(grpcClient, name);
}

function createUnaryClientMethod(grpcClient: DynamicMethods, name: string) {
  return function(...args: any[]) {
    return new Observable(observer => {
      grpcClient[name](...args, (error: any, data: any) => {
        if (error) {
          observer.error(convertErrorMetaData(error));
        } else {
          observer.next(data);
        }
        observer.complete();
      });
    });
  };
}

function createStreamingClientMethod(grpcClient: DynamicMethods, name: string) {
  return function(...args: any[]) {
    return new Observable(observer => {
      const call = grpcClient[name](...args);
      call.on('data', (data: any) => observer.next(data));
      call.on('error', (error: any) => observer.error(convertErrorMetaData(error)));
      call.on('end', () => observer.complete());
    });
  };
}
