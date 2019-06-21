import {
  IFetchedVersion,
} from '../interfaces/IFetchedVersion';

/**
 * Normalizes the dates in the fetched version into JavaScript Date objects.
 * 
 * @param version The fetched version object.
 */
export const fixVersionDates = (
  {
    date_created,
    ...version
  }: IFetchedVersion,
): IFetchedVersion => Object.freeze({
  ...version,
  date_created: new Date(date_created),
});
