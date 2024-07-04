import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom';

import { Col, Button, Breadcrumb, Form, Row, FormSelect } from 'react-bootstrap'


import MDSidebarMenu from '../../common_layouts/mdsidebarmenu';


import { submitCollection } from '../../../_services/submit.service';
// import { alertService } from '../../../_services/alert.service';
import { FindMaxResult, preventinputToString, preventinputotherthannumbers, usrLevels, usrRoles } from '../../../_services/common.service';
import { AcTable, AcViewModal, AcNoDataView } from '../../UiComponents/AcImports';
import { submitSets } from '../../UiComponents/SubmitSets';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { viewUsersSetAction, setUserPrevDetails } from '../../../actions/users/users_actions';


class Users extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            loading:false,
            regions:[],
            branches:[],
            toridata: [],
            isdataloaded: false,
            ftablebody: [],
            sobj: this.defaultFilterObject(),
            startpage: 1, totalresults: 0,
            sfilterobj: {filterOpt:"",isReqPagination:true,startIndex:0,maxResult:8}, //
           
            oneresultheight:55, maxShowresultcount:0,orimaxShowresultcount:0,//find max result varibles
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.setloadheaders();
        this.loadRegions();
        this.loadBranches();
        if (this._isMounted) {
           
            //this.props.handleSignObj(true);
            if(this.props.userDetails && this.props.userDetails.userPrevPage){
                let prevdetails = this.props.userDetails.userPrevPage;
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
    
                    let pstartpage = (!isresetting?prevdetails.prevpage:1);
                    let ptotalresults = (!isresetting?prevdetails.totalresults:0);
                    let psearchobj = (!isresetting?prevdetails:this.defaultFilterObject());
                    let prvmaxShowresultcount=prevdetails.maxShowresultcount
                    this.setState({ sobj: psearchobj, startpage: pstartpage, totalresults: ptotalresults,maxShowresultcount:prvmaxShowresultcount,orimaxShowresultcount:prevdetails.orimaxShowresultcount }, () => {
                        this.props.setPrevDetails(null);
                        this.handleTableSearch(null,"click");
                    });
                } else{
                    let CprvmaxShowresultcount=prevdetails.maxShowresultcount
                    this.setState({ maxShowresultcount:CprvmaxShowresultcount,orimaxShowresultcount:prevdetails.orimaxShowresultcount }, () => {
                        this.props.setPrevDetails(null);
                        this.handleTableSearch(null,"click");
                    })
                }
                
            } else{
                var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145)
                // var csobj=this.state.sobj
                // var csfilterobj=this.state.sfilterobj
                // csfilterobj.maxResult=maxresutcount.maxresultCount
                // csobj.maxResult=maxresutcount.maxresultCount
    
                this.setState({
                    // sobj:csobj,sfilterobj:csfilterobj,
                    maxShowresultcount:maxresutcount.maxresultCount,orimaxShowresultcount:maxresutcount.maxresultCount},()=>{
                    this.handleTableSearch(null,"click");
                })
                
            }
        }

    }

    componentWillUnmount() {
        this._isMounted = false;
    }
    


    defaultFilterObject = () => {
        return { userName: "", isReqPagination: true, startIndex: 0, maxResult: 10, storeId: "", regionId: "", isReqCount: false };
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
        this.setState({ sobj:this.defaultFilterObject(), startpage: 1}, () => {
            this.handleTableSearch(null,"click");
        });
    }
    setloadheaders=()=>{
        var csobj=this.state.sobj;
        if(this.props.signedDetails.userRolls.userLevel==="Region"){
            csobj["regionId"]=this.props.signedDetails.userRolls.regionId;

        }else 
        if(this.props.signedDetails.userRolls.userLevel==="Store"){
            csobj["regionId"]=this.props.signedDetails.userRolls.regionId;
            csobj["storeId"]=this.props.signedDetails.userRolls.storeId;
        }

        this.setState({sobj:csobj})
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
                        0: citem.userId, 1: citem.firstName + " " + citem.lastName,
                        2: citem.role ? citem.role.name : "-",
                        3: citem.branch ? (citem.role&&citem.role.systemUserRoleType!==usrRoles.RM? citem.branch.name:"-") : "-",
                        4: citem.regions ? citem.regions.name : "-"
                    });
                }
            }
        }
        this.setState({ ftablebody: cdata }, () => {
            this.setState({ isdataloaded: true });
        });
    }

    loadBranches = (regionid) => {
        var reid;
        if(regionid===undefined){
             reid=this.props.signedDetails.userRolls.regionId?this.props.signedDetails.userRolls.regionId:"";
        }else{
            reid=regionid;
        }
       
        submitSets(submitCollection.getUserBranches, "?regionId=" + (reid), true).then(res => {
           if(res.status){
            this.setState({ branches: res.extra });
           }
        });
    }
    loadRegions = () => {
        submitSets(submitCollection.getRegions, { filterOpt: "", isReqPagination: false }, true).then(res => {
            if(res.status){
                this.setState({ regions: res.extra });
            }
        });
    }
    handleBranch = (evt) => {
        var cobj = this.state.sobj;
        cobj["startIndex"] = 0;
        cobj["storeId"] = evt.target.value;
        this.setState({ sobj: cobj }, () => {
            this.handleTableSearch(null, "click");
        })
    }

    handleRegionChange = (evt) => {
        var cobj = this.state.sobj;
        cobj["startIndex"] = 0;
        cobj["regionId"] = evt.target.value;
        cobj["storeId"] = null;
        var regionid = evt.target.value;
        this.setState({ sobj: cobj, startpage: 1 }, () => {
            this.handleTableSearch(null, "click");

            if(evt.target.value && evt.target.value > 0){
                this.loadBranches(regionid);
            } else{
                this.setState({branches:[]});
            }
        });
    }

    //set filter object
    handleFilterObject = (evt, etype, ctype,msg) => {
        var cobj = this.state.sobj;
        if(etype === "userName"){
            if(!preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault()
                return
            }

        }

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
            var maxresutcount=this.state.maxShowresultcount
      
            // maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,65)
            let csfilterobj=this.state.sfilterobj
            csfilterobj.maxResult=maxresutcount
            var csobj=this.state.sobj
            csobj.maxResult=maxresutcount
            this.setState({
                sobj:csobj,
                sfilterobj:csfilterobj,
                toridata: [],
                isdataloaded: false,
                loading:true,
            },()=>{
                // console.log(this.state.sobj);
            });

            submitSets(submitCollection.searchUsers, this.state.sobj, true, null, true).then(res => {
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
    //new unit
    handleNewLink = () => {
        this.props.setUserView(null);
        this.props.setPrevDetails(this.exportPrevDetails(null));

        this.props.history.push("/users/details");
    }

    //row click
    handleRowClick = (cidx,citem) => {
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if(cfindList){
            if(citem && citem[0] && citem[0] !== ""){
                let finditem = cfindList.data.find(z => z.userId === citem[0]);
                //console.log(finditem);
                if(finditem){
                    this.loadRowDetails(finditem);
                }
            } else{
                this.loadRowDetails(cfindList.data[cidx]);
            }
        }
    }
    //
    loadRowDetails = (rowobj) => {
        this.setState({ loading: true }, () => {
            submitSets(submitCollection.findUserByID, "/" + (rowobj.userId), true, null, true).then(res => {
                //console.log(typeof res.extra);
                if (res && res.status && res.extra && typeof res.extra === "object") {
                    var csobj = res.extra;
                    //csobj["hiddenpw"] = (csobj.password ? ("**" + csobj.password.slice(-2)) : "")
                    this.props.setUserView(csobj);
                    this.props.setPrevDetails(this.exportPrevDetails(null));

                    this.props.history.push("/users/details");
                } else {
                    // alertService.error(res&&res.extra?res.extra:"Error occured");
                }

                this.setState({ loading: false });
            });    
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

    handleShowingresults=(e, isonblur)=>{
        if(isonblur===true){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
        }
        else{
            this.setState({maxShowresultcount: e.target.value})
        }
    }

    render() {
        var regionList = (this.state.regions ? Object.keys(this.state.regions).map(x => {
            return <option key={x} value={this.state.regions[x].regionId}>{this.state.regions[x].name}</option>
        }) : <></>);
        var branchList = (this.state.branches ? Object.keys(this.state.branches).map(x => {
            return <option key={x} value={this.state.branches[x].branchId}>{this.state.branches[x].name}</option>
        }) : <></>);
        const ftableheaders = [{text: "", width: "1%"}, this.props.t('USER_NAME'), this.props.t('ROLE'), this.props.t('BRANCH'), this.props.t('region')];

        return (
            <Col xs={12} className={"main-content userspage "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
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
                            <Breadcrumb.Item active>{this.props.t('USERS')}</Breadcrumb.Item>
                        </>}
                        </Breadcrumb>
                        <Col ref={this.whitecontainer} className="white-container pdunit-content">
                            <Col className="custom-filters form-inline">
                                {/* <label className="filter-label">{this.props.t('name')}</label> */}
                                <Form.Control  placeholder={this.props.t('SEARCH_USER')} value={this.state.sobj.userName} onChange={e => this.handleFilterObject(e, "userName", "change",this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e, "userName", "enter")} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.userName,(this.props.t('Character.search_text')))} />
                              
                                {(this.props.signedDetails.userRolls.userLevel === usrLevels.CN) &&
                                    <span>
                                        <label className="filter-label">{this.props.t("region")}</label>
                                        <FormSelect value={this.state.sobj.regionId} onChange={(e) => this.handleRegionChange(e)} style={{width:"124px"}}>
                                            <option value="">{this.props.t("allregions")}</option>
                                            {regionList}

                                        </FormSelect>
                                    </span>
                                }

                                {(this.props.signedDetails.userRolls.userLevel === usrLevels.CN || this.props.signedDetails.userRolls.userLevel === usrLevels.RG) && <span>
                                    <label className="filter-label">{this.props.t("branch")}</label>
                                    <FormSelect value={this.state.sobj.storeId} onChange={(e) => this.handleBranch(e)} style={{width:"135px"}}>
                                        <option value="">{this.props.t("allbranches")}</option>
                                        {branchList}
                                    </FormSelect>
                                </span>}

                                <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) =>  evt.key === "."?evt.preventDefault():preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results')))} /></span>
                                <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e, null, "click")}>{this.props.t('btnnames.search')}</Button>
                                <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                            </Col>
                            <Button className="highlight-btn" variant="success" onClick={this.handleNewLink}>{this.props.t('btnnames.addnew')}</Button>

                            {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0?
                                <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sfilterobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sfilterobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange} />
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
    setUserView: (payload) => dispatch(viewUsersSetAction(payload)),
    setPrevDetails: (payload) => dispatch(setUserPrevDetails(payload)),
});

export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(Users)));