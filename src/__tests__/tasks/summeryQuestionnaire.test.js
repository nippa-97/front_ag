import { shallow } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import { QuestionnaireResults } from '../../components/task/taskSummery/modal/questionnaireResults/questionnaireResults';

const setUp = (props = {}) => {
    const component = shallow(<QuestionnaireResults {...props} />);
    return component;

}

var numberquestion = {
    "questionFeedbackTypes": [
        {
            "isUpdate": false, "answer": "30", "requestedFeedbackTypeOptions": [], "taskCompletionMediaList": [],
            "feedbackType": "number", "feedbackTypeId": 2, "priorityLevel": 4, "requestedFeedbackTypeId": 11, "taskCompletionDetailId": 1
        },
        {
            "isUpdate": false, "answer": null, "requestedFeedbackTypeOptions": [], "taskCompletionMediaList": [],
            "feedbackType": "photo", "feedbackTypeId": 6, "priorityLevel": 2, "requestedFeedbackTypeId": 12, "taskCompletionDetailId": 2
        }
    ], "isAnswered": true, "mustUseCamera": true, "question": "What is the count of Carts ?", "questionId": 21, "questionNo": 1, "questionUUID": "c9562715-9214-4d47-86b2-6928d17457bc",
    "mainRequestedFeedbackType": "number", "actionType": "Next", "questionCompletionStatus": "Done", "mainRequestedFeedbackTypeId": 11, "mainFeedbackTypeId": 2
}
var branchquestion = {
    "questionFeedbackTypes": [
        {
            "isUpdate": false,
            "answer": null,
            "requestedFeedbackTypeOptions": [
                {
                    "answer": true,
                    "actionQuestionId": 27,
                    "actionType": "GoTo",
                    "optiontext": "Yes",
                    "requestedFeedbackOptionId": 1,
                    "taskCompletionDetailOptionId": 1
                },
                {
                    "answer": false,
                    "actionQuestionId": -1,
                    "actionType": "Next",
                    "optiontext": "No",
                    "requestedFeedbackOptionId": 2,
                    "taskCompletionDetailOptionId": 2
                }
            ],
            "taskCompletionMediaList": [],
            "feedbackType": "branch",
            "feedbackTypeId": 8,
            "priorityLevel": 8,
            "requestedFeedbackTypeId": 14,
            "taskCompletionDetailId": 4
        }
    ],
    "isAnswered": true,
    "mustUseCamera": false,
    "question": "Is flour available ?",
    "questionId": 23,
    "questionNo": 2,
    "questionUUID": "87ed77dc-02a8-4683-b32e-fc6db543e0f3",
    "mainRequestedFeedbackType": "branch",
    "actionType": "None",
    "questionCompletionStatus": "Done",
    "mainRequestedFeedbackTypeId": 14,
    "mainFeedbackTypeId": 8
}

var notanweredbranch = {
    "questionFeedbackTypes": [
        {
            "isUpdate": false,
            "answer": null,
            "requestedFeedbackTypeOptions": [
                {
                    "answer": false,
                    "actionQuestionId": -1,
                    "actionType": "Next",
                    "optiontext": "Yes",
                    "requestedFeedbackOptionId": 4,
                    "taskCompletionDetailOptionId": -1
                },
                {
                    "answer": false,
                    "actionQuestionId": -1,
                    "actionType": "Next",
                    "optiontext": "No",
                    "requestedFeedbackOptionId": 5,
                    "taskCompletionDetailOptionId": -1
                },
                {
                    "answer": false,
                    "actionQuestionId": -1,
                    "actionType": "Next",
                    "optiontext": "May Be",
                    "requestedFeedbackOptionId": 6,
                    "taskCompletionDetailOptionId": -1
                }
            ],
            "taskCompletionMediaList": [],
            "feedbackType": "branch",
            "feedbackTypeId": 8,
            "priorityLevel": 8,
            "requestedFeedbackTypeId": 15,
            "taskCompletionDetailId": -1
        }
    ],
    "isAnswered": false,
    "mustUseCamera": false,
    "question": "Are you add a purchase order for Flour ?",
    "questionId": 26,
    "questionNo": 3,
    "questionUUID": "c0545f58-5dac-4fde-80bc-91a4ede10ecf",
    "mainRequestedFeedbackType": "branch",
    "actionType": "None",
    "questionCompletionStatus": "pending",
    "mainRequestedFeedbackTypeId": 15,
    "mainFeedbackTypeId": 8
}
var checkboxquestion = {
    "questionFeedbackTypes": [
        {
            "isUpdate": false,
            "answer": null,
            "requestedFeedbackTypeOptions": [
                {
                    "answer": true,
                    "actionQuestionId": -1,
                    "actionType": "None",
                    "optiontext": "Rolls made",
                    "requestedFeedbackOptionId": 7,
                    "taskCompletionDetailOptionId": 7
                },
                {
                    "answer": true,
                    "actionQuestionId": -1,
                    "actionType": "None",
                    "optiontext": "Patis made",
                    "requestedFeedbackOptionId": 8,
                    "taskCompletionDetailOptionId": 8
                },
                {
                    "answer": true,
                    "actionQuestionId": -1,
                    "actionType": "None",
                    "optiontext": "Cream bun made",
                    "requestedFeedbackOptionId": 9,
                    "taskCompletionDetailOptionId": 9
                }
            ],
            "taskCompletionMediaList": [],
            "feedbackType": "checkboxes",
            "feedbackTypeId": 3,
            "priorityLevel": 5,
            "requestedFeedbackTypeId": 16,
            "taskCompletionDetailId": 6
        }
    ],
    "isAnswered": true,
    "mustUseCamera": false,
    "question": "Are you Done those ?",
    "questionId": 27,
    "questionNo": 4,
    "questionUUID": "c0545f58-5dac-4fde-80bc-91a4ede10ecf",
    "mainRequestedFeedbackType": "checkboxes",
    "actionType": "Next",
    "questionCompletionStatus": "I can not do",
    "mainRequestedFeedbackTypeId": 16,
    "mainFeedbackTypeId": 3
}
var textwithqrquestion = {
    "questionFeedbackTypes": [
        {
            "isUpdate": false,
            "answer": "Yeah i am happy",
            "requestedFeedbackTypeOptions": [],
            "taskCompletionMediaList": [],
            "feedbackType": "text",
            "feedbackTypeId": 1,
            "priorityLevel": 7,
            "requestedFeedbackTypeId": 17,
            "taskCompletionDetailId": 7
        }, {
            answer: null,
            feedbackType: "qr",
            feedbackTypeId: 5,
            isUpdate: false,
            priorityLevel: 1,
            requestedFeedbackTypeId: 57,
            requestedFeedbackTypeOptions: [],
            taskCompletionDetailId: 375,
            taskCompletionMediaList: [],
        }
    ],
    "isAnswered": true,
    "mustUseCamera": false,
    "question": "Are you happy for todays work ?",
    "questionId": 28,
    "questionNo": 5,
    "questionUUID": "bf482d23-0e0a-4b11-bbb6-ca8f863975e7",
    "mainRequestedFeedbackType": "text",
    "actionType": "Next",
    "questionCompletionStatus": "Done",
    "mainRequestedFeedbackTypeId": 17,
    "mainFeedbackTypeId": 1
}
describe('QuestionnaireResults Component', () => {
    let wrapper;
    beforeEach(() => {
        const props = {
            t: jest.fn(),
            quesionnaireDetails: [
                numberquestion,
                branchquestion,
                notanweredbranch,
                checkboxquestion,
                textwithqrquestion,]
        }
        wrapper = setUp(props);
    });
    it('should render without errors', () => {
        const component = wrapper.find(".Questionnairedisplay")
        expect(component.length).toBe(1)
    })
    it('render results count correctly', () => {
        const component = wrapper.find(".onequestionsection");
        expect(component.length).toBe(5)
    })
    it('render QR  correctly', () => {
        const component = wrapper.find(".QR");
        expect(component.length).toBe(1)
    })
    it('render Not-answered correctly', () => {
        const children = wrapper.find('.question-answer[children="N/A"]')
        expect(children).toHaveLength(1);

    })
})