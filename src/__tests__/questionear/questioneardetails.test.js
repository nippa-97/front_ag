import { shallow, mount } from 'enzyme';
import { MemoryRouter } from 'react-router-dom';

import { QuestionDetails } from '../../components/questionear/questiondetails';
import QuestionTable from '../../components/questionear/listtable/questiontable';

import { submitSets } from '../../components/UiComponents/SubmitSets';
import { alertService } from '../../_services/alert.service';

import { TRANSLATIONS_EN } from '../../_translations/en/translations';

var testviewobj = {"questionList": [
    {"checkList": [],"optionList": [],"mediaList": [{"feedbackTypeId": 1,"mediaTypeId": 1},{"feedbackTypeId": 1,"mediaTypeId": 2},{"feedbackTypeId": 1,"mediaTypeId": 3},{"feedbackTypeId": 1,"mediaTypeId": 4}],"radioOptionList": [],"questionId": 1,"question": "Test question 1","questionNo": 1,"questionnaireId": 1,"mustUseCamera": false,"feedbackTypeId": 1,"completeActionType": "None"},
    {"checkList": [{"checkItemId": 1,"checkItemName": "test check item 1","questionId": 2},{"checkItemId": 2,"checkItemName": "test check item 2","questionId": 2},{"checkItemId": 3,"checkItemName": "test check item 3","questionId": 2},{"checkItemId": 4,"checkItemName": "test check item 4","questionId": 2}],"optionList": [],"mediaList": [],"radioOptionList": [],"questionId": 2,"question": "Test question 2","questionNo": 2,"questionnaireId": 3,"mustUseCamera": false,"feedbackTypeId": 1,"completeActionType": "None"},
    {"checkList": [],"optionList": [{"questionId": 5,"optionId": 8,"optionName": "item 1","questionFeedbackTypeId": 9,"actionType": "Next"},{"questionId": 5,"optionId": 9,"optionName": "item 2","questionFeedbackTypeId": 9,"actionType": "GoTo","actionQuestionId":0}],"mediaList": [],"radioOptionList": [],"isNew": false,"questionId": 5,"question": "Question 2","questionNo": 4,"questionnaireId": 4,"questionnaireName": "Questinear 3","questionnaireStatus": "Draft","mustUseCamera": false,"feedbackTypeId": 8,"feedbackType": "branch","completeActionType": "None","questionFeedBackTypeId": 9}],
    "questionnaireId": -1,"questionnaireName": "test name","questionnaireStatus":"Draft","versionNo": "1.0","createdBy": "ait","isNewQuestionnaire":true};

function testtranslate(transtxt){
    return TRANSLATIONS_EN[transtxt];
}

let props = {
    t: testtranslate,
    history: { listen: jest.fn(), push: jest.fn() },
    setQuestionDetailsView: jest.fn(),
    istesting: true,
    questionState: { questionState: testviewobj },
};

//check component loading without errors
it("questionear details page renders without crashing", () => {
    shallow(<QuestionDetails {...props} />);
});

const wrapper = mount(<MemoryRouter><QuestionDetails {...props} /></MemoryRouter>);
const subcomponent = wrapper.find(QuestionDetails);

const mockclick = () => {
    subcomponent.setState({ selectedQuestion: testviewobj.questionList[1], questStatus: "Draft", selectedQuestIndex: 1, isQuestionOpened: true, isPositionChanged: false, isDataLoading: false });
    subcomponent.update();
}

jest.mock('../../components/questionear/listtable/questiontable', () => ({
    __esModule: true,
    default: () => { return <div className="table-container"><table>
    <thead><tr><th></th></tr></thead>
    <tbody>{testviewobj.questionList.map((value, index) => {
        return <tr key={index} onClick={() => mockclick()}><td>{value.question}</td></tr>;
    })}</tbody>
</table></div>},
}))

jest.mock('../../components/UiComponents/SubmitSets');

//table data loading and rows click
describe("questions table data loads without errors", () => {
    subcomponent.setState({ saveObj: testviewobj, isDataLoading: false });
    subcomponent.update();

    //table data loading check
    it("table data loading", () => {
        expect(wrapper.find(".table-container tbody tr").length).toBe(3);
    });
    //table row click check
    it("table row click working without issues", () => {
        wrapper.find(".tableview-content tbody tr").at(1).simulate('click');
        expect(wrapper.find(".questionear-summary-content input#questnametxt").props().value).toBe("Test question 2");
    });
    //filter table rows
    it("filter table rows working without issues", () => {
        subcomponent.instance().filterQuestionList("question 2",false);
        wrapper.update();

        //expect(wrapper.find(".questionear-summary-content input#questnametxt").props().value).toBe("Test question");
    });
    //save edit question
    it("save edit question without issues", () => {
        wrapper.find(".questionear-summary-content input#questnametxt").simulate('change', { target: { value: 'Test question 2' } });
        wrapper.update();
        
        submitSets.mockResolvedValueOnce(Promise.resolve({ status: true, extra: { questionnaireId: 2 } }));
        wrapper.find(".questionear-summary-content #savequestbtn").at(0).simulate('click');
        //loading questinear details again
        submitSets.mockResolvedValueOnce(Promise.resolve({ status: true, extra: testviewobj }));
    });
    //save questionnaire
    it("save questionnear validate name works without issues", () => {
        var csaveobj = JSON.parse(JSON.stringify(testviewobj));
        csaveobj["questionnaireName"] = "";
        subcomponent.setState({ saveObj: csaveobj }, () => {
            jest.spyOn(alertService, 'error');
            subcomponent.instance().handleSaveQuest();

            expect(alertService.error).toBeCalled();
        });
    });
    it("save questionnear validate question list works without issues", () => {
        var csaveobj = JSON.parse(JSON.stringify(testviewobj));
        csaveobj["questionList"] = [];
        subcomponent.setState({ saveObj: csaveobj }, () => {
            jest.spyOn(alertService, 'error');
            subcomponent.instance().handleSaveQuest();

            expect(alertService.error).toBeCalled();
        });
    });
    it("save questionnear works response error without issues", () => {
        var csaveobj = JSON.parse(JSON.stringify(testviewobj));
        subcomponent.setState({ saveObj: csaveobj }, () => {
            jest.spyOn(alertService, 'error');
            submitSets.mockResolvedValueOnce(Promise.resolve({ status: false, extra: "error" }));
            subcomponent.instance().handleSaveQuest();
            
            //expect(alertService.error).toBeCalled();
        });
    });
    /* it("save questionnear works without issues", () => {
        var csaveobj = JSON.parse(JSON.stringify(testviewobj));
        subcomponent.setState({ saveObj: csaveobj }, () => {
            jest.spyOn(subcomponent.instance(), 'getQuestDetails');
            submitSets.mockResolvedValueOnce(Promise.resolve({ status: true, extra: testviewobj }));
            subcomponent.instance().handleSaveQuest();
            
            //expect(subcomponent.instance().getQuestDetails).toBeCalled();
        });
    }); */

    //check change postion of questions table
    it("change questions postions works without issues", () => {
        subcomponent.instance().handleChangePostions(testviewobj.questionList,false);
    });
    //check goback link
    it("check goback link works without issues", () => {
        subcomponent.instance().handleBackLink();
    });
    //check delete questnnaire
    it("delete questionnaire works without issues", () => {
        subcomponent.instance().handleDeleteQuestionear();
    });
});

//question sidebar loading and add question
describe("question sidebar loading and add new question without errors", () => {
    //trigger new question
    it("trigger new question link without issues", () => {
        wrapper.find("button.search-link").simulate('click');
        expect(wrapper.find(".questionear-summary-content input#questnametxt").length).toBe(1);
    });
    //validate next question
    it("validate next question next question allowed works without issues", () => {
        var returnvalue = subcomponent.instance().validateNextQuestions(true,0,testviewobj.questionList);
        expect(returnvalue.isallow).toBeTruthy();
    });
    it("validate next question next question not allowed works without issues", () => {
        var returnvalue = subcomponent.instance().validateNextQuestions(true,3,testviewobj.questionList);
        expect(returnvalue.isallow).toBeFalsy();
    });
    it("validate next question goto question allowed works without issues", () => {
        var returnvalue = subcomponent.instance().validateNextQuestions(false,2,testviewobj.questionList,{ questionNo: 1 });
        expect(returnvalue.isallow).toBeTruthy();
    });
    it("validate next question goto question not allowed works without issues", () => {
        var returnvalue = subcomponent.instance().validateNextQuestions(false,1,testviewobj.questionList,{ questionNo: 2 });
        expect(returnvalue.isallow).toBeFalsy();
    });
    /* it("selected question details updating without issues", () => {
        subcomponent.find(".questionear-summary-content input#questnametxt").simulate('change', { target: { value: 'question 1' } });
        wrapper.update();

        expect(subcomponent.state().selectedQuestion.question).toBe("question 1");
    }); */
    it("delete question works without issues", () => {
        jest.spyOn(subcomponent.instance(),"continueDeleteProcess");
        subcomponent.instance().handleDeleteQuestion(null,2);
        
        //expect(subcomponent.instance().continueDeleteProcess).toBeCalled();
    });
    it("continue delete question works without issues", () => {
        jest.spyOn(subcomponent.instance(),"handleSaveQuest");
        subcomponent.instance().continueDeleteProcess(0);
        
        //expect(subcomponent.instance().handleSaveQuest).toBeCalled();
    });
    //save new question
    it("save new question without issues", () => {
        let cquestion = testviewobj.questionList[0];
        cquestion["questionId"] = -1;
        cquestion["isNewQuestionnaire"] = true;
        cquestion["questionnaireId"] = -1;

        submitSets.mockResolvedValueOnce(Promise.resolve({ status: true, extra: { questionnaireId: 2 } }));
        subcomponent.instance().handleUpdateQuestion(cquestion);
        //loading questinear details again
        submitSets.mockResolvedValueOnce(Promise.resolve({ status: true, extra: testviewobj }));
    });

    it("rowblock questionnaire clear new question works without issues", () => {
        let cselobj = {"checkList": [],"optionList": [],"mediaList": [{"feedbackTypeId": 1,"mediaTypeId": 1},{"feedbackTypeId": 1,"mediaTypeId": 2},{"feedbackTypeId": 1,"mediaTypeId": 3},{"feedbackTypeId": 1,"mediaTypeId": 4}],"radioOptionList": [],"questionId": -1,"question": "Test question 1","questionNo": 1,"questionnaireId": 1,"mustUseCamera": false,"feedbackTypeId": 1,"completeActionType": "None"};
        subcomponent.setState({ selectedQuestion: cselobj }, () => {
            subcomponent.instance().handleRowClick(null,null,true,null);
            wrapper.update();

            //expect(subcomponent.state().selectedQuestion).toBe(null);
            expect(subcomponent.state().selectedQuestIndex).toBe(0);
        });
    });

    it("rowblock questionnaire clear existing question works without issues", () => {
        let cselobj = {"checkList": [],"optionList": [],"mediaList": [{"feedbackTypeId": 1,"mediaTypeId": 1},{"feedbackTypeId": 1,"mediaTypeId": 2},{"feedbackTypeId": 1,"mediaTypeId": 3},{"feedbackTypeId": 1,"mediaTypeId": 4}],"radioOptionList": [],"questionId": 1,"question": "Test question 1","questionNo": 1,"questionnaireId": 1,"mustUseCamera": false,"feedbackTypeId": 1,"completeActionType": "None"};
        subcomponent.setState({ selectedQuestion: cselobj }, () => {
            subcomponent.instance().handleRowClick(null,null,true,null);
            wrapper.update();

            //expect(subcomponent.state().selectedQuestion).toBe(null);
            expect(subcomponent.state().selectedQuestIndex).toBe(0);
        });
    });

    it("rowblock questionnaire change without changes question works without issues", () => {
        let cselobj = {"checkList": [],"optionList": [],"mediaList": [{"feedbackTypeId": 1,"mediaTypeId": 1},{"feedbackTypeId": 1,"mediaTypeId": 2},{"feedbackTypeId": 1,"mediaTypeId": 3},{"feedbackTypeId": 1,"mediaTypeId": 4}],"radioOptionList": [],"questionId": 1,"question": "Test question 1","questionNo": 1,"questionnaireId": 1,"mustUseCamera": false,"feedbackTypeId": 1,"completeActionType": "None"};
        subcomponent.setState({ selectedQuestion: cselobj }, () => {
            subcomponent.instance().handleRowClick(cselobj,1,false,null);
            
            //expect(subcomponent.state().selectedQuestIndex).toBe(0);
        });
    });

    it("add new question with selected question without issues", () => {
        jest.spyOn(alertService, "error");

        subcomponent.instance().handleNewQueastion();
        expect(alertService.error).toBeCalled();
    });

    it("add new question with position changes without issues", () => {
        jest.spyOn(alertService, "error");
        subcomponent.setState({ selectedQuestion: null, isPositionChanged: true }, () => {
            subcomponent.instance().handleNewQueastion();
            expect(alertService.error).toBeCalled();
        });
    });

    it("add new question without issues", () => {
        jest.spyOn(subcomponent.instance(), "handleRecheckDetails");
        subcomponent.setState({ selectedQuestion: null, isPositionChanged: false }, () => {
            subcomponent.instance().handleNewQueastion();
            
            //expect(subcomponent.instance().handleRecheckDetails).toBeCalled();
        });
    });

    it("check handle change questionnaire details without issues", () => {
        subcomponent.instance().handleQuestChange("questionnaireName","Quest 3");
        subcomponent.update();

        expect(subcomponent.state().saveObj.questionnaireName).toBe("Quest 3");
    });
});

describe("questionnaire publish without errors", () => {
    /* it("publish check unpublish without issues", () => {
        jest.spyOn(subcomponent.instance(), "handleActiveQuest");

        subcomponent.instance().handleActiveQuest(true);
        expect(subcomponent.instance().handleActiveQuest).toBeCalledWith(true);
    }); */

    it("publish check publish without issues", () => {
        jest.spyOn(subcomponent.instance(), "handleActiveQuest");
        jest.spyOn(alertService, 'error');

        subcomponent.instance().handleActiveQuest(false);
        expect(subcomponent.instance().handleActiveQuest).toBeCalledWith(false);
        expect(alertService.error).toBeCalledWith("Skipped questions available, Link them before publish");
    });
});

//check component snapshot without errors
/* it("questionear details snapshot renders without crashing", () => {
    expect(wrapper).toMatchSnapshot();
}); */
