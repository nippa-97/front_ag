import React, { Component } from 'react'
import { Button, Col, Modal } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { TaskApproveEnum } from '../../../enums/taskfeedEnums';
import { alertService } from '../../../_services/alert.service';
import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import './approvemodal.css'

class ApproveModal extends Component {


    approveTask = () => {
        this.approvetaskcall();
    }
    seetaskDetails=()=>{
        this.props.CloseAModal();
        this.props.rowclick(this.props.approvedetails)

    }

    approvetaskcall = () => {
        var saveobj = {
            taskId: this.props.approvedetails.taskId,
            taskStatus:  'Approve'
        }
        submitSets(submitCollection.approveTask, saveobj, true, null, true).then(resp => {

            if (resp && resp.status) {
                alertService.success(this.props.t("TASK_APPROVED"));
                this.props.CloseAModal();
                this.props.handleTableSearch(null, "click");
            } else {
                // alertService.error((resp&&!resp.status?(resp.extra!==""?resp.extra:resp.msg!==""?resp.msg:this.props.t('ERROR_OCCURRED')):this.props.t('ERROR_OCCURRED')));
                // alertService.error((resp && resp.extra ? resp.extra : this.props.t('ERROR_OCCURRED')));
            }

        })
    }


    render() {
        var taskcanapprove = <Col className="title">{this.props.t('TASK_CAN_BE_APPROVE')}</Col>
        var taskcannotapprove = <Col className="title">{this.props.t('TASK_CANNOT_BE_APPROVED')}</Col>
        return (
            <Modal className={"SummeryModal approvemodal" + (this.props.isRTL === "rtl" ? "RTL" : "")} dir={this.props.isRTL} backdrop="static" keyboard={false}
                size="md"
                show={this.props.approveModal} onHide={this.props.CloseAModal}
                aria-labelledby="example-modal-sizes-title-lg"
            >
                <Modal.Header className="modalheader" closeButton>
                    <Modal.Title id="example-modal-sizes-title-lg">
                        <h3 className="massname">{this.props.subTask && this.props.subTask.userName}</h3>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* message section */}
                    {(this.props.approvedetails.taskAprrovableStatus === TaskApproveEnum.CanApprove) &&
                        <Col className="bodymodal">
                            {taskcanapprove}
                            <Col className="popupmsg">{this.props.t('SUBTASK_COMPLETED_SURE_TO_APPROVE_THIS_TASK')}</Col>
                            <Col><Button className="mainbtn" onClick={() => this.approveTask()}>{this.props.t('APPROVE')}</Button></Col>
                            <Col><Button className="secbtn" onClick={()=>this.seetaskDetails()}>{this.props.t('SEE_TASK_DETAILS')}</Button></Col>
                        </Col>
                    }
                    {(this.props.approvedetails.taskAprrovableStatus === TaskApproveEnum.HalfPending) &&
                        <Col className="bodymodal">
                            {taskcannotapprove}
                            <Col className="popupmsg">{this.props.t('CANNOT_APPROVE_UNCOMPLETED_SUB_TASKS')} </Col>
                            <Col><Button className="mainbtn" onClick={()=>this.seetaskDetails()}>{this.props.t('SEE_TASK_DETAILS')}</Button></Col>
                            {/* <Col><Button className="secbtn" onClick={() => this.approveTask()}>Approve Anyway</Button></Col> */}
                        </Col>
                    }

                    {(this.props.approvedetails.taskAprrovableStatus === TaskApproveEnum.HalfIssue) &&
                        <Col className="bodymodal">
                            {taskcannotapprove}
                            <Col className="popupmsg">{this.props.t('SOME_OF_USERS_HVNT_COMPTASKS_WANT_TO_APPROVE')}</Col>
                            <Col><Button className="mainbtn" onClick={()=>this.seetaskDetails()}>{this.props.t('SEE_TASK_DETAILS')}</Button></Col>
                            <Col><Button className="secbtn" onClick={() => this.approveTask()}>{this.props.t('APPROVE_ANYWAY')}</Button></Col>
                        </Col>

                    }
                    {/* message section end */}
                </Modal.Body>
            </Modal>

        )
    }
}

export default withTranslation()(withRouter(ApproveModal));