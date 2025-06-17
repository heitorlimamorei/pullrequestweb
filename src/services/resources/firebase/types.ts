export type firebaseTimesStampType = { seconds: number; nanoseconds: number };

import { type WhereFilterOp } from "firebase/firestore";

export interface IQuery<T> {
  field: string;
  condition: WhereFilterOp;
  value: T;
}

type MapFunction = (c: any) => any;
type FilterFunction = (c: any) => boolean;

export interface IFindAllPayload {
  collection: string;
  query?: IQuery<any>[];
  map?: MapFunction;
  filter?: FilterFunction;
}

export interface IFindOnePayload {
  collection: string;
  id?: string;
  query?: IQuery<any>[];
  map?: MapFunction;
}

export interface IDelteOnePayload {
  collection: string;
  id: string;
}

export interface IDeleteManyPayload {
  collection: string;
  ids?: string[];
  query?: IQuery<any>[];
}

export interface ICreatePayload {
  collection: string;
  payload: any;
}

export interface IUpdateOnePayload {
  collection: string;
  id: string;
  payload: any;
}

export interface ISetDocPayload {
  collection: string;
  id: string;
  payload: any;
}
