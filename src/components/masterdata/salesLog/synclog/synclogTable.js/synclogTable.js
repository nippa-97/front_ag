import moment from 'moment';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
//import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
//import { saleLogSetPagedetails } from '../../../../../actions/salelog/sale_log_action';
import { alertService } from '../../../../../_services/alert.service';
import { convertDateTime, FindMaxResult } from '../../../../../_services/common.service';
import { submitCollection } from '../../../../../_services/submit.service';
import { AcNoDataView, AcTable, AcViewModal } from '../../../../UiComponents/AcImports';
import { submitSets } from '../../../../UiComponents/SubmitSets';
import SalelogFilter from '../../filter/salelogFilter';


class SynclogTable extends Component {
    constructor(props) {
        super(props)
        this.state = {
            disableSaleDates:false,
            loading:false,
            filterStartDate: this.props.pageDetails? this.props.pageDetails.sobj.startDate:new Date(new Date().getTime() - (5 * 24 * 60 * 60 * 1000)),
            filterEndDate:this.props.pageDetails? this.props.pageDetails.sobj.endDate:new Date(),
            filterSaleEndDate:null,
            filterSaleStartDate:null,
            filterstatus:null,
            toridata: [],
            isdataloaded: false,
            ftablebody: [],
            sobj: this.defaultFilterObject(false),
            startpage: 1, totalresults: 0,
            sfilterobj: {filterOpt:"",isReqPagination:true,startIndex:0,maxResult:8,isReqCount:false,}, //
            filterBranchId:-1,
            oneresultheight: 58, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles
        }
    }
    componentDidMount() {
        if(this.props.pageDetails){
            let CprvmaxShowresultcount=this.props.pageDetails.maxShowresultcount
            this.setState({
                sfilterobj:this.props.pageDetails.sfilterobj,
                startpage:this.props.pageDetails.startpage,
                sobj:this.props.pageDetails.sobj,
                totalresults:this.props.pageDetails.totalresults,
                // totalresults: ptotalresults,
                maxShowresultcount:CprvmaxShowresultcount,orimaxShowresultcount:this.props.pageDetails.orimaxShowresultcount
            },()=>{
                this.handleTableSearch(null, "click"); //load all sync table data
                
            })
        }else{
            var maxresutcount=FindMaxResult(this.props.whitecontainer.current?(this.props.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,290)
            this.setState({
                maxShowresultcount:((maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8)),orimaxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8)
            },()=>{
            this.handleTableSearch(null, "click"); //load all sync table data
            })
        }
        
    }
    
    defaultFilterObject = (isReset) => {
        return { status: null, isReqPagination: true, startIndex: 0, maxResult: 8, startDate: isReset? null : new Date(new Date().getTime() - (5 * 24 * 60 * 60 * 1000)), endDate: isReset? null : new Date(),saleStartDate: null ,saleEndDate: null ,branch:-1 };
    }
    //data to sync table 
    handleTableSearch = (evt, etype) => {
        if (etype === "click" || (etype === "enter" && evt.which === 13)) {
            var maxresutcount = this.state.maxShowresultcount;
            this.setState({
                toridata: [],
                isdataloaded: false,
                loading:true,
            });
            var ssobj=this.state.sobj
            ssobj.maxResult = maxresutcount;
            ssobj.branch=parseInt(this.state.filterBranchId)
            submitSets(submitCollection.autoSalesSyncLog, ssobj, true, null, true).then(res => {
                this.props.getTileDetails();
                //console.log(res);
                if (res && res.status && res.extra && typeof res.extra !== "string") {
                    var cdata = this.state.toridata;

                    var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                    if (cpageidx > -1) {
                        cdata[cpageidx].data = res.extra;
                    } else {
                        cdata.push({ page: (this.state.startpage), data: res.extra });
                    }

                    this.setState({
                        toridata: cdata,
                        totalresults: (this.state.startpage === 1 ? res.count : this.state.totalresults),
                        loading:false,
                    }, () => {
                        this.loadTableData();
                    });
                } else {
                    // if(res && typeof res.extra === "string" && res.extra.length > 0){
                    //     alertService.error(res.extra);
                    // }
                    this.setState({
                        toridata: [],
                        loading:false,
                    }, () => {
                        this.loadTableData();
                    });
                }
            });
        }
    }
    loadTableData = () => {
        var cdata = [];
        if (this.state.toridata && this.state.toridata.length > 0) {
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);

            if (cfindList) {
                for (var i = 0; i < cfindList.data.length; i++) {
                    const citem = cfindList.data[i];
                    cdata.push({
                        0: "",
                        1: citem.fileName ? citem.fileName : "-",
                        2: citem.saleDate?moment(citem.saleDate).format("DD-MM-YYYY"):"-",
                        3: citem.syncDate ? convertDateTime(citem.syncDate): "-",
                        4: (citem.status!=null?{type: "status", text: (citem.status ==="success"?this.props.t("SUCCESS"):citem.status==="fail"?this.props.t("RESPONSE_STAT.failed"):"-"),
                        variant:(citem.status==="success"?"success":citem.status==="fail"?"danger":"")}:"-"),
                        5: citem.storeName ? citem.storeName : "-",
                        6: citem.remark ? citem.remark : "-"
                    });
                }
            }
        }
        console.log(cdata);
        this.setState({ ftablebody: cdata }, () => {
            this.setState({ isdataloaded: true });
        });
    }
//page change
handlePageChange = (cstartpage) => {
    var cfindList = this.state.toridata.find(x => x.page === cstartpage);
    var csobj = this.state.sobj;
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
//setFilterDates
setFilterDates=(date,type)=>{
    if (type === "startDate") {
        
        if(this.state.filterEndDate===null || this.state.filterEndDate===""){
            this.setState({filterStartDate:date},()=>{
            })
        }else{
            if(date >= this.state.filterEndDate){
                alertService.error(this.props.t('PLEASE_SET_VALID_DATE_RANGE'));
            }else{
                this.setState({filterStartDate:date})
            }
        }

    }
    if (type === "toDate") {

        if(this.state.filterStartDate===null || this.state.filterStartDate===""){
            alertService.error(this.props.t('PLEASE_SET_A_FROM_DATE'));
        }else{
            if(date <= this.state.filterStartDate){
                alertService.error(this.props.t('PLEASE_SET_VALID_DATE_RANGE'));
            }else{
                this.setState({filterEndDate:date})
            }
        }

    }
    if (type === "saleToDate") {

        if(this.state.filterSaleStartDate===null || this.state.filterSaleStartDate===""){
            alertService.error(this.props.t('PLEASE_SET_A_FROM_DATE'));
        }else{
            if(date <= this.state.filterSaleStartDate){
                alertService.error(this.props.t('PLEASE_SET_VALID_DATE_RANGE'));
            }else{
                this.setState({filterSaleEndDate:date})
            }
        }        

    }
    if (type === "saleStartDate") {

        if(this.state.filterSaleEndDate===null || this.state.filterSaleEndDate===""){
            this.setState({filterSaleStartDate:date},()=>{
            })
        }else{
            if(date >= this.state.filterSaleEndDate){
                alertService.error(this.props.t('PLEASE_SET_VALID_DATE_RANGE'));
            }else{
                this.setState({filterSaleStartDate:date})
            }
        }

    }

}
handleFilterStatus=(val)=>{
    var disablesaledate=false;
    var salestartdate=this.state.filterSaleStartDate
    var saleenddate=this.state.filterSaleEndDate
    if(val.target.value==="fail"){
        disablesaledate=true
        salestartdate=null
        saleenddate=null
    }
this.setState({filterstatus:val.target.value===""?null:val.target.value,disableSaleDates:disablesaledate,filterSaleEndDate:saleenddate,filterSaleStartDate:salestartdate})
}
handleFilterbranches=(evt)=>{
  
    this.setState({filterBranchId:evt.target.value})
}
//search
searchfilterHandle=()=>{
    var allow=this.validatedaterange()
    if(allow){
        var csobj = this.state.sobj;
        csobj.status=this.state.filterstatus;
        csobj.endDate= this.state.filterEndDate?new Date(moment(this.state.filterEndDate).format('YYYY-MM-DD')):null;
        csobj.startDate=this.state.filterStartDate?new Date(moment(this.state.filterStartDate).format('YYYY-MM-DD')):null;
        csobj.saleEndDate=this.state.filterSaleEndDate?new Date(moment(this.state.filterSaleEndDate).format('YYYY-MM-DD')):null;
        csobj.saleStartDate=this.state.filterSaleEndDate?new Date(moment(this.state.filterSaleStartDate).format('YYYY-MM-DD')):null;
        csobj.startIndex=0;
        this.setState({sobj:csobj,startpage: 1, totalresults: 0,},()=>{
            this.handleTableSearch(null, "click"); 
        })
    }
    
}
resetFilterHandle=()=>{
this.setState({ 
    filterStartDate:null,
    filterEndDate:null,
    filterSaleEndDate:null,
    filterSaleStartDate:null,
    filterstatus:null,
    disableSaleDates:false,
    disableSaleEnddate:false,
    filterBranchId:-1,
    sobj: this.defaultFilterObject(true),
    startpage: 1, totalresults: 0,
    sfilterobj: {filterOpt:"",isReqPagination:true,startIndex:0,maxResult:8,isReqCount:false,}, //
},()=>{
    this.handleTableSearch(null, "click"); 
})
}
//row click
handleRowClick = (cidx) => {
    
    var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
    // console.log( cfindList.data[cidx].status==="fail");
    var redxobj={
        sfilterobj:this.state.sfilterobj,
        startpage:this.state.startpage,
        viewType:null,
        sobj:this.state.sobj,
        totalresults:this.state.totalresults,
        maxShowresultcount : this.state.maxShowresultcount,
        orimaxShowresultcount : this.state.orimaxShowresultcount,
    }
    this.props.setpageDetails(redxobj)
    if (cfindList) {
        if(cfindList.data[cidx].status!=="fail"){
            //click
            this.props.handleviewsalestable(  cfindList.data[cidx].id)
        }
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

validatedaterange=()=>{
    var allow = true
    if(this.state.filterStartDate!==null){
        if(this.state.filterEndDate===null){
            allow = false
            alertService.error(this.props.t('PLEASE_SET_VALID_DATE_RANGE'));
        }
    }
    if(this.state.filterEndDate!==null){
        if(this.state.filterStartDate===null){
            allow = false
            alertService.error(this.props.t('PLEASE_SET_VALID_DATE_RANGE'));
        }
    }
    if(this.state.filterSaleStartDate!==null){
        if(this.state.filterSaleEndDate===null){
            allow = false
            alertService.error(this.props.t('PLEASE_SET_VALID_DATE_RANGE'));
        }
    }
    if(this.state.filterSaleEndDate!==null){
        if(this.state.filterSaleStartDate===null){
            allow = false
            alertService.error(this.props.t('PLEASE_SET_VALID_DATE_RANGE'));
        }
    }
    return allow
}
    
    render() {
        const ftableheaders = [ {text: "", width: "1%"},this.props.t('FILE_NAME'),this.props.t('SALES_DATE'), this.props.t('SYNC_DATE_N_TIME'), this.props.t('status'), this.props.t('branch'),this.props.t('REMARK')];
        return (
            <div>
                 <div style={{textAlign: "center"}}>
                     <SalelogFilter maxShowresultcount={this.state.maxShowresultcount} filterBranchId={this.state.filterBranchId} branches={this.props.branches} isBranch={true} filterstatus={this.state.filterstatus} disableSaleDates={this.state.disableSaleDates} status={true} department={false} productName={false} filterStartDate={this.state.filterStartDate} filterEndDate={this.state.filterEndDate} filterSaleStartDate={this.state.filterSaleStartDate} 
                     filterSaleEndDate={this.state.filterSaleEndDate} handleShowingresults={this.handleShowingresults} setFilterDates={this.setFilterDates} handleFilterStatus={this.handleFilterStatus} searchfilterHandle={this.searchfilterHandle} resetFilterHandle={this.resetFilterHandle} handleFilterbranches={this.handleFilterbranches} />
                     </div>
                <div className="synclogtable">
                    {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0 ?
                        <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sfilterobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}   />
                    :this.state.isdataloaded?<>
                        <AcNoDataView />
                    </>:<></>}
                </div>
                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
            </div>
        );
    }
}

export default withTranslation()(withRouter(SynclogTable))
