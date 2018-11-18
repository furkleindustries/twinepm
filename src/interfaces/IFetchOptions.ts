import {
  OrderDirections,
} from '../enums/OrderDirections';

export interface IFetchOptions {
  orderDirection?: OrderDirections;
  quantity?: number;
}
