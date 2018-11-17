import {
  DateStyles,
} from '../enums/DateStyles';
import {
  TimeStyles,
} from '../enums/TimeStyles';

export interface IFetchedProfile {
  user_id: number;
  name: string;
  description: string;
  email: string;
  email_visible: boolean;
  date_created: Date;
  date_style: DateStyles;
  time_style: TimeStyles;
  packages: string[];
}
