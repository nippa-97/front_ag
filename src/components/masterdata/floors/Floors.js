import React from 'react'
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Col, Button,Breadcrumb, Form, Row } from 'react-bootstrap'

import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';

import { viewSetAction, setFloorPrevDetails } from '../../../actions/floors/floor_action';

import MDSidebarMenu from '../../common_layouts/mdsidebarmenu';

import { AcNoDataView, AcTable, AcViewModal } from '../../UiComponents/AcImports';
import { withTranslation } from 'react-i18next';
import { FindMaxResult,numOfDecimalsLimit,roundOffDecimal, preventinputToString, preventinputotherthannumbers } from '../../../_services/common.service';

export class Floor extends React.Component {
    _isMounted = false;

    constructor(props){
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            loading:false,
            toridata:[],
            isdataloaded: false,
            ftablebody: [],
            sobj: this.defaultFilterObject(),
            startpage: 1, totalresults: 0,
            oneresultheight: 55, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            if(this.props.floorState && this.props.floorState.floorPrevDetails){
                let prevdetails = this.props.floorState.floorPrevDetails;
                let prevviewtype = prevdetails.viewtype;
                
                if(prevviewtype){
                    let isresetting = false;
                    if(prevviewtype === "delete" || prevviewtype === "new"){
                        if(prevviewtype === "new"){
                            isresetting = true;
                        } else{
                            prevdetails["isReqCount"] = true;
                        }
                        
                        let prevftable = (prevdetails.ftablebody?prevdetails.ftablebody:[]);
                        if(prevviewtype === "delete" && prevftable.length === 1 && prevdetails.prevpage > 1){
                            const stindx = prevdetails.startIndex;
                            const maxresult = prevdetails.maxResult;
    
                            prevdetails.startIndex = (stindx - maxresult);
                            prevdetails.prevpage = (prevdetails.prevpage - 1);
                        }

                    } else{
                        prevdetails["isReqCount"] = true;
                    }
                    prevdetails["ftablebody"] = [];
                    prevdetails["maxResult"] = prevdetails.maxShowresultcount;
    
                    let pstartpage = (!isresetting?prevdetails.prevpage:1);
                    let ptotalresults = (!isresetting?prevdetails.totalresults:0);
                    let psearchobj = (!isresetting?prevdetails:this.defaultFilterObject());
    
                    this.setState({ sobj: psearchobj, startpage: pstartpage, totalresults: ptotalresults, maxShowresultcount:prevdetails.maxShowresultcount, orimaxShowresultcount:prevdetails.orimaxShowresultcount}, () => {
                        this.props.setPrevDetails(null);
                        this.handleTableSearch(null,"click");
                    });
                } else{
                    this.props.setPrevDetails(null);
                    var maxresutcount1=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145);
                    this.setState({
                        maxShowresultcount:maxresutcount1.maxresultCount,orimaxShowresultcount:maxresutcount1.maxresultCount
                    },()=>{
                        this.handleTableSearch(null,"click");
                    })
                }
                
            } else{
                var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145);
                this.setState({
                    maxShowresultcount:maxresutcount.maxresultCount,orimaxShowresultcount:maxresutcount.maxresultCount
                },()=>{
                    this.handleTableSearch(null,"click");
                })
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultFilterObject = () => {
        return { name: "", isReqPagination: true, startIndex: 0, maxResult: 8, isReqCount: false };
    }
    //export prev object
    exportPrevDetails = (viewtype) => {
        let cviewtype = this.state.sobj;
        cviewtype["prevpage"] = this.state.startpage;
        cviewtype["totalresults"] = this.state.totalresults;
        cviewtype["viewtype"] = viewtype;
        cviewtype["ftablebody"] = this.state.ftablebody;

        cviewtype["maxShowresultcount"] = this.state.maxShowresultcount;
        cviewtype["orimaxShowresultcount"] = this.state.orimaxShowresultcount;

        return cviewtype;
    }
    //reset table filters 
    resetTableFilters = () => {
        this.setState({ sobj: this.defaultFilterObject(), startpage: 1}, () => {
            this.handleTableSearch(null,"click");
        });
    }

    loadTableData = () => {
        var cdata = [];
        if(this.state.toridata && this.state.toridata.length > 0){
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);

            if(cfindList){
                for (var i = 0; i < cfindList.data.length; i++) {
                    const citem = cfindList.data[i];
                    cdata.push({
                        0:citem.id, 
                        1:citem.name,
                        2:(citem.width > 0?roundOffDecimal(citem.width,numOfDecimalsLimit):citem.width),
                        3:(citem.height > 0?roundOffDecimal(citem.height,numOfDecimalsLimit):citem.height),
                        4:this.props.t("uomlist."+citem.uom)
                    });
                }
            }
        }
        this.setState({ ftablebody: cdata });
    }
    //set filter object
    handleFilterObject = (evt,etype,ctype,msg) => {
        var cobj = this.state.sobj;
        if(etype === "name"){
            if(!preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault()
                return
              }
        }
        if(etype !== null){
            cobj[etype] = evt.target.value;
        }

        cobj.startIndex = 0;

        this.setState({sobj:cobj}, () => {
            if(ctype === "click" || (ctype === "enter" && evt.which === 13)){
                this.setState({startpage: 1,toridata:[],totalresults:0}, () => {
                    this.handleTableSearch(null,"click");
                })
            }
        });
    }
    //filter search
    handleTableSearch = (evt,etype) => {
        if(etype === "click" || (etype === "enter" && evt.which === 13)){
            var maxresutcount = this.state.maxShowresultcount;
            let sobj = this.state.sobj;
            sobj.maxResult = maxresutcount;

            this.setState({
                toridata: [],
                isdataloaded: false,
                loading:true,
                sobj: sobj,
            }, () => {
                this.loadTableData();
            });
            
            submitSets(submitCollection.searchFloors, sobj, true).then(res => {
                //console.log(res);
                if(res && res.status){
                    var cdata = this.state.toridata;

                    var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                    if(cpageidx > -1){
                        cdata[cpageidx].data = res.extra;
                    } else{
                        cdata.push({page:(this.state.startpage),data:res.extra});
                    }

                    let sobj = this.state.sobj;

                    this.setState({
                        loading:false,
                        isdataloaded: true,
                        toridata: cdata,
                        totalresults: (this.state.startpage === 1 || sobj.isReqCount?res.count:this.state.totalresults),
                    }, () => {
                        this.loadTableData();

                        sobj.isReqCount = false;
                        this.setState({ sobj: sobj, });
                    });
                } else{
                    this.setState({
                        loading:false,
                        isdataloaded: true,
                        toridata: []
                    }, () => {
                        this.loadTableData();
                    });
                }
            });
        }
    }
    //new unit
    handleNewLink = () => {
        this.props.setFloorView(null);
        this.props.setPrevDetails(this.exportPrevDetails(null));

        this.props.history.push("/floors/details");
    }

    //row click
    handleRowClick = (cidx,citem) => {
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if(cfindList){
            if(citem && citem[0] && citem[0] !== ""){
                let finditem = cfindList.data.find(z => z.id === citem[0]);
                //console.log(finditem);
                if(finditem){
                    this.loadRowDetails(finditem);
                }
            } else{
                this.loadRowDetails(cfindList.data[cidx].id);
            }
        }
    }
    //
    loadRowDetails = (rowobj) => {
        submitSets(submitCollection.findFloorByID, "?flowId="+(rowobj.id), true).then(res => {
            //console.log(res);
            if(res && res.status){
                let floordetails = res.extra;
                floordetails.flowWidth = (floordetails.flowWidth > 0?roundOffDecimal(floordetails.flowWidth,numOfDecimalsLimit):floordetails.flowWidth);
                floordetails.flowHeight = (floordetails.flowHeight > 0?roundOffDecimal(floordetails.flowHeight,numOfDecimalsLimit):floordetails.flowHeight);
                
                this.props.setFloorView(floordetails);
                this.props.setPrevDetails(this.exportPrevDetails(null));

                this.props.history.push("/floors/details");
            } else{
                //
            }
        });
    }
    //page change
    handlePageChange = (cstartpage) => {
        var cfindList = this.state.toridata.find(x => x.page === cstartpage);
        var csobj = this.state.sobj;
        csobj.startIndex = ((cstartpage - 1) * this.state.sobj.maxResult);

        this.setState({ sobj: csobj, startpage: cstartpage, isdataloaded: false }, () => {
            if(cfindList){
                this.setState({ isdataloaded: true });
                this.loadTableData();
            } else{
                this.handleTableSearch(null, "click");
            }
            // this.handleTableSearch(null, "click");
        });
    }

    handleShowingresults=(e, isonblur)=>{

       
        if(isonblur===true){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
        }
        else{
            this.setState({maxShowresultcount: e.target.value})
        }
    }
 
   

    render() {
        const ftableheaders = [
            {text: "", width: "1%"},
            {text: this.props.t('floorname'), width: "55%"}, 
            {text: this.props.t('width'), width: "15%"}, 
            {text: this.props.t('height'), width: "15%"},
            {text: this.props.t('uomeasure'), width: "14%"}
        ];

        return (
            <Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
            <div>
                <Row>
                    <MDSidebarMenu/>
                    <Col xs={12} lg={10}>
                        <Breadcrumb dir="ltr">
                            {this.props.isRTL==="rtl"?<>
                            <Breadcrumb.Item active>{this.props.t('floors')}</Breadcrumb.Item>
                            <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                            </>:<>
                            <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                            <Breadcrumb.Item active>{this.props.t('floors')}</Breadcrumb.Item>
                            </>}
                        </Breadcrumb>
                        <Col className="white-container" ref={this.whitecontainer}>
                            <Col className="custom-filters form-inline">
                                {/* <label className="filter-label">{this.props.t('floorname')}</label> */}
                                <Form.Control placeholder={this.props.t('srchfloor')} value={this.state.sobj.name} onChange={e => this.handleFilterObject(e,"name","change",this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e,"name","enter")} onKeyDown={(e)=>{preventinputToString(e,e.target.value,(this.props.t('Character.search_text')))}} />
                                <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => evt.key === "."? evt.preventDefault(): preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } /></span>
                                <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                                <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                            </Col>
                            <Button size="sm" className="highlight-btn" variant="success" onClick={this.handleNewLink}>{this.props.t('btnnames.addnew')}</Button>
                            {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0?
                                <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}/>
                            :this.state.isdataloaded?<>
                                <AcNoDataView />
                            </>:<></>}
                        </Col>
                    </Col>
                </Row>
                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
            </div>
        </Col>

        )
    }
}

const mapDispatchToProps = dispatch => ({
    setFloorView: (payload) => dispatch(viewSetAction(payload)),
    setPrevDetails: (payload) => dispatch(setFloorPrevDetails(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(Floor)));
