
import { SALE_LOG_WARNING_SET } from '../constants/saleLogTypes';

 const INITIAL_STATE = { WarningDetails: [],SaleLogPageDetails:null };
  
 const saleLogReducer = (state = INITIAL_STATE, action) => {
     switch (action.type) {
       case SALE_LOG_WARNING_SET:
         return {
           ...state,
           WarningDetails: action.payload
         };
        
       
       default:
         return state;
     }
   };
  
 export default saleLogReducer;