import { NAVIGATE_DATA_SET } from '../../constants/navigatedataTypes';

export const setNavigationAction = (payload) => {
    return {
      type: NAVIGATE_DATA_SET,
      payload
    }
};
