
import { USER_VIEW_SET, USER_PREV_PAGE } from "../constants/usersTypes";
const INITIAL_STATE = { selecteduserDetails: null, userPrevPage: null, };
  
 const userReducer = (state = INITIAL_STATE, action) => {
     switch (action.type) {
       case USER_VIEW_SET:
         return {
           ...state,
           selecteduserDetails: action.payload
         };
       case USER_PREV_PAGE:
         return {
           ...state,
           userPrevPage: action.payload
         }; 
       default:
         return state;
     }
   };
  
 export default userReducer;