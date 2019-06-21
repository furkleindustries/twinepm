import {
  fixVersionDates,
} from './fixVersionDates';
import {
  IFetchOptions,
} from '../interfaces/IFetchOptions';
import {
  IFetchedPackage,
} from '../interfaces/IFetchedPackage';
import {
  IFetchPackageOptions,
} from '../interfaces/IFetchPackageOptions';
import {
  IFetchedVersion,
} from '../interfaces/IFetchedVersion';

export const fixPackageDates = (
  {
    date_created,
    date_modified,
    versions,
    ...pkg
  }: IFetchedPackage,
  options?: IFetchPackageOptions & IFetchOptions,
): IFetchedPackage => Object.freeze({
  ...pkg,
  date_created: new Date(date_created),
  date_modified: new Date(date_modified),
  versions: options && options.includeVersions && Array.isArray(versions) ?
    versions :
    (versions as IFetchedVersion[]).map(fixVersionDates),
  },
);
