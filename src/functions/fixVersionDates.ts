import {
  IFetchedVersion,
} from '../interfaces/IFetchedVersion';

export const fixVersionDates = (
  {
    date_created,
    ...version
  }: IFetchedVersion,
): IFetchedVersion => Object.freeze({
  ...version,
  date_created: new Date(date_created),
});
