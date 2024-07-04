
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import FeedbackDetails from './feedbackDetails/FeedbackDetails';
import FeedbackQuestionnaire from './feedbackQustionaire/FeedbackQuestionnaire';
class feedbacktask extends Component {
    _isMounted = false;
    feedbtype = [{ id: '1', feedbackType: 'text' },
    { id: '2', feedbackType: 'number' },
    { id: '3', feedbackType: 'checkboxes' },
    { id: '4', feedbackType: 'radio' },
    { id: '5', feedbackType: 'qr' },
    { id: '6', feedbackType: 'photo' },
    { id: '7', feedbackType: 'video' }];
    requestedFeedbackDto = []
    constructor(props) {
        super(props);

        this.state = {
            // checkList: [],
            feedbackTypeList: [],
            requestedFeedbackDto: []

        }
    }
    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            this.loadfeedbackTypes();
            // this.props.getQuestionnaireList();
        }
    }
    loadfeedbackTypes = () => {
        var feedtype = this.feedbtype;
        var cfeedbackTypeList = feedtype.filter(x => x.id < 6);
        this.setState({ feedbackTypeList: cfeedbackTypeList }, () => {
        })
    }
    render() {
        return (
            <div >
                <h3>{this.props.t('FEED_BACK')}</h3>
                <div >
                    <div className="whentask timefram" >
                        <label className="pure-material-switch" style={{ width: "100%" }}>
                            <input type="checkbox"  disabled={this.props.isedit} checked={this.props.isQuestionnaire} onChange={(e) => this.props.handleQuestionnaire()} />
                            <span> {this.props.t('TASK_USE_QUESTIONIER')} </span>
                        </label>
                    </div>
                    { this.props.isQuestionnaire && 
                        <FeedbackQuestionnaire 
                            pagescrollcall={this.props.pagescrollcall} 
                            questionnaireStatus={this.props.questionnaireStatus} 
                            EditsaveQuestionnaire={this.props.EditsaveQuestionnaire} 
                            isedit={this.props.isedit} 
                            Questionnairesearkkey={this.props.Questionnairesearkkey}  
                            QuestionnaireSearch={this.props.QuestionnaireSearch} 
                            Questionniarequestion={this.props.Questionniarequestion} 
                            Questionniarequestionhandle={this.props.Questionniarequestionhandle} 
                            QuestionniareList={this.props.QuestionniareList} 
                            errors={this.props.errors} 
                            />}

                   { !this.props.isQuestionnaire && 
                        <FeedbackDetails 
                            t={this.props.t} 
                            handleIsuseCam ={this.props.handleIsuseCam }  
                            sobj={this.props.sobj} 
                            changeselectedFBtype={this.props.changeselectedFBtype} 
                            selectedFBtype={this.props.selectedFBtype} 
                            errors={this.props.errors} 
                            isedit={this.props.isedit} 
                            checkList={this.props.checkList}  
                            handlechecklist={this.props.handlechecklist} 
                            isuseCam={this.props.isuseCam} 
                            mediaFeedbackTypes={this.props.mediaFeedbackTypes} 
                            changeselectedFBmedia={this.props.changeselectedFBmedia} 
                            validateField={this.props.validateField}
                            />}
                </div>
            </div>
        )
    }
}


export default withTranslation()(withRouter(feedbacktask));