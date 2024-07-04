import { PLANOGRAM_VIEW_FIELD, PLANOGRAM_VIEW_SET, PLANOGRAM_FIELD_HISTORY, PLANOGRAM_FIELD_RECENTPRODS,PLANOGRAM_DETAIL_VIEW_SET, PLANOGRAM_VIEW_ALLOWOVERLAP, PLANOGRAM_VIEW_STORE, PLANOGRAM_IS_NEWDRAFT, PLANOGRAM_DEPARTMENT_GRID } from '../../constants/planogTypes';

//set planogram loaded layout details object
export const PDviewDataAction = (payload) => {
  return {
    type: PLANOGRAM_DETAIL_VIEW_SET,
    payload
  }
};
//set toload planogram details object
export const viewSetAction = (payload) => {
    return {
      type: PLANOGRAM_VIEW_SET,
      payload
    }
};
//set planogram display unit view object
export const viewFieldAction = (payload) => {
  return {
    type: PLANOGRAM_VIEW_FIELD,
    payload
  }
};
//to keep done changes to planogram field - not using
export const historyFieldAction = (payload) => {
  return {
    type: PLANOGRAM_FIELD_HISTORY,
    payload
  }
};
//keeps recently added products list
export const recprodsFieldAction = (payload) => {
  return {
    type: PLANOGRAM_FIELD_RECENTPRODS,
    payload
  }
};
//isallowoverlap boolean set
export const setFieldOverlapAction = (payload) => {
  return {
    type: PLANOGRAM_VIEW_ALLOWOVERLAP,
    payload
  }
};
//sets selected planogram store
export const setFieldStoreAction = (payload) => {
  return {
    type: PLANOGRAM_VIEW_STORE,
    payload
  }
};
//sets is new draft
export const setFieldIsNewDraft = (payload) => {
  return {
    type: PLANOGRAM_IS_NEWDRAFT,
    payload
  }
};
//sets dates of department grid filter
export const setDepGridDates = (payload) => {
  return {
    type: PLANOGRAM_DEPARTMENT_GRID,
    payload
  }
};