import React from 'react'
import { Link, withRouter } from 'react-router-dom';
import { Col, Breadcrumb, Button, Form } from 'react-bootstrap'
import { AcNoDataView, AcTable, AcViewModal } from '../UiComponents/AcImports';
import { connect } from 'react-redux';

import { submitSets } from '../../components/UiComponents/SubmitSets';
import { submitCollection } from '../../_services/submit.service';
import { FindMaxResult, monthsList, preventinputToString, preventinputotherthannumbers } from '../../_services/common.service';

import { PDviewDataAction, viewSetAction, setFieldStoreAction, setDepGridDates } from '../../actions/planogram/planogram_action';
import { withTranslation } from 'react-i18next';
import './planograms.css';
import { ConfirmedListIcon } from '../../assets/icons/icons';
import BulkLayoutActivation from './BulkFloorLayoutActive/BulkLayoutActivation';
import SuccessModel from './BulkFloorLayoutActive/SuccessModel';
// import { alertService } from '../../_services/alert.service';


/**
 * planogram stores list view 
 * shows all avaiable stores list
 * backend checks available planograms for each stores (active > confirmed > draft). otherwise not sending any plangram details
 * when selecting a store handleRowClick function updates redux states that needed in layout view to load data
 *
 * @class Planograms
 * @extends {React.Component}
 */
export class Planograms extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            toridata: [], isnottesting: true,
            isdataloaded: false,
            ftablebody: [],
            sobj: this.defaultFilterObject(),
            startpage: 1, totalresults: 0,
            excelexportdata: [], isexcellinkdisabled: false,
            oneresultheight: 55, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles
            confirmedListModelShow:false,
            successModelShow:false,
            loaded: false,
            layoutDetails:[]
        }

    }

    componentDidMount() {
        this._isMounted = true;
        if(this._isMounted){
            //using when store change reload list
            this.props.history.listen((newLocation, action) => {
                if(newLocation && newLocation.pathname === "/planograms"){
                    //reset pagination
                    this.getTriggerSearch();
                }
            });

            //check search saved object available
            if(sessionStorage.getItem("plgsearchfilters")){
                var cfilterobj = JSON.parse(sessionStorage.getItem("plgsearchfilters"));
                
                var defaultmaxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145);
                var mxcount = (cfilterobj.maxShowresultcount ? cfilterobj.maxShowresultcount : defaultmaxresutcount.maxresultCount);
                var orimxcount = (cfilterobj.orimaxShowresultcount ? cfilterobj.orimaxShowresultcount : defaultmaxresutcount.maxresultCount);
                
                this.setState({sobj: cfilterobj.sobj, startpage: cfilterobj.startpage, totalresults: cfilterobj.totalresults, maxShowresultcount:mxcount, orimaxShowresultcount:orimxcount}, () => {
                    this.handleTableSearch(null, "click");
                });
            } else{
                var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145);
                this.setState({
                    maxShowresultcount:maxresutcount.maxresultCount,orimaxShowresultcount:maxresutcount.maxresultCount
                },()=>{
                    this.handleTableSearch(null,"click");
                })
            }
          
            //reset current redux values
            /* this.props.setPLanogramView(null);
            this.props.setPLanogramdetailsView(null); */
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultFilterObject = () => {
        return { florName: "", isReqPagination: true, startIndex: 0, maxResult: 8 };
    }
    //reset table filters 
    resetTableFilters = () => {
        this.setState({ sobj: this.defaultFilterObject(), startpage: 1}, () => {
            this.handleTableSearch(null,"click");
        });
    }
    //reset search 
    getTriggerSearch = () => {
        this.setState({ sobj: { florName: "", isReqPagination: true, startIndex: 0, maxResult: 8 }, startpage: 1, totalresults: 0 }, () => {
            this.handleTableSearch(null, "click");
        });
    }
    //new planigram layout link - not using
    handleNewLink = () => {
        this.props.setPLanogramView(null);
        this.props.setPLanogramdetailsView(null)
        this.props.history.push("/planograms/details");
    }
    //table row click
    handleRowClick = (cidx,citem) => {
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if(cfindList){
            if(citem && citem[0] && citem[0] !== ""){
                let finditem = cfindList.data.find(z => z.storeId === citem[0]);
                if(finditem){
                    this.loadRowDetails(finditem,true);
                }
            } else{
              
                this.loadRowDetails(cfindList.data[cidx],true);
            }
            this.props.updatestore(citem[0]);
        }
         this.saveFilterObject(this.state.startpage,this.state.sobj,this.state.totalresults);
         this.props.setDepGridDates(null);
    }
    //
    loadRowDetails = (rowobj,status) => {
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if (cfindList) {
            this.props.setPLanogramdetailsView(null);
            
            if(rowobj.id > 0){
                this.props.setFieldStore(rowobj.storeId);
                this.props.setPLanogramView(rowobj);
            } else if(rowobj){ //if store dont have layout
                this.props.setFieldStore(rowobj.storeId);
                this.props.setPLanogramView(null);
            }
            if(status === true){
                this.props.history.push("/planograms/details");
            }else{
                window.open("/planograms/details", '_blank');
            }
          
        }
    }

    //load table data
    loadTableData = () => {
        var months = monthsList;
        var cdata = [];
        if (this.state.toridata && this.state.toridata.length > 0) {
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);

            if (cfindList) {
                for (var i = 0; i < cfindList.data.length; i++) {
                    const citem = cfindList.data[i];
                    var tags = [];
                    var datetxt = "-";
                    //convert date string if available
                    if(citem.date!==null&&citem.date!==undefined){
                        var mdate = new Date(citem.date);
                        if(this.props.isRTL==="rtl"){
                            datetxt = (mdate.getFullYear() + " " + months[mdate.getMonth()] + " " + mdate.getDate());
                        }else{
                            datetxt = (mdate.getDate() +" " +months[mdate.getMonth()]+ " "+mdate.getFullYear());
                        }
                        
                    }
                    //if planogram tags available push to tags array to create lable list
                    for (let x = 0; x < citem.tags.length; x++) {
                        tags.push(citem.tags[x].tagDto!==null && citem.tags[x].tagDto!==undefined? citem.tags[x].tagDto.tagName:"");
                    }
                    //push new table row
                    cdata.push({ 0: citem.storeId, 1: (citem.storeName?citem.storeName:"-"), 2: (citem.mainVersion?citem.mainVersion.replace(/ /g, '').toString():"-"), 3: (citem.floorStatus!=null?{type: "status", text: this.getStatusText(citem.floorStatus),
                    variant:(citem.floorStatus==="ACTIVE"?"success":citem.floorStatus==="INACTIVE"?"danger":citem.floorStatus==="MERGE"?"info":"warning")}:"-"),4:datetxt, 5:{type: "lbllist", list: tags, variant:"success", style:"dxs-label"} });
                }
            }

        }
        this.setState({ ftablebody: cdata });
        // this.saveFilterObject(this.state.startpage,this.state.sobj,this.state.totalresults);
    }

    //filter search
    handleTableSearch = (evt, etype) => {
        if (this.state.isnottesting && (etype === "click" || (etype === "enter" && evt.which === 13))) {
            var maxresutcount = this.state.maxShowresultcount;
            let sobj = this.state.sobj;
            sobj.maxResult = maxresutcount;
            // sobj.isReqPagination = false

            this.setState({
                toridata: [],
                isdataloaded: false,
                sobj:sobj,
            }, () => {
                this.loadTableData();
            });
            // sessionStorage.removeItem("plgsearchfilters");

            submitSets(submitCollection.newSearchPlanograms, sobj, false).then(res => {
                var cdata = this.state.toridata;
                if (res && res.status) {
                    cdata.push({ page: (this.state.startpage), data: res.extra });
                    this.setState({
                        isdataloaded: true,
                        toridata: cdata,
                        totalresults: (this.state.startpage === 1 ? res.count : this.state.totalresults),
                    }, () => {
                        this.loadTableData();
                    });
                } else {
                    this.setState({
                        isdataloaded: true,
                        toridata: cdata,
                    }, () => {
                        this.loadTableData();
                    });
                }
            });
        }
    }

    //set filter object
    handleFilterObject = (evt, etype, ctype,msg) => {
        var cobj = this.state.sobj;
        var cstartpage = this.state.startpage;
        var ctotalresults = this.state.totalresults;
        if(evt){
            if(etype === "florName"){
                if(!preventinputToString(evt,evt.target.value,msg)){
                    evt.preventDefault()
                    return
                }
            }
            cobj[etype] = evt.target.value;
        }
        if(ctype === "click" || ctype === "enter"){
            cobj["startIndex"] = 0;

            cstartpage = 1;
            ctotalresults = 0;
        }
        
        this.setState({ sobj: cobj, startpage: cstartpage, totalresults: ctotalresults }, () => {
            if (ctype === "click" || (ctype === "enter" && evt.which === 13)) {
                this.handleTableSearch(null, "click");
            }
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
    //save filter object
    saveFilterObject = (startpage,sobj,totalresults) => {
        const sfobj = {startpage: startpage, sobj: sobj, totalresults: totalresults, maxShowresultcount:this.state.maxShowresultcount, orimaxShowresultcount:this.state.orimaxShowresultcount };
        sessionStorage.setItem("plgsearchfilters", JSON.stringify(sfobj));
    }
    
    handleShowingresults=(e, isonblur,msg)=>{
        if(isonblur===true){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
        }
        else{
            this.setState({maxShowresultcount: e.target.value})
        }
    }

    handleCloseConfirmModel = ()=>{
        this.setState({ loaded: true }, () => {
            submitSets(submitCollection.getconfimplanogramList, true, false, null, true).then(res => {
                if(res && res.status){
                    this.setState({
                        layoutDetails:res.extra,
                    },()=>{
                       this.handleConfirmModel();
                    })
                }else{
                //   alertService.error((res&&res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
                }
    
                this.setState({ loaded: false });
            });
        });
    }

    handleConfirmModel =()=>{
        this.setState({
            confirmedListModelShow : !this.state.confirmedListModelShow
        })
    }
    closeUpdateModelOpenSuccessModel =()=>{
        this.setState({
            confirmedListModelShow : false,
            loaded:false,
        },()=>{
            this.setState({
                successModelShow:true
            })
        })
    }
    
    closeSuccessModel = ()=>{
        this.setState({successModelShow : false},()=>{
            this.props.history.push("/planograms");
        })
      
    }
    getStatusText = (floorStatus) => {
        return this.props.t(floorStatus);
    }

    render() {
        const ftableheaders = ["", this.props.t('branch'), this.props.t('version'), this.props.t('status'), this.props.t('date'), this.props.t('tags')];
        return (<>
            <Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <div>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                        <Breadcrumb.Item active>{this.props.t('planograms')}</Breadcrumb.Item>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        </>:<>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        <Breadcrumb.Item active>{this.props.t('planograms')}</Breadcrumb.Item>
                        </>}
                    </Breadcrumb>
                    <div>
                        <Col className="white-container plgstore-container" ref={this.whitecontainer} >
                        
                             <Button variant="outline-primary" className="task-exportexcel-link ConfirmedList "  onClick={this.handleCloseConfirmModel}><ConfirmedListIcon size={20} color={this.props.dmode?"#2CC990":"#5128a0"}/> {this.props.t('btnnames.ConfirmedList')} </Button>
                            <Col className="custom-filters form-inline">
                                <Form.Group>
                                    <label className="filter-label">{this.props.t('btnnames.search')}</label>
                                    <Form.Control placeholder={this.props.t('findstore')} value={this.state.sobj.florName} onChange={e => this.handleFilterObject(e, "florName", "change",(this.props.t('Character.search_text')))} onKeyUp={e => (e.which ===13? this.handleFilterObject(e, "florName", "enter"):null)} onKeyDown={(e)=>  preventinputToString(e,e.target.value,(this.props.t('Character.search_text')))} />
                                </Form.Group>
                                <Form.Group>
                                    <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                    <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false,this.props.t('Character.results'))} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => evt.key === "."? evt.preventDefault(): preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } /></span>
                                </Form.Group>
                                
                                <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(null, null, "click")}>{this.props.t('btnnames.search')}</Button>
                                <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                            </Col>
                            {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0 ?
                                <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange} />
                            :this.state.isdataloaded?<>
                                <AcNoDataView />
                            </>:<></>}
                        </Col>
                    </div>
                </div>
            </Col>
            
            <AcViewModal showmodal={!this.state.isdataloaded} />
            <AcViewModal showmodal={this.state.loaded} />
            <BulkLayoutActivation view={this.loadRowDetails} data={this.state.layoutDetails} dmode={this.props.dmode} isRTL={this.props.isRTL}  t={this.props.t} closeloading={()=>{this.setState({loaded: false})}} OpenLoading={()=>{this.setState({loaded: true})}}   closeUpdateModelOpenSuccessModel={this.closeUpdateModelOpenSuccessModel}  handleClose={this.handleConfirmModel} confirmedListModelShow={this.state.confirmedListModelShow} />
            <SuccessModel isRTL={this.props.isRTL}  t={this.props.t} showmodal={this.state.successModelShow} onHide = {this.closeSuccessModel}  />
        </>)
    }
}
//set redux actions
const mapDispatchToProps = dispatch => ({
    setPLanogramView: (payload) => dispatch(viewSetAction(payload)),
    setPLanogramdetailsView: (payload) => dispatch(PDviewDataAction(payload)),
    setFieldStore: (payload) => dispatch(setFieldStoreAction(payload)),
    setDepGridDates: (payload) => dispatch(setDepGridDates(payload)),
});
export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(Planograms)));
