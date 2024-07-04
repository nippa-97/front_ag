import { DASHBOARD_SEARCH_SET } from '../../constants/dashboardTypes';

//dashboard search object save
export const searchSetAction = (payload) => {
    return {
      type: DASHBOARD_SEARCH_SET,
      payload
    }
};
