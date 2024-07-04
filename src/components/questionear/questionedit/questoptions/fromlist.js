import React, { Component } from 'react'
import FeatherIcon from 'feather-icons-react';
import {  withRouter } from 'react-router-dom';
import {  Col, } from 'react-bootstrap'
import { withTranslation } from 'react-i18next';
import { preventinputToString } from '../../../../_services/common.service';

export class Fromlist extends Component {

    constructor(props) {
        super(props);
        this.state = {
            checkList: [],
        }
    }

    componentDidMount() {
        //
    }
    removeCListItem = (idx, type) => {
       if(!this.props.isedit){
        var list = this.props.checkList;
        if (type.optionItemId !== -1) {
            var exist = list.find(g => g.optionItemId === type.optionItemId)
            exist["isDelete"] = true;
        } else {
            list.splice(idx, 1);
        }
        this.setState({ checkList: list }, () => {
            this.props.handlechecklist(this.props.checkList,3);
        })
       }
    }
    addCListItem = () => {
       if(!this.props.isedit){
        var list = this.props.checkList;
        var item = { optionItemName: "", optionItemId: -1, questionId: this.props.questionObj.questionId, isDelete: false, isNew: true };
        list.push(item);
        this.setState({ checkList: list }, () => {
            this.props.handlechecklist(this.props.checkList,3);
        })
       }
    }
    handleOptiontext = (evt, idx) => {
       if(!this.props.isedit){
        if(!preventinputToString(evt,evt.target.value,(this.props.t('Character.option_text')))){
            evt.preventDefault()
            return
        }
        var list = this.props.checkList;
        var item = list[idx];
        item["optionItemName"] = evt.target.value;
        this.setState({ checkList: list }, () => {
            this.props.handlechecklist(this.props.checkList,3);
        })
       }
    }

    render() {
        return (
            <Col className="fromlist">
                <div className="title">{this.props.t('START_FILLING_PUT_THE_LIST')}</div>
                {this.props.checkList.map((type, i) =>
                    <React.Fragment key={i}>
                        {!type.isDelete ? <div key={i} className="list long-txt">
                            <FeatherIcon icon="check-circle" size={14} />
                            <input type="text" className="input-txt" placeholder={this.props.t("TYPE_ACTIONHERE")} value={type.optionItemName} onChange={(e) => this.handleOptiontext(e, i)} />
                            {/* {type.optionItemName === ""?<small className='input-txt-small'>{this.props.t("TYPE_ACTIONHERE")}</small>:<></>}
                            <span contentEditable className="form-control input-txt option-txt" onBlur={(e) => this.handleOptiontext(e, i)} suppressContentEditableWarning={true}>
                                {type.optionItemName}
                            </span> */}
                            <button className="btn remove-btn" onClick={(e) => this.removeCListItem(i, type)}> <FeatherIcon icon="x-circle" size={14} /></button></div> : <></>}
                    </React.Fragment>
                )}
                <div ><button className="btn fbfont" onClick={() => this.addCListItem()}>+ {this.props.t('ADD_ANOTHER_ITEM')}</button></div>
            </Col>
        )
    }
}



export default withTranslation()(withRouter(Fromlist));