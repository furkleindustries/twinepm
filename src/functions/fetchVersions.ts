import {
  apiUrl,
} from '../constants/apiUrl';
import {
  IFetchedVersion,
} from '../interfaces/IFetchedVersion';
import {
  IFetchOptions,
} from '../interfaces/IFetchOptions';
import {
  IFetchVersionOptions,
} from '../interfaces/IFetchVersionOptions';
import {
  IPaginatedResponse,
} from '../interfaces/IPaginatedResponse';
import {
  isNode,
} from './isNode';
import {
  OrderDirections,
} from '../enums/OrderDirections';
import {
  SearchSymbols,
} from '../enums/SearchSymbols';

import nodeFetch from 'node-fetch';
import { fixVersionDates } from './fixVersionDates';

type Paginated = IPaginatedResponse<IFetchedVersion>;
type ResponsePromise = Promise<Response>;

/**
 * A function used to abstract fetching one or more versions from
 * the server.
 * 
 * @async
 * 
 * @param id This variable input can either be the numerical ID, which
 * returns a single version, the `all` star, `SearchSymbols.All`, which returns
 * up to the server max, or a combination of the desired version's semver
 * version identifier and the packageId option. The server max is yet to be
 * canonicalized. An error will be returned by the server if id is provided as
 * a semver identifier but no packageId is provided.
 * 
 * @param options A group of optional instructions to modify which versions
 * are returned.
 * 
 * @param options.orderBy A set of fields that can be used for ordering the
 * returned versions. This option is ignored if `id` is not
 * `SearchSymbols.All`.
 * 
 * @param options.orderDirection A direction in which the returned versions
 * are ordered. This option is ignored if `id` is not `SearchSymbols.All`.
 * 
 * @param options.quantity The number of results to return. There is a server
 * maximum, which has not been canonicalized yet, beyond which a higher
 * quantity is disregarded. This option is ignored if `id` is not
 * `SearchSymbols.All`. 
 */
export const fetchVersions = (
  id: string | number | SearchSymbols.All,
  options?: IFetchVersionOptions & IFetchOptions
): Promise<IFetchedVersion | Paginated> => {
  /* If format=json is not provided, an HTML response will be emitted by the
   * server. This is not desirable for a Node module API. */
  let args = 'format=json';
  if (options) {
    if (id === SearchSymbols.All) {
      if (options.orderBy) {
        if (options.orderDirection === OrderDirections.Descending) {
          args += `&orderBy=${options.orderBy}`;
        }

        args += `&orderBy=-${options.orderBy}`;
      }

      if (options.quantity) {
        args += `&quantity=${options.quantity}`;
      }
    } else {
      if (options.packageId) {
        args += `&packageId=${options.packageId}`;
      }
    }
  }

  /* e.g. https://foo.com/versions/1?...args */
  const urlStr = `${apiUrl}/versions/${id === SearchSymbols.All ? '' : id}` +
    `?${args}`;

  const fetchArgs: [ string, object ] = [
    urlStr,
    {},
  ];

  return new Promise((resolve, reject) => {
    /* Use nodeFetch on the server and the built-in fetch in the browser. */
    ((isNode() ? nodeFetch : fetch)(fetchArgs[0], fetchArgs[1]) as ResponsePromise).then(({
      status,
      json,
    }) => {
      if (status >= 200 && status < 300) {
        try {
          json().then((data: IFetchedVersion | Paginated) => {
            let fixedData: IFetchedVersion | Paginated = {
              ...data,
              ...(id === SearchSymbols.All ?
                { results: (data as Paginated).results.map(fixVersionDates) } :
                {}
              ),
            };

            if (id !== SearchSymbols.All) {
              fixedData = fixVersionDates(fixedData as IFetchedVersion);
            }

            return resolve(Object.freeze(fixedData));
          });
        } catch (e) {
          return reject('There was an unknown error deserializing the ' +
            'response, but the request succeeded.');
        }
      } else {
        try {
          json().then(({ error }) => reject(error));
        } catch (err) {
          return reject('There was an unknown error. The server returned a status ' +
                `of ${status}.\n${err}`);
        }
      }
    }, reject);
  });
};
