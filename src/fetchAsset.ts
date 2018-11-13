import {
  apiUrl,
} from './apiUrl';
import {
  TwinePMAssetTypes,
} from './TwinePMAssetTypes';

import fetch from 'node-fetch';

export const fetchAsset = (type: TwinePMAssetTypes, id: number) => {
  return new Promise((resolve) => {
    fetch(`${apiUrl}/${type}s/${id}`, {}).then((val) => {
      return val.json().then((data) => resolve(data))
    });
  });
};
