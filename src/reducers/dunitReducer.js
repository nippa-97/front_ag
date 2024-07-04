
 import { DUNIT_VIEW_SET, DUNIT_PREV_PAGE } from '../constants/dunitTypes';

const INITIAL_STATE = { dunitDetails: null, dunitPrevDetails: null, };
 
const dunitReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case DUNIT_VIEW_SET:
        return {
          ...state,
          dunitDetails: action.payload
        };
      case DUNIT_PREV_PAGE:
        return {
          ...state,
          dunitPrevDetails: action.payload
        };
      default:
        return state;
    }
  };
 
export default dunitReducer;