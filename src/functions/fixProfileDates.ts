import {
  IFetchedProfile,
} from '../interfaces/IFetchedProfile';

/**
 * Normalizes the date in the fetched profile into a JavaScript Date object.
 * 
 * @param profile The fetched profile object.
 */
export const fixProfileDates = (
  {
    date_created,
    ...profile
  }: IFetchedProfile,
): IFetchedProfile => Object.freeze({
  ...profile,
  date_created: new Date(date_created),
});
