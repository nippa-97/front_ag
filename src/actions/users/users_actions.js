import { USER_VIEW_SET, USER_PREV_PAGE } from "../../constants/usersTypes";

//edit object set
export const viewUsersSetAction = (payload) => {
    return {
      type: USER_VIEW_SET,
      payload
    }
};

//previous pagination set
export const setUserPrevDetails = (payload) => {
    return {
      type: USER_PREV_PAGE,
      payload
    }
};

