import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import { QuestionearList, DetailsPopover } from '../../components/questionear/questionear';

import { submitSets } from '../../components/UiComponents/SubmitSets';

jest.mock('../../components/UiComponents/SubmitSets');

let props = {
    t: jest.fn(),
    setQuestionDetailsView: jest.fn(),
    setSelectedQuesionear: jest.fn(),
    history: { listen: jest.fn(), push: jest.fn() },
    isRTL: "rtl",
};

//check component loading without errors
it("questionear masterdata component renders without crashing", () => {
    submitSets.mockReturnValueOnce(Promise.resolve({ status: false, extra: null }));
    shallow(<QuestionearList {...props} />);
});

var tabledatalist = [{"taskList": [{"taskId": 1,"taskName": "test task name"},{"taskId": 2,"taskName": "test task 2"}],"questionnaireId": 1,"questionnaireName": "test name","versionNo": "1.0","questionnaireStatus": "Published","usedTaskCount": 3,"noOfQuestion": 5,"createdBy": "ait"}];
var oridatalist = [{page: 1, data: tabledatalist }];
var specificobj = {"questionList": [
        {"checkList": [],"optionList": [],"mediaList": [],"questionId": 1,"question": "Test question","questionNo": 1,"questionnaireId": 1,"mustUseCamera": false,"feedbackTypeId": 1,"completeActionType": "None"},
        {"checkList": [],"optionList": [],"mediaList": [],"questionId": 2,"question": "Test question","questionNo": 2,"questionnaireId": 3,"mustUseCamera": false,"feedbackTypeId": 1,"completeActionType": "None"},
        {"checkList": [],"optionList": [],"mediaList": [],"questionId": 3,"question": "Test question","questionNo": 3,"questionnaireId": 4,"mustUseCamera": false,"feedbackTypeId": 1,"completeActionType": "None"},
        {"checkList": [],"optionList": [],"mediaList": [],"questionId": 4,"question": "Test question","questionNo": 4,"questionnaireId": 3,"mustUseCamera": false,"feedbackTypeId": 1,"completeActionType": "None"},
        {"checkList": [],"optionList": [],"mediaList": [],"questionId": 5,"question": "Test question","questionNo": 5,"questionnaireId": 4,"mustUseCamera": false,"feedbackTypeId": 1,"completeActionType": "None"}
    ],
    "questionnaireId": 1,"questionnaireName": "test name","versionNo": "1.0","createdBy": "ait"}


//table data loading and rows click
describe("questionear masterdata table data loads without errors", () => {
    submitSets.mockReturnValueOnce(Promise.resolve({ status: false, extra: null }));
    const wrapper = mount(<MemoryRouter><QuestionearList {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(QuestionearList);

    subwrapper.setState({ ftablebody: tabledatalist, isdataloaded: true, ismocktesting: true, toridata: oridatalist });
    subwrapper.update();

    //table data loading check
    it("table data loading", () => {
        expect(wrapper.find(".tableview-content tbody tr").length).toBe(2);
    });
    //table row delete click check
    it("table row click (delete mode) working without issues", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: false, extra: null }));
        wrapper.find(".tableview-content tbody tr .icon-links").at(0).simulate('click');

        //wrapper.find(".react-confirm-alert-button-group button").at(0).simulate('click');
    });
    //table row edit click check
    it("table row click (edit mode) working without issues", () => {
        subwrapper.setState({ ftablebody: tabledatalist, isdataloaded: true, toridata: oridatalist });
        subwrapper.update();

        submitSets.mockReturnValueOnce(Promise.resolve({ status: false, extra: null }));
        wrapper.find(".tableview-content tbody tr .icon-links").at(1).simulate('click');
    });
    
    it("change filter text and update without errors", () => {
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: tabledatalist }));

        const testevent = { target: { value: "test name"}, which: 13 };
        subwrapper.instance().handleFilterObject(testevent,"searchName","enter");
    });

    it("questionear masterdata reset filters without errors", () => {
        jest.spyOn(subwrapper.instance(), 'handleTableSearch');
        subwrapper.instance().resetTableFilters();
        
        expect(subwrapper.state().sobj.startIndex).toBe(0);
        //expect(subwrapper.instance().handleTableSearch).toBeCalled();
    });

    it("questionear masterdata handle new link without errors", () => {
        subwrapper.instance().handleNewQueastionear();
    });

    it("questionear masterdata handle new redirect link without errors", () => {
        subwrapper.setState({ selectedQuestnear: specificobj }, () => {
            subwrapper.instance().redirectNewTask();
        });
    });

    it("check pagination setpage not existing page without errors", () => {
        jest.spyOn(subwrapper.instance(), 'handlePageChange');

        subwrapper.setState({ sobj: { searchName: "", isReqPagination: true, startIndex: 0, maxResult: 6, isReqCount: false },
        totalresults: 20 }, () => {
            subwrapper.instance().setPage(3,true);

            expect(subwrapper.instance().handlePageChange).toBeCalled();
        });
    });

    it("check pagination setpage existing page without errors", () => {
        subwrapper.setState({ sobj: { searchName: "", isReqPagination: true, startIndex: 0, maxResult: 6, isReqCount: false },
        totalresults: 20, toridata: [ {page: 1, data: tabledatalist } ] }, () => {
            subwrapper.instance().setPage(1,true);

            expect(subwrapper.instance().props.setSelectedQuesionear).toBeCalled();
        });
    });

    it("check pagination page change existing page without errors", () => {
        jest.spyOn(subwrapper.instance(), 'handleTableSearch');

        subwrapper.setState({ sobj: { searchName: "", isReqPagination: true, startIndex: 0, maxResult: 6, isReqCount: false },
        totalresults: 20, toridata: [ {page: 1, data: tabledatalist, totalPages: 3 } ] }, () => {
            subwrapper.instance().handlePageChange(1);

            //expect(subwrapper.instance().handleTableSearch).toBeCalled();
        });
    });
});
//add new user
describe("questionear loading sidebar without errors", () => {
    submitSets.mockReturnValueOnce(Promise.resolve({ status: false, extra: null }));
    const wrapper = mount(<MemoryRouter><QuestionearList {...props} /></MemoryRouter>);
    const subwrapper = wrapper.find(QuestionearList);

    subwrapper.setState({ ftablebody: tabledatalist, isdataloaded: true, ismocktesting: true, toridata: oridatalist });
    subwrapper.update();

    it("mock row details and open sidebar handle error", () =>{
        submitSets.mockReturnValueOnce(Promise.resolve({ status: false, extra: null }));
        subwrapper.instance().handleRowClick(specificobj);
        subwrapper.update();

        expect(subwrapper.state().selectedQuestnear).toBe(null);
    });

    it("mock row details and open sidebar handle success", () =>{
        submitSets.mockReturnValueOnce(Promise.resolve({ status: true, extra: specificobj }));
        subwrapper.instance().handleRowClick(specificobj);
        subwrapper.update();

        //expect(wrapper.find(".questionlist-content ul li").length).toBe(5);
    });

    it("close sidebar handle success", () =>{
        subwrapper.instance().handleRowClick(null,null,true);
        subwrapper.update();

        expect(subwrapper.state().selectedQuestnear).toBe(null);
    });
});

//check component snapshot without errors
/* it("questionear snapshot renders without crashing", () => {
    const wrapper = mount(<MemoryRouter><QuestionearList {...props} /></MemoryRouter>);
    expect(wrapper).toMatchSnapshot();
}); */

let detailsprops = {
    items: [{taskName: "Task item 1"},{taskName: "Task item 2"}],
    count: 2,
}

describe("questionear details popover works without errors", () => {
    it("loading popover data without issues", () => {
        const detwrapper = mount(<DetailsPopover {...detailsprops} />);
        expect(detwrapper.find("Button").text()).toBe("2");
    });

    it("loading popover data empty tasks without issues", () => {
        detailsprops.items = [];
        detailsprops.count = 0;
        const detwrapper = mount(<DetailsPopover {...detailsprops} />);
        expect(detwrapper.find("Button").text()).toBe("0");
    });
});