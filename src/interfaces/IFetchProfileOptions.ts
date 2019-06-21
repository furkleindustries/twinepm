import {
  ProfileOrderByFields,
} from '../enums/ProfileOrderByFields';

export interface IFetchProfileOptions {
  readonly orderBy?: ProfileOrderByFields;
}
