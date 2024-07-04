import { XIcon } from '@primer/octicons-react';
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { Modal, Col, Form, Row, Dropdown, ButtonGroup, Button, Badge,OverlayTrigger,Tooltip } from 'react-bootstrap'
import FeatherIcon from 'feather-icons-react';
import { FEEDBACK_PHOTO, FEEDBACK_VIDEO, RepeatType, Months, FEEDBACK_CHECKBOXES, FEEDBACK_RADIO, FEEDBACK_NUMBER, FEEDBACK_TEXT, FEEDBACK_QR, TaskPriorityENUM } from '../../../enums/taskfeedEnums';
import { convertDate, preventinputToString, timetotimeHM, usrLevels, usrRoles } from '../../../_services/common.service'
import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import Feedbacktask from './comps/feedbacktask'
import TaskIsFor from './comps/TaskIsFor/taskIsFor';
import TaskApprover from './comps/TaskApprover/taskApprover';
import TaskSheduling from './comps/taskSheduling';
import "./newtask.css"
import { alertService } from '../../../_services/alert.service';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { viewTaskSetAction } from '../../../actions/taskFeed/task_action';
import CreatableSelect from 'react-select/creatable';
import { v4 as uuidv4 } from 'uuid';
import { AcViewModal } from '../../UiComponents/AcImports';
// import { colourOptions } from '../data';

export class NewTask extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            isfromsearchkey: false,
            loadquestionnaire: false,
            questionnairepstratindex: 0,
            questionnairepmaxresult: 10,
            questionnaireStatus: '',
            EditsaveQuestionnaire: '',
            serchkeychange: false,
            Questionnairesearkkey: '',
            Questionniarequestion: '',
            isRedirectQuesionear: false,
            QuestionniareList: [],
            isQuestionnaire: false,
            saveupdatebtndisabel: false,
            filterboxopen: false,
            filterboxopenapprover: false,
            existinggroups: [],
            groupIds: [],
            errors: {
                taskName: '',
                description: '',
                WITfor: '',
                Tapprover: '',
                repeattype: '',
                onceDate: '',
                endTime: '',
                startTime: '',
                whichWeek: '',
                WeekendTime: '',
                WeekstartTime: '',
                WeekuntilDate: '',
                yearDate: '',
                YearendTime: '',
                YearuntilDate: '',
                YearstartTime: '',
                MonthwichWeek: '',
                MonthDay: '',
                MonthuntilDate: '',
                MonthEndTime: '',
                MonthstartTime: '',
                fillFeedBack: '',
                allFieldFeedback: '',
                listempty: '',
                listitemempty: '',
            },
            isuseCam: false,
            iscatTimeout: false,
            catName: "",
            istaskAttended: false,
            level: null,
            apprvlevel: null,
            isFutreTask: false,
            isedit: false,
            feedbackOptions: [],
            categoryList: [], categoryselect: -1,
            // regionList: this.props.regionList,
            storeList: this.props.storeList,
            workerList: this.props.workerList,
            isUrgent: false,
            sobj: {
                taskCategory: [],
                taskApproversDtoList: [],
                taskAllocationDtoList: [],
                requestedFeedbackDto: [],
                description: "",
                title: "",
                taskRepeatDetails: {
                    // repeatType: "weekly",
                    taskRepeatListDto: [],
                    isTimeFrameTask: false
                },
            },
            selectedFBtype: "",
            checkList: [],
            selectedFBMedia: [],
            savecategoryLsit: [],
            approverList: [],
            startTime: '',
            endTime: '',
            yearlyDate: "",
            oncedate: "",
            mediaFeedbackTypes: [
                {...FEEDBACK_PHOTO,selected: false,icon: "image",vname: this.props.t('PICTURE'),isNew: false,isDelete: false,requestedFeedbackId: -1},
                {...FEEDBACK_VIDEO,selected: false,icon: "video",vname: this.props.t('VIDEO'),isNew: true,isDelete: false,requestedFeedbackId: -1},
                // {...FEEDBACK_QR, selected: false, icon: "grid", vname: "QR",isNew: false,isDelete: false,requestedFeedbackId: -1},
            ],
            isUpdated: false,
        }
    }
    componentDidMount() {
        this._isMounted = true;
        // var cisedit = (this.props.taskFeedState && this.props.taskFeedState.taskDetails ? true : false);
        if (this._isMounted) {
            // this.loadCategories();
        }
    }
    //not use to app now getAllocationLevel
    getAllocationLevel = () => {
        var allocations = this.state.sobj.taskAllocationDtoList
        var level = null
        allocations.forEach(allocator => {
            allocator.taskAllcationDetailDto.forEach(reciever => {
                if (!reciever.isDelete) { //console.log(reciever);
                    if (reciever.systemMainRoleType === "Region_Manager") {
                        level = "Region"
                    } else if (reciever.systemMainRoleType === "Store_Manager") {
                        level = "Store"
                    } else {
                        level = "Worker"
                    }
                }
            });
        });
        this.setState({ level: level })
    }
    //this not use in app - getApproverLevel
    getApproverLevel = () => {
        var approvers = this.state.sobj.taskApproversDtoList
        var level = null
        approvers.forEach(approver => {
            if (!approver.isDelete) {
                if (approver.approverRole === "Region_Manager") {
                    level = "Region"
                } else if (approver.approverRole === "Store_Manager") {
                    level = "Store"
                } else {
                    level = "Worker"
                }
            }
        });
        this.setState({ apprvlevel: level })
    }
    // clean all states
    cleansaveobj = () => {
        this.props.clearisattend();
        var nsobj = {
            taskCategory: [],
            taskApproversDtoList: [],
            taskAllocationDtoList: [],
            requestedFeedbackDto: [],
            description: "",
            title: "",
            taskRepeatDetails: {
                taskRepeatListDto: [],
                isTimeFrameTask: false
            },
        }
        this.setState({
            isfromsearchkey: false,
            loadquestionnaire: false,
            questionnairepstratindex: 0,
            questionnaireStatus: '',
            EditsaveQuestionnaire: '',
            QuestionniareList: [],
            serchkeychange: false,
            Questionnairesearkkey: '',
            Questionniarequestion: '',
            isQuestionnaire: false,
            isRedirectQuesionear: false,
            existinggroups: [],
            groupIds: [],
            errors: {
                taskName: '',
                description: '',
                WITfor: '',
                Tapprover: ''
            },
            istaskAttended: false,
            apprvlevel: null,
            level: null,
            sobj: nsobj,
            isUrgent: false,
            isuseCam: false,
            oncedate: "",
            isFutreTask: false,
            isedit: false,
            feedbackOptions: [],
            categoryselect: -1,
            selectedFBtype: "",
            checkList: [],
            selectedFBMedia: [],
            savecategoryLsit: [],
            approverList: [],
            startTime: '',
            endTime: '',
            yearlyDate: "",
            mediaFeedbackTypes: [
                {...FEEDBACK_PHOTO,selected: false,icon: "image",vname: this.props.t('PICTURE'),isNew: false,isDelete: false,requestedFeedbackId: -1 },
                {...FEEDBACK_VIDEO,selected: false,icon: "video",vname: this.props.t('VIDEO'),isNew: false,isDelete: false,requestedFeedbackId: -1},
                // {...FEEDBACK_QR,selected: false,icon: "grid",vname: "QR",isNew: false,isDelete: false,requestedFeedbackId: -1},
            ],
            isUpdated: false,
        })
    }
    //Search Questionnaire in edit/create task
    QuestionnaireSearch = (value) => {
        if (this.timeout) {
            clearTimeout(this.timeout)
        };
        this.setState({ Questionnairesearkkey: value }, () => {
            this.timeout = setTimeout(() => {
                this.setState({ serchkeychange: true, isfromsearchkey: true, questionnairepstratindex: 0, QuestionniareList: [] }, () => {
                    this.getQuestionnaireList();
                })
            }, 300);
        })
    }
    //set quesionnaire list by push to array
    setQuestionnairelistdata = (res) => {
        var list = (!this.state.isfromsearchkey ? this.state.QuestionniareList : []);
        var newlist = list.concat(res.extra);
        this.setState({ QuestionniareList: newlist });
    }
    //go back_call when scroll to bottom
    pagescrollcall = () => {
        if (!this.state.loadquestionnaire) {
            var startindex = this.state.questionnairepstratindex + this.state.questionnairepmaxresult
            this.setState({ questionnairepstratindex: startindex, isfromsearchkey: false }, () => {
                this.getQuestionnaireList();
            })
        }
    }
    //get questionaire List bcak call
    getQuestionnaireList = () => {
        this.setState({ loadquestionnaire: true }, () => {
            var catobj = {
                "questionnaireId": ((!this.state.serchkeychange && this.state.isedit) || this.state.isRedirectQuesionear) ? this.state.Questionniarequestion : "",
                "searchName": this.state.Questionnairesearkkey,
                "isReqPagination": true,
                "startIndex": this.state.questionnairepstratindex,
                "maxResult": this.state.questionnairepmaxresult,
            }
            submitSets(submitCollection.getuestionnaire, catobj).then(res => {
                if (res) {
                    this.setState({ loadquestionnaire: false });
                    this.setQuestionnairelistdata(res);

                } else {
                    this.setState({ loadquestionnaire: false });
                }
            })
        });
    }
    //select feed back type 
    changeselectedFBtype = (value) => {
        //disable in edit
        if (!this.state.isedit) {
            this.setState({ selectedFBtype: value }, () => {
                var same = this.state.sobj.requestedFeedbackDto.find(l => l.feedbackTypeId === this.state.selectedFBtype.id);
                this.setState({ checkList: same ? same.requestedFeedbackOption : [] });
                this.validateField("fillFeedBack", value);
            })
        }
    }
    // Handle Feedback Media
    changeselectedFBmedia = (value) => {
        //disable in edit
        if (!this.state.isedit) {
            var csobj = this.state.mediaFeedbackTypes
            csobj.forEach(mediaFeedbackType => {
                if (value.id === mediaFeedbackType.id) {
                    mediaFeedbackType.selected = !mediaFeedbackType.selected
                }
            });
            this.setState({ mediaFeedbackTypes: csobj, isUpdated: true });
        }
    }
    // Load Categories List by typied value
    loadCategories = () => {
        var catobj = {
            "categoryName": this.state.catName,
            "isReqPagination": true,
            "startIndex": 0,
            "maxResult": 5
        }
        submitSets(submitCollection.getCatogories, catobj).then(res => {
            if (res) {
                var catlist = res.extra;
                for (let i = 0; i < catlist.length; i++) {
                    const element = catlist[i];
                    element["label"] = element.categoryName;
                    element["value"] = element.categoryName
                }
                this.setState({ categoryList: catlist, iscatTimeout: false });
            }
        })
    }

    handleIsUpdated = () => {
        this.setState({isUpdated: true});
      }

    // handle typing in Decribe & Task Name
    onTyping = (evt, type,msg) => {
        var csobj = this.state.sobj;
        if(!preventinputToString(evt,evt.target.value,msg)){
            evt.preventDefault();
            return
        }
        csobj[type] = evt.target.value;
        this.setState({ sobj: csobj, isUpdated: true })
    }
    //new created catogory
    handleNewCategory = () => {
        var csobj = JSON.parse(JSON.stringify(this.state.sobj));
        var createdcat = {
            isNew: true,
            categoryId: -1,
            categoryName: this.state.catName,
            isDelete: false,
            categoryFUId: uuidv4()
        }
        csobj.taskCategory.push(createdcat)
        this.setState({ sobj: csobj });
    }
    handleCategory = (id) => {
        var newobj = this.state.categoryList.find(x => x.categoryId === parseInt(id))
        var csobj = this.state.sobj;
        //find that category already added
        var isnotadded = (csobj.taskCategory ? csobj.taskCategory.findIndex(x => x.categoryId === parseInt(id)) : -1);
        if (isnotadded === -1) {
            newobj["isNew"] = true;
            csobj.taskCategory.push(newobj)
            this.setState({ sobj: csobj })
        } else {
            var selected = csobj.taskCategory.find(x => x.categoryId === parseInt(id));
            var exist = csobj.taskCategory.filter(x => x.categoryId !== parseInt(id));
            if (selected.taskHasCategoryId && selected.isDelete) {
                selected["isDelete"] = false
                exist.push(selected);
                csobj.taskCategory = exist
                this.setState({ sobj: csobj })
            } else {
                alertService.warn("already added")
            }
        }
    }
    // not use in code -selectiontypeHandle
    selectiontypeHandle = (evt, type, main) => {
        var csobj = this.state.sobj;
        if (main === "approver") {
            var approverobj = csobj.taskApproversDtoList[0];
            approverobj["taskApproverType"] = type;
            csobj.taskApproversDtoList[0] = approverobj;
        }
        if (main === "allocator") {
            var allocatorobj = csobj.taskAllocationDtoList[0];
            allocatorobj["taskAllocationType"] = type;
            csobj.taskAllocationDtoList[0] = allocatorobj;
        }
        this.setState({ sobj: csobj })
    }
    //handle repeat task in sheduling
    handleRepeat = (obj, type) => {
        // this.state.isFutreTask = true;
        var csobj = this.state.sobj;
        csobj[type] = obj;
        this.setState({ sobj: csobj, isFutreTask: true })
    }
    // hadne check list feedbacks
    handlechecklist = (clist) => {
        this.setState({ checkList: clist })
    }
    //remove category handle
    removecategory = (id, uuid) => {
        if (id > 0) {
            var csobj = this.state.sobj;
            var list = csobj.taskCategory;
            var changeobj = list.find(x => x.categoryId === id);
            var remainlist = list.filter(x => x.categoryId !== id);
            var existindb = changeobj.taskHasCategoryId ? true : false
            if (existindb) {
                changeobj["isDelete"] = true
                remainlist.push(changeobj)
                // remainlist
            } else {
            }
            csobj["taskCategory"] = remainlist
            this.setState({ sobj: csobj, isUpdated: true })
        } else {
            var ccsobj = this.state.sobj;
            var blist = ccsobj.taskCategory;
            var haveobj = blist.find(x => x.categoryFUId === uuid);
            var remainblist = blist.filter(x => x.categoryFUId !== uuid);
            if (haveobj) {
                ccsobj["taskCategory"] = remainblist
                this.setState({ sobj: ccsobj, isUpdated: true })
            }
        }
    }
    // remove users from lable sets: 
    removeUser = (obj) => {
        var csobj = this.state.sobj;
        var approverlist = this.state.sobj.taskApproversDtoList;
        var alredyexist = approverlist.find(x => x.approverUuid === obj.approverUuid);
        var exist
        if (alredyexist.isNew) {
            exist = approverlist.filter(x => x.approverUuid !== obj.approverUuid);
            csobj["taskApproversDtoList"] = exist;
        } else {
            if (alredyexist.isDelete) {
                // alredyexist.isDelete = false
            } else {
                alredyexist.isDelete = true
            }
        }
        this.setState({ sobj: csobj, isUpdated: true })
    }
    // Handle approvers Selection
    handleApproverList = (obj) => {
        var csobj = this.state.sobj;
        var approverlist = this.state.sobj.taskApproversDtoList;
        var alredyexist = approverlist.find(x => x.approverUuid === obj.userUUID);
        var exist
        if (alredyexist) {
            if (alredyexist.isNew) {
                exist = approverlist.filter(x => x.approverUuid !== obj.userUUID);
                csobj["taskApproversDtoList"] = exist;
            } else {
                if (alredyexist.isDelete) {
                    alredyexist.isDelete = false
                } else {
                    alredyexist.isDelete = true
                }
            }
        } else 
        {
            var viewName = ""
            if (obj.systemMainRoleType === usrRoles.RM) {
                viewName = obj.regionName ? obj.regionName : obj.userFirstName + " " + obj.userLastName
            } else if (obj.systemMainRoleType === usrRoles.SM) {
                viewName = obj.storeName ? obj.storeName : obj.userFirstName + " " + obj.userLastName
            } else {
                viewName = obj.userFirstName + " " + obj.userLastName
            }
            var newobj = {};
            //setting user rolll object for approver validation
            var userRolls = {
                rollUUID: obj.rollUUID,
                userLevel: obj.roleUserLevel,
                systemMainRoleType: obj.systemMainRoleType,
                regionUUID: obj.regionUUID ? obj.regionUUID : undefined,
                storeUUID: obj.storeUUID ? obj.storeUUID : undefined,
            }
            var userDto = { userRolls: userRolls }
            newobj["approverUuid"] = obj.userUUID;
            newobj["approverRole"] = obj.systemMainRoleType;
            newobj["viewName"] = viewName;
            newobj["isNew"] = true;
            newobj["userDto"] = userDto
            approverlist.push(newobj);
        }
        this.setState({ sobj: csobj, isUpdated: true }, () => {
            this.getApproverLevel();
        })
    }
    //handle allocations(task is for)
    handleAllocation = (obj, type, isclear, arraylist) => {
        var csobj = this.state.sobj;
        var allocation = this.state.sobj.taskAllocationDtoList;
        if (type === "obj") {
            var exist = undefined;
            var add = true;
            //check already added to alloc
            for (let j = 0; j < allocation.length; j++) {
                const element = allocation[j];
                exist = element.taskAllcationDetailDto.find(g => g.reciverUuid === obj.userUUID);
                if (exist) { 
                    //if true remove from list - for uncheck
                    if (exist.isNew) {
                        allocation.splice(j, 1)
                    } else {
                        if (element.isDelete) {
                            element.isDelete = false;
                        } else {
                            element.isDelete = true;
                        }
                        if (exist.isDelete) {
                            exist.isDelete = false;
                        } else 
                        { exist.isDelete = true }
                    }
                    add = false;
                    break;
                }
            }
            if (add) {
                var xobj = this.state.sobj;
                xobj["taskAllocationDtoList"] = this.newPushToAllocations(allocation, obj);
                this.setState({ sobj: xobj })
            }
        } else 
        if (type === "array") {
            //remove already added once
            var newalloclist = [];
            for (let k = 0; k < allocation.length; k++) {
                const element2 = allocation[k];
                exist = element2.taskAllcationDetailDto.filter(g => g.systemMainRoleType !== obj.systemMainRoleType);
                if (exist && exist.length > 0) {
                    element2.taskAllcationDetailDto = exist;
                    newalloclist.push(element2);
                }
            }
            if (!isclear) {
                for (let l = 0; l < arraylist.length; l++) {
                    const singlerole = arraylist[l];
                    newalloclist = this.newPushToAllocations(newalloclist, singlerole);
                }
            }
            var bobj = this.state.sobj;
            bobj["taskAllocationDtoList"] = newalloclist;
            this.setState({ sobj: bobj })
        }
        this.setState({ sobj: csobj, isUpdated: true }, () => {
        });
    }
    //select none approvewrs
    approveSNone = () => {
        if (this.state.sobj.taskApproversDtoList && this.state.sobj.taskApproversDtoList.length > 0) {
            var approvers = this.state.sobj.taskApproversDtoList
            var newlist = []
            for (let i = 0; i < approvers.length; i++) {
                const approver = approvers[i];
                if (!approver.isNew) {
                    approver.isDelete = true
                    // console.log("not new");
                    newlist.push(approver)
                }
            }
            var bobj = this.state.sobj;
            bobj["taskApproversDtoList"] = newlist;
            this.setState({ sobj: bobj, isUpdated: true, apprvlevel: null }, () => {
                //  console.log(this.state.sobj);
            })
        }
    }
    //select all  approvers
    selectAllApprovers = (type) => {
        var allocationexlist = this.state.sobj.taskApproversDtoList;
        var markinglist = [];
        if (type === "region") {
            markinglist = this.props.regionList
        }
        if (type === "store") {
            markinglist = this.props.storeList
        }
        if (type === "worker") {
            markinglist = this.props.workerList
        }
        var exist
        markinglist.forEach(fulllistitem => {
            exist = false
            for (let i = 0; i < allocationexlist.length; i++) {
                const recvr = allocationexlist[i];
                if (fulllistitem.userUUID === recvr.approverUuid) {
                    if (recvr.isDelete) {
                        recvr.isDelete = false
                        allocationexlist.isDelete = false;
                    }
                    exist = true
                    break;
                }
            }
            if (!exist) {
                //setting user rolll object for approver validation
                var userRolls = {
                    rollUUID: fulllistitem.rollUUID,
                    userLevel: fulllistitem.roleUserLevel,
                    systemMainRoleType: fulllistitem.systemMainRoleType,
                    regionUUID: fulllistitem.regionUUID ? fulllistitem.regionUUID : undefined,
                    storeUUID: fulllistitem.storeUUID ? fulllistitem.storeUUID : undefined,
                }
                var userDto = { userRolls: userRolls }
                var dto = {
                    viewName: (type==="region")?fulllistitem.regionName:(type==="store")?fulllistitem.storeName: fulllistitem.userFirstName + " " + fulllistitem.userLastName,
                    approverUuid: fulllistitem.userUUID,
                    approverRole: fulllistitem.systemMainRoleType,
                    isNew: true,
                    userDto: userDto
                }
                allocationexlist.push(dto)
            }
        });
        var bobj = this.state.sobj;
        bobj["taskApproversDtoList"] = allocationexlist;
        this.setState({ sobj: bobj, isUpdated: true }, () => {
        })
        this.getApproverLevel()
    }
    //select none task is for
    taskisforAllNone = () => {
        if (this.state.sobj.taskAllocationDtoList && this.state.sobj.taskAllocationDtoList.length > 0) {
            var recivers = this.state.sobj.taskAllocationDtoList
            var newlist = []
            for (let i = 0; i < recivers.length; i++) {
                const reciver = recivers[i].taskAllcationDetailDto;
                if (!reciver[0].isNew) {
                    reciver[0].isDelete = true
                    recivers[i].isDelete = true
                    newlist.push(recivers[i])
                }
            }
            var bobj = this.state.sobj;
            bobj["taskAllocationDtoList"] = newlist;
            this.setState({ sobj: bobj, level: null, isUpdated: true }, () => {
            })
        }
    }
    //select all 
    selectAll = (type) => {
        var allocationexlist = this.state.sobj.taskAllocationDtoList;
        if (type === "region") {
            var exist
            this.props.regionList.forEach(fulllistitem => {
                exist = false
                loop:
                for (let k = 0; k < allocationexlist.length; k++) {
                    const element2 = allocationexlist[k];
                    for (let i = 0; i < element2.taskAllcationDetailDto.length; i++) {
                        const recvr = element2.taskAllcationDetailDto[i];
                        if (fulllistitem.userUUID === recvr.reciverUuid) {
                            if (recvr.isDelete) {
                                recvr.isDelete = false
                                element2.isDelete = false;
                            }
                            exist = true
                            break loop;
                        }
                    }
                }
                if (!exist) {
                    //setting user rolll object for approver validation
                    var userRolls = {
                        chieldsUserRoles: fulllistitem.chieldsUserRoles,
                        parentUserRoles: fulllistitem.parentUserRoles,
                        systemMainRoleType: fulllistitem.systemMainRoleType,
                        userLevel: fulllistitem.roleUserLevel,
                        storeUUID: fulllistitem.storeUUID ? fulllistitem.storeUUID : undefined,
                        regionUUID: fulllistitem.regionUUID ? fulllistitem.regionUUID : undefined,
                    }
                    var dto = {
                        viewName: fulllistitem.regionName,
                        reciverUuid: fulllistitem.userUUID,
                        systemMainRoleType: fulllistitem.systemMainRoleType,
                        isNew: true,
                        userDto: { userRolls: userRolls }
                    }
                    var newalldto = {
                        allocatorUuid: this.props.signedobj.signinDetails.userUUID,
                        reciverRole: fulllistitem.systemMainRoleType,
                        isNew: true,
                        taskAllocationType: "custom",
                        taskAllcationDetailDto: [dto]
                    }
                    allocationexlist.push(newalldto)
                }
            });
            var bobj = this.state.sobj;
            bobj["taskAllocationDtoList"] = allocationexlist;
            this.setState({ sobj: bobj, isUpdated: true })
        }
        //store
        if (type === "store") {
            var existstore
            this.props.storeList.forEach(fulllistitem => {
                existstore = false
                loop:
                for (let k = 0; k < allocationexlist.length; k++) {
                    const element2 = allocationexlist[k];
                    for (let i = 0; i < element2.taskAllcationDetailDto.length; i++) {
                        const recvr = element2.taskAllcationDetailDto[i];
                        if (fulllistitem.userUUID === recvr.reciverUuid) {
                            if (recvr.isDelete) {
                                recvr.isDelete = false
                                element2.isDelete = false;
                            }
                            existstore = true
                            break loop;
                        }
                    }
                }
                if (!existstore) {
                    //setting user rolll object for approver validation
                    var userRolls = {
                        chieldsUserRoles: fulllistitem.chieldsUserRoles,
                        parentUserRoles: fulllistitem.parentUserRoles,
                        systemMainRoleType: fulllistitem.systemMainRoleType,
                        userLevel: fulllistitem.roleUserLevel,
                        storeUUID: fulllistitem.storeUUID ? fulllistitem.storeUUID : undefined,
                        regionUUID: fulllistitem.regionUUID ? fulllistitem.regionUUID : undefined,
                    }
                    var dto = {
                        viewName: fulllistitem.storeName,
                        reciverUuid: fulllistitem.userUUID,
                        systemMainRoleType: fulllistitem.systemMainRoleType,
                        isNew: true,
                        userDto: { userRolls: userRolls }
                    }
                    var newalldto = {
                        allocatorUuid: this.props.signedobj.signinDetails.userUUID,
                        reciverRole: fulllistitem.systemMainRoleType,
                        isNew: true,
                        taskAllocationType: "custom",
                        taskAllcationDetailDto: [dto]
                    }
                    allocationexlist.push(newalldto)
                }
            });
            var sbobj = this.state.sobj;
            sbobj["taskAllocationDtoList"] = allocationexlist;
            this.setState({ sobj: sbobj, isUpdated: true })
        }
        //employee
        if (type === "worker") {
            var existstore2
            this.props.workerList.forEach(fulllistitem => {
                existstore2 = false
                loop:
                for (let k = 0; k < allocationexlist.length; k++) {
                    const element2 = allocationexlist[k];
                    for (let i = 0; i < element2.taskAllcationDetailDto.length; i++) {
                        const recvr = element2.taskAllcationDetailDto[i];
                        if (fulllistitem.userUUID === recvr.reciverUuid) {
                            if (recvr.isDelete) {
                                recvr.isDelete = false
                                element2.isDelete = false;
                            }
                            existstore2 = true
                            break loop;
                        }
                    }
                }
                if (!existstore2) {
                    //setting user rolll object for approver validation
                    var userRolls = {
                        chieldsUserRoles: fulllistitem.chieldsUserRoles,
                        parentUserRoles: fulllistitem.parentUserRoles,
                        systemMainRoleType: fulllistitem.systemMainRoleType,
                        userLevel: fulllistitem.roleUserLevel,
                        storeUUID: fulllistitem.storeUUID ? fulllistitem.storeUUID : undefined,
                        regionUUID: fulllistitem.regionUUID ? fulllistitem.regionUUID : undefined,
                    }
                    var dto = {
                        viewName: fulllistitem.userFirstName + " " + fulllistitem.userLastName,
                        reciverUuid: fulllistitem.userUUID,
                        systemMainRoleType: fulllistitem.systemMainRoleType,
                        isNew: true,
                        userDto: { userRolls: userRolls }
                    }
                    var newalldto = {
                        allocatorUuid: this.props.signedobj.signinDetails.userUUID,
                        reciverRole: fulllistitem.systemMainRoleType,
                        isNew: true,
                        taskAllocationType: "custom",
                        taskAllcationDetailDto: [dto]
                    }
                    allocationexlist.push(newalldto)
                }
            });
            var sbobj2 = this.state.sobj;
            sbobj2["taskAllocationDtoList"] = allocationexlist;
            this.setState({ sobj: sbobj2, isUpdated: true })
        }
        this.getAllocationLevel()
    }
    //push to allowcations
    newPushToAllocations = (allocation, obj) => {
        var newallocations = allocation;
        var viewName = "";
        if (obj.systemMainRoleType === usrRoles.RM) {
            viewName = obj.regionName ? obj.regionName : obj.userFirstName + " " + obj.userLastName
        } else if (obj.systemMainRoleType ===usrRoles.SM) {
            viewName = obj.storeName ? obj.storeName : obj.userFirstName + " " + obj.userLastName
        } else {
            viewName = obj.userFirstName + " " + obj.userLastName
        }
        var userRolls = {
            chieldsUserRoles: obj.chieldsUserRoles,
            parentUserRoles: obj.parentUserRoles,
            systemMainRoleType: obj.systemMainRoleType,
            userLevel: obj.roleUserLevel,
            storeUUID: obj.storeUUID ? obj.storeUUID : undefined,
            regionUUID: obj.regionUUID ? obj.regionUUID : undefined,
        }
        var taskAllocationDetailsObj = {
            reciverUuid: obj.userUUID,
            systemMainRoleType: obj.systemMainRoleType,
            viewName: viewName,
            isNew: true,
            userDto: { userRolls: userRolls }
        }
        var newobj = {
            allocatorUuid: this.props.signedobj.signinDetails.userUUID,
            reciverRole: obj.systemMainRoleType,
            isNew: true,
            taskAllcationDetailDto: [taskAllocationDetailsObj]
        };
        newallocations.push(newobj);
        return newallocations;
    }
    //handle time pickers
    onChangeTime = (evt, type) => {
        if (type === "startTime") {
            this.setState({ startTime: evt, isFutreTask: true }, () => {
            })
        } else {
            this.setState({ endTime: evt, isFutreTask: true }, () => {
            })
        }
    }
       //return Months
    returnMonth = (date) => {
        // var d =date;
        var monthYearly = date.getMonth();
        var monthEnum = null
        //   var monthYearly = moment(this.state.onceAYearDateBack).month()
        if (monthYearly === 0) {
            monthEnum = Months.January
        } else if (monthYearly === 1) {
            monthEnum = Months.February
        } else if (monthYearly === 2) {
            monthEnum = Months.March
        } else if (monthYearly === 3) {
            monthEnum = Months.April
        } else if (monthYearly === 4) {
            monthEnum = Months.May
        } else if (monthYearly === 5) {
            monthEnum = Months.June
        } else if (monthYearly === 6) {
            monthEnum = Months.July
        } else if (monthYearly === 7) {
            monthEnum = Months.August
        } else if (monthYearly === 8) {
            monthEnum = Months.September
        } else if (monthYearly === 9) {
            monthEnum = Months.Octomber
        } else if (monthYearly === 10) {
            monthEnum = Months.November
        } else if (monthYearly === 11) {
            monthEnum = Months.December
        }
        return monthEnum
    }
    //Handle if yearly Date
    yearlyDateHandle = (e) => {
        this.setState({ yearlyDate: e, isFutreTask: true }, () => {
            //console.log(this.state.yearlyDate);
        })
    }
    // validate task
    validationtask = (obj) => {
        let errors = {
            taskName: '',
            description: '',
            WITfor: '',
            Tapprover: '',
            repeattype: '',
            onceDate: '',
            endTime: '',
            startTime: '',
            whichWeek: '',
            WeekendTime: '',
            WeekstartTime: '',
            WeekuntilDate: '',
            yearDate: '',
            YearendTime: '',
            YearuntilDate: '',
            YearstartTime: '',
            MonthwichWeek: '',
            MonthDay: '',
            MonthuntilDate: '',
            MonthEndTime: '',
            MonthstartTime: '',
            fillFeedBack: '',
            allFieldFeedback: '',
            listempty: '',
            listitemempty: '',
            noquestionselect: '',
        }
        var allow = true
        if (obj.title === "" || obj.title === undefined) {
            errors.taskName = this.props.t('TASK_NAME_REQ')
            allow = false
        } if (obj.description === "" || obj.description === undefined) {
            errors.description = this.props.t('DECRIPTION_REQ')
            allow = false
        } if (obj.taskAllocationDtoList.length < 1) {
            errors.WITfor = this.props.t('SELECT_WHO_THE_TASK_IS_FOR')
            allow = false
        } else {
            var notempty = false
            //validate in edit
            for (let q = 0; q < obj.taskAllocationDtoList.length; q++) {
                const alolist = obj.taskAllocationDtoList[q];
                const reciver = alolist.taskAllcationDetailDto[0]
                if (!reciver.isNew) {
                    if (reciver.isDelete === false) {
                        notempty = true;
                        break
                    }
                } else {
                    notempty = true;
                }
            }
            if (!notempty) {
                errors.WITfor = this.props.t('SELECT_WHO_THE_TASK_IS_FOR')
                allow = false
            }
        }
        if (obj.taskApproversDtoList.length < 1) {
            errors.Tapprover = this.props.t('SELECT_WHO_WILL_APPROVE_THE_TASK')
            allow = false
        } else {
            var cnotempty = false
            //validate in edit
            for (let q = 0; q < obj.taskApproversDtoList.length; q++) {
                const alolist = obj.taskApproversDtoList[q];
                const reciver = alolist
                if (!reciver.isNew) {
                    if (reciver.isDelete === false) {
                        cnotempty = true;
                        break
                    }
                } else {
                    cnotempty = true;
                }
            }
            if (!cnotempty) {
                errors.Tapprover = this.props.t('SELECT_WHO_WILL_APPROVE_THE_TASK')
                allow = false
            }
        }
        if (obj.taskRepeatDetails.repeatType === "" || obj.taskRepeatDetails.repeatType === undefined) {
            errors.repeattype = this.props.t('SELECT_REPEAT_TYPE')
            allow = false
        }
        if (obj.taskRepeatDetails.repeatType === RepeatType.Once) {
            if (obj.taskRepeatDetails.taskRepeatListDto !== undefined) {
                for (let i = 0; i < obj.taskRepeatDetails.taskRepeatListDto.length; i++) {
                    const detailDto = obj.taskRepeatDetails.taskRepeatListDto[i];
                    if ((detailDto.customDate === null || detailDto.customDate === "")) {
                        errors.onceDate = this.props.t('ONCE_DATE_REQ')
                        allow = false
                    }
                    if (detailDto.endTime === "") {
                        errors.endTime = this.props.t('END_TIME_REQ')
                        allow = false
                    }

                    if (obj.taskRepeatDetails.isTimeFrameTask) {
                        if (detailDto.startTime === "") {
                            errors.startTime = this.props.t('START_TIME_REQ')
                            allow = false
                        }
                    }
                }
            }
        }
        if (obj.taskRepeatDetails.repeatType === RepeatType.Weekly) {

            if (obj.taskRepeatDetails.taskRepeatListDto.length === 0) {
                errors.whichWeek = this.props.t('WEEKLYDETAILS_REQ')
                allow = false
            }
            if (obj.taskRepeatDetails.taskRepeatListDto !== undefined) {
                if (obj.taskRepeatDetails.taskRepeatListDto.length > 0) {
                    for (let x = 0; x < obj.taskRepeatDetails.taskRepeatListDto.length; x++) {
                        const detailDto = obj.taskRepeatDetails.taskRepeatListDto[x];
                        if (detailDto.taskDay === null || detailDto.endTime === "") {
                            errors.WeekendTime = this.props.t('END_TIME_REQ')
                            this.setState({ errors: errors })
                            // alertService.error("EndTime Required!")
                            allow = false
                        }

                        if (obj.taskRepeatDetails.isTimeFrameTask) {
                            if (detailDto.startTime === "") {
                                errors.WeekstartTime = this.props.t('START_TIME_REQ')
                                allow = false
                            }
                        }
                    }
                } else {
                    errors.WeekendTime = this.props.t('END_TIME_REQ')
                    errors.WeekstartTime = this.props.t('START_TIME_REQ')
                    allow = false
                }
            }
            if (obj.taskRepeatDetails.taskRepeatEndDate === "" || obj.taskRepeatDetails.taskRepeatEndDate === undefined) {
                errors.WeekuntilDate = this.props.t('UNTIL_DATE_REQ')
                allow = false
            }
        }
        if (obj.taskRepeatDetails.repeatType === RepeatType.Yearly) {
            if (obj.taskRepeatDetails.yearyDate === "NaN-aN-aN" || obj.taskRepeatDetails.yearyDate === null || obj.taskRepeatDetails.yearyDate === undefined) {
                errors.yearDate = this.props.t('YEARLY_DATE_REQ')
                allow = false
            }
            if (obj.taskRepeatDetails.endTime === "" || obj.taskRepeatDetails.endTime === null || obj.taskRepeatDetails.endTime === undefined) {
                errors.YearendTime = this.props.t('END_TIME_REQ')
                allow = false
            }
            if (obj.taskRepeatDetails.taskRepeatEndDate === "" || obj.taskRepeatDetails.taskRepeatEndDate === null || obj.taskRepeatDetails.taskRepeatEndDate === undefined) {
                errors.YearuntilDate = this.props.t('UNTIL_DATE_REQ')
                allow = false
            }

            if (obj.taskRepeatDetails.isTimeFrameTask) {
                if (obj.taskRepeatDetails.startTime === "") {
                    errors.YearstartTime = this.props.t('START_TIME_REQ')
                    allow = false
                }
            }
        }
        if (obj.taskRepeatDetails.repeatType === RepeatType.Monthly) {
            if (obj.taskRepeatDetails.repeatDateRank === "" || obj.taskRepeatDetails.repeatDateRank === null || obj.taskRepeatDetails.repeatDateRank === undefined) {
                errors.MonthwichWeek = this.props.t('WEEK_REQ')
                allow = false
            }
            if (obj.taskRepeatDetails.taskDay === "" || obj.taskRepeatDetails.taskDay === null || obj.taskRepeatDetails.taskDay === undefined) {
                errors.MonthDay = this.props.t('DAY_REQ')
                allow = false
            }
            if (obj.taskRepeatDetails.taskRepeatEndDate === "" || obj.taskRepeatDetails.taskRepeatEndDate === null || obj.taskRepeatDetails.taskRepeatEndDate === undefined) {
                errors.MonthuntilDate = this.props.t('UNTILDATE_REQ')
                allow = false
            }
            if (obj.taskRepeatDetails.endTime === "" || obj.taskRepeatDetails.endTime === null || obj.taskRepeatDetails.endTime === undefined) {
                errors.MonthEndTime = this.props.t('END_TIME_REQ')
                allow = false
            }
            if (obj.taskRepeatDetails.isTimeFrameTask) {
                if (obj.taskRepeatDetails.startTime === "") {
                    errors.MonthstartTime = this.props.t('START_TIME_REQ')
                    allow = false
                }
            }
        }
        if (!this.state.isQuestionnaire) {
            if (obj.requestedFeedbackDto.length === 0) {
                errors.fillFeedBack = this.props.t('PLEASE_FILL_FEEDBACK')
                allow = false
            }
            if (obj.requestedFeedbackDto.length > 0) {
                var exist = false;
                for (let i = 0; i < obj.requestedFeedbackDto.length; i++) {
                    const detailDto = obj.requestedFeedbackDto[i];
                    if (detailDto.feedbackTypeId === FEEDBACK_CHECKBOXES.id ||
                        detailDto.feedbackTypeId === FEEDBACK_TEXT.id ||
                        detailDto.feedbackTypeId === FEEDBACK_NUMBER.id ||
                        detailDto.feedbackTypeId === FEEDBACK_RADIO.id) {
                        exist = true;
                        break
                    }
                }
                if (!exist) {
                    errors.allFieldFeedback = this.props.t('PLEASE_FILL_ALL_FIELDS_FEEDBACK')
                    allow = false
                }
                for (let i = 0; i < obj.requestedFeedbackDto.length; i++) {
                    const detailDto = obj.requestedFeedbackDto[i];
                    if (detailDto.feedbackTypeId === FEEDBACK_CHECKBOXES.id ||
                        detailDto.feedbackTypeId === FEEDBACK_RADIO.id) {
                        if (detailDto.requestedFeedbackOption.length === 0) {
                            errors.listempty = this.props.t('PLEASE_FILL_ALL_FIELDS_FEEDBACK')
                            allow = false
                        }
                        for (let j = 0; j < detailDto.requestedFeedbackOption.length; j++) {
                            const option = detailDto.requestedFeedbackOption[j];
                            if (option.optiontext === "" || option.optiontext === undefined) {
                                errors.listitemempty = this.props.t('PLEASE_FILL_ALL_FIELDS_FEEDBACK')
                                allow = false
                            }
                        }
                    }
                }
            }
        } else {
            if (obj.questionnaireId === "") {
                errors.noquestionselect = this.props.t('PLEASE_FILL_ALL_FIELDS_FEEDBACK')
                allow = false
            }
        }
        this.setState({ errors: errors })
        if (!allow) {
            alertService.error(this.props.t('FILL_ALL_REQ_FIELDS'))
        } else {
            var vapprove = this.validateapprover(obj)
            if (!vapprove) {
                alertService.error(this.props.t('ADD_VALID_APPROVERS'))
            }
            allow = vapprove
        }
        return allow
    }
    // approver vaidation
    //#TSK-CR-APVl
    validateapprover = (obj) => {
        var allow = false
        var passedlist = [];
        var allocationlist = obj.taskAllocationDtoList.filter(g => g.isDelete !== true)
        var approverlist = obj.taskApproversDtoList.filter(x => x.isDelete !== true)
        if (allocationlist.length > 0) {
            for (let i = 0; i < allocationlist.length; i++) {
                const allocationmain = allocationlist[i];
                const allocation = allocationmain.taskAllcationDetailDto[0]
                var parentsofallocation = allocation.userDto.userRolls.parentUserRoles
                for (let j = 0; j < approverlist.length; j++) {
                    const approver = approverlist[j];
                    var havesame = (allocation.userDto.userRolls.systemMainRoleType === approver.approverRole) ? true : false
                    var have = parentsofallocation.find(p => p.uuid === approver.userDto.userRolls.rollUUID)
                    if (have || havesame) {
                        if (approver.userDto.userRolls.userLevel === usrLevels.CN) {
                            // console.log("yap chaibn");
                            passedlist.push(true)
                            break
                        } else {
                            //store
                            if (approver.userDto.userRolls.userLevel === usrLevels.ST) {
                                if (approver.userDto.userRolls.storeUUID === allocation.userDto.userRolls.storeUUID) {
                                    // console.log("yap same store");
                                    passedlist.push(true)
                                    break
                                }
                            }
                            //region
                            if (approver.userDto.userRolls.userLevel === usrLevels.RG) {
                                if (approver.userDto.userRolls.regionUUID === allocation.userDto.userRolls.regionUUID) {
                                    // console.log("yap same region");
                                    passedlist.push(true)
                                    break
                                }
                            }
                        }
                        // console.log("yap");   
                    } else {
                        // console.log("no");
                    }
                }
            }
        }
        if (passedlist.length === allocationlist.length) {
            allow = true
        }
        return allow
    }
    //once date handle
    setOncedate = (daten) => {
        // this.state.isFutreTask = true;
        this.setState({ oncedate: daten, isFutreTask: true })
    }
    //allocation vw name
    getTaskIsForViewName = () => {
        var stringName = ""
        if (this.state.sobj && this.state.sobj.taskAllocationDtoList) {
            this.state.sobj.taskAllocationDtoList.forEach(allocator => {
                allocator.taskAllcationDetailDto.forEach(reciever => {
                    if (!reciever.isDelete) {
                        if (stringName !== "") {
                            stringName += ","
                        }
                        stringName += reciever.viewName
                    }
                });
            });
        }
        stringName = ((stringName).length > 30) ?
            (((stringName).substring(0, 30 - 3)) + '...') :
            stringName
        return stringName
    }
    //approver view name
    getTaskApproverViewName = () => {
        var stringName = ""
        if (this.state.sobj && this.state.sobj.taskApproversDtoList) {
            this.state.sobj.taskApproversDtoList.forEach(approver => {
                if (!approver.isDelete) {
                    if (stringName !== "") {
                        stringName += ","
                    }
                    stringName += approver.viewName
                }
            });
        }
        stringName = ((stringName).length > 30) ?
            (((stringName).substring(0, 30 - 3)) + '...') :
            stringName
        return stringName
    }
    //is urgernt
    handleUrgent = (type) => {
        this.setState({ isUrgent: !type, isUpdated: true})
    }
    //questionnaire handle
    handleQuestionnaire = () => {
        this.setState({ isQuestionnaire: !this.state.isQuestionnaire })
    }
    //is use cam
    handleIsuseCam = (type) => {
        this.setState({ isuseCam: !type, isUpdated: true })
    }
    //Save Task
    saveTask = (type) => {

        if(type === "update"){
            if(!this.state.isUpdated){
                alertService.warn(this.props.t('NO_CHANGES_AVAILABLE'));
                return false;
            }
        }

        //default approver set
        var noapprovers = false
        if (this.state.sobj.taskApproversDtoList.length > 0) {
            var hv = this.state.sobj.taskApproversDtoList.find(c => c.isDelete !== true);
            if (!hv) { noapprovers = true }
        } else {
            noapprovers = true
        }
        //if no approver then defualt approver set
        if (noapprovers) {
            this.defualtSetApprover();
        }
        var saveobj = this.state.sobj;
        //add on edit groups
        // if (this.state.isedit) {
        var gelelist = [];
        this.state.groupIds.forEach(gelegroup => {
            if (gelegroup.isSelected === true) {
                var object = {
                    groupUUID: gelegroup.uuid,
                    groupId: gelegroup.id,
                    groupName: gelegroup.groupName,
                    taskHasUserGroupId: -1,
                    isNew: true,
                    isDelete: false
                }
                gelelist.push(object)
            }
        });
        this.state.existinggroups.forEach(exelement => {
            exelement["isDelete"] = true;
            gelelist.push(exelement)
        });
        saveobj["taskHasUserGroups"] = gelelist;
        // }
        //add on edit task shedule 
        if (this.state.isedit && this.state.isFutreTask) {
            saveobj["updateFutureTask"] = true;
        }
        //feedback type
        var feedbacklist = saveobj.requestedFeedbackDto
        // .filter(x => x.feedbackTypeId === this.state.selectedFBtype.id)
        var canAddFeedback = false
        if (feedbacklist.length === 0) {
            //can add new
            canAddFeedback = true
        } else {
            var feedbackTypes = feedbacklist.filter(a => (a.feedbackTypeId === FEEDBACK_CHECKBOXES.id || a.feedbackTypeId === FEEDBACK_RADIO.id
                || a.feedbackTypeId === FEEDBACK_NUMBER.id || a.feedbackTypeId === FEEDBACK_TEXT.id))
            if (feedbackTypes.length === 0) {
                //can add feedback
                canAddFeedback = true
            } else {
                //pre is in list
                var existtype = feedbackTypes.find(c => c.feedbackTypeId === parseInt(this.state.selectedFBtype.id));
                if (existtype) {
                    feedbacklist.forEach(element => {
                        if (element.id) {
                            element.isDelete = false
                        }
                    });
                } else {
                    // feedbacklist[0].isDelete=true;
                    feedbacklist.forEach(element => {
                        if (element.id) {
                            element.isDelete = true
                        } else {

                        }
                    });
                    canAddFeedback = true
                }
            }
        }
        // for (let k = 0; k < feedbacklist.length; k++) {
        //     const feedback = feedbacklist[k];
        //     console.log(feedback.feedbackTypeId);
        //     if (feedback.feedbackTypeId == FEEDBACK_CHECKBOXES.id || feedback.feedbackTypeId == FEEDBACK_RADIO.id
        //         || feedback.feedbackTypeId == FEEDBACK_NUMBER.id || feedback.feedbackTypeId == FEEDBACK_TEXT.id) {
        //         // feedbacklist.splice(k, 1)
        //         console.log(feedback);
        //         console.log("this true");
        //     }else{
        //         console.log("this else");
        //     }
        // }

        if (canAddFeedback) {
            var feedbackoptions = this.state.checkList;
            var feddback = {
                feedbackTypeId: this.state.selectedFBtype.id,
                requestedFeedbackOption: feedbackoptions,
                isNew: true,
            };
            if (this.state.selectedFBtype.id) { saveobj.requestedFeedbackDto = [feddback] }
        }
        var isDeadLineTask = (saveobj.taskRepeatDetails) && saveobj.taskRepeatDetails.taskRepeatEndDate ? true : false;
        var isRepeatingTask = (saveobj.taskRepeatDetails.repeatType !== "One Time") ? true : false
        saveobj["isDeadLineTask"] = isDeadLineTask
        saveobj["isRepeatingTask"] = isRepeatingTask
        saveobj["taskRepeatStartDate"] = new Date();
        //time shedule set
        var repeatype = saveobj.taskRepeatDetails.repeatType;
        if (repeatype === RepeatType.Once) {
            var ctaskRepeatListDto = [{
                startTime: this.state.startTime ? this.state.startTime : "",
                endTime: this.state.endTime ? this.state.endTime : "",
                customDate: (this.state.oncedate !== "") ? convertDate(this.state.oncedate) : "",
                taskDay: null
            }]
            saveobj.taskRepeatDetails["taskRepeatListDto"] = ctaskRepeatListDto
        }
        if (repeatype === RepeatType.Weekly) {
            var prvtaskRepeatListDto = saveobj.taskRepeatDetails.taskRepeatListDto;
            for (let index = 0; index < prvtaskRepeatListDto.length; index++) {
                var weeklyDay = prvtaskRepeatListDto[index];
                weeklyDay.startTime = this.state.startTime
                weeklyDay.endTime = this.state.endTime
            }
            // var ctaskRepeatListDto=[{
            //     startTime:this.state.startTime,
            //     endTime:this.state.endTime,
            //     customDate:null,
            //     taskDay:null  
            // }]
            // saveobj.taskRepeatDetails["taskRepeatListDto"]=ctaskRepeatListDto
        }
        if (repeatype === RepeatType.Monthly) {
            var prvtaskRepeatDetails = saveobj.taskRepeatDetails;
            prvtaskRepeatDetails["endTime"] = (this.state.endTime)
            prvtaskRepeatDetails["startTime"] = this.state.startTime
        }
        if (repeatype === RepeatType.Yearly) {
            var prvtaskRepeatDetailsy = saveobj.taskRepeatDetails;
            prvtaskRepeatDetailsy["endTime"] = this.state.endTime
            prvtaskRepeatDetailsy["startTime"] = this.state.startTime
            prvtaskRepeatDetailsy["yearyDate"] = convertDate(this.state.yearlyDate)
            prvtaskRepeatDetailsy["month"] = this.state.yearlyDate ? this.returnMonth(this.state.yearlyDate) : "";
        }
        //isUrgent
        saveobj["taskPriority"] = this.state.isUrgent ? TaskPriorityENUM.HIGH : TaskPriorityENUM.NORMAL
        //ismustuse cam
        saveobj["isMustUseCamera"] = this.state.isuseCam
        //questionnaire
        saveobj["isUseQuestionnaire"] = this.state.isQuestionnaire
        saveobj["questionnaireId"] = this.state.Questionniarequestion
        //media feed back
        this.state.mediaFeedbackTypes.forEach(mediaFeedback => {
            var exists = saveobj.requestedFeedbackDto.find(a => a.feedbackTypeId === mediaFeedback.id)
            if (mediaFeedback.selected && !exists) {
                var newobj = {};
                newobj["feedbackTypeId"] = mediaFeedback.id;
                newobj["isNew"] = true;
                newobj["requestedFeedbackOption"] = []
                saveobj.requestedFeedbackDto.push(newobj)
            } else {
                var changeobj = saveobj.requestedFeedbackDto.find(a => a.feedbackTypeId === mediaFeedback.id);
                if (changeobj) {
                    changeobj["isDelete"] = mediaFeedback.selected ? false : true;
                }
            }
        });
        var validation = this.validationtask(saveobj);
        if (validation) {
            if (type === "save") {
                this.setState({ saveupdatebtndisabel: true }, () => {
                    submitSets(submitCollection.savetask, saveobj, true, null, true).then(resp => {
                        if (resp && resp.status) {
                            this.setState({ saveupdatebtndisabel: false })
                            alertService.success("Task Is Saved");
                            this.props.handleModalToggle(null, this.state.isRedirectQuesionear);
                            this.cleansaveobj();
                            this.props.handleTableSearch(null, "click");
                        } else {
                            this.setState({ saveupdatebtndisabel: false })
                            // alertService.error((resp && resp.extra ? resp.extra : this.props.t('ERROR_OCCURRED')));
                        }
                    });
                })
            } else {
                this.setState({ saveupdatebtndisabel: true }, () => {
                    submitSets(submitCollection.updatetask, this.state.sobj, true, null, true).then(resp => {

                        if (resp && resp.status) {
                            this.setState({ saveupdatebtndisabel: false, isUpdated: false });
                            alertService.success(this.props.t("TASK_IS_UPDATED"));
                            this.props.handleModalToggle(null, this.state.isRedirectQuesionear);
                            this.cleansaveobj();
                            this.props.handleTableSearch(null, "click");
                            // window.location.reload();
                        } else {
                            this.setState({ saveupdatebtndisabel: false });
                            // alertService.error((resp && resp.extra ? resp.extra : this.props.t('ERROR_OCCURRED')));
                        }
                    });
                })
            }
        }
    }
    //#TSK-CR-2 
    //if no approver then defualt approver set
    //  #TSK-CR-2
    defualtSetApprover = () => {
        //setting user rolll object for approver validation
        var loguser = this.props.signedobj.signinDetails
        var sobj = this.state.sobj;
        var list = sobj.taskApproversDtoList
        var userRolls = {
            rollUUID: this.props.signedobj.signinDetails.userRolls.rollUUID,
            userLevel: this.props.signedobj.signinDetails.userRolls.userLevel,
            systemMainRoleType: this.props.signedobj.signinDetails.userRolls.systemMainRoleType,
            regionUUID: this.props.signedobj.signinDetails.userRolls.regionUUID ? this.props.signedobj.signinDetails.userRolls.regionUUID : undefined,
            storeUUID: this.props.signedobj.signinDetails.userRolls.storeUUID ? this.props.signedobj.signinDetails.userRolls.storeUUID : undefined,
        }
        var userDto = { userRolls: userRolls }
        var user = loguser.userDto
        var dto = {
            viewName: (loguser.userRolls.systemMainRoleType === usrRoles.RM) ? loguser.userRolls.regionName : (loguser.userRolls.systemMainRoleType === usrRoles.SM) ? loguser.userRolls.storeName : user.fName + " " + user.lName,
            approverUuid: this.props.signedobj.signinDetails.userUUID,
            id: this.props.signedobj.signinDetails.id,
            approverRole: this.props.signedobj.signinDetails.userRolls.systemMainRoleType,
            isNew: true,
            userDto: userDto
        }
        list.push(dto)
        this.setState({ sobj: sobj })
    }
    //Add new task Click
    handleNewLink = () => {
        this.props.setTaskView(null)
        this.setState({ isRedirectQuesionear: false });
        this.props.handleModalToggle(true);
    }
    //on hide newtask/edit task model 
    onhidemodal = () => {
        console.log("on hide modal")
        this.handleIsUpdated();
        this.cleansaveobj();
        this.props.handleModalToggle(null, this.state.isRedirectQuesionear);
    }
    onshowModal = () => {
        var editDetails = this.props.taskFeedState.taskDetails;
        if (this.props.taskFeedState.taskDetails !== null) {
            //set isUrgent
            // this.state.isUrgent=(editDetails.taskPriority===TaskPriorityENUM.HIGH)?true:false
            this.setState({ isUrgent: (editDetails.taskPriority === TaskPriorityENUM.HIGH) ? true : false, isuseCam: editDetails.isMustUseCamera });
            editDetails.taskApproversDtoList.forEach(obj => {
                var userD = obj.userDto
                var approverViewName = ""
                if (userD.userRolls && userD.userRolls.systemMainRoleType === usrRoles.RM) {
                    if (userD.userRolls.regionName) {
                        approverViewName = userD.userRolls.regionName
                    } else {
                        approverViewName = userD.name
                    }
                } else if (userD.userRolls && userD.userRolls.systemMainRoleType === usrRoles.SM) {
                    if (userD.userRolls.storeName) {
                        approverViewName = userD.userRolls.storeName
                    } else {
                        approverViewName = userD.name
                    }
                } else {
                    approverViewName = userD.name
                }

                obj['viewName'] = approverViewName
            });

            //allocator
            for (let i = 0; i < editDetails.taskAllocationDtoList.length; i++) {
                const alocator = editDetails.taskAllocationDtoList[i];
                //    if(alocator.length>0){
                alocator.taskAllcationDetailDto.forEach(obj => {
                    var userD = obj.userDto
                    var allocatorViewName = ""
                    if (userD.userRolls && userD.userRolls.systemMainRoleType === usrRoles.RM) {
                        if (userD.userRolls.regionName) {
                            allocatorViewName = userD.userRolls.regionName
                        } else {
                            allocatorViewName = userD.name
                        }
                    } else if (userD.userRolls && userD.userRolls.systemMainRoleType === usrRoles.SM) {
                        if (userD.userRolls.storeName) {
                            allocatorViewName = userD.userRolls.storeName
                        } else {
                            allocatorViewName = userD.name
                        }

                    } else {
                        allocatorViewName = userD.name
                    }
                    obj.viewName = allocatorViewName
                });
                //    }
            }
            //existinggroups set 
            var exgrouplist = [];
            if (editDetails.taskHasUserGroups.length > 0) {
                exgrouplist = editDetails.taskHasUserGroups
            }
            // console.log(editDetails.taskHasUserGroups);
            var nsobj = {
                taskCategory: editDetails.taskCategory,
                taskApproversDtoList: editDetails.taskApproversDtoList,
                taskAllocationDtoList: editDetails.taskAllocationDtoList,
                requestedFeedbackDto: editDetails.requestedFeedbackDto,
                description: editDetails.description,
                title: editDetails.title,
                taskRepeatDetails: {
                    repeatType: editDetails.taskRepeatDetails.repeatType,
                    taskRepeatListDto: editDetails.taskRepeatDetails.taskRepeatListDto,
                    isTimeFrameTask: editDetails.taskRepeatDetails.isTimeFrameTask,
                    repeatDateRank: editDetails.taskRepeatDetails.repeatDateRank,
                    taskDay: editDetails.taskRepeatDetails.taskDay,
                    taskRepeatEndDate: (editDetails.taskRepeatDetails.taskRepeatEndDate !== null) && (new Date(editDetails.taskRepeatDetails.taskRepeatEndDate))
                },
                taskId: editDetails.taskId,
            }
            var startTime = ''
            var endTime = ''
            var yearlyDate = ""
            var oncedate = ""
            var feedbackmediaList = []
            var feedbackList = []
            //Edit Once 
            if (editDetails.taskRepeatDetails.repeatType === RepeatType.Once) {
                oncedate = (new Date(editDetails.taskRepeatDetails.taskRepeatListDto[0].customDate));
                endTime = timetotimeHM(editDetails.taskRepeatDetails.taskRepeatListDto[0].endTime);
                if (editDetails.taskRepeatDetails.isTimeFrameTask) {
                    startTime = timetotimeHM(editDetails.taskRepeatDetails.taskRepeatListDto[0].startTime)
                }
            }
            //Edit Weekly
            if (editDetails.taskRepeatDetails.repeatType === RepeatType.Weekly) {
                endTime = timetotimeHM(editDetails.taskRepeatDetails.taskRepeatListDto[0].endTime);
                if (editDetails.taskRepeatDetails.isTimeFrameTask) {
                    startTime = timetotimeHM(editDetails.taskRepeatDetails.taskRepeatListDto[0].startTime)
                }
            }
            //monthly edit
            if (editDetails.taskRepeatDetails.repeatType === RepeatType.Monthly) {
                endTime = timetotimeHM(editDetails.taskRepeatDetails.endTime);
                if (editDetails.taskRepeatDetails.isTimeFrameTask) {
                    startTime = timetotimeHM(editDetails.taskRepeatDetails.startTime);
                }
            }
            //year edit
            if (editDetails.taskRepeatDetails.repeatType === RepeatType.Yearly) {
                yearlyDate = editDetails.taskRepeatDetails.yearyDate
                endTime = timetotimeHM(editDetails.taskRepeatDetails.endTime);
                if (editDetails.taskRepeatDetails.isTimeFrameTask) {
                    startTime = timetotimeHM(editDetails.taskRepeatDetails.startTime);
                }
            }
            //check edit mediafeeedback
            feedbackmediaList = editDetails.requestedFeedbackDto.filter(g => (g.feedbackTypeId === FEEDBACK_PHOTO.id || g.feedbackTypeId === FEEDBACK_VIDEO.id || g.feedbackTypeId === FEEDBACK_QR.id))
            for (let j = 0; j < feedbackmediaList.length; j++) {
                const feedbackBackObj = feedbackmediaList[j];
                for (let k = 0; k < this.state.mediaFeedbackTypes.length; k++) {
                    var mediaType = this.state.mediaFeedbackTypes[k];
                    if (feedbackBackObj.feedbackTypeId === mediaType.id) {
                        mediaType.selected = true;
                        mediaType.requestedFeedbackId = feedbackBackObj.requestedFeedbackId
                    }
                }
            }
            //check edit feeedback
            feedbackList = editDetails.requestedFeedbackDto.find(g => !(g.feedbackTypeId === FEEDBACK_PHOTO.id || g.feedbackTypeId === FEEDBACK_VIDEO.id || g.feedbackTypeId === FEEDBACK_QR.id))
            //in isedit check task attended
            var isAttend = this.state.istaskAttended;
            for (let t = 0; t < nsobj.taskAllocationDtoList.length; t++) {
                const taskA = nsobj.taskAllocationDtoList[t];
                var isAttendexist = taskA.taskAllcationDetailDto.find(b => b.isTaskAttended === true);
                if (isAttendexist) {
                    isAttend = true;
                    break;
                }
            }
            this.setState({
                existinggroups: exgrouplist,
                istaskAttended: isAttend,
                selectedFBtype: !editDetails.isUseQuestionnaire ? { id: feedbackList.feedbackTypeId, } : "",
                isedit: true,
                sobj: nsobj,
                oncedate: oncedate,
                endTime: endTime,
                startTime: startTime,
                yearlyDate: (yearlyDate === "") ? yearlyDate : new Date(yearlyDate),
                checkList: !editDetails.isUseQuestionnaire ? feedbackList.requestedFeedbackOption : [],
                isQuestionnaire: editDetails.isUseQuestionnaire ? true : false,
                Questionniarequestion: editDetails.isUseQuestionnaire ? editDetails.questionnaireId : "",
                Questionnairesearkkey: editDetails.isUseQuestionnaire ? editDetails.questionnaireName : "",
                EditsaveQuestionnaire: editDetails.isUseQuestionnaire ? editDetails.questionnaireName : "",
                questionnaireStatus: editDetails.isUseQuestionnaire ? editDetails.questionnaireStatus : "",
                // mediaFeedbackTypes:feedbackmediaList
                isfromsearchkey: false,
            }, () => {
                this.getQuestionnaireList();
            })
        } else {
            //if redirecting from questinnear
            if (this.props.selectedQuestionear) {
                this.setState({ isQuestionnaire: true, Questionniarequestion: this.props.selectedQuestionear.questionnaireId, isRedirectQuesionear: true, isfromsearchkey: false }, () => {
                    this.getQuestionnaireList();
                });
            } else {
                this.getQuestionnaireList();
            }
        }
    }
    //category handle change
    handleChange = (newValue, actionMeta) => {
        if (newValue && newValue.categoryId) {
            this.handleCategory(newValue.categoryId)
        } else {
            if (newValue !== null) {
                this.handleNewCategory()
            }
        }
        this.setState({ catName: "", isUpdated: true})
    };
    //category Handle input change
    handleInputChange = (inputValue, actionMeta) => {
        this.setState({ catName: inputValue, isUpdated: true }, () => {
            if (!this.state.iscatTimeout) {
                this.setState({ iscatTimeout: true })
                setTimeout(() => {
                    this.loadCategories();
                }, 300);
            }
        })
    };
    //alloctor dropdown open/close
    taskisopennclose = () => {
        this.resetassginfilter()
        this.resetapproverfilter()
    }
    resetassginfilter = () => {
        this.setState({
            filterboxopen: false
        })
    }
    resetapproverfilter = () => {
        this.setState({ filterboxopenapprover: false })
    }
    setgroupsformain = (val) => {
        this.setState({
            groupIds: val
        })
    }
    clickFilter = () => {
        this.setState({ filterboxopen: !this.state.filterboxopen })
    }
    clickapproverFilter = () => {
        this.setState({ filterboxopenapprover: !this.state.filterboxopenapprover })
    }
    Questionniarequestionhandle = (val) => {
        this.setState({ Questionniarequestion: val }, () => {
        })
    }
    //close dropdowns when click close icon
    handleCloseDrop = (eleid) => {
        if(document.getElementById(eleid)){
            document.getElementById(eleid).click();
        }
    }
    validateField = (key, value, ) =>{
        let errorObj = this.state.errors
        let msg = ""
        if(value === "" || value.length === 0){
            if(key === "taskName"){
                msg = this.props.t('TASK_NAME_REQ')
            }else if(key === "description"){
                msg = this.props.t('DECRIPTION_REQ')
            } 
        }
        errorObj[key] = msg; 
        this.setState({
            error:errorObj
        })
    }
     handleDropdownBlur = (value) => {
        let obj = this.state.sobj;
        let errors = this.state.errors;
 
        if(value === 1){
            errors.WITfor = ""
            if (obj.taskAllocationDtoList.length < 1) {
                errors.WITfor = this.props.t('SELECT_WHO_THE_TASK_IS_FOR')
            } else {
                var notempty = false
                //validate in edit
                for (let q = 0; q < obj.taskAllocationDtoList.length; q++) {
                    const alolist = obj.taskAllocationDtoList[q];
                    const reciver = alolist.taskAllcationDetailDto[0]
                    if (!reciver.isNew) {
                        if (reciver.isDelete === false) {
                            notempty = true;
                            break
                        }
                    } else {
                        notempty = true;
                    }
                }
                if (!notempty) {
                    errors.WITfor = this.props.t('SELECT_WHO_THE_TASK_IS_FOR')
                }
            }
        }else if(value === 2){
            errors.Tapprover =""
            if (obj.taskApproversDtoList.length < 1) {
                errors.Tapprover = this.props.t('SELECT_WHO_WILL_APPROVE_THE_TASK')

            } else {
                var cnotempty = false
                //validate in edit
                for (let q = 0; q < obj.taskApproversDtoList.length; q++) {
                    const alolist = obj.taskApproversDtoList[q];
                    const reciver = alolist
                    if (!reciver.isNew) {
                        if (reciver.isDelete === false) {
                            cnotempty = true;
                            break
                        }
                    } else {
                        cnotempty = true;
                    }
                }
                if (!cnotempty) {
                    errors.Tapprover = this.props.t('SELECT_WHO_WILL_APPROVE_THE_TASK')
                }
            }
        }
        this.setState({
            errors:errors
        })
      };

    render() {
        const customStyles = {
            container: provided => ({
                ...provided,
                width: "max-content",
                minWidth: "100%"
            }),
            menu: (provided, state) => ({
                ...provided,
                fontSize: "13px",
            }),
        }
        
        const { errors } = this.state;
        const isCategoriesAvailable = (this.state.sobj.taskCategory.filter(x => !x.isDelete).length > 0);

        return (<>
            <Button size="sm" id="addnewtask" className="highlight-btn adnewbtn" variant="success" onClick={this.handleNewLink}><FeatherIcon icon="plus" className="plicon" size={22} /> <Col>{this.props.t('ADD_NEW_TASK')}</Col></Button>
            <Modal className={"TaskModal " + (this.props.isRTL === "rtl" ? "RTL" : "")} dir={this.props.isRTL} backdrop="static" keyboard={false}
                size="xl"
                show={this.props.showmodal} onHide={() => this.onhidemodal()}
                onShow={() => this.onshowModal()}
                aria-labelledby="example-modal-sizes-title-lg"
            >
                <Modal.Header className="modalheader" closeButton>
                    <Modal.Title id="example-modal-sizes-title-lg">
                        <h2>{this.state.isedit ? this.props.t('EDIT_TASK') : this.props.t('NEW_TASK')}</h2>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={(this.props.isRTL === "rtl" ? "RTL" : "")}>
                    <Row>
                        <Col className="newtaskType" style={{width:"33.3%"}}>
                            <h3>{this.props.t('TASK_DETAILS')}</h3>
                            <div className="whentask timefram">
                                <label className="pure-material-switch" style={{ width: "100%" }}>
                                    <input type="checkbox" checked={this.state.isUrgent} onChange={(e) => this.handleUrgent(this.state.isUrgent)} />
                                    <span> {this.props.t('URGENT_TASK')} </span>
                                </label>
                            </div>
                            <Form.Group className="NDUgroup">
                                <Form.Label >{this.props.t('TASK_NAME')} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Form.Control  size="sm" type="text" required placeholder={this.props.t('DESCRIBE_THE_TASK_SHORTLY')} value={this.state.sobj.title && this.state.sobj.title} onChange={(e) => this.onTyping(e, "title",this.props.t('Character.TaskName'))} onBlur={(e)=>{this.validateField("taskName",e.target.value)}} onKeyDown={(e)=>preventinputToString(e,e.target.value,(this.props.t('Character.TaskName')))} />
                                {errors.taskName.length > 0 &&
                                    <div className="validatediv"><span className='validationwarn'>{errors.taskName}</span></div>}
                            </Form.Group>

                            <Form.Group className="NDUgroup">
                                <Form.Label >{this.props.t('DESCRIPTION')}  <span style={{ color: "red" }}>*</span> </Form.Label>
                                <Form.Control size="sm" as="textarea" required placeholder={this.props.t('ANY_ADDITIONAL_INFO_ABOUT_TASK')} value={this.state.sobj.description && this.state.sobj.description} onBlur={(e)=>this.validateField("description",e.target.value)} onChange={(e) => this.onTyping(e, "description",this.props.t('Character.description'))} onKeyDown={(e)=>preventinputToString(e,e.target.value,(this.props.t('Character.description')))} />
                            </Form.Group>
                            {errors.description.length > 0 &&
                                <div className="validatediv"><span className='validationwarn'>{errors.description}</span></div>}

                            <Form.Group >
                                <Form.Label >{this.props.t('CATEGORY_OPTIONAL')}</Form.Label>
                                <Col>
                                    <CreatableSelect
                                        styles={customStyles}
                                        placeholder={this.props.t('SELECT')}
                                        isClearable
                                        value={""}
                                        onChange={this.handleChange}
                                        onInputChange={this.handleInputChange}
                                        options={this.state.categoryList}
                                        noOptionsMessage={() => this.props.t('TYPE_TO_SEARCH')}
                                        className="taskmdl-searchselect" classNamePrefix="taskmdl-inner" components={{ IndicatorSeparator: () => null }}
                                    />
                                </Col>
                            </Form.Group>

                            {isCategoriesAvailable?<Col className="catbadge-list">
                                {this.state.sobj.taskCategory.map((prod, i) =>
                                    <React.Fragment key={i}>{!prod.isDelete ? 
                                        <div className='cat-details'>
                                            <OverlayTrigger placement="bottom-start"overlay={<Tooltip>{prod.categoryName}</Tooltip> }>
                                            <Badge bg="default">{prod.categoryName}</Badge>
                                            </OverlayTrigger>
                                            <span className="tagremovebtn" onClick={(e) => this.removecategory(prod.categoryId, prod.categoryFUId)}><XIcon size={14} /></span>
                                        </div>
                                       
                                         : <></>}
                                    </React.Fragment>
                                )}
                            </Col>:<></>}

                            <Form.Group>
                                <Form.Label >{this.props.t('WHO_IS_THE_TASK_IS_FOR')} <span style={{ color: "red" }}>*</span></Form.Label>
                                <Dropdown onBlur={()=>this.handleDropdownBlur(1)} onToggle={() => this.taskisopennclose()} className="modeldrop modelassign" as={ButtonGroup} drop={"up"}  >
                                    <Dropdown.Toggle split id="taskfor-pop-dropdown">{this.getTaskIsForViewName()}</Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Col style={{position:"relative"}}>
                                            <span className='close-link' onClick={() => this.handleCloseDrop("taskfor-pop-dropdown")}><XIcon size={18} /></span>
                                            <TaskIsFor taskFeedState={this.props.taskFeedState} setgroupsformain={this.setgroupsformain} existinggroups={this.state.existinggroups} filterboxopen={this.state.filterboxopen}
                                                taskisforAllNone={this.taskisforAllNone} signedobj={this.props.signedobj} sobj={this.state.sobj} regionList={this.props.regionList}
                                                storeList={this.props.storeList} workerList={this.props.workerList} level={this.state.level}
                                                handleAllocation={this.handleAllocation} getAllocationLevel={this.getAllocationLevel}
                                                selectAll={this.selectAll} clickFilter={this.clickFilter} handleIsUpdated={this.handleIsUpdated}
                                            />    
                                        </Col>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Form.Group>
                            {errors.WITfor.length > 0 &&
                                <div className="validatediv"><span className='validationwarn'>{errors.WITfor}</span></div>}
                            <Form.Group>
                                <Form.Label >{this.props.t('TASK_APPROVER')} 
                                {/* <span style={{ color: "red" }}>*</span> */}
                                </Form.Label>
                                <Dropdown onBlur={()=>this.handleDropdownBlur(2)}  className="modeldrop modelapprovr" as={ButtonGroup} align="end" drop={"up"} >
                                    <Dropdown.Toggle split id="taskapprov-pop-dropdown" >{this.getTaskApproverViewName()}</Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Col style={{position:"relative"}}>
                                            <span className='close-link' onClick={() => this.handleCloseDrop("taskapprov-pop-dropdown")}><XIcon size={18} /></span>
                                            <TaskApprover removeUser={this.removeUser} handleAllocation={this.handleApproverList} clickFilter={this.clickapproverFilter} filterboxopen={this.state.filterboxopenapprover} approveSNone={this.approveSNone} selectAllApprovers={this.selectAllApprovers} signedobj={this.props.signedobj} regionList={this.props.regionList} storeList={this.props.storeList} workerList={this.props.workerList} sobj={this.state.sobj} level={this.state.apprvlevel} handleApproverList={this.handleApproverList}  handleIsUpdated={this.handleIsUpdated} />
                                        </Col>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Form.Group>
                            {errors.Tapprover.length > 0 &&
                                <div className="validatediv"><span className='validationwarn'>{errors.Tapprover}</span></div>}
                        </Col>
                        <Col className="newtaskType">
                            <TaskSheduling 
                                errors={this.state.errors} 
                                handleIsUpdated={this.handleIsUpdated} 
                                sobj={this.state.sobj} 
                                isAttend={this.state.istaskAttended} 
                                oncedate={this.state.oncedate} 
                                setOncedate={this.setOncedate} 
                                handleRepeat={this.handleRepeat} 
                                startTime={this.state.startTime} 
                                endTime={this.state.endTime} 
                                yearlyDate={this.state.yearlyDate} 
                                onChangeTime={this.onChangeTime} 
                                yearlyDateHandle={this.yearlyDateHandle} 
                                validateField={this.validateField}
                                isedit={this.state.isedit} 
                                />
                        </Col>
                        <Col className="newtaskType">
                            <Feedbacktask 
                                pagescrollcall={this.pagescrollcall} 
                                questionnaireStatus={this.state.questionnaireStatus} 
                                EditsaveQuestionnaire={this.state.EditsaveQuestionnaire} 
                                Questionnairesearkkey={this.state.Questionnairesearkkey} 
                                QuestionnaireSearch={this.QuestionnaireSearch} 
                                Questionniarequestionhandle={this.Questionniarequestionhandle} 
                                Questionniarequestion={this.state.Questionniarequestion} 
                                QuestionniareList={this.state.QuestionniareList} 
                                getQuestionnaireList={this.getQuestionnaireList} 
                                isQuestionnaire={this.state.isQuestionnaire} 
                                errors={this.state.errors} 
                                handleIsuseCam={this.handleIsuseCam} 
                                isuseCam={this.state.isuseCam} 
                                handleQuestionnaire={this.handleQuestionnaire} 
                                checkList={this.state.checkList} 
                                mediaFeedbackTypes={this.state.mediaFeedbackTypes} 
                                selectedFBtype={this.state.selectedFBtype} 
                                handleRepeat={this.handleRepeat} 
                                changeselectedFBtype={this.changeselectedFBtype} 
                                changeselectedFBmedia={this.changeselectedFBmedia} 
                                handlechecklist={this.handlechecklist} 
                                validateField={this.validateField}
                                isedit={this.state.isedit} 
                                />
                        </Col>
                    </Row>
                    <Col className="newtasks" style={(this.props.isRTL === "rtl" ? { float: "left" } : {})}>
                        {!this.state.isedit && <Button id="savenewtask" size="sm" className=" highlight-btn " disabled={this.state.saveupdatebtndisabel} variant="success" onClick={() => this.saveTask("save")}>{this.props.t('SAVE_TASK')}</Button>}
                        {this.state.isedit && <Button size="sm" className=" highlight-btn " disabled={this.state.saveupdatebtndisabel} variant="success" onClick={() => this.saveTask("update")}>{this.props.t('UPDATE_TASK')}</Button>}
                        <Button size="sm" className="highlight-btn-close " variant="success" onClick={() => this.onhidemodal()}>{this.props.t('CANCEL')}</Button>
                    </Col>
                </Modal.Body>
                {this.state.saveupdatebtndisabel&&<Col className='disablediv-NewTask'></Col>}
            </Modal>
            <AcViewModal showmodal={this.state.saveupdatebtndisabel} message={this.props.t('PLEASE_WAIT')} />
        </>)
    }
}
const mapDispatchToProps = dispatch => ({
    setTaskView: (payload) => dispatch(viewTaskSetAction(payload)),
});

export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(NewTask)));

