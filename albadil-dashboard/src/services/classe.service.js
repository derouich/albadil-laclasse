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

export const createClasse = (data, token) => axios({
  method: 'post',
  url: `${CONFIG.baseUrl}/classes`,
  headers: {
    Authorization: token
  },
  data: qs.stringify(data)

}).then(response => response.data.Classe);

export const getClasses = token => axios({
  method: 'get',
  url: `${CONFIG.baseUrl}/classes`,
  headers: { Authorization: token }

}).then(response => response.data.Classes);

export const getClasse = (id, token) => axios({
  method: 'get',
  url: `${CONFIG.baseUrl}/classes/${id}`,
  headers: { Authorization: token }

}).then(response => response.data.Classe);

export const getClasseParticipant = (id, token) => axios({
  method: 'get',
  url: `${CONFIG.baseUrl}/classes/invited/${id}`,
  headers: { Authorization: token }

}).then(response => response.data.Participants);

export const deleteClasse = (id, token) => axios({
  method: 'delete',
  url: `${CONFIG.baseUrl}/classes/${id}`,
  headers: { Authorization: token },
});

export const updateClasse = (id, data = {}, token) => axios({
  method: 'put',
  url: `${CONFIG.baseUrl}/classes/${id}`,
  headers: {
    Authorization: token,
  },
  data: qs.stringify(data),

}).then(response => response.data.success);

export const getArchivedClasse = (id, token) => axios({
  method: 'get',
  url: `${CONFIG.baseUrl}/classes/archived/${id}`,
  headers: { Authorization: token }

}).then(response => response.data.Classe);

export const getConnectedUserClasses = (token) => axios({
  method: 'get',
  url: `${CONFIG.baseUrl}/my-classes`,
  headers: { Authorization: token }

}).then(response => response.data.Classe);
