import {
  IFetchedVersion,
} from './IFetchedVersion';

export interface IFetchedPackage {
  readonly id: number;
  readonly name: string;
  readonly author: number;
  readonly owner: number;
  readonly description: string;
  readonly default_version: string | null;
  readonly versions: string[] | IFetchedVersion[];
  readonly date_created: Date;
  readonly date_modified: Date;
  readonly keywords: string[];
  readonly downloads: number;
  readonly tag: string;
}
