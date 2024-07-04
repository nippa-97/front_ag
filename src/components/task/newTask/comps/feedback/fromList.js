import React, { Component } from 'react'
import FeatherIcon from 'feather-icons-react';
import {  withRouter } from 'react-router-dom';
import {  Col, } from 'react-bootstrap'
import { withTranslation } from 'react-i18next';
import {  preventinputToString } from '../../../../../_services/common.service';
class FromList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checkList: [],
        }
    }
    componentDidMount() {
    }
    removeCListItem = (idx, type) => {
        //disable in edit
       if(!this.props.isedit){
        var list = this.props.checkList;
        if (type.id !== -1) {
            var exist = list.find(g => g.id === type.id)
            exist["isDelete"] = true
        } else {
            list.splice(idx, 1);
        }
        this.setState({ checkList: list }, () => {
            this.props.handlechecklist(this.props.checkList)
        })
       }
    }
    addCListItem = () => {
       //disable in edit
       if(!this.props.isedit){
        var list = this.props.checkList;
        var item = { optiontext: "", isNew: true, optionId: -1, id: -1 };
        list.push(item);
        this.setState({ checkList: list }, () => {
            this.props.handlechecklist(this.props.checkList)
        })
       }
    }
    handleOptiontext = (evt, idx) => {
        //disable in edit
       if(!this.props.isedit){
        if(!preventinputToString(evt,evt.target.value,(this.props.t('Character.option_text')))){
            evt.preventDefault();
            return
        }
        var list = this.props.checkList;
        var item = list[idx];
        item["optiontext"] = evt.target.value;
        this.setState({ checkList: list }, () => {
            this.props.handlechecklist(this.props.checkList)
        })
       }   
    }
    render() {
        return (
            <Col className="fromlist">
                <div className="title" style={{color:this.props.errors.listempty &&"red"}}>{this.props.t('START_FILLING_PUT_THE_LIST')}</div>
                {this.props.checkList.map((type, i) =>
                    <React.Fragment key={i}>
                        {!type.isDelete ? <div key={i} className="list long-txt">
                            <FeatherIcon icon="check-circle" style={{color: (this.props.errors.listitemempty && type.optiontext === "") && "red"}} size={14} />
                            
                            <input type="text" name="name" style={{borderBottom: (this.props.errors.listitemempty && type.optiontext === "") && "1px solid red"}} placeholder={this.props.t("TYPE_FIRSTACTION_HERE")} value={type.optiontext} onChange={(e) => this.handleOptiontext(e, i)} />
{/* 
                            {(type.optiontext === undefined || type.optiontext === "")?<small className='input-txt-small'>{this.props.t("TYPE_ACTIONHERE")}</small>:<></>}
                            <span contentEditable className="form-control input-txt option-txt" onBlur={(e) => this.handleOptiontext(e, i)} suppressContentEditableWarning={true}>
                                {type.optiontext}
                            </span> */}
                            
                            <button className="btn" onClick={(e) => this.removeCListItem(i, type)}> <FeatherIcon icon="x-circle" size={14} /></button></div> : <></>}
                    </React.Fragment>
                )}
                <div style={{textAlign: "center"}}><button className="btn fbfont" onClick={() => this.addCListItem()}>+ {this.props.t('ADD_ANOTHER_ITEM')}</button></div>
            </Col>
        )
    }
}



export default withTranslation()(withRouter(FromList));