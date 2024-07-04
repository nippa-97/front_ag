import React, { Component } from 'react';
import {  Col, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { FEEDBACK_BRANCH, FEEDBACK_CHECKBOXES, FEEDBACK_NUMBER, FEEDBACK_PHOTO, FEEDBACK_QR, FEEDBACK_RADIO, FEEDBACK_TEXT, FEEDBACK_VIDEO, TaskStatusENUM } from '../../../../../enums/taskfeedEnums';
import QuestionnaireImage from './questionnaireImage/questionnaireImage';
import './questionnaireResults.css'
import { withRouter } from 'react-router-dom';
import { SummerystatusColors, SummeryStatusName } from '../../../../../_services/common.service';
import { Icons } from '../../../../../assets/icons/icons';
import { CheckCircleFillIcon  } from '@primer/octicons-react';
export class QuestionnaireResults extends Component {

    constructor(props) {
        super(props);

        this.state = {
            lightboxOpen: false,
        }
    }

    componentDidMount() {

    }
    handlelightbox = () => {
        this.setState({ lightboxOpen: !this.state.lightboxOpen })
    }
    setAnswer = (qes) => {
        if (qes.isAnswered) {
            //if anser is number
            if (qes.mainRequestedFeedbackType === FEEDBACK_NUMBER.name) {
                var nuresult = qes.questionFeedbackTypes.find(x => x.feedbackType === FEEDBACK_NUMBER.name);
                return nuresult.answer
            }
            //if answer text
            if (qes.mainRequestedFeedbackType === FEEDBACK_TEXT.name) {
                var txtresult = qes.questionFeedbackTypes.find(x => x.feedbackType === FEEDBACK_TEXT.name);
                return txtresult.answer
            }
            //if answer radio
            if (qes.mainRequestedFeedbackType === FEEDBACK_RADIO.name) {
                var radioresult = qes.questionFeedbackTypes.find(x => x.feedbackType === FEEDBACK_RADIO.name);
                var radiodisplay = ""
                radioresult.requestedFeedbackTypeOptions.forEach(ele => {
                    if (ele.answer) { radiodisplay = ele.optiontext }
                });

                return radiodisplay
            }

            //if answer checkbox
            if (qes.mainRequestedFeedbackType === FEEDBACK_CHECKBOXES.name) {
                var cbresult = qes.questionFeedbackTypes.find(x => x.feedbackType === FEEDBACK_CHECKBOXES.name);
                var ansList = ""
                var stringName = "";
                cbresult.requestedFeedbackTypeOptions.forEach(ele => {
                    if (stringName !== "") {
                        stringName += ", "
                        ansList += ", "
                    }
                    if (ele.answer) {
                        stringName += ele.optiontext
                        ansList += ele.optiontext
                    }
                });
                const renderTooltip = (props) => (
                    <Tooltip className="in" id="tooltip-summery" {...props}>
                        {ansList}
                    </Tooltip>
                );
                stringName = ((stringName).length > 34) ?
                    (((stringName).substring(0, 34 - 3)) + '...') :
                    stringName
                return <OverlayTrigger placement="bottom" delay={{ show: 10, hide: 40 }} overlay={renderTooltip}>
                    <Col>{stringName}</Col>
                </OverlayTrigger>
            }
            // answer branch
            if (qes.mainRequestedFeedbackType === FEEDBACK_BRANCH.name) {
                var branchresult = qes.questionFeedbackTypes.find(x => x.feedbackType === FEEDBACK_BRANCH.name);
                var branchdisplay = '';
                branchresult.requestedFeedbackTypeOptions.forEach(elem => {
                    if (elem.answer) {
                        branchdisplay = elem.optiontext
                    }
                });
                return branchdisplay
            }
        } else {
            var noresult = "N/A"
            return noresult
        }
    }
    setmedia = (feedbacktypes) => {
        var medialist = []
        var photos = feedbacktypes.find(x => x.feedbackType === FEEDBACK_PHOTO.name);
        var videos = feedbacktypes.find(x => x.feedbackType === FEEDBACK_VIDEO.name);
        if (photos) {
            photos.taskCompletionMediaList.forEach(phot => {
                medialist.push(phot)
            });
        }
        if (videos) {
            videos.taskCompletionMediaList.forEach(vid => {
                medialist.push(vid)
            });
        }
        return medialist
    }
    setQRdisplay = (value) => {

        if (value.isAnswered) {
            var haveqr = value.questionFeedbackTypes.find(x => x.feedbackType === FEEDBACK_QR.name);
            if (haveqr) {
                if (haveqr.answer === "Success") {
                    return <Col className="QR" >{Icons.QR("#5128a0")}<Col className="text">{this.props.t('QR_SUCCESS')}</Col></Col>
                } else {
                    return <Col className="QR" style={{ color: "#B2B2B2" }}>{Icons.QR("#B2B2B2")}<Col className="text">{this.props.t('QR_FAIL')}</Col></Col>
                }
            }
        }
    }
    render() {

        return (
            <div className="Questionnairedisplay">
                {(this.props.quesionnaireDetails.length > 0) && this.props.quesionnaireDetails.map((qes, i) =>
                    <Col key={i} className="onequestionsection">

                        <Row >

                            <Col md={6}>
                                <Col className="question-title">
                                   <label className="viewcheckbox-wrapper">
                                        <input type="checkbox" disabled={!(this.props.subTask && (this.props.enableIcoannotdo(this.props.subTask)))||qes.isAnswered || (qes.questionCompletionStatus === TaskStatusENUM.ICanNotDo)} onChange={(e) => this.props.handlequestionselection(qes.questionId)} />
                                        <span><CheckCircleFillIcon  size={14} />
                                            <Col>
                                                {i + 1}. {qes.question}
                                                {qes.questionCompletionStatus && <Col ><span className="dot" style={SummerystatusColors("dot", qes.questionCompletionStatus)}></span><span style={SummerystatusColors("", qes.questionCompletionStatus)}>{SummeryStatusName(qes.questionCompletionStatus)}</span></Col>}
                                            </Col>
                                        </span>
                                    </label>
                                    {/* <Form.Check type="checkbox" className="scheckbox roundcheckbox" disabled={qes.isAnswered || (qes.questionCompletionStatus === TaskStatusENUM.ICanNotDo)} onChange={(e) => this.props.handlequestionselection(qes.questionId)} /> */}

                                    {this.setQRdisplay(qes)}
                                </Col>

                            </Col>
                            <Col className="question-answer" md={4}>{this.setAnswer(qes)}</Col>
                            <Col md={2}><QuestionnaireImage
                                lightboxOpen={this.state.lightboxOpen}
                                handlelightbox={this.handlelightbox}
                                media={this.setmedia(qes.questionFeedbackTypes)}
                                openimagepreview={this.openimagepreview} />
                            </Col>
                        </Row>
                    </Col>
                )}


            </div>
        );
    }
}


export default withTranslation()(withRouter((QuestionnaireResults)));