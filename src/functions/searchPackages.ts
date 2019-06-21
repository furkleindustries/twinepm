import {
  apiUrl,
} from '../constants/apiUrl';
import {
  ISearchPackageOptions,
} from '../interfaces/ISearchPackageOptions';
import {
  isNode,
} from './isNode';

import nodeFetch from 'node-fetch';

export const searchPackages = (query: string, options?: ISearchPackageOptions) => {
  let args = `query=${encodeURIComponent(query)}&format=json`;
  if (options) {
    if (options.quantity) {
      args += `&quantity=${options.quantity}`;
    }
  }

  /* e.g. https://foo.com/packages/search/coolPackage?...args */
  const urlStr = `${apiUrl}/packages/search/?${args}`;

  const fetchArgs = [
    urlStr,
    {},
  ];

  return new Promise((resolve, reject) => {
    let prom;
    if (isNode()) {
      prom = nodeFetch.apply(null, fetchArgs);
    } else {
      prom = fetch.apply(null, fetchArgs);
    }

    (prom as Promise<Response>).then(
      (response) => {
        if (response.status >= 200 && response.status < 300) {
          try {
            response.json().then(resolve);
          } catch (e) {
            return reject('There was an unknown error deserializing the ' +
              'response, but the request succeeded.');
          }
        } else {
          try {
            response.json().then(({ error }) => reject(error));
          } catch (err) {
            return reject('There was an unknown error. The server returned ' +
              `a status of ${response.status}.\n${err}`);
          }
        }
      },
      reject,
    );
  });
};
