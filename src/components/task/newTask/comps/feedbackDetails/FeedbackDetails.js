import React from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { FEEDBACK_CHECKBOXES, FEEDBACK_RADIO, FEEDBACK_NUMBER, FEEDBACK_TEXT, } from '../../../../../enums/taskfeedEnums';
import { Icons } from '../../../../../assets/icons/icons';
import Checklist from '../feedback/checklist';
import FromList from '../feedback/fromList';
import FeatherIcon from 'feather-icons-react';


function FeedbackDetails(props) {
    //console.log(props.mediaFeedbackTypes);
    return (
        <Col>
            <Col>
                <Form.Label style={{ opacity: props.isedit && "0.4" }}>{props.t('SELECT_FEEDBACK_MEDIA_OPTIONAL')}</Form.Label>
                <Col className="feedbackmedia" style={{ opacity: props.isedit && "0.4" }}>
                    {props.mediaFeedbackTypes && props.mediaFeedbackTypes.map((media, i) =>
                        <Button className={props.isedit ? "editview" : media.selected ? "selectedb" : ""} key={i} onClick={(e) => props.changeselectedFBmedia(media)} active={media.selected}><Col>
                            {media.icon === "grid" ? Icons.QR(media.selected ? "white" : " #5128a0") : <FeatherIcon icon={media.icon} style={{ strokeWidth: "1.5px" }} />}
                        </Col>
                            <Col>{props.t(media.vname)}</Col></Button>
                    )}
                </Col>
                <div className="whentask timefram usecam">
                    <label className="pure-material-switch" style={{ width: "100%" }}>
                        <input type="checkbox" checked={props.isuseCam} onChange={(e) => props.handleIsuseCam(props.isuseCam)} />
                        <span> {props.t('MUST_USE_CAM')} </span>
                    </label>
                </div>
            </Col>
            <Col style={{ opacity: props.isedit && "0.4" }}>
                <Form.Label >{props.t('SELECT_FEEDBACK_TYPE')} <span style={{ color: "red" }}>*</span></Form.Label>
                <Row>
                    <Col md={6}><div className="whentask" style={{ color: (props.errors.fillFeedBack || props.errors.allFieldFeedback) && 'red' }}>
                        <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name="FBTypeRadios" value="checkboxes" onChange={(e) => props.changeselectedFBtype(FEEDBACK_RADIO)} checked={props.selectedFBtype.id === FEEDBACK_RADIO.id} /></div>
                        {props.t('SELECT_FROM_A_LIST')}</div>
                    </Col>
                    <Col md={6}><div className="whentask" style={{ color: (props.errors.fillFeedBack || props.errors.allFieldFeedback) && 'red' }}>
                        <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name="FBTypeRadios" id="list" value="list" onChange={(e) => props.changeselectedFBtype(FEEDBACK_CHECKBOXES)} checked={props.selectedFBtype.id === FEEDBACK_CHECKBOXES.id} /></div>
                        {props.t('CHECK_LIST')}</div>
                    </Col>
                    <Col md={6}><div className="whentask" style={{ color: (props.errors.fillFeedBack || props.errors.allFieldFeedback) && 'red' }}>
                        <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name="FBTypeRadios" value="comment" onChange={(e) => props.changeselectedFBtype(FEEDBACK_TEXT)} checked={props.selectedFBtype.id === FEEDBACK_TEXT.id} /></div>
                        {props.t('COMMENT')}</div>
                    </Col>
                    <Col md={6}><div className="whentask" style={{ color: (props.errors.fillFeedBack || props.errors.allFieldFeedback) && 'red' }}>
                        <div className='form-check'><Form.Check type="radio" aria-label="radio 1" name="FBTypeRadios" value="number" onChange={(e) => props.changeselectedFBtype(FEEDBACK_NUMBER)} checked={props.selectedFBtype.id === FEEDBACK_NUMBER.id} /></div>
                        {props.t('NUMBER')}</div></Col>
                </Row>
                <Col>
                    {(props.selectedFBtype.id === FEEDBACK_CHECKBOXES.id) && 
                        <Checklist 
                            errors={props.errors} 
                            isedit={props.isedit} 
                            checkList={props.checkList} 
                            sobj={props.sobj} 
                            handlechecklist={props.handlechecklist} 
                            />}

                    {(props.selectedFBtype.id === FEEDBACK_RADIO.id) && 
                        <FromList 
                            errors={props.errors} 
                            isedit={props.isedit} 
                            checkList={props.checkList} 
                            sobj={props.sobj} 
                            handlechecklist={props.handlechecklist} 
                            />}
                </Col>
            </Col>
        </Col>
    );
}

export default FeedbackDetails;