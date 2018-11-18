import {
  VersionOrderByFields,
} from '../enums/VersionOrderByFields';

export interface IFetchVersionOptions {
  orderBy?: VersionOrderByFields;
  packageId?: string;
}
