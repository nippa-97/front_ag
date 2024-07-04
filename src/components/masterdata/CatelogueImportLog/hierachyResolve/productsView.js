import React ,{ Component } from 'react';
import { withRouter,  } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Col, Form , Button , Modal } from 'react-bootstrap';
import { XIcon } from '@primer/octicons-react';
//import Select from 'react-select';

import { submitCollection } from '../../../../_services/submit.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
// import { alertService } from '../../../../_services/alert.service';
import { AcTable, AcViewModal } from '../../../UiComponents/AcImports';

import "./hierachyResolve.css";
import { FindMaxResult, maxInputLength, preventinputotherthannumbers } from '../../../../_services/common.service';

export class HierachyIssueProducts extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.whitecontainer=React.createRef();
        this.state = {
            loading:false,
            sobj: this.defaultFilterObject(),
            toridata: [],
            isdataloaded: false,
            ftablebody: [],
            startpage: 1, totalresults: 0,
            maxPageCount:8,
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,65,145)
            let maxResult = (maxresutcount.maxresultCount ? maxresutcount.maxresultCount: 8 );
            this.setState({maxPageCount:maxResult},()=>{
                this.handleTableSearch(null,"click");
            });
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultFilterObject = () => {
        return { search: "", isReqPagination: true, startIndex: 0, maxResult: 8, importHierarchyIssueId: -1,  isReqCount: false };
    }

     //set filter object
     handleFilterObject = (evt, etype, ctype) => {
        var cobj = this.state.sobj;
        cobj[etype] = evt.target.value;
        cobj["startIndex"] = 0;

        this.setState({ sobj: cobj, startpage: 1 }, () => {
            if (ctype === "click" || (ctype === "enter" && evt.which === 13)) {
                this.handleTableSearch(null, "click");
            }
        });
    }

    //filter search
    handleTableSearch = (evt, etype) => {
        if (etype === "click" || (etype === "enter" && evt.which === 13)) {
            var csobj=this.state.sobj;
            csobj.maxResult = this.state.maxPageCount;
            this.setState({
                sobj:csobj,
                toridata: [],
                isdataloaded: false,
                loading:true,
            },()=>{
                
            });

            csobj.importHierarchyIssueId = this.props.importHierarchyIssueId;

            submitSets(submitCollection.loadHierachyIssueProducts, csobj, true, null, true).then(res => {
                //console.log(res);
                if (res && res.status && res.extra && typeof res.extra !== "string") {
                    var cdata = this.state.toridata;

                    var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                    if (cpageidx > -1) {
                        cdata[cpageidx].data = res.extra;
                    } else {
                        cdata.push({ page: (this.state.startpage), data: res.extra });
                    }

                    let sobj = this.state.sobj;

                    this.setState({
                        toridata: cdata,
                        totalresults: (this.state.startpage === 1 || sobj.isReqCount? res.count : this.state.totalresults),
                        loading:false,
                    }, () => {
                        this.loadTableData();

                        sobj.isReqCount = false;
                        this.setState({ sobj: sobj, });
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
                    //console.log(citem);
                    cdata.push({
                        0: citem.id, 
                        1: citem.barcode,
                        2: citem.productName ,
                        //3: {type:"status", text:(citem.manualyHierarchyFixed===true ? "Yes" : "No") , variant:(citem.manualyHierarchyFixed===true ? "success" :"warning")} ,
                        3:(citem.manualyHierarchyFixed===true ? {type:"button", variant:"success", size:"sm", icon:"tool" , iconsize:15  } :"-"),
                        4: (citem.resolvedStatus ? {type:"status", text:citem.resolvedStatus , variant:(citem.resolvedStatus==="Resolved" ? "success" :"warning")}:"-") ,
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
            // this.handleTableSearch(null, "click");
        });
    }

    resetTableFilters = () =>{
        //var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,65,145)
        //let maxResult = (maxresutcount.maxresultCount ? maxresutcount.maxresultCount: 8 );
        this.setState({sobj: this.defaultFilterObject(),},()=>{
            this.handleTableSearch(null,"click");
        });
    }

    // handleShowingresults=(e)=>{
    //     let maxResult = (e.target.value!=="" && e.target.value>0 ? e.target.value : 8);
    //     this.setState({maxPageCount:maxResult});
    // }

    handleShowingresults=(e, isonblur)=>{
        var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,65,145)
        let defaultcout = (maxresutcount.maxresultCount ? maxresutcount.maxresultCount: 8 );
        
        if(isonblur===true){
            //this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
            let maxResult = (e.target.value!=="" && e.target.value>0)?e.target.value:defaultcout;
            this.setState({maxPageCount:maxResult});
        }
        else{
            //this.setState({maxShowresultcount: e.target.value})
            let maxResult = e.target.value;
            this.setState({maxPageCount:maxResult});
        }
    }

    render(){
        const ftableheaders = ["", this.props.t('barcode'), this.props.t('productname'),  this.props.t('MANUALLY_FIXED'), this.props.t('status'),];
        return(
            <>
                <Modal size='lg' show={this.props.isShowProductModal} className={"hierachyIssue-products "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.handleToggleProductsModal() }} backdrop="static" dir={this.props.isRTL} animation={false}>
                    <Modal.Header>
                        <Modal.Title>
                           {this.props.t("productslist")}
                        </Modal.Title>
                        <button className="close-btn" onClick={ () => this.props.handleToggleProductsModal()} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body ref={this.whitecontainer}>
                        <Col className={'white-container '}>
                            <Col className="custom-filters form-inline">
                                <Form.Control maxLength={maxInputLength} placeholder={this.props.t('barcode')+", "+this.props.t('productname')} value={this.state.sobj.search} onChange={e => this.handleFilterObject(e, "search", "change")} onKeyUp={e => this.handleFilterObject(e, "search", "enter")} />

                                <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxPageCount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.maxShowresultcount) } /></span>
                            
                                <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e, null, "click")}>{this.props.t('btnnames.search')}</Button>
                                <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                            
                            </Col>

                            {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0 ?
                                <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange} />
                            : <></>}   

                        </Col>
                            {
                                this.state.isdataloaded && this.state.ftablebody.length ===0 ?
                                <h6 className='resolve_no_res_found_txt'>{this.props.t("NO_RESULT_FOUND")}</h6>:<></> 
                            }                     

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' className='reset' onClick={()=>this.props.handleToggleProductsModal()}>{this.props.t('btnnames.back')}</Button>
                    </Modal.Footer>
                </Modal>
                
                 
               
                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')}/>
                
            </>
        )
    }

}

export default withTranslation()(withRouter(HierachyIssueProducts));