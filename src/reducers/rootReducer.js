import { combineReducers } from 'redux';

import loginReducer from './loginReducer';
import languageReducer from './languageReducer';
import dunitReducer from './dunitReducer';
import deptReducer from './deptReducer';
import productReducer from './prodReducer';
import floorReducer from './floorReducer';
import  planogramReducer from './planogReducer';

import { SIGNOUT_SET } from '../constants/loginTypes';
import userReducer from './userReducer';
import taskFeedReducer from './taskFeedReducer';
import dashboardReducer from './dashboardReducer';
import questionReducer from './questionearReducer';
import manualComplianceReducer from './manualComplianceReducer';
import masterPlanogramReducer from './masterPlanogramReducer';
import saleLogReducer from './saleLogReducer';
import newProductCountReducer from './newProductCountReducer';
import navigatedataReducer from './navigateDataReducer';
import catelogImportLogReducer from './catelogImportLogReducer';

//combine imported reducers
const appReducer = combineReducers({
  signState: loginReducer,
  langState: languageReducer,
  dunitState: dunitReducer,
  deptState: deptReducer,
  prodState: productReducer,
  floorState:floorReducer,
  planogramState:planogramReducer,
  usersState:userReducer,
  taskFeedState:taskFeedReducer,
  dashboardState:dashboardReducer,
  questionState:questionReducer,
  manualComplianceState:manualComplianceReducer,
  masterPlanogramState:masterPlanogramReducer,
  saleLogState:saleLogReducer,
  newProductCountState: newProductCountReducer,
  catelogImportLogCountState: catelogImportLogReducer,

  navigateState:navigatedataReducer,
});
/**
 * rootreducer using to combine all sub reducers to one state
 * when add new reducer, it has to be import to here and give an unique state name to combine
 *
 * @param {*} state
 * @param {*} action
 * @return {*} 
 */
const rootReducer = (state, action) => {
  if(action.type === SIGNOUT_SET){
    state = undefined
  }
  return appReducer(state, action)
}

export default rootReducer;