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

import nodeFetch from 'node-fetch';

/**
 * @description A function used to abstract fetching one or more versions from
 * the server.
 * 
 * @async
 * 
 * @param userId This variable input can either be the numerical ID, which
 * returns a single version, or the `all` star, `*`, which returns up to the
 * server max (which is yet to be canonicalized).
 * 
 * @param [options] A group of optional instructions to modify which versions
 * are returned.
 * 
 * @param [options.cursor] Returns results only including and after the version
 * with this ID in any particular query set. This option is ignored if `id` is
 * not `*`.
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
): Promise<IFetchedVersion | IFetchedVersion[]> => {
  /* If format=json is not provided, an HTML response will be emitted by the
   * server. This is not desirable for a Node module API. */
  let args = 'format=json';
  if (options) {
    if (id === '*') {
      if (options.cursor) {
        args += `&cursor=${options.cursor}`;
      }

      if (options.orderBy) {
        args += `&orderBy=${options.orderBy}`;
      }

      if (options.orderDirection) {
        args += `&orderDirection=${options.orderDirection}`;
      }

      if (options.quantity) {
        args += `&quantity=${options.quantity}`;
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
    if (process && process.env) {
      prom = nodeFetch.apply(null, fetchArgs);
    } else {
      prom = fetch.apply(null, fetchArgs);
    }

    (prom as Promise<Response>).then((response) => {
      if (response.status.toString()[0] === '2') {
        try {
          response.json().then((data: IFetchedVersion | IFetchedVersion[]) => {
            if (id === '*') {
              (data as IFetchedVersion[]).forEach((prof) => fixDates(prof));
            } else {
              fixDates(data as IFetchedVersion);
            }

            resolve(data);
          });
        } catch (e) {
          reject('There was an unknown error deserializing the response, ' +
                 'but the request succeeded.');
        }
      } else {
        try {
          response.json().then((data) => reject(data.error));
        } catch (e) {
          reject('There was an unknown error. The server returned a status ' +
                `of ${response.status}`);
        }
      }
    }, (err) => {
      reject(err);
    });
  });
};

const fixDates = (
  pkg: IFetchedVersion,
): IFetchedVersion => {
  pkg.date_created = new Date(pkg.date_created);
  return pkg;
};
