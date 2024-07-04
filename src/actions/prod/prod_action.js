import { PRODUCT_VIEW_SET, PRODUCT_VIEW_LIST, PRODUCT_AI_LIST, PRODUCT_PREV_PAGE } from '../../constants/prodTypes';

//products edit object set
export const viewSetAction = (payload) => {
    return {
      type: PRODUCT_VIEW_SET,
      payload
    }
};

//keeps loaded all products onsignin
export const loadProdsAction = (payload) => {
    return {
      type: PRODUCT_VIEW_LIST,
      payload
    }
};

//keeps loaded all products onsignin
export const loadProdsAiAction = (payload) => {
    return {
      type: PRODUCT_AI_LIST,
      payload
    }
};

//set product previous page and open type
export const viewSetProdPrevAction = (payload) => {
  return {
    type: PRODUCT_PREV_PAGE,
    payload
  }
}