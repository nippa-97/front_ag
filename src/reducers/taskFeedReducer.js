import { Task_FEED_VIEW_SET, TASK_FILTER_SET, TASK_SUMMERY_ID_SET, TASK_TABLE_DATA_SET } from "../constants/taskFeedTypes";


const INITIAL_STATE = { taskDetails: null, taskSummeryID: null,taskfilterDetails:null,tasktableDetails:null };

const taskFeedReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Task_FEED_VIEW_SET:
      return {
        ...state,
        taskDetails: action.payload
      };
    case TASK_SUMMERY_ID_SET:
      return {
        ...state,
        taskSummeryID: action.payload
      };
    case TASK_FILTER_SET:
      return {
        ...state,
        taskfilterDetails: action.payload
      };
      case TASK_TABLE_DATA_SET:
      return {
        ...state,
        tasktableDetails: action.payload
      };

    default:
      return state;
  }
};

export default taskFeedReducer;