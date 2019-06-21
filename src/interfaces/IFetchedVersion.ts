export interface IFetchedVersion {
  readonly id: number;
  readonly version_identifier: string;
  readonly author: number;
  readonly description: string;
  readonly js: string;
  readonly css: string;
  readonly parent_package: number;
  readonly date_created: Date;
}
