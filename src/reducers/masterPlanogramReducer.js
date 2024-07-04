
 import { SELECTED_MP_DETAILS, SELECTED_CATEGORY_DETAILS, SELECTED_CATEGORY_RECT, SELECTED_SUBCATEGORY_DETAILS, SELECTED_BRAND_DETAILS, MP_EDIT_ONE_CATEGORY_DETAILS,
  MP_CAT_DATA_CACHE, MP_CAT_NAVIGATE_CACHE, MP_SCAT_DATA_CACHE, MP_SCAT_NAVIGATE_CACHE, MP_BRAND_DATA_CACHE, MP_BRAND_NAVIGATE_CACHE, MP_LOADED_DEPARTMENTS, MP_STACKABLE_MARK_LIST, MP_VERSION_NAME, NEW_REFRESH, FILTER_DATES,
  MP_DEPT_SEARCH, 
  MP_EDIT_STACK_HISTORY,
  MP_FULL_SCREEN_SAVE_RES,
  // MP_CACHE_CLIPBOARD_N_OTHERS,
  AUI_MD_REDIRECT, NEW_PROD_COUNT_CAT, NEW_PROD_COUNT_SUBCAT, AUI_CONVERTED_DETAILS, AFFECTED_SIMULATIONS_MODAL_DATA, SIMULATION_PRODUCTSEARCH_DATA} from '../constants/masterPlanogramTypes';

const INITIAL_STATE = { mpDetails: null, mpCatDetails: null, mpSubCatDetails: null, mpBrandDetails: null, mpChnagesofOnecategoryDetail: null,
  mpCatDataCache: null, mpCatNavCache: null, mpScatDataCache: null, mpScatNavCache: null, mpBrandDataCache: null, mpBrandNavCache: null, mpLoadedDepartments:null,mpStackableProdList:null, 
  mpDeptSearch: null,mpstackHistory:null,mpFullscreenEditObj:null, filterDates:null,
  // mpClipoardnOther:[],
   auiRedirect: null,
   auiConvertedDetails:null,
   AffectedSimulationsModalData:null,
   simulationProductSearchData:null,
};
 
const masterPlanogramReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case SELECTED_MP_DETAILS:
        return {
          ...state,
          mpDetails: action.payload
        };
      case SELECTED_CATEGORY_DETAILS:
        return {
          ...state,
          mpCatDetails: action.payload
        };
      case SELECTED_CATEGORY_RECT:
        return {
          ...state,
          mpCatRectDetails: action.payload
        };
      case SELECTED_SUBCATEGORY_DETAILS:
        return {
          ...state,
          mpSubCatDetails: action.payload
        };  
      case SELECTED_BRAND_DETAILS:
        return {
          ...state,
          mpBrandDetails: action.payload
        };  
      case MP_EDIT_ONE_CATEGORY_DETAILS:
        return {
          ...state,
          mpChnagesofOnecategoryDetail: action.payload
        }; 
      case MP_CAT_DATA_CACHE:
        return {
          ...state,
          mpCatDataCache: action.payload
        };
      case MP_CAT_NAVIGATE_CACHE:
        return {
          ...state,
          mpCatNavCache: action.payload
        };
      case MP_SCAT_DATA_CACHE:
        return {
          ...state,
          mpScatDataCache: action.payload
        };
      case MP_SCAT_NAVIGATE_CACHE:
        return {
          ...state,
          mpScatNavCache: action.payload
        }; 
      case MP_BRAND_DATA_CACHE:
        return {
          ...state,
          mpBrandDataCache: action.payload
        }; 
      case MP_BRAND_NAVIGATE_CACHE:
        return {
          ...state,
          mpBrandNavCache: action.payload
        };
      case MP_LOADED_DEPARTMENTS:
        return {
          ...state,
          mpLoadedDepartments :action.payload
        }
      case MP_STACKABLE_MARK_LIST:
      return {
        ...state,
        mpStackableProdList :action.payload
      }
      case MP_VERSION_NAME:
      return{
        ...state,
        mpVersionName :action.payload
      }
      case FILTER_DATES:
      return{
        ...state,
        filterDates :action.payload
      }
      case NEW_REFRESH:
      return{
        ...state,
        newRefresh :action.payload
      }
      case MP_DEPT_SEARCH:
      return{
        ...state,
        mpDeptSearch :action.payload
      }
      case MP_EDIT_STACK_HISTORY:
      return{
        ...state,
        mpstackHistory :action.payload
      }
      case MP_FULL_SCREEN_SAVE_RES:
      return{
        ...state,
        mpFullscreenEditObj :action.payload
      }
      // case MP_CACHE_CLIPBOARD_N_OTHERS:
      // return{
      //   ...state,
      //   mpClipoardnOther :action.payload
      // }
      case AUI_MD_REDIRECT:
      return{
        ...state,
        auiRedirect :action.payload
      }
      case NEW_PROD_COUNT_CAT:
      return{
        ...state,
        newProdCountCat : action.payload
      }
      case NEW_PROD_COUNT_SUBCAT:
      return{
        ...state,
        newProdCountSubCat : action.payload
      }
      case AUI_CONVERTED_DETAILS:
      return{
        ...state,
        auiConvertedDetails : action.payload
      }
      case AFFECTED_SIMULATIONS_MODAL_DATA:
      return{
        ...state,
        AffectedSimulationsModalData : action.payload
      }
      case SIMULATION_PRODUCTSEARCH_DATA:
      return{
        ...state,
        simulationProductSearchData : action.payload
      }
      
      default:
        return state;
    }
  };
 
export default masterPlanogramReducer;