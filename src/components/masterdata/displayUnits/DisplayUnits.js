import React from 'react'
import { Link, withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import { Col, Button,Breadcrumb, Form, Row, FormSelect } from 'react-bootstrap'

import './DisplayUnits.css';

import { AcNoDataView, AcTable, AcViewModal } from '../../UiComponents/AcImports';
import { submitSets } from '../../UiComponents/SubmitSets';
import { FindMaxResult, preventinputToString, preventinputotherthannumbers, uomList } from '../../../_services/common.service';
import { submitCollection } from '../../../_services/submit.service';

import { viewSetAction, viewSetPrevDunit } from '../../../actions/dunit/dunit_action';

import MDSidebarMenu from '../../common_layouts/mdsidebarmenu';

import { withTranslation } from 'react-i18next';

export class DisplayUnits extends React.Component {
    _isMounted = false;

    constructor(props){
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            loading:false,
            isnottesting: true,
            toridata:[], isdataloaded: false,
            ftablebody: [],
            sobj: this.defaultFilterObject(),
            startpage: 1, totalresults: 0,
            oneresultheight: 55, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            if(this.props.dunitState && this.props.dunitState.dunitPrevDetails){
                let prevdetails = this.props.dunitState.dunitPrevDetails;
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
    
                    this.setState({ sobj: psearchobj, startpage: pstartpage, totalresults: ptotalresults, maxShowresultcount:prevdetails.maxShowresultcount, orimaxShowresultcount:prevdetails.orimaxShowresultcount }, () => {
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
        return { fieldName: "", uom: "", isReqPagination:true, startIndex:0, maxResult:8, isReqCount: false };
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
                    cdata.push({0:citem.id, 1:citem.fieldName,2:(citem.shelf.length+" Rows"),3:this.props.t("uomlist."+citem.uom)});
                }
            }

        }
        this.setState({ ftablebody: cdata }, () => {
            this.setState({isdataloaded: true});
        });
    }
    //set filter object
    handleFilterObject = (evt,etype,ctype,msg) => {
        var cobj = this.state.sobj;
        if(etype === "fieldName"){
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
                });
            }
        });
    }
    //filter search
    handleTableSearch = (evt,etype) => {
        if(etype === "click" || (etype === "enter" && evt.which === 13)){
            var maxresutcount = this.state.maxShowresultcount;
            let sobj = this.state.sobj;
            sobj.maxResult = maxresutcount;

            this.setState({ isdataloaded: false,loading:true, sobj:sobj });
            submitSets(submitCollection.searchDisplayUnit, this.state.sobj, true).then(res => {
                //console.log(res);
                var cdata = this.state.toridata;
                if(this._isMounted){
                    if(res && res.status){
                        var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                        if(cpageidx > -1){
                            cdata[cpageidx].data = res.extra;
                        } else{
                            cdata.push({page:(this.state.startpage),data:res.extra});
                        }

                        let sobj = this.state.sobj;

                        this.setState({
                            loading:false,
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
                            toridata: cdata,
                        }, () => {
                            this.loadTableData();
                        });
                    }
                }
            });
        }
    }
    //new unit
    handleNewLink = () => {
        this.props.setDunitView(null);
        this.props.setPrevDetails(this.exportPrevDetails(null));

        this.props.history.push("/displayunits/details");
    }
    //row click
    handleRowClick = (cidx,citem) => {
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if(cfindList){
            if(citem && citem[0] && citem[0] !== ""){
                let finditem = cfindList.data.find(z => z.id === citem[0]);
                
                if(finditem && finditem.shelf && finditem.shelf.length > 0){
                    finditem.shelf = finditem.shelf.sort((a, b) => (a.rank - b.rank));
                }
                // console.log(finditem);

                if(finditem){
                    this.props.setDunitView(finditem);
                    this.props.setPrevDetails(this.exportPrevDetails(null));
                    
                    this.props.history.push("/displayunits/details");
                }
            } else{
                this.props.setDunitView(cfindList.data[cidx]);
                this.props.history.push("/displayunits/details");
            }
        }
    }
    //page change
    handlePageChange = (cstartpage) => {
        var cfindList = this.state.toridata.find(x => x.page === cstartpage);
        var csobj = this.state.sobj;
        csobj.startIndex = ((cstartpage - 1) * this.state.sobj.maxResult);

        this.setState({ sobj: csobj, startpage: cstartpage, isdataloaded: false }, () => {
            if(cfindList){
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
            { text: "" }, 
            { text: this.props.t('type'), width: "60%"}, 
            { text: this.props.t('rows'), width: "20%"}, 
            { text: this.props.t('uomeasure'), width: "19%"}
        ];

        var cvlist = Object.keys(uomList).map(x => {
            return <option key={x} value={x}>{this.props.t("uomlist."+x)}</option>
        });
        return (

            <Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
            <div>
                <Row>
                    <MDSidebarMenu/>
                    <Col xs={12} lg={10}>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                        <Breadcrumb.Item active>{this.props.t('dunits')}</Breadcrumb.Item>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        </>:<>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        <Breadcrumb.Item active>{this.props.t('dunits')}</Breadcrumb.Item>
                        </>}
                    </Breadcrumb>
                    <Col className="white-container" ref={this.whitecontainer} >
                        <Button size="sm" className="highlight-btn" variant="success" onClick={this.handleNewLink}>{this.props.t('btnnames.addnew')}</Button>
                        <Col className="custom-filters form-inline">
                            {/* <label className="filter-label">{this.props.t('dunitname')}</label> */}
                            <Form.Control  placeholder={this.props.t('srchdunit')} value={this.state.sobj.fieldName} onChange={e => this.handleFilterObject(e,"fieldName","change",this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e,"fieldName","enter")} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.fieldName,(this.props.t('Character.search_text')))} />
                            <span><label className="filter-label">{this.props.t('uom')}</label>
                            <FormSelect value={this.state.sobj.uom} onChange={e => this.handleFilterObject(e,"uom","click")}>
                                <option value="">{this.props.t('ALL')}</option>
                                {cvlist}
                            </FormSelect></span>
                            <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                            <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => evt.key === "."?evt.preventDefault(): preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } /></span>
                            <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                            <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                        </Col>
                        {this.state.isdataloaded&&this.state.ftablebody&&this.state.ftablebody.length>0?
                            <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showresults={true} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}/>
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
    setDunitView: (payload) => dispatch(viewSetAction(payload)),
    setPrevDetails: (payload) => dispatch(viewSetPrevDunit(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(DisplayUnits)));
