
import React from 'react'
import { Col, Button, Form, Row, Dropdown } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { confirmAlert } from 'react-confirm-alert';

import { alertService } from '../../../_services/alert.service';
import { QUEST_STATUS } from '../../../enums/taskfeedEnums';
import { Icons } from '../../../assets/icons/icons';

import Checklist from './questoptions/checklist';
import Selectlist from './questoptions/selectlist';
import Fromlist from './questoptions/fromlist';
import { preventinputToString } from '../../../_services/common.service';

class QuestionEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            questionObj: null,
            isallowbcp: true,
            bcpquestionObj: null,
            ischangesAvailable: false,
            errors:{},
        }
    }

    componentDidMount() {
        if(this.props.selectedQuestion){ //gets current field details
            this.setState({
                questionObj: JSON.parse(JSON.stringify(this.props.selectedQuestion?this.props.selectedQuestion:null)),
                bcpquestionObj: JSON.parse(JSON.stringify(this.props.selectedQuestion?this.props.selectedQuestion:null)),
                isallowbcp: false,
            });
        }
    }

    handlechecklist = (clist,ctype) => {
        var cquestionobj = this.state.questionObj;
        if(ctype === 1){ //checklist
            cquestionobj["checkList"] = clist;
        } else if(ctype === 2){
            cquestionobj["optionList"] = clist;
        } else if(ctype === 3){
            cquestionobj["radioOptionList"] = clist;
        }

        this.setState({ questionObj: cquestionobj, ischangesAvailable: true });
        this.props.handleUpdateQuestionInSave(cquestionobj);

        //scroll to bottom of table
        var ctablediv = document.getElementById("editviewquestlist");
        if(ctablediv){
            ctablediv.scrollTop = ctablediv.scrollHeight;
        }
    }
    
    handlechangeobj = (ckey,cval,e,msg) => {
        if(ckey === "question"){
            if(!preventinputToString(e,e.target.value,msg)){
                e.preventDefault()
                return
              }
        }
        var cquestionobj = this.state.questionObj;
        cquestionobj[ckey] = cval;

        this.setState({ questionObj: cquestionobj, ischangesAvailable: true });
        this.props.handleUpdateQuestionInSave(cquestionobj);
    }
    //
    handleAddNewMedia = (cobj) => {
        var cquestionobj = this.state.questionObj;
        if(!cobj.isselected){
            cquestionobj.mediaList.push({ feedbackTypeId: cobj.id, mediaTypeId: -1, mediaName: cobj.name, isDelete: false, isNew: true });
        } else{
            var caddedidx = cquestionobj.mediaList.findIndex(x => x.feedbackTypeId === cobj.id);
            if(cquestionobj.mediaList[caddedidx].mediaTypeId > -1){
                cquestionobj.mediaList[caddedidx]["isDelete"] = true;
            } else{
                cquestionobj.mediaList.splice(caddedidx, 1);
            }
        }

        this.setState({ questionObj: cquestionobj, ischangesAvailable: true });
        this.props.handleUpdateQuestionInSave(cquestionobj);
    }
    //reset added changes
    handleResetQuestion = () => {
        confirmAlert({
            title: "Reset question changes",
            message: "Are you sure to reset recent question changes?",
            overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.setState({ questionObj: JSON.parse(JSON.stringify(this.state.bcpquestionObj)), ischangesAvailable: false });
                    this.props.handleUpdateQuestionInSave(JSON.parse(JSON.stringify(this.state.bcpquestionObj)));
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }
    //handle save question
    handleSaveQuestion = () => {

        if(!this.state.ischangesAvailable){
            alertService.warn(this.props.t("NO_CHANGES_AVAILABLE"));
            return false;
        }

        var questionObj = this.state.questionObj;
        //validate save object
        if(questionObj.question === ""){
            alertService.error(this.props.t("questionnamereq"));
            return false;
        } else{
            questionObj.question = questionObj.question.trim();
        }
        //validate checklist
        for (let j = 0; j < questionObj.checkList.length; j++) {
            if(questionObj.feedbackTypeId === 3){
                if(!questionObj.checkList[j].isDelete && questionObj.checkList[j].checkItemName === ""){
                    alertService.error(this.props.t("questcheckoption")+" "+(j+1)+" "+this.props.t("namerequired"));
                    return false;
                }
            } else{
                questionObj.checkList[j]["isNew"] = false;
                questionObj.checkList[j]["isDelete"] = true;
            }
        }
        //validate selectlist
        for (let i = 0; i < questionObj.radioOptionList.length; i++) {
            if(questionObj.feedbackTypeId === 4){
                if(!questionObj.radioOptionList[i].isDelete && questionObj.radioOptionList[i].optionItemName === ""){
                    alertService.error(this.props.t("questselectitem")+" "+(i+1)+" "+this.props.t("namerequired"));
                    return false;
                }
            } else{
                questionObj.radioOptionList[i]["isNew"] = false;
                questionObj.radioOptionList[i]["isDelete"] = true;
            }
        }
        
        //validate branchlist
        for (let i = 0; i < questionObj.optionList.length; i++) {
            if(questionObj.feedbackTypeId === 8){
                if(!questionObj.optionList[i].isDelete && questionObj.optionList[i].optionName === ""){
                    alertService.error(this.props.t("questbranchitem")+" "+(i+1)+" "+this.props.t("namerequired"));
                    return false;
                }
                if(!questionObj.optionList[i].isDelete && questionObj.optionList[i].actionType === "GoTo" && (!questionObj.optionList[i].actionQuestionId || questionObj.optionList[i].actionQuestionId <= 0)){
                    alertService.error(this.props.t("questbranchitem")+" "+(i+1)+" "+this.props.t("gotoquestion"));
                    return false;
                }
            } else{
                questionObj.optionList[i]["isNew"] = false;
                questionObj.optionList[i]["isDelete"] = true;
            }
        }
        //console.log(questionObj);
        this.props.handleUpdateQuestion(questionObj);
    }

    //handle change complete action goto option
    handleChangeGoto = (ctype,cval) => {
        var cquestobj = JSON.parse(JSON.stringify(this.state.questionObj));
        if(ctype === "actionQuestionId"){
            cquestobj["completeActionType"] = "GoTo";
            cquestobj["actionQuestionId"] = cval.questionId;
            cquestobj["actionQuestionName"] = cval.question;
            cquestobj["actionQuestionNo"] = cval.questionNo;
        } else {
            cquestobj["completeActionType"] = cval;
            cquestobj["actionQuestionId"] = 0;
            cquestobj["actionQuestionName"] = "";
            cquestobj["actionQuestionNo"] = 0;
        }
        
        this.setState({ questionObj: cquestobj, ischangesAvailable: true }, () => {
            if(document.getElementById("completeActionToggleBtn")){
                document.getElementById("completeActionToggleBtn").click();
            }
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
        const cmedialist = this.props.mediaFeedbackTypes && this.props.mediaFeedbackTypes.map((media, i) => {
            return <Button key={i} className={media.isselected?"active":""} onClick={() => this.handleAddNewMedia(media)} ><Col>
            {media.icon==="grid"?Icons.QR(media.selected?"white":" #5128a0"): <FeatherIcon icon={media.icon} style={{strokeWidth:"1.5px"}} />}</Col>
            <Col>{media.vname}</Col></Button>
        })

        return (this.state.questionObj?<Col>
            <h3>{this.props.t("QUESTION")}: {this.state.questionObj?this.state.questionObj.questionNo:""}</h3>
            <Col className="questionlist-content">
                <ul id="editviewquestlist" className={"editviewquest-list "+(!this.props.questStatus || this.props.questStatus === QUEST_STATUS.Replaced?"disable-pointer":"")}>
                    <li>
                        <Form.Control type="text" id="questnametxt" value={this.state.questionObj?this.state.questionObj.question:""} onChange={e => this.handlechangeobj("question", e.target.value,e,this.props.t('Character.question_name'))} placeholder={this.props.t('TYPEQUESTIONNAME')} onKeyDown={(e)=>preventinputToString(e,e.target.value,(this.props.t('Character.question_name')))}  onBlur={(e)=>this.validateField("questname",e.target.value)}/>
                        <div className="errorMsg" style={{paddingTop:"8px"}}>{this.state.errors.questname}</div>  
                    </li>
                    <li>
                        <h4>{this.props.t("SELECT_FEEDBACK_MEDIA_OPTIONAL")}</h4>
                        <Col className="feedbackmedia" style={{ opacity: this.props.isedit && "0.4" }}>
                            {cmedialist}
                        </Col>
                    </li>
                    <li style={{paddingTop:"0px",paddingBottom:"0px"}}>
                    <div className="whentask timefram usecam">
                        <label className="pure-material-switch" style={{ width: "100%" }}>
                            <input type="checkbox" checked={(this.state.questionObj && this.state.questionObj.mustUseCamera)} onChange={e => this.handlechangeobj("mustUseCamera", (this.state.questionObj?!this.state.questionObj.mustUseCamera:false))} />
                            <span> {this.props.t('MUST_USE_CAM')} </span>
                        </label>
                    </div>
                    </li>
                    <li>
                        <h4>{this.props.t("SELECT_FEEDBACK_TYPE")}</h4>
                        <Row>
                            <Col md={6}><label className="whentask">
                                <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name="FBTypeRadios" value="number" checked={(this.state.questionObj && this.state.questionObj.feedbackTypeId===2)} onChange={e => this.handlechangeobj("feedbackTypeId", 2)} /></div>
                                {this.props.t('NUMBER')}</label>
                            </Col>
                            <Col md={6}><label className="whentask">
                                <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name="FBTypeRadios" value="comment" checked={(this.state.questionObj && this.state.questionObj.feedbackTypeId===1)} onChange={e => this.handlechangeobj("feedbackTypeId", 1)} /></div>
                                {this.props.t('COMMENT')}</label>
                            </Col>

                            <Col md={6}><label className="whentask">
                                <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name="FBTypeRadios" value="checkboxes" checked={(this.state.questionObj && this.state.questionObj.feedbackTypeId===4)} onChange={e => this.handlechangeobj("feedbackTypeId", 4)} /></div>
                                {this.props.t('SELECT_FROM_A_LIST')}</label>
                            </Col>
                            <Col md={6}><label className="whentask">
                                <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name="FBTypeRadios" value="list" checked={(this.state.questionObj && this.state.questionObj.feedbackTypeId===3)} onChange={e => this.handlechangeobj("feedbackTypeId", 3)} /></div>
                                {this.props.t('CHECK_LIST')}</label>
                            </Col>
                            <Col md={6}><label className="whentask">
                                <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name="FBTypeRadios" value="checkboxes" checked={(this.state.questionObj && this.state.questionObj.feedbackTypeId===8)} onChange={e => this.handlechangeobj("feedbackTypeId", 8)} /></div>
                                {this.props.t('branch')}</label>
                            </Col>
                        </Row>
                    </li>
                    {(this.state.questionObj && (this.state.questionObj.feedbackTypeId === 3 || this.state.questionObj.feedbackTypeId === 4 || this.state.questionObj.feedbackTypeId === 8))?<li style={{paddingTop:"0px"}}>{this.state.questionObj.feedbackTypeId === 3?
                    <Checklist t={this.props.t} checkList={this.state.questionObj && this.state.questionObj.checkList?this.state.questionObj.checkList:[]} questionObj={this.state.questionObj} handlechecklist={this.handlechecklist} />
                    :this.state.questionObj.feedbackTypeId === 4?<Fromlist t={this.props.t} checkList={this.state.questionObj && this.state.questionObj.radioOptionList?this.state.questionObj.radioOptionList:[]} questionObj={this.state.questionObj} handlechecklist={this.handlechecklist} />
                    :this.state.questionObj.feedbackTypeId === 8?<Selectlist nextQuestionList={this.props.nextQuestionList} t={this.props.t} isRTL={this.props.isRTL} checkList={this.state.questionObj && this.state.questionObj.optionList?this.state.questionObj.optionList:[]} questionObj={this.state.questionObj} handlechecklist={this.handlechecklist} />
                    :<></>}
                    </li>:<></>}
                    {(this.state.questionObj && this.state.questionObj.feedbackTypeId !== 8)?
                    <li className="form-inline completeaction-main" style={{paddingTop:"0px"}}>
                        <label>{this.props.t("AFTER_COMPLETE_ACTION")}</label>
                        {/* <select className="form-control" value={questionObj?questionObj.completeActionType:"None"} onChange={e => handlechangeobj("completeActionType", e.target.value)} size="sm">
                            <option value="None">{props.t('NONE')}</option>
                            <option value="Next">{props.t('NEXT')}</option>
                            <option value="Done">{props.t('DONE')}</option>
                        </select> */}
                        <Dropdown className="action-txt" drop="up">
                            <Dropdown.Toggle variant="default" id="completeActionToggleBtn" className="drop-btn">{this.state.questionObj.completeActionType==="None"?this.props.t('SELECT_ACTION'):this.props.t(this.state.questionObj.completeActionType.toUpperCase())}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Col>
                                    <h5 className="text-center">{this.props.t("SELECT_ACTION")}</h5>
                                    <Col><label className="whentask">
                                        <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name={("OtherActionTypeRadios-1")} checked={this.state.questionObj.completeActionType==="None"} onChange={e => this.handleChangeGoto("actionType","None")} /></div>
                                        {this.props.t('NONE')}</label>
                                    </Col>
                                    <Col><label className="whentask">
                                        <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name={("OtherActionTypeRadios-1")} checked={this.state.questionObj.completeActionType==="Next"} onChange={e => this.handleChangeGoto("actionType","Next")} /></div>
                                        {this.props.t('NEXT')}</label>
                                    </Col>
                                    <Col><label className="whentask">
                                        <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name={("OtherActionTypeRadios-1")} checked={this.state.questionObj.completeActionType==="Done"} onChange={e => this.handleChangeGoto("actionType","Done")} /></div>
                                        {this.props.t('DONE')}</label>
                                    </Col>
                                    <label>{this.props.t("SELECT_QUESTION_TO_GOTO")}:</label>
                                    <Col className="questradio-list">
                                        {this.props.nextQuestionList && this.props.nextQuestionList?this.props.nextQuestionList.map((xitem,xidx) => {
                                            return <React.Fragment key={xidx}>{!xitem.isDelete?
                                            <Col><label className="whentask">
                                                <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name={("OtherActionQuestionRadios-1")} checked={this.state.questionObj.actionQuestionId===xitem.questionId} onChange={e => this.handleChangeGoto("actionQuestionId",xitem)} /></div>
                                                {xitem.questionNo} - {xitem.question}</label>
                                            </Col>
                                            :<></>}</React.Fragment>
                                        }):<></>}
                                    </Col>
                                </Col>
                            </Dropdown.Menu>
                        </Dropdown><br/>
                        {this.state.questionObj.completeActionType==="GoTo"&&this.state.questionObj.actionQuestionId>0?<span style={{padding:"0px",fontSize:"12px"}}>{this.props.t("TARGET_QUESTION")}: {this.state.questionObj.actionQuestionNo?this.state.questionObj.actionQuestionNo:"-"}-{this.state.questionObj.actionQuestionName?this.state.questionObj.actionQuestionName:"-"}</span>:<></>}
                    </li>:<></>}
                </ul>

                {this.props.questStatus && this.props.questStatus !== QUEST_STATUS.Replaced?<><Button type="button" id="savequestbtn" variant="danger" className="bottom-btn save-link" onClick={() => this.handleSaveQuestion()} disabled={this.props.isDisableBtns}>{this.props.t("save_question")}</Button>
                {this.state.ischangesAvailable?<Button type="button" variant="outline-secondary" className="bottom-btn" onClick={() => this.handleResetQuestion()} disabled={this.props.isDisableBtns} style={this.props.isRTL==="rtl"?{marginLeft:"5px"}:{marginRight:"5px"}}>{this.props.t("dismiss_changes")}</Button>:<></>}</>:<></>}
                <Button type="button" variant="outline-secondary" onClick={() => this.props.handleRowClick(null,null,true)} className="bottom-btn" style={this.props.isRTL==="rtl"?{marginLeft:"25px"}:{position:"absolute",marginRight:"25px"}} disabled={this.props.isDisableBtns}>{this.props.t("btnnames.close")}</Button>
            </Col>
        </Col>:<></>);    
    }
  };
  
  export default QuestionEdit;