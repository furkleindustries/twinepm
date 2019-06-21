import {
  IFetchedProfile,
} from '../interfaces/IFetchedProfile';

export const fixProfileDates = (
  {
    date_created,
    ...profile
  }: IFetchedProfile,
): IFetchedProfile => Object.freeze({
  ...profile,
  date_created: new Date(date_created),
});
