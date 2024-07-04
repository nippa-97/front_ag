import { DEPARTMENT_VIEW_SET, CHAIN_DEPARTMENT_VIEW_SET, CHAIN_DEPARTMENT_PREV_VIEW_SET, DEPARTMENT_PREV_PAGE } from '../../constants/deptTypes';

//set department edit object
export const viewDepSetAction = (payload) => {
    return {
      type: DEPARTMENT_VIEW_SET,
      payload
    }
};

//set chain department edit object
export const viewSetChainDepAction = (payload) => {
  return {
    type: CHAIN_DEPARTMENT_VIEW_SET,
    payload
  }
};

//set department previous page and open type
export const viewSetDeptPrevAction = (payload) => {
  return {
    type: DEPARTMENT_PREV_PAGE,
    payload
  }
}

//set chain department prev object
export const viewSetChainDepPrevAction = (payload) => {
  return {
    type: CHAIN_DEPARTMENT_PREV_VIEW_SET,
    payload
  }
};
