
declare module child_process {
  declare function spawn(a: string, args: Array<string>): Process;
}

declare module "form-data" {
  declare class exports {
    append(key: string, val: any): void;
  }
}

declare module "node-fetch" {
  declare function exports(path: string, options: Object): Promise;
}

declare module "aws-sdk" {
  declare class CloudWatch {
    listMetrics(params: Object, callback: function): void;
    getMetricStatistics(params: Object, callback: function): void;
  }
  declare class EC2 {
    describeInstances(params: Object, callback: function): void;
  }
  declare class RDS {
    describeDBInstances(params: Object, callback: function): void;
  }
  declare class AWSConfig {
    update(conf: Object): void;
  }
  declare var config: AWSConfig;
}

// ignore
declare module "moment" {
  declare function exports(): any;
}

declare module "minimist" {
  declare function exports(): any;
}

declare module "immutable" {
  declare class List<T> {
    static <T>(vals: Array<T>): List<T>;
    find<T>(predicate: (value: T) => any): T;
  }
  declare class Set<T> {
    static <T>(vals: Array<T>): Set<T>;
    has(e: any): boolean;
  }
}

declare class Phantom {
  exit(i: number): void;
  exit(): void;
}

declare var phantom: Phantom;

declare var require: {(s: string): any, main: Object}
