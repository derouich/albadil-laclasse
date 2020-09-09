import axios from 'axios';
import CONFIG from '../config';
import { logout } from '../../src/actions';
import { configureStore } from '../store';
import qs from 'qs';
const { store } = configureStore();

axios.interceptors.response.use(null, (error) => {
  if (error.response && error.response.data === 'Unauthorized') {
    store.dispatch(logout());
  }
  return Promise.reject(error);
});

export const login = credentials => axios({
  method: 'post',
  url: `${CONFIG.baseUrl}/login`,
  data: credentials,
}).then(response => response.data);

export const register = userData => axios({
  method: 'post',
  url: `${CONFIG.baseUrl}/register`,
  data: userData,
}).then(response => response.data);

export const inviteUsers = (data, token) => axios({
  method: 'post',
  url: `${CONFIG.baseUrl}/users/invite`,
  headers: {
    Authorization: token
  },
  data: qs.stringify(data)

}).then(response => response.data.Invited);

export const getConnectedUser = (token) => axios({
  method: 'get',
  url: `${CONFIG.baseUrl}/user/me`,
  headers: { Authorization: token }

}).then(response => response.data.User);

export const updateConnectedUser = (data, token) => axios({
  method: 'post',
  url: `${CONFIG.baseUrl}/user/me`,
  headers: {
    Authorization: token
  },
  data: qs.stringify(data)

}).then(response => response.data);

export const activateUser = (verificationToken, email) => axios({
  method: 'get',
  url: `${CONFIG.baseUrl}/user/activation?token=${verificationToken}&email=${email}`,

}).then(response => response.data.message);

export const forgotPassword = (data) => axios({
  method: 'post',
  url: `${CONFIG.baseUrl}/user/forgot_password`,
  data: qs.stringify(data)

}).then(response => response.data);

export const resetPassword = (data) => axios({
  method: 'post',
  url: `${CONFIG.baseUrl}/user/reset_password`,
  data: qs.stringify(data)

}).then(response => response.data);

export const deleteUser = (userId, classeId, token) => axios({
  method: 'delete',
  url: `${CONFIG.baseUrl}/users/${userId}/classe/${classeId}`,
  headers: { Authorization: token },
});

export const deleteInvitedUser = (email, thingId, token) => axios({
  method: 'delete',
  url: `${CONFIG.baseUrl}/users/${email}/${thingId}`,
  headers: { Authorization: token },
});

export const deleteAccount = (token) => axios({
  method: 'post',
  url: `${CONFIG.baseUrl}/user/delete-account`,
  headers: { Authorization: token },
});
