import {
  PackageOrderByFields,
} from '../enums/PackageOrderByFields';

export interface IFetchPackageOptions {
  includeVersions?: Array<string | 'default'>;
  orderBy?: PackageOrderByFields;
}
