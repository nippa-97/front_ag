import { ArrowLeftIcon } from '@primer/octicons-react';
import moment from 'moment';
import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import { confirmAlert } from 'react-confirm-alert';
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import { alertService } from '../../../../../_services/alert.service';
//import { convertDateTime } from '../../../../../_services/common.service';
import { submitCollection } from '../../../../../_services/submit.service';
import { AcTable, AcViewModal } from '../../../../UiComponents/AcImports';
import { submitSets } from '../../../../UiComponents/SubmitSets';
class SyncLogOpen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading:false,
            toridata: [],
            isdataloaded: false,
            ftablebody: [],
            sobj: this.defaultFilterObject(),
            startpage: 1, totalresults: 0,
            sfilterobj: {filterOpt:"",isReqPagination:true,startIndex:0,maxResult:8}, //
        }
    }
    componentDidMount() {
        this.handleTableSearch(null, "click"); //load all sync table data
    }
    defaultFilterObject = () => {
        return { syncLogId: "", isReqPagination: true, startIndex: 0, maxResult: 8 };
    }
    // LoadSalesTable=()=>{
    //     console.log(this.props.clikingId);
       
    // }
    //data to sync table 
    handleTableSearch = (evt, etype) => {
        if (etype === "click" || (etype === "enter" && evt.which === 13)) {
            var obj=this.state.sobj
            obj.syncLogId=this.props.clikingId
            this.setState({
                sobj:obj,
                toridata: [],
                isdataloaded: false,
                loading:true,
            });

            submitSets(submitCollection.autoImportedSalesLog, this.state.sobj, true, null, true).then(res => {
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
                        1: citem.barcode ? citem.barcode : "-",
                        2: citem.name?citem.name:"-",
                        3: citem.sale ? citem.sale : "-",
                        4: citem.salePlusTax ? citem.salePlusTax: "-",
                        5: citem.profit ? citem.profit: "-",
                        6: citem.qty ? citem.qty : "-",
                        7: citem.saleDate ? moment(citem.saleDate).format("DD-MM-YYYY") : "-",
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
handleReverseSaleFile=()=>{
    confirmAlert({
        title: this.props.t('SURE_REVERSE_THIS_SALE'),
        message: this.props.t('THIS_WILL_REVERSE_SYNC_LOG_FILE'),
        overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
        buttons: [{
            label: this.props.t('btnnames.yes'),
            onClick: () => {
                this.setState({loading:true},()=>{
                    setTimeout(() => {
                        this.duobleconfirmsendReverseSaleFileCall();
                        this.setState({loading:false})
                      }, 4000);
                })
                
               
            }
        }, {
            label:  this.props.t('btnnames.no'),
            onClick: () => {
                return false;
            }
        }]
    });
}
duobleconfirmsendReverseSaleFileCall=()=>{
    confirmAlert({
        title: this.props.t('REALY_SURE_REVERSE_THIS_SALE'),
        message: this.props.t('THIS_WILL_REVERSE_SYNC_LOG_FILE'),
        overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
        buttons: [{
            label: this.props.t('btnnames.yes'),
            onClick: () => {
                this.sendReverseSaleFileCall();
            }
        }, {
            label:  this.props.t('btnnames.no'),
            onClick: () => {
                return false;
            }
        }]
    });

}
sendReverseSaleFileCall=()=>{
    this.setState({loading:true})
    var sobj={
        autoSaleImportId: this.props.clikingId
    }
    submitSets(submitCollection.saleLogReverse, sobj, true).then(res => {
        if (res && res.status) {
            this.setState({loading:false})
            this.props.handleViewSyncLogTable()
        }else{
            this.setState({loading:false})
            alertService.error(this.props.t('ERROR_OCCURRED'));
        }

    })
}
    render() {
        const ftableheaders = [ {text: "", width: "1%"},this.props.t('barcode'), this.props.t('productname'), this.props.t('sale'), this.props.t('SALES_PLUS_TAX'), this.props.t('profit'), this.props.t('QUANTITY'),this.props.t('SALES_DATE')];
        return (
            <div>
               <div className="btngroup-synclog">
                    <Button className="backbtn-synclog" onClick={()=>this.props.handleViewSyncLogTable()}><ArrowLeftIcon size={18} />{this.props.t('BACK_TO_SYNCLOG')}</Button>
                    <Button style={{background:"#ffc107",float:this.props.isRTL==="rtl"?"left":"right"}} className="backbtn-synclog" onClick={()=>this.handleReverseSaleFile()}>{this.props.t('REVERSE_SALE_FILE')}</Button>
               </div>
                <div className="synglogopen">
                {/* <h5>Sales</h5> */}
                {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0 ?
                                <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sfilterobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sfilterobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}   />
                                : <></>}
                </div>
                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
            </div>
        );
    }
}


export default withTranslation()(withRouter(SyncLogOpen))