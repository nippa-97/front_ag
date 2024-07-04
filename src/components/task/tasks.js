import React, { Component } from 'react'
import { Badge, Col, Button, Breadcrumb, Form, Row, Table, ProgressBar, Dropdown, ButtonGroup, Pagination, FormControl, InputGroup, FormSelect, } from 'react-bootstrap'
import { withTranslation } from 'react-i18next';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon, ProjectIcon } from '@primer/octicons-react'; //HomeIcon, 
import { Link, withRouter } from 'react-router-dom';
import { submitCollection } from '../../_services/submit.service';
import { submitSets } from '../UiComponents/SubmitSets';
import "./tasks.css"
import { FindMaxResult, preventinputotherthannumbers, preventinputToString, usrLevels, usrRoles,replaceSpecialChars } from '../../_services/common.service'
import Thumbs from './thumbset/thumbs';
import FeatherIcon from 'feather-icons-react';
// import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { convertDateTime, getPager, convertDate } from '../../_services/common.service'
import NewTask from './newTask/newTask';
import { ExcelExportIcon } from '../../assets/icons/icons';
// import Loading from "../../assets/img/pleasewait.gif"
import { feedTableDataAction, taskFilterAction, TaskSummeryIDSetAction, viewTaskSetAction } from '../../actions/taskFeed/task_action';
import { selectedQuestionSetAction } from '../../actions/questionear/quest_action';
import { connect } from 'react-redux';
import { AcNoDataView, AcViewModal } from '../UiComponents/AcImports';
import { alertService } from '../../_services/alert.service';
import { confirmAlert } from 'react-confirm-alert';
import { FEEDBACK_CHECKBOXES, FEEDBACK_NUMBER, FEEDBACK_PHOTO, FEEDBACK_RADIO, FEEDBACK_TEXT, FEEDBACK_VIDEO, TaskStatusENUM, TASK_FILTER_STATUS } from '../../enums/taskfeedEnums';
import AssignEmployees from './newTask/assign/assignEmployees';
import SummeryDetails from './taskSummery/modal/summeryDetails';
import ApproveModal from './Approve/approveModal';
import FilterPanel from './newTask/filterPanel/filterPanel';
import { Icons } from '../../assets/icons/icons';
import TaskStackChart from './stackchart';

export class Tasks extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            isQuestionnaire: false, isnottesting: true,
            quesionnaireDetails: [],
            searchTermMain: "",
            callcomplete: true,
            openall: false,
            filterboxopen: false,
            existinggroups: [],
            subtaskload: false,
            chatload: false,
            ChatList: [],
            chatopen: false,
            showStarttimePicker: false,
            showendtimePicker: false,
            showdropdown: false,
            regionListFilter: [],
            //drawing filter states
            drawffromCDate: "",
            drawftoCDate: "",
            drawfstatus: TASK_FILTER_STATUS.Now,
            drawfurgent: false,
            drawfassignee: [],
            drawfstartDate: "",
            drawfendDate: "",
            drawfstartTime: "",
            drawfendTime: "",
            drawisChainUsers: false,
            drawisplanigoTaskOnly:this.props.signedobj.signinDetails.userRolls.systemMainRoleType===usrRoles.PA?true:false,
            //end filter states
            // filter states
            filterfromCDate: "",
            filtertoCDate: "",
            filterstatus: "",
            filterurgent: false,
            filterassignee: [],
            filterstartDate: "",
            filterendDate: "",
            filterstartTime: "",
            filterendTime: "",
            filterisChainUsers: false,
            filterisplanigoTaskOnly:this.props.signedobj.signinDetails.userRolls.systemMainRoleType===usrRoles.PA?true:false,
            // filter states
            filterStatus: TASK_FILTER_STATUS.Now,
            FBCheckList: null,
            FBText: null,
            FBradioList: null,
            countedNo: null,
            mideaAvailable: false,
            subTaskMedia: null,
            subTask: null,
            assignregionList: [],
            assignstoreList: [],
            assignworkerList: [],
            assignstlist: [],
            assignempList: [],
            regionList: [],
            storeList: [],
            workerList: [],
            isshowSideBar: false,
            aclicktaskDetails: {},
            isAttend: false,
            loading: false,
            toridata: [], isdataloaded: false,
            ftablebody: [],
            data: [],
            sobj: { taskName: "", isReqPagination: true, startIndex: 0, maxResult: 8, taskFeedSearchType: TASK_FILTER_STATUS.Now, taskId: null, regionIds: [], storeIds: [], storeNames: [], storeStatus: "", storeUrgent: false,planigoTasksOnly:this.props.signedobj.signinDetails.userRolls.systemMainRoleType===usrRoles.PA?true:false },
            showmodal: false,
            startpage: 1, totalresults: 0,
            pageItemsList: [], defaultPageCount: 10, currentPage: 1, totalPages: 0, //pagination
            isonloadtable: true, totalresultscount: 0,
            directModal: false,
            approveModal: false,
            approvedetails: {},
            excelexportdata: [], isexcellinkdisabled: false,
            showStackChart: false, oristackdata: [], fixedstackdata: { categories: [], series: [{ name: "In Progress", data: [] }, { name: "Late", data: [] }, { name: "Urgent", data: [] }] },
            selectedQuestionear: null, //questionear new task add,
            oneresultheight: 70, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles

            isAssignChangesAvailable: false,
        }
    }
    componentDidMount() {
        this._isMounted = true;
        if (this._isMounted) {
            this.props.history.listen((newLocation, action) => {
                if (newLocation && newLocation.pathname === "/tasks") {
                    this.ResetFilters()
                    this.getTriggerSearch()
                }
            });
            this.loadAllRegionsforfilter();
            this.loadRegions();
            this.loadStores();
            this.loadWorkers();
            var redx = JSON.parse(JSON.stringify(this.props.taskFeedState.taskfilterDetails));
            if (redx !== null) {
                var csobj = this.state.sobj;
                csobj["taskFeedSearchType"] = redx.filterStatus;
                csobj["taskId"] = "";
                csobj["onlyUrgent"] = redx.filterurgent;
                csobj["regionIds"] = redx.Regionids;
                csobj["isFilleterByDate"] = redx.isFilleterByDate;
                csobj["isFilterViaTaskCreatedDate"] = redx.isFilterViaTaskCreatedDate;
                csobj["fromDate"] = redx.Fdate;
                csobj["toDate"] = redx.Edate;
                csobj["createdStartDateFrom"] = redx.createdStartDateFrom;
                csobj["createdStartDateTo"] = redx.createdStartDateTo;
                csobj["isChainUsers"] = redx.filterisChainUsers;
                csobj["planigoTasksOnly"] = redx.filterisplanigoTaskOnly;
                this.setState({ sobj: csobj }, () => {
                    //check search saved object available
                    if (sessionStorage.getItem("feedsearchfilters")) {
                        var cfilterobj = JSON.parse(sessionStorage.getItem("feedsearchfilters"));
                        this.setState({ sobj: cfilterobj.sobj, startpage: cfilterobj.startpage, totalresults: cfilterobj.totalresults, currentPage: cfilterobj.currentPage,
                            maxShowresultcount: cfilterobj.maxShowresultcount, orimaxShowresultcount: cfilterobj.orimaxShowresultcount
                        }, () => {
                            this.handleTableSearch(null, "click");
                        });
                    } else {
                        var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,155)
                        this.setState({
                            maxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8),orimaxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8)
                        },()=>{
                            this.handleTableSearch(null, "click");
                        })
                    }
                })
            } else {
                //check search saved object available
                if (sessionStorage.getItem("feedsearchfilters")) {
                    var cfilterobj = JSON.parse(sessionStorage.getItem("feedsearchfilters"));
                    
                    this.setState({ sobj: cfilterobj.sobj, startpage: cfilterobj.startpage, totalresults: cfilterobj.totalresults, currentPage: cfilterobj.currentPage,
                        maxShowresultcount: cfilterobj.maxShowresultcount, orimaxShowresultcount: cfilterobj.orimaxShowresultcount
                    }, () => {
                        
                        this.handleTableSearch(null, "click");
                    });
                } else {
                    var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,155)
                
                    this.setState({
                        maxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8),orimaxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8)
                    },()=>{
                        this.handleTableSearch(null, "click");
                    })
                }
            }
            this.notficationChat();
            //load new task if questnear selected object available
            if (this.props.questionState && this.props.questionState.selectedQuestionear && this.props.questionState.selectedQuestionear.isshowmodal) {
                const cselectedobj = JSON.parse(JSON.stringify(this.props.questionState.selectedQuestionear));
                this.props.setTaskView(null);
                this.setState({ selectedQuestionear: cselectedobj.obj, showmodal: true }, () => {
                    this.props.setSelectedQuesionear(null);
                });
            }
        }
        //console.log(this.props);
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    //reset search 
    getTriggerSearch = () => {
        this.setState({ sobj: { taskName: "", isReqPagination: true, startIndex: 0, maxResult: 8, taskFeedSearchType: TASK_FILTER_STATUS.Now, taskId: null, regionIds: [], storeIds: [], storeNames: [], storeStatus: "", storeUrgent: false }, currentPage: 1 }, () => {
            this.handleTableSearch(null, "click");
        });
    }
    //notfication
    notficationChat = () => {
        if (this.props.taskFeedState.tasktableDetails && this.props.taskFeedState.tasktableDetails.taskdetail !== null && this.props.taskFeedState.tasktableDetails.taskdetail.payloadTypeId === "3") {
            var taskdetails = {
                taskId: this.props.taskFeedState.tasktableDetails.taskdetail.taskId,
            }
            this.props.setTaskSummeryID(taskdetails)
            var task = { taskAllocationDetailId: this.props.taskFeedState.tasktableDetails.taskdetail.taskCommentedAllocationId }
            this.getSubTask(task)
            this.handledirectModal(true);
            this.getChatDetails(this.props.taskFeedState.tasktableDetails.taskdetail.taskCommentedAllocationId)
            this.setState({ chatopen: true })
        }
    }
    //#TSK-STP-H01 get stack chart store counts
    loadStackChartData = () => {
        this.setState({ loading: true });
        submitSets(submitCollection.getFeedChartCounts).then(res => {
            //#TSK-STP-H02
            var oristackdata = [];
            var cstackdata = { categories: [], series: [{ name: this.props.t("URGENT"), data: [] }, { name: this.props.t("LATE"), data: [] }, { name: this.props.t("IN_PROGRESS"), data: [] }] };
            var otherobj = null;
            if (res && res.status && res.extra && res.extra.length > 0) {
                for (let i = 0; i < res.extra.length; i++) {
                    const storeitem = res.extra[i];
                    if (storeitem.storeDto) {
                        var inprogcount = 0;
                        var latecount = 0;
                        var urgentcount = 0;
                        //get inprogress count
                        if (storeitem.inProgressCount && storeitem.inProgressCount > 0) {
                            inprogcount = storeitem.inProgressCount;
                        }
                        //get late count
                        if (storeitem.lateCount && storeitem.lateCount > 0) {
                            latecount = storeitem.lateCount;
                        }
                        //get urgent count
                        if (storeitem.urgentCount && storeitem.urgentCount > 0) {
                            urgentcount = storeitem.urgentCount;
                        }
                        if (storeitem.storeDto.storeName) {
                            if (storeitem.storeDto.storeName !== "Other") {
                                cstackdata.categories.push(storeitem.storeDto.storeName ? storeitem.storeDto.storeName : this.props.t("NOSTORE"));
                                cstackdata.series[0].data.push(urgentcount);
                                cstackdata.series[1].data.push(latecount);
                                cstackdata.series[2].data.push(inprogcount);
                                oristackdata.push(storeitem);
                            } else {
                                otherobj = { urgentcount: urgentcount, latecount: latecount, inprogcount: inprogcount, storeitem: storeitem };
                            }
                        }
                    }
                }
            }
            //if other object available
            if (otherobj) {
                cstackdata.categories.unshift(this.props.t("HEADQUATERS"));
                cstackdata.series[0].data.unshift(otherobj.urgentcount);
                cstackdata.series[1].data.unshift(otherobj.latecount);
                cstackdata.series[2].data.unshift(otherobj.inprogcount);
                oristackdata.unshift(otherobj.storeitem);
            }
            this.setState({ oristackdata: oristackdata, fixedstackdata: cstackdata, loading: false }, () => {
                this.handleToggleChartView();
            });
        })
    }
    //employeeloadcall
    loadRegions = () => {
        submitSets(submitCollection.getTaskRegionList).then(res => {
            //console.log(res);
            if (res) {
                this.setState({ regionList: res.extra })
            }
        })
    }
    //load store list
    loadStores = () => {
        var obj = {}
        if (this.props.signedobj.signinDetails.userRolls.userLevel === usrLevels.RG) {
            obj["regionId"] = this.props.signedobj.signinDetails.userRolls.regionId
        }
        submitSets(submitCollection.getTaskStoreList, obj).then(res => {
            if (res) {
                this.setState({ storeList: res.extra })
            }
        })
    }
    //load worker l;ist
    loadWorkers = () => {
        submitSets(submitCollection.getTaskWorkerList).then(res => {
            if (res) {
                //filter worker list by removing signed user
                var wklist = res.extra
                var newwklist = wklist.filter(x => x.userId !== this.props.signedobj.signinDetails.id);
                this.setState({ workerList: newwklist })
            }
        })
    }
    //sidebar functions
    showSidebar = () => { this.setState({ isshowSideBar: true, }); }
    hideSidebar = () => {
        this.setState({
            openall: false,
            filterboxopen: false,
            isshowSideBar: false,
            aclicktaskDetails: {},
            assignregionList: [],
            assignstoreList: [],
            assignworkerList: [],
            assignstlist: [],
            assignempList: [],
            existinggroups: [],
            searchTermMain: "",
        });
    }
    //get single task call
    getsingletaskcall = (taskid) => {
        submitSets(submitCollection.getSingleTask, ('?taskId=' + taskid), true).then(res => {
            if (res && res.status) {
                this.setState({ existinggroups: res.extra.taskHasUserGroups })
            } else {
                alertService.error(this.props.t('DATA_LOADING_FAIL'))
            }
        });
    }
    //assign handle
    handleAssign = (task) => {
        this.getsingletaskcall(task.taskId);
        this.showSidebar();

        this.setState({ aclicktaskDetails: task, isAssignChangesAvailable: false }, () => {
            this.getassigners();
        })
    }
    //set assignlist from call to state
    setAssignlistfromcall = () => {
        var cassignempList = this.state.assignempList
        var assignregionList = this.state.regionList;
        var assignstoreList = this.state.storeList;
        var assignworkerList = this.state.workerList;
        //set region list
        assignregionList.forEach(element => {
            var exist = cassignempList.find(x => x.taskAllcationDetailDto[0].reciverUuid === element.userUUID);
            element["reciverUuid"] = element.userUUID
            if (exist) {
                element["isAllocate"] = exist.taskAllcationDetailDto[0].isAllocate;
                element["isTaskAttended"] = exist.taskAllcationDetailDto[0].isTaskAttended;
                element["isSelected"] = true
            } else {
                element["isSelected"] = false
            }
        });
        //set store list
        assignstoreList.forEach(Selement => {
            var exist = cassignempList.find(x => x.taskAllcationDetailDto[0].reciverUuid === Selement.userUUID);
            Selement["reciverUuid"] = Selement.userUUID
            if (exist) {
                Selement["isAllocate"] = exist.taskAllcationDetailDto[0].isAllocate;
                Selement["isTaskAttended"] = exist.taskAllcationDetailDto[0].isTaskAttended;
                Selement["isSelected"] = true
            } else {
                Selement["isSelected"] = false
            }
        });
        //set store list
        assignworkerList.forEach(welement => {
            var exist = cassignempList.find(x => x.taskAllcationDetailDto[0].reciverUuid === welement.userUUID);
            welement["reciverUuid"] = welement.userUUID
            if (exist) {
                welement["isAllocate"] = exist.taskAllcationDetailDto[0].isAllocate;
                welement["isTaskAttended"] = exist.taskAllcationDetailDto[0].isTaskAttended;
                welement["isSelected"] = true
            } else {
                welement["isSelected"] = false
            }
        });
        this.setState({ assignregionList: assignregionList, assignstoreList: assignstoreList, assignworkerList: assignworkerList }, () => {
            // console.log(this.state.assignregionList);
        })
    }
    //assgned employee call
    getassigners = () => {
        this.setState({ loading: true })
        submitSets(submitCollection.getTaskAssignees, ('?taskId=' + this.state.aclicktaskDetails.taskId), true).then(res => {
            if (res && res.status) {
                this.setState({ loading: false, assignempList: res.extra }, () => {
                    this.setAssignlistfromcall();
                })
            } else {
                //
            }
        });
    }
    //filter search
    handleTableSearch = (evt, etype, searchtype) => {
        if (this.state.isnottesting) {
            if (searchtype === "keysearch") {
                var csobj = this.state.sobj;
                csobj["startIndex"] = 0;
                this.setState({ sobj: csobj, startpage: 1, totalresults: 0, pageItemsList: [], defaultPageCount: 10, currentPage: 1, totalPages: 0, isonloadtable: true, totalresultscount: 0, }, () => {
                    this.serachcall(evt, etype, searchtype);
                })
            } else {
                if (this.props.taskFeedState.tasktableDetails && this.props.taskFeedState.tasktableDetails.taskdetail !== null) {
                    var cnotifitask = this.props.taskFeedState.tasktableDetails.taskdetail;
                    var newsobj = {
                        isReqPagination: true,
                        maxResult: 8,
                        regionIds: [],
                        startIndex: 0,
                        storeIds: [],
                        storeNames: [],
                        storeStatus: "",
                        storeUrgent: false,
                        taskFeedSearchType: (cnotifitask.payloadTypeId === "2"?"Done":"Now"),
                        taskName: "",
                        taskId: cnotifitask.taskId
                    }

                    this.props.setFilters(null);
                    this.setState({
                        drawfstatus: TASK_FILTER_STATUS.Now,
                        drawfurgent: false,
                        drawfassignee: [],
                        drawfstartDate: "",
                        drawfendDate: "",
                        drawfstartTime: "",
                        drawfendTime: "",
                        drawffromCDate: "",
                        drawftoCDate: "",
                        drawisChainUsers: false,
                        drawisplanigoTaskOnly:false,
                        sobj: newsobj,
                        showdropdown: false
                    }, () => {
                        // ccsobj["taskId"] = this.props.taskFeedState.tasktableDetails.taskdetail.taskId;
                        var ccsobj = this.state.sobj;
                        this.serachcall(evt, etype, searchtype);
                        ccsobj["taskId"] = null;
                    })

                } else {
                    this.serachcall(evt, etype, searchtype);
                }
            }
        }
    }
    //search call
    serachcall = (evt, etype, searchtype) => {
        if (etype === "click" || (etype === "enter" && evt.which === 13)) {
            var maxresutcount = this.state.maxShowresultcount;
            var csobj=this.state.sobj
            csobj.maxResult = maxresutcount;
            this.setState({
                isdataloaded: false, loading: true,
            });
            sessionStorage.removeItem("feedsearchfilters");
            submitSets(submitCollection.getTasks, csobj, true).then(res => {
                // var cdata = this.state.toridata;
                var cdata = [];
                if (res && res.status) {
                    var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                    if (cpageidx > -1) {
                        cdata[cpageidx].data = res.extra;
                    } else {
                        cdata.push({ page: (this.state.startpage), data: res.extra });
                    }
                    this.setState({
                        isdataloaded: true, loading: false,
                        toridata: cdata,
                        totalresults: ((this.state.startpage === 1 || this.state.sobj.isReqCount) ? res.count : this.state.totalresults),
                    }, () => {
                        //console.log(this.state.totalresults);
                        this.loadTableData();
                        this.props.setFeedTableData({ data: res.extra, taskdetail: null })
                    });
                } else {
                    this.setState({
                        isdataloaded: true, loading: false,
                        toridata: cdata,
                    }, () => {
                        this.loadTableData();
                        this.props.setFeedTableData({ data: null, taskdetail: null })
                    });
                }
            });
        }
    }
    // click edit
    handleEditClick = (id, attend) => {
        this.setState({ loading: true, isAttend: attend })
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if (cfindList) {
            submitSets(submitCollection.findTaskByID, ('?taskId=' + id), true).then(res => {
                if (res && res.status) {
                    this.setState({ loading: false })
                    this.props.setTaskView(res.extra);
                    // console.log(this.loading);
                    this.handleModalToggle();
                    // this.props.history.push('/products/details');
                } else {
                    //
                }
            });
        }
    }
    //save filter object
    saveFilterObject = (startpage, sobj, totalresults, currentPage) => {
        const sfobj = { startpage: startpage, sobj: sobj, totalresults: totalresults, currentPage: currentPage,maxShowresultcount: this.state.maxShowresultcount, orimaxShowresultcount: this.state.orimaxShowresultcount };
        sessionStorage.setItem("feedsearchfilters", JSON.stringify(sfobj));
    }
    //table data load
    loadTableData = () => {
        var cdata = [];
        if (this.state.toridata && this.state.toridata.length > 0) {
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
            if (cfindList) {
                cdata = cfindList.data
            }
        }
        this.setState({ ftablebody: cdata }, () => {
            if (this.state.currentPage > 1) {
                this.setPage(this.state.currentPage, false);
            } else {
                this.setPage(1, false);
            }
        });
        // this.saveFilterObject(this.state.startpage, this.state.sobj, this.state.totalresults, this.state.currentPage);

    }
    handleModalToggle = (type, isredirectquest) => {
        const cselectedquestion = JSON.parse(JSON.stringify(this.state.selectedQuestionear));
        this.setState({ showmodal: !this.state.showmodal, selectedQuestionear: null }, () => {
            if (isredirectquest) {
                this.props.setSelectedQuesionear({ isshowmodal: false, obj: cselectedquestion });
                this.props.history.push("/questionlist");
            }
        });
    }
    //page change
    handlePageChange = (cstartpage) => {
        var cfindList = this.state.toridata.find(x => x.page === cstartpage);
        var csobj = this.state.sobj;
        //request 
        if (cstartpage === this.state.totalPages) {
            csobj["isReqCount"] = true
        } else {
            csobj["isReqCount"] = false
        }
        csobj.startIndex = ((cstartpage - 1) * this.state.sobj.maxResult);
        this.setState({ sobj: csobj, startpage: cstartpage, isdataloaded: false }, () => {
            if (cfindList) {
                this.setState({ isdataloaded: true });
                this.loadTableData();
            } else {
                this.handleTableSearch(null, "click");
            }
        });
    }
    //pager
    setPage = (cpage, isnewpage) => {
        var pageLength = (this.state.sobj.maxResult ? this.state.sobj.maxResult : this.state.defaultPageCount);
        var citems = (this.state.ftablebody ? JSON.parse(JSON.stringify(this.state.ftablebody)) : []);
        var pager = getPager(this.state.totalresults, cpage, pageLength);
        // check page isn't out of range
        if (cpage < 1 || cpage > pager.totalPages) {
            this.setState({
                pageItemsList: [],
                currentPage: 1,
                totalPages: 0
            });
            return;
        }
        var cfindList = (this.state.toridata ? this.state.toridata.find(x => x.page === this.state.newstartpage) : undefined);
        if (isnewpage) {
            if (cfindList && cfindList) {
                this.setState({
                    ftablebody: cfindList.data
                });
            } else {
                this.handlePageChange(cpage);
            }
        }
        this.setState({
            pageItemsList: citems,
            currentPage: pager.currentPage,
            totalPages: pager.totalPages,
            isonloadtable: false,
        });
    }
    
    //clear isAttend
    clearisattend = () => {
        this.setState({ isAttend: false })
    }
    handlevchange = (evt, type) => {
        var csobj = this.state.sobj;
        if (type === "filter") {
            csobj["startIndex"] = 0;
            csobj["taskFeedSearchType"] = evt.target.value
        }
        this.setState({ sobj: csobj, startpage: 1, currentPage: 1 }, () => {
            this.handleTableSearch(null, "click");
        })
    }
    handleFilterObject = (evt, etype, ctype,msg) => {
        var csobj = this.state.sobj;
        if(etype === "taskName"){
            if(!preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault()
                return
              }
        }
        if (etype !== null) {
            csobj[etype] = evt.target.value;
        }
        this.setState({ sobj: csobj }, () => {
            if (ctype === "click" || (ctype === "enter" && evt.which === 13)) {
                this.handleTableSearch(null, "click", "keysearch");
            }
        })
    }
    //task recivers view 
    getAssigedtoViewName = (obj) => {
        var stringName = ""
        obj.forEach(reciever => {
            if (stringName !== "") {
                stringName += ", "
            }
            if (reciever.userRolls && reciever.userRolls.userLevel === usrLevels.RG) {
                if (reciever.userRolls.regionName) {
                    stringName += (reciever.userRolls.regionName + " Region");
                } else {
                    stringName += reciever.name;
                }
            } else
                if (reciever.userRolls && reciever.userRolls.systemMainRoleType === usrRoles.SM) {
                    if (reciever.userRolls.storeName) {
                        stringName += (reciever.userRolls.storeName + " Store");
                    } else {
                        stringName += reciever.name;
                    }
                } else {
                    stringName += reciever.name;
                }
        });
        stringName = ((stringName).length > 44) ?
            (((stringName).substring(0, 44 - 3)) + '...') :
            stringName
        return stringName
    }
    //colors add for status
    statusColors = (type, status) => {
        if (type === "dot") {
            return { background: (status === "Done" || status === "Approve" ? "#3e8117" : status === "Not Done" ? "#f7e4a9" : status === "Late" ? "#C72C2C" : status === "pending" ? "#f7e4a9" : status === TaskStatusENUM.InProgress ? "#FBB157 " : status === TaskStatusENUM.ICanNotDo ? "#E44633" : "#f7e4a9") };
        } else {
            return { color: (status === "Done" || status === "Approve" ? "#57b521" : status === "Not Done" ? "#815e16" : status === "Late" ? "#F92121" : status === "pending" ? "#815e16" : status === TaskStatusENUM.InProgress ? "#FBB157 " : status === TaskStatusENUM.ICanNotDo ? "#E44633" : "#f7e4a9") };
        }
    }
    //names add for status
    statusNameView = (status) => {
        var string = ""
        if (status) {
            if (status === TaskStatusENUM.Pending) {
                string = this.props.t('OPEN')
            }
            if (status === TaskStatusENUM.Done) {
                string = this.props.t('DONE')
            }
            if (status === TaskStatusENUM.NotDone) {
                string = this.props.t('NOTDONE')
            }
            if (status === TaskStatusENUM.approve) {
                string = this.props.t('APPROVE')
            }
            if (status === TaskStatusENUM.ICanNotDo) {
                string = this.props.t('I_CANNOT_DO')
            }
            if (status === TaskStatusENUM.Late) {
                string = this.props.t('LATE')
            }
            if (status === TaskStatusENUM.InProgress) {
                string = this.props.t('IN_PROGRESS')
            }
        }
        return string
    }
    //delete
    //#TSK-DL-FEEDM1 
    handleDelete = (task) => {
        var deleteobj = {
            taskId: task.taskId,
            isDelete: true
        };
        confirmAlert({
            title: this.props.t('CONFIRM_DELETE_TASK'),
            message: this.props.t('ARE_YOU_SURE_DELETE_THIS_TASK'),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.setState({ loading: true })
                    submitSets(submitCollection.deletetask, deleteobj, true, null, true).then(res => {
                        if (res && res.status) {
                            alertService.success(this.props.t('TASK_IS_DELETED'));
                            this.handleTableSearch(null, "click");
                        }
                        else {
                            this.setState({ loading: false })
                            // alertService.error((res && res.extra ? res.extra : this.props.t('ERROR_OCCURRED')));
                        }
                    })
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }
    // state assginee list  push dataa
    //#TSK-ASSI-1
    Assigneehandle = (id, type) => {
        var cassregionList = this.state.assignregionList;
        var cassignstoreList = this.state.assignstoreList;
        var cassignworkerList = this.state.assignworkerList;
        if (type === "region") {
            var alreadyhave = cassregionList.find(x => x.reciverUuid === id);
            if (alreadyhave.isSelected) {
                alreadyhave.isSelected = false;
            } else {
                alreadyhave.isSelected = true;
            }
            this.setState({ assignregionList: cassregionList, isAssignChangesAvailable: true })
        }
        if (type === "store") {
            var alreadyhaves = cassignstoreList.find(x => x.reciverUuid === id);
            if (alreadyhaves.isSelected) {
                alreadyhaves.isSelected = false;
            } else {
                alreadyhaves.isSelected = true;
            }
            this.setState({ assignstoreList: cassignstoreList, isAssignChangesAvailable: true })
        }
        if (type === "worker") {
            var alreadyhavew = cassignworkerList.find(x => x.reciverUuid === id);
            if (alreadyhavew.isSelected) {
                alreadyhavew.isSelected = false;
            } else {
                alreadyhavew.isSelected = true;
            }
            this.setState({ assignworkerList: cassignworkerList, isAssignChangesAvailable: true })
        }
    }
    //apply assginee all
    applyAllassinees = (slist, grouplist) => {
        var saveallocation = []
        var emplistex = JSON.parse(JSON.stringify(this.state.assignempList))
        slist.forEach(element => {
            if (element.isSelected) {
                var exist = emplistex.find(v => v.taskAllcationDetailDto[0].reciverUuid === element.userUUID);
                if (exist) {
                    if (exist.taskAllcationDetailDto[0].isDelete === true) {
                        exist["isDelete"] = false
                        exist.taskAllcationDetailDto[0]["isDelete"] = false;
                    }
                    saveallocation.push(exist);
                } else {
                    var tadto = []
                    var ob = {
                        reciverUuid: element.userUUID,
                        isNew: true
                    }
                    tadto.push(ob);
                    var nobj = {
                        reciverRole: tadto.systemMainRoleType,
                        allocatorUuid: this.props.signedobj.signinDetails.userUUID,
                        taskId: this.state.aclicktaskDetails.taskId,
                        isNew: true,
                        taskAllcationDetailDto: tadto
                    }
                    saveallocation.push(nobj)
                }
            } else {
                var existl = emplistex.find(v => v.taskAllcationDetailDto[0].reciverUuid === element.userUUID);
                if (existl) {
                    if (existl.taskAllcationDetailDto[0].isDelete === true) {
                        existl["isDelete"] = false
                        existl.taskAllcationDetailDto[0]["isDelete"] = false
                    } else {
                        existl["isDelete"] = true
                        existl.taskAllcationDetailDto[0]["isDelete"] = true
                    }
                    saveallocation.push(existl);
                } else {

                }
            }
        })
        var savegroulist = [];
        grouplist.forEach(gelegroup => {
            if (gelegroup.isSelected === true) {
                var object = {
                    groupUUID: gelegroup.uuid,
                    groupId: gelegroup.id,
                    groupName: gelegroup.groupName,
                    taskHasUserGroupId: -1,
                    isNew: true,
                    isDelete: false
                }
                savegroulist.push(object)
            }
        });
        this.state.existinggroups.forEach(exelement => {
            exelement["isDelete"] = true;
            savegroulist.push(exelement)
        });
        var saveobj = { taskAllocation: saveallocation, taskHasUserGroups: savegroulist }
        var validation = this.assigneevalidation(saveobj);
        //calling save
        if (validation) {
            this.applysavecall(saveobj);
        }
    }
    //apply button trigger
    applyAssignees = () => {
        if(this.state.isAssignChangesAvailable){

            var saveallocation = [];
            var emplistex = JSON.parse(JSON.stringify(this.state.assignempList))
            //check from  region list
            this.state.assignregionList.forEach(element => {
                if (element.isSelected) {
                    var exist = emplistex.find(v => v.taskAllcationDetailDto[0].reciverUuid === element.reciverUuid);
                    if (exist) {
                        if (exist.taskAllcationDetailDto[0].isDelete === true) {
                            exist["isDelete"] = false
                            exist.taskAllcationDetailDto[0]["isDelete"] = false;
                        }
                        saveallocation.push(exist);
                    } else {
                        var tadto = []
                        tadto.push(element);
                        element["isNew"] = true;
                        var nobj = {
                            reciverRole: tadto.systemMainRoleType,
                            allocatorUuid: this.props.signedobj.signinDetails.userUUID,
                            taskId: this.state.aclicktaskDetails.taskId,
                            isNew: true,
                            taskAllcationDetailDto: tadto
                        }
                        saveallocation.push(nobj)
                    }
                    //look is in emp list
                } else {
                    var existl = emplistex.find(v => v.taskAllcationDetailDto[0].reciverUuid === element.reciverUuid);
                    if (existl) {
                        if (existl.taskAllcationDetailDto[0].isDelete === true) {
                            existl["isDelete"] = false
                            existl.taskAllcationDetailDto[0]["isDelete"] = false
                        } else {
                            existl["isDelete"] = true
                            existl.taskAllcationDetailDto[0]["isDelete"] = true
                        }
                        saveallocation.push(existl);
                    } else {
                    }
                }
            });
            //check from  store list
            this.state.assignstoreList.forEach(element => {
                if (element.isSelected) {
                    var exist = emplistex.find(v => v.taskAllcationDetailDto[0].reciverUuid === element.reciverUuid);
                    if (exist) {
                        if (exist.taskAllcationDetailDto[0].isDelete === true) {
                            exist["isDelete"] = false
                            exist.taskAllcationDetailDto[0]["isDelete"] = false;
                        }
                        saveallocation.push(exist);
                    } else {
                        var tadto = []
                        tadto.push(element);
                        element["isNew"] = true;
                        var nobj = {
                            reciverRole: tadto.systemMainRoleType,
                            allocatorUuid: this.props.signedobj.signinDetails.userUUID,
                            taskId: this.state.aclicktaskDetails.taskId,
                            isNew: true,
                            taskAllcationDetailDto: tadto
                        }
                        saveallocation.push(nobj)
                    }
                    //look is in emp list
                } else {
                    var existl = emplistex.find(v => v.taskAllcationDetailDto[0].reciverUuid === element.reciverUuid);
                    if (existl) {
                        if (existl.taskAllcationDetailDto[0].isDelete === true) {
                            existl["isDelete"] = false
                            existl.taskAllcationDetailDto[0]["isDelete"] = false
                        } else {
                            existl["isDelete"] = true
                            existl.taskAllcationDetailDto[0]["isDelete"] = true
                        }
                        saveallocation.push(existl);
                    } else {
    
                    }
                }
            });
            //check from  worker list
            this.state.assignworkerList.forEach(element => {
                if (element.isSelected) {
                    var exist = emplistex.find(v => v.taskAllcationDetailDto[0].reciverUuid === element.reciverUuid);
                    if (exist) {
                        if (exist.taskAllcationDetailDto[0].isDelete === true) {
                            exist["isDelete"] = false
                            exist.taskAllcationDetailDto[0]["isDelete"] = false;
                        }
                        saveallocation.push(exist);
                    } else {
                        var tadto = []
                        tadto.push(element);
    
                        element["isNew"] = true;
                        var nobj = {
                            reciverRole: tadto.systemMainRoleType,
                            allocatorUuid: this.props.signedobj.signinDetails.userUUID,
                            taskId: this.state.aclicktaskDetails.taskId,
                            isNew: true,
                            taskAllcationDetailDto: tadto
                        }
                        saveallocation.push(nobj)
                    }
                    //look is in emp list
                } else {
                    var existl = emplistex.find(v => v.taskAllcationDetailDto[0].reciverUuid === element.reciverUuid);
                    if (existl) {
                        if (existl.taskAllcationDetailDto[0].isDelete === true) {
                            existl["isDelete"] = false
                            existl.taskAllcationDetailDto[0]["isDelete"] = false
                        } else {
                            existl["isDelete"] = true
                            existl.taskAllcationDetailDto[0]["isDelete"] = true
                        }
                        saveallocation.push(existl);
                    } else {
    
                    }
                }
    
            });
    
            //adding other userlevel user list to this
            this.state.assignempList.forEach(prevelement => {
                var exitprev = saveallocation.find(n => n.taskAllcationDetailDto[0].reciverUuid === prevelement.taskAllcationDetailDto[0].reciverUuid)
                if (!exitprev) {
                    saveallocation.push(prevelement)
                }
            });
            
            var saveobj = { taskAllocation: saveallocation }
            var validation = this.assigneevalidation(saveobj);
            //calling save
            if (validation) {
                this.applysavecall(saveobj);
            }
        } else{
            alertService.error(this.props.t("NO_CHANGES_AVAILABLE"));
        }
    }
    // assignee validation
    assigneevalidation = (obj) => {
        var allow = true
        var istaskallocationlist = obj.taskAllocation.length === 0;
        var isalloctionlistnotdelete = obj.taskAllocation.filter(x => x.taskAllcationDetailDto[0].isDelete !== true)
        if (istaskallocationlist) {
            alertService.error(this.props.t("PLEASE_SELECT_AT_LEAST_ON_ASSIGNEE"));
            return false
        }
        if (isalloctionlistnotdelete.length === 0) {
            alertService.error(this.props.t("PLEASE_SELECT_AT_LEAST_ON_ASSIGNEE"));
            return false
        }
        return allow
    }
    applysavecall = (saveobj) => {
        this.setState({ callcomplete: false }, () => {
            submitSets(submitCollection.saveTaskAssign, saveobj, true, null, true).then(resp => {
                if (resp && resp.status) {
                    this.setState({ callcomplete: true })
                    alertService.success(this.props.t("TASK_ASSIGN_DETAILS_SAVED"));
                    this.hideSidebar();
                    this.handleTableSearch(null, "click");
                } else {
                    this.setState({ callcomplete: true })
                    // alertService.error((resp && resp.extra ? resp.extra : this.props.t('ERROR_OCCURRED')));
                }
            });
        });
    }
    //click on a row to summery
    rowclick = (task) => {
        var taskdetails = {
            taskId: task.taskId,
            isApprover: task.isApprover,
            isBottomLevel: task.isBottomLevel,
            taskStartDateTime: task.taskStartDateTime,
            isRequestPhoto: task.isRequestPhoto,
            isRequestVideo: task.isRequestVideo
        }
        this.props.setTaskSummeryID(taskdetails)
        if (task.isBottomLevel) {
            this.getSubTask(task)
            this.handledirectModal(true);
        } else {
            this.props.history.push("tasks/summery");
        }
        this.saveFilterObject(this.state.startpage, this.state.sobj, this.state.totalresults, this.state.currentPage);
    }
    // open model of direct modal
    handledirectModal = (value) => {
        this.setState({ directModal: value })
    }
    closeModal = () => {
        this.handledirectModal(false);
        this.setState({
            chatload: false,
            ChatList: [],
            chatopen: false,
            FBCheckList: null,
            FBText: null,
            FBradioList: null,
            countedNo: null,
            mideaAvailable: false,
            subTaskMedia: null,
            subTask: null,
            quesionnaireDetails: [],
            isQuestionnaire: false,
        })
    }
    //chat call send
    getChatDetails = (notfication) => {
        this.setState({ chatload: true }, () => {
            var headerobj = {
                taskAllocationDetailId: (notfication !== undefined && notfication !== null) ? notfication : this.state.subTask && this.state.subTask.taskAllocationDetailId,
                isReqPagination: false,
                startIndex: 0,
                maxResult: 0
            }
            submitSets(submitCollection.taskgetComment, headerobj, true, null, true).then(resp => {
                if (resp && resp.status) {
                    this.setState({ ChatList: resp.extra, chatload: false })
                } else {
                    this.setState({ chatload: false })
                    // alertService.error((resp && resp.extra ? resp.extra : this.props.t('ERROR_OCCURRED')));
                }
            });
        })
    }
    //get sub task details call
    getSubTask = (assignee) => {
        this.setState({ subtaskload: true }, () => {
            submitSets(submitCollection.getSubTask, "/" + assignee.taskAllocationDetailId, true).then(res => {
                if (res && res.status) {
                    this.setState({ subtaskload: false })
                    this.setSubtaskcallState(res.extra, assignee)
                } else {
                    this.setState({ subtaskload: false })
                }
            })
        })
    }
    //set completiondetails on load
    setCompletiondetails = (details) => {
        var list = []
        if (details.length > 0) {
            details.forEach(compdetails => {
                compdetails["isSelected"] = false;
                list.push(compdetails)
            });
        }
        return list
    }
    //set state in subtaskcall
    setSubtaskcallState = (extra, assignee) => {
        var mediaAvaillbel = this.state.mideaAvailable;
        var csubtask = extra;
        var subtaskmedia = [];
        var Fbcount = null;
        var Fbradio = this.state.FBradioList
        var Fbchecklist = this.state.FBCheckList
        var FbText = this.state.FBText
        var quesionnaireDetails = [];
        var isQuestionnaire = false;
        // set if questionnaire
        if (extra.questionnaireCompletionDetails.length > 0) {
            isQuestionnaire = true;
            quesionnaireDetails = this.setCompletiondetails(extra.questionnaireCompletionDetails)
        }
        //subtaskset
        csubtask["startTime"] = extra.taskStartDate;
        csubtask["taskReceiverInfo"] = extra.receiverUserInformation;
        //set ismedia available
        // if (this.props.taskFeedState.taskSummeryID.isRequestPhoto || this.props.taskFeedState.taskSummeryID.isRequestPhoto) {
        if (extra.isRequestPhoto || extra.isRequestVideo) {
            mediaAvaillbel = true;
        }
        //subtaskmedia set
        if (extra.taskCompletionDetails.length > 0) {
            var pmedia = extra.taskCompletionDetails.find(x => x.feedbackType === FEEDBACK_PHOTO.name);
            if (pmedia) {
                pmedia.taskCompletionMediaList.forEach(photo => {
                    subtaskmedia.push(photo)
                });
            }
            var vmedia = extra.taskCompletionDetails.find(x => x.feedbackType === FEEDBACK_VIDEO.name);
            if (vmedia) {
                vmedia.taskCompletionMediaList.forEach(video => {
                    subtaskmedia.push(video)
                });
            }
            //if feedback type number
            var fbNo = extra.taskCompletionDetails.find(x => x.feedbackType === FEEDBACK_NUMBER.name);
            if (fbNo) {
                Fbcount = fbNo.answer;
            }
            //if feedback type radio list
            var fbradio = extra.taskCompletionDetails.find(x => x.feedbackType === FEEDBACK_RADIO.name);
            if (fbradio) {
                Fbradio = fbradio.taskcompletionOptionAnwsersList;
            }
            //if feedback type check list
            var fbchecklist = extra.taskCompletionDetails.find(x => x.feedbackType === FEEDBACK_CHECKBOXES.name);
            if (fbchecklist) {
                Fbchecklist = fbchecklist.taskcompletionOptionAnwsersList;
            }
            //if feedback type text
            var fbtext = extra.taskCompletionDetails.find(x => x.feedbackType === FEEDBACK_TEXT.name);
            if (fbtext) {
                //   console.log("texyt innnnn");
                FbText = fbtext.answer;
            }
        }
        this.setState({ isQuestionnaire: isQuestionnaire, quesionnaireDetails: quesionnaireDetails, mideaAvailable: mediaAvaillbel, subTask: csubtask, subTaskMedia: subtaskmedia, countedNo: Fbcount, FBradioList: Fbradio, FBCheckList: Fbchecklist, FBText: FbText }, () => {
        })
    }
    //task approve 
    approveHandle = (task) => {
        this.taskApprvetoggle(true);
        this.setState({ approvedetails: task }, () => {
            // console.log(this.state.approvedetails);
        })

    }
    //task approve modele handle
    taskApprvetoggle = (value) => {
        this.setState({ approveModal: value })
    }
    CloseAModal = () => {
        this.taskApprvetoggle(false);
        this.setState({ approvedetails: {}, })
    }
    closeDropdown = (evt) => {
        if (!evt) {
            // closing filters
            this.clearingFilterstates();
            this.setState({ showdropdown: false, showStarttimePicker: false, showendtimePicker: false })
        } else {
            // opening filters
            this.existingfiltersetinOpen()
            this.setState({ showdropdown: true })
        }
    }
    // existing filters set to state
    existingfiltersetinOpen = () => {
        var reduxobj = JSON.parse(JSON.stringify(this.props.taskFeedState.taskfilterDetails))
        //console.log(reduxobj);
        if (reduxobj !== null) {
            var filter = reduxobj
            this.setState({
                drawfstatus: filter.filterStatus !== "" ? filter.filterStatus : TASK_FILTER_STATUS.Now,
                drawfurgent: filter.filterurgent,
                drawfstartDate: filter.filterstartDate !== "" ? new Date(filter.filterstartDate) : "",
                drawfendDate: filter.filterendDate !== "" ? new Date(filter.filterendDate) : "",
                drawfstartTime: filter.filterstartTime,
                drawfendTime: filter.filterendTime,
                drawfassignee: filter.filterassignee,
                drawffromCDate: filter.filterfromCDate !== "" ? new Date(filter.filterfromCDate) : "",
                drawftoCDate: filter.filtertoCDate !== "" ? new Date(filter.filtertoCDate) : "",
                drawisChainUsers: filter.filterisChainUsers,
                drawisplanigoTaskOnly:filter.filterisplanigoTaskOnly
            });
        } else {
            var ass = [...this.state.filterassignee]
            this.setState({
                drawfstatus: this.state.filterStatus !== "" ? this.state.filterStatus : TASK_FILTER_STATUS.Now,
                drawfurgent: this.state.filterurgent,
                drawfstartDate: this.state.filterstartDate,
                drawfendDate: this.state.filterendDate,
                drawfstartTime: this.state.filterstartTime,
                drawfendTime: this.state.filterendTime,
                drawfassignee: ass.length > 0 ? ass : [],
                drawffromCDate: this.state.filterfromCDate,
                drawftoCDate: this.state.filtertoCDate,
                drawisChainUsers: this.state.filterisChainUsers,
                drawisplanigoTaskOnly:this.state.filterisplanigoTaskOnly
            })
        }
    }
    // apply filters 
    ApplyFilterSerach = (type) => {
        var csobj = this.state.sobj;
        csobj.storeStatus = (this.state.drawfstatus === this.state.filterStatus ? csobj.storeStatus : "");
        csobj.storeUrgent = (this.state.drawfurgent === this.state.filterurgent ? csobj.storeUrgent : false);
        this.setState({
            filterStatus: this.state.drawfstatus,
            filterurgent: this.state.drawfurgent,
            filterstartDate: this.state.drawfstartDate,
            filterendDate: this.state.drawfendDate,
            filterstartTime: this.state.drawfstartTime,
            filterendTime: this.state.drawfendTime,
            filterassignee: this.state.drawfassignee,
            filterfromCDate: this.state.drawffromCDate,
            filtertoCDate: this.state.drawftoCDate,
            filterisChainUsers: this.state.drawisChainUsers,
            filterisplanigoTaskOnly:this.state.drawisplanigoTaskOnly
        }, () => {
            //var fromdate;
            var FilleterByDate = false;
            var FilterbyCreatedDate = false;
            var regionids = [];
            var fdate;
            var edate;
            var fCdate;
            var eCdate;
            var ftime = "00:00:00";
            var etime = "00:00:00";
            // set isfilterby created date
            if (this.state.filterfromCDate !== "" || this.state.filtertoCDate !== "") {
                FilterbyCreatedDate = true
            }
            // set isfilterbydate
            if (this.state.filterstartDate !== "" || this.state.filterendDate !== "") {
                FilleterByDate = true
            }
            //set region ids
            this.state.filterassignee.forEach(element1 => {
                regionids.push(element1.regionId)
            });
            //set created dates
            eCdate = (this.state.filtertoCDate === "") ? "" : (convertDate(this.state.filtertoCDate) + " 23:59:59")
            fCdate = (this.state.filterfromCDate === "") ? "" : (convertDate(this.state.filterfromCDate) + " 00:00:00")
            //set fromdate
            ftime = (this.state.filterstartTime === "") ? "00:00:00" : this.state.filterstartTime + ":00"
            fdate = (this.state.filterstartDate === "") ? "" : (convertDate(this.state.filterstartDate) + " " + ftime)
            //set enddate
            etime = (this.state.filterendTime === "") ? "23:59:00" : this.state.filterendTime + ":00"
            edate = (this.state.filterendDate === "") ? "" : (convertDate(this.state.filterendDate) + " " + etime)
            if (type !== "reset") {
                //set to redux
                var freduxstate = {
                    filterStatus: this.state.drawfstatus,
                    filterurgent: this.state.drawfurgent,
                    filterstartDate: this.state.drawfstartDate,
                    filterendDate: this.state.drawfendDate,
                    filterstartTime: this.state.drawfstartTime,
                    filterendTime: this.state.drawfendTime,
                    filterassignee: this.state.drawfassignee,
                    isFilleterByDate: FilleterByDate,
                    isFilterViaTaskCreatedDate: FilterbyCreatedDate,
                    Regionids: regionids,
                    Edate: edate,
                    Fdate: fdate,
                    filterfromCDate: this.state.drawffromCDate,
                    filtertoCDate: this.state.drawftoCDate,
                    createdStartDateFrom: fCdate,
                    createdStartDateTo: eCdate,
                    filterisChainUsers: this.state.drawisChainUsers,
                    filterisplanigoTaskOnly:this.state.drawisplanigoTaskOnly
                }
                this.props.setFilters(freduxstate)
                //end
            }
            csobj["taskFeedSearchType"] = this.state.filterStatus;
            csobj["taskId"] = "";
            csobj["onlyUrgent"] = this.state.filterurgent;
            csobj["regionIds"] = regionids;
            csobj["isFilleterByDate"] = FilleterByDate;
            csobj["isFilterViaTaskCreatedDate"] = FilterbyCreatedDate;
            csobj["fromDate"] = fdate;
            csobj["toDate"] = edate;
            csobj["startIndex"] = 0;
            csobj["createdStartDateFrom"] = fCdate;
            csobj["createdStartDateTo"] = eCdate;
            csobj["isChainUsers"] = this.state.filterisChainUsers;
            csobj["planigoTasksOnly"] = this.state.filterisplanigoTaskOnly;
            
            this.setState({
                sobj: csobj, startpage: 1, currentPage: 1, showdropdown: false,
                loading: false,
                toridata: [], isdataloaded: false,
                ftablebody: [],
                data: [],
                showmodal: false,
                totalresults: 0,
                pageItemsList: [], defaultPageCount: 10, totalPages: 0, //pagination
                isonloadtable: true, totalresultscount: 0,
            }, () => {
                // this.handleTableSearch(null, "click");
                this.handleTableSearch(null, "click", "applyfilter");
            })
        })
    }
    changeStatushandle = (status) => {
        this.setState({ drawfstatus: status })
    }
    //filter urgenthandle
    UrgentHandle = (urgent) => {
        this.setState({ drawfurgent: urgent })
    }
    //is chain level filter handle
    isChainlevelhandle = () => {
        this.setState({ drawisChainUsers: !this.state.drawisChainUsers, drawfassignee: [], })
    }
    //isplanigoTaskOnlyhandle
    isplanigoTaskOnlyhandle=()=>{
        this.setState({ drawisplanigoTaskOnly: !this.state.drawisplanigoTaskOnly })
    }
    clearingFilterstates = () => {
        this.setState({
            drawfstatus: TASK_FILTER_STATUS.Now,
            drawfurgent: false,
            drawfstartDate: "",
            drawfendDate: "",
            drawfstartTime: "",
            drawfendTime: "",
            drawfassignee: [],
            drawffromCDate: "",
            drawftoCDate: "",
            drawisChainUsers: false,
            drawisplanigoTaskOnly:false,
        })
    }
    // hadnle filter start ansd end date
    setFilterDates = (date, type) => {

        

        if (type === "startDate") {
            if(this.state.drawfendDate===""){
                this.setState({ drawfstartDate: date, drawfstartTime: (this.state.drawfstartTime !== "") ? this.state.drawfstartTime : "0:00", drawfendTime: (this.state.drawfendTime !== "") ? this.state.drawfendTime : "23:59" })
            }else{
                if(new Date(date).getTime()<=new Date(this.state.drawfendDate).getTime()){
                    this.setState({ drawfstartDate: date, drawfstartTime: (this.state.drawfstartTime !== "") ? this.state.drawfstartTime : "0:00", drawfendTime: (this.state.drawfendTime !== "") ? this.state.drawfendTime : "23:59" })
                }else{
                    alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                }
            }
        }
        if (type === "toDate") {

            if(this.state.drawfstartDate===""){
                alertService.error(this.props.t("PLEASE_SET_A_FROM_DATE"));
            }else{
                if(new Date(this.state.drawfstartDate).getTime()<=new Date(date).getTime()){

                    if(new Date(this.state.drawfstartDate).getTime()===new Date(date).getTime()){

                        let frmTime = this.state.drawfstartTime;
                        let toTime = this.state.drawfendTime;

                        let isGreater = false;
                            
                        isGreater = this.compareTimes(frmTime, toTime);

                        if(isGreater){
                            this.setState({ drawfendDate: date, drawfstartTime: (this.state.drawfstartTime !== "") ? this.state.drawfstartTime : "0:00", drawfendTime: (this.state.drawfendTime !== "") ? this.state.drawfendTime : "23:59" })
                        }else{
                            alertService.error(this.props.t("PLEASE_SET_A_VALID_TIME_FOR_THE_DATE"));
                        }

                    }else{
                        this.setState({ drawfendDate: date, drawfstartTime: (this.state.drawfstartTime !== "") ? this.state.drawfstartTime : "0:00", drawfendTime: (this.state.drawfendTime !== "") ? this.state.drawfendTime : "23:59" })
                    }

                }else{
                    alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                }
            }

        }
        //currentDate from
        if (type === "createdFromdate") {

            if(new Date(date).getTime()<=new Date().getTime()){
                if(this.state.drawftoCDate===""){
                    this.setState({ drawffromCDate: date })
                }else{
                    if(new Date(date).getTime()<=new Date(this.state.drawftoCDate).getTime()){
                        this.setState({ drawffromCDate: date })
                    }else{
                        alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                    }
                }
            }else{
                alertService.error(this.props.t("PLEASE_SET_VALID_CREATED_DATE"));
            }

        }
        //currentDate to
        if (type === "createdTodate") {

            if(new Date(date).getTime()<=new Date().getTime()){
                if(this.state.drawffromCDate===""){
                    alertService.error(this.props.t("PLEASE_SET_A_FROM_DATE"));
                }else{
                    if(new Date(this.state.drawffromCDate).getTime()<new Date(date).getTime()){
                        this.setState({ drawftoCDate: date })
                    }else{
                        alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                    }
                }
            }else{
                alertService.error(this.props.t("PLEASE_SET_VALID_CREATED_DATE"));
            }
        }
    }
    //filter strat time end time
    onChangeFilterTime = (time, type) => {
        if (type === "startTime") {
            if(this.state.drawfstartDate==="" && this.state.drawfendDate===""){
                alertService.error(this.props.t("PLEASE_SET_A_FROM_DATE"));
            }else{

                if(this.state.drawfstartDate !== "" && this.state.drawfendDate !== ""){
                    let frmDate = new Date(this.state.drawfstartDate);
                    let toDte = new Date(this.state.drawfendDate);

                    if( frmDate.getFullYear() === toDte.getFullYear() &&
                        frmDate.getMonth() === toDte.getMonth() &&
                        frmDate.getDate() === toDte.getDate()){
                            
                            let isGreater = false;
                            
                            isGreater = this.compareTimes(time, this.state.drawfendTime)

                            if(isGreater){
                                this.setState({ drawfstartTime: time })
                            }else{
                                alertService.error(this.props.t("PLEASE_SET_A_VALID_TIME"));
                            }
    
                        }else{
                            this.setState({ drawfstartTime: time })
                        }

                }else{
                    this.setState({ drawfstartTime: time })
                }
            }
        }
        if (type === "endTime") {
            if(this.state.drawfstartDate==="" && this.state.drawfendDate===""){
                alertService.error(this.props.t("PLEASE_SET_A_FROM_DATE"));
            }else{

                if(this.state.drawfstartDate !== "" && this.state.drawfendDate !== ""){
                    let frmDate = new Date(this.state.drawfstartDate);
                    let toDte = new Date(this.state.drawfendDate);

                    if( frmDate.getFullYear() === toDte.getFullYear() &&
                        frmDate.getMonth() === toDte.getMonth() &&
                        frmDate.getDate() === toDte.getDate()){
                            
                            let isGreater = false;
                            
                            isGreater = this.compareTimes(this.state.drawfstartTime, time)

                            if(isGreater){
                                this.setState({ drawfendTime: time })
                            }else{
                                alertService.error(this.props.t("PLEASE_SET_A_VALID_TIME"));
                            }
    
                        }else{
                            this.setState({ drawfendTime: time })
                        }

                }else{
                    this.setState({ drawfendTime: time })
                }


            }
        }
    }

    compareTimes(startTime, endTime) {
        // Assuming time1 and time2 are in "HH:mm" format
        const [hours1, minutes1] = endTime.split(':').map(Number);
        const [hours2, minutes2] = startTime.split(':').map(Number);
      
        // Create Date objects with a common date (e.g., January 1, 2000)
        const date1 = new Date(2000, 0, 1, hours1, minutes1);
        const date2 = new Date(2000, 0, 1, hours2, minutes2);
      
        // Compare the Date objects
        if (date1 > date2) {
            return true;
        } else if (date1 < date2) {
            return false;
        } else {
            return false;
        }
        
      }

    //load regions for filter
    loadAllRegionsforfilter = () => {
        var obj = {
            filterOpt: "",
            isReqPagination: false
        }
        submitSets(submitCollection.getRegions, obj, true).then(res => {
            if (res && res.status) {
                this.setState({ regionListFilter: res.extra })
            }
        });
    }
    // hadle filter assignee
    Assigneefilterhandle = (assignee) => {
        var assigneelist = this.state.drawfassignee
        var exist = assigneelist.find(x => x.name === assignee.name);
        if (exist) {
            var existlist = assigneelist.filter(x => x.name !== assignee.name);
            assigneelist = existlist
        } else {
            assigneelist.push(assignee)
        }
        this.setState({ drawfassignee: assigneelist })
    }
    //reset filters
    ResetFilters = () => {
        var csearchobj = this.state.sobj;
        csearchobj.regionIds = [];
        csearchobj.storeIds = [];
        csearchobj.storeNames = [];
        csearchobj.storeStatus = "";
        csearchobj.storeUrgent = false;
        this.props.setFilters(null);
        this.setState({
            drawfstatus: TASK_FILTER_STATUS.Now,
            drawfurgent: false,
            drawfassignee: [],
            drawfstartDate: "",
            drawfendDate: "",
            drawfstartTime: "",
            drawfendTime: "",
            drawffromCDate: "",
            drawftoCDate: "",
            drawisChainUsers: false,
            drawisplanigoTaskOnly:this.props.signedobj.signinDetails.userRolls.systemMainRoleType===usrRoles.PA?true:false,
            sobj: csearchobj,
            showdropdown: false
        }, () => {
            this.ApplyFilterSerach("reset");
        })
    }
    // time keeper functions
    onclickStarttime = (type) => {
        this.setState({ showStarttimePicker: type })
    }
    onclickEndtime = (type) => {
        this.setState({ showendtimePicker: type })
    }
    //redo flag 
    redoflagdisplay = (task) => {
        if (task.redoAllocationDetailId) {
            if (task.taskStatus === 'pending' || (task.taskStatus === 'Late' && task.isAttendToTask === false)) {
                return <Badge className="redo" pill >
                    <FeatherIcon style={{ margin: "0px 2px" }} icon="rotate-cw" size={13} /><span style={{ margin: "0px 2px", paddingTop: "3px" }}>{this.props.t('REDO_REQUIRED')}</span>
                </Badge>
            } else {
                return <Badge className="redo" pill >
                    <FeatherIcon style={{ margin: "0px 2px" }} icon="check" size={13} /><span style={{ margin: "0px 2px", paddingTop: "3px" }}>{this.props.t('REDONE')}</span>
                </Badge>
            }
        }
    }
    //handle export excel
    handleExportExcel = () => {
        const cfilterdata = this.state.sobj;
        cfilterdata["startIndex"] = 0;
        cfilterdata["isReqPagination"] = false;
        this.setState({ isexcellinkdisabled: true });
        submitSets(submitCollection.getTasks, cfilterdata, true).then(res => {
            if (res && res.status) {
                if (res.extra && res.extra.length > 0) {
                    this.setState({ excelexportdata: res.extra, isexcellinkdisabled: false }, () => {
                        this.ExportCSV(res.extra, "planigo_tasklist_export");
                    });
                } else {
                    this.setState({ excelexportdata: [], isexcellinkdisabled: false });
                    alertService.error("No export data found");
                }
            } else {
                this.setState({ excelexportdata: [], isexcellinkdisabled: false });
            }
        });
    }
    //export table data
    ExportCSV = (exportData, fileName) => {
        let styles = { font: { bold: true }, fill: { fgColor: { rgb: "E9E9E9" } }, alignment: { wrapText: false } };
        const fileExtension = '.xlsx';
        const cdate = new Date();
        //export data
        var csvData = [];
        
        csvData.push([
            {v: this.props.t("TASK_NAME"), s: styles}, {v: this.props.t("status"), s: styles}, 
            {v: this.props.t("ASSIGED_TO"),s:styles}, {v: this.props.t("PROGRESS"), s: styles}, 
            {v: this.props.t("STARTDATE_AND_TIME"),s:styles}, {v: this.props.t("ENDDATE_AND_TIME"), s: styles}
        ]);

        if (exportData && exportData.length > 0) {
            exportData.forEach(exproditem => {
                var assignlist = "";
                for (let l = 0; l < exproditem.taskReceivers.length; l++) {
                    const assignsitem = exproditem.taskReceivers[l];
                    if (assignsitem.userRolls && Object.keys(assignsitem.userRolls).length > 0) {
                        assignlist = assignlist + assignsitem.userRolls.regionName + " " + assignsitem.userRolls.userLevel + (l < (exproditem.taskReceivers.length - 1) ? "," : "");
                    }
                }
                csvData.push([exproditem.taskName, exproditem.taskStatus, assignlist, (exproditem.doneCount + "/" + exproditem.totalCount), convertDateTime(exproditem.taskStartDateTime), convertDateTime(exproditem.taskEndDateTime)]);
            });
        }

        // const wb = XLSX.utils.book_new();
        const wb = { Workbook: { Views: [{ RTL: (this.props.isRTL === "rtl"?true:false) }] }, Sheets: {}, SheetNames: [] };
        const ws = XLSX.utils.aoa_to_sheet(csvData);

        XLSX.utils.book_append_sheet(wb, ws, "readme");
        XLSX.writeFile(wb, replaceSpecialChars(replaceSpecialChars(String((fileName + "_" + cdate.getTime()))))+fileExtension); 
    }
    //chat
    openCChat = () => {
        this.setState({ chatopen: true });
    }
    closeCchat = () => {
        this.setState({ chatopen: false, ChatList: [], });
    }
    handleToggleChartView = () => {
        this.setState({ showStackChart: !this.state.showStackChart });
    }
    //handle onclick stack chart datapoint
    handleClickChartPoint = (cobj) => {
        var csobj = this.state.sobj;
        csobj["storeIds"] = [parseInt(cobj.storeobj.storeDto.storeId)];
        csobj["storeNames"] = [cobj.storeobj.storeDto.storeName];
        csobj["storeStatus"] = "";
        csobj["storeUrgent"] = false;
        if (cobj.state === "urgent") {
            csobj["taskFeedSearchType"] = "All";
            csobj["onlyUrgent"] = true;
            csobj["storeUrgent"] = true;
        } else if (cobj.state === "inprogress") {
            csobj["taskFeedSearchType"] = "Now";
            csobj["storeStatus"] = "In Progress";
            csobj["onlyUrgent"] = false;
        } else if (cobj.state === "late") {
            csobj["taskFeedSearchType"] = "Late";
            csobj["storeStatus"] = "Late";
            csobj["onlyUrgent"] = false;
        }
        this.setState({ sobj: csobj, filterStatus: csobj.taskFeedSearchType, filterurgent: csobj.onlyUrgent, drawfstatus: csobj.taskFeedSearchType, drawfurgent: csobj.onlyUrgent, showStackChart: false, loading: true, }, () => {
            var reduxobj = JSON.parse(JSON.stringify(this.props.taskFeedState.taskfilterDetails));
            if (reduxobj !== null) {
                reduxobj["filterStatus"] = this.state.drawfstatus;
                reduxobj["filterurgent"] = this.state.drawfurgent;
                reduxobj["Regionids"] = csobj.regionIds;
                this.props.setFilters(reduxobj);
            }
            this.handleTableSearch(null, "click");
        });
    }
    //remove added chart filters
    handleRemoveChartFilters = () => {
        var csearchobj = this.state.sobj;
        csearchobj.regionIds = [];
        csearchobj.storeIds = [];
        csearchobj.storeNames = [];
        csearchobj.storeStatus = "";
        csearchobj.storeUrgent = false;
        this.props.setFilters(null);
        this.setState({
            drawfstatus: TASK_FILTER_STATUS.Now,
            filterStatus: TASK_FILTER_STATUS.Now,
            drawfurgent: false,
            filterurgent: false,
            sobj: csearchobj,
            showdropdown: false
        }, () => {
            this.ApplyFilterSerach("reset");
        })
    }
    clickFilter = () => {
        this.setState({ filterboxopen: !this.state.filterboxopen })
    }
    setopenAll = () => {
        this.setState({ openall: !this.state.openall, filterboxopen: false })
    }
    handlemainsearch = (evt) => {
        this.setState({ searchTermMain: evt.target.value })
    }
    //handle is selected of qestions
    handlequestionselection = (qestionid) => {
        var details = this.state.quesionnaireDetails
        details.forEach(qes => {
            if (qes.questionId === qestionid) {
                qes["isSelected"] = !qes.isSelected
            }
        });
        this.setState({ quesionnaireDetails: details }, () => {
            //    console.log(this.state.quesionnaireDetails);
        })
    }
    handleShowingresults=(e, isonblur)=>{
        if(isonblur===true){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
        }
        else{
            this.setState({maxShowresultcount: e.target.value})
        }
    }

    handleResultsCOuntKeyUp = (e) =>{
        if(e.key==="Enter"){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount},()=>{
                this.handleTableSearch(null, "click");
            })
        }
    }

    render() {
        return (
            <Col xs={12} className={"main-content " + (this.props.isRTL === "rtl" ? "RTL" : "")} dir={this.props.isRTL}>
                <div>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL === "rtl" ? <>
                            <Breadcrumb.Item active>{this.props.t('TASK_FEED')}</Breadcrumb.Item>
                            <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        </> : <>
                            <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                            <Breadcrumb.Item active>{this.props.t('TASK_FEED')}</Breadcrumb.Item>
                        </>}
                    </Breadcrumb>
                    <div>
                        <span className="btn btn-primary btn-sm barchartview-link" onClick={this.loadStackChartData}><ProjectIcon size={14} /></span>
                        <div className={`SidebarTask sidebar-menu2${this.state.isshowSideBar === true ? ' open' : ''} ` + ((this.props.isRTL === "rtl") ? "RTL" : "")}>
                            <span className="barTitle">{this.props.t('SELECT_ASSIGNEE_FOR')}</span>
                            <span className="close-link" onClick={this.hideSidebar}><FeatherIcon icon="x" className={((this.props.isRTL === "rtl") ? "float-left" : "float-right")} size={25} /></span>
                            <div className="taskname">{this.state.aclicktaskDetails ? this.state.aclicktaskDetails.taskName : ""}</div>
                            
                            <AssignEmployees 
                                handlemainsearch={this.handlemainsearch} 
                                searchTermMain={this.state.searchTermMain} 
                                callcomplete={this.state.callcomplete} 
                                applyAllassinees={this.applyAllassinees} 
                                setopenAll={this.setopenAll} 
                                openall={this.state.openall} 
                                clickFilter={this.clickFilter} 
                                filterboxopen={this.state.filterboxopen} 
                                existinggroups={this.state.existinggroups} 
                                Assigneehandle={this.Assigneehandle} 
                                applyAssignees={this.applyAssignees} 
                                assignstlist={this.state.assignstlist} 
                                assignempList={this.state.assignempList} 
                                taskdetails={this.state.aclicktaskDetails} 
                                signedobj={this.props.signedobj} 
                                regionList={this.state.assignregionList} 
                                storeList={this.state.assignstoreList} 
                                workerList={this.state.assignworkerList} 
                                hideSidebar={this.hideSidebar} 
                                />
                        </div>
                        <Col className="white-container tasks" ref={this.whitecontainer}>
                            <Col className="custom-filters form-inline ">
                                <div className="inlinenew searchset">
                                    <Col className="hme">
                                        {/* <HomeIcon size={12} /> */}
                                        {Icons.Home("#5229A3")}
                                    </Col>
                                    
                                    <FormSelect className="taskfilterbox" disabled onChange={(e) => this.handlevchange(e, "uom")} style={{ background: "transparent" }}>
                                        <option value="-1">{this.props.t('SELECT_LOCATION')}</option>
                                    </FormSelect>
                                    <Dropdown className="FilterdropDown" as={ButtonGroup} drop={"down"} onToggle={(e) => this.closeDropdown(e)} show={this.state.showdropdown} >
                                        <Dropdown.Toggle split id="dropdown-split-basic" >{this.props.t("MORE_FILTERS")}
                                            <FeatherIcon icon="chevron-down" size={14} />
                                        </Dropdown.Toggle >
                                        <Dropdown.Menu style={{ width: this.props.signedobj.signinDetails.userRolls.userLevel !== usrLevels.CN && "600px" }}>
                                            <FilterPanel
                                                isChainlevelhandle={this.isChainlevelhandle}
                                                isplanigoTaskOnlyhandle={this.isplanigoTaskOnlyhandle}
                                                isRTL={this.props.isRTL}
                                                onclickStarttime={this.onclickStarttime}
                                                onclickEndtime={this.onclickEndtime}
                                                showStarttimePicker={this.state.showStarttimePicker}
                                                showendtimePicker={this.state.showendtimePicker}
                                                signedobj={this.props.signedobj}
                                                filterStatus={this.state.filterStatus}
                                                setFilterDates={this.setFilterDates}
                                                ResetFilters={this.ResetFilters}
                                                ApplyFilterSerach={this.ApplyFilterSerach} UrgentHandle={this.UrgentHandle}
                                                onChangeFilterTime={this.onChangeFilterTime}
                                                Assigneefilterhandle={this.Assigneefilterhandle}
                                                regionListFilter={this.state.regionListFilter}
                                                drawfassignee={this.state.drawfassignee}
                                                drawisChainUsers={this.state.drawisChainUsers}
                                                drawisplanigoTaskOnly={this.state.drawisplanigoTaskOnly}
                                                drawfstatus={this.state.drawfstatus} drawfurgent={this.state.drawfurgent} drawfstartDate={this.state.drawfstartDate} drawfendDate={this.state.drawfendDate}
                                                drawfstartTime={this.state.drawfstartTime} drawfendTime={this.state.drawfendTime}
                                                drawffromCDate={this.state.drawffromCDate} drawftoCDate={this.state.drawftoCDate}
                                                changeStatushandle={this.changeStatushandle}
                                                sobj={this.state.sobj} handleRemoveChartFilters={this.handleRemoveChartFilters}
                                            />
                                        </Dropdown.Menu>
                                    </Dropdown>

                                    <div style={{margin:"0px 20px"}}>
                                        <span className='result'> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                        <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => evt.key === "."?evt.preventDefault(): preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } onKeyUp={(e) => this.handleResultsCOuntKeyUp(e)} /></span>
                                    </div>

                                    <Col className="searchbox-main">
                                        <Col className="searchbox">
                                            <InputGroup size="sm" className="">
                                                <label className="filter-label">{this.props.t('btnnames.search')}</label>
                                                <FormControl
                                                    id="searchbtninput"
                                                    className="searchtext"
                                                    placeholder={this.props.t('FREE_SEARCH')}
                                                    aria-label="Recipient's username"
                                                    aria-describedby="basic-addon2"
                                                    value={this.state.sobj.taskName}
                                                    onKeyUp={e => this.handleFilterObject(e, "taskName", "enter")}
                                                    onChange={e => this.handleFilterObject(e, "taskName", "enter",this.props.t('Character.search_text'))}
                                                    onKeyDown={e=> preventinputToString(e,e.target.value,(this.props.t('Character.search_text')))}
                                                />
                                                <Button variant="outline-secondary" id="button-addon2" onClick={e => this.handleTableSearch(e, "click", "keysearch")} >
                                                    <SearchIcon size={16} />
                                                </Button>
                                            </InputGroup>
                                        </Col>
                                    </Col>
                                    
                                </div>
                            </Col>
                            <Button variant="outline-primary" className="task-exportexcel-link" disabled={this.state.isexcellinkdisabled} onClick={this.handleExportExcel}><ExcelExportIcon size={22} color={this.props.dmode ? "#2CC990" : "#5128a0"} /> {this.props.t("btnnames.exporttoexcel")}</Button>
                            <NewTask isRTL={this.props.isRTL} signedobj={this.props.signedobj} selectedQuestionear={this.state.selectedQuestionear} regionList={this.state.regionList} storeList={this.state.storeList} workerList={this.state.workerList} isAttend={this.state.isAttend} taskFeedState={this.props.taskFeedState} showmodal={this.state.showmodal} handleModalToggle={this.handleModalToggle} handleTableSearch={this.handleTableSearch} clearisattend={this.clearisattend} />
                            <Col className="tasklist-main">
                                {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0? <Table hover>
                                    <thead>
                                        <tr>
                                            <th className="taskName taskh">
                                                <div className='d-flex align-items-center'>
                                                    <span className="tasktick"><FeatherIcon icon="check-square" size={16} /></span>
                                                    <label className="rtltaskname">{this.props.t('TASK_NAME')}</label>
                                                </div>                      
                                            </th>
                                            <th className="taskh">{this.props.t('status')}</th>
                                            <th className="taskh">{this.props.t('ASSIGED_TO')}</th>
                                            <th className="taskh">{this.props.t('PROGRESS')}</th>
                                            <th className="taskh" style={{ minWidth: "138px" }} >{this.props.t('STARTDATE_AND_TIME')}</th>
                                            <th className="taskh" style={{ minWidth: "138px" }}>{this.props.t('ENDDATE_AND_TIME')}</th>
                                            <th className="taskh"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(this.state.isdataloaded && this.state.ftablebody ? this.state.ftablebody.map((task, i) =>
                                            <tr key={i}>
                                                <td onClick={() => this.rowclick(task)} className=" selectionrow taskName bleft">
                                                    <div className='d-flex align-items-center'>
                                                        <span className="tasktick"><FeatherIcon icon="check-square" size={16} /></span>
                                                        <div className='d-flex flex-column align-items-baseline'> 
                                                            <label className="rtltaskname name">{(task.taskName ? (task.taskName.length > 40 ? (task.taskName.substring(0, 40) + "..") : task.taskName) : "-")}</label>        
                                                            {(task.taskPriority === "HIGH") && <Badge pill >
                                                                <FeatherIcon style={{ margin: "0px 2px" }} icon="alert-circle" size={13} /><span style={{ margin: "0px 2px", paddingTop: "3px" }}>{this.props.t('URGENT')}</span>
                                                            </Badge>}
                                                                {/* {(task.redoAllocationDetailId) && <Badge className="redo" pill >
                                                                    <FeatherIcon style={{ margin: "0px 2px" }} icon="rotate-cw" size={13} /><span style={{ margin: "0px 2px", paddingTop: "3px" }}>{this.props.t('REDO_REQUIRED')}</span>
                                                                </Badge>} */}
                                                                {this.redoflagdisplay(task)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td onClick={() => this.rowclick(task)} className="selectionrow"> <span className="dot" style={this.statusColors("dot", task.taskAllocationDetailsStatus)}></span>
                                                    <span style={this.statusColors("text", task.taskAllocationDetailsStatus)}>{this.statusNameView(task.taskAllocationDetailsStatus)}</span></td>
                                                <td onClick={() => this.rowclick(task)} className="selectionrow"><Col style={{ width: "210px" }}>{task.taskReceivers ? this.getAssigedtoViewName(task.taskReceivers) : "-"}</Col></td>
                                                <td onClick={() => this.rowclick(task)} className="selectionrow">
                                                    {(task.totalCount > 0) && 
                                                    <Row style={{ width: "177px" }} className="progreecol d-flex align-items-baseline">
                                                        <Col style={{ paddingLeft: "12px" }}>{task.doneCount}/{task.totalCount} {this.props.t('DONE')}</Col>
                                                        <Col><ProgressBar now={task.progress} /></Col>
                                                    </Row>}
                                                </td>
                                                <td onClick={() => this.rowclick(task)} className="selectionrow" style={{ width: "160px" }}>{task.isTimeFrameTask && convertDateTime(task.taskStartDateTime, "noseconds")}</td>
                                                <td onClick={() => this.rowclick(task)} className="selectionrow" style={{ width: "150px" }}>{convertDateTime(task.taskEndDateTime, "noseconds")}</td>
                                                <td className="bright">
                                                    <Col style={{ width: "150px" }}>
                                                        <Row className='d-flex align-items-center'>
                                                            <Col md={4}> {(task.isRequestPhoto || task.isRequestVideo) && <Thumbs media={task.mediaCollection} />}</Col>
                                                            <Col md={5}>{(task.isApprover && task.taskStatus !== 'Approve') && <Button className="Approvebtn" onClick={() => this.approveHandle(task)}>{this.props.t('APPROVE')}</Button>}</Col>
                                                            <Col md={3}>

                                                                <Dropdown as={ButtonGroup} align="end">
                                                                    <Dropdown.Toggle split id="dropdown-split-basic" ><FeatherIcon icon="more-vertical" size={18} /></Dropdown.Toggle>
                                                                    <Dropdown.Menu className="dropdowneda">
                                                                        <Dropdown.Item onClick={() => this.handleDelete(task)} 
                                                                        disabled={((this.props.signedobj.signinDetails.userUUID !== task.addedUserUUID) )} >
                                                                            {/* disabled={((this.props.signedobj.signinDetails.userUUID !== task.addedUserUUID) || ((task.taskStatus === TaskStatusENUM.Done) || (task.taskStatus === TaskStatusENUM.ICanNotDo) || (task.taskStatus === TaskStatusENUM.approve)))} > */}
                                                                            <span className="editmenu">  {Icons.Delete("white")}</span><span>{this.props.t('btnnames.delete')}</span>
                                                                        </Dropdown.Item>
                                                                        <Dropdown.Item onClick={() => this.handleEditClick(task.taskId, task.isAttendToTask)} disabled={((this.props.signedobj.signinDetails.userUUID !== task.addedUserUUID) || ((task.taskStatus === TaskStatusENUM.Done) || (task.taskStatus === TaskStatusENUM.ICanNotDo) || (task.taskStatus === TaskStatusENUM.approve)))}>
                                                                            <span className="editmenu">
                                                                                {Icons.Edit("white")}
                                                                                {/* <FeatherIcon icon="edit-2" size={18} /> */}
                                                                            </span><span>{this.props.t('EDIT')}</span>
                                                                        </Dropdown.Item>
                                                                        <Dropdown.Item onClick={() => this.handleAssign(task)} disabled={(!((this.props.signedobj.signinDetails.userUUID === task.addedUserUUID) || task.isReceiver) || ((task.taskStatus === TaskStatusENUM.Done) || (task.taskStatus === TaskStatusENUM.ICanNotDo) || (task.taskStatus === TaskStatusENUM.approve)))}><span className="editmenu">
                                                                            {/* <FeatherIcon icon="users" size={18} /> */}
                                                                            {Icons.Assigntask("white")}
                                                                        </span><span >{this.props.t("ASSIGN")}</span></Dropdown.Item>
                                                                    </Dropdown.Menu>
                                                                </Dropdown>
                                                            </Col>
                                                        </Row>


                                                    </Col>
                                                </td>

                                            </tr>
                                        ) : <></>)}
                                    </tbody>
                                </Table>
                                :this.state.isdataloaded?<>
                                <AcNoDataView />
                            </>:<></>}
                            </Col>
                            {this.state.pageItemsList.length > 0 ? <>
                                {/* <Badge bg="light" className="filtertable-showttxt" style={{ color: "#142a33" }}>
                                    {this.props.isRTL === "" ? <>{this.props.t("results")} {ptotalresults} {this.props.t("of")} {pendcount} {this.props.t("to")} {pstartcount} {this.props.t("showing")}</> : <>{this.props.t("showing")} {pstartcount} {this.props.t("to")} {pendcount} {this.props.t("of")} {ptotalresults} {this.props.t("results")}</>}
                                </Badge> */}
                                <Pagination>
                                    <Pagination.Item onClick={() => this.setPage(1, true)} disabled={(this.state.currentPage === 1 ? true : false)}><ChevronLeftIcon /><ChevronLeftIcon /></Pagination.Item>
                                    <Pagination.Item onClick={() => this.setPage((this.state.currentPage - 1), true)} disabled={(this.state.currentPage === 1 ? true : false)}><ChevronLeftIcon /></Pagination.Item>
                                    <label>{this.state.currentPage} / {(this.state.totalPages ? this.state.totalPages : 0)}</label>
                                    <Pagination.Item onClick={() => this.setPage((this.state.currentPage + 1), true)} disabled={(this.state.currentPage === this.state.totalPages ? true : false)}><ChevronRightIcon /></Pagination.Item>
                                    <Pagination.Item onClick={() => this.setPage(this.state.totalPages, true)} disabled={(this.state.currentPage === this.state.totalPages ? true : false)}><ChevronRightIcon /><ChevronRightIcon /></Pagination.Item>
                                </Pagination>

                            </> : <></>}
                        </Col>
                        <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
                        <SummeryDetails refreshcall={this.handleTableSearch} isQuestionnaire={this.state.isQuestionnaire} handlequestionselection={this.handlequestionselection} quesionnaireDetails={this.state.quesionnaireDetails} loading={this.state.subtaskload} chatload={this.state.chatload} ChatList={this.state.ChatList} getChatDetails={this.getChatDetails} chatopen={this.state.chatopen} closeCChat={this.closeCchat} openCChat={this.openCChat} isRTL={this.props.isRTL} taskFeedState={this.props.taskFeedState} reduxsummery={this.props.taskFeedState.taskSummeryID} mideaAvailable={this.state.mideaAvailable} getTaskSummery={this.getTaskSummery} closeModal={this.closeModal} FBText={this.state.FBText} FBradioList={this.state.FBradioList} FBCheckList={this.state.FBCheckList} countedNo={this.state.countedNo} subTaskMedia={this.state.subTaskMedia} showmodal={this.state.directModal} statusColors={this.statusColors} subTask={this.state.subTask} />
                        <ApproveModal approvedetails={this.state.approvedetails} approveModal={this.state.approveModal} taskApprvetoggle={this.taskApprvetoggle} CloseAModal={this.CloseAModal} handleTableSearch={this.handleTableSearch} rowclick={this.rowclick} />
                    </div>
                </div>

                <TaskStackChart t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} showmodal={this.state.showStackChart} oristackdata={this.state.oristackdata} fixedstackdata={this.state.fixedstackdata} handleToggleChartView={this.handleToggleChartView} handleClickChartPoint={this.handleClickChartPoint} />

            </Col>

        )
    }
}

const mapDispatchToProps = dispatch => ({
    setTaskView: (payload) => dispatch(viewTaskSetAction(payload)),
    setTaskSummeryID: (payload) => dispatch(TaskSummeryIDSetAction(payload)),
    setFilters: (payload) => dispatch(taskFilterAction(payload)),
    setFeedTableData: (payload) => dispatch(feedTableDataAction(payload)),
    setSelectedQuesionear: (payload) => dispatch(selectedQuestionSetAction(payload)),
});

export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(Tasks)));