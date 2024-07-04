import { Component } from 'react';
import { Button, Col, Form } from "react-bootstrap";
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import FeatherIcon from 'feather-icons-react';
import { confirmAlert } from 'react-confirm-alert';

import { AcNoDataView, AcTable, AcViewModal } from '../../UiComponents/AcImports';

import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { alertService } from '../../../_services/alert.service';
import { convertDate, preventinputToString } from '../../../_services/common.service';


export default class NewProductStartLog extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        this.state = {
            isDataLoading:false,
            searchobj: this.defaultSearchObj(),

            allChangeOptionList: [
                { value: null, label: this.props.t("any_changeoption") },
                { value: "A", label: this.props.t("NP_CHANGEOPTIONS.opt_a") },
                { value: "B", label: this.props.t("NP_CHANGEOPTIONS.opt_b") },
                { value: "C", label: this.props.t("NP_CHANGEOPTIONS.opt_c") },
                { value: "D", label: this.props.t("NP_CHANGEOPTIONS.opt_d") },
                { value: "E", label: this.props.t("NP_CHANGEOPTIONS.opt_e") }
            ],

            toridata: [],
            ftablebody: [],
            startpage: 1, totalresults: 0,
            isDatePicker1Focused: false,
            isDatePicker2Focused: false,
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            this.handleTableSearch();
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultSearchObj = () =>{
        var obj = {
            "searchBy": "",
            "filterBy": {
                "chainOption": null,
                "fromDate": "",
                "toDate": ""
            },
            "isReqPagination": true,
            "maxResult": 12,
            "startIndex": 0
        }
       
        return obj;
    }

    handleFilterObject = (evt, ckey, ctype,msg,e) => {
        let searchobj = this.state.searchobj;
        let isTriggerSearch = false;
        
        if(ckey === "searchBy"){
            if(!preventinputToString(e,e.target.value,msg)){
                e.preventDefault()
                return
            }
            searchobj[ckey] = evt;
        } else if(ckey === "chainOption" || ckey === "fromDate" || ckey === "toDate"){
            if(ckey === "fromDate" || ckey === "toDate"){

                if(ckey === "fromDate"){
                    if(searchobj.filterBy.toDate !== ""){
                        if(new Date(evt).getTime() >= new Date(searchobj.filterBy.toDate).getTime()){
                            alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                            return;
                        }else{
                            searchobj.filterBy[ckey] = evt;
                        }
                    }else{
                        searchobj.filterBy[ckey] = evt;
                    }
                }

                if(ckey === "toDate"){

                    if(searchobj.filterBy.fromDate !== ""){
                        if(new Date(searchobj.filterBy.fromDate).getTime() >= new Date(evt).getTime()){
                            alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                            return;
                        }else{
                            searchobj.filterBy[ckey] = evt;
                        }
                    }else{
                        alertService.error(this.props.t("PLEASE_SET_A_FROM_DATE"));
                        return;
                    }
                }

            }else{
                searchobj.filterBy[ckey] = evt;
            }
        } 
        
        if(ckey === "fromDate" || ckey === "toDate"){
            if(searchobj.filterBy.fromDate !== "" && searchobj.filterBy.toDate !== ""){
                let cfromdate = new Date(searchobj.filterBy.fromDate);
                let ctodate = new Date(searchobj.filterBy.toDate);

                if(cfromdate.getTime() <= ctodate.getTime()){
                    isTriggerSearch = true;
                } else{
                    alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));
                }
            } else if(searchobj.filterBy.fromDate === "" && searchobj.filterBy.toDate === ""){
                isTriggerSearch = true;
            }
        }
        searchobj.startIndex = 0;
        // console.log(searchobj);

        this.setState({ 
            searchobj: searchobj, 
        }, () => {
            if(ctype === "enter" || ctype === "click" || isTriggerSearch){
                this.setState({ toridata: [], ftablebody: [], totalresults: 0, startpage: 1 });
                this.handleTableSearch(true);
            }
        });
    }

    //filter search
    handleTableSearch = () => {
        var sobj = JSON.parse(JSON.stringify(this.state.searchobj));
        
        this.setState({ isDataLoading: true}, () => {
            submitSets(submitCollection.findNewProductTestStartDateLog, sobj, true).then(res => {
                var cdata = [];
                if(res && res.status){
                    let csearchobj = JSON.parse(JSON.stringify(this.state.searchobj));
                    csearchobj.fromDate = new Date(csearchobj.fromDate);
                    csearchobj.toDate = new Date(csearchobj.toDate);

                    var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                    if(cpageidx > -1){
                        cdata[cpageidx].data = res.extra;
                    } else{
                        cdata.push({page:(this.state.startpage),data:res.extra});
                    }

                    this.setState({
                        searchobj: csearchobj,
                        toridata: cdata,
                        totalresults: (this.state.startpage === 1?res.count:this.state.totalresults),
                    }, () => {
                        this.loadTableData();
                    });
                } else{
                    this.setState({ toridata: cdata }, () => {
                        this.loadTableData();
                    });
                }

                this.setState({ isDataLoading: false});
            });    
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
                        0: citem.productId, 
                        1: (citem.barcode?citem.barcode:"-"), 
                        2: (citem.productName?citem.productName:"-"), 
                        3: (citem.chainOption?citem.chainOption:"-"), 
                        4: (citem.testPeriod?citem.testPeriod:"-"), 
                        5: (citem.appliedDate?convertDate(citem.appliedDate):"-"), 
                        6: (citem.storeCount?citem.storeCount:"-"), 
                        7: (citem.shouldExistStoreCount?citem.shouldExistStoreCount:"-"), 
                        8: (citem.salesAvailableStoreCount?citem.salesAvailableStoreCount:"-"), 
                        9: (citem.testStartDate?convertDate(citem.testStartDate): "-"),
                        10: (citem.testEndDate?convertDate(citem.testEndDate): "-"), 
                        11: (citem.taskDoneDate?convertDate(citem.taskDoneDate): "-"), 
                        12:(citem.mode?citem.mode:"-"), 
                    });
                }
            }
        }

        // console.log(cdata);
        this.setState({ ftablebody: cdata, isDataLoading: false }, () => {
            this.setState({isDataLoading:true});
        });
    }

    //page change
    handlePageChange = (cstartpage) => {
        var cfindList = this.state.toridata.find(x => x.page === cstartpage);
        var csobj = this.state.searchobj;
        csobj.startIndex = ((cstartpage - 1) * this.state.searchobj.maxResult);

        this.setState({ searchobj: csobj, startpage: cstartpage, selectedItems:[] }, () => {
            if(cfindList){
                this.setState({ isdataloaded: true });
                this.loadTableData();
            } else{
                this.handleTableSearch();
            }
            this.setState({selectAllSelected:false});
        });
    }

    syncNow = () => {
        confirmAlert({
            title: this.props.t("CONFIRM_TO_AUTOSYNC"),
            message: this.props.t("ARE_YOU_SURE_TO_CONTINUE_THIS_TASK"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    let chainid = (this.props.signedobj && this.props.signedobj.signinDetails?this.props.signedobj.signinDetails.chain.chainId:0);
                    // console.log(signinobj);

                    let sobj = ('?chainId='+chainid);
                    this.setState({ isDataLoading: true}, () => {
                        submitSets(submitCollection.findNewProductStartDate, sobj, true, null, true).then(res => {
                            if(res && res.status){
                                alertService.success(this.props.t("NP_STARTLOG_SYNC_SUCCESS"));
                                this.handleTableSearch(true);
                            } else{
                                // alertService.error(res && res.extra?res.extra:this.props.t("erroroccurred"));
                            }

                            this.setState({ isDataLoading: false});
                        });    
                    });
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
    }

    handleShowingresults = (e, isonblur) => {
        if(isonblur===true){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
        } else{
            this.setState({maxShowresultcount: e.target.value})
        }
    }

    resetSearch = () => {
        this.setState({ 
            searchobj: this.defaultSearchObj(), 
            toridata: [], ftablebody: [], totalresults: 0, startpage: 1,
        }, () => {
            this.handleTableSearch(true);
        });
    }

    handleKeyDown = (event) => {
        if(!(/[0-9/]/.test(event.key) || parseInt(event.keyCode) === 8  || parseInt(event.keyCode) === 37 || parseInt(event.keyCode) === 39)){
            event.preventDefault();
        }
    }
    handleFocusChange=(datepicker,value)=>{
        if(datepicker === 'isDatePicker1Focused'){
            this.setState({
                isDatePicker1Focused:value
            })
        } else if (datepicker === 'isDatePicker2Focused'){
            this.setState({
                isDatePicker2Focused:value
            })
        }
    }

    render(){
        let { allChangeOptionList, searchobj } = this.state;
        const ftableheaders = [
            "", this.props.t('barcode'), this.props.t('PRODUCT_NAME'), this.props.t('NEWPROD_START.changeOption'), 
            this.props.t('NEWPROD_START.testPeriod'), this.props.t('NEWPROD_START.appliedDate'), this.props.t('NEWPROD_START.storeCount'),
            this.props.t('NEWPROD_START.shouldStoreCount'), this.props.t('NEWPROD_START.salesStoreCount'),
            this.props.t('NEWPROD_START.testStartDate'), this.props.t('NEWPROD_START.testEndDate'), this.props.t('NEWPROD_START.doneDate'), this.props.t('NEWPROD_START.mode')
        ];
        
        return(
            <Col xs={12} className="tabsub-content">
                <Col className="custom-filters prod-search-list form-inline">
                    <span className='input-wrapper inline-search'>
                        <label className="filter-label">{this.props.t('FREE_SEARCH')}</label>
                        <FeatherIcon icon="search" size={18} />
                        <Form.Control placeholder={this.props.t('SEARCH_PROD_PLACEHOLDER')} value={searchobj.searchBy} 
                            onChange={e => this.handleFilterObject(e.target.value, "searchBy", "change",this.props.t('Character.search_text'),e)} 
                            onKeyUp={e => (e.which ===13? this.handleFilterObject(e.target.value, "searchBy", "enter", this.props.t('Character.search_text'), e):null)} 
                            onKeyDown={(e)=>preventinputToString(e,searchobj.searchBy,(this.props.t('Character.search_text')))} 
                            />
                    </span>

                    <label className="filter-label">{this.props.t("FILTER_BY")}</label>

                    <Select placeholder={this.props.t("any_changeoption")} options={allChangeOptionList} 
                        onChange={(e) => this.handleFilterObject(e.value,"chainOption","click")} 
                        value={allChangeOptionList.filter(option => option.value === (searchobj.filterBy.chainOption?searchobj.filterBy.chainOption:null))} 
                        className="auinewprod-searchselect" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={180}    
                        />

                    <span className='input-wrapper datepicker-wrapper'>
                        <FeatherIcon icon="calendar" size={18} />
                        <DatePicker dateFormat="dd/MM/yyyy" placeholderText={this.state.isDatePicker1Focused === true?'(DD/MM/YYYY)':this.props.t("CATELOGUE_FILTERS.from")} popperPlacement="bottom-start" showYearDropdown
                            className="datepicker-txt" selected={(searchobj.filterBy && searchobj.filterBy.fromDate?new Date(searchobj.filterBy.fromDate):null)}
                            onChange={(e)=>this.handleFilterObject(e, "fromDate", "change")}
                            onKeyDown={this.handleKeyDown}
                            onFocus={() => this.handleFocusChange('isDatePicker1Focused',true)}
                            onBlur={() => this.handleFocusChange('isDatePicker1Focused',false)}
                            />    
                    </span>
                    <span className='input-wrapper datepicker-wrapper'>
                        <FeatherIcon icon="calendar" size={18} />
                        <DatePicker dateFormat="dd/MM/yyyy" placeholderText={this.state.isDatePicker2Focused === true?'(DD/MM/YYYY)':this.props.t("CATELOGUE_FILTERS.todate")} popperPlacement="bottom-start" showYearDropdown
                            className="datepicker-txt" selected={(searchobj.filterBy && searchobj.filterBy.toDate?new Date(searchobj.filterBy.toDate):null)}
                            onChange={(e)=>this.handleFilterObject(e, "toDate", "change")}
                            onKeyDown={this.handleKeyDown}
                            onFocus={() => this.handleFocusChange('isDatePicker2Focused',true)}
                            onBlur={() => this.handleFocusChange('isDatePicker2Focused',false)}
                            />    
                    </span>

                    <Button variant='outline-secondary' onClick={() => this.resetSearch()} className='reset-link' size='sm'>{this.props.t("btnnames.reset")}</Button>

                    <Button variant='outline-primary' className='sync-btn' onClick={()=>this.syncNow()}>{this.props.t("MANUAL_TRIGGER")}</Button>
                </Col>
                <Col xs={12} className="body-section">
                    {this.state.isDataLoading === false && this.state.ftablebody && this.state.ftablebody.length > 0 ?
                        <Col xs={12} className="main-table-col newprodslog-main-table">
                            <AcTable isRTL={this.props.isRTL} t={this.props.t} 
                                aheaders={ftableheaders} totalresults={this.state.totalresults} 
                                startpage={this.state.startpage} 
                                alldata={this.state.toridata} 
                                asearchobj={this.state.searchobj} abody={this.state.ftablebody} 
                                showpaginate={true} pagetype="ajax" pagecount={this.state.searchobj.maxResult} 
                                handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange} 
                                />
                        </Col>
                    :this.state.isDataLoading === false?<>
                        <AcNoDataView />
                    </>:<></>}

                    {/* <Col xs={12} className={"no_recs_msg "+(this.state.isDataLoading === true?"d-none":"")}>{this.props.t("NO_RESULT_FOUND")}</Col> */}
                </Col>

                <AcViewModal showmodal={this.state.isDataLoading} message={this.props.t('PLEASE_WAIT')} />
            </Col>
        )
    }
}
