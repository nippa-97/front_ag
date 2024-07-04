
 import { STORE_VIEW_SET } from '../constants/storeTypes';

const INITIAL_STATE = { storeDetails: null };
 
const storeReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case STORE_VIEW_SET:
        return {
          ...state,
          storeDetails: action.payload
        };
      default:
        return state;
    }
  };
 
export default storeReducer;