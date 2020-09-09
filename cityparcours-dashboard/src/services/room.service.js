import axios from 'axios';
import CONFIG from '../config';
import qs from 'qs';
import { logout } from '../../src/actions';
import { configureStore } from '../store';
const { store } = configureStore();

axios.interceptors.response.use(null, (error) => {
  if (error.response && error.response.data === 'Unauthorized') {
    store.dispatch(logout());
  }
  return Promise.reject(error);
});

export const createRoom = (data, token) => axios({
  method: 'post',
  url: `${CONFIG.baseUrl}/rooms`,
  headers: {
    Authorization: token
  },
  data: qs.stringify(data)

}).then(response => response.data.Room);

export const getRooms = token => axios({
  method: 'get',
  url: `${CONFIG.baseUrl}/rooms`,
  headers: { Authorization: token }

}).then(response => response.data);

export const getRoom = (id, token) => axios({
  method: 'get',
  url: `${CONFIG.baseUrl}/rooms/${id}`,
  headers: { Authorization: token }

}).then(response => response.data.Room);

export const deleteCours = (id, token) => axios({
  method: 'delete',
  url: `${CONFIG.baseUrl}/rooms/${id}`,
  headers: { Authorization: token },
});

export const updateRoom = (id, data = {}, token) => axios({
  method: 'put',
  url: `${CONFIG.baseUrl}/rooms/${id}`,
  headers: {
    Authorization: token,
  },
  data: qs.stringify(data),

}).then(response => response.data.success);

export const startRoom = (data = {}) => axios({
  method: 'post',
  url: `${CONFIG.baseUrl}/rooms/start`,
  data: qs.stringify(data),

}).then(response => response.data);

export const startVerifyRoom = (data = {}, token) => axios({
  method: 'post',
  url: `${CONFIG.baseUrl}/rooms/start_verify`,
  headers: {
    Authorization: token,
  },
  data: qs.stringify(data),

}).then(response => response.data);

export const verifyRoom = (roomCode, token) => axios({
  method: 'get',
  url: `${CONFIG.baseUrl}/rooms/verify_room/${roomCode}`,
  headers: {
    Authorization: token,
  }
}).then(response => response.data);
