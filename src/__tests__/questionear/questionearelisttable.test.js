import React from 'react';
import { shallow, mount } from 'enzyme';

import TableRow from '../../components/questionear/listtable/draggableRow';
import arrayMove from '../../components/questionear/listtable/arrayMove';
import QuestionTable from '../../components/questionear/listtable/questiontable';

let testquestionobj = {
    "checkList": [],
    "optionList": [
        {
            "questionId": 5,
            "optionId": 8,
            "optionName": "item 1",
            "questionFeedbackTypeId": 9,
            "actionType": "Next"
        },
        {
            "questionId": 5,
            "optionId": 9,
            "optionName": "item 2",
            "questionFeedbackTypeId": 9,
            "actionType": "Done"
        }
    ],
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
    "radioOptionList": [],
    "isNew": false,
    "questionId": 5,
    "question": "Question 2",
    "questionNo": 4,
    "questionnaireId": 4,
    "questionnaireName": "Questinear 3",
    "questionnaireStatus": "Draft",
    "mustUseCamera": false,
    "feedbackTypeId": 8,
    "feedbackType": "branch",
    "completeActionType": "None",
    "questionFeedBackTypeId": 9
}

let props = {
    t: jest.fn(),
    isRTL: "rtl",
    istesting: true,
    handleRowClick: jest.fn(),
    handleDeleteQuestion: jest.fn(),
    obj: testquestionobj,
    selectedQuestion: null,
    rownumber: 4,
    questStatus: "Draft",
    isHaveTasks: false,
    isQuestionOpened: false,
};

//table data loading
describe("table details loads without errors", () => {
    let tableprops = {...props, saveObj: { haveTasks: false, questionList: [testquestionobj] }};

    const wrapper = shallow(<QuestionTable {...tableprops} />);
    //console.log(wrapper.debug());
    it("list row position change works without errors", () => {
        //wrapper.find("#testsortend").simulate("click");
    });
});

//tablerows data loading
describe("tablerows data loads without errors", () => {
    const wrapper = shallow(<TableRow {...props} />);
    
    it("table row data loading", () => {
        expect(wrapper.find("td").at(0).text()).toBe("4");
        expect(wrapper.find("td").at(1).text()).toBe("Question 2");
    });

    it("table row click works without errors", () => {
        wrapper.find("td").at(0).simulate("click");
    });
});

//arrayrow validate
describe("arrayrows data sorting without errors", () => {
    let arrrowprops = [
        {
            "questionId": 4,
            "question": "Question 1",
            "questionNo": 1
        },
        {
            "questionId": 5,
            "question": "Question 2",
            "questionNo": 2
        },
        {
            "questionId": 6,
            "question": "Question 3",
            "questionNo": 3
        }
    ]

    const sortlist = arrayMove(arrrowprops,2,0);
    
    it("table row data loading", () => {
        expect(sortlist[0].questionId).toBe(6);
        expect(sortlist[0].question).toBe("Question 3");

        expect(sortlist[2].questionId).toBe(5);
        expect(sortlist[2].question).toBe("Question 2");
    });
});