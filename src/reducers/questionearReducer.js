
 import { QUESTIONEAR_VIEW_SET, QUESTIONEAR_SELECTED_SET } from '../constants/questionearTypes';

const INITIAL_STATE = { questDetails: null, selectedQuestionear: null };
 
const questionReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case QUESTIONEAR_VIEW_SET:
        return {
          ...state,
          questDetails: action.payload
        };
      case QUESTIONEAR_SELECTED_SET:
        return {
          ...state,
          selectedQuestionear: action.payload
        };
      default:
        return state;
    }
  };
 
export default questionReducer;