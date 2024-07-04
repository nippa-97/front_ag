
 import { DEPARTMENT_VIEW_SET, CHAIN_DEPARTMENT_VIEW_SET, DEPARTMENT_PREV_PAGE, CHAIN_DEPARTMENT_PREV_VIEW_SET } from '../constants/deptTypes';

const INITIAL_STATE = { deptDetails: null, chainDepartmentDetails:null, chainDepPrevData:null, deptPrevDetails: null };
 
const masterdataReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case DEPARTMENT_VIEW_SET:
        return {
          ...state,
          deptDetails: action.payload
        };
      case CHAIN_DEPARTMENT_VIEW_SET:
          return {
            ...state,
            chainDepartmentDetails: action.payload
          };
      case DEPARTMENT_PREV_PAGE:
          return {
            ...state,
            deptPrevDetails: action.payload
          };
      case CHAIN_DEPARTMENT_PREV_VIEW_SET:
        return {
          ...state,
          chainDepPrevData: action.payload
        };
      default:
        return state;
    }
  };
 
export default masterdataReducer;