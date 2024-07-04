
 import { DASHBOARD_SEARCH_SET } from '../constants/dashboardTypes';

const INITIAL_STATE = { dashboardSearch: null };
 
const dashboardReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case DASHBOARD_SEARCH_SET:
        return {
          ...state,
          dashboardSearch: action.payload
        };
      default:
        return state;
    }
  };
 
export default dashboardReducer;