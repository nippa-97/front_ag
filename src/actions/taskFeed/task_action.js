import { Task_FEED_VIEW_SET, TASK_FILTER_SET, TASK_SUMMERY_ID_SET, TASK_TABLE_DATA_SET } from "../../constants/taskFeedTypes";


export const viewTaskSetAction = (payload) => {
    return {
      type: Task_FEED_VIEW_SET,
      payload
    }
};


export const TaskSummeryIDSetAction = (payload) => {
  return {
    type: TASK_SUMMERY_ID_SET,
    payload
  }
};

export const taskFilterAction = (payload) => {
  return {
    type: TASK_FILTER_SET,
    payload
  }
};

export const feedTableDataAction = (payload) => {
  return {
    type: TASK_TABLE_DATA_SET,
    payload
  }
};




