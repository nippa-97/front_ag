import React, { Component } from 'react'
import { AcTable, AcViewModal } from '../../../UiComponents/AcImports'
import { FindMaxResult } from '../../../../_services/common.service'
import { submitCollection } from '../../../../_services/submit.service'
import { submitSets } from '../../../UiComponents/SubmitSets'
import { alertService } from '../../../../_services/alert.service'
import QueueJobLogFilters from '../filter/queueJobLogFilters'
import moment from 'moment'
export  class FileImportQueueJobs extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading:false,
            startpage: 1, 
            totalresults: 0,
            toridata: [],
            isdataloaded: false,
            ftablebody: [],
            sobj: this.defaultFilterObject(),
            sfilterobj: {filterOpt:"",isReqPagination:true,startIndex:0,maxResult:8},
            oneresultheight: 58, maxShowresultcount: 0, orimaxShowresultcount: 0,
        }
    }
    componentDidMount() {
 
        var maxresutcount=FindMaxResult(this.props.whitecontainer.current?(this.props.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,290)
        this.setState({
            maxShowresultcount:((maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8)),orimaxShowresultcount:(maxresutcount.maxresultCount>8?maxresutcount.maxresultCount:8)
        })
       
     }
 
     componentDidUpdate(prevProps) {
         if (this.props.tabClick !== prevProps.tabClick) {
             this.handleTableSearch(null, "click"); 
         }
       }
    defaultFilterObject = () => {
        return { isReqPagination: true,isReqCount:true,jobStatus:"",type:"",startIndex: 0, maxResult: 8, startDate: null , endDate: null};
    }

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
            submitSets(submitCollection.getfileImportQueueJob, ssobj, true).then(res => {
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
                    if(res && typeof res.extra === "string" && res.extra.length > 0){
                        alertService.error(res.extra);
                    }
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
                        1: citem.chain?citem.chain:"Dev Ceo",
                        2: citem.type != null?(citem.type === "Sale"?"Sale":citem.type === "Catelogue"?"Catalogue":"-"):"-",
                        3:(citem.jobStatus != null?{type: "status", text:citem.jobStatus,variant:(citem.jobStatus==="Completed"?"success":citem.jobStatus==="Canceled"?"danger":citem.jobStatus==="Pending"?"secondary":citem.jobStatus==="Ongoing"?"warning":"")}:"-"),
                        4: citem.jobId ? citem.jobId : "-",
                        5: citem.createdDate ? moment(citem.createdDate).format("YYYY-MM-DD").toString()  : "-",
                        6: citem.jobStatus==="Pending"?{type: "button",variant:"outline-danger",icon:"x-circle",iconsize:20,size:"sm",class:"cancelbtn",action:"cancel",title:"Cancel"} : "-"
                    });
                }
            }
        }
        this.setState({ ftablebody: cdata }, () => {
            this.setState({ isdataloaded: true });
        });
    }

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

    handleFilterChange =(key,value)=>{
        console.log(key,value);
        let sobj = structuredClone(this.state.sobj);
        sobj[key] = value;
        this.setState({
            sobj:sobj
        })
    }

    
    setFilterDates=(date,type)=>{
        let sobj = structuredClone(this.state.sobj);
        sobj[type] = date;
        if(type === "endDate"){
            let fromDate = sobj.startDate
            if(fromDate){
                if(!this.validateDates(fromDate,date)){
                    alertService.error(this.props.t('DATE_VALIDATION_MSG'));
                    return
                }
            }
        }

        if(type === "startDate"){
            let toDate = sobj.endDate
            if(toDate){
                if(!this.validateDates(date,toDate)){
                    alertService.error(this.props.t('DATE_VALIDATION_MSG'));
                    return
                }  
            }
        }
        this.setState({
            sobj:sobj
        })
    }

    validateDates(fromDate, toDate) {
        var fromDateObj = new Date(fromDate);
        var toDateObj = new Date(toDate);
    
        if (fromDateObj <= toDateObj) {
            return true;
        } else {
            return false;
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
    
    resetFilterHandle=()=>{
        this.setState({
            sobj: this.defaultFilterObject(),
        },()=>{
            this.handleTableSearch(null, "click"); 
        })
    }

    searchfilterHandle=()=>{
        let csobj = structuredClone(this.state.sobj);
        const fromDate = csobj.startDate;
        const toDate = csobj.endDate;
        if(fromDate || toDate){
            if(!fromDate){
                alertService.error(this.props.t('FROM_DATE_REQUIRED'));
                return
            }
            if(!toDate){
                alertService.error(this.props.t('TO_DATE_REQUIRED'));
                return
            }
        }
        this.setState({sobj:csobj},()=>{
            this.handleTableSearch(null, "click"); 
        })
    }

    handleRowClick = (cidx, citem, caction) => {
      
        if(caction){
            if(caction==="cancel"){
                let obj = this.state.ftablebody[cidx]
                this.cancelJob(obj[4]);
            }
        }
       
    }
 
    cancelJob =(jobId)=>{
        let sobj = {
            jobId:jobId
        }
        this.setState({
            loading:true
        });
        
        submitSets(submitCollection.deleQueueJob, sobj, true).then(res => {
            if (res && res.status && res.extra) {
                this.setState({
                    loading:false,
                }, () => {
                    this.handleTableSearch(null, "click"); 
                });
            } else {
                this.setState({
                    loading:false,
                }, () => {
                    this.handleTableSearch(null, "click"); 
                });
            }
        });

    }

  render() {
    const ftableheaders = ["",this.props.t('chain'),this.props.t('type'),this.props.t('Job_Status'),(this.props.t('Job_ID')),(this.props.t('CREATED_DATE')),("Action")];
    return (
      <div>
         <div>
            <QueueJobLogFilters 
                t={this.props.t} 
                handleFilterChange={this.handleFilterChange} 
                sobj={this.state.sobj} 
                setFilterDates={this.setFilterDates} 
                handleShowingresults={this.handleShowingresults}
                maxShowresultcount={this.state.maxShowresultcount}
                searchfilterHandle={this.searchfilterHandle}
                resetFilterHandle={this.resetFilterHandle}
            />
                
        </div>
        <div>
            {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0 ? 
            <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sfilterobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handlePageChange={this.handlePageChange} handleRowClick={this.handleRowClick}  />:<></>
            }
        </div>
        <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
    </div>
    )
  }
}
