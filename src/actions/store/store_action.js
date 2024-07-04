import { STORE_VIEW_SET } from '../../constants/storeTypes';

//sets store edit view
export const viewSetAction = (payload) => {
    return {
      type: STORE_VIEW_SET,
      payload
    }
};
