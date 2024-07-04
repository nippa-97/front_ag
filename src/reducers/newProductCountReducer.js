
import { PRODUCT_COUNT_SET, PRODUCT_NOTIFI_SET, PRODUCT_DEFAULTSETTINGS, PRODUCT_NOTIFICATION_COUNT_SET } from "../constants/newProductCountType";
const INITIAL_STATE = { count: 0, redirectState: null, defaultSettings: null,newProductNotificationCount:0 };
  
 const newProductCountReducer = (state = INITIAL_STATE, action) => {
     switch (action.type) {
       case PRODUCT_COUNT_SET:
         return {
           ...state,
           count: action.payload
         };
       case PRODUCT_NOTIFI_SET:
         return {
           ...state,
           redirectState: action.payload
         }; 
       case PRODUCT_DEFAULTSETTINGS:
         return {
           ...state,
           defaultSettings: action.payload
         };
        case PRODUCT_NOTIFICATION_COUNT_SET:
          return {
            ...state,
            newProductNotificationCount: action.payload
          };
       default:
         return state;
     }
   };
  
 export default newProductCountReducer;