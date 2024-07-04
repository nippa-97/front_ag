
 import { FLOOR_VIEW_SET, FLOOR_PREV_PAGE } from '../constants/floorTypes';

const INITIAL_STATE = { floorDetails: null, floorPrevDetails: null, };
 
const floorReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case FLOOR_VIEW_SET:
        return {
          ...state,
          floorDetails: action.payload
        };
      case FLOOR_PREV_PAGE:
        return {
          ...state,
          floorPrevDetails: action.payload
        };
      default:
        return state;
    }
  };
 
export default floorReducer;