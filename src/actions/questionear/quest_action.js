import { QUESTIONEAR_VIEW_SET, QUESTIONEAR_SELECTED_SET } from '../../constants/questionearTypes';

//set question edit object
export const viewQuestionSetAction = (payload) => {
    return {
      type: QUESTIONEAR_VIEW_SET,
      payload
    }
};

//set selected questionear obj
export const selectedQuestionSetAction = (payload) => {
  return {
    type: QUESTIONEAR_SELECTED_SET,
    payload
  }
};