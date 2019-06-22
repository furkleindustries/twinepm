import * as program from '../../node_modules/commander/index';
import {
  fetchPackages,
} from '../functions/fetchPackages';
import {
  fetchProfiles,
} from '../functions/fetchProfiles';
import {
  fetchVersions,
} from '../functions/fetchVersions';
import {
  FetchTypes,
} from '../enums/FetchTypes';
import {
  version,
} from '../package';

program.version(version);

program.command(
  'fetch',
  'Request a data record from the TwinePM servers.',
  { isDefault: true },
).alias(
  'f',
).option(
  '<type>',
  'The type of the asset to fetch. Allowed values are expressed by the ' +
    'FetchTypes enum.',
).option(
  '<nameOrId>',
  'The identifier for the asset, an integer ID, the name, or the semver ' +
    'identifier.',
).option(
  '-v, --includeVersions [versions]',
  'Can only be used when fetching packages.\n\nA comma-separated list of ' +
    'version IDs (or the word "default" to include the default version) to ' +
    'include with the package.',
).option(
  '-o, --orderBy [orderBy]',
  'Which column in the database record to sort when producing paginated ' +
    'queries.',
).option(
  '-d, --orderDirection [orderDirection]',
  'Whether to return the results in ascending or descending order.',
).option(
  '-i, --packageId [packageId]',
  'Can only be used when fetching versions.\n\nSpecifies the parent package ' +
    'of the version when identifying the version with its semantic version ' +
    'identifier.',
).action((type, nameOrId, {
  includeVersions,
  orderBy,
  packageId,
}) => {
  const args = {
    ...(includeVersions ?
      { includeVersions: includeVersions.split(',') } :
      {}),
    ...(orderBy ? { orderBy } : {}),
    ...(packageId ? { packageId } : {}),
  };


  if (type !== FetchTypes.Package && includeVersions) {
    throw new Error('The type argument was not FetchTypes.Package, but the ' +
      'includeVersions argument was provided. The includeVersions argument ' +
      'may only be used with FetchTypes.Version.');
  } else if (type !== FetchTypes.Version && packageId) {
    throw new Error('The type argument was not FetchTypes.Version, but the ' +
      'packageId argument was provided. The packageId argument may only ' +
      'be used with FetchTypes.Version.');
  }

  let prom;
  if (type === FetchTypes.Package) {
    prom = fetchPackages(nameOrId, args);
  } else if (type === FetchTypes.Profile) {
    prom = fetchProfiles(nameOrId, args);
  } else if (type === FetchTypes.Version) {
    prom = fetchVersions(nameOrId, args);
  } else {
    throw new Error('The type argument was not a member of FetchTypes.');
  }

  prom.then(console.log.bind(console), console.error.bind(console));
});

program.parse(process.argv);
