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
  readonly count: number;
  readonly previous: string;
  readonly next: string;
  readonly results: ReadonlyArray<T>;
}
