import { FLOOR_VIEW_SET, FLOOR_PREV_PAGE } from '../../constants/floorTypes';

//set floor layout edit object
export const viewSetAction = (payload) => {
    return {
      type: FLOOR_VIEW_SET,
      payload
    }
};

//previous pagination set
export const setFloorPrevDetails = (payload) => {
  return {
    type: FLOOR_PREV_PAGE,
    payload
  }
};

