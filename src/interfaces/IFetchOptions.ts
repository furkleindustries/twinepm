import {
  OrderDirections,
} from '../enums/OrderDirections';

export interface IFetchOptions {
  readonly orderDirection?: OrderDirections;
  readonly quantity?: number;
}
