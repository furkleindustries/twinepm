export interface IFetchedVersion {
  id: number;
  version_identifier: string;
  author: number;
  description: string;
  js: string;
  css: string;
  parent_package: number;
  date_created: Date;
}
