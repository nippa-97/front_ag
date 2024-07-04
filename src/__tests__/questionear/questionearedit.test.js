import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import QuestionEdit from '../../components/questionear/questionedit/questionedit';

import { alertService } from '../../_services/alert.service';

const testquestionobj = {
    "checkList": [],
    "optionList": [],
    "mediaList": [
        {
            "mediaTypeId": 23,
            "feedbackTypeId": 6,
            "mediaName": "photo",
            "questionId": 11
        },
        {
            "mediaTypeId": 24,
            "feedbackTypeId": 5,
            "mediaName": "qr",
            "questionId": 11
        }
    ],
    "radioOptionList": [
        {
            "optionItemId": 3,
            "optionItemName": "item 1",
            "questionId": 11,
            "questionFeedbackTypeId": 22
        },
        {
            "optionItemId": 4,
            "optionItemName": "item 2",
            "questionId": 11,
            "questionFeedbackTypeId": 22
        }
    ],
    "isNew": false,
    "questionId": 11,
    "question": "Question 4",
    "questionNo": 2,
    "questionnaireId": 4,
    "questionnaireName": "Questinear 3",
    "questionnaireStatus": "Draft",
    "mustUseCamera": false,
    "feedbackTypeId": 4,
    "feedbackType": "radio",
    "completeActionType": "None",
    "questionFeedBackTypeId": 22
}

let props = {
    t: jest.fn(),
    isRTL: "rtl",
    handleUpdateQuestion: jest.fn(),
    handleUpdateQuestionInSave: jest.fn(),
    handleRowClick: jest.fn(),
    isedit: false,
    selectedQuestion: testquestionobj,
};

const testchecklist = [
    {
        "checkItemId": -1,
        "checkItemName": "item 1",
        "questionId": 11,
        "questionFeedbackTypeId": 18
    }
]

const testradiolist = [
    {
        "optionItemId": -1,
        "optionItemName": "item 1",
        "questionId": 11,
        "questionFeedbackTypeId": 22
    }
];

const testbranchlist = [
    {
        "questionId": 11,
        "optionId": -1,
        "optionName": "item 1",
        "questionFeedbackTypeId": 9,
        "actionType": "Next"
    }
];

const testvideoobj = { id: 7, name: "video", selected: false, icon: "video", vname: "video", isNew: true, isDelete: false, requestedFeedbackId: -1 }
const testqrobj = { id: 5, name: "qr", selected: false, icon: "qr", vname: "qr", isNew: true, isDelete: false, requestedFeedbackId: -1 }

//edit view data loading
describe("questionear edit view data loads without errors", () => {
    const wrapper = mount(<MemoryRouter><QuestionEdit {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(QuestionEdit);

    it("edit view data loading", () => {
        expect(wrapper.find("input#questnametxt").prop("value")).toBe("Question 4");
    });
    
    it("add new checklist item working without issues", () => {
        subwrapper.instance().handlechecklist(testchecklist,1);
        wrapper.update();

        expect(subwrapper.state().questionObj.checkList.length).toBe(1);
    });
    
    it("add new selectfromlist item working without issues", () => {
        subwrapper.instance().handlechecklist(testradiolist,3);
        wrapper.update();

        expect(subwrapper.state().questionObj.radioOptionList.length).toBe(1);
    });

    it("add new branchlist item working without issues", () => {
        subwrapper.instance().handlechecklist(testbranchlist,2);
        wrapper.update();

        expect(subwrapper.state().questionObj.optionList.length).toBe(1);
    });

    it("add new feedback media item working without issues", () => {
        subwrapper.instance().handleAddNewMedia(testvideoobj);
        wrapper.update();

        expect(subwrapper.state().questionObj.mediaList.length).toBe(3);
    });

    it("remove new feedback media item working without issues", () => {
        const cmediaitem = testvideoobj;
        cmediaitem["isselected"] = true;

        subwrapper.instance().handleAddNewMedia(cmediaitem);
        wrapper.update();
        
        expect(subwrapper.state().questionObj.mediaList.length).toBe(2);
    });

    it("remove existing feedback media item working without issues", () => {
        const cmediaitem = testqrobj;
        cmediaitem["isselected"] = true;
        
        subwrapper.instance().handleAddNewMedia(cmediaitem);
        wrapper.update();

        expect(subwrapper.state().questionObj.mediaList[1].isDelete).toBeTruthy();
    });

    it("reset question working without issues", () => {
        subwrapper.instance().handleResetQuestion();
        
        //expect(subwrapper.state().questionObj.checkList.length).toBe(0);
    });

    it("change question complete action type working without issues", () => {
        subwrapper.instance().handleChangeGoto("actionType","Next");
        
        expect(subwrapper.state().questionObj.completeActionType).toBe("Next");
    });

    it("change question complete action type goto working without issues", () => {
        subwrapper.instance().handleChangeGoto("actionQuestionId",{questionId: 2, questionNo:2, question: "Question 2"});
        
        expect(subwrapper.state().questionObj.completeActionType).toBe("GoTo");
        expect(subwrapper.state().questionObj.actionQuestionNo).toBe(2);
    });

    it("save question empty name validation working without issues", () => {
        var csaveobj = JSON.parse(JSON.stringify(testquestionobj));
        csaveobj["question"] = "";
        subwrapper.setState({ questionObj: csaveobj }, () => {
            jest.spyOn(alertService, 'error');
            subwrapper.instance().handleSaveQuestion();

            expect(alertService.error).toBeCalled();
        });
    });

    it("save question checklist validation working without issues", () => {
        var csaveobj = JSON.parse(JSON.stringify(testquestionobj));
        csaveobj["feedbackTypeId"] = 3;
        csaveobj["checkList"] = [{
            "checkItemId": 147,
            "checkItemName": "",
            "questionId": 10,
            "questionFeedbackTypeId": 18
        }]
        
        subwrapper.setState({ questionObj: csaveobj }, () => {
            jest.spyOn(alertService, 'error');
            subwrapper.instance().handleSaveQuestion();

            expect(alertService.error).toBeCalled();
        });
    });

    it("save question selectfromlist validation working without issues", () => {
        var csaveobj = JSON.parse(JSON.stringify(testquestionobj));
        csaveobj["feedbackTypeId"] = 4;
        csaveobj["radioOptionList"] = [{
            "optionItemId": 3,
            "optionItemName": "",
            "questionId": 10,
            "questionFeedbackTypeId": 22
        }]
        
        subwrapper.setState({ questionObj: csaveobj }, () => {
            jest.spyOn(alertService, 'error');
            subwrapper.instance().handleSaveQuestion();

            expect(alertService.error).toBeCalled();
        });
    });

    it("save question branchlist validation name working without issues", () => {
        var csaveobj = JSON.parse(JSON.stringify(testquestionobj));
        csaveobj["feedbackTypeId"] = 8;
        csaveobj["optionList"] = [{
            "questionId": 10,
            "optionId": 8,
            "optionName": "",
            "questionFeedbackTypeId": 9,
            "actionType": "Next"
        }]
        
        subwrapper.setState({ questionObj: csaveobj }, () => {
            jest.spyOn(alertService, 'error');
            subwrapper.instance().handleSaveQuestion();

            expect(alertService.error).toBeCalled();
        });
    });

    it("save question branchlist validation goto action working without issues", () => {
        var csaveobj = JSON.parse(JSON.stringify(testquestionobj));
        csaveobj["feedbackTypeId"] = 8;
        csaveobj["optionList"] = [{
            "questionId": 10,
            "optionId": 8,
            "optionName": "item 2",
            "questionFeedbackTypeId": 9,
            "actionType": "GoTo"
        }]
        
        subwrapper.setState({ questionObj: csaveobj }, () => {
            jest.spyOn(alertService, 'error');
            subwrapper.instance().handleSaveQuestion();

            expect(alertService.error).toBeCalled();
        });
    });
});
