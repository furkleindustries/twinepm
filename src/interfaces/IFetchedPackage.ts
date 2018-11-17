import {
  IFetchedVersion,
} from './IFetchedVersion';

export interface IFetchedPackage {
  id: number;
  name: string;
  author: number;
  owner: number;
  description: string;
  default_version: string | null;
  versions: string[] | IFetchedVersion[];
  date_created: Date;
  date_modified: Date;
  keywords: string[];
  downloads: number;
  tag: string;
}
