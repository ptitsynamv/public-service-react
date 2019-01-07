import { call, put, takeLatest, all, select } from 'redux-saga/effects';
import { push } from 'connected-react-router/immutable';
import { makeSelectToken } from 'containers/App/selectors';

import {
  WATER_SERVICE_METER_EDIT_REQUEST,
  waterServiceMeterEditSuccess,
  waterServiceMeterEditError,
  waterServiceMetersSuccess,
  waterServiceMetersError,
  waterServiceMeterPriceEditSuccess,
  waterServiceMeterPriceEditError,
  WATER_SERVICE_METER_PRICE_EDIT_REQUEST,
} from '../actions/waterService';
import { toast } from '../../../utils/materialize';

function* waterServiceMetersEditRequest(payload) {
  try {
    const { key, value } = payload;
    const token = yield select(makeSelectToken());
    const response = yield call(() => {
      const url = '/api/water-service-meters';
      return fetch(url, {
        method: 'put',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ key, value }),
      });
    });
    const data = yield response.json();
    if (response.status >= 200 && response.status < 300) {
      yield put(waterServiceMeterEditSuccess(data));
      toast(response.status, 'Water Service Meter was edited successful');
    } else {
      yield put(waterServiceMeterEditError(response.status, data));
    }
  } catch (error) {
    yield put(waterServiceMeterEditError(500, error));
  }
}

function* waterServiceMeterPriceEditRequest(payload) {
  try {
    const { key, value } = payload;
    const token = yield select(makeSelectToken());
    const response = yield call(() => {
      const url = '/api/price';
      return fetch(url, {
        method: 'put',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({ key, value, serviceName: 'WaterService' }),
      });
    });
    const data = yield response.json();
    if (response.status >= 200 && response.status < 300) {
      yield put(waterServiceMeterPriceEditSuccess(data));
      toast(response.status, 'Water Service Meter Price was edited successful');
    } else {
      yield put(waterServiceMeterPriceEditError(response.status, data));
    }
  } catch (error) {
    yield put(waterServiceMeterPriceEditError(500, error));
  }
}

export default function* root() {
  yield all([
    takeLatest(WATER_SERVICE_METER_EDIT_REQUEST, waterServiceMetersEditRequest),
    takeLatest(WATER_SERVICE_METER_PRICE_EDIT_REQUEST, waterServiceMeterPriceEditRequest),
  ]);
}
