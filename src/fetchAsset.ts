import {
  apiUrl,
} from './apiUrl';
import {
  IFetchAssetOptions,
} from './IFetchAssetOptions';
import {
  TwinePmAssetTypes,
} from './TwinePmAssetTypes';

import fetch from 'node-fetch';

export const fetchAsset = (type: TwinePmAssetTypes, id: number | '*', options?: IFetchAssetOptions) => {
  let args = '';
  if (id === '*' && options) {
    if (options.cursor) {
      args += `cursor=${options.cursor}`;
    }

    if (options.quantity) {
      if (args) {
        args += '&';
      }

      args += `quantity=${options.quantity}`;
    }

    if (options.search) {
      if (args) {
        args += '&';
      }

      args += `search=${encodeURIComponent(options.search)}`;
    }
  }

  return new Promise((resolve) => {
    fetch(`${apiUrl}/${type}s/${id}${args ? `?${args}` : ''}`, {}).then((val) => {
      return val.json().then((data) => resolve(data));
    });
  });
};
