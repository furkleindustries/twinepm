import {
  apiUrl,
} from './apiUrl';
import {
  TwinePmAssetTypes,
} from './TwinePmAssetTypes';

import fetch from 'node-fetch';

export const fetchAsset = (type: TwinePmAssetTypes, id: number) => {
  return new Promise((resolve) => {
    fetch(`${apiUrl}/${type}s/${id}`, {}).then((val) => {
      return val.json().then((data) => resolve(data));
    });
  });
};
