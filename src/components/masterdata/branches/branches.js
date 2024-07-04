import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { Breadcrumb, Button, Col, Form, Modal, Row, Badge } from 'react-bootstrap';
import Select from 'react-select';
import { confirmAlert } from 'react-confirm-alert';
import { XIcon } from '@primer/octicons-react';

import { withTranslation } from "react-i18next";
import "../../../_translations/i18n";

import { submitSets } from '../../UiComponents/SubmitSets';
import { emailvalidator } from '../../UiComponents/ValidateSets';
import { alertService } from '../../../_services/alert.service';
import { submitCollection } from '../../../_services/submit.service';

import { AcNoDataView, AcTable, AcViewModal } from '../../UiComponents/AcImports';

import MDSidebarMenu from '../../common_layouts/mdsidebarmenu';

import './branches.scss';
import { FindMaxResult,countTextCharacter,stringtrim,preventinputotherthannumbers, preventinputToString, preventinputophone, maxInputLengthforEmail, preventinputToEmail,} from '../../../_services/common.service';
import { TooltipWrapper } from '../../newMasterPlanogram/AddMethods';
import * as isoCountries from 'i18n-iso-countries';
import { isValidPhoneNumber ,AsYouType} from 'libphonenumber-js';
isoCountries.registerLocale(require("i18n-iso-countries/langs/he.json"));
isoCountries.registerLocale(require("i18n-iso-countries/langs/en.json"));

class BranchesComponent extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.whitecontainer=React.createRef();
    this.state = {
      loading: false,
      area: "", areaError: "", code: "", codeError: "", name: "", nameError: "", address: "", addressError: "", city: "", cityError: "", location: "", locationError: "", telephone: "", telephoneError: "",
      removeQuantity: "", removeQuantityError: "", suggestProductViewLevel: "", suggestProductViewLevelError: "", salesImportBranchCode: "", salesImportBranchCodeError: "",
      email: "", emailError: "", branchmanager: "", branchmanagerError: "",
      fields: {}, //validation
      errors: {},//validation
      btableheaders: ["Code", "Name", "Region", "Location", "Telephone", ""],
      branchData: [],
      Areas: [],
      BranchAreas: [],
      BranchUsers: [],
      Branchmanager: [],
      btablebody: [],
      srobj: { regionName: "", branchId: -1, regionId: "", code: "", name: "", address: "", city: "", tel: "", email: "", branchManagerUserId: "", location: "", productRemovingQtyLimit: 0, suggestProductViewLevel: 0, salesImportBranchCode: "",countryCode:"AF"},
      sobj: this.defaultObjectLoad(),
      showbranchesmodal: false,
      isedit: false, //modal details
      filteredItems: [], filterText: '', // filter
      data: '', //print

      toridata: [], isdataloaded: false,
      ftablebody: [],
      sfilterobj: this.defaultFilterObject(), //
      startpage: 1, totalresults: 0,

      storetagslist:[],
      tagmodalshow:false,
      addedTags:[],
      tagObj:this.defaultTag(),
      countryCodes:[],
      oneresultheight:55, maxShowresultcount:0,orimaxShowresultcount:0,//find max result varibles
      isUpdated: false
    }

  };

  componentDidMount() {
    this._isMounted = true;

    if (this._isMounted) {
      var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145);
      this.setState({
          maxShowresultcount:maxresutcount.maxresultCount,orimaxShowresultcount:maxresutcount.maxresultCount},()=>{
            this.loadBranchUsers();
            this.loadArea();
            this.loadStoreTags();
            //filter search
            this.handleTableSearch(null, "click"); //load all region data
          })
          const countries = isoCountries.getAlpha2Codes();
      let tempobj = [];
      for (const key in countries) {
          tempobj.push({'key':key,'value':countries[key]})
      }
      this.setState({
          countryCodes:tempobj
      })
      
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  // validation
  validateInput = (input, issetname, nametxt) => {

    // console.log(!isValidPhoneNumber(input.value, this.state.sobj.countryCode));
    let errors = this.state.errors;
    let validationType = (issetname ? nametxt : input.getAttribute("data-validation-type"));
    //console.log("input validation attr:"+ validationType);
    let errorName = (issetname ? nametxt : input.name) + "Error";
    errors[errorName] = "";
    if (!issetname && (input.value === "" || input.value.length === 0)) {
      errors[errorName] = this.props.t("fieldisrequired");
    } else if (validationType === "code") {
      if (!input.value || input.value.length <= 0) {
        errors[errorName] = this.props.t("entervalidacode");
      }
    } else if (validationType === "name") {
      if (!input.value || input.value.length <= 0) {
        errors[errorName] = this.props.t("entervalidaname");
      }
    } else if (validationType === "address") {
      if (!input.value || input.value.length <= 0) {
        errors[errorName] = this.props.t("entervalidaddress");
      }
    } else if (validationType === "location") {
      if (!input.value || input.value.length <= 0) {
        errors[errorName] = this.props.t("entervalidlocation");
      }
    } else if (validationType === "city") {
      if (!input.value || input.value.length <= 0) {
        errors[errorName] = this.props.t("entervalidcity");
      }
    } else if (validationType === "telephone") {
      if (!input.value || input.value.length <= 0) {
        errors[errorName] = this.props.t('phonerequired');
      }else{
        if(!isValidPhoneNumber(input.value, this.state.sobj.countryCode)){
          errors[errorName] = this.props.t("entervalidtelephone")
        }
      }
    } else if (validationType === "suggestProductViewLevel") {
      if (!input.value || input.value.length <= 0) {
        errors[errorName] = this.props.t("entervalidprodlevel");
      }
    } else if (validationType === "salesImportBranchCode") {
      if (!input.value || input.value.length <= 0) {
        errors[errorName] = this.props.t("entervalidbranchcode");
      }
    } else if (validationType === "productRemovingQtyLimit") {
      if (!input.value || input.value.length <= 0) {
        errors[errorName] = this.props.t("entervalidquantity");
      }
    } else if (validationType === "email") {
      if (!input.value || input.value.length <= 0 || !emailvalidator(input.value)) {
        errors[errorName] = this.props.t("entervalidemail");
      }
    }
    return errors;
  }

  // modal form handle change
  handleChange = e => {
    let input = e.target;
    
    this.setState({ ...this.state, [input.name]: input.value,isUpdated: true  });
    let errors = this.validateInput(input, false);
    this.setState({ ...this.state, [input.name]: input.value, errors: errors, isUpdated: true });
  };
  //on blur
  onBlur = (e, issetname, nametxt) => {
    let input = e.target;
    this.setState({ ...this.state, [(issetname ? nametxt : input.name)]: input.value });
    if (!input.contains(document.activeElement)) {
      let errors = this.validateInput(input, issetname, nametxt); // run validation against this input, and return error object
      this.setState({ errors: errors }); // update state with returned errors
    }
  };

  defaultObjectLoad = () => {
    return {
      filterOpt: "", branchId: -1, regionId: "", regionName: "", code: "", name: "", address: "", city: "", tel: "", email: "",
      branchManagerUserId: "", location: "", productRemovingQtyLimit: 0, suggestProductViewLevel: 0,
      salesImportBranchCode: "", isNew: true, isDelete: false, startIndex: 0, maxResult: 8, countryCode:this.props.countryCode?this.props.countryCode:"AF"
    };
  }

  defaultFilterObject = () => {
    return { filterOpt: "", isReqPagination: true, startIndex: 0, maxResult: 8, isReqCount: false  };
  }
  //reset table filters 
  resetTableFilters = () => {
    this.setState({ sfilterobj: this.defaultFilterObject(), startpage: 1}, () => {
      this.handleTableSearch(null, "click");
    });
  }
  // handle chnage
  handleChange = (e, type, msg) => {
    if(type === "email"){
      const inputValue = e.target.value;
      let length = countTextCharacter(e.target.value);
      const atSymbolCount = (inputValue.match(/@/g) || []).length;
      if(length > maxInputLengthforEmail ){
        alertService.error(this.props.t('Character.email'))
        e.preventDefault()
        return
      }
      if(atSymbolCount > 1){
        e.preventDefault()
        return
      }
    }

    if((type === "code" || type === "name" || type === "address" || type === "city" || type === "location" || type === "salesImportBranchCode" || type === 'tel')){
      if(!preventinputToString(e,e.target.value,msg)){
        e.preventDefault()
        return
      }
    }
    var cobj = this.state.sobj;
    if(type === 'tel'){
      cobj[type] = new AsYouType(this.state.sobj.countryCode).input(e.target.value);
    }else{
      cobj[type] = (e.target.value);
    }
    this.setState({ sobj: cobj ,isUpdated: true })
    
  }
  // hande product view quantity
  changeProductViewQuantityHandler = (e) => {
    var cobj = this.state.sobj;
    if(!preventinputotherthannumbers(e,e.target.value,this.props.t('Character.suggestprodviewlevel'))){
      e.preventDefault()
      return
    }
    cobj["suggestProductViewLevel"] = (e.target.value) !== ""?e.target.value:"";
    this.setState({ sobj: cobj, isUpdated: true });
  }
  // hande product removing quantity
  changeProductRemoveQuantityHandler = (e) => {
    var cobj = this.state.sobj;
    if(!preventinputotherthannumbers(e,e.target.value,this.props.t('Character.removeQuantity'))){
      e.preventDefault()
      return
    }
    cobj["productRemovingQtyLimit"] = (e.target.value) !== ""?e.target.value:"";
    this.setState({ sobj: cobj, isUpdated: true });
  }

  // add new
  handleNewLink = () => {
    this.setState({ isedit: false, sobj: this.defaultObjectLoad(), addedTags:[], errors: {} }, () => {
      //console.log(this.state.sobj);
      this.handleModalToggle();
    });
  }

  //save/edit  handle
  handleBranchSave = (resp, type) => {
    /* else if(!csaveobj.branchManagerUserId || csaveobj.branchManagerUserId === ""){
      alertService.error("Branch manager is required");
  } */
    if(type === 2){
      if(!this.state.isUpdated){
        alertService.warn(this.props.t('NO_CHANGES_AVAILABLE'));
        return false;
      }
    }


    var csaveobj = this.state.sobj;
    if (!csaveobj.regionId || csaveobj.regionId === "") {
      alertService.error(this.props.t('validation.area'));
    } else if (!csaveobj.code || csaveobj.code === "") {
      alertService.error(this.props.t('validation.code'));
    } else if (!csaveobj.name || csaveobj.name === "") {
      alertService.error(this.props.t('validation.name'));
    } else if (!csaveobj.address || csaveobj.address === "") {
      alertService.error(this.props.t('validation.address'));
    } else if (!csaveobj.location || csaveobj.location === "") {
      alertService.error(this.props.t('validation.location'));
    } else if (!csaveobj.city || csaveobj.city === "") {
      alertService.error(this.props.t('validation.city'));
    } else if (!csaveobj.tel || csaveobj.tel === "") {
      alertService.error(this.props.t('phonerequired'));
    } else if(!isValidPhoneNumber(csaveobj.tel, csaveobj.countryCode)){
      alertService.error(this.props.t('entervalidtelephone'));
    } else if (!csaveobj.email || csaveobj.email === "") {
      alertService.error(this.props.t('emailrequired'));
    } else if(!emailvalidator(csaveobj.email)){
      alertService.error(this.props.t('entervalidemail'));
    } else if (!csaveobj.suggestProductViewLevel || csaveobj.suggestProductViewLevel === 0) {
      alertService.error(this.props.t('validation.Product_view_level'));
    } else if (!csaveobj.salesImportBranchCode || csaveobj.salesImportBranchCode === "") {
      alertService.error(this.props.t('validation.Sales_import_branch'));
    } else if (!csaveobj.productRemovingQtyLimit || csaveobj.productRemovingQtyLimit === 0) {
      alertService.error(this.props.t('validation.Product_remove_quantity'));
    } else {

      var savepath = submitCollection.saveBranches;
      var csobj = this.state.sobj;
      if (this.state.isedit) {
        csobj["isNew"] = false;
        csobj["isDelete"] = false;

        savepath = submitCollection.updateBranches;
      }else{
        var csfilterobj=this.state.sfilterobj
        csfilterobj.isReqCount=true
        this.setState({sfilterobj:csfilterobj})
      }

      submitSets(savepath, csobj, false).then(res => {
        // console.log(res);
        if (res && res.status) {
          alertService.success(this.props.t("SUCCESSFULLY_BRANCH_DATA") + (this.state.isedit ? this.props.t("updated") : this.props.t("saved")));

          //save , update tags
          if(this.state.isedit===true){
            this.saveTagsForBranch(csaveobj.branchId);
          }
          else{
            if(res.extra.storeId){
              this.saveTagsForBranch(res.extra.storeId);
            }
          }
          this.setState({isUpdated: false});

          this.handleTableSearch(null, "click");
          this.handleModalToggle();
        } else {
          // alertService.error(res && res.extra && res.extra !== "" ? res.extra : "Error occurred on " + (this.state.isedit ? "update" : "save") + " proces");

          if(res && !res.status && res.validation){

            let codeMessage = res.validation.code;

            if(res.validation.msgParams && res.validation.msgParams.length > 0){
                let filledMsg = codeMessage.replace(/\[\$\]/g, () => res.validation.msgParams.shift());
                res.validation.type === "error" ? alertService.error(this.props.t(filledMsg)) : alertService.warn(this.props.t(filledMsg));
            }else{
                res.validation.type === "error" ? alertService.error(this.props.t(codeMessage)) : alertService.warn(this.props.t(codeMessage));
            }

          }else{
            alertService.error(res && res.extra && res.extra !== "" ? res.extra : this.props.t("ERROR_OCCORED_ON") + (this.state.isedit ? this.props.t("btnnames.update") : this.props.t("btnnames.save")) + this.props.t("_process"));
          }
        }
      });
    }
  }

  // get branch manager
  loadArea = () => {
    var sobj = { query: this.state.Areas, isReqPagination: false };
    submitSets(submitCollection.getRegionChainBranches, sobj, false).then(res => {
      if (res && res.status) {
        var cbrandata = (res.extra && res.extra.length ? res.extra.map(item => {
          return { value: item.regionId, label: item.name };
        }) : []);
        this.setState({ BranchAreas: cbrandata });
      } else {
        this.setState({ BranchAreas: [] });
      }
    });
  }


  //area  handler
  changeAreaHandler = ctxt => {
    var srmobj = this.state.sobj;
    srmobj["regionId"] = ctxt.value;
    srmobj["regionName"] = ctxt.label;
    //console.log(ctxt,srmobj);
    this.setState({ sobj: srmobj, isUpdated: true });
  }

  loadBranchUsers = () => {
    var sobj = { query: this.state.Branchmanager, isReqPagination: false };
    submitSets(submitCollection.getBranchUsers, sobj, false).then(res => {
      //console.log(res);
      if (res && res.status) {
        var cbrandata = (res.extra && res.extra.length ? res.extra.map(item => {
          return { value: item.userId, label: (item.userFirstName + " " + item.userLastName) };
        }) : []);
        this.setState({ BranchUsers: cbrandata });
      } else {
        this.setState({ BranchUsers: [] });
      }
    })
  }

  //branch manager handler
  changeBranchManagerHandler = ctxt => {
    var oldid = this.state.sobj.branchManagerUserId;
    var srmobj = JSON.parse(JSON.stringify(this.state.sobj));

    if (ctxt.value > 0) {
      srmobj["branchManagerUserId"] = ctxt.value;
      this.setState({ sobj: srmobj, isUpdated: true });

      confirmAlert({
        title: this.props.t("CONFIRM_TO_CHANGE_BRANCH_MANAGER"),
        message: this.props.t("CONFIRM_TO_CHANGE_BRANCH_MANAGER_DETAILS"),
        overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
        buttons: [{
          label: this.props.t('btnnames.yes')
        }, {
          label: this.props.t('btnnames.no'),
          onClick: () => {
            srmobj["branchManagerUserId"] = (oldid ? oldid : -1);
            this.setState({ sobj: srmobj, });
          }
        }],
        closeOnEscape: false
      });
    } else {
      srmobj["branchManagerUserId"] = ctxt.value;
      this.setState({ sobj: srmobj, isUpdated: true});
    }
    //this.checkBranchUser(ctxt.value);
  }
  //
  checkBranchUser = (evt) => {
    if (evt > 0) {
      submitSets(submitCollection.findUserByID, "/" + (evt), false).then(res => {
        if (res && res.status && res.extra && typeof res.extra !== "string") {
          //var csobj = res.extra;
        }
      });
    }
  }

  onRowClicked = (cidx,citem) => {
    this.setState({addedTags:[]});
    var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
    if(cfindList){
        if(citem && citem[0] && citem[0] !== ""){
            let finditem = cfindList.data.find(z => z.branchId === citem[0]);
            //console.log(finditem);
            if(finditem){
                this.setState({ sobj: finditem, isedit: true, errors: {}, isUpdated: false }, () => {
                  this.getSpecificStoreTags(finditem.branchId);
                  this.handleModalToggle();
                });
            }
        } else{
          this.setState({ sobj: cfindList.data[cidx], isedit: true, errors: {}, isUpdated: false}, () => {
            this.getSpecificStoreTags(cfindList.data[cidx].branchId);
            this.handleModalToggle();
          });
        }
    }
}

  //delete branch
  handleBranchDelete = () => {
    confirmAlert({
      title: this.props.t("CONFIRM_TO_DELETE_BRANCH"),
      message: this.props.t("CONFIRM_TO_DELETE_BRANCH_DETAILS"),
      overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
      buttons: [{
        label: this.props.t("btnnames.yes"),
        onClick: () => {
          var deleteObj = this.state.sobj;
          deleteObj["isDelete"] = true;

          //console.log(deleteObj)
          submitSets(submitCollection.deleteBranches, deleteObj, true, null, true).then(res => {
            //console.log(res);
            if (res && res.status) {
              alertService.success(this.props.t("successfully_branch_details_deleted"));
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
            } else {
              // alertService.error(res && res.extra && res.extra !== "" ? res.extra : "Error occurred in delete proces");
            }
          });
        }
      }, {
        label: this.props.t("btnnames.no")
      }]
    });
  }

  handleModalToggle = () => {
    this.setState({ showbranchesmodal: !this.state.showbranchesmodal })
  }

  handleTagModalToggle = () =>{
    this.setState({ tagmodalshow: !this.state.tagmodalshow })
  }

  //handle filter
  handleFilterObject = (evt, etype, ctype,msg) => {
    var cobj = this.state.sfilterobj;

    if(!preventinputToString(evt,evt.target.value,msg)){
      evt.preventDefault()
      return
    }
    if (etype !== null) {
      cobj[etype] = evt.target.value;
      this.setState({ filterText: evt.target.value })
    }
    cobj.startIndex = 0;
    this.setState({ sfilterobj: cobj, filteredItems: [], startpage: 1 }, () => {
      if (ctype === "click" || (ctype === "enter" && evt.which === 13)) {
        this.handleTableSearch(null, "click");
      }
    });
  }

  //table search
  handleTableSearch = (evt, etype) => {
    if (etype === "click" || (etype === "enter" && evt.which === 13)) {
      var maxresutcount=this.state.maxShowresultcount
      let csfilterobj=this.state.sfilterobj
      csfilterobj.maxResult=maxresutcount
      var csobj=this.state.sobj
      csobj.maxResult=maxresutcount
      this.setState({
        sfilterobj:csfilterobj,
        cobj:csobj,
        isdataloaded: false, loading: true
      });
      submitSets(submitCollection.getBranches, this.state.sfilterobj, true).then(res => {
        //get new call each paginate 
        var cdata = [];
        // var cdata = this.state.toridata;
        //reset isreqcount
        var csobj = this.state.sobj;
        csobj.isReqCount = false;
        this.setState({ sobj: csobj });
        if (res && res.status) {
          //find page available
          var cfindList = cdata.findIndex(x => x.page === this.state.startpage);
          if (cfindList > -1) {
            cdata[cfindList].data = res.extra;
          } else {
            cdata.push({ page: (this.state.startpage), data: res.extra });
          }
          this.setState({
            toridata: cdata,
            totalresults: ((this.state.startpage === 1|| this.state.sfilterobj.isReqCount) ? res.count : this.state.totalresults),
            
          }, () => {
            this.loadTableData();
          });
        } else {
          this.setState({
            toridata: cdata,
          }, () => {
            this.loadTableData();
          });
        }
        this.setState({ loading: false })
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
          cdata.push({ 0: citem.branchId, 1: (citem.code ? citem.code : "-"), 2: citem.name, 3: (citem.regionName ? citem.regionName : "-"), 4: (citem.location ? citem.location : "-"), 5: (citem.tel ? citem.tel : "-"), 6: "" });
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
    var csobj = this.state.sfilterobj;
    csobj.isReqCount = (this.state.totalPages === cstartpage?true:false);
    csobj.startIndex = ((cstartpage - 1) * this.state.sfilterobj.maxResult);

    this.setState({ sfilterobj: csobj, startpage: cstartpage, isdataloaded: false }, () => {
      if (cfindList) {
        this.loadTableData();
      } else {
        this.handleTableSearch(null, "click");
      }
    });
  }

  //init new tag modal
  initAddTag = () =>{
    this.setState({tagObj:this.defaultTag()});
    this.handleTagModalToggle();
  }

  //load store tags
  loadStoreTags = () =>{
    submitSets(submitCollection.getStoreTags, null, false).then(res => {
      if (res && res.status && res.extra) {
          let arr = [];
          for (let i = 0; i < res.extra.length; i++) {
            arr.push({value:res.extra[i].tagId, label:res.extra[i].tagName});
          }
          this.setState({storetagslist:arr});
      }
    });
  }

  //default tag method
  defaultTag = () =>{
    return {tagId:0,tagName:""}
  }

  //change tag dropdown
  changeTagHandle = (ctxt) =>{
    var obj = this.state.tagObj;
    obj["tagId"] = ctxt.value;
    obj["tagName"] = ctxt.label;
    //console.log(ctxt,srmobj);
    this.setState({ tagObj: obj });
  }

  //save new tag
  addNewTag = () =>{
    if(this.state.tagObj.tagId===0){
      alertService.warn(this.props.t("select_tag"));
      return false;
    }
    
    let nobj = this.state.tagObj;
    let arr = this.state.addedTags;
    for (let i = 0; i < arr.length; i++) {
      if(arr[i].tagId === nobj.tagId){
        alertService.warn(this.props.t("tag_already_added"));
        return false;
      }
    }

      arr.push(nobj);
      this.setState({addedTags:arr, isUpdated: true});
      this.handleTagModalToggle();
    
  }

  //save new tags for branch
  saveTagsForBranch = (storeId) =>{
    if(storeId){
      let cobj = {};
      cobj.storeId = storeId;
      cobj.tagList = [];
      
      for (let i = 0; i < this.state.addedTags.length; i++) {
        cobj.tagList.push(this.state.addedTags[i].tagId);
      }
      let url = (this.state.isedit===true ? submitCollection.updateStoreTags : submitCollection.saveStoreTags);
      submitSets(url, cobj, true).then(res => {
        if (res && res.status && res.extra) {
            
        }
      });
    }
  }

  // remove tag item
  removeTagItem = (i) =>{
    let arr = this.state.addedTags;
    arr.splice(i,1);
    this.setState({addedTags:arr, isUpdated: true});
  }

  //get store tags
  getSpecificStoreTags = (storeId) =>{
    if(storeId){
      let cobj = {storeId:storeId};
      submitSets(submitCollection.findStoreTags, cobj, true).then(res => {
        if (res && res.status && res.extra) {
            this.setState({addedTags:res.extra});
        }
        else{
          this.setState({addedTags:[]});
        }
      });
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

  handleKeyDown = (event) => {
    if(event.key === "." || event.key === "*"){
      event.preventDefault();
      return
    }
    if(!(/[0-9]/.test(event.key) || (event.ctrlKey && (event.key === 'v' || event.key === 'V')) || parseInt(event.keyCode) === 8  || parseInt(event.keyCode) === 37 || parseInt(event.keyCode) === 39 || parseInt(event.keyCode) === 32 || parseInt(event.keyCode) === 110)){
        event.preventDefault();
    }
  }

  countryCodeHandler = ctxt => {
    var sobj = this.state.sobj;
    sobj.countryCode = ctxt.value;
    this.setState({
      sobj:sobj,
      isUpdated: true
    },()=>{
      if(this.state.sobj.tel!== ""){
        let cobj = this.state.sobj;
        cobj['tel'] =  new AsYouType(this.state.sobj.countryCode).input(this.state.sobj.tel);
        this.setState({
            sobj:cobj
        },()=>{
          if(this.state.sobj.tel !== "" && this.state.sobj.tel.length > 0){
            let errors = this.state.errors;
            errors['telephoneError'] = ""
            if(!isValidPhoneNumber(this.state.sobj.tel,this.state.sobj.countryCode)){
              errors['telephoneError'] = this.props.t("entervalidtelephone");
            }
            this.setState({
              errors: errors
            })
          }
        })
    }
    })
  }

  render(){
      const ftableheaders = [{text: "", width: "1%"},this.props.t('code'),this.props.t('name'),this.props.t('region'),this.props.t('location'),this.props.t('telephone'),""];
      var countryList = this.state.countryCodes.map((x)=>{ return { value: x.key, label: isoCountries.getName(x.key,(this.props.isRTL === "rtl" ? "he" : "en")) }})
      //   return <option key={x.key} value={}>{}</option>
      // })
        return (<>
          <Col xs={12} className={"main-content compmain-content mdatacontent-main mbformcontent-main rg-mdview "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
            <div>
                <Row>
                    <MDSidebarMenu />
                    <Col xs={12} lg={10}>
                      <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                          <Breadcrumb.Item active>{this.props.t('branches')}</Breadcrumb.Item>
                            <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        </>:<>
                          <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                          <Breadcrumb.Item active>{this.props.t('branches')}</Breadcrumb.Item>
                        </>}
                      </Breadcrumb>      
                      <Col className="white-container pdunit-content" ref={this.whitecontainer}>
                        <Col sm={12}>
                          <Col className="custom-filters form-inline">
                              <Form.Control  placeholder={this.props.t('btnnames.search')} value={this.state.sfilterobj.filterOpt} onChange={e => this.handleFilterObject(e,"filterOpt","change",this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e,"filterOpt","enter")} onKeyDown={(e)=>{(e.key === "." || e.key === "+") ?e.preventDefault():preventinputToString(e,this.state.sfilterobj.filterOpt,(this.props.t('Character.search_text')))}}/>
                              <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } /></span>
                              <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                              <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                          </Col>
                          <Button type="submit" className="highlight-btn" onClick={this.handleNewLink} variant="success">{this.props.t('btnnames.addnew')}</Button>

                          {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0?
                            <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sfilterobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sfilterobj.maxResult} handleRowClick={this.onRowClicked} handlePageChange={this.handlePageChange}/>
                          :this.state.isdataloaded?<>
                            <AcNoDataView />
                          </>:<></>}
                        </Col>
                      </Col>
                    </Col>
                    
                </Row>
            </div>
        </Col>

      <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />

      <Modal  show={this.state.showbranchesmodal} backdrop="static" keyboard={false} onHide={this.handleModalToggle} className={"branchmodal-view " + (this.props.isRTL === "rtl" ? "RTL" : "")} dir={this.props.isRTL}>
        <Modal.Header>{(this.state.isedit) ? (<>
          <Modal.Title> <b>{this.props.t('editbranch')}</b></Modal.Title>
        </>) : (<>
          <Modal.Title> <b>{this.props.t('addbranch')}</b></Modal.Title>
        </>)}
        </Modal.Header>
        <Modal.Body>
          <Col className="formcontrol-main"><>
            <Row>
              <Col xs={12} className="bform-subcontent">
                <Form.Group name="branchesubmitmodal" onSubmit={this.submitBranchAddModal}>
                  <Row>
                    <Col xs={12} md={6}>
                      <label> {this.props.t('region')} <span style={{ color: "red" }}>*</span></label><br />
                      <Select id="area_id" name="area" placeholder={this.props.t("selectarea")} isDisabled={this.state.isedit?true:false} options={this.state.BranchAreas} type="text" onChange={(e) => this.changeAreaHandler(e)} value={this.state.BranchAreas.filter(option => option.value === this.state.sobj.regionId)} className="filter-searchselect" classNamePrefix="searchselect-inner" components={{ IndicatorSeparator: () => null }} maxMenuHeight={120} data-validation-type="area" required />
                      <div className="errorMsg">{this.state.errors.areaError}</div>
                    </Col>
                    <Col xs={12} md={6}>
                      <label> {this.props.t('code')} <span style={{ color: "red" }}>*</span></label><br />
                      <input  type="text" id="code" className="form-input" name="code" value={this.state.sobj.code} onChange={(e) => this.handleChange(e, "code",(this.props.t('Character.code')))} onBlur={(e) => this.onBlur(e, false)} placeholder={this.props.t("branchcode")} data-validation-type="code" required onKeyDown={(e)=>preventinputToString(e,this.state.sobj.code,(this.props.t('Character.code')))} /><br />
                      <div className="errorMsg">{this.state.errors.codeError}</div>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12}>
                      <label> {this.props.t('name')} <span style={{ color: "red" }}>*</span></label><br />
                      <input  type="text" name="name" className="form-input" value={this.state.sobj.name} onChange={(e) => this.handleChange(e, "name",this.props.t('Character.name'))} onBlur={(e) => this.onBlur(e, false)} placeholder={this.props.t("branchname")} data-validation-type="name" required onKeyDown={(e)=>preventinputToString(e,this.state.sobj.name,(this.props.t('Character.name')))} /><br />
                      <div className="errorMsg">{this.state.errors.nameError}</div>
                    </Col>
                  </Row>
                  <Col xs={12}>
                    <label> {this.props.t('address')} <span style={{ color: "red" }}>*</span></label><br />
                    <textarea type="text" id="address" className="form-input" name="address" value={this.state.sobj.address} onChange={(e) => this.handleChange(e, "address",(this.props.t('Character.address')))} placeholder={this.props.t("branchaddress")} onBlur={(e) => this.onBlur(e, false)} data-validation-type="address" required onKeyDown={(e)=>preventinputToString(e,this.state.sobj.address,(this.props.t('Character.address')))}></textarea><br />
                    <div className="errorMsg">{this.state.errors.addressError}</div>
                  </Col>
                  <Row>
                    <Col xs={12} md={6}>
                      <label> {this.props.t('location')} <span style={{ color: "red" }}>*</span></label><br />
                      <input type="text" id="location" className="form-input" name="location" value={this.state.sobj.location} onChange={(e) => this.handleChange(e, "location",(this.props.t('Character.location')))} onBlur={(e) => this.onBlur(e, false)} placeholder={this.props.t("location")} data-validation-type="location" required onKeyDown={(e)=>preventinputToString(e,this.state.sobj.location,(this.props.t('Character.location')))}/><br />
                      <div className="errorMsg">{this.state.errors.locationError}</div>
                    </Col>
                    <Col xs={12} md={6}>
                      <label> {this.props.t('city')} <span style={{ color: "red" }}>*</span></label><br />
                      <input type="text" id="city" className="form-input" name="city" value={this.state.sobj.city} onChange={(e) => this.handleChange(e, "city",(this.props.t('Character.city')))} onBlur={(e) => this.onBlur(e, false)} placeholder={this.props.t("city")} data-validation-type="city" required onKeyDown={(e)=>preventinputToString(e,this.state.sobj.city,(this.props.t('Character.city')))} /><br />
                      <div className="errorMsg">{this.state.errors.cityError}</div>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} >
                      <label> {this.props.t('telephone')} <span style={{ color: "red" }}>*</span></label><br />
                      <div className='d-flex gap-2'>
                        <Select  id="country_code" name="country_code" placeholder={this.props.t("selectbranchmanager")} options={countryList} type="text" onChange={(e) => this.countryCodeHandler(e)} value={countryList.filter(option => option.value === this.state.sobj.countryCode)} className="country_code" maxMenuHeight={120} classNamePrefix="searchselect-inner" />
                        <div>
                          <input  type="tel" id="telephone" className="form-input" name="telephone" value={this.state.sobj.tel} onChange={(e) => this.handleChange(e, "tel",(this.props.t('Character.telephone')))} onBlur={(e) => this.onBlur(e, false)} placeholder={this.props.t("telephone")} data-validation-type="telephone" required onKeyDown={(e)=>{preventinputophone(e,this.state.sobj.tel,(this.props.t('Character.telephone')))}} /><br />
                          <div className="errorMsg">{this.state.errors.telephoneError}</div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col >
                      <label> {this.props.t('formfield.email')} <span style={{ color: "red" }}>*</span></label><br />
                      <input  type="email" id="email" className="form-input" name="email" value={this.state.sobj.email} onChange={(e) => this.handleChange(e, "email")} onBlur={(e) => this.onBlur(e, false)} placeholder={this.props.t("formfield.email")} data-validation-type="email" required onKeyDown={(e)=>{preventinputToEmail(e,this.state.sobj.email,(this.props.t('Character.email')))}} /><br />
                      <div className="errorMsg">{this.state.errors.emailError}</div>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={6}>
                      <label> {this.props.t('suggestionprodlevel')} <span style={{ color: "red" }}>*</span></label><br />
                      <input type="text" id="suggestProductViewLevel" className="form-input" name="suggestProductViewLevel" value={this.state.sobj.suggestProductViewLevel} onChange={(e) => this.changeProductViewQuantityHandler(e)} onBlur={(e) => this.onBlur(e, false)} placeholder={this.props.t("suggestprodviewlevel")} data-validation-type="suggestProductViewLevel" onKeyDown={this.handleKeyDown} required /><br />
                      <div className="errorMsg">{this.state.errors.suggestProductViewLevelError}</div>
                    </Col>
                    <Col xs={12} md={6}>
                      <label> {this.props.t('salesimportbranchcode')} <span style={{ color: "red" }}>*</span></label><br />
                      <input type="text" id="salesImportBranchCode" className="form-input" name="salesImportBranchCode" value={this.state.sobj.salesImportBranchCode} onChange={(e) => this.handleChange(e, "salesImportBranchCode",(this.props.t('Character.salesimportbcode')))} onBlur={(e) => this.onBlur(e, false)} placeholder={this.props.t("salesimportbcode")} data-validation-type="salesImportBranchCode" required onKeyDown={(e)=>preventinputToString(e,this.state.sobj.salesImportBranchCode,(this.props.t('Character.salesimportbcode')))}/><br />
                      <div className="errorMsg">{this.state.errors.salesImportBranchCodeError}</div>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={6}>
                      <label> {this.props.t('removeqty')} <span style={{ color: "red" }}>*</span></label><br />
                      <input  type="text" id="removeQuantity" className="form-input" name="removeQuantity" value={this.state.sobj.productRemovingQtyLimit} onChange={(e) => this.changeProductRemoveQuantityHandler(e)} onBlur={(e) => this.onBlur(e, false)} placeholder={this.props.t("addremoveqty")} data-validation-type="removeQuantity" onKeyDown={this.handleKeyDown} required   /><br />
                      <div className="errorMsg">{this.state.errors.removeQuantityError}</div>
                    </Col>
                    <Col xs={12} md={6}>
                      <label> {this.props.t('branchmanager')}</label><br />
                      <Select id="branchmanager_id" name="branchmanager" placeholder={this.props.t("selectbranchmanager")} options={this.state.BranchUsers} type="text" onChange={(e) => this.changeBranchManagerHandler(e)} value={this.state.BranchUsers.filter(option => option.value === this.state.sobj.branchManagerUserId)} className="filter-searchselect" classNamePrefix="searchselect-inner" components={{ IndicatorSeparator: () => null }} maxMenuHeight={120} data-validation-type="branchmanager" required />
                      <div className="errorMsg">{this.state.errors.branchmanagerError}</div>
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={12} className="main-storetags">
                      <label>
                        {this.props.t('storetags')}
                        <Button variant='danger' className="addbtn" onClick={()=>this.initAddTag()}>+</Button>
                      </label><br/>
                      <Col xs={12} className="added-tag-list">
                        {this.state.addedTags?this.state.addedTags.map((xitem,xidx) => {
                            return <React.Fragment key={xidx}>
                                    <TooltipWrapper text={xitem.tagName}>
                                      <Badge bg="primary" className="tag-badge">{stringtrim(xitem.tagName,70)} <span onClick={() => this.removeTagItem(xidx)}><XIcon size={14}/></span></Badge>
                                    </TooltipWrapper>
                                  </React.Fragment>;
                        }):<></>}
                      </Col>
                    </Col>
                  </Row>

                </Form.Group>
              </Col>
            </Row>
          </></Col>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="light" type="button" className={"bbackbutton branch"+(this.props.isRTL === "rtl"?" float-left":" float-right")} size="sm" onClick={this.handleModalToggle}>{this.props.t("btnnames.close")}</Button>
          {(this.state.isedit) ? (<>
            <Button variant="danger" type="button" className={"bdeletebutton btn btn-danger branch"+(this.props.isRTL === "rtl"?" float-left":" float-right")} size="sm" onClick={this.handleBranchDelete}>{this.props.t("btnnames.delete")}</Button>
            <Button variant="sucess" type="button" className={"bupdatebutton btn btn-success branch"+(this.props.isRTL === "rtl"?" float-left":" float-right")} size="sm" onClick={e => this.handleBranchSave(e, 2)}>{this.props.t("btnnames.update")}</Button>
          </>) : (<>
            <Button variant="success" type="button" className={"bsavebutton btn btn-success branch"+(this.props.isRTL === "rtl"?" float-left":" float-right")} size="sm" onClick={e => this.handleBranchSave(e, 1)}>{this.props.t("btnnames.save")}</Button>
          </>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={this.state.tagmodalshow} centered size={"sm"} backdrop="static" keyboard={false} onHide={this.handleTagModalToggle} className={"branchmodal-view tagaddmodal " + (this.props.isRTL === "rtl" ? "RTL" : "")} dir={this.props.isRTL}>
        <Modal.Header>
          <Modal.Title><b>{this.props.t('addtag')}</b></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {/* <label className='field-label'> {this.props.t('selecttag')} <span style={{ color: "red" }}>*</span></label><br /> */}
            <Select id="tagId" name="area" placeholder={this.props.t("selecttag")} options={this.state.storetagslist} type="text" onChange={(e) => this.changeTagHandle(e)} value={this.state.storetagslist.filter(option => option.value === this.state.tagObj.tagId)} className="filter-searchselect" classNamePrefix="searchselect-inner" components={{ IndicatorSeparator: () => null }} maxMenuHeight={120} data-validation-type="area" required />
        </Modal.Body>
        <Modal.Footer>
          <Button size='sm' className={"bbackbutton btn btn-light branch"+(this.props.isRTL === "rtl"?" float-left":" float-right")} variant='light' onClick={()=>this.handleTagModalToggle()}>{this.props.t("btnnames.close")}</Button>
          <Button size='sm' className={"bsavebutton btn btn-success branch"+(this.props.isRTL === "rtl"?" float-left":" float-right")} variant='success' onClick={() =>this.addNewTag()}>{this.props.t("btnnames.add")}</Button>
        </Modal.Footer>
      </Modal>

    </>);
  }
}

export default withTranslation()(withRouter(BranchesComponent));
