import {
  PackageOrderByFields,
} from '../enums/PackageOrderByFields';
import {
  OrderDirections,
} from '../enums/OrderDirections';

export interface IFetchOptions {
  cursor?: number;
  orderDirection?: OrderDirections;
  quantity?: number;
}
