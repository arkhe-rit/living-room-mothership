import { createBusClient } from '../toolbox/messageBusClient';

type Algebra = any; // TODO

export interface TranslatorDescription<T extends Algebra, U extends Algebra> {
  from: string,
  to: string,
  fn: (alg: T) => U
};

