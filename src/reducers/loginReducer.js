
 import { SIGNIN_SET, NOTIFICATION_SET, PREVPAGE_SET, HOMEPAGE_SET } from '../constants/loginTypes';

const INITIAL_STATE = { signinDetails: false, notifiDetails: null, prevPageDetails: null,HomePage:null };

const loginReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case SIGNIN_SET:
        return {
          ...state,
          signinDetails: action.payload
        };
      case HOMEPAGE_SET:
        return {
          ...state,
          HomePage: action.payload
        };
      case NOTIFICATION_SET:
        return {
          ...state,
          notifiDetails: action.payload
        };
      case PREVPAGE_SET:
        return {
          ...state,
          prevPageDetails: action.payload
        };
      default:
        return state;
    }
  };

export default loginReducer;
