import api from './api';

export const getLocations = async (params = {}) => {
  const res = await api.get('/locations', {
    params,
  });

  return res.data?.data || [];
};

export const getLocationById = async (id) => {
  const res = await api.get(
    `/locations/${id}`
  );

  return res.data?.data;
};

export const createLocation = async (payload) => {
  const res = await api.post(
    '/locations',
    payload
  );

  return res.data?.data || res.data;
};

export const updateLocation = async (
  id,
  payload
) => {
  const res = await api.put(
    `/locations/${id}`,
    payload
  );

  return res.data?.data || res.data;
};

