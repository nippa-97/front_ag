
 import { PRODUCT_VIEW_SET, PRODUCT_VIEW_LIST, PRODUCT_AI_LIST, PRODUCT_PREV_PAGE } from '../constants/prodTypes';

const INITIAL_STATE = { prodDetails: null, prodList: null, prodAiList: null, prodPrevDetails: null };
 
const productReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case PRODUCT_VIEW_SET:
        return {
          ...state,
          prodDetails: action.payload
        };
      case PRODUCT_VIEW_LIST:
        return {
          ...state,
          prodList: action.payload
        };
      case PRODUCT_AI_LIST:
        return {
          ...state,
          prodAiList: action.payload
        };
      case PRODUCT_PREV_PAGE:
        return {
          ...state,
          prodPrevDetails: action.payload
        };
      default:
        return state;
    }
  };
 
export default productReducer;