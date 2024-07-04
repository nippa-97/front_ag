
 import { LANGUAGE_SET } from '../constants/loginTypes';

 const INITIAL_STATE = { languageDetails: { code: "he", text: "Hebrew (עִברִית)" }};

const languageReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case LANGUAGE_SET:
          return {
            ...state,
            languageDetails: action.payload
          };
      default:
        return state;
    }
  };

export default languageReducer;