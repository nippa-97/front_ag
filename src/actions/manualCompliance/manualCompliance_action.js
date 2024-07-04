import { MANUAL_COPLIANCE_ID_SET, MANUAL_COMPLIANCE_REDIRECT_SET, MANUAL_COMPLIANCE_SEARCH_SET } from "../../constants/mComplianceTypes";

//set manual compliance id to redux
export const complianceIDSetAction = (payload) => {
  return {
    type: MANUAL_COPLIANCE_ID_SET,
    payload
  }
};

//set manual compliance redirect details to redux
export const complianceResetSetAction = (payload) => {
  return {
    type: MANUAL_COMPLIANCE_REDIRECT_SET,
    payload
  }
};

//set manual comp search details
export const complianceSearchAction = (payload) => {
  return {
    type: MANUAL_COMPLIANCE_SEARCH_SET,
    payload
  }
}