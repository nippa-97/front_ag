import React, { Component } from 'react'
import { Modal, Col, Row, Form, Button, Badge, Image } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter, } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import { convertDatetoTimeHM24, usrLevels, SummerystatusColors, SummeryStatusName, preventinputToString } from '../../../../_services/common.service';
import { FEEDBACK_PHOTO, FEEDBACK_VIDEO, FEEDBACK_BRANCH, TaskStatusENUM } from '../../../../enums/taskfeedEnums';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { alertService } from '../../../../_services/alert.service';
import { Icons } from '../../../../assets/icons/icons';
import Loading from '../../../../assets/img/loading-sm.gif'
import QuestionnaireResults from './questionnaireResults/questionnaireResults';
import { confirmAlert } from 'react-confirm-alert';
import ReactImageVideoLightbox from "react-image-video-lightbox";
import { AcViewModal } from '../../../UiComponents/AcImports';
import { TooltipWrapper } from '../../../newMasterPlanogram/AddMethods';

export class SummeryDetails extends Component {

    constructor(props) {
        super(props);
        this.state = {
            cannotdoLoad:false,
            imagesdataready: false,
            data: [],
            mediaStartIndex: 0,

            comment: "",
            disablechatsnedbtn: false,
            showsmodal: false,
            redoreason: null,
            showmediamodal: false,
            previewmedia: null,
            prevwmtype: "",
            quesionnaireDetails: [],
        }
    }
    //modal
    shandleModalToggle = (type) => {
        this.setState({ showsmodal: !this.state.showsmodal })
    }
  
    //set regionname or store name
    setworkplace = (subtask) => {
        var name = ""
        var userlevel = subtask.taskReceiverInfo.userRolls.userLevel;
        if (userlevel === usrLevels.RG) {
            name = subtask.region
        }
        if (userlevel === usrLevels.ST) {
            name = subtask.store
        }
        return name
    }
    //set media preview url
    setmediaUrl = (media,index) => {
        this.openemModal();
        //need to remove this not use
        var prevwMedia = this.state.previewmedia;
        var prevwmtype = ""
        //end
        // if (media.mediaType === FEEDBACK_PHOTO.name) {
        //     prevwMedia = media.url;
        //     prevwmtype = "photo"
        // } else {
        //     prevwMedia = media.url
        //     prevwmtype = "video"
        // }
        var setdata=[]
        this.props.subTaskMedia.forEach(dataobj => {
            var obj={}
            obj["url"]=dataobj.url
            obj["type"]=dataobj.mediaType
            setdata.push(obj)
        });
     

        this.setState({ previewmedia: prevwMedia, prevwmtype: prevwmtype,data:setdata,mediaStartIndex:index })
    }
    //set subtask images
    subtaskimage = () => {
        if (this.props.mideaAvailable) {
            if (this.props.subTaskMedia && this.props.subTaskMedia.length > 0) {
                //one image
                if (this.props.subTaskMedia.length === 1) {
                    return <div className="imagediv" style={{ backgroundImage: "url(" + this.setsubtaskimageurl(this.props.subTaskMedia[0]) + ")" }} onClick={() => this.setmediaUrl(this.props.subTaskMedia[0],0)}></div>
                }
                //two image
                if (this.props.subTaskMedia.length === 2) {
                    return <Col className="outimgcol"><Row>
                        {this.props.subTaskMedia.map((img, i) =>
                            <Col className="inimgcol" key={i} md={12}>
                                <div className="imagediv twosummeryimg" style={{ backgroundImage: "url(" + this.setsubtaskimageurl(img) + ")" }} onClick={() => this.setmediaUrl(img,i)}>

                                    {(img.mediaType === "video") && <FeatherIcon icon="play-circle" className="vicon" size="52" />}
                                </div>

                            </Col>)}
                    </Row>
                    </Col>
                }
                //three image
                if (this.props.subTaskMedia.length === 3) {
                    return <Col className="outimgcol" >
                        <Row>
                            {this.props.subTaskMedia.map((img, i) => <Col className="inimgcol" key={i} md={i < 2 ? 6 : 12}><div className="imagediv twosummeryimg" style={{ backgroundImage: "url(" + this.setsubtaskimageurl(img) + ")" }} onClick={() => this.setmediaUrl(img,i)} >
                                {(img.mediaType === "video") && <FeatherIcon icon="play-circle" className="vicon" size="52" />}</div></Col>)}
                        </Row>
                    </Col>
                }
                //for image
                if (this.props.subTaskMedia.length === 4) {
                    return <Col className="outimgcol"><Row>
                        {this.props.subTaskMedia.map((img, i) => <Col className="inimgcol" key={i} md={6}><div className="imagediv twosummeryimg" style={{ backgroundImage: "url(" + this.setsubtaskimageurl(img) + ")" }} onClick={() => this.setmediaUrl(img,i)}>
                            {(img.mediaType === "video") && <FeatherIcon icon="play-circle" className="vicon" size="52" />}</div></Col>)}
                    </Row>
                    </Col>
                }
                //for more than 4
                if (this.props.subTaskMedia.length > 4) {
                    var fourMedia=this.props.subTaskMedia.slice(0,4 );
                    return <Col className="outimgcol"><Row>
                        {fourMedia.map((img, i) => <Col className="inimgcol" key={i} md={6}>
                            <div className={"imagediv twosummeryimg "+ (i===3? "seemorediv" : "") }style={{ backgroundImage: "url(" + this.setsubtaskimageurl(img) + ")" }} onClick={() => this.setmediaUrl(img,i)}>
                            {(img.mediaType === "video") && <FeatherIcon icon="play-circle" className="vicon" size="52" />}
                            {i===3&&<Col className="seemoreimg">{this.props.t('SEEMORE')}</Col>}
                            </div>
                            </Col>)}
                    </Row>
                    </Col>
                }
            } else {
                // return <div className="imagediv" style={{ backgroundImage: "url(" + Avatar + ")" }}></div>
                return <div className="imagediv noimagepre"><div className="innerdivimg"><div> <FeatherIcon icon="image" size={45} /> </div>{this.props.t('NO_IMG_PLACED_YET')}</div></div>
            }
        } else {
            return <></>
        }
    }
    //set subtask image urls
    setsubtaskimageurl = (smedia) => {
        var url = "";
        if (smedia.mediaType === FEEDBACK_PHOTO.name) {
            url = smedia.url
        }
        if (smedia.mediaType === FEEDBACK_VIDEO.name) {
            url = smedia.thumbImageurl
        }
        return url;
    }
    //find selected radio fb
    findselectedradio = () => {
        var value = ""
        this.props.FBradioList.forEach(element => {
            if (element.answer) {
                // console.log(element.option);
                value = element.option
            }
        });
        return value
    }
    // #TSK-SUM-CH1
    //addComment 
    addComment = () => {
        this.setState({ disablechatsnedbtn: true }, () => {
            var saveobj = {
                taskAllocationDetailId: this.props.subTask.taskAllocationDetailId,
                comment: this.state.comment
            };
            if (this.state.comment) {
                submitSets(submitCollection.taskaddComment, saveobj, true, null, true).then(resp => {
                    if (resp && resp.status) {
                        alertService.success(this.props.t('COMMENT_ADDED'));
                        this.setState({ comment: "", disablechatsnedbtn: false })
                        this.props.getChatDetails();
                    } else {
                        this.setState({ disablechatsnedbtn: false })
                        // alertService.error((resp && resp.extra ? resp.extra : this.props.t('ERROR_OCCURRED')));
                    }
                });
            } else {
                this.setState({ disablechatsnedbtn: false })
                alertService.error(this.props.t('PLEASE_ADD_COMMENT'))
            }
        })
    }
    // handle type comment 
    handleAddcomentinput = (evt) => {
        if(!preventinputToString(evt,evt.target.value,(this.props.t('Character.Comment_text')))){
            evt.preventDefault();
            return
        }
        this.setState({ comment: evt.target.value })
    }
    closesmodal = () => {
        this.shandleModalToggle(false)
        this.setState({ redoreason: null })
    }
    //close model
    CloseModal = () => {
        this.props.closeModal();
        this.props.closeCChat();
        this.setState({ comment: "", ChatList: [], showsmodal: false, redoreason: null })
    }
    //open chat box
    openChat = () => {
        // this.setState({ chatopen: true });
        this.props.openCChat();
        this.props.getChatDetails();
    }
    //open chat box
    closeChat = () => {
        this.props.closeCChat();
        // this.setState({ chatopen: false });

    }
    //ask to redo button press
    asktoRedo = () => {
        this.shandleModalToggle(true)
    }

    //ontype reson redo
    handletyperesopnredo = (evt) => {
        this.setState({ redoreason: evt.target.value })
    }
    //send redo
    sendRedo = () => {
        if (this.state.redoreason) {
            this.redocall();
        } else {
            alertService.error(this.props.t('EXPLAIN_WHY_REDO_NEED'))
        }
    }
    redocall = () => {
        var redoobj = {
            taskAllocationDetailId: this.props.subTask.taskAllocationDetailId,
            reason: this.state.redoreason,
            taskStatus: "ReDo"
        }
        submitSets(submitCollection.taskredo, redoobj, true, null, true).then(resp => {
            if (resp && resp.status) {
                alertService.success(this.props.t('REDO_ADDED'));
                this.closesmodal();
                this.CloseModal();
                this.props.getTaskSummery();
            } else {
                // alertService.error((resp && resp.extra ? resp.extra : this.props.t('ERROR_OCCURRED')));
            }
        });
    }
    //set set user name in chat
    setchatUserName = (name) => {
        var Dname = "";
        var names = name.split(" ", 2);
        var result = names.map(([v]) => v);
        // console.log(result);
        var fletter=result[0]?result[0]:"";
        var lletter=result[1]?result[1]:"";
        Dname = fletter + lletter
        return Dname
    }
    closemmodal = () => {
        this.setState({
            showmediamodal: false, previewmedia: null,
            prevwmtype: ""
        })
    }
    openemModal = () => {
        this.setState({ showmediamodal: true, })
    }
    //#TSK-SUM-AR1
    //check enable redo btn
    enableAsktoRedo = (subtask) => {
        var enable = false;
        // console.log(this.props.reduxsummery);
        enable = (this.props.reduxsummery.isApprover &&
            !this.props.reduxsummery.isBottomLevel &&
            (subtask.status !== TaskStatusENUM.Pending) &&
            (subtask.status !== TaskStatusENUM.InProgress) &&
            (subtask.status !== TaskStatusENUM.approve) &&
            (this.props.reduxsummery.taskAttendanceLog.length > 0)
        )
        // console.log(enable);
        return enable
    }
    //#TSK-SUM-CD1
    //enable  icannot do button 
    enableIcoannotdo = (subtask) => {
        var enable = false;
        enable = (subtask.isAllocator && (subtask.status === TaskStatusENUM.Pending || subtask.status === TaskStatusENUM.Late || subtask.status === TaskStatusENUM.InProgress))

        return enable
    }
    setRedonestatus = (subtask) => {
        if (subtask.redoAllocationDetailId) {
            // console.log(subtask);
            if (subtask.status === TaskStatusENUM.Done) {
                return <Col><Badge className="redone" pill >  <FeatherIcon style={{ margin: "0px 2px" }} icon="check" size={13} />{this.props.t('REDONE')}</Badge>
                    {subtask.redoReason && <Col className="redoreson">{this.props.t('RESON_FOR_REDO')} {subtask.redoReason}</Col>}
                </Col>
            } else {
                return <Col><Badge className="redone" pill >  <FeatherIcon style={{ margin: "0px 5px" }} icon="rotate-cw" size={13} />{this.props.t('btnnames.redo')} </Badge>
                    {subtask.redoReason && <Col className="redoreson">{this.props.t('RESON_FOR_REDO')} {subtask.redoReason}</Col>}
                </Col>
            }
        }
    }
    // set selected question for questionnaire
    setselectedQuestions = () => {
        var qlist = [];
        var list = JSON.parse(JSON.stringify(this.props.quesionnaireDetails))
        list.forEach(element => {
            var obj = {}
            if (element.isSelected) {
                obj["questionId"] = element.questionId && element.questionId;
                obj["mainRequestedFeedbackType"] = element.mainRequestedFeedbackType;
                obj["mainRequestedFeedbackTypeId"] = element.mainRequestedFeedbackTypeId && element.mainRequestedFeedbackTypeId;
                obj["status"] = TaskStatusENUM.ICanNotDo;
                qlist.push(obj)
            }
        });
        return qlist
    }
    //cannot do call
    cannotDocall = (obj) => {
        this.setState({cannotdoLoad:true},()=>{
            submitSets(submitCollection.markAllocationDetailAsIcant, obj, true, null, true).then(resp => {
                if (resp && resp.status) {
                    alertService.success(this.props.t('MARK_AS_CANNOTDO_SUCCESS'));
                    this.CloseModal();
                    this.props.refreshcall(null, "click");
                    this.setState({cannotdoLoad:false})
                } else {
                    this.setState({cannotdoLoad:false})
                    // alertService.error((resp && resp.extra ? resp.extra : this.props.t('ERROR_OCCURRED')));
                }
            });
        })
        
    }
    // ##TSK-SUM-1
    //cannot do method
    HandleCannotDo = () => {
        var notattended = true
        var sendObj = {
            taskAllocationDetailId: this.props.subTask.taskAllocationDetailId
        }
        if (this.props.isQuestionnaire) {
            // console.log(this.props.subTask);
            var questionnaire = {
                questionnaireId: this.props.subTask.questionnaireId && this.props.subTask.questionnaireId,
                questions: this.setselectedQuestions()
            }
            sendObj["questionnaireStatusChangeDto"] = questionnaire
            sendObj["isQuestionnaire"] = true
        } else {
            sendObj["isQuestionnaire"] = false
            sendObj["taskStatus"] = TaskStatusENUM.ICanNotDo
        }
        if (this.props.isQuestionnaire) {
            if (sendObj.questionnaireStatusChangeDto.questions.length > 0) {
                var isbranch = false
                //check if branch available validation
                for (let x = 0; x < sendObj.questionnaireStatusChangeDto.questions.length; x++) {
                    const question = sendObj.questionnaireStatusChangeDto.questions[x];
                    if (question.mainRequestedFeedbackType === FEEDBACK_BRANCH.name) {
                        isbranch = true
                        break
                    }
                }
                //if branch is on question list entire pending questions will be cannot do
                if (isbranch) {
                    confirmAlert({
                        title: this.props.t('SURETO_CONTINUE'),
                        message: this.props.t('CONFIRM_BRANCH_THE_ALL_CANNOTDO'),
                        overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                        buttons: [{
                            label: this.props.t('btnnames.yes'),
                            onClick: () => {
                                this.cannotDocall(sendObj);
                            }
                        }, {
                            label: this.props.t('btnnames.no'),
                            onClick: () => {
                                return false;
                            }
                        }]
                    });
                } else {
                    this.cannotDocall(sendObj);
                }

            } else {
                for (let i = 0; i < this.props.subTask.questionnaireCompletionDetails.length; i++) {
                    const quest = this.props.subTask.questionnaireCompletionDetails[i];
                    if (quest.questionCompletionStatus === TaskStatusENUM.Done) {
                        notattended = false
                        break
                    }
                }
                //check is any question attend
                if (notattended) {
                    confirmAlert({
                        title: this.props.t('CONFIRM_ALL_QUESTIONS'),
                        message: this.props.t('CONFIRM_ALL_QUESTIONS_MESSAGE'),
                        overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                        buttons: [{
                            label: this.props.t('btnnames.yes'),
                            onClick: () => {
                                this.cannotDocall(sendObj);
                            }
                        }, {
                            label: this.props.t('btnnames.no'),
                            onClick: () => {
                                return false;
                            }
                        }]
                    });

                } else {
                    alertService.warn(this.props.t("SELECT_QUESTION"))
                }

            }
        } else {
            //if normal question mark as cannot do
            confirmAlert({
                title: this.props.t('SURETO_CONTINUE'),
                message: this.props.t('MARKAS_CANNOT_DO'),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        this.cannotDocall(sendObj);
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {
                        return false;
                    }
                }]
            });
           
        }
    }
    render() {
        return (
            <Col>
             {(this.state.showmediamodal) && (
          <div className="lightboximagesummry">
            <ReactImageVideoLightbox
            data={this.state.data}
            startIndex={this.state.mediaStartIndex}
            showResourceCount={true}
            onCloseCallback={() => this.closemmodal()}
          />
          </div>
        )}
                {/* <Imagepreview previewmedia={this.state.previewmedia} openemModal={this.openemModal}
                    prevwmtype={this.state.prevwmtype} showmediamodal={this.state.showmediamodal} closemmodal={this.closemmodal} media={this.props.mideaAvailable} /> */}
                <Modal className={"SummeryModal " + (this.props.isRTL === "rtl" ? "RTL" : "")} dir={this.props.isRTL} backdrop="static" keyboard={false}
                    size="md"
                    show={this.props.showmodal} onHide={this.CloseModal}

                    aria-labelledby="example-modal-sizes-title-lg"
                >
                    <Modal.Header className="modalheader" closeButton>
                        <Modal.Title id="example-modal-sizes-title-lg">
                            <TooltipWrapper text={this.props.subTask?this.props.subTask.userName:""}>
                                <h3 className="massname">{this.props.subTask && this.props.subTask.userName}</h3>
                            </TooltipWrapper>
                        </Modal.Title>
                    </Modal.Header>
                    {this.props.loading ? <Modal.Body>
                        <div className="tsummeryloadingbox"><Image src={Loading} /></div>
                    </Modal.Body> :
                        <Modal.Body>
                            {(this.props.quesionnaireDetails && this.props.quesionnaireDetails.length === 0) && this.subtaskimage()}
                            <Col className="mbdy">
                                <Col className="finalebar ">
                                    {this.props.subTask && <Row>
                                        <Col md={4} className="txt"> <span className="dot" style={SummerystatusColors("dot", this.props.subTask.status)}></span><span><b>{SummeryStatusName(this.props.subTask.status)} | {convertDatetoTimeHM24(this.props.subTask.startTime)}</b></span></Col>
                                        <Col md={8}> 
                                        <span ><b>{this.props.subTask.userRoll}  |</b> {this.setworkplace(this.props.subTask)}</span>
                                    
                                        </Col>
                                        <Col md={6}>
                                        {this.props.subTask.isFileUploading && <Badge className="fileuploadbdg summeryfu">{this.props.t("FILE_UPLOADING")}</Badge>}
                                        </Col>
                                    </Row>}
                                </Col>
                                {this.props.subTask && this.setRedonestatus(this.props.subTask)}
                                <Col className="checkset">
                                    <QuestionnaireResults  handlequestionselection={this.props.handlequestionselection} quesionnaireDetails={this.props.quesionnaireDetails} subTask={this.props.subTask}  enableIcoannotdo={this.enableIcoannotdo} />
                                    {/* if count */}
                                    {this.props.countedNo &&
                                        <div className="fbNumber">{this.props.countedNo} <span>{this.props.t("COUNTED")}</span></div>
                                    }
                                    {/* ifradio list */}
                                    {this.props.FBradioList && <Col>
                                        <Col className="SCDIV">{this.props.t("SELECTED_CHOICE")} <b>{this.findselectedradio()}</b></Col>
                                        <Col className="rowset"><Row>
                                            {this.props.FBradioList.map((list, k) => <Col className="radiooutcol" md={4} key={k}> <Col className={"radiofb "}>
                                                <Form.Check disabled type="radio" aria-label="radio 1" defaultChecked={list.answer} />
                                                <span className={(list.answer ? "selectedcheck" : "")}>{list.option}</span></Col></Col>
                                            )}
                                        </Row></Col>
                                    </Col>
                                    }
                                    {/* if checklist */}
                                    {this.props.FBCheckList && <Col>
                                        <Col className="rowset"><Row>
                                            {this.props.FBCheckList.map((list, k) => <Col className="radiooutcol" md={4} key={k}> <Col className={"radiofb "}>
                                                <Form.Check type="checkbox" aria-label="radio 1" defaultChecked={list.answer} disabled />
                                                <span
                                                // className={(list.answer ? "selectedcheck" : "")}
                                                >{list.option}</span></Col></Col>
                                            )}
                                        </Row></Col>
                                    </Col>
                                    }
                                    {/* if text */}
                                    {this.props.FBText && <Col className="answer">{this.props.t('ANSWER')} <b>{this.props.FBText}</b>
                                    </Col>}
                                </Col>
                                {this.props.subTask && this.props.subTask.userCanChat && <Col className="commnt">
                                    <Form.Control type="email" placeholder={this.props.t('ADD_COMMENT')} value={this.state.comment} size="sm" onChange={(e) => this.handleAddcomentinput(e)} />
                                    <Button disabled={this.state.disablechatsnedbtn} onClick={() => this.addComment()}>{Icons.SendLTR("#FFFFFF")}</Button>
                                </Col>}
                                {/* chat */}
                                {this.props.chatopen && <Col className="chatbox">
                                    {this.props.chatload && <Col className="loadchat"><Image src={Loading} /></Col>}
                                    {(this.props.ChatList.length > 0) ? this.props.ChatList.map((chat, c) => <Col className="mainchatcol" key={c} >

                                        <Col className={"chatdetails " + (chat.isMe ? "isme" : "")}><span className={"chatowner " + (chat.isMe ? "ismeChatwner" : "isotherChatwner")}>{this.setchatUserName(chat.userFullname)}</span>

                                            <span className={"chatspan " + (chat.isMe ? "mechat" : "")}>{chat.comment}</span>  <span className="time">{convertDatetoTimeHM24(chat.commentDatetime)}</span></Col>
                                    </Col>)
                                        : <Col>{this.props.chatload ? <></> : this.props.t('NO_CHAT_RESULTS')}</Col>}
                                </Col>}
                                <Col className="lastbtns">
                                    {(!this.props.chatopen && !this.props.loading) && <Button className="Pnkfontbtn" onClick={() => this.openChat()}>{this.props.t('OPEN_CHAT')}</Button>}
                                    {this.props.chatopen && <Button className="Pnkfontbtn" onClick={() => this.closeChat()}>{this.props.t('CLOSE_CHAT')}</Button>}

                                    {(this.props.subTask && this.enableIcoannotdo(this.props.subTask)) && <Button disabled={this.state.cannotdoLoad} className="Pnkbttn" onClick={() => this.HandleCannotDo()}>{this.props.t("CANNOT_Do")}</Button>}

                                    {(this.props.subTask && (this.enableAsktoRedo(this.props.subTask))) && <Button className="Pnkbttn" onClick={() => this.asktoRedo()}>{this.props.t("ASKTO_REDO")}</Button>}
                                </Col>
                            </Col>
                            {/* <Imagepreview showmediamodal={this.state.showmediamodal} closemmodal={this.closemmodal} /> */}
                            <Modal className={"redomodal " + (this.props.isRTL === "rtl" ? "RTL" : "")} dir={this.props.isRTL} backdrop="static" keyboard={false}
                                size="sm"
                                show={this.state.showsmodal}

                                aria-labelledby="example-modal-sizes-title-lg"
                            >
                                <Col classname="rmbody">
                                    <Col className="heading">
                                        <Col>{this.props.t('ADD_RES_TO_REDO')}</Col>
                                        <Col className="redoinput">  <Form.Control type="text" placeholder={this.props.t('EXPLAIN_WHY_REDO_NEED')} value={this.state.redoreason ? this.state.redoreason : ""} onChange={(e) => this.handletyperesopnredo(e)} size="sm" /></Col>
                                        <Button className="Pnkbttn canclebtn" onClick={() => this.closesmodal()}>{this.props.t('CANCEL')}</Button>
                                        <Button className=" Pnkbttn sndRedo" onClick={() => this.sendRedo()}>{this.props.t('SENDREDO_REQ')}</Button>
                                    </Col>

                                </Col>
                            </Modal>
                            
                        </Modal.Body>
                    }
                     {this.state.cannotdoLoad&&<Col className='disablediv-forsutaskmodal'></Col>}
                </Modal>
               
                <AcViewModal showmodal={this.state.cannotdoLoad} message={this.props.t('PLEASE_WAIT')} />



            </Col>

        )
    }
}


export default withTranslation()(withRouter(SummeryDetails));