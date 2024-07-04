import { PRODUCT_COUNT_SET, PRODUCT_NOTIFI_SET, PRODUCT_DEFAULTSETTINGS, PRODUCT_NOTIFICATION_COUNT_SET } from '../../constants/newProductCountType';

//new products counts object set
export const setNewProdCountAction = (payload) => {
    return {
      type: PRODUCT_COUNT_SET,
      payload
    }
};

//new products redirect object set
export const setNewProdRedirectAction = (payload) => {
    return {
      type: PRODUCT_NOTIFI_SET,
      payload
    }
};

//new products filters default object set
export const setDefaultProdSettingsAction = (payload) => {
    return {
      type: PRODUCT_DEFAULTSETTINGS,
      payload
    }
};

export const setNewProductNotificationCount =(payload)=>{
  return {
    type: PRODUCT_NOTIFICATION_COUNT_SET,
    payload
  }
}
