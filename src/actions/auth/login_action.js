import { SIGNIN_SET, SIGNOUT_SET, LANGUAGE_SET, NOTIFICATION_SET, PREVPAGE_SET, HOMEPAGE_SET } from '../../constants/loginTypes';

//login object save
export const loginAction = (payload) => {
    return {
      type: SIGNIN_SET,
      payload
    }
};
//login object save
export const setHomePageAction = (payload) => {
  return {
    type: HOMEPAGE_SET,
    payload
  }
};
//logout action triggerr
export const logoutAction = (payload) => {
  return {
    type: SIGNOUT_SET,
    payload
  }
};
//loaded notifications list save
export const notifiAction = (payload) => {
  return {
    type: NOTIFICATION_SET,
    payload
  }
};
//language object save
export const languageAction = (payload) => {
  return {
    type: LANGUAGE_SET,
    payload
  }
};
//previous page keep in redux for redirect purpose on change some values like storeid
export const prevPageAction = (payload) => {
  return {
    type: PREVPAGE_SET,
    payload
  }
}; 
