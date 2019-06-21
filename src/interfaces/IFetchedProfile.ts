import {
  DateStyles,
} from '../enums/DateStyles';
import {
  TimeStyles,
} from '../enums/TimeStyles';

export interface IFetchedProfile {
  readonly user_id: number;
  readonly name: string;
  readonly description: string;
  readonly email: string;
  readonly email_visible: boolean;
  readonly date_created: Date;
  readonly date_style: DateStyles;
  readonly time_style: TimeStyles;
  readonly packages: ReadonlyArray<string>;
}
