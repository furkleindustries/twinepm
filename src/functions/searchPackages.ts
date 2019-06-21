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

type ResponsePromise = Promise<Response>;

/**
 * A simple API through which raw string queries may be passed to the server,
 * and structured, normalized array of results are returned.
 * 
 * @param query The base query to be sent to the server and executed.
 * @param options Options to affect the behavior of the server's response.
 */
export const searchPackages = (query: string, options?: ISearchPackageOptions) => {
  let args = `query=${encodeURIComponent(query)}&format=json`;
  if (options) {
    if (options.quantity) {
      args += `&quantity=${options.quantity}`;
    }
  }

  /* e.g. https://foo.com/packages/search/coolPackage?...args */
  const urlStr = `${apiUrl}/packages/search/?${args}`;

  const fetchArgs: [ string, object ] = [
    urlStr,
    {},
  ];

  return new Promise((resolve, reject) => {
    ((isNode() ? nodeFetch : fetch)(fetchArgs[0], fetchArgs[1]) as ResponsePromise).then(
      ({
        json,
        status,
      }) => {
        if (status >= 200 && status < 300) {
          try {
            json().then(resolve);
          } catch (e) {
            return reject('There was an unknown error deserializing the ' +
              'response, but the request succeeded.');
          }
        } else {
          try {
            json().then(({ error }) => reject(error));
          } catch (err) {
            return reject('There was an unknown error. The server returned ' +
              `a status of ${status}.\n${err}`);
          }
        }
      },
      reject,
    );
  });
};
