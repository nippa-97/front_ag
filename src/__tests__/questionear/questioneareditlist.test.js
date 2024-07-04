import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import { Checklist } from '../../components/questionear/questionedit/questoptions/checklist';
import { Fromlist } from '../../components/questionear/questionedit/questoptions/fromlist';
import { Selectlist } from '../../components/questionear/questionedit/questoptions/selectlist';

const testquestionobj = {
    "questionId": 10,
}

let props = {
    t: jest.fn(),
    isRTL: "rtl",
    handlechecklist: jest.fn(),
    isedit: false,
    questionObj: testquestionobj,
};

const testchecklist = [
    {
        "checkItemId": 147,
        "checkItemName": "item 1",
        "questionId": 10,
        "questionFeedbackTypeId": 18
    },
    {
        "checkItemId": 148,
        "checkItemName": "item 2",
        "questionId": 10,
        "questionFeedbackTypeId": 18
    }
]

const testradiolist = [
    {
        "optionItemId": 3,
        "optionItemName": "item 1",
        "questionId": 10,
        "questionFeedbackTypeId": 22
    },
    {
        "optionItemId": 4,
        "optionItemName": "item 2",
        "questionId": 10,
        "questionFeedbackTypeId": 22
    }
];

const testbranchlist = [
    {
        "questionId": 10,
        "optionId": 8,
        "optionName": "item 1",
        "questionFeedbackTypeId": 9,
        "actionType": "Next"
    },
    {
        "questionId": 10,
        "optionId": 9,
        "optionName": "item 2",
        "questionFeedbackTypeId": 9,
        "actionType": "Done"
    }
];

//checklist data loading
describe("checklist data loads without errors", () => {
    let checkprops = {...props, checkList: testchecklist}

    const wrapper = mount(<MemoryRouter><Checklist {...checkprops} /></MemoryRouter>);
    const subwrapper = wrapper.find(Checklist);

    it("list data loading", () => {
        expect(wrapper.find(".fromlist .list").length).toBe(2);
    });
    
    it("list add new item working without issues", () => {
        subwrapper.instance().addCListItem();
        wrapper.update();

        expect(subwrapper.state().checkList.length).toBe(3);
    });
    
    it("list remove new item working without issues", () => {
        subwrapper.instance().removeCListItem(2, {checkItemId:-1});
        wrapper.update();

        expect(subwrapper.state().checkList.length).toBe(2);
    });

    it("list remove existing item working without issues", () => {
        subwrapper.instance().removeCListItem(2, {checkItemId:148});
        wrapper.update();

        expect(subwrapper.state().checkList[1].isDelete).toBeTruthy();
    });

    it("change name of existing item working without issues", () => {
        var mockevent = { target: { value: "item 3"} }; 
        subwrapper.instance().handleOptiontext(mockevent, 0);
        wrapper.update();

        expect(subwrapper.state().checkList[0].checkItemName).toBe("item 3");
    });
});

//selectfromlist data loading
describe("selectfromlist data loads without errors", () => {
    let checkprops = {...props, checkList: testradiolist}

    const wrapper = mount(<MemoryRouter><Fromlist {...checkprops} /></MemoryRouter>);
    const subwrapper = wrapper.find(Fromlist);

    it("list data loading", () => {
        expect(wrapper.find(".fromlist .list").length).toBe(2);
    });
    
    it("list add new item working without issues", () => {
        subwrapper.instance().addCListItem();
        wrapper.update();

        expect(subwrapper.state().checkList.length).toBe(3);
    });
    
    it("list remove new item working without issues", () => {
        subwrapper.instance().removeCListItem(2, {optionItemId:-1});
        wrapper.update();

        expect(subwrapper.state().checkList.length).toBe(2);
    });

    it("list remove existing item working without issues", () => {
        subwrapper.instance().removeCListItem(2, {optionItemId:4});
        wrapper.update();

        expect(subwrapper.state().checkList[1].isDelete).toBeTruthy();
    });

    it("change name of existing item working without issues", () => {
        var mockevent = { target: { value: "item 3"} }; 
        subwrapper.instance().handleOptiontext(mockevent, 0);
        wrapper.update();

        expect(subwrapper.state().checkList[0].optionItemName).toBe("item 3");
    });
});

//branchlist data loading
describe("branchlist data loads without errors", () => {
    let checkprops = {...props, checkList: testbranchlist}

    const wrapper = mount(<MemoryRouter><Selectlist {...checkprops} /></MemoryRouter>);
    const subwrapper = wrapper.find(Selectlist);

    it("list data loading", () => {
        expect(wrapper.find(".fromlist .list").length).toBe(2);
    });
    
    it("list add new item working without issues", () => {
        subwrapper.instance().addCListItem();
        wrapper.update();

        expect(subwrapper.state().checkList.length).toBe(3);
    });
    
    it("list remove new item working without issues", () => {
        subwrapper.instance().removeCListItem(2, {optionId:-1});
        wrapper.update();

        expect(subwrapper.state().checkList.length).toBe(2);
    });

    it("list remove existing item working without issues", () => {
        subwrapper.instance().removeCListItem(2, {optionId:9});
        wrapper.update();

        expect(subwrapper.state().checkList[1].isDelete).toBeTruthy();
    });

    it("change name of existing item working without issues", () => {
        var mockevent = { target: { value: "item 3"} }; 
        subwrapper.instance().handleOptiontext(mockevent, 0);
        wrapper.update();

        expect(subwrapper.state().checkList[0].optionName).toBe("item 3");
    });

    it("change goto link of existing item actiontype change working without issues", () => {
        subwrapper.instance().handleChangeGoto(0, "actionType", "None");
        wrapper.update();

        expect(subwrapper.state().checkList[0].actionType).toBe("None");
    });

    it("change goto link of existing item go to question id change working without issues", () => {
        var mockquestion = { questionId: 11, questionNo: "2", question: "Test question 2" }; 
        subwrapper.instance().handleChangeGoto(0, "actionQuestionId", mockquestion);
        wrapper.update();

        expect(subwrapper.state().checkList[0].actionType).toBe("GoTo");
        expect(subwrapper.state().checkList[0].actionQuestionNo).toBe("2");
    });
});