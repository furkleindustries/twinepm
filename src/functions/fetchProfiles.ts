import {
  apiUrl,
} from '../constants/apiUrl';
import {
  IFetchedProfile,
} from '../interfaces/IFetchedProfile';
import {
  IFetchOptions,
} from '../interfaces/IFetchOptions';
import {
  IFetchProfileOptions,
} from '../interfaces/IFetchProfileOptions';
import {
  IPaginatedResponse,
} from '../interfaces/IPaginatedResponse';
import {
  isNode,
} from './isNode';
import {
  fixProfileDates,
} from './fixProfileDates';
import {
  OrderDirections,
} from '../enums/OrderDirections';
import {
  SearchSymbols,
} from '../enums/SearchSymbols';

type Fetch = GlobalFetch['fetch'];
type Paginated = IPaginatedResponse<IFetchedProfile>;
type ResponsePromise = Promise<Response>;

import nodeFetch from 'node-fetch';

/**
 * A function used to abstract fetching one or more profiles from
 * the server.
 * 
 * @async
 * 
 * @param userId This variable input can either be the numerical ID, which
 * returns a single profile, or `SearchSymbols.All`, which returns up to the
 * server max. The server max is yet to be canonicalized.
 * 
 * @param options A group of optional instructions to modify which profiles
 * are returned.
 * 
 * @param options.orderBy A set of fields that can be used for ordering the
 * returned profiles. This option is ignored if `id` is not
 * `SearchSymbols.All`.
 * 
 * @param options.orderDirection A direction in which the returned profiles
 * are ordered. This option is ignored if `id` is not `SearchSymbols.All`.
 * 
 * @param options.quantity The number of results to return. There is a server
 * maximum, which has not been canonicalized yet, beyond which a higher
 * quantity is disregarded. This option is ignored if `id` is not
 * `SearchSymbols.All`.
 */
export const fetchProfiles = (
  id: number | SearchSymbols.All,
  options?: IFetchProfileOptions & IFetchOptions,
): Promise<IFetchedProfile | Paginated> => {
  /* If format=json is not provided, an HTML response will be emitted by the
   * server. This is not desirable for a Node module API. */
  let args = 'format=json';
  if (options) {
    if (id === SearchSymbols.All) {
      if (options.orderBy) {
        if (options.orderDirection === OrderDirections.Ascending) {
          args += `&ordering=-${options.orderBy}`;
        }

        args += `&ordering=${options.orderBy}`;
      }

      if (options.quantity) {
        args += `&page_size=${options.quantity}`;
      }
    }
  }

  /* e.g. https://foo.com/profiles/1?...args */
  const urlStr = `${apiUrl}/profiles/${id === SearchSymbols.All ?
    '' :
    id}?${args}`;

  const fetchArgs: [ string, object ] = [
    urlStr,
    {},
  ];

  return new Promise((resolve, reject) => {
    /* Use nodeFetch on the server and the built-in fetch in the browser. */
    (((isNode() ? nodeFetch : fetch) as Fetch)(
      fetchArgs[0],
      fetchArgs[1],
    )).then(({
      json,
      status,
    }) => {
      if (status >= 200 && status < 300) {
        try {
          json().then((data: IFetchedProfile | Paginated) => {
            let fixedData: IFetchedProfile | Paginated = {
              ...data,
              ...(id === SearchSymbols.All ?
                { results: (data as Paginated).results.map(fixProfileDates) } :
                {}
              ),
            };

            if (id !== SearchSymbols.All) {
              fixedData = fixProfileDates(fixedData as IFetchedProfile);
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
