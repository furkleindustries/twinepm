import {
  IFetchedPackage,
} from './IFetchedPackage';
import {
  IFetchedProfile,
} from './IFetchedProfile';
import {
  IFetchedVersion,
} from './IFetchedVersion';

export interface IPaginatedResponse<T = IFetchedPackage | IFetchedProfile | IFetchedVersion> {
  count: number;
  previous: string;
  next: string;
  results: Array<T>;
}
