import React from 'react'
import { Link, withRouter } from 'react-router-dom';
import { Col, Breadcrumb, Button, Form, Row } from 'react-bootstrap'
import { connect } from 'react-redux';
import { PlusIcon, SearchIcon, ArrowLeftIcon, XIcon } from '@primer/octicons-react'; //ListUnorderedIcon, 
import { confirmAlert } from 'react-confirm-alert';

import { submitSets } from '../../components/UiComponents/SubmitSets';
import { submitCollection } from '../../_services/submit.service';
import { alertService } from '../../_services/alert.service';
import { FEEDBACK_PHOTO, FEEDBACK_VIDEO, QUEST_STATUS } from '../../enums/taskfeedEnums'; //FEEDBACK_QR, 
import { AcViewModal } from '../UiComponents/AcImports';

import { withTranslation } from 'react-i18next';

import { viewQuestionSetAction } from '../../actions/questionear/quest_action';

import './questionear.css';

import QuestionTable from './listtable/questiontable';
import QuestionEdit from './questionedit/questionedit';
import {preventinputToString } from '../../_services/common.service';

/**
 * questionear details view 
 *
 * @class QuestionDetails
 * @extends {React.Component}
 */
var filterTimeout;
export class QuestionDetails extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.state = {
            mediaFeedbackTypes: [
                { ...FEEDBACK_PHOTO, selected: false, icon: "image", vname: this.props.t('PICTURE'), isNew: false, isDelete: false, requestedFeedbackId: -1 },
                { ...FEEDBACK_VIDEO, selected: false, icon: "video", vname: this.props.t('VIDEO'), isNew: true, isDelete: false, requestedFeedbackId: -1 },
                // { ...FEEDBACK_QR, selected: false, icon: "grid", vname: "QR", isNew: false, isDelete: false, requestedFeedbackId: -1 },
            ],
            saveObj: this.defaultSaveObj(), isEdit: false, questStatus: QUEST_STATUS.Draft, isShowUpdateBtn: false,
            selectedQuestion: null, selectedQuestIndex: 0, isQuestionOpened: false, isPositionChanged: false, isDataLoading: false,
            nextQuestionList: [], filtertxt: "", viewloadingmodal: false, isChangesAvailable: false, isDisableBtns: false,errors:{},
        }

    }

    componentDidMount() {
        this._isMounted = true;

        if(this._isMounted){
            //console.log(this.props.questionState.questDetails);
            this.setState({
                isEdit: (this.props.questionState && this.props.questionState.questDetails?true:false),
                saveObj: (this.props.questionState && this.props.questionState.questDetails?this.props.questionState.questDetails:this.defaultSaveObj()),
                questStatus: (this.props.questionState && this.props.questionState.questDetails && this.props.questionState.questDetails.questionnaireStatus?this.props.questionState.questDetails.questionnaireStatus:QUEST_STATUS.Draft),
            });
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultSaveObj = () => {
        return { questionnaireId: -1, questionnaireName: "", questionnaireStatus: QUEST_STATUS.Draft, versionNo: "1.0", questionList: [], haveTasks: false, isDelete: false, isNew: true };
    }
    defaultQuestionObj = () => {
        return { questionId: -1, questionNo: 0, questionnaireId: -1, questionnaireName: "", questionnaireStatus: QUEST_STATUS.Draft, question: "", feedbackTypeId: 1, completeActionType: "None", mediaList: [], optionList: [], checkList: [], radioOptionList: [], mustUseCamera: false,isDelete: false, isNew: true, isNewQuestionnaire: !this.state.isEdit };
    }
    //table row click
    handleRowClick = (cobj, cidx, isclearview, issaved) => {
        if(!isclearview){
            if(this.state.isChangesAvailable){
                confirmAlert({
                    title: this.props.t("changingquestview"),
                    message: this.props.t("areyousuretochangequestion"),
                    overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
                    buttons: [{
                        label: this.props.t('btnnames.yes'),
                        onClick: () => {
                            this.continueRowClick(cobj, cidx);
                        }
                    }, {
                        label: this.props.t('btnnames.no')
                    }]
                });
            } else{
                this.continueRowClick(cobj, cidx);
            }
        } else{
            if(this.state.selectedQuestion.questionId > 0 || issaved){
                this.setState({ selectedQuestion: null, selectedQuestIndex: 0, isQuestionOpened: false, isChangesAvailable: false });
            } else{
                //alertService.error("Save new question details first");
                var csaveobj = this.state.saveObj;
                csaveobj.questionList.splice(-1);
                this.setState({ saveObj: csaveobj, selectedQuestion: null, selectedQuestIndex: 0, isQuestionOpened: false, isDataLoading: true, isChangesAvailable: false }, () => {
                    setTimeout(() => {
                        this.setState({ isDataLoading: false });
                    }, 100);
                });
            }
        }
    }
    //continue row click
    continueRowClick = (cobj, cidx) => {
        if(!this.state.isPositionChanged){
            if(!this.state.selectedQuestion || !this.state.selectedQuestion.isNew){
                this.setState({ selectedQuestion: null }, () => {
                    this.setState({ selectedQuestion: cobj, selectedQuestIndex: cidx, isQuestionOpened: true, isChangesAvailable: false }, () => {
                        this.handleRecheckDetails();
                    });    
                });
            } else{
                alertService.error(this.props.t("saveorclosenewquest"));
            }
        } else{
            alertService.error(this.props.t("savenewquestarrange"));
        }
    }
    //handle delete questionear
    handleDeleteQuestion = (cobj,cidx) => {
        const csaveobj = this.state.saveObj;
        const cquestion = csaveobj.questionList[cidx];
        
        //check is links avaiable
        var islinksavailable = false;
        if(cquestion.feedbackTypeId === 8){
            for (let j = 0; j < cquestion.optionList.length; j++) {
                const optionitem = cquestion.optionList[j];
                
                if(optionitem.actionType === "GoTo" && optionitem.actionQuestionId > 0){
                    islinksavailable = true;
                }
            }
        }

        var extramsg = "";
        console.log(islinksavailable);
        if(islinksavailable){
            extramsg = (this.props.t("otherquestionsavail")+", ");
        } 
        
        confirmAlert({
            title: this.props.t("deleteaquestion"),
            message: (extramsg+this.props.t("areyousuretodeletequestion")),
            overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.continueDeleteProcess(cidx);
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }
    //continue delete process
    continueDeleteProcess = (cidx) => {
        const csaveobj = this.state.saveObj;
        const cquestion = csaveobj.questionList[cidx];

        var isdeleteitem = false;
        if(cquestion.questionId > 0){
            cquestion["isDelete"] = true;
            isdeleteitem = true;
        } else{
            csaveobj.questionList.splice(cidx,1);
        }

        var newquestno = 1;
        for (let i = 0; i < csaveobj.questionList.length; i++) {
            const questitem = csaveobj.questionList[i];
            
            if(!questitem.isDelete){
                questitem["questionNo"] = newquestno;
                newquestno = (newquestno + 1);

                //check goto links if branch 
                if(cquestion.questionId > 0 && questitem.feedbackTypeId === 8){
                    for (let l = 0; l < questitem.optionList.length; l++) {
                        const optionitem = questitem.optionList[l];
                        if(optionitem.actionType === "GoTo"){
                            if(optionitem.actionQuestionId === cquestion.questionId){
                                optionitem["actionType"] = "None";
                                optionitem["actionQuestionId"] = 0;
                                optionitem["actionQuestionName"] = "";
                                optionitem["actionQuestionNo"] = 0;
                            }
                        }
                    }
                }
            }
        }

        this.setState({ saveObj: csaveobj, isPositionChanged: (!this.state.isPositionChanged?isdeleteitem:this.state.isPositionChanged) }, () => {
            this.handleSaveQuest();
        });
    }
    //new question add to saveobj
    handleNewQueastion = () => {
        if(this.state.selectedQuestion){
            alertService.error(this.props.t("saveorclosequestion"));
        } else if(this.state.isPositionChanged){
            alertService.error(this.props.t("savenewquestarrange"));
        } else{
            var csaveobj = this.state.saveObj;
            var nquestionobj = this.defaultQuestionObj();
            nquestionobj.questionNo = (csaveobj.questionList.length + 1);
            nquestionobj.questionnaireId = (this.state.isEdit?csaveobj.questionnaireId:-1);
            csaveobj.questionList.push(nquestionobj);
            
            this.setState({ saveObj: csaveobj, selectedQuestion: nquestionobj, selectedQuestIndex: (csaveobj.questionList.length - 1), isQuestionOpened: true, isChangesAvailable: false }, () => {
                this.handleRecheckDetails();
                this.filterQuestionList("",true);
                setTimeout(() => {
                    //scroll to bottom of table
                    var ctablediv = document.getElementById("editviewquesttable");
                    if(ctablediv){
                        ctablediv.scrollTop = ctablediv.scrollHeight;
                    }
                }, 800);
            }); 
        }
    }
    //update question in saveobj
    handleUpdateQuestionInSave = (cobj) => {
        this.setState({ selectedQuestion: cobj, isChangesAvailable: true }, () => {
            this.handleRecheckDetails();
        });
    }
    //recheck added media
    handleRecheckDetails = () => {
        var csaveobj = this.state.saveObj;
        var cmedialist = this.state.mediaFeedbackTypes;
        //loop to get next question list
        var cnextlist = []; var isallowpush = false;
        for (let j = 0; j < csaveobj.questionList.length; j++) {
            if(isallowpush){
                cnextlist.push(csaveobj.questionList[j]);
            }

            if(j === this.state.selectedQuestIndex){
                isallowpush = true;
            }
        }
        
        for (let i = 0; i < cmedialist.length; i++) {
            var isalreadyadded = (this.state.selectedQuestion?this.state.selectedQuestion.mediaList.findIndex(x => (!x.isDelete && x.feedbackTypeId === cmedialist[i].id)):-1);
            if(isalreadyadded > -1){
                cmedialist[i].isselected = true;
            } else{
                cmedialist[i].isselected = false;
            }
        }
        //console.log(cmedialist);
        this.setState({ mediaFeedbackTypes: cmedialist, nextQuestionList: cnextlist});
    }
    //go back link
    handleBackLink = () => {
        this.props.history.push("/questionlist");
    }
    //handle change questionear object
    handleQuestChange = (ckey, cval,e,msg) => {
        if(ckey === "questionnaireName"){
            if(!preventinputToString(e,e.target.value,msg)){
                e.preventDefault()
                return
            }
        }
        var csaveobj = this.state.saveObj;
        csaveobj[ckey] = cval;

        this.setState({ saveObj: csaveobj, isShowUpdateBtn: true });
    }
    //handle dave questionear
    handleSaveQuest = () => {
        var csaveobj = JSON.parse(JSON.stringify(this.state.saveObj));
        //validations
        if(csaveobj.questionnaireName === ""){
            alertService.error(this.props.t("questinearnamereq"));
            return false;
        } else{
            csaveobj.questionnaireName = csaveobj.questionnaireName.trim();
        }
        if(csaveobj.questionList.length === 0){
            alertService.error(this.props.t("addatleastonequest"));
            return false;
        }

        this.setState({ isDisableBtns: true }, () => {
            submitSets(submitCollection.updateSpecificQuestionnaire, csaveobj, false, null, true).then(res => {
                //console.log(res);
                this.setState({ isDisableBtns: false });
                if (res && res.status) {
                    alertService.success(this.props.t("successquestsaved"));
                    this.setState({ selectedQuestion: null, selectedQuestIndex: 0, isPositionChanged: false, isQuestionOpened: false, isShowUpdateBtn: false, isChangesAvailable: false });

                    this.getQuestDetails(csaveobj.questionnaireId);
                    this.handleRecheckDetails();
                } else {
                    // alertService.error(res && res.extra && res.extra !== ""?res.extra:this.props.t("erroroccurred"));
                }
            });    
        });
    }
    //handle active questionear
    handleActiveQuest = (isunpublish) => {
        var csaveobj = this.state.saveObj;
        
        if(!isunpublish){
            //loop and find questions have branch feedbacktype and all of that branch items setted correctly
            var isnoneavailable = false; var isnolist = false; var isnodonelast = false; var isnocomplete = false; var donecount = 0;
            var isbranchavaiable = false; var gotonotavaiableitems = []; var usedquestionstrack = [];
            for (let i = 0; i < csaveobj.questionList.length; i++) {
                const questitem = csaveobj.questionList[i];
                //check lists
                if(questitem.feedbackTypeId === 3 || questitem.feedbackTypeId === 4 || questitem.feedbackTypeId === 8){
                    if(questitem.feedbackTypeId === 8){
                        isbranchavaiable = true;
                        if(questitem.optionList && questitem.optionList.length > 0){
                            for (let j = 0; j < questitem.optionList.length; j++) {
                                const optionitem = questitem.optionList[j];
                                
                                if(!optionitem.actionType || optionitem.actionType === "None"){
                                    isnoneavailable = true;
                                }
                                //check goto/next links
                                if(optionitem.actionType === "Next" || optionitem.actionType === "GoTo"){
                                    var isnextquest = (optionitem.actionType === "Next"?true:false);
                                    var branchnotlinknotavailble = this.validateNextQuestions(isnextquest,(isnextquest?i:optionitem.actionQuestionNo),csaveobj.questionList,questitem);
                                    
                                    if(!branchnotlinknotavailble.isallow){
                                        gotonotavaiableitems.push(optionitem);
                                    } else{
                                        usedquestionstrack.push(branchnotlinknotavailble.questionid);
                                    }
                                }
                                
                                //last branch item
                                if((i + 1) === csaveobj.questionList.length){
                                    if((j + 1) === questitem.optionList.length){
                                        if(optionitem.actionType !== "Done"){
                                            isnodonelast = true;
                                        }
                                    }
                                }
                            }
                        } else{
                            isnolist = true;
                        }
                    } else{
                        //check complete question action
                        if(!questitem.completeActionType || questitem.completeActionType === "None"){
                            isnocomplete = true;
                        }
                        //check done action count
                        if(questitem.completeActionType === "Done"){
                            donecount = donecount + 1;
                        }
                        //check next links
                        if(questitem.completeActionType === "Next" || questitem.completeActionType === "GoTo"){
                            var iscompletenextquest = (questitem.completeActionType === "Next"?true:false);
                            var isnotlinknotavailble = this.validateNextQuestions(iscompletenextquest,(iscompletenextquest?i:questitem.actionQuestionNo),csaveobj.questionList,questitem);

                            if(!isnotlinknotavailble.isallow){
                                gotonotavaiableitems.push(questitem);
                            } else{
                                usedquestionstrack.push(isnotlinknotavailble.questionid);
                            }
                        }

                        if(questitem.feedbackTypeId === 3){
                            if(!questitem.checkList || questitem.checkList.length === 0){
                                isnolist = true;
                            }
                        } else if(questitem.feedbackTypeId === 4){
                            if(!questitem.radioOptionList || questitem.radioOptionList.length === 0){
                                isnolist = true;
                            }
                        }

                        //check last item
                        if((i + 1) === csaveobj.questionList.length){
                            if(questitem.completeActionType !== "Done"){
                                isnodonelast = true;
                            }
                        }
                    } 
                } else{
                    //check done action count
                    if(questitem.completeActionType === "Done"){
                        donecount = donecount + 1;
                    }
                    //check complete question action
                    if(!questitem.completeActionType || questitem.completeActionType === "None"){
                        isnocomplete = true;
                    }
                    //check next links
                    if(questitem.completeActionType === "Next" || questitem.completeActionType === "GoTo"){
                        var isothercompletenextquest = (questitem.completeActionType === "Next"?true:false);
                        var othernotlinknotavailble = this.validateNextQuestions(isothercompletenextquest,(isothercompletenextquest?i:questitem.actionQuestionNo),csaveobj.questionList,questitem);
                        
                        if(!othernotlinknotavailble.isallow){
                            gotonotavaiableitems.push(questitem);
                        } else{
                            usedquestionstrack.push(othernotlinknotavailble.questionid);
                        }
                    }
                    //check last item
                    if((i + 1) === csaveobj.questionList.length){
                        if(questitem.completeActionType !== "Done"){
                            isnodonelast = true;
                        }
                    }
                }
            }
            //console.log(usedquestionstrack);
            var notusingquestionsavailable = false;
            for (let l = 0; l < csaveobj.questionList.length; l++) {
                const cnquestion = csaveobj.questionList[l];
                //check its not first question
                if(l > 0){
                    var isfoundinlist = usedquestionstrack.findIndex(z => z === cnquestion.questionId);
                    
                    if(isfoundinlist === -1){
                        notusingquestionsavailable = true;
                    }
                }
            }
            
            if(notusingquestionsavailable){
                alertService.error(this.props.t("skippedquestavlble"));
                return false;
            }

            if(gotonotavaiableitems.length > 0){
                alertService.error(this.props.t("somequestionextgotolinks"));
                return false;
            }

            if(isnocomplete){
                alertService.error(this.props.t("somequestcompletenotadded"));
                return false;
            }

            if(!isbranchavaiable && donecount > 1){
                alertService.error(this.props.t("doneavailmorethanone"));
                return false;
            }

            if(isnolist){
                alertService.error(this.props.t("somequestlistnotavail"));
                return false;
            }

            if(isnoneavailable){
                alertService.error(this.props.t("somebranchitemsactype"));
                return false;
            }

            if(!isbranchavaiable && isnodonelast){
                alertService.error(this.props.t("lastquestnotavaildone"));
                return false;
            }
        }
        

        //console.log("yap");
        confirmAlert({
            title: (isunpublish?this.props.t("unpublishaquestinear"):this.props.t("publishaquestinear")),
            message: (isunpublish?this.props.t("areyousuretounpublish"):this.props.t("areyousuretopublish")),
            overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    var urlobj = (isunpublish?submitCollection.unpublishSpecificQuestionnaire:submitCollection.publishSpecificQuestionnaire);
                    this.setState({ isDisableBtns: true }, () => {
                        submitSets(urlobj, { questionnaireId: this.state.saveObj.questionnaireId }, false, null, true).then(res => {
                            //console.log(res);
                            this.setState({ isDisableBtns: false });
                            if (res && res.status) {
                                alertService.success(isunpublish?this.props.t("successquestunpublished"):this.props.t("successquestpublished"));
                                this.handleBackLink();    
                            } else {
                                // alertService.error(res && res.extra && res.extra !== ""?res.extra:this.props.t("erroroccurred"));
                            }
                        });    
                    });
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }
    //validate next links
    validateNextQuestions = (isnextquest,linkquest,checklist,cquestion) => {
        var retrnvalue = {isallow: true, questionid: 0};

        if(isnextquest){
            retrnvalue.isallow = (checklist[(linkquest+1)]?true:false);
            retrnvalue.questionid = (checklist[(linkquest+1)]?checklist[(linkquest+1)].questionId:0);
        } else{
            var findquestionidx = checklist.findIndex(x => (cquestion.questionNo < x.questionNo && x.questionNo === linkquest));
            
            if(findquestionidx === -1){
                retrnvalue.isallow = false;
            } else{
                retrnvalue.questionid = checklist[findquestionidx].questionId;
            }
        }

        return retrnvalue;
    }
    //handle save/update question
    handleUpdateQuestion = (cquestobj) => {
        if(cquestobj.isNewQuestionnaire){
            var csaveobj = this.state.saveObj;

            cquestobj["questionnaireName"] = csaveobj.questionnaireName;
            //validations
            if(cquestobj.questionnaireName === ""){
                alertService.error(this.props.t("questinearnamereq"));
                return false;
            }    
        }
        //console.log(cquestobj);
        this.setState({ isDisableBtns: true }, () => {
            submitSets(submitCollection.updateQuestion, cquestobj, false, null, true).then(res => {
                //console.log(res);
                this.setState({ isDisableBtns: false });
                if (res && res.status) {
                    alertService.success(this.props.t("successquestionsaved"));
                    this.setState({ selectedQuestion: null, selectedQuestIndex: 0, isPositionChanged: false, isQuestionOpened: false, isShowUpdateBtn: false, isChangesAvailable: false }, () => {
                        if(res.extra && res.extra.questionnaireId > 0){
                            this.getQuestDetails(res.extra.questionnaireId);
                            this.handleRecheckDetails();
                        }
                        //this.handleBackLink();    
                    });
                } else {
                    // alertService.error(res && res.extra && res.extra !== ""?res.extra:this.props.t("erroroccurred"));
                }
            });    
        });
    }
    //load questionear details
    getQuestDetails = (cquestid) => {
        this.setState({ viewloadingmodal: true }, () => {
            submitSets(submitCollection.getSpecificQuestionnaire, { questionnaireId: cquestid }, false).then(res => {
                //console.log(res);
                if (res && res.status && res.extra) {
                    this.setState({ saveObj: res.extra, questStatus: res.extra.questionnaireStatus, isEdit: true, viewloadingmodal: false }, () => {
                        this.props.setQuestionDetailsView(res.extra);
                        this.filterQuestionList("",true);
                    });
                } else {
                    this.setState({ viewloadingmodal: false });
                }
            });    
        });
        
    }
    //handle delete questionear
    handleDeleteQuestionear = () => {
        confirmAlert({
            title: this.props.t("deleteaquestionear"),
            message: this.props.t("areyousuretodeletethisquestionear"),
            overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.setState({ isDisableBtns: true }, () => {
                        submitSets(submitCollection.deleteSpecificQuestionnaire, { questionnaireId: this.state.saveObj.questionnaireId }, false, null, true).then(res => {
                            //console.log(res);
                            this.setState({ isDisableBtns: false });
                            if (res && res.status) {
                                alertService.success(this.props.t("succesfullyquestioneardeleted"));
                                this.handleBackLink();    
                            } else {
                                // alertService.error(res && res.extra && res.extra !== ""?res.extra:this.props.t("erroroccurred"));
                            }
                        });    
                    });
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }
    //handle change position of questions
    handleChangePostions = (citems, ispositionchanged) => {
        var csaveobj = this.state.saveObj;
        csaveobj.questionList = citems;

        this.setState({ saveObj: csaveobj, isPositionChanged: (!this.state.isPositionChanged?ispositionchanged:this.state.isPositionChanged), isShowUpdateBtn: (!this.state.isShowUpdateBtn?ispositionchanged:this.state.isShowUpdateBtn) });
    }
    //filter questions list
    filterQuestionList = (ctxt,isclear,e,msg) => {
        if(e){
            if(!preventinputToString(e,e.target.value,msg)){
                e.preventDefault();
                return
            }
        }
      
        this.setState({ filtertxt: ctxt }, () => {
            if(filterTimeout){
                clearTimeout(filterTimeout);
            }
            var delaytime = ((this.props.istesting || isclear)?0:500);
            filterTimeout = setTimeout(() => {
                const csaveobj = this.state.saveObj;
                for (let i = 0; i < csaveobj.questionList.length; i++) {
                    const questitem = csaveobj.questionList[i];
                    questitem["isnotshow"] = true;
                    if(questitem.question.toLowerCase().includes(ctxt.toLowerCase())){
                        questitem["isnotshow"] = false;
                    }
                }
                
                this.setState({ saveObj: csaveobj, isDataLoading: true }, () => {
                    setTimeout(() => {
                        this.setState({ isDataLoading: false });
                    }, 100);
                });
            }, delaytime);
        });  
    }

    validateField = (key,value) =>{
        let errorObj = this.state.errors
        let msg = ""
        if(value === "" || value.length === 0){
           msg = (this.props.t('fieldisrequired'))
        }
        errorObj[key] = msg; 
        this.setState({
            error:errorObj
        })
    }

    render() {

        return (
            <Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <div>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                        <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                        <li className="breadcrumb-item"><Link to="/questionlist" role="button">{this.props.t('questionnaire')}</Link></li>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        </>:<>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        <li className="breadcrumb-item"><Link to="/questionlist" role="button">{this.props.t('questionnaire')}</Link></li>
                        <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                        </>}
                    </Breadcrumb>
                    <div>
                        <Col className="questionear-container">
                            <Col className="custom-filters form-inline">
                                <span className="status-link">{this.props.t("status")}: <label className={"badge "+(this.state.questStatus===QUEST_STATUS.Published?"bg-success":this.state.questStatus===QUEST_STATUS.Replaced?"bg-danger":"bg-warning")}>{this.props.t(this.state.questStatus.toLowerCase())}</label></span>
                                <Col className="form-inline" style={{position:"absolute"}}>
                                    {/* {this.state.isEdit?<h3><Button variant="default" className="back-link" size="sm" onClick={this.handleBackLink}><ArrowLeftIcon size={26} /></Button> {this.state.saveObj.questionnaireName}</h3>:<></>} */}
                                    <h3><Button variant="default" className="back-link" size="sm" onClick={this.handleBackLink}><ArrowLeftIcon size={26} /></Button>
                                    <input type="text"className="form-control" value={this.state.saveObj.questionnaireName} onChange={e => this.handleQuestChange("questionnaireName", e.target.value,e,this.props.t('Character.questionnaire_name')) } placeholder={this.props.t('TYPEQUESTNAIRENAME')} style={{width:"350px"}} onKeyDown={(e)=>preventinputToString(e,e.target.value,(this.props.t('Character.questionnaire_name')))} onBlur={(e)=> this.validateField("questionnaireName",e.target.value)} /></h3>
                                    <div className="errorMsg">{this.state.errors.questionnaireName}</div>  
                                </Col>

                                {this.state.questStatus && this.state.questStatus !== QUEST_STATUS.Replaced?<Button type="button" variant="warning" onClick={this.handleNewQueastion} className="search-link filter-btn"><PlusIcon size={14} /> {this.props.t('addnewquestion')}</Button>:<></>}
                                {/* <Button type="button" variant="outline-primary" className="filter-btn"><ListUnorderedIcon size={14} /> {this.props.t('activitylog')}</Button> */}

                                <Col xs={12} lg={8} style={{position:"relative"}}>
                                    <Col className="search-inline right-side">
                                        {this.state.filtertxt !== ""?<span className="remove-link" onClick={e => this.filterQuestionList("",true)}><XIcon size={14} /></span>:<span><SearchIcon size={14} /></span>}
                                        <Form.Control placeholder={this.props.t('FREE_SEARCH')} value={this.state.filtertxt} onChange={e => this.filterQuestionList(e.target.value,null,e,(this.props.t('Character.search_text')))} onKeyDown={(e)=>preventinputToString(e,e.target.value,(this.props.t('Character.search_text')))} />
                                    </Col>
                                </Col>
                            </Col>
                            <Col style={{marginTop:"30px"}}>
                                <Row>
                                    <Col md={(this.state.selectedQuestion?7:12)} lg={(this.state.selectedQuestion?8:12)} className={"tableview-content small "}>
                                        {!this.state.isDataLoading?<QuestionTable questStatus={this.state.questStatus} isDisableBtns={this.state.isDisableBtns} isRTL={this.props.isRTL} saveObj={this.state.saveObj} t={this.props.t} isQuestionOpened={this.state.isQuestionOpened} selectedQuestion={this.state.selectedQuestion} handleChangePostions={this.handleChangePostions} handleRowClick={this.handleRowClick} handleDeleteQuestion={this.handleDeleteQuestion} />:<></>}

                                        <Col className={"form-inline "+(this.props.isRTL==="rtl"?"text-left":"text-right")+((this.state.isQuestionOpened || this.state.isDisableBtns)?" disable-move":"")}>
                                            {this.state.questStatus && this.state.questStatus !== QUEST_STATUS.Replaced?<>
                                            {!this.state.saveObj.isNew?<Button variant="outline-danger" className="questsave-btn" onClick={this.handleDeleteQuestionear}>{this.props.t("btnnames.delete")}</Button>:<></>}
                                            {this.state.isEdit && this.state.isShowUpdateBtn?<Button variant="success" className="questsave-btn" onClick={this.handleSaveQuest}>{(this.state.isEdit?this.props.t("btnnames.update"):this.props.t("btnnames.save"))}</Button>:<></>}
                                            {!this.state.saveObj.isNew && this.state.questStatus?<>
                                            {this.state.questStatus === QUEST_STATUS.Published && !this.state.saveObj.haveTasks?<Button variant="danger" className="questsave-btn" onClick={() => this.handleActiveQuest(true)}>{this.props.t("btnnames.unpublish")}</Button>:<></>}
                                            {this.state.questStatus !== QUEST_STATUS.Published?<Button variant="primary" className="questsave-btn activate" onClick={() => this.handleActiveQuest(false)}>{this.props.t("btnnames.publish")}</Button>:<></>}
                                            </>:<></>}
                                            </>:<></>}
                                        </Col>
                                    </Col>
                                    <Col md={5} lg={4} className={"questionear-summary-content "+(this.state.selectedQuestion?"active":"")}>
                                        <Col className="sub-content">
                                            {this.state.selectedQuestion?<>
                                            <QuestionEdit questStatus={this.state.questStatus} isDisableBtns={this.state.isDisableBtns} selectedQuestion={this.state.selectedQuestion} nextQuestionList={this.state.nextQuestionList} t={this.props.t} isRTL={this.props.isRTL} mediaFeedbackTypes={this.state.mediaFeedbackTypes} handleRowClick={this.handleRowClick} handleUpdateQuestionInSave={this.handleUpdateQuestionInSave} handleUpdateQuestion={this.handleUpdateQuestion} />
                                            </>:<Col className="noselected-txt"><h4 className="text-center">{this.props.t("NOSELECTEDQUESTION")}</h4></Col>}
                                        </Col>
                                    </Col>    
                                </Row>
                            </Col>
                        </Col>
                    </div>
                </div>

                <AcViewModal showmodal={this.state.viewloadingmodal} />
            </Col>
        )
    }
}
//set redux actions
const mapDispatchToProps = dispatch => ({
    setQuestionDetailsView: (payload) => dispatch(viewQuestionSetAction(payload)),
});
export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(QuestionDetails)));
