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

import nodeFetch from 'node-fetch';
import { fixVersionDates } from './fixVersionDates';

type Paginated = IPaginatedResponse<IFetchedVersion>;

/**
 * @description A function used to abstract fetching one or more versions from
 * the server.
 * 
 * @async
 * 
 * @param id This variable input can either be the numerical ID, which
 * returns a single version, the `all` star, `*`, which returns up to the
 * server max (which is yet to be canonicalized), or a combination of the
 * desired version's semver version identifier and the packageId option.
 * An error will be thrown by the server if id is provided as a semver
 * identifier but no packageId is provided.
 * 
 * @param [options] A group of optional instructions to modify which versions
 * are returned.
 * 
 * @param [options.orderBy] A set of fields that can be used for ordering the
 * returned versions. This option is ignored if `id` is not `*`.
 * 
 * @param [options.orderDirection] A direction in which the returned versions
 * are ordered. This option is ignored if `id` is not `*`.
 * 
 * @param [options.quantity] The number of results to return. There is a server
 * maximum, which has not been canonicalized yet, beyond which a higher
 * quantity is disregarded. This option is ignored if `id` is not `*`. 
 * */
export const fetchVersions = (
  id: string | number | '*',
  options?: IFetchVersionOptions & IFetchOptions
): Promise<IFetchedVersion | Paginated> => {
  /* If format=json is not provided, an HTML response will be emitted by the
   * server. This is not desirable for a Node module API. */
  let args = 'format=json';
  if (options) {
    if (id === '*') {
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
  const urlStr = `${apiUrl}/versions/${id === '*' ? '' : id}?${args}`;

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
      status,
      json,
    }) => {
      if (status >= 200 && status < 300) {
        try {
          json().then((data: IFetchedVersion | Paginated) => {
            let fixedData: IFetchedVersion | Paginated = {
              ...data,
              ...(id === '*' ?
                { results: (data as Paginated).results.map(fixVersionDates) } :
                {}
              ),
            };

            if (id !== '*') {
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
