import { USER_LOGIN, USER_TOKEN, PROFILE } from 'src/actions';

const initialState = {
  isAuthenticated: false,
  userData: {},
  token: '',
};

const sessionReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_LOGIN: {
      return {
        ...state,
        isAuthenticated: action.userData.success,
        userData: action.userData.user
      };
    }

    case USER_TOKEN: {
      return {
        ...state,
        token: action.token,
      };
    }

    case PROFILE: {
      return {
        ...state,
        userData: action.userData.user
      };
    }

    /*case actionTypes.SESSION_LOGOUT: {
      return {
        ...state,
        loggedIn: false,
        user: {
          role: 'GUEST'
        }
      };
    }*/

    default: {
      return state;
    }
  }
};

export default sessionReducer;
