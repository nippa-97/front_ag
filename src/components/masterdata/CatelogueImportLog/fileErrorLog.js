import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Col, Row, Button, Modal, Card , OverlayTrigger, Tooltip, Form } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import DatePicker from 'react-datepicker';
import { CalendarIcon, XIcon } from '@primer/octicons-react';
import { AcNoDataView, AcTable, AcViewModal } from '../../UiComponents/AcImports';
import { confirmAlert } from 'react-confirm-alert';

import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';

import moment from 'moment';
import { alertService } from '../../../_services/alert.service';
import { FindMaxResult, maxInputLength, preventinputToString, preventinputotherthannumbers } from '../../../_services/common.service';

const FileImportErrorLogFilterTypes  = ["All","Department","Category","SubCategory","Brand","Supplier","Product","Other"];
const FileImportErrorLogType  = ["All","FileCurrupted","DataError","SaveError"];

export class FileErrorLog extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        
        this.state = {
            isdataloaded: false,
            searchobj:this.defaultSearchObj(),
            toridata: [],
            ftablebody: [],
            startpage: 1, totalresults: 0,
            maindata:[],
            showjsonmodal:false,
            selectedLogItem:null,

            dashboardData:{allCount: 0,fileCurruptedCount: 0,dataErrorCount: 0,saveErrorCount: 0},
            selectAllSelected:false,

            showResolveNoteModal:false,
            resolveNote:"",
            mainResolveType:"unResolved",
            oneresultheight: 55, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            if(this.props.fileErrorLogFIlters){
                let searchobject = this.props.fileErrorLogFIlters;
                searchobject.startIndex = 0;
                this.setState({
                    searchobj:searchobject, 
                    orimaxShowresultcount:this.props.fileErrorLogFIlters.orimaxShowresultcount, 
                    maxShowresultcount:this.props.fileErrorLogFIlters.maxResult},()=>{
                    this.handleTableSearch();
                    this.getDashboardData();
                });
            }
            else{
                this.getDashboardData();
                var maxresutcount=FindMaxResult(this.props.whitecontainer.current?(this.props.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,170);
                
                this.setState({
                    maxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8),orimaxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8)
                },()=>{
                    this.handleTableSearch();
                })
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultSearchObj = () =>{
        const now = new Date();
        var obj = {
            "fromDate":new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
            "toDate":new Date(),
            "searchValue":"",
            "logType":"All",
            "filterType":"All",
            "startIndex":0,
            "maxResult":8,
            "isReqPagination": true,
            "isResolved":false,
            "isReqCount":false,
        }
        return obj;
    }

    changeFilterValues = (type,value,msg,e) =>{
        if(type === "searchValue"){
            if(!preventinputToString(e,e.target.value,msg)){
                e.preventDefault();
                return
            }
        }
        if(type!=="reset"){
            let sobj = this.state.searchobj;
            sobj[type] = value;
            this.setState({searchobj:sobj});
        }
        else{
            this.setState({searchobj:this.defaultSearchObj()},()=>{
                this.mainSearch();
            });
        }
    }

    changeDateFilterValues = (type,value) =>{
        let sobj = this.state.searchobj;
        if(type==="fromDate"){
            if(value > sobj.toDate && sobj.toDate!==null){
                sobj.fromDate= sobj.toDate;
                alertService.warn(this.props.t("FROM_DATE_SHOULD_BE_PRIOR_TO_END_DATE"));
            }
            else{
                sobj[type] = value;
            }
        }
        if(type==="toDate"){
            if(value<sobj.fromDate && sobj.fromDate!==null){
                sobj.toDate= sobj.fromDate;
                alertService.warn(this.props.t("FROM_DATE_SHOULD_BE_PRIOR_TO_END_DATE"));
            }
            else{
                sobj[type] = value;
            }
        }
        
        this.setState({searchobj:sobj});
    }

    getDashboardData = () =>{
        let sobj = JSON.parse(JSON.stringify(this.state.searchobj));;
        if(sobj.fromDate> sobj.toDate){
            alertService.warn(this.props.t("FROM_DATE_SHOULD_BE_PRIOR_TO_END_DATE"));
            return false;
        }
        var fdate = moment(sobj.fromDate).format("YYYY-MM-DD");
        var todate = moment(sobj.toDate).format("YYYY-MM-DD");
        sobj.fromDate = fdate;
        sobj.toDate = todate;
        submitSets(submitCollection.getFileImportErrorLogStats,sobj, true).then(res => {
            if(res && res.status){
                if(res.extra){
                    this.setState({dashboardData:res.extra});
                }
            }
        });
    }

    mainSearch = () =>{
        var sobj = this.state.searchobj;
        sobj.startIndex = 0;
        sobj.maxResult = this.state.maxShowresultcount;
        sobj.orimaxShowresultcount = this.state.orimaxShowresultcount;
        this.setState({searchobj:sobj,startpage: 1,toridata:[],totalresults:0, selectAllSelected:false},()=>{
            this.props.setFileErrorLogFilters(sobj);
            this.handleTableSearch();
            this.getDashboardData();
        });
    }

    //filter search
    handleTableSearch = () => {
        let sobj = JSON.parse(JSON.stringify(this.state.searchobj));
        
        if(sobj.fromDate===null ||  sobj.toDate===null){
            alertService.warn(this.props.t("ENTER_VALID_DATES"));
            return false;
        }

        if(sobj.fromDate> sobj.toDate){
            alertService.warn(this.props.t("FROM_DATE_SHOULD_BE_PRIOR_TO_END_DATE"));
            return false;
        }
        var maxresutcount = this.state.maxShowresultcount;
        var fdate = moment(sobj.fromDate).format("YYYY-MM-DD");
        var todate = moment(sobj.toDate).format("YYYY-MM-DD");
        sobj.fromDate = fdate;
        sobj.toDate = todate;
        sobj.maxResult = maxresutcount;

        this.setState({ isdataloaded: true,});
        submitSets(submitCollection.getCatelogFileImportErrorLog, sobj, true).then(res => {//searchProds
            var cdata = [];//this.state.toridata;
            this.setState({ isdataloaded: false });
            if(res && res.status){
                var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                if(cpageidx > -1){
                    cdata[cpageidx].data = res.extra;
                } else{
                    cdata.push({page:(this.state.startpage),data:res.extra});
                }
                this.addToMainData(res.extra);
                this.setState({
                    isReqCount:false,
                    mainResolveType:(sobj.isResolved===true?"resolved":"unResolved"),
                    toridata: cdata,
                    totalresults: (this.state.startpage === 1  || sobj.isReqCount===true  ?res.count:this.state.totalresults),
                }, () => {
                    this.loadTableData();
                });
            } else{
                this.setState({
                    toridata: cdata,
                }, () => {
                    this.loadTableData();
                });
            }
        });
    }
    //load showing table data
    loadTableData = () => {
        var cdata = [];
        if(this.state.toridata && this.state.toridata.length > 0){
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);

            if(cfindList){
                for (var i = 0; i < cfindList.data.length; i++) {
                    const citem = cfindList.data[i];
                    cdata.push({
                        0:citem.logId, 
                        1:{type:"checkbox", action: "check", isChecked:false},
                        2:(citem.filterType ? this.props.t("FileImportErrorLogFilterTypes."+citem.filterType) : "-"), 
                        3:(citem.logType ? this.props.t("FileImportErrorLogType."+citem.logType) : "-"), 
                        4:(citem.fileName ? citem.fileName : "-"), 
                        5:(citem.createdDate ? moment(citem.createdDate).format("YYYY-MM-DD | HH:mm:ss") : "-")
                    });
                }
            }

        }
        this.setState({ ftablebody: cdata }, () => {
            this.setState({isdataloaded: false},()=>{
                this.setState({isdataloaded:true});
            });
        });
    }

    addToMainData = (list) =>{
        let mlist = this.state.maindata;
        mlist = mlist.concat(list);
        this.setState({maindata:mlist});
    }

    //page change
    handlePageChange = (cstartpage) => {
        var cfindList = this.state.toridata.find(x => x.page === cstartpage);
        var csobj = this.state.searchobj;
        csobj.startIndex = ((cstartpage - 1) * this.state.searchobj.maxResult);

        this.setState({ searchobj: csobj, startpage: cstartpage, }, () => {
            if(cfindList){
                this.setState({ isdataloaded: true });
                this.loadTableData();
            } else{
                this.handleTableSearch();
            }
            this.setState({selectAllSelected:false});
        });
    }

    handleRowClick = (cidx,citem,caction) =>{
        if(caction==="check"){
            let tbodydata = this.state.ftablebody;
            tbodydata[cidx][1].isChecked = !tbodydata[cidx][1].isChecked;
            this.setState({ftablebody:tbodydata},()=>{
                this.checkAllSelected()
            });
        }
        else{
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
            if(cfindList){
                if(citem && citem[0] && citem[0] !== ""){
                    let finditem = cfindList.data.find(z => z.logId === citem[0]);
                    if(finditem){
                        this.setState({selectedLogItem:finditem},()=>{
                            this.toggleModal();
                        });
                    }
                } 
            }
        }
    }

    checkAllSelected = () =>{
        let tbodydata = this.state.ftablebody;
        let selcount = 0;
        for (let i = 0; i < tbodydata.length; i++) {
            if(tbodydata[i][1].isChecked === true){
                ++selcount
            }
        }
        
        this.setState({selectAllSelected:(selcount>0 && this.state.ftablebody.length===selcount ? true : false)});
    }

    handleAllCheckboxes = (e) =>{
        let tbodydata = this.state.ftablebody;
        for (let i = 0; i < tbodydata.length; i++) {
            tbodydata[i][1].isChecked = e.target.checked;
        }
        this.setState({ftablebody:tbodydata, selectAllSelected:!this.state.selectAllSelected});
    }

    toggleModal = () =>{
        this.setState({showjsonmodal:!this.state.showjsonmodal});
    }

    resolveConfirm = () =>{
        let marked_arr = [];
        for (let i = 0; i < this.state.ftablebody.length; i++) {
            if(this.state.ftablebody[i][1].isChecked===true){
                marked_arr.push({logId:this.state.ftablebody[i][0]});
            }
        }

        if(marked_arr.length>0){
            confirmAlert({
                title: this.props.t("CONFIRM_TO_SUBMIT"),
                message: this.props.t("CATELOGUE_ARE_YOU_SURE_CONT_RESOLVE_MSG"),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        this.toggleResolveNoteModal();
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {
                        return false;
                    }
                }]
            });
        }
        else{
            alertService.warn(this.props.t("CATELOGUE_ERR_MARK_ITEMS"));
        }
    }

    resolveSet = () =>{
        let marked_arr = [];
        for (let i = 0; i < this.state.ftablebody.length; i++) {
            if(this.state.ftablebody[i][1].isChecked===true){
                marked_arr.push({logId:this.state.ftablebody[i][0]});
            }
        }
        let sobj ={
            logList:marked_arr,
            resolveMessage:this.state.resolveNote,
        }


        this.setState({isdataloaded:true});
        submitSets(submitCollection.markAsResolvedErrorLog, sobj, true).then(res => {
            this.setState({isdataloaded:false});
            if(res && res.status){
               alertService.success(this.props.t("SUCCESSFULLY_RESOLVED"));
               //this.mainSearch();

                var sobj = this.state.searchobj;
                sobj.isReqCount = true;
                
                const stindx = sobj.startIndex;
                const maxresult = sobj.maxResult;

                if(this.state.ftablebody.length===marked_arr.length && this.state.startpage>1 ){
                    sobj.startIndex = (stindx - maxresult);
                    this.setState({searchobj:sobj, startpage:(this.state.startpage - 1)},()=>{
                        this.handleTableSearch(null,"click");
                    });
                }
                else{
                    this.setState({searchobj:sobj},()=>{
                        this.handleTableSearch(null,"click");
                    });
                }
                

               this.toggleResolveNoteModal();
            } else{
               alertService.error(this.props.t("ERROR_OCCURRED"));
            }
        });
        
    }

    toggleResolveNoteModal = () =>{
        this.setState({showResolveNoteModal: !this.state.showResolveNoteModal, resolveNote:""});
    }

    changeResolveNote = (e) =>{
        this.setState({resolveNote:e.target.value});
    }


    UnresolveConfirm = () =>{
        let marked_arr = [];
        for (let i = 0; i < this.state.ftablebody.length; i++) {
            if(this.state.ftablebody[i][1].isChecked===true){
                marked_arr.push({logId:this.state.ftablebody[i][0]});
            }
        }

        if(marked_arr.length>0){
            confirmAlert({
                title: this.props.t("CONFIRM_TO_SUBMIT"),
                message: "Are you sure to Unresolve selected items?",
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        this.setState({isdataloaded:true});
                        submitSets(submitCollection.markAsUnresolvedErrorLog, marked_arr, true).then(res => {
                            this.setState({isdataloaded:false});
                            if(res && res.status){
                            alertService.success(this.props.t("SUCCESSFULLY_RESOLVED"));

                            var sobj = this.state.searchobj;
                            sobj.isReqCount = true;
                            
                            const stindx = sobj.startIndex;
                            const maxresult = sobj.maxResult;

                            if(this.state.ftablebody.length===marked_arr.length && this.state.startpage>1 ){
                                sobj.startIndex = (stindx - maxresult);
                                this.setState({searchobj:sobj, startpage:(this.state.startpage - 1)},()=>{
                                    this.handleTableSearch(null,"click");
                                });
                            }
                            else{
                                this.setState({searchobj:sobj},()=>{
                                    this.handleTableSearch(null,"click");
                                });
                            }
                            
                        } else{
                            alertService.error(this.props.t("ERROR_OCCURRED"));
                            }
                        });
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {
                        return false;
                    }
                }]
            });
        }
        else{
            alertService.warn(this.props.t("CATELOGUE_ERR_MARK_ITEMS"));
        }
    }

    handleShowingresults=(e, isonblur)=>{
        if(isonblur===true){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
        }
        else{
            this.setState({maxShowresultcount: e.target.value})
        }
    }
    handleKeyDown = (event) => {
        if(!(/[0-9/]/.test(event.key) || parseInt(event.keyCode) === 8  || parseInt(event.keyCode) === 37 || parseInt(event.keyCode) === 39)){
            event.preventDefault();
        }
    }

    render(){
        const ftableheaders = ["","",this.props.t('CATELOGUE_FILTERS.type'), this.props.t('CATELOGUE_FILTERS.errortype'), this.props.t('CATELOGUE_FILTERS.filename'), this.props.t('CATELOGUE_FILTERS.created')];
        return(
            <Col xs={12} className="file-error-log-main" style={{marginTop:"5px"}}>
                <Col xs={12} className="dashboard-section"> 
                    <DashboardSection t={this.props.t} dashboardData={this.state.dashboardData} />
                </Col>
                <Col xs={12} className="filter-section">
                    <Row>
                        <Col xs={5}>
                            <Row>
                                <Col xs={3} className="filter-item">
                                    <label>{this.props.t("CATELOGUE_FILTERS.type")}</label>
                                    <select className='form-control' value={this.state.searchobj.filterType} onChange={(e)=>this.changeFilterValues("filterType",e.target.value)}>
                                        
                                        {
                                            FileImportErrorLogFilterTypes.map((type,i)=>{
                                                return(
                                                    <option key={i} value={type}>{this.props.t("FileImportErrorLogFilterTypes."+type)}</option>
                                                )
                                            })
                                        }
                                    </select>
                                </Col>
                                <Col xs={3} className="filter-item">
                                    <label>{this.props.t("CATELOGUE_FILTERS.errortype")}</label>
                                    <select className='form-control' value={this.state.searchobj.logType} onChange={(e)=>this.changeFilterValues("logType",e.target.value)}>
                                    
                                        {
                                            FileImportErrorLogType.map((type,i)=>{
                                                return(
                                                    <option key={i} value={type}>{this.props.t("FileImportErrorLogType."+type)}</option>
                                                )
                                            })
                                        }
                                    </select>
                                </Col>
                                <Col xs={3} className="filter-item datebox">
                                    <label>{this.props.t("CATELOGUE_FILTERS.from")}</label><br/>
                                    <DatePicker
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="DD/MM/YYYY"
                                        popperPlacement="bottom-start"
                                        showYearDropdown
                                        className="datepicker-txt"
                                        selected={this.state.searchobj.fromDate}
                                        onChange={(e)=>this.changeDateFilterValues("fromDate",e)}
                                        onKeyDown={this.handleKeyDown}
                                    />
                                    <CalendarIcon size={15} />
                                </Col>
                                <Col xs={3} className="filter-item datebox">
                                    <label>{this.props.t("CATELOGUE_FILTERS.end")}</label><br/>
                                    <DatePicker
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="DD/MM/YYYY"
                                        popperPlacement="bottom-start"
                                        showYearDropdown
                                        className="datepicker-txt"
                                        selected={this.state.searchobj.toDate}
                                        onChange={(e)=>this.changeDateFilterValues("toDate",e)}
                                        onKeyDown={this.handleKeyDown}
                                    />
                                    <CalendarIcon size={15} />
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={2}>
                            <label>{this.props.t("CATELOGUE_FILTERS.filename")}</label>
                            <input type="text"  className='form-control' value={this.state.searchobj.searchValue} onChange={(e)=>this.changeFilterValues("searchValue",e.target.value,this.props.t('Character.filename'),e)} onKeyDown={(e)=>preventinputToString(e,this.state.searchobj.searchValue,(this.props.t('Character.filename')))} />
                            
                        </Col>
                        <Col xs={1} className="filter-item ">
                            <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                            <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } />
                        </Col>
                        <Col xs={1} style={{paddingTop:"30px",paddingLeft:"0", paddingRight:"0"}}>
                            <Form.Check 
                                type="switch"
                                id="custom-switch"
                                label={this.props.t("CATELOGUE_FILTERS.resolved")}
                                checked={this.state.searchobj.isResolved===true?"checked":""}
                                onChange={(e)=>this.changeFilterValues("isResolved",!this.state.searchobj.isResolved)}
                            />
                        </Col>
                        <Col xs={3} className="filter-item main-btns buttons" style={{marginTop:"18px"}}>
                            {
                                this.state.mainResolveType==="resolved"?
                                <Button variant='warning' className="d-inline" onClick={()=>this.UnresolveConfirm()}>{this.props.t("CATELOGUE_FILTERS.unresolve")}</Button>
                                :
                                <Button variant='info' className="d-inline" onClick={()=>this.resolveConfirm()}>{this.props.t("CATELOGUE_FILTERS.resolve")}</Button>
                            }
                            <Button variant='light' className='d-inline reset' onClick={()=>this.changeFilterValues("reset",null)}>{this.props.t("CATELOGUE_FILTERS.reset")}</Button>
                            <Button variant='danger' className='d-inline' onClick={()=>this.mainSearch()}> {this.props.t("CATELOGUE_FILTERS.search")}</Button>
                        </Col>
                    </Row>
                </Col>
                

                <Col xs={12} className="body-section">
                    {this.state.isdataloaded === true && this.state.ftablebody && this.state.ftablebody.length > 0 ?
                        <Col xs={12} className="main-table-col">
                            <input type="checkbox" maxLength={maxInputLength} className='form-check-input select-all-table-rows-chk fileerror' checked={this.state.selectAllSelected===true?"checked":""} onChange={(e)=>this.handleAllCheckboxes(e)} />
                            <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.searchobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.searchobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}   />
                        </Col>
                    :this.state.isdataloaded?<>
                        <AcNoDataView />
                    </>:<></>}

                    {/* <Col xs={12} className={"no_recs_msg "+(this.state.isdataloaded===false?"d-none":"")}>{this.props.t("NO_RESULT_FOUND")}</Col> */}

                    <AcViewModal showmodal={!this.state.isdataloaded} message={this.props.t('PLEASE_WAIT')} />
                </Col>


                <Modal show={this.state.showjsonmodal} size={"md"} animation={false} className={"filer-error-log-details-modal "+(this.props.isRTL==="rtl" ? "RTL" :"LTR")} onHide={ e => { this.toggleModal() }} dir={this.props.isRTL} backdrop="static">
                    <Modal.Header>
                        <Modal.Title>
                            {this.props.t("LOG_DETAILS")}
                            <button className="close-btn" onClick={ () => this.toggleModal()} ><XIcon size={20}   /></button>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {
                            this.state.selectedLogItem ?
                                <Row className='top-section' dir={this.props.isRTL}>
                                    <Col xs={3} className="label">{this.props.t('CATELOGUE_FILTERS.type')}</Col>
                                    <Col xs={9} className="value">{(this.state.selectedLogItem.filterType ? this.props.t("FileImportErrorLogFilterTypes."+this.state.selectedLogItem.filterType) : "-")}</Col>

                                    <Col xs={3} className="label">{this.props.t('CATELOGUE_FILTERS.errortype')}</Col>
                                    <Col xs={9} className="value">{(this.state.selectedLogItem.logType ? this.props.t("FileImportErrorLogType."+this.state.selectedLogItem.logType) :"-")}</Col>

                                    <Col xs={3} className="label">{this.props.t('CATELOGUE_FILTERS.filename')}</Col>
                                    <Col xs={9} className="value">{(this.state.selectedLogItem.fileName ? this.state.selectedLogItem.fileName : "-")}</Col>

                                    <Col xs={3} className="label">{this.props.t('CATELOGUE_FILTERS.created')}</Col>
                                    <Col xs={9} className="value">{(this.state.selectedLogItem.createdDate ?moment(this.state.selectedLogItem.createdDate).format("YYYY-MM-DD") : "-")}</Col>

                                    {/* <Col xs={3} className="label">{this.props.t('CATELOGUE_FILTERS.issue')}</Col> */}
                                    {/* <Col xs={9} className="value">{(this.state.selectedLogItem.issue ? this.state.selectedLogItem.issue : "-")}</Col> */}
                                    
                                    <Col xs={12} className="label" style={{marginTop:"15px"}}>{this.props.t("DESCRIPTION")}</Col>
                                    <Col xs={12} className="description">
                                        <Col>
                                            {(this.state.selectedLogItem.issueData ? this.state.selectedLogItem.issueData : "-")}
                                        </Col>
                                    </Col>

                                    {
                                    this.state.selectedLogItem.isResolved===true ?
                                        <>
                                            <Col xs={12} className="label" style={{marginTop:"15px"}}>{this.props.t("RESOLVE_NOTE")}</Col>
                                            <Col xs={12} className={"resolve-comment "}>
                                                <Col>
                                                    {(this.state.selectedLogItem.resolveComment  ? this.state.selectedLogItem.resolveComment : "-")}
                                                </Col>
                                            </Col>
                                        </>
                                        :<></>
                                    }
                                </Row>

                            :<></>
                        }
                    </Modal.Body>
                    
                </Modal>


                <Modal show={this.state.showResolveNoteModal} size={"sm"} animation={false} className={"adding-modal resolve-note "+(this.props.isRTL==="rtl" ? "RTL" :"LTR")} onHide={ e => { this.toggleResolveNoteModal() }} dir={this.props.isRTL} backdrop="static">
                    <Modal.Header>
                        <Modal.Title>
                            Resolve Note
                            <button className="close-btn" onClick={ () => this.toggleResolveNoteModal()} ><XIcon size={20}   /></button>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <textarea rows={5} className="form-control" onChange={(e)=>this.changeResolveNote(e)}></textarea>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={()=>this.resolveSet()}>Resolve</Button>
                    </Modal.Footer>
                </Modal>
            </Col>
        )
    }
}

export default withTranslation()(withRouter(FileErrorLog));

function DashboardSection(props){
    return(
        <Row>
            <Col className={"dashboard-item"}>
                <OverlayTrigger  placement="bottom" overlay={<Tooltip className='catelogue-log-tool-tip'><label></label>Number of All the errors when importing.</Tooltip>}>
                    <Card bg='warning' className='errorbg-3'>
                        <Card.Body>
                            <h5>{props.t("CATELOGUE_DASHBOARD.allCount")}</h5>
                            <h3>{props.dashboardData.allCount}</h3>
                        </Card.Body>
                    </Card>
                </OverlayTrigger>
            </Col>
            <Col className={"dashboard-item"}>
                <OverlayTrigger  placement="bottom" overlay={<Tooltip className='catelogue-log-tool-tip'><label></label>Number of files corrupted when importing.</Tooltip>}>
                    <Card bg='warning'>
                        <Card.Body>
                            <h5>{props.t("CATELOGUE_DASHBOARD.fileCurruptedCount")}</h5>
                            <h3>{props.dashboardData.fileCurruptedCount}</h3>
                        </Card.Body>
                    </Card>
                </OverlayTrigger>
            </Col>
            <Col className={"dashboard-item"}>
                <OverlayTrigger  placement="bottom" overlay={<Tooltip className='catelogue-log-tool-tip'><label></label>Number of data error files when importing.</Tooltip>}>
                    <Card bg='warning' className='errorbg-1'>
                        <Card.Body>
                            <h5>{props.t("CATELOGUE_DASHBOARD.dataErrorCount")}</h5>
                            <h3>{props.dashboardData.dataErrorCount}</h3>
                        </Card.Body>
                    </Card>
                </OverlayTrigger>
            </Col>
            <Col className={"dashboard-item"}>
                <OverlayTrigger  placement="bottom" overlay={<Tooltip className='catelogue-log-tool-tip'><label></label>Number of errors when saving.</Tooltip>}>
                    <Card bg='warning' className='errorbg-2'>
                        <Card.Body>
                            <h5>{props.t("CATELOGUE_DASHBOARD.saveErrorCount")}</h5>
                            <h3>{props.dashboardData.saveErrorCount}</h3>
                        </Card.Body>
                    </Card>
                </OverlayTrigger>
            </Col>
            
        </Row>
    )
}