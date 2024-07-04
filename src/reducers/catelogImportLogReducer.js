import { CATELOUEIMPORT_COUNT_NOTIFI_SET, CATELOUEIMPORT_COUNT_SET } from "../constants/catelogueImportLogTypes";

const INITIAL_STATE = { count: 0, redirectState: null };
  
 const catelogImportLogReducer = (state = INITIAL_STATE, action) => {
     switch (action.type) {
       case CATELOUEIMPORT_COUNT_SET:
         return {
           ...state,
           count: action.payload
         };
         case CATELOUEIMPORT_COUNT_NOTIFI_SET:
            return {
              ...state,
              redirectState: action.payload
            }; 
       default:
         return state;
     }
   };
  
 export default catelogImportLogReducer;