const program = require('../node_modules/commander/index');
const {
  version,
} = require('../package');

program.version(version, '-v, -V, --version');

program.command(
  'fetch <type> <nameOrId>',
  'Request a data record from the TwinePM servers. The type argument refers ' +
    'to the asset to fetch. Allowed values are expressed by the FetchTypes ' +
    'enum. The identifier for the asset should be the integer ID for any ' +
    'asset the name for packages or profiles, or the semver identifier and ' +
    'identifier.',
).alias(
  'f',
).parse(process.argv);

if (!program.args.length) {
  program.outputHelp();
}
