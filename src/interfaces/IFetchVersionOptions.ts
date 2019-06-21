import {
  VersionOrderByFields,
} from '../enums/VersionOrderByFields';

export interface IFetchVersionOptions {
  readonly orderBy?: VersionOrderByFields;
  readonly packageId?: string;
}
