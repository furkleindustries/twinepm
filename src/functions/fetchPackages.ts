import {
  apiUrl,
} from '../constants/apiUrl';
import {
  IFetchedPackage,
} from '../interfaces/IFetchedPackage';
import {
  IFetchOptions,
} from '../interfaces/IFetchOptions';
import {
  IFetchPackageOptions,
} from '../interfaces/IFetchPackageOptions';
import {
  IPaginatedResponse,
} from '../interfaces/IPaginatedResponse';
import {
  fixPackageDates,
} from './fixPackageDates';
import {
  isNode,
} from './isNode';
import {
  OrderDirections,
} from '../enums/OrderDirections';

import nodeFetch from 'node-fetch';

type Paginated = IPaginatedResponse<IFetchedPackage>;

/**
 * @description A function used to abstract fetching one or more profiles from
 * the server.
 * 
 * @async
 * 
 * @param nameOrId This variable input can either be the name of the package or
 * the numerical ID, both of which return a single package, or the `all` star,
 * `*`, which returns up to the server max (which is yet to be canonicalized).
 * 
 * @param [options] A group of optional instructions to modify which packages
 * are returned, and how.
 * 
 * @param [options.includeVersions] Allows individual versions to be specified
 * that will be returned in the package object's `versions` field in full.
 * Ordinarily versions are returned as a list of semver version identifiers.
 * `default` may also be provided, and will provide the default version. This
 * option is ignored if `nameOrId` is `*`.
 * 
 * @param [options.orderBy] A set of fields that can be used for ordering the
 * returned packages. This option is ignored if `nameOrId` is not `*`.
 * 
 * @param [options.orderDirection] A direction in which the returned packages
 * are ordered. This option is ignored if `nameOrId` is not `*`.
 * 
 * @param [options.quantity] The number of results to return. There is a server
 * maximum, which has not been canonicalized yet, beyond which a higher
 * quantity is disregarded. This option is ignored if `nameOrId` is not `*`. 
 */
export const fetchPackages = (
  nameOrId: string | number | '*',
  options?: IFetchPackageOptions & IFetchOptions,
): Promise<IFetchedPackage | IPaginatedResponse<IFetchedPackage>> => {

  /* If format=json is not provided, an HTML response will be emitted by the
   * server. This is not desirable for a Node module API. */
  let args = 'format=json';
  if (options) {
    if (nameOrId === '*') {
      if (options.orderBy) {
        if (options.orderDirection === OrderDirections.Descending) {
          args += `&orderBy=${options.orderBy}`;
        }

        args += `&orderDirection=-${options.orderDirection}`;
      }


      if (options.quantity) {
        args += `&quantity=${options.quantity}`;
      }
    } else {
      if (options.includeVersions) {
        const versionsStr = options.includeVersions.join(',');
        args += `&include_versions=${encodeURIComponent(versionsStr)}`;
      }
    }
  }

  /* e.g. https://foo.com/packages/coolPackage?...args */
  const urlStr = `${apiUrl}/packages/${nameOrId === '*' ? '' : nameOrId}?${args}`;
  const fetchArgs = [
    urlStr,
    {},
  ];

  return new Promise((resolve, reject) => {
    let prom;
    /* Use nodeFetch on the server and the built-in fetch in the browser. */
    if (isNode()) {
      prom = nodeFetch.apply(null, fetchArgs);
    } else {
      prom = fetch.apply(null, fetchArgs);
    }

    (prom as Promise<Response>).then(({
      json,
      status,
    }) => {
      if (status >= 200 && status < 300) {
        try {
          json().then((data: IFetchedPackage | Paginated) => {
            let fixedData: IFetchedPackage | Paginated = {
              ...data,
              ...(nameOrId === '*' ?
                {
                  results: (data as Paginated).results.map((pkg) => (
                    fixPackageDates(pkg, options)
                  )) 
                } :
                {}
              ),
            };

            if (nameOrId !== '*') {
              fixedData = fixPackageDates(fixedData as IFetchedPackage, options);
            }

            return resolve(Object.freeze(fixedData));
          });
        } catch (err) {
          return reject('There was an unknown error deserializing the ' +
            'response, but the request succeeded.');
        }
      } else {
        try {
          json().then(({ error }) => reject(error));
        } catch (err) {
          return reject('There was an unknown error. The server returned a ' +
            `status of ${status}.\n${err}`);
        }
      }
    }, reject);
  });
};
