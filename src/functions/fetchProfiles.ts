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
  OrderDirections,
} from '../enums/OrderDirections';

import nodeFetch from 'node-fetch';

/**
 * @description A function used to abstract fetching one or more profiles from
 * the server.
 * 
 * @async
 * 
 * @param userId This variable input can either be the numerical ID, which
 * returns a single profile, or the `all` star, `*`, which returns up to the
 * server max (which is yet to be canonicalized).
 * 
 * @param [options] A group of optional instructions to modify which profiles
 * are returned.
 * 
 * @param [options.orderBy] A set of fields that can be used for ordering the
 * returned profiles. This option is ignored if `id` is not `*`.
 * 
 * @param [options.orderDirection] A direction in which the returned profiles
 * are ordered. This option is ignored if `id` is not `*`.
 * 
 * @param [options.quantity] The number of results to return. There is a server
 * maximum, which has not been canonicalized yet, beyond which a higher
 * quantity is disregarded. This option is ignored if `id` is not `*`. 
 * */
export const fetchProfiles = (
  id: number | '*',
  options?: IFetchProfileOptions & IFetchOptions,
): Promise<IFetchedProfile | IPaginatedResponse<IFetchedProfile>> => {
  /* If format=json is not provided, an HTML response will be emitted by the
   * server. This is not desirable for a Node module API. */
  let args = 'format=json';
  if (options) {
    if (id === '*') {
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
  const urlStr = `${apiUrl}/profiles/${id === '*' ? '' : id}?${args}`;

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
          response.json().then((data: IFetchedProfile | IPaginatedResponse<IFetchedProfile>) => {
            if (id === '*') {
              (data as IPaginatedResponse<IFetchedProfile>).results.forEach((prof) => (
                fixDates(prof)
              ));
            } else {
              fixDates(data as IFetchedProfile);
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
  profile: IFetchedProfile,
): IFetchedProfile => {
  profile.date_created = new Date(profile.date_created);
  return profile;
};
