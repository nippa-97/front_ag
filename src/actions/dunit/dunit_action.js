import { DUNIT_VIEW_SET, DUNIT_PREV_PAGE } from '../../constants/dunitTypes';

//set display unit edit object
export const viewSetAction = (payload) => {
    return {
      type: DUNIT_VIEW_SET,
      payload
    }
};

//set display unit pagination object
export const viewSetPrevDunit = (payload) => {
  return {
    type: DUNIT_PREV_PAGE,
    payload
  }
};