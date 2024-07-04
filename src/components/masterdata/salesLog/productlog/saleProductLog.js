import moment from 'moment';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom'
import { alertService } from '../../../../_services/alert.service';
import { convertDateTime, FindMaxResult, preventinputToString } from '../../../../_services/common.service';
import { submitCollection } from '../../../../_services/submit.service';
import { AcNoDataView, AcTable, AcViewModal } from '../../../UiComponents/AcImports';
import { submitSets } from '../../../UiComponents/SubmitSets';
import SalelogFilter from '../filter/salelogFilter';

export class SaleProductLog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading:false,
            departments:[],
            filterStartDate: null,
            filterEndDate:null,
            filterSaleEndDate:null,
            filterSaleStartDate:null,
            filterProduct:null,
            filterDepartmet:null,
            toridata: [],
            isdataloaded: false,
            ftablebody: [],
            sobj: this.defaultFilterObject(),
            startpage: 1, totalresults: 0,
            sfilterobj: {filterOpt:"",isReqPagination:true,startIndex:0,maxResult:8}, //
            oneresultheight: 58, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles
        }
    }
    componentDidMount() {
       this.loadDepartments();

       var maxresutcount=FindMaxResult(this.props.whitecontainer.current?(this.props.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,290)
       this.setState({
           maxShowresultcount:((maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8)),orimaxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8)
       },()=>{
        // this.handleTableSearch(null, "click"); //load all sync table data
       })
      
    }

    componentDidUpdate(prevProps) {
        if (this.props.tabClick !== prevProps.tabClick) {
            this.handleTableSearch(null, "click"); //load all sync table data
        }
      }

    defaultFilterObject = () => {
        return {productName:null, departmentId: null, isReqPagination: true, startIndex: 0, maxResult: 8, startDate: null , endDate: null ,saleStartDate:null,saleEndDate:null };
    }
    //filter department change
    handleFilterDepartment=(evt)=>{
        var did=null
        if(evt.target.value!==""){
            did=evt.target.value
        }
        this.setState({filterDepartmet:did})
    }
    //product filter handle
    handleFilterProduct=(evt)=>{
        if(!preventinputToString(evt,evt.target.value,this.props.t('Character.barcode'))){
            evt.preventDefault()
            return
        }
        this.setState({filterProduct:evt.target.value})
    }
    loadDepartments=()=>{
        var obj = { isReqPagination: false, isIgnoreHide: false };
        
        submitSets(submitCollection.searchDepatments, obj, true, null, true).then(res => {
            if(res && res.status){
                this.setState({departments:res.extra})
            }else{
                // alertService.error(res.extra)
            }
        })
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
            submitSets(submitCollection.autoSalesProductLog, ssobj, true, null, true).then(res => {
               this.props.getTileDetails()
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
                    var depts = [];
                     //if planogram depts available push to depts array to create lable list
                    if(citem.departments){
                        for (let x = 0; x < citem.departments.length; x++) {
                                depts.push( citem.departments[x].departmentName);
                        }
                    }
                    cdata.push({
                        0: "", 
                        1: citem.barcode?citem.barcode:"-",
                        2: citem.productName,
                        3: citem.syncDate ? convertDateTime(citem.syncDate) : "-",
                        4: citem.saleDate ? moment(citem.saleDate).format('DD-MM-YYYY') : "-",
                        5: {type: "lbllist", list:depts, variant:"success", style:"dxs-label"},
                        6: citem.jobNumber ? citem.jobNumber : "-",
                        7: citem.syncType ? citem.syncType : "-"
                    });
                }
            }
        }
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
//search
searchfilterHandle=()=>{
    var allow=this.validatedaterange()
    if(allow){
       var csobj = this.state.sobj;
    csobj.productName=this.state.filterProduct;
    csobj.endDate=this.state.filterEndDate? moment(this.state.filterEndDate).format('YYYY-MM-DD'):null;
    csobj.startDate=this.state.filterStartDate?moment(this.state.filterStartDate).format('YYYY-MM-DD'):null;
    csobj.saleEndDate=this.state.filterSaleEndDate? moment(this.state.filterSaleEndDate).format('YYYY-MM-DD'):null;
    csobj.saleStartDate=this.state.filterSaleEndDate?moment(this.state.filterSaleStartDate).format('YYYY-MM-DD'):null;
    csobj.departmentId=this.state.filterDepartmet;
    csobj.startIndex=0;
    this.setState({sobj:csobj},()=>{
        this.handleTableSearch(null, "click"); 
    })
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

handleShowingresults=(e, isonblur)=>{
    if(isonblur===true){
        this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
    }
    else{
        this.setState({maxShowresultcount: e.target.value})
    }
}

resetFilterHandle=()=>{
    this.setState({ 
        filterStartDate:null,
        filterEndDate:null,
        filterSaleEndDate:null,
        filterSaleStartDate:null,
        filterProduct:null,
        filterDepartmet:null,
        disableSaleDates:false,
        disableSaleEnddate:false,
        sobj: this.defaultFilterObject(),
    },()=>{
        this.handleTableSearch(null, "click"); 
    })
    }
    
    render() {
        const ftableheaders = [ {text: "", width: "1%"},this.props.t('barcode'), this.props.t('productname'), this.props.t('SYNC_DATE_N_TIME'),this.props.t('SALES_DATE'), this.props.t('department'), this.props.t('JOB_NUMBER'),this.props.t('SYNC_TYPE')];
        return (
            <div>
                <div style={{textAlign: "center"}}>
                     <SalelogFilter maxShowresultcount={this.state.maxShowresultcount} isBranch={false} filterDepartmet={this.state.filterDepartmet} filterProduct={this.state.filterProduct} disableSaleDates={false} status={false} department={true} productName={true} departments={this.state.departments} filterStartDate={this.state.filterStartDate} filterEndDate={this.state.filterEndDate} filterSaleStartDate={this.state.filterSaleStartDate} filterSaleEndDate={this.state.filterSaleEndDate} 
                      handleShowingresults ={this.handleShowingresults} setFilterDates={this.setFilterDates} handleFilterDepartment={this.handleFilterDepartment} handleFilterProduct={this.handleFilterProduct} searchfilterHandle={this.searchfilterHandle} resetFilterHandle={this.resetFilterHandle} />
                     </div>
                <div className="synclogtable prodlogtable">
                    {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0?
                        <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sfilterobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handlePageChange={this.handlePageChange} />
                    :this.state.isdataloaded?<>
                        <AcNoDataView />
                    </>:<></>}
                </div>
                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
            </div>
        );
    }
}
export default withTranslation()(withRouter(SaleProductLog))
