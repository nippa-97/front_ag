import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import {Breadcrumb, Button, Col, Form, Modal, Row} from 'react-bootstrap';
import Select from 'react-select';
import countryList from "react-select-country-list";
import { confirmAlert } from 'react-confirm-alert';

import {  withTranslation } from "react-i18next";
import "../../../_translations/i18n";

import { submitCollection } from '../../../_services/submit.service';
import { alertService } from '../../../_services/alert.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { AcNoDataView, AcTable, AcViewModal } from '../../UiComponents/AcImports';

import MDSidebarMenu from '../../common_layouts/mdsidebarmenu';

import './regions.scss';
import { FindMaxResult, preventinputToString, preventinputotherthannumbers } from '../../../_services/common.service';

/* var codeRegex = /^[a-zA-Z]/;
var nameRegex = /^[a-zA-Z]/; */

class RegionsComponent extends React.Component{
    _isMounted = false;
    constructor(props){
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            loading:false,
            country:"", countryError:"",code:"",codeError:"",name:"",nameError:"",areamanager:"",areamanagerError:"",
            countryList:[], // load country list
            value: '',
            headers: ["Country", "Code", "Name", " "],
            filteredItems:[],
            filterText:'',
            regionData:[],
            RegionUsers:[],
            Areamanager : [],
            errors :'',

            resetPaginationToggle: false,                         //pagination
            sobj:this.defaultObjectLoad(),
            srobj: { country:"", code:"", name:"",regionId:"",regionManagerId:""},
            showregionsmodal: false,
            vobj: {}, isedit: false, //modal details
            isFilter:false, data:'', //print report

            toridata:[], isdataloaded: false,
            ftablebody: [],
            sfilterobj: this.defaultFilterObject(), //
            startpage: 1, totalresults: 0,
            oneresultheight:55, maxShowresultcount:0,orimaxShowresultcount:0,//find max result varibles
            isUpdated: false,
        }

    };

    componentDidMount(){
      this._isMounted = true;

      if(this._isMounted){
        var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145);
        this.setState({
            maxShowresultcount:maxresutcount.maxresultCount,orimaxShowresultcount:maxresutcount.maxresultCount},()=>{
                this.getCountries();
                this.loadRegionUsers();
                //filter search
                this.handleTableSearch(null,"click");
            })
        
      }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    // start validation
    validateInput = (input,issetname,nametxt) => {
        let errors = {};
        let validationType = (issetname?nametxt:input.getAttribute("data-validation-type"));
        //console.log("input validation attr:", input.getAttribute("data-validation-type"), "input.value:", input.value);

        let errorName = (issetname?nametxt:input.name) + "Error";
        errors[errorName] = "";
        if (!issetname && (input.value === "" || input.value.length === 0)) {
            errors[errorName] = this.props.t("fieldisrequired");
        } else if (validationType === "name") {
            if (!input.value) {
                errors[errorName] = this.props.t("entervalidaname");
            } else if(input.value.length < 3){
                errors[errorName] = this.props.t("entervalidname_length");
            }
        } else if (validationType === "code") {
            if (!input.value) {
                errors[errorName] = this.props.t("entervalidcode");
            } else if(input.value.length < 3){
                errors[errorName] = this.props.t("entervalidcode_length");
            }
        }
        return errors;
    }

    // handle chnage
    handleChange=(e,type,msg)=>{
      var cobj=this.state.sobj;
      if(!preventinputToString(e,e.target.value,msg)){
        e.preventDefault()
        return
      }
      cobj[type]=(e.target.value);
      this.setState({sobj:cobj, isUpdated: true})
    }

    //on blur
    onBlur = (e,issetname,nametxt) => {
      let input = e.target;
      let csaveobj = this.state.sobj;
      csaveobj[(issetname?nametxt:input.name)] = input.value;

      if (!input.contains(document.activeElement)) {
          let errors = this.validateInput(input,issetname,nametxt); // run validation against this input, and return error object
        //   console.log(errors);
          this.setState({ ...this.state, ...errors }); // update state with returned errors
      }
    }

    defaultObjectLoad = () => {
        return { filterOpt: "", uuid:"", regionId: -1, country:"",code:"",name:"",regionManagerId: "" , isNew: true, isDelete: false , startIndex: 0,
        maxResult: 8};
    }

    defaultFilterObject = () => {
        return { filterOpt:"", isReqPagination:true, startIndex:0, maxResult:8, isReqCount: false };
    }

    //reset table filters 
    resetTableFilters = () => {
        this.setState({ sfilterobj:this.defaultFilterObject(), startpage: 1}, () => {
            this.handleTableSearch(null,"click");
        });
    }
    // new unit
    handleNewLink = () => {
        this.setState({isedit:false, sobj:this.defaultObjectLoad() },()=>{
          //console.log(this.state.sobj);
          this.handleModalToggle();
        });
    }

    //row click
    onRowClicked = (cidx,citem) => {
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if(cfindList){
            if(citem && citem[0] && citem[0] !== ""){
                let finditem = cfindList.data.find(z => z.regionId === citem[0]);
                //console.log(finditem);
                if(finditem){
                    this.setState({sobj:finditem,isedit:true, isUpdated: false},() => {
                        this.handleModalToggle();
                    });
                }
            } else{
                this.setState({sobj:cfindList.data[cidx],isedit:true, isUpdated: false},() => {
                    this.handleModalToggle();
                });
            }
        }
    }

    // area mnager handle and selector
    loadRegionUsers=()=> {
        var sobj = {query: this.state.Areamanager, isReqPagination:false};
        submitSets(submitCollection.getRegionUsers, sobj,false).then(res=>{
            if(res && res.status){
                var cregdata = (res.extra && res.extra.length?res.extra.map(item => {
                return {value: item.userId, label: (item.userFirstName+" "+item.userLastName) };
                }):[]);
                this.setState({RegionUsers: cregdata});
        }   else{
                this.setState({RegionUsers: []});
            }
        })
    }
    
    //set filter object
    handleFilterObject = (evt,etype,ctype,msg) => {
        var cobj = this.state.sfilterobj;

        if(etype === "filterOpt"){
            if(evt && !preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault();
                return
            }
        }
        if(etype !== null){
            cobj[etype] = evt.target.value;
        }
        cobj.startIndex = 0;

        this.setState({sfilterobj:cobj}, () => {
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
        var maxresutcount=this.state.maxShowresultcount
        let csfilterobj=this.state.sfilterobj
        csfilterobj.maxResult=maxresutcount
        var csobj=this.state.sobj
        csobj.maxResult=maxresutcount
          this.setState({ 
            isdataloaded: false,loading:true, sfilterobj:csfilterobj,
            cobj:csobj, });
          submitSets(submitCollection.getRegions, this.state.sfilterobj, true).then(res => {
              //console.log(res);
              var cdata = [];
              //reset isreqcount
                var csobj = this.state.sobj;
                csobj.isReqCount = false;
                this.setState({ sobj: csobj });
              if(res && res.status){
                var cfindList = cdata.findIndex(x => x.page === this.state.startpage);
                if(cfindList > -1){
                    cdata[cfindList].data = res.extra;
                } else{
                    cdata.push({page:(this.state.startpage),data:res.extra});
                }
                
                this.setState({
                    toridata: cdata,
                    totalresults: ((this.state.startpage === 1|| this.state.sfilterobj.isReqCount)?res.count:this.state.totalresults),
                    loading:false,
                }, () => {
                    
                    this.loadTableData();
                });
              } else{
                  this.setState({
                      toridata: cdata,
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
        if(this.state.toridata && this.state.toridata.length > 0){
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
            if(cfindList){
                for (var i = 0; i < cfindList.data.length; i++) {
                    const citem = cfindList.data[i];
                    cdata.push({0:citem.regionId, 1:citem.country,2:citem.code,3:citem.name});
                }
            }
        }
        this.setState({ ftablebody: cdata }, () => {
            this.setState({ isdataloaded: true });
        });
    }

    //area manager handler
    changeAreaManagerHandler = ctxt =>{
        var oldid = this.state.sobj.regionManagerId;
        var srmobj = JSON.parse(JSON.stringify(this.state.sobj));

        if(ctxt.value > 0){
            srmobj["regionManagerId"] = ctxt.value;
            this.setState({ sobj : srmobj, isUpdated: true});
    
            confirmAlert({
              title: this.props.t('CONFIRM_TO_CHANGE_REFIONAL_MANAGER'),
              message: this.props.t("CHANGE_REGIONAL_MANAGER_MESSAGE"),
              overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
              buttons: [{
                  label: this.props.t("btnnames.yes")
              }, {
                  label: this.props.t("btnnames.no"),
                  onClick: () => {
                    srmobj["regionManagerId"] = (oldid?oldid:-1);
                    this.setState({ sobj : srmobj });                               
                  }
              }]
            }); 
          } else{
            srmobj["regionManagerId"] = ctxt.value;
            this.setState({ sobj : srmobj,  isUpdated: true });
          }
        //this.checkRegionUser(ctxt.value);
    }
    //
    checkRegionUser = (evt) => {
        if (evt > 0) {
            submitSets(submitCollection.findUserByID, "/" + (evt), false).then(res => {
                console.log(res);
                if (res && res.status && res.extra && typeof res.extra !== "string") {
                    //var csobj = res.extra;
                }
            });
        }
    }

    // country handler & country selector
    getCountries = () =>{
        var countries = countryList().getData();
        this.setState({ countryList : countries });
    }

    changeCountryHandler = ctxt => {
        var srobj = this.state.sobj;
        srobj["country"] = ctxt.label;
        this.setState({ sobj : srobj, isUpdated: true });
    }

    //save/edit handle
    handleRegionSave = (resp,type) => {
      var csaveobj = this.state.sobj;

         /* else if(!csaveobj.regionManagerId || csaveobj.regionManagerId === -1){
          alertService.error("Region manager is required");
      } */

          if(!csaveobj.country || csaveobj.country === ""){
            alertService.error(this.props.t("country_required"));
          } else if(!csaveobj.code || csaveobj.code === ""){
            alertService.error(this.props.t("code_required"));
          } else if(csaveobj.code.length < 3){
            alertService.error(this.props.t("entervalidcode_length"));
          } else if(!csaveobj.name || csaveobj.name === ""){
            alertService.error(this.props.t("namerequired"));
          } else if(csaveobj.name.length < 3){
            alertService.error(this.props.t("entervalidname_length"));
          } else{
                if(this.state.isUpdated){
                    //console.log(csaveobj);
                    var savepath = submitCollection.saveRegions;
                    var csobj = this.state.sobj;
                    if(this.state.isedit){
                        csobj["isNew"] = false;
                        savepath = submitCollection.updateRegions;
                    }else{
                        var csfilterobj=this.state.sfilterobj
                        csfilterobj.isReqCount=true
                        this.setState({sfilterobj:csfilterobj})
                    }
            
                    submitSets(savepath, csobj, false).then(res => {
                        //console.log(res);
                        if(res && res.status){
                            alertService.success(this.state.isedit?this.props.t("SUCCESSFULLY_REGIONAL_DATA_UPDATED"):this.props.t("SUCCESSFULLY_REGIONAL_DATA_SAVED"));
                            this.handleTableSearch(null, "click");
                            this.setState({isUpdated: false})
                            this.handleModalToggle();
                        } else{
                            // alertService.error(res&&res.extra&&res.extra!==""?res.extra:"Error occurred on "+(this.state.isedit?"update":"save")+" proces");
                            if(res && !res.status && res.validation){

                                let codeMessage = res.validation.code;

                                if(res.validation.msgParams && res.validation.msgParams.length > 0){
                                    let filledMsg = codeMessage.replace(/\[\$\]/g, () => res.validation.msgParams.shift());
                                    res.validation.type === "error" ? alertService.error(this.props.t(filledMsg)) : alertService.warn(this.props.t(filledMsg));
                                }else{
                                    res.validation.type === "error" ? alertService.error(this.props.t(codeMessage)) : alertService.warn(this.props.t(codeMessage));
                                }

                            } else{
                                alertService.error(this.props.t('ERROR_OCCURRED_IN')+(this.state.isedit ?"update":"save")+" process");
                            }
                        }
                    });

                }else{
                    alertService.warn(this.props.t('NO_CHANGES_AVAILABLE'));
                }
            }

     }

    //delete region
    handleRegionDelete= ()=>{
        confirmAlert({
            title: this.props.t("Confirm_to_delete_a_region"),
            message: this.props.t("ARE_YOU_SURE_TO_DELETE_THIS_REGION"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t("btnnames.yes"),
                onClick: () => {
                    var deleteObj= this.state.sobj
                    deleteObj.isDelete=true
                    deleteObj.isNew=false
                    submitSets(submitCollection.deleteRegions,deleteObj, true, null, true ).then(res =>{
                        if(res && res.status){
                            alertService.success(this.props.t("SUCCESSFULLY_REGIONAL_DATA_DELETED"));

                             //pagination set in delete
                            let searchobj=this.state.sfilterobj;
                            const stindx=searchobj.startIndex;
                            const maxresult=searchobj.maxResult
                            if(this.state.ftablebody.length===1){
                                searchobj.startIndex=(stindx-maxresult);
                                searchobj.isReqCount=true;
                                this.setState({sfilterobj:searchobj,startpage:(this.state.startpage-1)},()=>{
                                this.handleTableSearch(null, "click");
                                })
                            }
                            else{
                                this.handleTableSearch(null, "click");
                            }
                            
                            this.handleModalToggle();
                        } else{
                            // alertService.error(res&&res.extra&&res.extra!==""?res.extra:"Error occurred in delete proces");
                        }
                    });                              
                }
            }, {
                label: this.props.t("btnnames.no")
            }]
        });
      }

      handleModalToggle = () => {
        this.setState({showregionsmodal: !this.state.showregionsmodal});
      }

      //page change
      handlePageChange = (cstartpage) => {
          var cfindList = this.state.toridata.find(x => x.page === cstartpage);
          var csobj = this.state.sfilterobj;
          csobj.isReqCount = (this.state.totalPages === cstartpage?true:false);
          csobj.startIndex = ((cstartpage - 1) * this.state.sfilterobj.maxResult);

          this.setState({ sfilterobj: csobj, startpage: cstartpage, isdataloaded: false }, () => {
              if(cfindList){
                  this.loadTableData();
              } else{
                  this.handleTableSearch(null, "click");
              }
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

      render(){
        const ftableheaders = [ {text: "", width: "1%"},this.props.t('country'),this.props.t('code'),this.props.t('name')];

        return (<>
            <Col xs={12} className={"main-content compmain-content mdatacontent-main mrformcontent-main rg-mdview "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <div>
                    <Row>
                        <MDSidebarMenu />
                        <Col xs={12} lg={10}>
                            <Breadcrumb dir="ltr">
                            {this.props.isRTL==="rtl"?<>
                                <Breadcrumb.Item active>{this.props.t('regions')}</Breadcrumb.Item>
                                <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                                </>:<>
                                    <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                                    <Breadcrumb.Item active>{this.props.t('regions')}</Breadcrumb.Item>
                                </>}
                            </Breadcrumb>
                            <Col className="white-container pdunit-content" ref={this.whitecontainer}>
                                <Col xs={12} lg={8} className="col-centered" >
                                    <Button type="submit" className="highlight-btn" onClick={this.handleNewLink} variant="success">{this.props.t('btnnames.addnew')}</Button>
                                    <Col className="custom-filters form-inline">
                                        <Form.Control placeholder={this.props.t('btnnames.search')} value={this.state.sfilterobj.filterOpt} onChange={e => this.handleFilterObject(e,"filterOpt","change",this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e,"filterOpt","enter")} onKeyDown={(e)=>preventinputToString(e,this.state.sfilterobj.filterOpt,(this.props.t('Character.search_text')))}/>
                                        <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                        <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => evt.key === "." ? evt.preventDefault(): preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } /></span>
                                        <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                                        <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                                    </Col>
                                    {/* <Button type="submit" className="highlight-btn" onClick={this.handleNewLink} variant="success">{this.props.t('btnnames.addnew')}</Button> */}

                                    {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0?
                                        <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sfilterobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sfilterobj.maxResult} handleRowClick={this.onRowClicked} handlePageChange={this.handlePageChange}/>
                                    :this.state.isdataloaded?<>
                                        <AcNoDataView />
                                      </>:<></>}
                                </Col>
                            </Col>    
                        </Col>
                    </Row>
                    <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
                </div>

                <Modal show={this.state.showregionsmodal} backdrop="static" keyboard={false} onHide={this.handleModalToggle} className={"regionmodal-view "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>

                  <Modal.Header>
                  {(this.state.isedit)?(<>
                    <Modal.Title><b> {this.props.t('editregion')}</b></Modal.Title>
                  </>):(<>
                    <Modal.Title> <b> {this.props.t('addnewregion')}</b></Modal.Title>
                  </> )}
                  </Modal.Header>

                  <Modal.Body>
                      <Col className="formcontrol-main"><>
                          <Col xs={12} className="rform-subcontent">
                          <Form.Group method="post"  name="regionssubmitmodal">

                              <label className="form-label"> {this.props.t('country')} <span style={{ color: "red" }}>*</span></label><br />
                              <Select  id="selectcountry" name="country"  placeholder={this.props.t('selectcountry')} rules={{ required: 'Please select an option'}} options={this.state.countryList} type="text" onChange={this.changeCountryHandler}  value ={this.state.countryList.filter(option => option.label === this.state.sobj.country)} className="filter-searchselect" classNamePrefix="searchselect-inner" data-validation-type="country" required />
                              <span className="text-danger">
                                {this.state.errors.reactSelect && this.state.errors.reactSelect.type === 'required' && "Please select"}
                              </span>
                              <div className="errorMsg">{this.state.countryError}</div>

                              <label className="form-label">{this.props.t('code')} <span style={{ color: "red" }}>*</span></label><br />
                              <input   className="form-control form-control-sm" type="text"  onChange={(e)=>this.handleChange(e,"code",this.props.t('Character.code'))} onBlur={(e) => this.onBlur(e,false)}  name="code" placeholder={this.props.t('addcode')} data-validation-type="code" required value={this.state.sobj.code} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.code,(this.props.t('Character.code')))} /><br />
                              <div className="errorMsg">{this.state.codeError}</div>

                              <label className="form-label"> {this.props.t('name')} <span style={{ color: "red" }}>*</span></label><br />
                              <input  className="form-control form-control-sm" type="text" name="name"  onChange={(e)=>this.handleChange(e,"name",this.props.t('Character.name'))} onBlur={(e) => this.onBlur(e,false)}  placeholder={this.props.t('addname')} data-validation-type="name" required value={this.state.sobj.name} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.name,(this.props.t('Character.name')))}/><br />
                              <div className="errorMsg">{this.state.nameError}</div>

                              <label className="form-label" id="areamanagerdropdown"> {this.props.t('regionmanager')} </label><br />
                              <Select id="areamanager_id" name="regionManagerId"  placeholder={this.props.t('selectarea')} options={this.state.RegionUsers} type="text" onChange={(e)=>this.changeAreaManagerHandler(e)}  value ={this.state.RegionUsers.filter(option => option.value === this.state.sobj.regionManagerId)} className="filter-searchselect" classNamePrefix="searchselect-inner" data-validation-type="regionManagerId" required />
                              <br />
                              <div className="errorMsg" >{this.state.areamanagerError}</div>

                           </Form.Group>
                          </Col>
                      </></Col>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" className={"bbackbutton"+(this.props.isRTL === "rtl"?" float-left":" float-right")} onClick={this.handleModalToggle} size="sm" type="button">{this.props.t('btnnames.close')}</Button>
                    {(this.state.isedit)?(<>
                        <Button variant="sucess" className={"formview-btn btn btn-success"+(this.props.isRTL === "rtl"?" float-left":" float-right")} size="sm" type="button" onClick={e=>this.handleRegionSave(e,2)} > {this.props.t('btnnames.update')} </Button>
                        <Button variant="danger" className={"formview-btn btn btn-danger"+(this.props.isRTL === "rtl"?" float-left":" float-right")} size="sm" type="button" onClick={this.handleRegionDelete}  >{this.props.t('btnnames.delete')} </Button>
                    </>):(<>
                       <Button  variant="sucess" className={"formview-btn btn btn-success"+(this.props.isRTL === "rtl"?" float-left":" float-right")} size="sm" type="button" onClick={e=>this.handleRegionSave(e,1)} >{this.props.t('btnnames.save')}</Button>
                    </> )}
                </Modal.Footer>
            </Modal>
          </Col>
      </>);
   }
 }

export default withTranslation()(withRouter(RegionsComponent));
