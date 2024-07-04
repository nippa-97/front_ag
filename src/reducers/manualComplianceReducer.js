import { MANUAL_COPLIANCE_ID_SET, MANUAL_COMPLIANCE_REDIRECT_SET, MANUAL_COMPLIANCE_SEARCH_SET } from "../constants/mComplianceTypes";

const INITIAL_STATE = { manualComplianceId: null, manualCompRedirect: null, manualComSearch: null };
 
const manualComplianceReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case MANUAL_COPLIANCE_ID_SET:
        return {
          ...state,
          manualComplianceId: action.payload
        };
      case MANUAL_COMPLIANCE_REDIRECT_SET:
        return {
          ...state,
          manualCompRedirect: action.payload
        };
      case MANUAL_COMPLIANCE_SEARCH_SET:
        return {
          ...state,
          manualComSearch: action.payload
        };
      default:
        return state;
    }
  };
 
export default manualComplianceReducer;