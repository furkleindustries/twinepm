const program = require('../node_modules/commander/index');
const {
  fetchPackages,
  fetchProfiles,
  fetchVersions,
  FetchTypes,
} = require('../dist/node');
const semver = require('semver');

program.option(
  '-v, --includeVersions [versions]',
  'Can only be used when fetching packages. A comma-separated list of ' +
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
  'Can only be used when fetching versions. Specifies the parent package ' +
    'of the version when identifying the version with its semantic version ' +
    'identifier.',
).parse(process.argv);

const [
  type,
  nameOrId, {
    includeVersions,
    orderBy,
    packageId,
  } = {},
] = program.args;

const args = {
  ...(typeof includeVersions === 'string' ?
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

if (!nameOrId) {
  throw new Error('The nameOrId argument was not provided. This must be an ' +
    'integer, name, or semver ID.');
}

let id;
if (/^\d+$/.test(nameOrId)) {
  id = Number(nameOrId);
} else if (type === FetchTypes.Version && semver.valid(nameOrId)) {
  id = nameOrId;
} else if (type === FetchTypes.Package || type === FetchTypes.Profile) {
  id = nameOrId;
}

if (!id) {
  if (type === FetchTypes.Version) {
    throw new Error('The id argument provided was not an integer and was ' +
                    'not a valid semver identifier.')
  }

  throw new Error('The id argument was not provided.');
}

let prom;
try {
  if (type === FetchTypes.Package) {
    prom = fetchPackages(nameOrId, args);
  } else if (type === FetchTypes.Profile) {
    prom = fetchProfiles(nameOrId, args);
  } else if (type === FetchTypes.Version) {
    prom = fetchVersions(nameOrId, args);
  } else {
    throw new Error('The type argument was not a member of FetchTypes.');
  }
} catch (err) {
  console.trace();
  console.error(err);
  throw err;
}

prom.then(
  console.log.bind(console),
  (err) => {
    console.trace();
    console.error(err.stack || err);
  },
);
