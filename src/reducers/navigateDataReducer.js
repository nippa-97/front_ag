import { NAVIGATE_DATA_SET } from '../constants/navigatedataTypes';

const INITIAL_STATE = { navigateDetails: null };

const navigatedataReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case NAVIGATE_DATA_SET:
        return {
          ...state,
          navigateDetails: action.payload
        };
      default:
        return state;
    }
  };
 
export default navigatedataReducer;