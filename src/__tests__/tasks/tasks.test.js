import { shallow,mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store'
import { Tasks as TestTasks } from '../../components/task/tasks';
import { Provider } from "react-redux";

const middlewares = []
const mockStore = configureStore(middlewares)

const initialState = {}
const store = mockStore(initialState)
var signedobj={signinDetails:{userRolls:{userLevel:"Chain"}}}
var taskFeedState={
    taskSummeryID:{taskId:1504,isApprover:false,isBottomLevel:false,taskStartDateTime:"2021-12-14T13:45:26.000Z",isRequestPhoto:false,isRequestVideo:false},
    taskfilterDetails: null,
}
let props = {
    t: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    signedobj:signedobj,
    taskFeedState:taskFeedState,
};
//check component loading without errors
it("Tasks list renders without crashing", () => {
    shallow(<TestTasks {...props} />);
});


var ftablebody=[{
    "taskAllocations": null,
    "mediaCollection": [
        {
            "feedBackTypeId": 7,
            "feedBackType": "video",
            "id": 306,
            "mediaThumUrl": "https://task-prod-res.s3.eu-west-3.amazonaws.com/media-collection/f25XwTIKkQ4Q8x-YxCb4GImage2?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIARRBCRW2FIEQDSZOR%2F20211217%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Date=20211217T104131Z&X-Amz-Expires=604800&X-Amz-Signature=5b9c82b6cb6b0fa62187cf379a3627d2c21fb29ecc79dd37f4a160d8241e53d1&X-Amz-SignedHeaders=host",
            "mediaThumbId": 652,
            "mediaId": 651,
            "mediaUrl": "https://task-prod-res.s3.eu-west-3.amazonaws.com/media-collection/ss7q0oJorutO-CChpc4vQImage1?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIARRBCRW2FIEQDSZOR%2F20211217%2Feu-west-3%2Fs3%2Faws4_request&X-Amz-Date=20211217T104131Z&X-Amz-Expires=604800&X-Amz-Signature=25cda49c5dc7916d2201db8f82a9522671d8561c63505b5a6f00bd8c10df58c2&X-Amz-SignedHeaders=host",
            "recordDate": "2021-12-09T07:35:14.841Z",
            "remark": "-"
        }
    ],
    "taskReceivers": [
        {
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
    ],
    "addedUser": "ceo ceo last ",
    "addedUserUUID": "20",
    "taskCreatedDate": "2021-12-09T07:34:37.081Z",
    "progress": 100,
    "taskStartDateTime": "2021-12-09T07:34:37.000Z",
    "taskEndDateTime": "2021-12-09T17:00:00.000Z",
    "taskId": 1410,
    "taskName": "test task mobile normal 17",
    "taskUUID": "f5911ee9-06f7-4662-97d8-5ae9be58517c",
    "taskPriority": "NORMAL",
    "isDeadlineTask": false,
    "isTimeFrameTask": false,
    "taskStatus": "Done",
    "taskAllocationDetailsStatus": "Done",
    "isApprover": true,
    "isReceiver": false,
    "isBottomLevel": false,
    "isAttendToTask": false,
    "isRequestPhoto": true,
    "isRequestVideo": true,
    "taskAllocationsType": "custom",
    "pendingCount": 0,
    "issueCount": 0,
    "doneCount": 1,
    "totalCount": 1,
    "taskAprrovableStatus": "CanApprove"
}]
describe("Feed table data loads without errors", () => {
    var deftabledata = ftablebody
    var defalldata = [{ page: 1, data: deftabledata }];
    const wrapper = mount(<MemoryRouter><Provider store={store}><TestTasks {...props}  /></Provider></MemoryRouter>);
    const subwrapper = wrapper.find(TestTasks);
    subwrapper.setState({ toridata: defalldata, ftablebody: deftabledata, isnottesting: false, isdataloaded: true });
    wrapper.update()

    it("Feed table data renders", () => {
        expect(wrapper.find("Col.tasklist-main tbody tr").length).toBe(1);
        console.log(wrapper.state());
    });
    it("If Video render play button on images", () => {
        expect(wrapper.find("Col.videoplay").length).toBe(1);
    });
    

});