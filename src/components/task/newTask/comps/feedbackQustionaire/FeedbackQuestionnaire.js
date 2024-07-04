import { Col, Form, FormControl, InputGroup } from 'react-bootstrap';
import './FeedbackQuestionnaire.css'
import FeatherIcon from 'feather-icons-react';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { QUEST_STATUS } from '../../../../../enums/taskfeedEnums';
import { connect } from 'react-redux';
import { viewQuestionSetAction } from '../../../../../actions/questionear/quest_action';
import { preventinputToString } from '../../../../../_services/common.service';
class FeedbackQuestionnaire extends Component {

    constructor(props) {
        super(props);
        this.listInnerRef = React.createRef();
        this.state = {
            searchkey: '',
        }
    }
    gotoQuestionnaire = () => {
        this.props.setQuestionDetailsView(null);
        this.props.history.push("/questionlist/details");
    }
    onchangesearhcbox = (e) => {
        if(!preventinputToString(e,e.target.value,(this.props.t('Character.search_text')))){
            e.preventDefault();
            return
        }
        this.props.QuestionnaireSearch(e.target.value)
    }
    handleselectquestion = (evt) => {
        this.props.Questionniarequestionhandle(evt)
    }
    onScroll = () => {
        if (this.listInnerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = this.listInnerRef.current;
            if (scrollTop + clientHeight === scrollHeight) {
                // TO SOMETHING HERE
                this.props.pagescrollcall();
                // console.log('Reached bottom')
            }
        }
    };
    render() {
        return (
            <div>
                <Col className="questionnairesarch" style={{ marginTop: "17px" }}>
                    <InputGroup size="sm">
                        <InputGroup.Text><FeatherIcon icon="search" size={14} /></InputGroup.Text>
                        <FormControl id="inlineFormInputGroupUsername" placeholder={this.props.t('SEARCH')} value={this.props.Questionnairesearkkey} onChange={(e) => this.onchangesearhcbox(e)} />
                    </InputGroup>
                </Col>
                {this.props.isedit && <Col className="prevselected">
                    <Col className="title">{this.props.t('questionnaire')}: {this.props.EditsaveQuestionnaire && this.props.EditsaveQuestionnaire}</Col>
                    {(this.props.questionnaireStatus === QUEST_STATUS.Replaced) && <Col className="stitle">{this.props.t('status')}:<span className="Qstatus">{this.props.t('replaced')}</span></Col>}
                </Col>}
                <Col className="fromlist" style={{ marginTop: "15px" }}>
                    <Col className="title">{this.props.t('SELECTQ_OR_CREATE_NEW')}</Col>
                    <Col className="QustionniaireBody" onScroll={() => this.onScroll()} ref={this.listInnerRef}>
                        {(this.props.QuestionniareList.length > 0) && this.props.QuestionniareList.map((question, i) =>
                            <Col key={i} className="name" onClick={() => this.handleselectquestion(question.questionnaireId)}>
                                <Form.Check style={{ marginRight: "5px", marginLeft: "5px" }} type="radio"
                                    onChange={() => this.handleselectquestion(question.questionnaireId)}
                                    checked={parseInt(this.props.Questionniarequestion) === question.questionnaireId}
                                    value={question.questionnaireId} name="question"
                                />
                                <span style={{ marginTop: "3px", color: this.props.errors.noquestionselect && 'red' }}>{question.questionnaireName}</span>
                            </Col>
                        )}
                        <Col className="loadingquestionnaire"></Col>
                    </Col>
                    <div style={{textAlign: "center"}}><button className="btn fbfont questionbottom" onClick={() => this.gotoQuestionnaire()}><FeatherIcon icon="plus" size={12} />{this.props.t('NEWQUESTIONER_CAN_CREATE_IN')}<b>{this.props.t('QUESTIONNAIRE')}</b> </button></div>
                </Col>
            </div>
        );
    }
}
//set redux actions
const mapDispatchToProps = dispatch => ({
    setQuestionDetailsView: (payload) => dispatch(viewQuestionSetAction(payload)),

});
export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(FeedbackQuestionnaire)));
