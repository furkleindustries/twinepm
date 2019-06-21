import {
  PackageOrderByFields,
} from '../enums/PackageOrderByFields';

export interface IFetchPackageOptions {
  readonly includeVersions?: Array<string | 'default'>;
  readonly orderBy?: PackageOrderByFields;
}
