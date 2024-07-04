
 import { PLANOGRAM_VIEW_SET, PLANOGRAM_VIEW_FIELD, PLANOGRAM_FIELD_HISTORY, PLANOGRAM_FIELD_RECENTPRODS, PLANOGRAM_DETAIL_VIEW_SET, PLANOGRAM_VIEW_ALLOWOVERLAP, PLANOGRAM_VIEW_STORE, PLANOGRAM_IS_NEWDRAFT, PLANOGRAM_DEPARTMENT_GRID } from '../constants/planogTypes';

 const INITIAL_STATE = { PDplanogramDetails:null, planogramDetails: null, pgramFieldDetails: null, pgramFieldRecProds: [], pgramFieldHistory: { past: [], present: 0, future: [] }, pgramFieldAllowOverlap: false, 
 pgramStore: null, pgrmIsNewDraft: false };
  
 const planogramReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case PLANOGRAM_DETAIL_VIEW_SET:
        return {
           ...state,
           PDplanogramDetails: action.payload
        };
      case PLANOGRAM_VIEW_SET:
        return {
           ...state,
           planogramDetails: action.payload
        };
      case PLANOGRAM_VIEW_FIELD:
        return {
           ...state,
           pgramFieldDetails: action.payload
        };
      case PLANOGRAM_FIELD_HISTORY:
        return {
           ...state,
           pgramFieldHistory: action.payload
        };
      case PLANOGRAM_FIELD_RECENTPRODS:
        return {
           ...state,
           pgramFieldRecProds: action.payload
        };
      case PLANOGRAM_VIEW_ALLOWOVERLAP:
        return {
           ...state,
           pgramFieldAllowOverlap: action.payload
        };
      case PLANOGRAM_VIEW_STORE:
        return {
           ...state,
           pgramStore: action.payload
        };
      case PLANOGRAM_IS_NEWDRAFT:
        return {
           ...state,
           pgrmIsNewDraft: action.payload
        };
      case PLANOGRAM_DEPARTMENT_GRID:
        return {
           ...state,
           pgrmDepGrid: action.payload
        };
      default:
        return state;
    }
   };
  
 export  default planogramReducer;