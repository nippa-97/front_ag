import React, { Component } from 'react'
import { Col, Breadcrumb, Row, Table, Badge, Button ,OverlayTrigger,Tooltip} from 'react-bootstrap'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import './taskSummery.css'
import FeatherIcon from 'feather-icons-react'
//import Avatar from '../../../assets/img/noimage_card.png'
import SummeryDetails from './modal/summeryDetails'
import { submitCollection } from '../../../_services/submit.service'
import {
    convertDatetoTimeHM24,
    SummerystatusColors,
    SummeryStatusName,
    usrLevels,
} from '../../../_services/common.service'
import { submitSets } from '../../UiComponents/SubmitSets'
import {
    FEEDBACK_VIDEO,
    FEEDBACK_PHOTO,
    FEEDBACK_NUMBER,
    FEEDBACK_RADIO,
    FEEDBACK_CHECKBOXES,
    FEEDBACK_TEXT,
} from '../../../enums/taskfeedEnums'
import { TaskSummeryIDSetAction } from '../../../actions/taskFeed/task_action'
import { alertService } from '../../../_services/alert.service'
import { ExcelExportIcon } from '../../../assets/icons/icons'
import PieChart from './PieChart/PieChart'
import * as FileSaver from 'file-saver'
import * as XLSX from 'xlsx'

export class TaskSummery extends Component {
    _isMounted = false
    constructor(props) {
        super(props)
        this.state = {
            exelSummeryTableData: null,
            exelSummeryTableHeaders: null,
            summeryexportdata: null,
            excelexportdata: [],
            isQuestionnaire: false,
            quesionnaireDetails: [],
            piechart: null,
            loading: false,
            chatload: false,
            ChatList: [],
            chatopen: false,
            showmodal: false,
            summery: null,
            TotalCounted: null,
            InArea: null,
            selectedtableRegion: 'All',
            regionTableData: [],
            summerycount: {},
            Done: [],
            issue: [],
            inProgress: [],
            radioList: [],
            subTask: null,
            subTaskMedia: null,
            countedNo: null,
            FBradioList: null,
            FBCheckList: null,
            FBText: null,
            mideaAvailable: false,
        }
    }
    componentDidMount() {
        this._isMounted = true
        if (this._isMounted) {
            this.getTaskSummery()
        }
    }
    componentWillUnmount() {
        this._isMounted = false
    }
    //filter data
    filterSumdetails = () => {
        if (this.state.selectedtableRegion === 'All') {
            if(this.state.summerycount && Object.keys(this.state.summerycount).length > 0){
                this.setState({
                    Done: this.state.summerycount.done.subTasks,
                    issue: this.state.summerycount.issue.subTasks,
                    inProgress: this.state.summerycount.inProgress.subTasks,
                })
            }
        } else {
            if(this.state.summerycount && Object.keys(this.state.summerycount).length > 0){
                var donelist = []
                var issuelist = []
                var inProgresslist = []
                if (this.state.selectedtableRegion !== 'Other') {
                    donelist = this.state.summerycount.done.subTasks.filter(
                        (c) => c.region === this.state.selectedtableRegion
                    )
                    issuelist = this.state.summerycount.issue.subTasks.filter(
                        (c) => c.region === this.state.selectedtableRegion
                    )
                    inProgresslist =
                        this.state.summerycount.inProgress.subTasks.filter(
                            (c) => c.region === this.state.selectedtableRegion
                        )
                } else {
                    donelist = this.state.summerycount.done.subTasks.filter(
                        (c) => c.region === null || c.region === undefined
                    )
                    issuelist = this.state.summerycount.issue.subTasks.filter(
                        (c) => c.region === null || c.region === undefined
                    )
                    inProgresslist =
                        this.state.summerycount.inProgress.subTasks.filter(
                            (c) => c.region === null || c.region === undefined
                        )
                }

                this.setState({
                    Done: donelist,
                    issue: issuelist,
                    inProgress: inProgresslist,
                });
            }
        }
    }
    //change region
    handleRegionChange = (region) => {
        this.setState({ selectedtableRegion: region }, () => {
            if (this.state.summery && this.state.summery.feedbackSummary.type === 'number') {
                var inarea = null
                if (this.state.selectedtableRegion !== 'All') {
                    var haveregion =
                        this.state.summery.feedbackSummary.numberDto.regionViceCounts.find(
                            (x) => x.region === this.state.selectedtableRegion
                        )
                    if (haveregion) {
                        inarea = haveregion.count
                    }
                }
                this.setState({ InArea: inarea })
            }
            this.filterSumdetails()
        })
    }
    //get summery details call
    getTaskSummery = () => {
        var id = { taskId: this.props.taskFeedState.taskSummeryID.taskId }
        submitSets(submitCollection.findTaskSummery, id, true).then((res) => {
            if (res && res.status) {
                this.setState({ summery: res.extra }, () => {
                    this.setToStatesummmry()
                })
            }
        })
    }
    //set statefrom call
    setToStatesummmry = () => {
        //set total counted
        var totlcounted = null
        var mediafeedbackghave = false
        var inarea = null
        
        if(this.state.summery){
                if (this.state.summery.feedbackSummary.type) {
                    //if type number
                    if (this.state.summery.feedbackSummary.type === 'number') {
                        totlcounted =
                            this.state.summery.feedbackSummary.numberDto.totalCount
                    }
                    //if select from a list
                    if (this.state.summery.feedbackSummary.type === 'radio') {
                        var radios =
                            this.state.summery.feedbackSummary.radioDto.summeryOption
                        this.setState({ radioList: radios })
                    }
                }
                //set feedback media
                var MFeedbackavailable = this.state.summery.requestedFeedbackDto.find(
                    (x) =>
                        x.feedbackTypeId === FEEDBACK_PHOTO.id ||
                        x.feedbackTypeId === FEEDBACK_VIDEO.id
                )
                if (MFeedbackavailable) {
                    mediafeedbackghave = true
                }
                //set to state
                this.setState(
                    {
                        summerycount: this.state.summery.summeryCount,
                        TotalCounted: totlcounted,
                        InArea: inarea,
                        regionTableData: this.state.summery.regionSummary,
                        mideaAvailable: mediafeedbackghave,
                        piechart: this.createpieChartObj(
                            this.state.summery.regionSummary
                        ),
                    },
                    () => {
                        //set filter cards
                        this.filterSumdetails()
                    }
                );
        }
    }
    //pie chart onj creation
    createpieChartObj = (obj) => {
        var done = 0
        var issue = 0
        var inProgress = 0
        var Pobj = {}
        var doneSublist = []
        var inProgressSublist = []
        var issueSublist = []

        for (let i = 0; i < obj.length; i++) {
            const region = obj[i]
            done = done + region.doneCount
            issue = issue + region.issueCount
            inProgress = inProgress + region.inProgressCount
            if (region.doneCount > 0) {
                var newobj = {
                    region: region.region,
                    dcount: region.doneCount,
                }
                doneSublist.push(newobj)
                //done
            }
            if (region.issueCount > 0) {
                //issue
                var issueobj = {
                    region: region.region,
                    dcount: region.issueCount,
                }
                issueSublist.push(issueobj)
            }
            if (region.inProgressCount > 0) {
                //inProgress
                var inProgressobj = {
                    region: region.region,
                    dcount: region.inProgressCount,
                }
                inProgressSublist.push(inProgressobj)
            }
        }
        //set object
        Pobj['series'] = [done, issue, inProgress]
        Pobj['seriessublist'] = [doneSublist, issueSublist, inProgressSublist]
        return Pobj
    }

    //onclick on card assignee
    opendetails = (assignee) => {
        //set to redux
        var taskd = this.props.taskFeedState.taskSummeryID
        taskd['taskAttendanceLog'] = assignee.taskAttendanceLog
        this.props.setTaskSummeryID(taskd)
        this.handleModalToggle(true)
        this.getSubTask(assignee)
    }

    //get sub task details call
    getSubTask = (assignee) => {
        this.setState({ loading: true }, () => {
            submitSets(
                submitCollection.getSubTask,
                '/' + assignee.allocationDetailsId,
                true
            ).then((res) => {
                // submitSets(submitCollection.getSubTask, "/" + 20000, true).then(res => {
                if (res && res.status) {
                    this.setState({ loading: false })
                    this.setSubtaskcallState(res.extra, assignee)
                } else {
                    this.setState({ loading: false })
                }
            })
        })
    }

    //set completiondetails on load
    setCompletiondetails = (details) => {
        var list = []
        if (details.length > 0) {
            details.forEach((compdetails) => {
                compdetails['isSelected'] = false
                list.push(compdetails)
            })
        }
        return list
    }
    //set state in subtaskcall
    setSubtaskcallState = (extra, assignee) => {
        var csubtask = extra
        var subtaskmedia = []
        var Fbcount = null
        var Fbradio = this.state.FBradioList
        var Fbchecklist = this.state.FBCheckList
        var FbText = this.state.FBText
        var quesionnaireDetails = []
        var isQuestionnaire = false
        // set if questionnaire
        if (extra.questionnaireCompletionDetails.length > 0) {
            isQuestionnaire = true
            var backquesionnaireDetails = this.setCompletiondetails(
                extra.questionnaireCompletionDetails
            )
            quesionnaireDetails = backquesionnaireDetails.sort(
                (a, b) => parseFloat(a.questionNo) - parseFloat(b.questionNo)
            )
        }
        //subtaskset
        csubtask['startTime'] = (this.state.summery?this.state.summery.taskStartDateTime:null)
        csubtask['taskReceiverInfo'] = assignee.taskReceiverInfo
        //subtaskmedia set
        if (extra.taskCompletionDetails.length > 0) {
            var pmedia = extra.taskCompletionDetails.find(
                (x) => x.feedbackType === FEEDBACK_PHOTO.name
            )
            if (pmedia) {
                pmedia.taskCompletionMediaList.forEach((photo) => {
                    subtaskmedia.push(photo)
                })
            }
            var vmedia = extra.taskCompletionDetails.find(
                (x) => x.feedbackType === FEEDBACK_VIDEO.name
            )
            if (vmedia) {
                vmedia.taskCompletionMediaList.forEach((video) => {
                    subtaskmedia.push(video)
                })
            }
            //if feedback type number
            var fbNo = extra.taskCompletionDetails.find(
                (x) => x.feedbackType === FEEDBACK_NUMBER.name
            )
            if (fbNo) {
                Fbcount = fbNo.answer
            }
            //if feedback type radio list
            var fbradio = extra.taskCompletionDetails.find(
                (x) => x.feedbackType === FEEDBACK_RADIO.name
            )
            if (fbradio) {
                Fbradio = fbradio.taskcompletionOptionAnwsersList
            }
            //if feedback type check list
            var fbchecklist = extra.taskCompletionDetails.find(
                (x) => x.feedbackType === FEEDBACK_CHECKBOXES.name
            )
            if (fbchecklist) {
                Fbchecklist = fbchecklist.taskcompletionOptionAnwsersList
            }
            //if feedback type text
            var fbtext = extra.taskCompletionDetails.find(
                (x) => x.feedbackType === FEEDBACK_TEXT.name
            )
            if (fbtext) {
                FbText = fbtext.answer
            }
        }
        this.setState(
            {
                isQuestionnaire: isQuestionnaire,
                quesionnaireDetails: quesionnaireDetails,
                subTask: csubtask,
                subTaskMedia: subtaskmedia,
                countedNo: Fbcount,
                FBradioList: Fbradio,
                FBCheckList: Fbchecklist,
                FBText: FbText,
            },
            () => {}
        )
    }
    //modal
    handleModalToggle = (type) => {
        this.setState({ showmodal: !this.state.showmodal })
    }
    //close modal
    closeModal = () => {
        this.handleModalToggle(false)
        this.setState({
            isQuestionnaire: false,
            quesionnaireDetails: [],
            subTask: null,
            subTaskMedia: [],
            countedNo: null,
            FBradioList: null,
            FBCheckList: null,
            FBText: null,
        })
    }

    //get count of all region to table
    getAllregionCount = (type) => {
        var count = 0
        this.state.regionTableData.forEach((element) => {
            if (type === 'Done') {
                count = count + element.doneCount
            }
            if (type === 'Issue') {
                count = count + element.issueCount
            }
            if (type === 'Inprogress') {
                count = count + element.inProgressCount
            }
        })
        return count
    }
    //back btn
    backbtn = () => {
        this.props.history.goBack()
    }
    //workplace name
    getworkPlace = (assignee) => {
        var displayname = ''
        if (assignee.taskReceiverInfo.userRolls.userLevel === usrLevels.ST) {
            displayname = assignee.taskReceiverInfo.userRolls.storeName
        }
        if (assignee.taskReceiverInfo.userRolls.userLevel === usrLevels.RG) {
            displayname = assignee.taskReceiverInfo.userRolls.regionName
        }
        return displayname
    }
    //set card image
    setcardImage = (assignee) => {
        var image
        if (assignee.mediaCollection.length > 0) {
            image =
                assignee.mediaCollection[0].feedBackType === FEEDBACK_VIDEO.name
                    ? assignee.mediaCollection[0].mediaThumUrl
                    : assignee.mediaCollection[0].mediaThumUrl
                    ? assignee.mediaCollection[0].mediaThumUrl
                    : assignee.mediaCollection[0].mediaUrl
            return (
                <div
                    className="imge"
                    style={{ backgroundImage: 'url(' + image + ')' }}
                ></div>
            )
        } else {
            return (
                <div className="imge">
                    <Col>
                        {' '}
                        <FeatherIcon icon="image" size={25} />{' '}
                        <div>{this.props.t('NO_IMG_PLACED_YET')}</div>
                    </Col>
                </div>
            )
        }
    }
    //chat call send
    getChatDetails = () => {
        this.setState({ chatload: true }, () => {
            var headerobj = {
                taskAllocationDetailId:
                    this.state.subTask &&
                    this.state.subTask.taskAllocationDetailId,
                isReqPagination: false,
                startIndex: 0,
                maxResult: 0,
            }
            submitSets(submitCollection.taskgetComment, headerobj, true, null, true).then(
                (resp) => {
                    if (resp && resp.status) {
                        this.setState({ ChatList: resp.extra, chatload: false })
                    } else {
                        this.setState({ chatload: false })
                        // alertService.error(
                        //     resp && resp.extra
                        //         ? resp.extra
                        //         : this.props.t('ERROR_OCCURRED')
                        // )
                    }
                }
            )
        })
    }
    //chat
    openCChat = () => {
        this.setState({ chatopen: true })
    }

    closeCchat = () => {
        this.setState({ chatopen: false, ChatList: [] })
    }
    //handle is selected of qestions
    handlequestionselection = (qestionid) => {
        var details = this.state.quesionnaireDetails
        details.forEach((qes) => {
            if (qes.questionId === qestionid) {
                qes['isSelected'] = !qes.isSelected
            }
        })
        this.setState({ quesionnaireDetails: details }, () => {
            //    console.log(this.state.quesionnaireDetails);
        })
    }

    //TSK-Sum-EEX1 =>get excel data from back
    loadsummeryExport = () => {
        var sndonj = {
            taskId: this.props.taskFeedState.taskSummeryID.taskId,
            isQ: true,
        }
        submitSets(
            submitCollection.getSpecificTaskDetailReport,
            sndonj,
            true,
            null,
            true
        ).then((resp) => {
            if (resp && resp.status) {
                if (resp.extra.QuestionList.length > 0) {
                    var exporttableHeadersset = this.setexporttableheaders(
                        resp.extra
                    )
                    var excelexportTableData = this.setexporttabledata(
                        resp.extra
                    )
                    var summeryExcelDetail = {
                        fullTaskStatus: resp.extra.fullTaskStatus,
                        isQuestionnaire: resp.extra.isQuestionnaire,
                        taskName: resp.extra.taskName,
                    }
                    this.setState(
                        {
                            summeryexportdata: summeryExcelDetail,
                            exelSummeryQuestionList: resp.extra.QuestionList,
                            exelSummeryTableHeaders: exporttableHeadersset,
                            exelSummeryTableData: excelexportTableData,
                        },
                        () => {
                            this.ExportCSV([], 'planigo_SummeryInfo_export')
                        },
                        () => {}
                    )
                } else {
                    alertService.error('No export data found')
                }
            } else {
                // this.setState({ chatload: false })
                // alertService.error(
                //     resp && resp.extra
                //         ? resp.extra
                //         : this.props.t('ERROR_OCCURRED')
                // )
            }
        })
    }
    setexporttableheaders = (extra) => {
        var list = [{ userName: '' }]
        extra.QuestionList[1].userList.forEach((header) => {
            list.push(header)
        })
        return list
    }
    setexporttabledata = (extra) => {
        var tdataoarray = []
        for (let i = 0; i < extra.QuestionList.length; i++) {
            const qs = extra.QuestionList[i]
            if (i === 0) {
                let usrlist = []
                qs.userList.forEach((ulist) => {
                    var usrlistobj = {
                        answer: ulist.designation,
                        answerStatus: '',
                    }
                    usrlist.push(usrlistobj)
                })
                qs['userList'] = usrlist
            }

            tdataoarray.push(qs)
        }
        return tdataoarray
    }
    //excel
    //handle export excel
    handleExportExcel = () => {
        this.loadsummeryExport()
    }
    //export table data
    ExportCSV = (exportData, fileName) => {
        const fileType =
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
        const fileExtension = '.xlsx'
        const cdate = new Date()
        //export data
        var csvData = []
        let temarr = []
        this.state.exelSummeryTableHeaders.forEach((elm) => {
            temarr.push(elm.userName)
        })
        csvData.push(['Task Name', this.state.summeryexportdata.taskName])
        csvData.push(['Task Status', this.state.summeryexportdata.fullTaskStatus])
        csvData.push([''])
        csvData.push(temarr)
        if (
            this.state.exelSummeryTableData &&
            this.state.exelSummeryTableData.length > 0
        ) {
                for (let k = 0; k <  this.state.exelSummeryTableData.length; k++) {
                    const exproditem =  this.state.exelSummeryTableData[k];
                    let ctemdata = []
                ctemdata.push(exproditem.question)
                exproditem.userList.forEach((user) => {
                    ctemdata.push(k===0?user.answer:user.answer + ' - (' + user.answerStatus+")")
                })
                csvData.push(ctemdata)
                }  
        }
        const ws = XLSX.utils.json_to_sheet(csvData)
        const wb = { Sheets: { data: ws }, SheetNames: ['data'] }
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const data = new Blob([excelBuffer], { type: fileType })
        FileSaver.saveAs(data, fileName + '_' + cdate.getTime() + fileExtension)
    }



    render() {
        return (
            <Col
                xs={12}
                className={
                    'main-content tasksummery ' +
                    (this.props.isRTL === 'rtl' ? 'RTL' : '')
                }
                dir={this.props.isRTL}
            >
                <div>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL === 'rtl' ? (
                            <>
                                <Breadcrumb.Item active>
                                    {this.props.t('TASK_FEED')}
                                </Breadcrumb.Item>
                                <li className="breadcrumb-item">
                                    <Link to={"/"+this.props.HomePageVal} role="button">
                                        {this.props.t('home')}
                                    </Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="breadcrumb-item">
                                    <Link to={"/"+this.props.HomePageVal} role="button">
                                        {this.props.t('home')}
                                    </Link>
                                </li>
                                <Breadcrumb.Item active>
                                    {this.props.t('TASK_FEED')}
                                </Breadcrumb.Item>
                            </>
                        )}
                    </Breadcrumb>
                    <Col className="taskname">
                        {' '}
                        <span
                            className="backbtn"
                            onClick={() => this.backbtn()}
                        >
                            <FeatherIcon icon="arrow-left" />
                        </span>
                            <OverlayTrigger  placement="bottom-start" overlay={<Tooltip >{this.state.summery && this.state.summery.taskTitle}</Tooltip> }>
                                <h1>{this.state.summery && this.state.summery.taskTitle} </h1>
                            </OverlayTrigger>
                      
                            <Col>
                            
                                <Button
                                    variant="outline-primary"
                                    className="task-exportexcel-link"
                                    disabled={this.state.isexcellinkdisabled}
                                    onClick={() => this.handleExportExcel()}
                                >
                                    <ExcelExportIcon
                                        size={22}
                                        color={
                                            this.props.dmode ? '#2CC990' : '#5128a0'
                                        }
                                    />{' '}
                                    {this.props.t('btnnames.exporttoexcel')}
                                </Button>
                            </Col>
                    </Col>
                    <Col className="details">
                        <Row>
                            <Col
                                md={3}
                                className="summrycards"
                                style={{ background: '' }}
                            >
                                {this.state.radioList.length > 0 && (
                                    <Table>
                                        {this.state.radioList.map((list, i) => (
                                            <tr key={i}>
                                                <td>{list.option} :</td>
                                                <td>{list.count}</td>
                                            </tr>
                                        ))}
                                    </Table>
                                )}
                                <h5 className="underline totfont">
                                    {this.state.TotalCounted !== null
                                        ? this.props.t('TOTAL_COUNT')
                                        : ''}{' '}
                                    <b>{this.state.TotalCounted}</b>{' '}
                                    {this.state.InArea !== null &&
                                        this.props.t('IN_AREA')}
                                    <b>{this.state.InArea}</b>
                                </h5>
                                <Table hover>
                                    <thead className="underline typeheadeing">
                                        <tr>
                                            <th>{this.props.t('region')}</th>
                                            <th>{this.props.t('DONE')}</th>
                                            <th>{this.props.t('Issue')}</th>
                                            <th>
                                                {this.props.t('IN_PROGRESS')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            onClick={() =>
                                                this.handleRegionChange('All')
                                            }
                                            className={
                                                'underlinetb ' +
                                                (this.state
                                                    .selectedtableRegion ===
                                                'All'
                                                    ? 'selectedtb'
                                                    : '')
                                            }
                                        >
                                            <td>
                                                {this.props.t('ALL_REGIONS')}
                                            </td>
                                            <td className="middle">
                                                {this.getAllregionCount('Done')}
                                            </td>
                                            <td className="middle">
                                                {this.getAllregionCount(
                                                    'Issue'
                                                )}
                                            </td>
                                            <td className="middle">
                                                {this.getAllregionCount(
                                                    'Inprogress'
                                                )}
                                            </td>
                                        </tr>
                                        {this.state.regionTableData.map(
                                            (region, i) => (
                                                <tr
                                                    key={i}
                                                    onClick={() =>
                                                        this.handleRegionChange(
                                                            region.region
                                                        )
                                                    }
                                                    className={
                                                        this.state
                                                            .selectedtableRegion ===
                                                        region.region
                                                            ? 'selectedtb'
                                                            : ''
                                                    }
                                                >
                                                    <td>
                                                    <OverlayTrigger  placement="bottom" overlay={<Tooltip >{region.region}</Tooltip> }>
                                                        <span>{region.region}</span>
                                                    </OverlayTrigger>
                                                   
                                                    </td>
                                                    <td className="middle">
                                                        {region.doneCount}
                                                    </td>
                                                    <td className="middle">
                                                        {region.issueCount}
                                                    </td>
                                                    <td className="middle">
                                                        {region.inProgressCount}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </Table>
                                <Col className="pieChart">
                                    {this.state.piechart !== null ? (
                                        <PieChart
                                            piechart={this.state.piechart}
                                        />
                                    ) : (
                                        <></>
                                    )}
                                </Col>
                            </Col>
                            <Col md={3} className="summrycards">
                                <h6 className="underline typeheadeing typeheading">
                                    {this.props.t('Issue')} (
                                    {this.state.issue.length})
                                </h6>
                                <Col className='tasksum-scrollcontent'>
                                    {this.state.issue.length > 0 &&
                                    this.state.issue.map((assignee, i) => (
                                        <Col
                                            key={i}
                                            className="assignCard"
                                            onClick={() =>
                                                this.opendetails(assignee)
                                            }
                                        >
                                            <div className="abody">
                                                <OverlayTrigger placement="bottom-start" overlay={<Tooltip id={`tooltip-bottom`}>{assignee.userName}</Tooltip> }>
                                                    <h1  >{assignee.userName}</h1>
                                                 </OverlayTrigger>
                                                <div className="fontsm">
                                                    <b>{assignee.userRoll}</b> |{' '}
                                                    <OverlayTrigger placement="bottom-start" overlay={<Tooltip id={`tooltip-bottom`}>{this.getworkPlace(assignee)}</Tooltip> }>
                                                       <span>{this.getworkPlace(assignee)}</span> 
                                                    </OverlayTrigger>
                                                </div>
                                                <div className="finalebar">
                                                    {' '}
                                                    <span
                                                        className="dot"
                                                        style={SummerystatusColors(
                                                            'dot',
                                                            assignee.status
                                                        )}
                                                    ></span>
                                                    <span>
                                                        {SummeryStatusName(
                                                            assignee.status
                                                        )}{' '}
                                                        |{' '}
                                                        {convertDatetoTimeHM24(
                                                            this.state.summery
                                                                .taskStartDateTime
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                            {this.state.mideaAvailable &&
                                                this.setcardImage(assignee)}
                                        </Col>
                                    ))}    
                                </Col>
                            </Col>
                            <Col md={3} className="summrycards">
                                <h6 className="underline typeheadeing typeheading">
                                    {this.props.t('IN_PROGRESS')} (
                                    {this.state.inProgress.length})
                                </h6>
                                <Col className='tasksum-scrollcontent'>
                                    {this.state.inProgress.length > 0 &&
                                        this.state.inProgress.map((assignee, i) => (
                                            <Col
                                                key={i}
                                                className="assignCard"
                                                onClick={() =>
                                                    this.opendetails(assignee)
                                            }
                                        >
                                            <div className="abody">
                                                <OverlayTrigger placement="bottom-start" overlay={<Tooltip>{assignee.userName}</Tooltip> }>
                                                    <h1>{assignee.userName}</h1>
                                                 </OverlayTrigger>

                                             
                                      
                                                <div className="fontsm">
                                                    <b>{assignee.userRoll}</b> |{' '}
                                                    <OverlayTrigger placement="bottom-start" overlay={<Tooltip>{this.getworkPlace(assignee)}</Tooltip> }>
                                                    <span> {this.getworkPlace(assignee)}</span>
                                                    </OverlayTrigger>
                                                   
                                                </div>
                                                <div className="finalebar">
                                                    {' '}
                                                    <span
                                                        className="dot"
                                                        style={SummerystatusColors(
                                                            'dot',
                                                            assignee.status
                                                        )}
                                                    ></span>
                                                    <span>
                                                        {SummeryStatusName(
                                                            assignee.status
                                                        )}{' '}
                                                        |{' '}
                                                        {convertDatetoTimeHM24(
                                                            this.state.summery
                                                                .taskStartDateTime
                                                        )}
                                                    </span>
                                                    {assignee.isFileuploading && (
                                                        <Badge
                                                            className="fileuploadbdg"
                                                            style={{
                                                                float:
                                                                    this.props
                                                                        .isRTL ===
                                                                    'rtl'
                                                                        ? 'left'
                                                                        : 'right',
                                                            }}
                                                        >
                                                            {this.props.t(
                                                                'FILE_UPLOADING'
                                                            )}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            {this.state.mideaAvailable &&
                                                this.setcardImage(assignee)}
                                        </Col>
                                    ))}
                                </Col>
                                
                            </Col>
                            <Col md={3} className="summrycards">
                                <h6 className="underline typeheadeing typeheading">
                                    {this.props.t('DONE')} (
                                    {this.state.Done.length})
                                </h6>
                                <Col className='tasksum-scrollcontent'>
                                    {this.state.Done.length > 0 &&
                                        this.state.Done.map((assignee, i) => (
                                            <Col
                                                key={i}
                                                className="assignCard"
                                                onClick={() =>
                                                    this.opendetails(assignee)
                                                }
                                            >
                                                <div className="abody" style={{position:"relative"}}>
                                                    <OverlayTrigger placement="bottom-start" overlay={<Tooltip>{assignee.userName}</Tooltip> }>
                                                        <h1>{assignee.userName}</h1>
                                                     </OverlayTrigger>
                                                    <div className="fontsm">
                                                        <b>{assignee.userRoll}</b> |{' '}
                                                        <OverlayTrigger placement="bottom-start"overlay={<Tooltip>{this.getworkPlace(assignee)}</Tooltip> }>
                                                        <span> {this.getworkPlace(assignee)}</span>
                                                    </OverlayTrigger>
                                                    </div>
                                                    <div className="finalebar">
                                                        {' '}
                                                        <span
                                                            className="dot"
                                                            style={SummerystatusColors(
                                                                'dot',
                                                                assignee.status
                                                            )}
                                                        ></span>
                                                        <span>
                                                            {SummeryStatusName(
                                                                assignee.status
                                                            )}{' '}
                                                            |{' '}
                                                            {convertDatetoTimeHM24(
                                                                this.state.summery
                                                                    .taskStartDateTime
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                                {this.state.mideaAvailable &&
                                                    this.setcardImage(assignee)}
                                            </Col>
                                        ))}    
                                </Col>
                            </Col>
                        </Row>
                    </Col>
                </div>

                <SummeryDetails
                    refreshcall={this.getTaskSummery}
                    isQuestionnaire={this.state.isQuestionnaire}
                    handlequestionselection={this.handlequestionselection}
                    quesionnaireDetails={this.state.quesionnaireDetails}
                    loading={this.state.loading}
                    chatload={this.state.chatload}
                    ChatList={this.state.ChatList}
                    getChatDetails={this.getChatDetails}
                    chatopen={this.state.chatopen}
                    closeCChat={this.closeCchat}
                    openCChat={this.openCChat}
                    isRTL={this.props.isRTL}
                    reduxsummery={this.props.taskFeedState.taskSummeryID}
                    mideaAvailable={this.state.mideaAvailable}
                    getTaskSummery={this.getTaskSummery}
                    closeModal={this.closeModal}
                    FBText={this.state.FBText}
                    FBradioList={this.state.FBradioList}
                    FBCheckList={this.state.FBCheckList}
                    countedNo={this.state.countedNo}
                    subTaskMedia={this.state.subTaskMedia}
                    showmodal={this.state.showmodal}
                    subTask={this.state.subTask}
                />
                {/* <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} /> */}
            </Col>
        )
    }
}
const mapDispatchToProps = (dispatch) => ({
    // setTaskView: (payload) => dispatch(viewTaskSetAction(payload)),
    setTaskSummeryID: (payload) => dispatch(TaskSummeryIDSetAction(payload)),
})

export default withTranslation()(
    withRouter(connect(null, mapDispatchToProps)(TaskSummery))
)
