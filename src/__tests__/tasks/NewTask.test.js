import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store'
import { NewTask } from '../../components/task/newTask/newTask';
import { Provider } from "react-redux";
import { submitSets } from '../../components/UiComponents/SubmitSets';
import { alertService } from '../../_services/alert.service';

import { TRANSLATIONS_EN } from '../../_translations/en/translations';

var editResponse = {
    "taskCategory": [
        {
            "categoryCode": "002",
            "categoryColor": "#0000",
            "categoryName": "Task Category 2",
            "categoryId": 2,
            "taskHasCategoryId": 432,
            "isNew": false,
            "isDelete": false
        }
    ],
    "taskApproversDtoList": [
        {
            "approverUuid": "20",
            "approverRole": "CEO",
            "id": 499,
            "isNew": false,
            "isDelete": false,
            "userDto": {
                "name": "ceo ceo last",
                "firstName": "ceo",
                "lastName": "ceo last",
                "userUUID": "20",
                "userId": 20,
                "userRolls": {
                    "parentUserRoles": [],
                    "chieldsUserRoles": [
                        {
                            "rollId": 5,
                            "uuid": "5",
                            "rank": 4,
                            "level": "Chain",
                            "rollName": "Planner"
                        },
                        {
                            "rollId": 3,
                            "uuid": "3",
                            "rank": 2,
                            "level": "Region",
                            "rollName": "Region Manager"
                        },
                        {
                            "rollId": 4,
                            "uuid": "4",
                            "rank": 3,
                            "level": "Store",
                            "rollName": "Store Manager"
                        },
                        {
                            "rollId": 1,
                            "uuid": "1",
                            "rank": 7,
                            "level": "Store",
                            "rollName": "Worker"
                        },
                        {
                            "rollId": 17,
                            "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7",
                            "rank": 8,
                            "level": "Store",
                            "rollName": "security"
                        }
                    ],
                    "rollUUID": "2",
                    "name": "CEO",
                    "rank": 1,
                    "uuid": "2",
                    "systemMainRoleType": "CEO",
                    "userLevel": "Chain",
                    "storeUUID": "9",
                    "storeName": "Store 9",
                    "storeId": 9
                }
            }
        }
    ],
    "taskAllocationDtoList": [
        {
            "taskAllcationDetailDto": [],
            "allocatorUuid": "20",
            "reciverRole": "Region_Manager",
            "taskAllocationId": 653,
            "taskAllocationType": "custom",
            "isNew": false,
            "isDelete": false,
            "userDto": {
                "name": "ceo ceo last",
                "firstName": "ceo",
                "lastName": "ceo last",
                "userUUID": "20",
                "userId": 20,
                "userRolls": {
                    "parentUserRoles": [],
                    "chieldsUserRoles": [
                        {
                            "rollId": 5,
                            "uuid": "5",
                            "rank": 4,
                            "level": "Chain",
                            "rollName": "Planner"
                        },
                        {
                            "rollId": 3,
                            "uuid": "3",
                            "rank": 2,
                            "level": "Region",
                            "rollName": "Region Manager"
                        },
                        {
                            "rollId": 4,
                            "uuid": "4",
                            "rank": 3,
                            "level": "Store",
                            "rollName": "Store Manager"
                        },
                        {
                            "rollId": 1,
                            "uuid": "1",
                            "rank": 7,
                            "level": "Store",
                            "rollName": "Worker"
                        },
                        {
                            "rollId": 17,
                            "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7",
                            "rank": 8,
                            "level": "Store",
                            "rollName": "security"
                        }
                    ],
                    "rollUUID": "2",
                    "name": "CEO",
                    "rank": 1,
                    "uuid": "2",
                    "systemMainRoleType": "CEO",
                    "userLevel": "Chain",
                    "storeUUID": "9",
                    "storeName": "Store 9",
                    "storeId": 9
                }
            }
        },
        {
            "taskAllcationDetailDto": [
                {
                    "reciverUuid": "21",
                    "isBottomLevel": false,
                    "taskAllocationDetailsId": 1048,
                    "taskAllocationStatus": "pending",
                    "isNew": false,
                    "isDelete": false,
                    "userDto": {
                        "name": "region regino last",
                        "firstName": "region",
                        "lastName": "regino last",
                        "userUUID": "21",
                        "userId": 21,
                        "userRolls": {
                            "parentUserRoles": [
                                {
                                    "rollId": 5,
                                    "uuid": "5",
                                    "rank": 4,
                                    "level": "Chain",
                                    "rollName": "Planner"
                                },
                                {
                                    "rollId": 2,
                                    "uuid": "2",
                                    "rank": 1,
                                    "level": "Chain",
                                    "rollName": "CEO"
                                }
                            ],
                            "chieldsUserRoles": [
                                {
                                    "rollId": 4,
                                    "uuid": "4",
                                    "rank": 3,
                                    "level": "Store",
                                    "rollName": "Store Manager"
                                },
                                {
                                    "rollId": 1,
                                    "uuid": "1",
                                    "rank": 7,
                                    "level": "Store",
                                    "rollName": "Worker"
                                },
                                {
                                    "rollId": 17,
                                    "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7",
                                    "rank": 8,
                                    "level": "Store",
                                    "rollName": "security"
                                }
                            ],
                            "rollUUID": "3",
                            "name": "Region Manager",
                            "rank": 2,
                            "uuid": "3",
                            "systemMainRoleType": "Region_Manager",
                            "regionName": "Northan",
                            "regionUUID": "1",
                            "userLevel": "Region"
                        }
                    },
                    "isTaskAttended": false,
                    "isAllocate": false
                }
            ],
            "allocatorUuid": "20",
            "reciverRole": "Region_Manager",
            "taskAllocationId": 654,
            "taskAllocationType": "custom",
            "isNew": false,
            "isDelete": false,
            "userDto": {
                "name": "ceo ceo last",
                "firstName": "ceo",
                "lastName": "ceo last",
                "userUUID": "20",
                "userId": 20,
                "userRolls": {
                    "parentUserRoles": [],
                    "chieldsUserRoles": [
                        {
                            "rollId": 5,
                            "uuid": "5",
                            "rank": 4,
                            "level": "Chain",
                            "rollName": "Planner"
                        },
                        {
                            "rollId": 3,
                            "uuid": "3",
                            "rank": 2,
                            "level": "Region",
                            "rollName": "Region Manager"
                        },
                        {
                            "rollId": 4,
                            "uuid": "4",
                            "rank": 3,
                            "level": "Store",
                            "rollName": "Store Manager"
                        },
                        {
                            "rollId": 1,
                            "uuid": "1",
                            "rank": 7,
                            "level": "Store",
                            "rollName": "Worker"
                        },
                        {
                            "rollId": 17,
                            "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7",
                            "rank": 8,
                            "level": "Store",
                            "rollName": "security"
                        }
                    ],
                    "rollUUID": "2",
                    "name": "CEO",
                    "rank": 1,
                    "uuid": "2",
                    "systemMainRoleType": "CEO",
                    "userLevel": "Chain",
                    "storeUUID": "9",
                    "storeName": "Store 9",
                    "storeId": 9
                }
            }
        },
        {
            "taskAllcationDetailDto": [
                {
                    "reciverUuid": "24",
                    "isBottomLevel": false,
                    "taskAllocationDetailsId": 629,
                    "taskAllocationStatus": "pending",
                    "isNew": false,
                    "isDelete": false,
                    "userDto": {
                        "name": "Region manager 2",
                        "firstName": "Region",
                        "lastName": "manager 2",
                        "userUUID": "24",
                        "userId": 24,
                        "userRolls": {
                            "parentUserRoles": [
                                {
                                    "rollId": 5,
                                    "uuid": "5",
                                    "rank": 4,
                                    "level": "Chain",
                                    "rollName": "Planner"
                                },
                                {
                                    "rollId": 2,
                                    "uuid": "2",
                                    "rank": 1,
                                    "level": "Chain",
                                    "rollName": "CEO"
                                }
                            ],
                            "chieldsUserRoles": [
                                {
                                    "rollId": 4,
                                    "uuid": "4",
                                    "rank": 3,
                                    "level": "Store",
                                    "rollName": "Store Manager"
                                },
                                {
                                    "rollId": 1,
                                    "uuid": "1",
                                    "rank": 7,
                                    "level": "Store",
                                    "rollName": "Worker"
                                },
                                {
                                    "rollId": 17,
                                    "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7",
                                    "rank": 8,
                                    "level": "Store",
                                    "rollName": "security"
                                }
                            ],
                            "rollUUID": "3",
                            "name": "Region Manager",
                            "rank": 2,
                            "uuid": "5",
                            "systemMainRoleType": "Region_Manager",
                            "regionName": "Central",
                            "regionUUID": "2",
                            "userLevel": "Region",
                            "storeUUID": "9",
                            "storeName": "Store 9",
                            "storeId": 9
                        }
                    },
                    "isTaskAttended": false,
                    "isAllocate": false
                }
            ],
            "allocatorUuid": "20",
            "reciverRole": "Region_Manager",
            "taskAllocationId": 655,
            "taskAllocationType": "custom",
            "isNew": false,
            "isDelete": false,
            "userDto": {
                "name": "ceo ceo last",
                "firstName": "ceo",
                "lastName": "ceo last",
                "userUUID": "20",
                "userId": 20,
                "userRolls": {
                    "parentUserRoles": [],
                    "chieldsUserRoles": [
                        {
                            "rollId": 5,
                            "uuid": "5",
                            "rank": 4,
                            "level": "Chain",
                            "rollName": "Planner"
                        },
                        {
                            "rollId": 3,
                            "uuid": "3",
                            "rank": 2,
                            "level": "Region",
                            "rollName": "Region Manager"
                        },
                        {
                            "rollId": 4,
                            "uuid": "4",
                            "rank": 3,
                            "level": "Store",
                            "rollName": "Store Manager"
                        },
                        {
                            "rollId": 1,
                            "uuid": "1",
                            "rank": 7,
                            "level": "Store",
                            "rollName": "Worker"
                        },
                        {
                            "rollId": 17,
                            "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7",
                            "rank": 8,
                            "level": "Store",
                            "rollName": "security"
                        }
                    ],
                    "rollUUID": "2",
                    "name": "CEO",
                    "rank": 1,
                    "uuid": "2",
                    "systemMainRoleType": "CEO",
                    "userLevel": "Chain",
                    "storeUUID": "9",
                    "storeName": "Store 9",
                    "storeId": 9
                }
            }
        }
    ],
    "requestedFeedbackDto": [
        {
            "requestedFeedbackOption": [],
            "feedbackType": null,
            "feedbackTypeId": 6,
            "priorityLevel": 2,
            "question": "-",
            "requestedFeedbackId": 595,
            "requiredAnwserCount": "0",
            "id": 595,
            "isNew": false,
            "isDelete": false
        },
        {
            "requestedFeedbackOption": [],
            "feedbackType": null,
            "feedbackTypeId": 2,
            "priorityLevel": 4,
            "question": "-",
            "requestedFeedbackId": 596,
            "requiredAnwserCount": "0",
            "id": 596,
            "isNew": false,
            "isDelete": false
        }
    ],
    "taskHasUserGroups": [],
    "description": "Desc",
    "endDateTime": "2021-08-24T13:00:00.000Z",
    "fieldId": null,
    "fieldUUid": null,
    "floorLayoutUUid": null,
    "isDeadLineTask": false,
    "isRepeatingTask": false,
    "startDateTime": "2021-08-24T05:40:37.000Z",
    "taskId": 468,
    "taskPriority": "HIGH",
    "taskType": "due task",
    "title": "Test by Na 36 - Image ",
    "updateFutureTask": false,
    "taskCreatedUserUUID": "20",
    "taskApproverType": "custom",
    "isMustUseCamera": false,
    "isUseQuestionnaire": false,
    "isNew": false,
    "isDelete": false,
    "taskRepeatDetails": {
        "taskRepeatListDto": [
            {
                "taskDay": null,
                "endTime": "16:00:00",
                "startTime": "08:00:00",
                "customDate": "2021-08-24T00:00:00.000Z"
            }
        ],
        "repeatDateRank": "first Week",
        "yearyDate": null,
        "taskRepeatEndDate": "2023-08-24T05:40:21.000Z",
        "taskRepeatStartDate": "2021-08-24T05:40:21.000Z",
        "isTimeFrameTask": false,
        "month": null,
        "repeatType": "One Time",
        "isNeverEndingtask": true,
        "taskDay": null,
        "id": 155,
        "startTime": null,
        "endTime": null
    }
}
var taskFeedState = {
    // taskSummeryID:{taskId:1504,isApprover:false,isBottomLevel:false,taskStartDateTime:"2021-12-14T13:45:26.000Z",isRequestPhoto:false,isRequestVideo:false},
    taskDetails: editResponse
}
var signedobjCEO = {
    signinDetails: {
        "webNotificationToken": [], "id": 20, "userUUID": "20", "storeId": 9, "storeName": "Store 9", "storeAddress": null, "storeTel": "0112121235",
        "userRolls": {
            "userAccessService": [], "parentUserRoles": [],
            "chieldsUserRoles": [{ "rollId": 5, "uuid": "5", "rank": 4, "level": "Chain", "rollName": "Planner" }, { "rollId": 3, "uuid": "3", "rank": 2, "level": "Region", "rollName": "Region Manager" }, { "rollId": 4, "uuid": "4", "rank": 3, "level": "Store", "rollName": "Store Manager" }, {
                "rollId": 1,
                "uuid": "1",
                "rank": 7,
                "level": "Store",
                "rollName": "Worker"
            },
            {
                "rollId": 17,
                "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7",
                "rank": 8,
                "level": "Store",
                "rollName": "security"
            }
            ],
            "storeName": "Store 9",
            "storeUUID": "9",
            "storeId": 9,
            "name": "CEO",
            "rank": 1,
            "rollUUID": "2",
            "systemMainRoleType": "CEO",
            "uuid": "2",
            "userLevel": "Chain"
        },
        "userDto": {
            "email": "planigoCeo@outlook.com",
            "fName": "ceo",
            "lName": "ceo last"
        }
    }
}
var workerList = [
    { "userGroupDetails": [], "parentUserRoles": [], "chieldsUserRoles": [], "storeId": 9, "storeName": "Store 9", "storeUUID": "9", "userFirstName": "Worker", "userId": 25, "userLastName": "Emploer 2", "userUUID": "25", "rollName": "Worker", "rollUUID": "1", "systemMainRoleType": "Worker", "roleUserLevel": "Store", "regionId": 2, "regionName": "Central", "regionUUID": "2", "rollRank": 7 },
    { "userGroupDetails": [], "parentUserRoles": [], "chieldsUserRoles": [], "storeId": 8, "storeName": "Store 8", "storeUUID": "8", "userFirstName": "Worker", "userId": 26, "userLastName": "Employer 3", "userUUID": "26", "rollName": "Worker", "rollUUID": "1", "systemMainRoleType": "Worker", "roleUserLevel": "Store", "regionId": 1, "regionName": "Northan", "regionUUID": "1", "rollRank": 7 },
]
var regionList = [
    {
        "parentUserRoles": [{ "rollId": 5, "uuid": "5", "rank": 4, "level": "Chain", "rollName": "Planner" }, { "rollId": 2, "uuid": "2", "rank": 1, "level": "Chain", "rollName": "CEO" }],
        "chieldsUserRoles": [
            { "rollId": 4, "uuid": "4", "rank": 3, "level": "Store", "rollName": "Store Manager" },
            { "rollId": 1, "uuid": "1", "rank": 7, "level": "Store", "rollName": "Worker" },
            { "rollId": 17, "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7", "rank": 8, "level": "Store", "rollName": "security" }
        ],
        "regionId": 1, "regionName": "Northan", "regionUUID": "1", "userFirstName": "region", "userId": 21, "userLastName": "regino last", "userUUID": "21", "rollName": "Region Manager", "rollUUID": "3",
        "systemMainRoleType": "Region_Manager", "roleUserLevel": "Region", "rollRank": 2
    },
    {
        "parentUserRoles": [
            {
                "rollId": 5,
                "uuid": "5",
                "rank": 4,
                "level": "Chain",
                "rollName": "Planner"
            },
            {
                "rollId": 2,
                "uuid": "2",
                "rank": 1,
                "level": "Chain",
                "rollName": "CEO"
            }
        ],
        "chieldsUserRoles": [
            {
                "rollId": 4,
                "uuid": "4",
                "rank": 3,
                "level": "Store",
                "rollName": "Store Manager"
            },
            {
                "rollId": 1,
                "uuid": "1",
                "rank": 7,
                "level": "Store",
                "rollName": "Worker"
            },
            {
                "rollId": 17,
                "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7",
                "rank": 8,
                "level": "Store",
                "rollName": "security"
            }
        ],
        "regionId": 2,
        "regionName": "Central",
        "regionUUID": "2",
        "userFirstName": "Region",
        "userId": 24,
        "userLastName": "manager 2",
        "userUUID": "24",
        "rollName": "Region Manager",
        "rollUUID": "3",
        "systemMainRoleType": "Region_Manager",
        "roleUserLevel": "Region",
        "rollRank": 2
    },]

var allocatorRegionNothern = {
    "taskAllcationDetailDto": [
        {
            "reciverUuid": "21",
            "isBottomLevel": false,
            "taskAllocationDetailsId": 3435,
            "taskAllocationStatus": "pending",
            "isNew": false,
            "isDelete": false,
            "userDto": {
                "name": "region regino last",
                "firstName": "region",
                "lastName": "regino last",
                "userUUID": "21",
                "userId": 21,
                "userRolls": {
                    "parentUserRoles": [
                        {
                            "rollId": 5,
                            "uuid": "5",
                            "rank": 4,
                            "level": "Chain",
                            "rollName": "Planner"
                        },
                        {
                            "rollId": 2,
                            "uuid": "2",
                            "rank": 1,
                            "level": "Chain",
                            "rollName": "CEO"
                        }
                    ],
                    "chieldsUserRoles": [
                        {
                            "rollId": 4,
                            "uuid": "4",
                            "rank": 3,
                            "level": "Store",
                            "rollName": "Store Manager"
                        },
                        {
                            "rollId": 1,
                            "uuid": "1",
                            "rank": 7,
                            "level": "Store",
                            "rollName": "Worker"
                        },
                        {
                            "rollId": 17,
                            "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7",
                            "rank": 8,
                            "level": "Store",
                            "rollName": "security"
                        }
                    ],
                    "rollUUID": "3",
                    "name": "Region Manager",
                    "rank": 2,
                    "uuid": "3",
                    "systemMainRoleType": "Region_Manager",
                    "regionName": "Northan",
                    "regionUUID": "1",
                    "userLevel": "Region"
                }
            },
            "isTaskAttended": false,
            "isAllocate": false
        }
    ],
    "allocatorUuid": "20",
    "reciverRole": "Region_Manager",
    "taskAllocationId": 4032,
    "taskAllocationType": "custom",
    "isNew": false,
    "isDelete": false,
    "userDto": {
        "name": "ceo ceo last",
        "firstName": "ceo",
        "lastName": "ceo last",
        "userUUID": "20",
        "userId": 20,
        "userRolls": {
            "parentUserRoles": [],
            "chieldsUserRoles": [
                {
                    "rollId": 5,
                    "uuid": "5",
                    "rank": 4,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 3,
                    "uuid": "3",
                    "rank": 2,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 4,
                    "uuid": "4",
                    "rank": 3,
                    "level": "Store",
                    "rollName": "Store Manager"
                },
                {
                    "rollId": 1,
                    "uuid": "1",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Worker"
                },
                {
                    "rollId": 17,
                    "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "security"
                }
            ],
            "rollUUID": "2",
            "name": "CEO",
            "rank": 1,
            "uuid": "2",
            "systemMainRoleType": "CEO",
            "userLevel": "Chain",
            "storeUUID": "9",
            "storeName": "Store 9",
            "storeId": 9
        }
    }
}
var approverRegionNOthern = {
    "approverUuid": "21",
    "approverRole": "Region_Manager",
    "id": 2139,
    "isNew": false,
    "isDelete": false,
    "userDto": {
        "name": "region regino last",
        "firstName": "region",
        "lastName": "regino last",
        "userUUID": "21",
        "userId": 21,
        "userRolls": {
            "parentUserRoles": [
                {
                    "rollId": 5,
                    "uuid": "5",
                    "rank": 4,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 2,
                    "uuid": "2",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 4,
                    "uuid": "4",
                    "rank": 3,
                    "level": "Store",
                    "rollName": "Store Manager"
                },
                {
                    "rollId": 1,
                    "uuid": "1",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Worker"
                },
                {
                    "rollId": 17,
                    "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "security"
                }
            ],
            "rollUUID": "3",
            "name": "Region Manager",
            "rank": 2,
            "uuid": "3",
            "systemMainRoleType": "Region_Manager",
            "regionName": "Northan",
            "regionUUID": "1",
            "userLevel": "Region"
        }
    }
}
var approverStoreNothernBr3 = {
    "approverUuid": "33",
    "approverRole": "Store_Manager",
    "viewName": "North Branch 03",
    "isNew": true,
    "userDto": {
        "userRolls": {
            "rollUUID": "4",
            "userLevel": "Store",
            "systemMainRoleType": "Store_Manager",
            "regionUUID": "1",
            "storeUUID": "11"
        }
    }
}
var removeexistapproveraddnewR_No = [
    {
        "approverUuid": "20",
        "approverRole": "CEO",
        "id": 2515,
        "isNew": false,
        "isDelete": true,
        "userDto": {
            "name": "ceo ceo last",
            "firstName": "ceo",
            "lastName": "ceo last",
            "userUUID": "20",
            "userId": 20,
            "userRolls": {
                "parentUserRoles": [],
                "chieldsUserRoles": [
                    {
                        "rollId": 5,
                        "uuid": "5",
                        "rank": 4,
                        "level": "Chain",
                        "rollName": "Planner"
                    },
                    {
                        "rollId": 3,
                        "uuid": "3",
                        "rank": 2,
                        "level": "Region",
                        "rollName": "Region Manager"
                    },
                    {
                        "rollId": 4,
                        "uuid": "4",
                        "rank": 3,
                        "level": "Store",
                        "rollName": "Store Manager"
                    },
                    {
                        "rollId": 1,
                        "uuid": "1",
                        "rank": 7,
                        "level": "Store",
                        "rollName": "Worker"
                    },
                    {
                        "rollId": 17,
                        "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7",
                        "rank": 8,
                        "level": "Store",
                        "rollName": "security"
                    }
                ],
                "rollUUID": "2",
                "name": "CEO",
                "rank": 1,
                "uuid": "2",
                "systemMainRoleType": "CEO",
                "userLevel": "Chain",
                "storeUUID": "9",
                "storeName": "Store 9",
                "storeId": 9
            }
        },
        "viewName": "ceo ceo last"
    },
    {
        "approverUuid": "21",
        "approverRole": "Region_Manager",
        "viewName": "Northan",
        "isNew": true,
        "userDto": {
            "userRolls": {
                "rollUUID": "3",
                "userLevel": "Region",
                "systemMainRoleType": "Region_Manager",
                "regionUUID": "1"
            }
        }
    }
]
var allocatorSotreNobr3 = {
    "allocatorUuid": "20",
    "reciverRole": "Worker",
    "isNew": true,
    "taskAllcationDetailDto": [
        {
            "reciverUuid": "32",
            "systemMainRoleType": "Worker",
            "viewName": "North Branch 03 Employer 2",
            "isNew": true,
            "userDto": {
                "userRolls": {
                    "chieldsUserRoles": [
                        {
                            "rollId": 17,
                            "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7",
                            "rank": 8,
                            "level": "Store",
                            "rollName": "security"
                        }
                    ],
                    "parentUserRoles": [
                        {
                            "rollId": 4,
                            "uuid": "4",
                            "rank": 3,
                            "level": "Store",
                            "rollName": "Store Manager"
                        },
                        {
                            "rollId": 3,
                            "uuid": "3",
                            "rank": 2,
                            "level": "Region",
                            "rollName": "Region Manager"
                        },
                        {
                            "rollId": 5,
                            "uuid": "5",
                            "rank": 4,
                            "level": "Chain",
                            "rollName": "Planner"
                        },
                        {
                            "rollId": 2,
                            "uuid": "2",
                            "rank": 1,
                            "level": "Chain",
                            "rollName": "CEO"
                        }
                    ],
                    "systemMainRoleType": "Worker",
                    "userLevel": "Store",
                    "storeUUID": "11",
                    "regionUUID": "1"
                }
            }
        }
    ]
}
var store9 = {
    "approverUuid": "9",
    "approverRole": "Store_Manager",
    "viewName": "Store 9",
    "isNew": true,
    "userDto": {
        "userRolls": {
            "rollUUID": "4",
            "userLevel": "Store",
            "systemMainRoleType": "Store_Manager",
            "regionUUID": "2",
            "storeUUID": "9"
        }
    }
}
var approverCEO = { "viewName": "ceo ceo last", "approverUuid": "20", "id": 20, "approverRole": "CEO", "isNew": true, "userDto": { "userRolls": { "rollUUID": "2", "userLevel": "Chain", "systemMainRoleType": "CEO", "storeUUID": "9" } } }

//states

function testtranslate(transtxt) {
    return TRANSLATIONS_EN[transtxt];
}

var Serrors = { taskName: '', description: '', WITfor: '', Tapprover: '', repeattype: '', onceDate: '', endTime: '', startTime: '', whichWeek: '', WeekendTime: '', WeekstartTime: '', WeekuntilDate: '', yearDate: '', YearendTime: '', YearuntilDate: '', YearstartTime: '', MonthwichWeek: '', MonthDay: '', MonthuntilDate: '', MonthEndTime: '', MonthstartTime: '', fillFeedBack: '', allFieldFeedback: '', listempty: '', listitemempty: '' }
let props = {
    t: testtranslate,
    history: { listen: jest.fn(), push: jest.fn() },
    taskFeedState: taskFeedState,
    workerList: workerList,
    signedobj: signedobjCEO,
    regionList: regionList,
};
// res to set questionnaire data
var resp = {
    "status": true,
    "code": "",
    "extra": [
        {
            "taskList": [],
            "questionnaireId": 9,
            "questionnaireName": "QA03 [1.0]",
            "versionNo": "1.0",
            "createdBy": "new 01",
            "questionnaireStatus": "Published"
        },
        {
            "taskList": [],
            "questionnaireId": 10,
            "questionnaireName": "QA04 [1.0]",
            "versionNo": "1.0",
            "createdBy": "new 01",
            "questionnaireStatus": "Published"
        },
    ],
    "count": 21
}
var CommentOnceTaskwithoutcategorystate = {
    "isfromsearchkey": false,
    "loadquestionnaire": false,
    "questionnairepstratindex": 0,
    "questionnairepmaxresult": 10,
    "questionnaireStatus": "",
    "EditsaveQuestionnaire": "",
    "serchkeychange": false,
    "Questionnairesearkkey": "",
    "Questionniarequestion": "",
    "isRedirectQuesionear": false,
    "QuestionniareList": [
        {
            "taskList": [],
            "questionnaireId": 30,
            "questionnaireName": "QA01 - {Please Don't Edit} [1.0]",
            "versionNo": "1.0",
            "createdBy": "new 01",
            "questionnaireStatus": "Published"
        },
        {
            "taskList": [],
            "questionnaireId": 31,
            "questionnaireName": "QA02 - {Please Don't Edit} [1.0]",
            "versionNo": "1.0",
            "createdBy": "new 01",
            "questionnaireStatus": "Published"
        },
        {
            "taskList": [],
            "questionnaireId": 32,
            "questionnaireName": "QA03 - {Please Don't Edit} [1.0]",
            "versionNo": "1.0",
            "createdBy": "new 01",
            "questionnaireStatus": "Published"
        },
        {
            "taskList": [],
            "questionnaireId": 35,
            "questionnaireName": "QA04 - {Please Don't Edit} [1.0]",
            "versionNo": "1.0",
            "createdBy": "new 01",
            "questionnaireStatus": "Published"
        },
        {
            "taskList": [],
            "questionnaireId": 42,
            "questionnaireName": "QA07 [1.0]",
            "versionNo": "1.0",
            "createdBy": "new 01",
            "questionnaireStatus": "Published"
        },
        {
            "taskList": [],
            "questionnaireId": 57,
            "questionnaireName": "QA05 {Please Don't Edit} [1.1]",
            "versionNo": "1.1",
            "createdBy": "new 01",
            "questionnaireStatus": "Published"
        },
        {
            "taskList": [],
            "questionnaireId": 58,
            "questionnaireName": "QA10 [1.0]",
            "versionNo": "1.0",
            "createdBy": "new 01",
            "questionnaireStatus": "Published"
        },
        {
            "taskList": [],
            "questionnaireId": 91,
            "questionnaireName": "QA12 [1.1]",
            "versionNo": "1.1",
            "createdBy": "new 01",
            "questionnaireStatus": "Published"
        },
        {
            "taskList": [],
            "questionnaireId": 106,
            "questionnaireName": "Questionnaire 01 [1.1]",
            "versionNo": "1.1",
            "createdBy": "new 01",
            "questionnaireStatus": "Published"
        },
        {
            "taskList": [],
            "questionnaireId": 119,
            "questionnaireName": "QA QUESTIONNAIRE [1.0]",
            "versionNo": "1.0",
            "createdBy": "new 01",
            "questionnaireStatus": "Published"
        }
    ],
    "isQuestionnaire": false,
    "saveupdatebtndisabel": false,
    "filterboxopen": false,
    "filterboxopenapprover": false,
    "existinggroups": [],
    "groupIds": [],
    "errors": {
        "taskName": "",
        "description": "",
        "WITfor": "",
        "Tapprover": "",
        "repeattype": "",
        "onceDate": "",
        "endTime": "",
        "startTime": "",
        "whichWeek": "",
        "WeekendTime": "",
        "WeekstartTime": "",
        "WeekuntilDate": "",
        "yearDate": "",
        "YearendTime": "",
        "YearuntilDate": "",
        "YearstartTime": "",
        "MonthwichWeek": "",
        "MonthDay": "",
        "MonthuntilDate": "",
        "MonthEndTime": "",
        "MonthstartTime": "",
        "fillFeedBack": "",
        "allFieldFeedback": "",
        "listempty": "",
        "listitemempty": ""
    },
    "isuseCam": false,
    "iscatTimeout": false,
    "catName": "",
    "istaskAttended": false,
    "level": "Region",
    "apprvlevel": "Region",
    "isFutreTask": true,
    "isedit": false,
    "feedbackOptions": [],
    "categoryList": [],
    "categoryselect": -1,
    "storeList": [
        {
            "parentUserRoles": [
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 16,
                    "uuid": "35c466d6-6621-4a56-a462-e3a45c6192e6",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Worker"
                },
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                },
                {
                    "rollId": 20,
                    "uuid": "3c2b8970-9bf9-4595-99d8-eeac58372414",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Custom Role - 02"
                },
                {
                    "rollId": 21,
                    "uuid": "cccee390-3569-431d-906f-ec0c6f7b5a3e",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Custom Role - 02_Worker"
                },
                {
                    "rollId": 37,
                    "uuid": "1367f784-79d0-4ac1-82c9-eb3687e2342b",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Branch Planner"
                }
            ],
            "storeId": 33,
            "storeName": "C-001_B02",
            "storeUUID": "f1def28a-c1fc-49c8-a3d4-81f22d33c4cc",
            "userFirstName": "C-001_B02",
            "userId": 88,
            "userLastName": "SM",
            "userUUID": "18132d6a-d60b-4cba-a968-b0395943d617",
            "rollName": "Branch Manager",
            "rollUUID": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
            "systemMainRoleType": "Store_Manager",
            "roleUserLevel": "Store",
            "regionId": 7,
            "regionName": "C-001",
            "regionUUID": "f9b3cb1b-cad3-4ecb-9faa-2e6014d3b995",
            "rollRank": 5
        },
        {
            "parentUserRoles": [
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 16,
                    "uuid": "35c466d6-6621-4a56-a462-e3a45c6192e6",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Worker"
                },
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                },
                {
                    "rollId": 20,
                    "uuid": "3c2b8970-9bf9-4595-99d8-eeac58372414",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Custom Role - 02"
                },
                {
                    "rollId": 21,
                    "uuid": "cccee390-3569-431d-906f-ec0c6f7b5a3e",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Custom Role - 02_Worker"
                },
                {
                    "rollId": 37,
                    "uuid": "1367f784-79d0-4ac1-82c9-eb3687e2342b",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Branch Planner"
                }
            ],
            "storeId": 34,
            "storeName": "C-001_B03",
            "storeUUID": "d46fca4b-4518-443e-910a-bb5240ada361",
            "userFirstName": "C-001_B03",
            "userId": 91,
            "userLastName": "SM",
            "userUUID": "fbe24ae8-445d-4615-867f-39a22cd1c2d0",
            "rollName": "Branch Manager",
            "rollUUID": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
            "systemMainRoleType": "Store_Manager",
            "roleUserLevel": "Store",
            "regionId": 7,
            "regionName": "C-001",
            "regionUUID": "f9b3cb1b-cad3-4ecb-9faa-2e6014d3b995",
            "rollRank": 5
        },
        {
            "parentUserRoles": [
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 16,
                    "uuid": "35c466d6-6621-4a56-a462-e3a45c6192e6",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Worker"
                },
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                },
                {
                    "rollId": 20,
                    "uuid": "3c2b8970-9bf9-4595-99d8-eeac58372414",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Custom Role - 02"
                },
                {
                    "rollId": 21,
                    "uuid": "cccee390-3569-431d-906f-ec0c6f7b5a3e",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Custom Role - 02_Worker"
                },
                {
                    "rollId": 37,
                    "uuid": "1367f784-79d0-4ac1-82c9-eb3687e2342b",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Branch Planner"
                }
            ],
            "storeId": 35,
            "storeName": "C-002_B01",
            "storeUUID": "94c9bcf4-7544-49c3-81ea-6a33ffcba9ba",
            "userFirstName": "C-002_B01",
            "userId": 95,
            "userLastName": "SM",
            "userUUID": "e0519a88-ca84-4596-b3ce-0f52cd92ea14",
            "rollName": "Branch Manager",
            "rollUUID": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
            "systemMainRoleType": "Store_Manager",
            "roleUserLevel": "Store",
            "regionId": 8,
            "regionName": "C-002",
            "regionUUID": "c7afd334-2557-4fc6-8fe6-9da517c08c72",
            "rollRank": 5
        },
        {
            "parentUserRoles": [
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 16,
                    "uuid": "35c466d6-6621-4a56-a462-e3a45c6192e6",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Worker"
                },
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                },
                {
                    "rollId": 20,
                    "uuid": "3c2b8970-9bf9-4595-99d8-eeac58372414",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Custom Role - 02"
                },
                {
                    "rollId": 21,
                    "uuid": "cccee390-3569-431d-906f-ec0c6f7b5a3e",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Custom Role - 02_Worker"
                },
                {
                    "rollId": 37,
                    "uuid": "1367f784-79d0-4ac1-82c9-eb3687e2342b",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Branch Planner"
                }
            ],
            "storeId": 36,
            "storeName": "C-002_B02",
            "storeUUID": "ae38fd60-e5e3-4637-9850-d40f8824f368",
            "userFirstName": "C-002_B02",
            "userId": 99,
            "userLastName": "SM",
            "userUUID": "18a24aff-8e13-4c8e-9c03-7e4627a09e1f",
            "rollName": "Branch Manager",
            "rollUUID": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
            "systemMainRoleType": "Store_Manager",
            "roleUserLevel": "Store",
            "regionId": 8,
            "regionName": "C-002",
            "regionUUID": "c7afd334-2557-4fc6-8fe6-9da517c08c72",
            "rollRank": 5
        },
        {
            "parentUserRoles": [
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 16,
                    "uuid": "35c466d6-6621-4a56-a462-e3a45c6192e6",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Worker"
                },
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                },
                {
                    "rollId": 20,
                    "uuid": "3c2b8970-9bf9-4595-99d8-eeac58372414",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Custom Role - 02"
                },
                {
                    "rollId": 21,
                    "uuid": "cccee390-3569-431d-906f-ec0c6f7b5a3e",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Custom Role - 02_Worker"
                },
                {
                    "rollId": 37,
                    "uuid": "1367f784-79d0-4ac1-82c9-eb3687e2342b",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Branch Planner"
                }
            ],
            "storeId": 37,
            "storeName": "C-002_B03",
            "storeUUID": "a1720233-790b-49e8-968c-5ac907d7561f",
            "userFirstName": "C-002_B03",
            "userId": 102,
            "userLastName": "SM",
            "userUUID": "52b0deb1-168c-4945-a9b3-799462b4398e",
            "rollName": "Branch Manager",
            "rollUUID": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
            "systemMainRoleType": "Store_Manager",
            "roleUserLevel": "Store",
            "regionId": 8,
            "regionName": "C-002",
            "regionUUID": "c7afd334-2557-4fc6-8fe6-9da517c08c72",
            "rollRank": 5
        },
        {
            "parentUserRoles": [
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 16,
                    "uuid": "35c466d6-6621-4a56-a462-e3a45c6192e6",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Worker"
                },
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                },
                {
                    "rollId": 20,
                    "uuid": "3c2b8970-9bf9-4595-99d8-eeac58372414",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Custom Role - 02"
                },
                {
                    "rollId": 21,
                    "uuid": "cccee390-3569-431d-906f-ec0c6f7b5a3e",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Custom Role - 02_Worker"
                },
                {
                    "rollId": 37,
                    "uuid": "1367f784-79d0-4ac1-82c9-eb3687e2342b",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Branch Planner"
                }
            ],
            "storeId": 38,
            "storeName": "C-003_B01",
            "storeUUID": "91bfa70a-b555-43a6-ae14-2dec8f3f8976",
            "userFirstName": "C-003_B01",
            "userId": 106,
            "userLastName": "SM",
            "userUUID": "beffab8a-967d-4a1b-8115-f8b1e36c3470",
            "rollName": "Branch Manager",
            "rollUUID": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
            "systemMainRoleType": "Store_Manager",
            "roleUserLevel": "Store",
            "regionId": 9,
            "regionName": "C-003",
            "regionUUID": "dcbc6b82-212c-4090-8391-f45f6e57a7f1",
            "rollRank": 5
        },
        {
            "parentUserRoles": [
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 16,
                    "uuid": "35c466d6-6621-4a56-a462-e3a45c6192e6",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Worker"
                },
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                },
                {
                    "rollId": 20,
                    "uuid": "3c2b8970-9bf9-4595-99d8-eeac58372414",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Custom Role - 02"
                },
                {
                    "rollId": 21,
                    "uuid": "cccee390-3569-431d-906f-ec0c6f7b5a3e",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Custom Role - 02_Worker"
                },
                {
                    "rollId": 37,
                    "uuid": "1367f784-79d0-4ac1-82c9-eb3687e2342b",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Branch Planner"
                }
            ],
            "storeId": 39,
            "storeName": "C-003_B02",
            "storeUUID": "fda3b6e7-9c34-4038-a285-a98ee43ea7cd",
            "userFirstName": "C-003_B02",
            "userId": 109,
            "userLastName": "SM",
            "userUUID": "ed77e5a2-a26e-4f6f-b04e-8e7d22b23737",
            "rollName": "Branch Manager",
            "rollUUID": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
            "systemMainRoleType": "Store_Manager",
            "roleUserLevel": "Store",
            "regionId": 9,
            "regionName": "C-003",
            "regionUUID": "dcbc6b82-212c-4090-8391-f45f6e57a7f1",
            "rollRank": 5
        },
        {
            "parentUserRoles": [
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 16,
                    "uuid": "35c466d6-6621-4a56-a462-e3a45c6192e6",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Worker"
                },
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                },
                {
                    "rollId": 20,
                    "uuid": "3c2b8970-9bf9-4595-99d8-eeac58372414",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Custom Role - 02"
                },
                {
                    "rollId": 21,
                    "uuid": "cccee390-3569-431d-906f-ec0c6f7b5a3e",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Custom Role - 02_Worker"
                },
                {
                    "rollId": 37,
                    "uuid": "1367f784-79d0-4ac1-82c9-eb3687e2342b",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Branch Planner"
                }
            ],
            "storeId": 40,
            "storeName": "C-003_B03",
            "storeUUID": "34ca5a45-2e39-4cb3-8f38-eae630180f5a",
            "userFirstName": "C-003_B03",
            "userId": 112,
            "userLastName": "SM",
            "userUUID": "0b61182e-e230-4471-adb1-907a894400a6",
            "rollName": "Branch Manager",
            "rollUUID": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
            "systemMainRoleType": "Store_Manager",
            "roleUserLevel": "Store",
            "regionId": 9,
            "regionName": "C-003",
            "regionUUID": "dcbc6b82-212c-4090-8391-f45f6e57a7f1",
            "rollRank": 5
        },
        {
            "parentUserRoles": [
                {
                    "rollId": 25,
                    "uuid": "02ffc4e4-4635-49d8-83ee-59d9920f88a0",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Custom Role - Region Manager"
                },
                {
                    "rollId": 24,
                    "uuid": "d705cdfc-1256-4b92-a6e3-858ac9a06757",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Custom Role - Planner"
                },
                {
                    "rollId": 23,
                    "uuid": "7c5cb092-7e73-4262-8554-3fb9f0623aea",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "Custom Role - COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 28,
                    "uuid": "4280141a-adc9-428d-839b-1bdc698b96fa",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Custom Role - Department Head"
                },
                {
                    "rollId": 29,
                    "uuid": "b215b284-6e6c-4343-9c56-c19f46bf1953",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Custom Role - Worker"
                },
                {
                    "rollId": 30,
                    "uuid": "87bead24-7300-4dba-8001-fdf08d309150",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - None"
                },
                {
                    "rollId": 31,
                    "uuid": "5b5674d4-5c14-4bac-86bb-97434d80826f",
                    "rank": 9,
                    "level": "Store",
                    "rollName": "Custom Role - Employee"
                },
                {
                    "rollId": 32,
                    "uuid": "8afeb31b-9f08-4aa2-a281-f5e200e8472f",
                    "rank": 10,
                    "level": "Store",
                    "rollName": "Custom Role -QA"
                },
                {
                    "rollId": 35,
                    "uuid": "d65887f6-9f56-4c38-9af1-48fbe76c49e3",
                    "rank": 11,
                    "level": "Store",
                    "rollName": "Custom Role -QA - 2 "
                },
                {
                    "rollId": 36,
                    "uuid": "80eaa11a-2612-4f5e-942d-65a4da547e01",
                    "rank": 12,
                    "level": "Store",
                    "rollName": "Custom Role -QA - Worker"
                },
                {
                    "rollId": 39,
                    "uuid": "5579c5a7-28af-42e7-b022-273db415eba1",
                    "rank": 13,
                    "level": "Store",
                    "rollName": "Custom Role -QA - None"
                },
                {
                    "rollId": 41,
                    "uuid": "97285159-e6ae-40b9-80d2-10f9f7d2edcd",
                    "rank": 14,
                    "level": "Store",
                    "rollName": "Custom Role - Employee  02"
                }
            ],
            "storeId": 32,
            "storeName": "C-001_B01",
            "storeUUID": "4e39268c-e473-48c9-a059-74f30b56d334",
            "userFirstName": "Custom",
            "userId": 122,
            "userLastName": "Role SM",
            "userUUID": "25215046-df13-40c8-8f83-ace69d2d6203",
            "rollName": "Custom Role - Store Manager",
            "rollUUID": "5061e176-cb5b-4364-bb8f-0b819e5f3a98",
            "systemMainRoleType": "Store_Manager",
            "roleUserLevel": "Store",
            "regionId": 7,
            "regionName": "C-001",
            "regionUUID": "f9b3cb1b-cad3-4ecb-9faa-2e6014d3b995",
            "rollRank": 5
        }
    ],
    "workerList": [
        {
            "userGroupDetails": [],
            "parentUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 14,
                    "uuid": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
                    "rank": 5,
                    "level": "Store",
                    "rollName": "Branch Manager"
                },
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                }
            ],
            "storeId": 32,
            "storeName": "C-001_B01",
            "storeUUID": "4e39268c-e473-48c9-a059-74f30b56d334",
            "userFirstName": "C-001_B01",
            "userId": 87,
            "userLastName": "WO",
            "userUUID": "6255c65b-e6bb-4373-abd4-fee4d7ad93b0",
            "rollName": "Worker",
            "rollUUID": "35c466d6-6621-4a56-a462-e3a45c6192e6",
            "systemMainRoleType": "Worker",
            "roleUserLevel": "Store",
            "regionId": 7,
            "regionName": "C-001",
            "regionUUID": "f9b3cb1b-cad3-4ecb-9faa-2e6014d3b995",
            "rollRank": 7
        },
        {
            "userGroupDetails": [],
            "parentUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 14,
                    "uuid": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
                    "rank": 5,
                    "level": "Store",
                    "rollName": "Branch Manager"
                },
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                }
            ],
            "storeId": 33,
            "storeName": "C-001_B02",
            "storeUUID": "f1def28a-c1fc-49c8-a3d4-81f22d33c4cc",
            "userFirstName": "C-001_B02",
            "userId": 90,
            "userLastName": "WO",
            "userUUID": "e02b0ddb-08b7-473b-b7a8-28032cf5bf4c",
            "rollName": "Worker",
            "rollUUID": "35c466d6-6621-4a56-a462-e3a45c6192e6",
            "systemMainRoleType": "Worker",
            "roleUserLevel": "Store",
            "regionId": 7,
            "regionName": "C-001",
            "regionUUID": "f9b3cb1b-cad3-4ecb-9faa-2e6014d3b995",
            "rollRank": 7
        },
        {
            "userGroupDetails": [],
            "parentUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 14,
                    "uuid": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
                    "rank": 5,
                    "level": "Store",
                    "rollName": "Branch Manager"
                },
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                }
            ],
            "storeId": 34,
            "storeName": "C-001_B03",
            "storeUUID": "d46fca4b-4518-443e-910a-bb5240ada361",
            "userFirstName": "C-001_B03",
            "userId": 93,
            "userLastName": "WO",
            "userUUID": "880e04e5-9b23-4536-97f8-3b0ad3678e85",
            "rollName": "Worker",
            "rollUUID": "35c466d6-6621-4a56-a462-e3a45c6192e6",
            "systemMainRoleType": "Worker",
            "roleUserLevel": "Store",
            "regionId": 7,
            "regionName": "C-001",
            "regionUUID": "f9b3cb1b-cad3-4ecb-9faa-2e6014d3b995",
            "rollRank": 7
        },
        {
            "userGroupDetails": [],
            "parentUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 14,
                    "uuid": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
                    "rank": 5,
                    "level": "Store",
                    "rollName": "Branch Manager"
                },
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                }
            ],
            "storeId": 35,
            "storeName": "C-002_B01",
            "storeUUID": "94c9bcf4-7544-49c3-81ea-6a33ffcba9ba",
            "userFirstName": "C-002_B01",
            "userId": 97,
            "userLastName": "WO",
            "userUUID": "6fb06852-98c5-445a-9b76-90b223ca94c4",
            "rollName": "Worker",
            "rollUUID": "35c466d6-6621-4a56-a462-e3a45c6192e6",
            "systemMainRoleType": "Worker",
            "roleUserLevel": "Store",
            "regionId": 8,
            "regionName": "C-002",
            "regionUUID": "c7afd334-2557-4fc6-8fe6-9da517c08c72",
            "rollRank": 7
        },
        {
            "userGroupDetails": [],
            "parentUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 14,
                    "uuid": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
                    "rank": 5,
                    "level": "Store",
                    "rollName": "Branch Manager"
                },
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                }
            ],
            "storeId": 36,
            "storeName": "C-002_B02",
            "storeUUID": "ae38fd60-e5e3-4637-9850-d40f8824f368",
            "userFirstName": "C-002_B02",
            "userId": 101,
            "userLastName": "WO",
            "userUUID": "5d0ce952-9cf5-44c5-b94a-73a17d12a3d2",
            "rollName": "Worker",
            "rollUUID": "35c466d6-6621-4a56-a462-e3a45c6192e6",
            "systemMainRoleType": "Worker",
            "roleUserLevel": "Store",
            "regionId": 8,
            "regionName": "C-002",
            "regionUUID": "c7afd334-2557-4fc6-8fe6-9da517c08c72",
            "rollRank": 7
        },
        {
            "userGroupDetails": [],
            "parentUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 14,
                    "uuid": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
                    "rank": 5,
                    "level": "Store",
                    "rollName": "Branch Manager"
                },
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                }
            ],
            "storeId": 37,
            "storeName": "C-002_B03",
            "storeUUID": "a1720233-790b-49e8-968c-5ac907d7561f",
            "userFirstName": "C-002_B03",
            "userId": 104,
            "userLastName": "WO",
            "userUUID": "8e081d85-e51b-4057-a0b6-174410edb3d8",
            "rollName": "Worker",
            "rollUUID": "35c466d6-6621-4a56-a462-e3a45c6192e6",
            "systemMainRoleType": "Worker",
            "roleUserLevel": "Store",
            "regionId": 8,
            "regionName": "C-002",
            "regionUUID": "c7afd334-2557-4fc6-8fe6-9da517c08c72",
            "rollRank": 7
        },
        {
            "userGroupDetails": [],
            "parentUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 14,
                    "uuid": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
                    "rank": 5,
                    "level": "Store",
                    "rollName": "Branch Manager"
                },
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                }
            ],
            "storeId": 39,
            "storeName": "C-003_B02",
            "storeUUID": "fda3b6e7-9c34-4038-a285-a98ee43ea7cd",
            "userFirstName": "C-003_B02",
            "userId": 111,
            "userLastName": "WO",
            "userUUID": "17ca1433-601d-436d-8939-a3d6389e8755",
            "rollName": "Worker",
            "rollUUID": "35c466d6-6621-4a56-a462-e3a45c6192e6",
            "systemMainRoleType": "Worker",
            "roleUserLevel": "Store",
            "regionId": 9,
            "regionName": "C-003",
            "regionUUID": "dcbc6b82-212c-4090-8391-f45f6e57a7f1",
            "rollRank": 7
        },
        {
            "userGroupDetails": [],
            "parentUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 14,
                    "uuid": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
                    "rank": 5,
                    "level": "Store",
                    "rollName": "Branch Manager"
                },
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                }
            ],
            "storeId": 40,
            "storeName": "C-003_B03",
            "storeUUID": "34ca5a45-2e39-4cb3-8f38-eae630180f5a",
            "userFirstName": "C-003_B03",
            "userId": 114,
            "userLastName": "WO",
            "userUUID": "12cf2e81-723c-41f0-b0ec-53d794a72401",
            "rollName": "Worker",
            "rollUUID": "35c466d6-6621-4a56-a462-e3a45c6192e6",
            "systemMainRoleType": "Worker",
            "roleUserLevel": "Store",
            "regionId": 9,
            "regionName": "C-003",
            "regionUUID": "dcbc6b82-212c-4090-8391-f45f6e57a7f1",
            "rollRank": 7
        },
        {
            "userGroupDetails": [],
            "parentUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 14,
                    "uuid": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
                    "rank": 5,
                    "level": "Store",
                    "rollName": "Branch Manager"
                },
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                }
            ],
            "storeId": 32,
            "storeName": "C-001_B01",
            "storeUUID": "4e39268c-e473-48c9-a059-74f30b56d334",
            "userFirstName": "C-001_B01",
            "userId": 115,
            "userLastName": "WO-2",
            "userUUID": "dc332829-6b12-453e-a791-494a4754dd1c",
            "rollName": "Worker",
            "rollUUID": "35c466d6-6621-4a56-a462-e3a45c6192e6",
            "systemMainRoleType": "Worker",
            "roleUserLevel": "Store",
            "regionId": 7,
            "regionName": "C-001",
            "regionUUID": "f9b3cb1b-cad3-4ecb-9faa-2e6014d3b995",
            "rollRank": 7
        },
        {
            "userGroupDetails": [],
            "parentUserRoles": [
                {
                    "rollId": 16,
                    "uuid": "35c466d6-6621-4a56-a462-e3a45c6192e6",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Worker"
                },
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 14,
                    "uuid": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
                    "rank": 5,
                    "level": "Store",
                    "rollName": "Branch Manager"
                },
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [],
            "storeId": 34,
            "storeName": "C-001_B03",
            "storeUUID": "d46fca4b-4518-443e-910a-bb5240ada361",
            "userFirstName": "Custom ",
            "userId": 119,
            "userLastName": "Role Worker",
            "userUUID": "bc8eb14d-93ec-4954-befc-79d168810e0e",
            "rollName": "Custom Role - 01",
            "rollUUID": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
            "systemMainRoleType": "Worker",
            "roleUserLevel": "Store",
            "regionId": 7,
            "regionName": "C-001",
            "regionUUID": "f9b3cb1b-cad3-4ecb-9faa-2e6014d3b995",
            "rollRank": 8
        },
        {
            "userGroupDetails": [],
            "parentUserRoles": [
                {
                    "rollId": 28,
                    "uuid": "4280141a-adc9-428d-839b-1bdc698b96fa",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Custom Role - Department Head"
                },
                {
                    "rollId": 26,
                    "uuid": "5061e176-cb5b-4364-bb8f-0b819e5f3a98",
                    "rank": 5,
                    "level": "Store",
                    "rollName": "Custom Role - Store Manager"
                },
                {
                    "rollId": 25,
                    "uuid": "02ffc4e4-4635-49d8-83ee-59d9920f88a0",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Custom Role - Region Manager"
                },
                {
                    "rollId": 24,
                    "uuid": "d705cdfc-1256-4b92-a6e3-858ac9a06757",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Custom Role - Planner"
                },
                {
                    "rollId": 23,
                    "uuid": "7c5cb092-7e73-4262-8554-3fb9f0623aea",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "Custom Role - COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 30,
                    "uuid": "87bead24-7300-4dba-8001-fdf08d309150",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - None"
                },
                {
                    "rollId": 31,
                    "uuid": "5b5674d4-5c14-4bac-86bb-97434d80826f",
                    "rank": 9,
                    "level": "Store",
                    "rollName": "Custom Role - Employee"
                },
                {
                    "rollId": 32,
                    "uuid": "8afeb31b-9f08-4aa2-a281-f5e200e8472f",
                    "rank": 10,
                    "level": "Store",
                    "rollName": "Custom Role -QA"
                },
                {
                    "rollId": 35,
                    "uuid": "d65887f6-9f56-4c38-9af1-48fbe76c49e3",
                    "rank": 11,
                    "level": "Store",
                    "rollName": "Custom Role -QA - 2 "
                },
                {
                    "rollId": 36,
                    "uuid": "80eaa11a-2612-4f5e-942d-65a4da547e01",
                    "rank": 12,
                    "level": "Store",
                    "rollName": "Custom Role -QA - Worker"
                },
                {
                    "rollId": 39,
                    "uuid": "5579c5a7-28af-42e7-b022-273db415eba1",
                    "rank": 13,
                    "level": "Store",
                    "rollName": "Custom Role -QA - None"
                },
                {
                    "rollId": 41,
                    "uuid": "97285159-e6ae-40b9-80d2-10f9f7d2edcd",
                    "rank": 14,
                    "level": "Store",
                    "rollName": "Custom Role - Employee  02"
                }
            ],
            "storeId": 32,
            "storeName": "C-001_B01",
            "storeUUID": "4e39268c-e473-48c9-a059-74f30b56d334",
            "userFirstName": "Custom",
            "userId": 124,
            "userLastName": "Role WO - 2",
            "userUUID": "c47899c1-3c9e-4da8-92bf-0ba2a2df4685",
            "rollName": "Custom Role - Worker",
            "rollUUID": "b215b284-6e6c-4343-9c56-c19f46bf1953",
            "systemMainRoleType": "Worker",
            "roleUserLevel": "Store",
            "regionId": 7,
            "regionName": "C-001",
            "regionUUID": "f9b3cb1b-cad3-4ecb-9faa-2e6014d3b995",
            "rollRank": 7
        },
        {
            "userGroupDetails": [],
            "parentUserRoles": [
                {
                    "rollId": 35,
                    "uuid": "d65887f6-9f56-4c38-9af1-48fbe76c49e3",
                    "rank": 11,
                    "level": "Store",
                    "rollName": "Custom Role -QA - 2 "
                },
                {
                    "rollId": 32,
                    "uuid": "8afeb31b-9f08-4aa2-a281-f5e200e8472f",
                    "rank": 10,
                    "level": "Store",
                    "rollName": "Custom Role -QA"
                },
                {
                    "rollId": 31,
                    "uuid": "5b5674d4-5c14-4bac-86bb-97434d80826f",
                    "rank": 9,
                    "level": "Store",
                    "rollName": "Custom Role - Employee"
                },
                {
                    "rollId": 30,
                    "uuid": "87bead24-7300-4dba-8001-fdf08d309150",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - None"
                },
                {
                    "rollId": 29,
                    "uuid": "b215b284-6e6c-4343-9c56-c19f46bf1953",
                    "rank": 7,
                    "level": "Store",
                    "rollName": "Custom Role - Worker"
                },
                {
                    "rollId": 28,
                    "uuid": "4280141a-adc9-428d-839b-1bdc698b96fa",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Custom Role - Department Head"
                },
                {
                    "rollId": 26,
                    "uuid": "5061e176-cb5b-4364-bb8f-0b819e5f3a98",
                    "rank": 5,
                    "level": "Store",
                    "rollName": "Custom Role - Store Manager"
                },
                {
                    "rollId": 25,
                    "uuid": "02ffc4e4-4635-49d8-83ee-59d9920f88a0",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Custom Role - Region Manager"
                },
                {
                    "rollId": 24,
                    "uuid": "d705cdfc-1256-4b92-a6e3-858ac9a06757",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Custom Role - Planner"
                },
                {
                    "rollId": 23,
                    "uuid": "7c5cb092-7e73-4262-8554-3fb9f0623aea",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "Custom Role - COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 39,
                    "uuid": "5579c5a7-28af-42e7-b022-273db415eba1",
                    "rank": 13,
                    "level": "Store",
                    "rollName": "Custom Role -QA - None"
                },
                {
                    "rollId": 41,
                    "uuid": "97285159-e6ae-40b9-80d2-10f9f7d2edcd",
                    "rank": 14,
                    "level": "Store",
                    "rollName": "Custom Role - Employee  02"
                }
            ],
            "storeId": 32,
            "storeName": "C-001_B01",
            "storeUUID": "4e39268c-e473-48c9-a059-74f30b56d334",
            "userFirstName": "Custom",
            "userId": 130,
            "userLastName": "QA - Worker",
            "userUUID": "3b66cb9e-3415-4e01-8a35-7650b4beda76",
            "rollName": "Custom Role -QA - Worker",
            "rollUUID": "80eaa11a-2612-4f5e-942d-65a4da547e01",
            "systemMainRoleType": "Worker",
            "roleUserLevel": "Store",
            "regionId": 7,
            "regionName": "C-001",
            "regionUUID": "f9b3cb1b-cad3-4ecb-9faa-2e6014d3b995",
            "rollRank": 12
        },
        {
            "userGroupDetails": [],
            "parentUserRoles": [
                {
                    "rollId": 38,
                    "uuid": "f359f17b-4708-4177-8770-afb7ad456149",
                    "rank": 5,
                    "level": "Region",
                    "rollName": "Region COO"
                },
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [],
            "storeId": 35,
            "storeName": "C-002_B01",
            "storeUUID": "94c9bcf4-7544-49c3-81ea-6a33ffcba9ba",
            "userFirstName": "CUSTOM ROLE",
            "userId": 134,
            "userLastName": "QA COO WORKER",
            "userUUID": "73810541-0583-48e1-9aff-4ee160f9a464",
            "rollName": "Custom Role -QA - COO WORKER",
            "rollUUID": "bbcf7d34-cea7-41e4-98b8-188b71db34aa",
            "systemMainRoleType": "Worker",
            "roleUserLevel": "Store",
            "regionId": 8,
            "regionName": "C-002",
            "regionUUID": "c7afd334-2557-4fc6-8fe6-9da517c08c72",
            "rollRank": 6
        },
        {
            "userGroupDetails": [],
            "parentUserRoles": [
                {
                    "rollId": 15,
                    "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                    "rank": 6,
                    "level": "Store",
                    "rollName": "Department Head"
                },
                {
                    "rollId": 14,
                    "uuid": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
                    "rank": 5,
                    "level": "Store",
                    "rollName": "Branch Manager"
                },
                {
                    "rollId": 11,
                    "uuid": "ceb52652-028b-43b9-8256-91ad998c86c1",
                    "rank": 4,
                    "level": "Region",
                    "rollName": "Region Manager"
                },
                {
                    "rollId": 10,
                    "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                    "rank": 3,
                    "level": "Chain",
                    "rollName": "Planner"
                },
                {
                    "rollId": 9,
                    "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                    "rank": 2,
                    "level": "Chain",
                    "rollName": "COO"
                },
                {
                    "rollId": 8,
                    "uuid": "8",
                    "rank": 1,
                    "level": "Chain",
                    "rollName": "CEO"
                }
            ],
            "chieldsUserRoles": [
                {
                    "rollId": 19,
                    "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                    "rank": 8,
                    "level": "Store",
                    "rollName": "Custom Role - 01"
                }
            ],
            "storeId": 35,
            "storeName": "C-002_B01",
            "storeUUID": "94c9bcf4-7544-49c3-81ea-6a33ffcba9ba",
            "userFirstName": "C-002_B01",
            "userId": 138,
            "userLastName": "WO 2",
            "userUUID": "402f9c25-9036-49f1-a656-58db7692bdac",
            "rollName": "Worker",
            "rollUUID": "35c466d6-6621-4a56-a462-e3a45c6192e6",
            "systemMainRoleType": "Worker",
            "roleUserLevel": "Store",
            "regionId": 8,
            "regionName": "C-002",
            "regionUUID": "c7afd334-2557-4fc6-8fe6-9da517c08c72",
            "rollRank": 7
        }
    ],
    "isUrgent": false,
    "sobj": {
        "taskCategory": [],
        "taskApproversDtoList": [
            {
                "approverUuid": "49a6c731-f69c-425b-8053-1a42a9fdcb07",
                "approverRole": "Region_Manager",
                "viewName": "C-003",
                "isNew": true,
                "userDto": {
                    "userRolls": {
                        "rollUUID": "ceb52652-028b-43b9-8256-91ad998c86c1",
                        "userLevel": "Region",
                        "systemMainRoleType": "Region_Manager",
                        "regionUUID": "dcbc6b82-212c-4090-8391-f45f6e57a7f1"
                    }
                }
            }
        ],
        "taskAllocationDtoList": [
            {
                "allocatorUuid": "80",
                "reciverRole": "Region_Manager",
                "isNew": true,
                "taskAllcationDetailDto": [
                    {
                        "reciverUuid": "49a6c731-f69c-425b-8053-1a42a9fdcb07",
                        "systemMainRoleType": "Region_Manager",
                        "viewName": "C-003",
                        "isNew": true,
                        "userDto": {
                            "userRolls": {
                                "chieldsUserRoles": [
                                    {
                                        "rollId": 14,
                                        "uuid": "0a374b10-4a5f-4388-9c93-26dc577a7a54",
                                        "rank": 5,
                                        "level": "Store",
                                        "rollName": "Branch Manager"
                                    },
                                    {
                                        "rollId": 15,
                                        "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58",
                                        "rank": 6,
                                        "level": "Store",
                                        "rollName": "Department Head"
                                    },
                                    {
                                        "rollId": 16,
                                        "uuid": "35c466d6-6621-4a56-a462-e3a45c6192e6",
                                        "rank": 7,
                                        "level": "Store",
                                        "rollName": "Worker"
                                    },
                                    {
                                        "rollId": 19,
                                        "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb",
                                        "rank": 8,
                                        "level": "Store",
                                        "rollName": "Custom Role - 01"
                                    },
                                    {
                                        "rollId": 20,
                                        "uuid": "3c2b8970-9bf9-4595-99d8-eeac58372414",
                                        "rank": 6,
                                        "level": "Store",
                                        "rollName": "Custom Role - 02"
                                    },
                                    {
                                        "rollId": 21,
                                        "uuid": "cccee390-3569-431d-906f-ec0c6f7b5a3e",
                                        "rank": 7,
                                        "level": "Store",
                                        "rollName": "Custom Role - 02_Worker"
                                    },
                                    {
                                        "rollId": 37,
                                        "uuid": "1367f784-79d0-4ac1-82c9-eb3687e2342b",
                                        "rank": 6,
                                        "level": "Store",
                                        "rollName": "Branch Planner"
                                    },
                                    {
                                        "rollId": 38,
                                        "uuid": "f359f17b-4708-4177-8770-afb7ad456149",
                                        "rank": 5,
                                        "level": "Region",
                                        "rollName": "Region COO"
                                    },
                                    {
                                        "rollId": 40,
                                        "uuid": "bbcf7d34-cea7-41e4-98b8-188b71db34aa",
                                        "rank": 6,
                                        "level": "Store",
                                        "rollName": "Custom Role -QA - COO WORKER"
                                    }
                                ],
                                "parentUserRoles": [
                                    {
                                        "rollId": 10,
                                        "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb",
                                        "rank": 3,
                                        "level": "Chain",
                                        "rollName": "Planner"
                                    },
                                    {
                                        "rollId": 9,
                                        "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a",
                                        "rank": 2,
                                        "level": "Chain",
                                        "rollName": "COO"
                                    },
                                    {
                                        "rollId": 8,
                                        "uuid": "8",
                                        "rank": 1,
                                        "level": "Chain",
                                        "rollName": "CEO"
                                    }
                                ],
                                "systemMainRoleType": "Region_Manager",
                                "userLevel": "Region",
                                "regionUUID": "dcbc6b82-212c-4090-8391-f45f6e57a7f1"
                            }
                        }
                    }
                ]
            }
        ],
        "requestedFeedbackDto": [
            {
                "feedbackTypeId": 1,
                "requestedFeedbackOption": [],
                "isNew": true
            }
        ],
        "description": "tset004 description",
        "title": "tset004",
        "taskRepeatDetails": {
            "taskRepeatListDto": [
                {
                    "startTime": "",
                    "endTime": "7:00",
                    "customDate": "2021-12-25",
                    "taskDay": null
                }
            ],
            "taskRepeatStartDate": "2021-12-24T03:54:15.839Z",
            "isTimeFrameTask": false,
            "startTime": "",
            "endTime": "",
            "repeatType": "One Time"
        },
        "taskHasUserGroups": [],
        "isDeadLineTask": false,
        "isRepeatingTask": false,
        "taskRepeatStartDate": "2021-12-24T03:54:33.215Z",
        "taskPriority": "NORMAL",
        "isMustUseCamera": false,
        "isUseQuestionnaire": false,
        "questionnaireId": ""
    },
    "selectedFBtype": {
        "id": 1,
        "name": "text"
    },
    "checkList": [],
    "selectedFBMedia": [],
    "savecategoryLsit": [],
    "approverList": [],
    "startTime": "",
    "endTime": "7:00",
    "yearlyDate": "",
    "oncedate": "2021-12-24T18:30:00.000Z",
    "mediaFeedbackTypes": [
        {
            "id": 6,
            "name": "photo",
            "selected": false,
            "icon": "image",
            "vname": "Picture",
            "isNew": false,
            "isDelete": false,
            "requestedFeedbackId": -1
        },
        {
            "id": 7,
            "name": "video",
            "selected": false,
            "icon": "video",
            "vname": "Video",
            "isNew": true,
            "isDelete": false,
            "requestedFeedbackId": -1
        },
        {
            "id": 5,
            "name": "qr",
            "selected": false,
            "icon": "grid",
            "vname": "QR",
            "isNew": false,
            "isDelete": false,
            "requestedFeedbackId": -1
        }
    ]
}

jest.mock('../../components/UiComponents/SubmitSets');
beforeEach(() => {
    submitSets.mockResolvedValueOnce(Promise.resolve({ status: false, extra: null }));
})
//check component loading without errors
it("New Task Component renders without crashing", () => {
    shallow(<NewTask {...props} />);
});

describe("Feed Edit Task", () => {
    const wrapper = mount(<MemoryRouter><NewTask {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(NewTask);
    // subwrapper.setState({ toridata: defalldata, ftablebody: deftabledata, isnottesting: false, isdataloaded: true });
    // wrapper.update()
    it("setQuestionnairelistdata function", () => {
        subwrapper.instance().setQuestionnairelistdata(resp);
        expect(subwrapper.state().QuestionniareList.length).toBe(2)
    });
    it("pagescrollcall function", () => {
        // const spy = jest.spyOn(subwrapper, "getQuestionnaireList");
        subwrapper.setState({ questionnairepstratindex: 0, questionnairepmaxresult: 10 });
        wrapper.update();
        subwrapper.instance().pagescrollcall();
        expect(subwrapper.state().questionnairepstratindex).toBe(10)
        // expect(spy).toHaveBeenCalledTimes(1);
    });
    it("getQuestionnaireList function", () => {
        // const spy = jest.spyOn(subwrapper.instance(), "setQuestionnairelistdata");
        // submitSets.mockResolvedValueOnce(Promise.resolve({ status: true, extra: null }));
        // subwrapper.instance().getQuestionnaireList();
        // expect(subwrapper.instance().setQuestionnairelistdata).toBeCalled();
    });
    it("Create New Category function", () => {
        subwrapper.setState({ catName: "test", sobj: { taskCategory: [], taskApproversDtoList: [], taskAllocationDtoList: [], requestedFeedbackDto: [], description: "", title: "", taskRepeatDetails: { taskRepeatListDto: [], isTimeFrameTask: false }, } });
        wrapper.update();
        subwrapper.instance().handleNewCategory()
        expect(subwrapper.state().sobj.taskCategory[0].categoryName).toBe('test')
    });
    describe("handleCategory Function", () => {
        it("Add new Category No exist Categories", () => {
            var categorylist = [
                { categoryCode: "001", categoryColor: "#0000", categoryId: 1, categoryName: "Task Category 1", label: "Task Category 1", value: "Task Category 1" },
                { categoryCode: "002", categoryColor: "#0000", categoryId: 2, categoryName: "Task Category 2", label: "Task Category 2", value: "Task Category 2" }
            ]
            subwrapper.setState({ sobj: { taskCategory: [], taskApproversDtoList: [], taskAllocationDtoList: [], requestedFeedbackDto: [], description: "", title: "", taskRepeatDetails: { taskRepeatListDto: [], isTimeFrameTask: false }, }, categoryList: categorylist });
            wrapper.update();
            subwrapper.instance().handleCategory(2);
            expect(subwrapper.state().sobj.taskCategory[0].isNew).toBe(true)
        })
        it("Add Same Category validation", () => {
            const spy = jest.spyOn(alertService, "warn");
            subwrapper.instance().handleCategory(2);
            expect(alertService.warn).toBeCalled();
        })


    })
    describe("SelectAllAllocators  test", () => {
        it("SelectAll when nothing selcted", () => {
            subwrapper.instance().selectAll("worker");
            expect(subwrapper.state().sobj.taskAllocationDtoList.length).toBe(2)
        })
        it("SelectAll when previous save allocation ", () => {
            subwrapper.setState({
                sobj: {
                    taskCategory: [], taskApproversDtoList: [], taskAllocationDtoList: [
                        { "taskAllcationDetailDto": [{ "reciverUuid": "21", "isBottomLevel": false, "taskAllocationDetailsId": 831, "taskAllocationStatus": "pending", "isNew": false, "isDelete": false, "userDto": { "name": "region regino last", "firstName": "region", "lastName": "regino last", "userUUID": "21", "userId": 21, "userRolls": {}, "isTaskAttended": false, "isAllocate": false, "viewName": "Northan" } }], "allocatorUuid": "20", "reciverRole": "Region_Manager", "taskAllocationId": 857, "taskAllocationType": "custom", "isNew": false, "isDelete": false, "userDto": { "name": "ceo ceo last", "firstName": "ceo", "lastName": "ceo last", "userUUID": "20", "userId": 20, "userRolls": { "parentUserRoles": [], "chieldsUserRoles": [], "rollUUID": "2", "name": "CEO", "rank": 1, "uuid": "2", "systemMainRoleType": "CEO", "userLevel": "Chain", "storeUUID": "9", "storeName": "Store 9", "storeId": 9 } } }
                    ]
                }
            });
            wrapper.update();
            subwrapper.instance().selectAll("region");
            expect(subwrapper.state().sobj.taskAllocationDtoList.length).toBe(2)
        })
    })
    describe("SelectAllApprovers test", () => {
        it("SelectAll when nothing selcted", () => {
            subwrapper.instance().selectAllApprovers("worker");
            expect(subwrapper.state().sobj.taskApproversDtoList.length).toBe(2)
        })
        it("SelectAll when previous save allocation ", () => {
            subwrapper.setState({
                sobj: {
                    taskCategory: [], taskApproversDtoList: [{ "approverUuid": "21", "approverRole": "Region_Manager", "id": 2139, "isNew": false, "isDelete": false, "userDto": { "name": "region regino last", "firstName": "region", "lastName": "regino last", "userUUID": "21", "userId": 21, "userRolls": { "parentUserRoles": [{ "rollId": 5, "uuid": "5", "rank": 4, "level": "Chain", "rollName": "Planner" }, { "rollId": 2, "uuid": "2", "rank": 1, "level": "Chain", "rollName": "CEO" }], "chieldsUserRoles": [{ "rollId": 4, "uuid": "4", "rank": 3, "level": "Store", "rollName": "Store Manager" }, { "rollId": 1, "uuid": "1", "rank": 7, "level": "Store", "rollName": "Worker" }, { "rollId": 17, "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7", "rank": 8, "level": "Store", "rollName": "security" }], "rollUUID": "3", "name": "Region Manager", "rank": 2, "uuid": "3", "systemMainRoleType": "Region_Manager", "regionName": "Northan", "regionUUID": "1", "userLevel": "Region" } } }],
                    taskAllocationDtoList: []
                }
            });
            wrapper.update();
            subwrapper.instance().selectAllApprovers("region");
            expect(subwrapper.state().sobj.taskApproversDtoList.length).toBe(2)
        })
    })
    describe("Select none Approvers test", () => {
        it("prev saved approver remove", () => {
            subwrapper.setState({
                sobj: { taskCategory: [], taskApproversDtoList: [{ "approverUuid": "21", "approverRole": "Region_Manager", "id": 2139, "isNew": false, "isDelete": false, "userDto": { "name": "region regino last", "firstName": "region", "lastName": "regino last", "userUUID": "21", "userId": 21, "userRolls": { "parentUserRoles": [{ "rollId": 5, "uuid": "5", "rank": 4, "level": "Chain", "rollName": "Planner" }, { "rollId": 2, "uuid": "2", "rank": 1, "level": "Chain", "rollName": "CEO" }], "chieldsUserRoles": [{ "rollId": 4, "uuid": "4", "rank": 3, "level": "Store", "rollName": "Store Manager" }, { "rollId": 1, "uuid": "1", "rank": 7, "level": "Store", "rollName": "Worker" }, { "rollId": 17, "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7", "rank": 8, "level": "Store", "rollName": "security" }], "rollUUID": "3", "name": "Region Manager", "rank": 2, "uuid": "3", "systemMainRoleType": "Region_Manager", "regionName": "Northan", "regionUUID": "1", "userLevel": "Region" } } }], taskAllocationDtoList: [] }
            });
            wrapper.update();
            subwrapper.instance().approveSNone();
            expect(subwrapper.state().sobj.taskApproversDtoList[0].isDelete).toBe(true)
        })
        it("new added(not saved)  approvers remove", () => {
            subwrapper.setState({
                sobj: { taskCategory: [], taskApproversDtoList: [{ "approverUuid": "21", "approverRole": "Region_Manager", "viewName": "Northan", "isNew": true, "userDto": { "userRolls": { "rollUUID": "3", "userLevel": "Region", "systemMainRoleType": "Region_Manager", "regionUUID": "1" } } }], taskAllocationDtoList: [] }
            });
            wrapper.update();
            subwrapper.instance().approveSNone();
            expect(subwrapper.state().sobj.taskApproversDtoList.length).toBe(0)
        })

    })
    describe("Select none Allocators test", () => {
        it("New Allocators Select None", () => {
            subwrapper.setState({ sobj: { taskCategory: [], taskApproversDtoList: [], taskAllocationDtoList: [{ "allocatorUuid": "20", "reciverRole": "Region_Manager", "isNew": true, "taskAllcationDetailDto": [{ "reciverUuid": "21", "systemMainRoleType": "Region_Manager", "viewName": "Northan", "isNew": true, "userDto": { "userRolls": { "chieldsUserRoles": [{ "rollId": 4, "uuid": "4", "rank": 3, "level": "Store", "rollName": "Store Manager" }, { "rollId": 1, "uuid": "1", "rank": 7, "level": "Store", "rollName": "Worker" }, { "rollId": 17, "uuid": "8f78754b-a5cd-47d6-be25-967be9f4bec7", "rank": 8, "level": "Store", "rollName": "security" }], "parentUserRoles": [{ "rollId": 5, "uuid": "5", "rank": 4, "level": "Chain", "rollName": "Planner" }, { "rollId": 2, "uuid": "2", "rank": 1, "level": "Chain", "rollName": "CEO" }], "systemMainRoleType": "Region_Manager", "userLevel": "Region", "regionUUID": "1" } } }] }] } });
            wrapper.update();
            subwrapper.instance().taskisforAllNone();
            expect(subwrapper.state().sobj.taskAllocationDtoList.length).toBe(0)
        })
        it("New Allocators Select None", () => {
            subwrapper.setState({ sobj: { taskCategory: [], taskApproversDtoList: [], taskAllocationDtoList: [{ "taskAllcationDetailDto": [{ "reciverUuid": "21", "isBottomLevel": false, "taskAllocationDetailsId": 3435, "taskAllocationStatus": "pending", "isNew": false, "isDelete": false, "isTaskAttended": false, "isAllocate": false, "viewName": "Northan" }], "allocatorUuid": "20", "reciverRole": "Region_Manager", "taskAllocationId": 4032, "taskAllocationType": "custom", "isNew": false, "isDelete": false, "userDto": { "name": "ceo ceo last", "firstName": "ceo", "lastName": "ceo last", "userUUID": "20", "userId": 20, } }] } });
            wrapper.update();
            subwrapper.instance().taskisforAllNone();
            expect(subwrapper.state().sobj.taskAllocationDtoList[0].isDelete).toBe(true)
        })
    })

    describe("Set Defual Approver", () => {
        it("Defualt Approver Setting", () => {
            subwrapper.instance().defualtSetApprover();
            expect(subwrapper.state().sobj.taskApproversDtoList[0].approverRole).toBe("CEO")
        })
    })
    describe("Approver Validation test", () => {
        it("Correct path- same region approver is allocator", () => {
            var testobj = { taskCategory: [], taskApproversDtoList: [approverRegionNOthern], taskAllocationDtoList: [allocatorRegionNothern] }
            var validate = subwrapper.instance().validateapprover(testobj)
            expect(validate).toBe(true)
        })
        it("Wrong path- Approver is Same Region Below Level", () => {
            var testobj = { taskCategory: [], taskApproversDtoList: [approverStoreNothernBr3], taskAllocationDtoList: [allocatorRegionNothern] }
            var validate = subwrapper.instance().validateapprover(testobj)
            expect(validate).toBe(false)
        })
        it("Correct path- Approver is Highest and allocator Region", () => {
            var testobj = { taskCategory: [], taskApproversDtoList: [approverCEO], taskAllocationDtoList: [allocatorRegionNothern] }
            var validate = subwrapper.instance().validateapprover(testobj)
            expect(validate).toBe(true)
        })
        it("Correct path- Remove exist approver and add valid approver Nothern region", () => {
            var testobj = { taskCategory: [], taskApproversDtoList: removeexistapproveraddnewR_No, taskAllocationDtoList: [allocatorRegionNothern] }
            var validate = subwrapper.instance().validateapprover(testobj)
            expect(validate).toBe(true)
        })
        it("Correct path- Approver Store Allocator Worker in same region", () => {
            var testobj = { taskCategory: [], taskApproversDtoList: [approverStoreNothernBr3], taskAllocationDtoList: [allocatorSotreNobr3] }
            var validate = subwrapper.instance().validateapprover(testobj)
            expect(validate).toBe(true)
        })
        it("wrong path- Approver Store Allocator Worker in different region", () => {
            var testobj = { taskCategory: [], taskApproversDtoList: [store9], taskAllocationDtoList: [allocatorSotreNobr3] }
            var validate = subwrapper.instance().validateapprover(testobj)
            expect(validate).toBe(false)
        })

    })
    describe("changeselectedFBtype function", () => {
        it("normal test", () => {
            var value = { "id": 4, "name": "radio" }
            subwrapper.setState({ isedit: false, sobj: { "taskCategory": [], "taskApproversDtoList": [], "taskAllocationDtoList": [], "requestedFeedbackDto": [], "description": "", "title": "", "taskRepeatDetails": { "taskRepeatListDto": [], "isTimeFrameTask": false } } });
            wrapper.update();
            subwrapper.instance().changeselectedFBtype(value);
            expect(subwrapper.state().checkList.length).toBe(0)
        })

    })
    describe("Validation of Task Create/Update", () => {
        describe("Not Allow To save", () => {
            it("All empty check validations", () => {
                var obj = {
                    "taskCategory": [],
                    "taskApproversDtoList": [],
                    "taskAllocationDtoList": [], "requestedFeedbackDto": [], "description": "", "title": "", "taskRepeatDetails": { "taskRepeatListDto": [], "isTimeFrameTask": false }, "taskHasUserGroups": [], "isDeadLineTask": false, "isRepeatingTask": true, "taskRepeatStartDate": "2021-12-23T05:35:11.818Z", "taskPriority": "NORMAL", "isMustUseCamera": false, "isUseQuestionnaire": false, "questionnaireId": ""
                }
                subwrapper.setState({ errors: Serrors }, () => {
                    var validate = subwrapper.instance().validationtask(obj);
                    expect(validate).toBe(false)
                });
            })
            it("empty check validations once selected feedback type select from list", () => {
                var obj = { "taskCategory": [], "taskApproversDtoList": [{ "viewName": "new 01", "approverUuid": "80", "id": 80, "approverRole": "CEO", "isNew": true, "userDto": { "userRolls": { "rollUUID": "8", "userLevel": "Chain", "systemMainRoleType": "CEO" } } }], "taskAllocationDtoList": [], "requestedFeedbackDto": [{ "feedbackTypeId": 4, "requestedFeedbackOption": [], "isNew": true }], "description": "", "title": "", "taskRepeatDetails": { "taskRepeatListDto": [{ "startTime": "", "endTime": "", "customDate": "", "taskDay": null }], "taskRepeatStartDate": "2021-12-23T09:57:01.093Z", "isTimeFrameTask": false, "startTime": "", "endTime": "", "repeatType": "One Time" }, "taskHasUserGroups": [], "isDeadLineTask": false, "isRepeatingTask": false, "taskRepeatStartDate": "2021-12-23T09:57:08.181Z", "taskPriority": "NORMAL", "isMustUseCamera": false, "isUseQuestionnaire": false, "questionnaireId": "" }
                subwrapper.setState({ errors: Serrors }, () => {
                    var validate = subwrapper.instance().validationtask(obj);
                    expect(validate).toBe(false)
                });
            })
            it("only enter Weekly This Task use Questionnaire on", () => {
                var obj = { "taskCategory": [], "taskApproversDtoList": [{ "viewName": "new 01", "approverUuid": "80", "id": 80, "approverRole": "CEO", "isNew": true, "userDto": { "userRolls": { "rollUUID": "8", "userLevel": "Chain", "systemMainRoleType": "CEO" } } }], "taskAllocationDtoList": [], "requestedFeedbackDto": [{ "feedbackTypeId": 4, "requestedFeedbackOption": [], "isNew": true }], "description": "", "title": "", "taskRepeatDetails": { "taskRepeatListDto": [], "taskRepeatStartDate": "2021-12-23T10:00:09.701Z", "isTimeFrameTask": false, "startTime": "", "endTime": "", "repeatType": "weekly" }, "taskHasUserGroups": [], "isDeadLineTask": false, "isRepeatingTask": true, "taskRepeatStartDate": "2021-12-23T10:02:45.362Z", "taskPriority": "NORMAL", "isMustUseCamera": false, "isUseQuestionnaire": true, "questionnaireId": "" }
                subwrapper.setState({ errors: Serrors }, () => {
                    var validate = subwrapper.instance().validationtask(obj);
                    expect(validate).toBe(false)
                });
            })
            it("only enter Weekly and Monday", () => {
                var obj = { "taskCategory": [], "taskApproversDtoList": [{ "viewName": "new 01", "approverUuid": "80", "id": 80, "approverRole": "CEO", "isNew": true, "userDto": { "userRolls": { "rollUUID": "8", "userLevel": "Chain", "systemMainRoleType": "CEO" } } }], "taskAllocationDtoList": [], "requestedFeedbackDto": [], "description": "", "title": "", "taskRepeatDetails": { "taskRepeatListDto": [{ "startTime": "", "endTime": "", "customDate": null, "taskDay": "Monday" }], "taskRepeatStartDate": "2021-12-23T13:16:26.690Z", "isTimeFrameTask": false, "startTime": "", "endTime": "", "repeatType": "weekly" }, "taskHasUserGroups": [], "isDeadLineTask": false, "isRepeatingTask": true, "taskRepeatStartDate": "2021-12-23T13:16:29.379Z", "taskPriority": "NORMAL", "isMustUseCamera": false, "isUseQuestionnaire": false, "questionnaireId": "" }
                subwrapper.setState({ errors: Serrors }, () => {
                    var validate = subwrapper.instance().validationtask(obj);
                    expect(validate).toBe(false)
                });
            })
            it("All entered + Yearly Comment exept Year Date", () => {
                var obj = { "taskCategory": [], "taskApproversDtoList": [{ "viewName": "new 01", "approverUuid": "80", "id": 80, "approverRole": "CEO", "isNew": true, "userDto": { "userRolls": { "rollUUID": "8", "userLevel": "Chain", "systemMainRoleType": "CEO" } } }], "taskAllocationDtoList": [{ "allocatorUuid": "80", "reciverRole": "Region_Manager", "isNew": true, "taskAllcationDetailDto": [{ "reciverUuid": "3ac91db4-617b-4c45-a10d-7337a9764f10", "systemMainRoleType": "Region_Manager", "viewName": "C-002", "isNew": true, "userDto": { "userRolls": { "chieldsUserRoles": [{ "rollId": 14, "uuid": "0a374b10-4a5f-4388-9c93-26dc577a7a54", "rank": 5, "level": "Store", "rollName": "Branch Manager" }, { "rollId": 15, "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58", "rank": 6, "level": "Store", "rollName": "Department Head" }, { "rollId": 16, "uuid": "35c466d6-6621-4a56-a462-e3a45c6192e6", "rank": 7, "level": "Store", "rollName": "Worker" }, { "rollId": 19, "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb", "rank": 8, "level": "Store", "rollName": "Custom Role - 01" }, { "rollId": 20, "uuid": "3c2b8970-9bf9-4595-99d8-eeac58372414", "rank": 6, "level": "Store", "rollName": "Custom Role - 02" }, { "rollId": 21, "uuid": "cccee390-3569-431d-906f-ec0c6f7b5a3e", "rank": 7, "level": "Store", "rollName": "Custom Role - 02_Worker" }, { "rollId": 37, "uuid": "1367f784-79d0-4ac1-82c9-eb3687e2342b", "rank": 6, "level": "Store", "rollName": "Branch Planner" }, { "rollId": 38, "uuid": "f359f17b-4708-4177-8770-afb7ad456149", "rank": 5, "level": "Region", "rollName": "Region COO" }, { "rollId": 40, "uuid": "bbcf7d34-cea7-41e4-98b8-188b71db34aa", "rank": 6, "level": "Store", "rollName": "Custom Role -QA - COO WORKER" }], "parentUserRoles": [{ "rollId": 10, "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb", "rank": 3, "level": "Chain", "rollName": "Planner" }, { "rollId": 9, "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a", "rank": 2, "level": "Chain", "rollName": "COO" }, { "rollId": 8, "uuid": "8", "rank": 1, "level": "Chain", "rollName": "CEO" }], "systemMainRoleType": "Region_Manager", "userLevel": "Region", "regionUUID": "c7afd334-2557-4fc6-8fe6-9da517c08c72" } } }] }], "requestedFeedbackDto": [{ "feedbackTypeId": 1, "requestedFeedbackOption": [], "isNew": true }], "description": "test", "title": "test", "taskRepeatDetails": { "taskRepeatListDto": [], "taskRepeatStartDate": "2021-12-23T10:03:49.269Z", "isTimeFrameTask": false, "startTime": "", "endTime": "3:00", "repeatType": "yearly", "taskRepeatEndDate": "2021-12-17T18:30:00.000Z", "yearyDate": "NaN-aN-aN", "month": "" }, "taskHasUserGroups": [], "isDeadLineTask": true, "isRepeatingTask": true, "taskRepeatStartDate": "2021-12-23T10:06:53.725Z", "taskPriority": "NORMAL", "isMustUseCamera": false, "isUseQuestionnaire": false, "questionnaireId": "" };
                subwrapper.setState({ errors: Serrors }, () => {
                    var validate = subwrapper.instance().validationtask(obj);
                    expect(validate).toBe(false)
                });
            })
            it("Monthly select  all empty", () => {
                var obj = { "taskCategory": [], "taskApproversDtoList": [{ "viewName": "new 01", "approverUuid": "80", "id": 80, "approverRole": "CEO", "isNew": true, "userDto": { "userRolls": { "rollUUID": "8", "userLevel": "Chain", "systemMainRoleType": "CEO" } } }], "taskAllocationDtoList": [], "requestedFeedbackDto": [], "description": "", "title": "", "taskRepeatDetails": { "taskRepeatListDto": [], "taskRepeatStartDate": "2021-12-23T10:26:48.148Z", "isTimeFrameTask": false, "startTime": "", "endTime": "", "repeatType": "monthly" }, "taskHasUserGroups": [], "isDeadLineTask": false, "isRepeatingTask": true, "taskRepeatStartDate": "2021-12-23T10:28:23.126Z", "taskPriority": "NORMAL", "isMustUseCamera": false, "isUseQuestionnaire": false, "questionnaireId": "" }
                subwrapper.setState({ errors: Serrors }, () => {
                    var validate = subwrapper.instance().validationtask(obj);
                    expect(validate).toBe(false)
                });
            })
            it("Monthly select  all empty is time frame on", () => {
                var obj = { "taskCategory": [], "taskApproversDtoList": [{ "viewName": "new 01", "approverUuid": "80", "id": 80, "approverRole": "CEO", "isNew": true, "userDto": { "userRolls": { "rollUUID": "8", "userLevel": "Chain", "systemMainRoleType": "CEO" } } }], "taskAllocationDtoList": [], "requestedFeedbackDto": [], "description": "", "title": "", "taskRepeatDetails": { "taskRepeatListDto": [], "taskRepeatStartDate": "2021-12-23T10:37:56.099Z", "isTimeFrameTask": true, "startTime": "", "endTime": "", "repeatType": "monthly" }, "taskHasUserGroups": [], "isDeadLineTask": false, "isRepeatingTask": true, "taskRepeatStartDate": "2021-12-23T10:38:01.756Z", "taskPriority": "NORMAL", "isMustUseCamera": false, "isUseQuestionnaire": false, "questionnaireId": "" }
                subwrapper.setState({ errors: Serrors }, () => {
                    var validate = subwrapper.instance().validationtask(obj);
                    expect(validate).toBe(false)
                });
            })
            it("Weekly and timeframe on select  all empty", () => {
                var obj = { "taskCategory": [], "taskApproversDtoList": [{ "viewName": "new 01", "approverUuid": "80", "id": 80, "approverRole": "CEO", "isNew": true, "userDto": { "userRolls": { "rollUUID": "8", "userLevel": "Chain", "systemMainRoleType": "CEO" } } }], "taskAllocationDtoList": [], "requestedFeedbackDto": [], "description": "", "title": "", "taskRepeatDetails": { "taskRepeatListDto": [], "taskRepeatStartDate": "2021-12-23T10:29:17.724Z", "isTimeFrameTask": true, "startTime": "", "endTime": "", "repeatType": "weekly" }, "taskHasUserGroups": [], "isDeadLineTask": false, "isRepeatingTask": true, "taskRepeatStartDate": "2021-12-23T10:30:34.442Z", "taskPriority": "NORMAL", "isMustUseCamera": false, "isUseQuestionnaire": false, "questionnaireId": "" }
                subwrapper.setState({ errors: Serrors }, () => {
                    var validate = subwrapper.instance().validationtask(obj);
                    expect(validate).toBe(false)
                });
            })
            it("Yearly and timeframe on select  all empty", () => {
                var obj = { "taskCategory": [], "taskApproversDtoList": [{ "viewName": "new 01", "approverUuid": "80", "id": 80, "approverRole": "CEO", "isNew": true, "userDto": { "userRolls": { "rollUUID": "8", "userLevel": "Chain", "systemMainRoleType": "CEO" } } }], "taskAllocationDtoList": [], "requestedFeedbackDto": [], "description": "", "title": "", "taskRepeatDetails": { "taskRepeatListDto": [], "taskRepeatStartDate": "2021-12-23T10:32:49.804Z", "isTimeFrameTask": true, "startTime": "", "endTime": "", "repeatType": "yearly", "yearyDate": "NaN-aN-aN", "month": "" }, "taskHasUserGroups": [], "isDeadLineTask": false, "isRepeatingTask": true, "taskRepeatStartDate": "2021-12-23T10:32:58.434Z", "taskPriority": "NORMAL", "isMustUseCamera": false, "isUseQuestionnaire": false, "questionnaireId": "" }
                subwrapper.setState({ errors: Serrors }, () => {
                    var validate = subwrapper.instance().validationtask(obj);
                    expect(validate).toBe(false)
                });
            })
        })
        describe(" Allow To save", () => {
            it("Once Comment type Task", () => {
                var obj = { "taskCategory": [{ "categoryCode": "001", "categoryName": "Task Category 1", "categoryColor": "#0000", "categoryId": 1, "label": "Task Category 1", "value": "Task Category 1", "isNew": true }], "taskApproversDtoList": [{ "viewName": "new 01", "approverUuid": "80", "id": 80, "approverRole": "CEO", "isNew": true, "userDto": { "userRolls": { "rollUUID": "8", "userLevel": "Chain", "systemMainRoleType": "CEO" } } }], "taskAllocationDtoList": [{ "allocatorUuid": "80", "reciverRole": "Region_Manager", "isNew": true, "taskAllcationDetailDto": [{ "reciverUuid": "3ac91db4-617b-4c45-a10d-7337a9764f10", "systemMainRoleType": "Region_Manager", "viewName": "C-002", "isNew": true, "userDto": { "userRolls": { "chieldsUserRoles": [{ "rollId": 14, "uuid": "0a374b10-4a5f-4388-9c93-26dc577a7a54", "rank": 5, "level": "Store", "rollName": "Branch Manager" }, { "rollId": 15, "uuid": "73b95ca2-dbd9-4aea-b844-1cc58eda1a58", "rank": 6, "level": "Store", "rollName": "Department Head" }, { "rollId": 16, "uuid": "35c466d6-6621-4a56-a462-e3a45c6192e6", "rank": 7, "level": "Store", "rollName": "Worker" }, { "rollId": 19, "uuid": "0784582e-84c1-455d-bfd9-3fecc8efbaeb", "rank": 8, "level": "Store", "rollName": "Custom Role - 01" }, { "rollId": 20, "uuid": "3c2b8970-9bf9-4595-99d8-eeac58372414", "rank": 6, "level": "Store", "rollName": "Custom Role - 02" }, { "rollId": 21, "uuid": "cccee390-3569-431d-906f-ec0c6f7b5a3e", "rank": 7, "level": "Store", "rollName": "Custom Role - 02_Worker" }, { "rollId": 37, "uuid": "1367f784-79d0-4ac1-82c9-eb3687e2342b", "rank": 6, "level": "Store", "rollName": "Branch Planner" }, { "rollId": 38, "uuid": "f359f17b-4708-4177-8770-afb7ad456149", "rank": 5, "level": "Region", "rollName": "Region COO" }, { "rollId": 40, "uuid": "bbcf7d34-cea7-41e4-98b8-188b71db34aa", "rank": 6, "level": "Store", "rollName": "Custom Role -QA - COO WORKER" }], "parentUserRoles": [{ "rollId": 10, "uuid": "667b0d82-8bcc-4a53-91d0-da268112d5cb", "rank": 3, "level": "Chain", "rollName": "Planner" }, { "rollId": 9, "uuid": "c9b8e0f3-eda3-4e1c-8247-20261271728a", "rank": 2, "level": "Chain", "rollName": "COO" }, { "rollId": 8, "uuid": "8", "rank": 1, "level": "Chain", "rollName": "CEO" }], "systemMainRoleType": "Region_Manager", "userLevel": "Region", "regionUUID": "c7afd334-2557-4fc6-8fe6-9da517c08c72" } } }] }], "requestedFeedbackDto": [{ "feedbackTypeId": 1, "requestedFeedbackOption": [], "isNew": true }], "description": "Test001", "title": "Test001", "taskRepeatDetails": { "taskRepeatListDto": [{ "startTime": "", "endTime": "6:00", "customDate": "2021-12-25", "taskDay": null }], "taskRepeatStartDate": "2021-12-23T13:21:36.074Z", "isTimeFrameTask": false, "startTime": "", "endTime": "", "repeatType": "One Time" }, "taskHasUserGroups": [], "isDeadLineTask": false, "isRepeatingTask": false, "taskRepeatStartDate": "2021-12-23T13:22:38.938Z", "taskPriority": "NORMAL", "isMustUseCamera": false, "isUseQuestionnaire": false, "questionnaireId": "" }
                subwrapper.setState({ errors: Serrors }, () => {
                    var validate = subwrapper.instance().validationtask(obj);
                    expect(validate).toBe(true)
                });
            })
        })
    })
    describe("Return Month function", () => {
        it("All empty check validations", () => {
            var date = new Date("Sat Dec 11 2021 00:00:00 GMT+0530 (India Standard Time)")
            var month = subwrapper.instance().returnMonth(date);
            expect(month).toBe('December')
        })
    })
    describe("changeselectedFBmedia  function", () => {
        it("Success path Feedback Media", () => {
            var value = { "id": 6, "name": "photo", "selected": true, "icon": "image", "vname": "Picture", "isNew": false, "isDelete": false, "requestedFeedbackId": -1 }
            subwrapper.setState({ mediaFeedbackTypes: [{ "id": 6, "name": "photo", "selected": false, "icon": "image", "vname": "Picture", "isNew": false, "isDelete": false, "requestedFeedbackId": -1 }, { "id": 7, "name": "video", "selected": false, "icon": "video", "vname": "Video", "isNew": false, "isDelete": false, "requestedFeedbackId": -1 }, { "id": 5, "name": "qr", "selected": false, "icon": "grid", "vname": "QR", "isNew": false, "isDelete": false, "requestedFeedbackId": -1 }], isedit: false, sobj: { "taskCategory": [], "taskApproversDtoList": [], "taskAllocationDtoList": [], "requestedFeedbackDto": [], "description": "", "title": "", "taskRepeatDetails": { "taskRepeatListDto": [], "isTimeFrameTask": false } } });
            wrapper.update();
            subwrapper.instance().changeselectedFBmedia(value);
            expect(subwrapper.state().mediaFeedbackTypes[0].selected).toBe(true)
        })
    })
    describe("handleApproverList  function", () => {
        it("No previous added approvers & add region approver", () => {
            var obj = { "parentUserRoles": [], "chieldsUserRoles": [], "regionId": 9, "regionName": "C-003", "regionUUID": "dcbc6b82-212c-4090-8391-f45f6e57a7f1", "userFirstName": "C-003", "userId": 105, "userLastName": "RM", "userUUID": "49a6c731-f69c-425b-8053-1a42a9fdcb07", "rollName": "Region Manager", "rollUUID": "ceb52652-028b-43b9-8256-91ad998c86c1", "systemMainRoleType": "Region_Manager", "roleUserLevel": "Region", "rollRank": 4 }
            subwrapper.setState({ sobj: { "taskCategory": [], "taskApproversDtoList": [], "taskAllocationDtoList": [], "requestedFeedbackDto": [], "description": "", "title": "", "taskRepeatDetails": { "taskRepeatListDto": [], "isTimeFrameTask": false } } })
            wrapper.update();
            subwrapper.instance().handleApproverList(obj);
            expect(subwrapper.state().sobj.taskApproversDtoList.length).toBe(1)
        })
        it("have previous Users (not saved users) added approvers & add store approver", () => {
            var obj = { "parentUserRoles": [], "chieldsUserRoles": [], "storeId": 38, "storeName": "C-003_B01", "storeUUID": "91bfa70a-b555-43a6-ae14-2dec8f3f8976", "userFirstName": "C-003_B01", "userId": 106, "userLastName": "SM", "userUUID": "beffab8a-967d-4a1b-8115-f8b1e36c3470", "rollName": "Branch Manager", "rollUUID": "0a374b10-4a5f-4388-9c93-26dc577a7a54", "systemMainRoleType": "Store_Manager", "roleUserLevel": "Store", "regionId": 9, "regionName": "C-003", "regionUUID": "dcbc6b82-212c-4090-8391-f45f6e57a7f1", "rollRank": 5 }
            subwrapper.setState({ sobj: { "taskCategory": [], "taskApproversDtoList": [{ "approverUuid": "49a6c731-f69c-425b-8053-1a42a9fdcb07", "approverRole": "Region_Manager", "viewName": "C-003", "isNew": true, "userDto": { "userRolls": { "rollUUID": "ceb52652-028b-43b9-8256-91ad998c86c1", "userLevel": "Region", "systemMainRoleType": "Region_Manager", "regionUUID": "dcbc6b82-212c-4090-8391-f45f6e57a7f1" } } }], "taskAllocationDtoList": [], "requestedFeedbackDto": [], "description": "", "title": "", "taskRepeatDetails": { "taskRepeatListDto": [], "isTimeFrameTask": false } } })
            wrapper.update();
            subwrapper.instance().handleApproverList(obj);
            expect(subwrapper.state().sobj.taskApproversDtoList.length).toBe(2)
        })
        it("have previous  (saved users)  approvers & add new store approver", () => {
            var obj = { "userGroupDetails": [], "parentUserRoles": [], "chieldsUserRoles": [], "storeId": 35, "storeName": "C-002_B01", "storeUUID": "94c9bcf4-7544-49c3-81ea-6a33ffcba9ba", "userFirstName": "C-002_B01", "userId": 97, "userLastName": "WO", "userUUID": "6fb06852-98c5-445a-9b76-90b223ca94c4", "rollName": "Worker", "rollUUID": "35c466d6-6621-4a56-a462-e3a45c6192e6", "systemMainRoleType": "Worker", "roleUserLevel": "Store", "regionId": 8, "regionName": "C-002", "regionUUID": "c7afd334-2557-4fc6-8fe6-9da517c08c72", "rollRank": 7 }
            subwrapper.setState({ sobj: { "taskCategory": [], "taskApproversDtoList": [{ "approverUuid": "3ac91db4-617b-4c45-a10d-7337a9764f10", "approverRole": "Region_Manager", "id": 1925, "isNew": false, "isDelete": false, "userDto": { "name": "C-002 RM", "firstName": "C-002", "lastName": "RM", "userUUID": "3ac91db4-617b-4c45-a10d-7337a9764f10", "userId": 94, "userRolls": { "parentUserRoles": [], "chieldsUserRoles": [], "rollUUID": "ceb52652-028b-43b9-8256-91ad998c86c1", "name": "Region Manager", "rank": 4, "uuid": "8be1f349-c9d5-4520-81b5-41fc73c3041b", "systemMainRoleType": "Region_Manager", "regionName": "C-002", "regionUUID": "c7afd334-2557-4fc6-8fe6-9da517c08c72", "userLevel": "Region" } }, "viewName": "C-002" }], "taskAllocationDtoList": [], "requestedFeedbackDto": [], "description": "", "title": "", "taskRepeatDetails": { "taskRepeatListDto": [], "isTimeFrameTask": false } } })
            wrapper.update();
            subwrapper.instance().handleApproverList(obj);
            expect(subwrapper.state().sobj.taskApproversDtoList[0].isDelete).toBe(false)
        })
        it("have previous  (saved users)  approvers & click onsame approver-remove prevsaved approver", () => {
            var obj = { "parentUserRoles": [], "chieldsUserRoles": [], "regionId": 8, "regionName": "C-002", "regionUUID": "c7afd334-2557-4fc6-8fe6-9da517c08c72", "userFirstName": "C-002", "userId": 94, "userLastName": "RM", "userUUID": "3ac91db4-617b-4c45-a10d-7337a9764f10", "rollName": "Region Manager", "rollUUID": "ceb52652-028b-43b9-8256-91ad998c86c1", "systemMainRoleType": "Region_Manager", "roleUserLevel": "Region", "rollRank": 4 }
            subwrapper.setState({ sobj: { "taskCategory": [], "taskApproversDtoList": [{ "approverUuid": "3ac91db4-617b-4c45-a10d-7337a9764f10", "approverRole": "Region_Manager", "id": 1925, "isNew": false, "isDelete": false, "userDto": { "name": "C-002 RM", "firstName": "C-002", "lastName": "RM", "userUUID": "3ac91db4-617b-4c45-a10d-7337a9764f10", "userId": 94, "userRolls": { "parentUserRoles": [], "chieldsUserRoles": [], "rollUUID": "ceb52652-028b-43b9-8256-91ad998c86c1", "name": "Region Manager", "rank": 4, "uuid": "8be1f349-c9d5-4520-81b5-41fc73c3041b", "systemMainRoleType": "Region_Manager", "regionName": "C-002", "regionUUID": "c7afd334-2557-4fc6-8fe6-9da517c08c72", "userLevel": "Region" } }, "viewName": "C-002" }], "taskAllocationDtoList": [], "requestedFeedbackDto": [], "description": "", "title": "", "taskRepeatDetails": { "taskRepeatListDto": [], "isTimeFrameTask": false } } })
            wrapper.update();
            subwrapper.instance().handleApproverList(obj);
            expect(subwrapper.state().sobj.taskApproversDtoList.length).toBe(1)
            expect(subwrapper.state().sobj.taskApproversDtoList[0].isDelete).toBe(true)
        })
    })

    describe("Save task Function test", () => {
        describe("Save task Success Path", () => {
            it("Comment Once Task without category", () => {
                // const spy = jest.spyOn(alertService, "success");
                subwrapper.setState(CommentOnceTaskwithoutcategorystate);
                wrapper.update();
                submitSets.mockResolvedValueOnce(Promise.resolve({ status: true, extra: "" }));
                console.log(subwrapper.state().sobj);
                subwrapper.instance().saveTask("save");
                // expect(alertService.success).toBeCalled();
            })
        })
    })

    describe("Category Handle Change Function", () => {
        it("Add Exist saved Category", () => {
           var newValue={    "categoryCode": "002",    "categoryName": "Task Category 2",    "categoryColor": "#0000",    "categoryId": 2,    "label": "Task Category 2",    "value": "Task Category 2",    "isNew": true}
            const spy = jest.spyOn(  subwrapper.instance(), "handleCategory");
            subwrapper.setState({categoryList:[    {        "categoryCode": "001",        "categoryName": "Task Category 1",        "categoryColor": "#0000",        "categoryId": 1,        "label": "Task Category 1",        "value": "Task Category 1"    },    {        "categoryCode": "002",        "categoryName": "Task Category 2",        "categoryColor": "#0000",        "categoryId": 2,        "label": "Task Category 2",        "value": "Task Category 2",        "isNew": true    },],sobj:{    "taskCategory": [        {            "categoryCode": "002",            "categoryName": "Task Category 2",            "categoryColor": "#0000",            "categoryId": 2,            "label": "Task Category 2",            "value": "Task Category 2",            "isNew": true        }    ],    "taskApproversDtoList": [],    "taskAllocationDtoList": [],    "requestedFeedbackDto": [],    "description": "",    "title": "",    "taskRepeatDetails": {        "taskRepeatListDto": [],        "isTimeFrameTask": false    }}});
            wrapper.update();
            subwrapper.instance().handleChange(newValue)
            expect(spy).toBeCalled();
        })
        it("Add created new Category", () => {
            var newValue={    "label": "ghghg",    "value": "ghghg",    "__isNew__": true}
             const spy = jest.spyOn(  subwrapper.instance(), "handleNewCategory");
             subwrapper.setState({categoryList:[    {        "categoryCode": "001",        "categoryName": "Task Category 1",        "categoryColor": "#0000",        "categoryId": 1,        "label": "Task Category 1",        "value": "Task Category 1"    },    {        "categoryCode": "002",        "categoryName": "Task Category 2",        "categoryColor": "#0000",        "categoryId": 2,        "label": "Task Category 2",        "value": "Task Category 2",        "isNew": true    },],sobj:{    "taskCategory": [        {            "categoryCode": "002",            "categoryName": "Task Category 2",            "categoryColor": "#0000",            "categoryId": 2,            "label": "Task Category 2",            "value": "Task Category 2",            "isNew": true        }    ],    "taskApproversDtoList": [],    "taskAllocationDtoList": [],    "requestedFeedbackDto": [],    "description": "",    "title": "",    "taskRepeatDetails": {        "taskRepeatListDto": [],        "isTimeFrameTask": false    }}});
             wrapper.update();
             subwrapper.instance().handleChange(newValue)
             expect(spy).toBeCalled();
         })
         it("Saved category remove and add again the same category", () => {
            var newValue={    "categoryCode": "001",    "categoryName": "Task Category 1",    "categoryColor": "#0000",    "categoryId": 1,    "label": "Task Category 1",    "value": "Task Category 1"}
             const spy = jest.spyOn(  subwrapper.instance(), "handleCategory");
             subwrapper.setState({categoryList:[    {        "categoryCode": "001",        "categoryName": "Task Category 1",        "categoryColor": "#0000",        "categoryId": 1,        "label": "Task Category 1",        "value": "Task Category 1",        "isNew": true    },  ],sobj:{    "taskCategory":[{    "categoryCode": "001",    "categoryName": "Task Category 1",    "categoryColor": "#0000",    "categoryId": 1,    "label": "Task Category 1",    "value": "Task Category 1",    "isNew": true}] ,    "taskApproversDtoList": [],    "taskAllocationDtoList": [],    "requestedFeedbackDto": [],    "description": "",    "title": "",    "taskRepeatDetails": {        "taskRepeatListDto": [],        "isTimeFrameTask": false    }}});
             wrapper.update();
             subwrapper.instance().handleChange(newValue)
             expect(spy).toBeCalled();
         })
    })
    

});