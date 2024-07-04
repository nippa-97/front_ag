import React, { Component } from 'react'
import { Col } from 'react-bootstrap'
import {  withRouter } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import { withTranslation } from 'react-i18next';
import { preventinputToString } from '../../../../_services/common.service';

export class Checklist extends Component {

    constructor(props) {
        super(props);
        this.state = {
            checkList: [],
        }
    }

    componentDidMount() {
        // console.log(this.props.sobj);
    }

    removeCListItem = (idx, type) => {
        //disable in edit
        if (!this.props.isedit) {
            var list = this.props.checkList;
            if (type.checkItemId !== -1) {
                var exist = list.find(g => g.checkItemId === type.checkItemId)
                exist["isDelete"] = true
            } else {
                list.splice(idx, 1);
            }

            this.setState({ checkList: list }, () => {
                this.props.handlechecklist(this.props.checkList,1)
            });
        }
    }

    addCListItem = () => {
        //disable in edit
        if (!this.props.isedit) {
            var list = this.props.checkList;
            var item = { checkItemName: "", isDelete: false, isNew: true, questionId: this.props.questionObj.questionId, checkItemId: -1 };

            list.push(item);
            this.setState({ checkList: list }, () => {
                this.props.handlechecklist(this.props.checkList,1)
            })
        }
    }
    handleOptiontext = (evt, idx) => {
        if (!this.props.isedit) {
            if(!preventinputToString(evt,evt.target.value,(this.props.t('Character.option_text')))){
                evt.preventDefault()
                return
            }
            var list = this.props.checkList;
            var item = list[idx];
            item["checkItemName"] = evt.target.value;

            this.setState({ checkList: list }, () => {
                this.props.handlechecklist(this.props.checkList,1)
            });
        }
    }

    render() {
        return (
            <Col className="fromlist">
                <div className="title">{this.props.t('START_FILLING_OUT_THE_CHECKLIST')}</div>
                {this.props.checkList.map((type, i) =>
                    <React.Fragment key={i}>
                        {!type.isDelete ? <div key={i} className="list long-txt">
                            <FeatherIcon icon="check-circle" size={14} />
                            
                            <input type="text" name="name" placeholder={this.props.t("TYPE_ACTIONHERE")} className="input-txt" value={type.checkItemName} onChange={(e) => this.handleOptiontext(e, i)} />

                            {/* {type.checkItemName === ""?<small className='input-txt-small'>{this.props.t("TYPE_ACTIONHERE")}</small>:<></>}
                            <span contentEditable className="form-control input-txt option-txt" onBlur={(e) => this.handleOptiontext(e, i)} suppressContentEditableWarning={true}>
                                {type.checkItemName}
                            </span> */}

                            <button className="btn remove-btn" onClick={(e) => this.removeCListItem(i, type)}> <FeatherIcon icon="x-circle" size={14} /></button></div> : <></>}
                    </React.Fragment>
                )}


                <div ><button className="btn fbfont" onClick={() => this.addCListItem()}>+ {this.props.t('ADD_ANOTHER_ITEM')}</button></div>
            </Col>
        )
    }
}

export default withTranslation()(withRouter(Checklist));
