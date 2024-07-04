import React, { Component } from 'react'
import FeatherIcon from 'feather-icons-react';
import {  withRouter } from 'react-router-dom';
import {  Col, Dropdown, Form } from 'react-bootstrap'
import { withTranslation } from 'react-i18next';
import { preventinputToString } from '../../../../_services/common.service';

export class Selectlist extends Component {

    constructor(props) {
        super(props);
        this.state = {
            checkList: [],
        }
    }

    componentDidMount() {
        
    }
    removeCListItem = (idx, type) => {
       if(!this.props.isedit){
        var list = this.props.checkList;
        if (type.optionId !== -1) {
            var exist = list.find(g => g.optionId === type.optionId)
            exist["isDelete"] = true
        } else {
            list.splice(idx, 1);
        }

        this.setState({ checkList: list }, () => {
            this.props.handlechecklist(this.props.checkList,2)
        })
       }
    }
    addCListItem = () => {
       if(!this.props.isedit){
        var list = this.props.checkList;
        var item = { optionName: "", actionQuestionId: 0, actionQuestionName: "", actionQuestionNo: 0, actionType: "None", isDelete: false, isNew: true, questionId: this.props.questionObj.questionId, optionId: -1 };
        list.push(item);
        this.setState({ checkList: list }, () => {
            this.props.handlechecklist(this.props.checkList,2)
        })
       }
        
    }
    handleOptiontext = (evt, idx) => {
       if(!this.props.isedit){
        if(!preventinputToString(evt,evt.target.value,(this.props.t('Character.option_text')))){
            evt.preventDefault();
            return
        }
        var list = this.props.checkList;
        var item = list[idx];
        item["optionName"] = evt.target.value;
        this.setState({ checkList: list }, () => {
            this.props.handlechecklist(this.props.checkList,2)
        })
       }
    }
    //handle change goto option
    handleChangeGoto = (cidx,ctype,cval) => {
        var cchecklist = this.props.checkList;
        var cquestionitem = cchecklist[cidx];

        if(ctype === "actionQuestionId"){
            cquestionitem[ctype] = cval.questionId;
            cquestionitem["actionQuestionName"] = cval.question;
            cquestionitem["actionQuestionNo"] = cval.questionNo;
            cquestionitem["actionType"] = "GoTo";
        } else {
            cquestionitem[ctype] = cval;
            cquestionitem["actionQuestionName"] = "";
            cquestionitem["actionQuestionNo"] = 0;
        }
        
        if(ctype === "actionType" && cval !== "GoTo"){
            cquestionitem["actionQuestionId"] = 0;
        }

        this.setState({ checkList: cchecklist }, () => {
            this.props.handlechecklist(cchecklist,2)
        })
    }

    auto_grow = (element) => {
        let defaultheight = 5;
        defaultheight = (defaultheight + element.scrollHeight) + "px";

        return defaultheight;
    }

    render() {
        return (
            <Col className="fromlist">
                <div className="title">{this.props.t('START_FILLING_OUT_THE_BRANCH')}</div>
                {this.props.checkList.map((type, i) =>
                    <React.Fragment key={i}>
                        {!type.isDelete ? <div key={i} className="list form-inline">
                            
                            <input type="text" className="input-txt" placeholder={this.props.t("TYPE_ACTIONHERE")} value={type.optionName} onChange={(e) => this.handleOptiontext(e, i)} />
                            {/* {type.optionName === ""?<small className='input-txt-small'>{this.props.t("TYPE_ANSWER")}</small>:<></>}
                            <span contentEditable className="form-control input-txt option-txt" onBlur={(e) => this.handleOptiontext(e, i)} suppressContentEditableWarning={true}>
                                {type.optionName}
                            </span> */}
                            
                            <Dropdown className="action-txt" drop="up">
                                <Dropdown.Toggle variant="default" className="drop-btn">{type.actionType==="None"?this.props.t('SELECT_ACTION'):this.props.t(type.actionType.toUpperCase())}</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Col>
                                        <h5 className="text-center">{this.props.t("SELECT_ACTION")}</h5>
                                        <Col><label className="whentask">
                                            <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name={("ActionTypeRadios-"+i)} checked={type.actionType==="None"} onChange={e => this.handleChangeGoto(i,"actionType","None")} /></div>
                                            {this.props.t('NONE')}</label>
                                        </Col>
                                        <Col><label className="whentask">
                                            <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name={("ActionTypeRadios-"+i)} checked={type.actionType==="Next"} onChange={e => this.handleChangeGoto(i,"actionType","Next")} /></div>
                                            {this.props.t('NEXT')}</label>
                                        </Col>
                                        {/* <Col><label className="whentask"><Form.Check type="radio" aria-label="radio 1" name={("ActionTypeRadios-"+i)} checked={type.actionType==="GoTo"} onChange={e => this.handleChangeGoto(i,"actionType","GoTo")} />Go to</label></Col> */}
                                        <Col><label className="whentask">
                                            <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name={("ActionTypeRadios-"+i)} checked={type.actionType==="Done"} onChange={e => this.handleChangeGoto(i,"actionType","Done")} /></div>
                                            {this.props.t('DONE')}</label>
                                        </Col>
                                        <label>{this.props.t("SELECT_QUESTION_TO_GOTO")}:</label>
                                        <Col className="questradio-list">
                                            {this.props.nextQuestionList && this.props.nextQuestionList?this.props.nextQuestionList.map((xitem,xidx) => {
                                                return <React.Fragment key={xidx}>{!xitem.isDelete?
                                                <Col><label className="whentask">
                                                    <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name={("ActionQuestionRadios-"+i)} checked={type.actionQuestionId===xitem.questionId} onChange={e => this.handleChangeGoto(i,"actionQuestionId",xitem)} /></div>
                                                    {xitem.questionNo} - {xitem.question}</label>
                                                </Col>
                                                :<></>}</React.Fragment>
                                            }):<></>}
                                        </Col>
                                    </Col>
                                </Dropdown.Menu>
                            </Dropdown>
                            <button className="btn remove-btn select-remove" onClick={(e) => this.removeCListItem(i, type)}> <FeatherIcon icon="x-circle" size={14} /></button>
                            {type.actionType==="GoTo"&&type.actionQuestionId>0?<span style={{padding:"0px"}}>{this.props.t("TARGET_QUESTION")}: {type.actionQuestionNo?type.actionQuestionNo:"-"}-{type.actionQuestionName?type.actionQuestionName:"-"}</span>:<></>}
                            </div> : <></>}
                    </React.Fragment>
                )}
                <div ><button className="btn fbfont" onClick={() => this.addCListItem()}>+ {this.props.t('ADD_ANOTHER_ITEM')}</button></div>
            </Col>
        )
    }
}



export default withTranslation()(withRouter(Selectlist));