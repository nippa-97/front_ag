import React from 'react';
import { Switch, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { confirmAlert } from 'react-confirm-alert';
import './App.scss';

import i18n from "i18next";
import { withTranslation } from "react-i18next";
import "./_translations/i18n";


import NavbarTop from './components/common_layouts/navbartop';
import SidebarMenu from './components/common_layouts/sidebarmenu';
import Alerts from './components/common_layouts/Alerts';
import { store } from './store/store';
import { messaging } from './firebase';
//import ToastMain from './components/common_layouts/ToastMain';
import NoConnectionNotify from './components/common_layouts/noconnectionnotify';
import AppDownNotify from './components/common_layouts/appdownnotify';
import { AcViewModal } from './components/UiComponents/AcImports';

import { getCookie, setCookie, grantPermission } from './_services/common.service'; //, grantPermission
import { submitCollection } from './_services/submit.service';
import { persistService } from './_services/persist.service';
import { submitSets } from './components/UiComponents/SubmitSets';
import LazyLoading from './components/common_layouts/lazyloading';
import RoleBasedRouting from './components/common_layouts/rolebaserouting';
import { ResponseProdsModal,MasterPlanogramImplementationModal ,ExcelBulkImportUpdateDetailsModel} from './components/masterdata/newProducts/newproductCommen';

import { NewProdSendTypes } from './enums/productsEnum';

import PagesList from './pages';

import { loginAction, languageAction, notifiAction, prevPageAction, setHomePageAction } from './actions/auth/login_action';
import { loadProdsAction, loadProdsAiAction } from './actions/prod/prod_action';
import { PDviewDataAction, recprodsFieldAction, viewSetAction, viewFieldAction, setFieldStoreAction } from './actions/planogram/planogram_action';
import { feedTableDataAction } from './actions/taskFeed/task_action';
import { complianceResetSetAction } from './actions/manualCompliance/manualCompliance_action';
import { viewSaleWarningAction } from './actions/salelog/sale_log_action';
import { setNewProdCountAction, setNewProdRedirectAction,setNewProductNotificationCount } from './actions/newProductCount/newProductCount_action';
import { setCatelogimportCountAction, setCatelogimportCountRedirectAction } from './actions/catelogueimportLog/cateloueImportLog_action';
// import { alertService } from './_services/alert.service';
import { REQPages, Routers } from './enums/routesEnums';


class App extends React.Component {
  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      dmode: (localStorage.getItem("pgdmode") ? true : false), //dark mode
      cstat: null, isAvailableLazyLoading: false,
      signedobj: null, selectedStore: 0, ischangedStore: false,
      nstartindex: 0, nmaxresults: 10, ntotalcount: 0, isnotsloading: false, isnewnotsavailable: false,
      loadedBranchList: [],
      globsettingobj: null, isonloadglobal: true,issalewarningLoading:false,

      showLoadingModal: false,
      masterPlanogramModal : false,
      excelBulkImportUpdateDetailsModelShow:false,
      isShowResponseModal: false, responseObj: { responseType: "sendtodep", prods: [] },
      storeId:null,
      HomePageVal:null,
      aristoNotificationCount:0,

      //_temp
      restrictUserIsLogged: false,

    }

  }

  componentDidMount() {
    this._isMounted = true;

    if (this._isMounted) {
      //console.log(this.props.signState.HomePage);
      this.setState({HomePageVal:(this.props.signState && this.props.signState.HomePage?this.props.signState.HomePage:this.getDefaultRolePage())},()=>{
        //console.log(i18n.exists("translations:en"));
      if (localStorage.getItem("pglangobj")) { //get saved language
        const clangobj = JSON.parse(localStorage.getItem("pglangobj"));
        i18n.changeLanguage(clangobj.code);

        const isRTL = i18n.dir(clangobj.code);
        if (isRTL === "rtl") {
          document.body.classList.add("rtlview");
        } else {
          document.body.classList.remove("rtlview");
        }
      } else { //check browser language
        /* if (navigator && navigator.language) {
          const checklang = langList.findIndex(litem => litem.code === navigator.language);
          if (checklang > -1) {
            this.props.setLangObj(langList[checklang]);
            i18n.changeLanguage(navigator.language);

            const isRTL = i18n.dir(navigator.language);
            if (isRTL === "rtl") {
              document.body.classList.add("rtlview");
            } else {
              document.body.classList.remove("rtlview");
            }
          }
        } */

        document.body.classList.add("rtlview");
        i18n.changeLanguage("he");
      }

      //add class d-mode if darkmode activated
      if (this.state.dmode) {
        document.body.classList.add("d-mode");
      } else {
        document.body.classList.remove("d-mode");
      }
      //set selected store
      if (getCookie("storeId") && getCookie("storeId") > 0) {
        this.setState({ selectedStore: getCookie("storeId") });
      } else {
        if (this.props.signState && this.props.signState.signinDetails) {
          const signindetails = this.props.signState.signinDetails;
          this.setState({ selectedStore: signindetails.storeId });
          setCookie("storeId", (signindetails.storeId && signindetails.storeId > 0?signindetails.storeId:0));
        }
      }
      //
      if (this.props.signState && this.props.signState.signinDetails) {
        // let isUserRestricted = (this.props.signState.signinDetails.userUUID === "53bd6158-b53c-4032-9855-b6a9d0481da9"?true:false);
        // this.setState({ restrictUserIsLogged: isUserRestricted });

        const persistdata = persistService.loadPersist();
        //load store/branch data
        this.loadStoresList(persistdata);
      }
      //
      if (getCookie("ischangedStore")) {
        this.setState({ ischangedStore: getCookie("ischangedStore") });
      }
      //
      if (window.location && window.location.pathname !== "/" && window.location.pathname !== "/signin" && window.location.pathname !== "/landing") {
        if (!this.props.signState || !this.props.signState.signinDetails) {
          this.props.history.push("/signin");
        }
      }
      this.props.history.listen((newLocation, action) => {
        //console.log(newLocation.pathname);
        if (newLocation.pathname !== "/" && newLocation.pathname !== "/signin" && newLocation.pathname !== "/landing") {
          const state = store.getState();
          //console.log(state);
          if (!state.signState || !state.signState.signinDetails) {
            this.props.history.push("/signin");
          } else{
            //load sales log warnings
            // this.GetSalesLogWarings();
            this.loadNewProductsCounts();
            this.loadCatelogimportCounts();
            this.getAristoNotificationCount();
          }
        }
        //check it contains planograms otherwise clean pagination save
        /* if(newLocation.pathname && !newLocation.pathname.includes("planograms")){
          sessionStorage.removeItem("plgsearchfilters");
        } */
        //check it contains feed/task pages otherwise clean pagination save
        if(newLocation.pathname && !newLocation.pathname.includes("tasks")){
          sessionStorage.removeItem("feedsearchfilters");
        }
        //check it contains questionlist or feed otherwise clean pagination save
        if(newLocation.pathname && !newLocation.pathname.includes("questionlist") && !newLocation.pathname.includes("tasks")){
          sessionStorage.removeItem("qustsearchfilters");
        }
        //get global settings on page change
        this.loadGlobalSettings();
      });
      //onload page onetime load global settings
      if(this.state.isonloadglobal){
        this.loadGlobalSettings();
      }

      this.checkNewNotsAvailable(); //load notifications new count - if it's loading from redux
      //this.loadNotificationsList(0); //load notifications
        
      })
    
    }
    //this.getComStat(); //get online stat
   
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  //get default page if signin
  getDefaultRolePage(){
    var curuserobj = (this.props.signState && this.props.signState.signinDetails ? this.props.signState.signinDetails : null);
    // console.log(curuserobj);
    const permittedRolePages = (curuserobj && curuserobj.userRolls ? curuserobj.userRolls.userAccessService : []);
    var defaccesspage = (permittedRolePages.length>0?permittedRolePages[0].serviceName:undefined);

    return defaccesspage;
  }
  //#GBL-H01 load global settings
  loadGlobalSettings = () => {
    /* const state = store.getState();
    if (!(!state.signState || !state.signState.signinDetails)) {
      //load sales log warnings
      this.GetSalesLogWarings();
    } */
    //isonloadglobal
    submitSets(submitCollection.getGlobalSetting, null, false).then(res => {
      //console.log(res);
      if (res && res.status && res.extra) {
        /* var cobj = res.extra;
        cobj["stop_app_traffic"] = true; */
        this.setState({ globsettingobj: res.extra, isonloadglobal: false });
      } else{
        this.setState({ globsettingobj: null, isonloadglobal: false });
      }
    });
  }
  //load sales warnigs from back
  GetSalesLogWarings=()=>{
    this.setState({issalewarningLoading:true},()=>{
      submitSets(submitCollection.GetWarningInfoSales).then(res => {
        if(res && res.status){
          this.props.setSaleWarnings(res.extra);
          this.setState({issalewarningLoading:false})
        }else{
          this.setState({issalewarningLoading:false})
        }
      })
    })
    
  }
  //load notifications from back
  loadNotificationsList = (startidx) => {
    let langCode = (i18n.language && i18n.language!=="" ? i18n.language :"he");
    var sobj = { readStatus: "all", isReqPagination: true, startIndex: (startidx ? startidx : 0), maxResult: this.state.nmaxresults, language:langCode }

    this.setState({ isnotsloading: true });
    submitSets(submitCollection.searchNotifications, sobj, false).then(res => {
      //console.log(res);
      var cdataobj = (this.props.signState.notifiDetails ? this.props.signState.notifiDetails : { startIndex: startidx, datalist: [] });
      var cdata = (startidx > 0 ? (cdataobj && cdataobj.datalist && cdataobj.datalist.length > 0 ? cdataobj.datalist : []) : []);
      if (res && res.status) {
        if (startidx === 0) {
          cdataobj["datalist"] = []; //empty all datalist
        }
        const ctotalresults = (startidx === 0 ? res.count : this.state.ntotalcount);
        this.setState({ ntotalcount: ctotalresults, nstartindex: startidx });
        for (var i = 0; i < res.extra.length; i++) {
          const cobj = {
            title: res.extra[i].title, body: res.extra[i].message, status: res.extra[i].notificationReadStatus,
            notificationId: res.extra[i].notificationId, receptId: res.extra[i].receptId, readdate: res.extra[i].readDate, deliverdate: res.extra[i].deliveredDate, isDelete: false, payload: res.extra[i].payloadData
          }
          cdata.push(cobj);
        }

        const sortnotslist = cdata.sort(this.sortnotslist);
        //console.log(sortnotslist);
        cdataobj["datalist"] = sortnotslist;
        cdataobj["totalcount"] = ctotalresults;
        this.props.setNotifiAction(cdataobj);
        this.checkNewNotsAvailable();
        //this.setState({ filteredProdList: cdata, pstartpage: startidx });
      } else {
        cdataobj["datalist"] = cdata;
        this.props.setNotifiAction(cdataobj);
        this.checkNewNotsAvailable();
        //console.log(cdataobj);
        //alertService.error(this.props.t('NO_RESULT_FOUND'));
      }
      setTimeout(() => { this.setState({ isnotsloading: false }); }, 1000);
    });
  }
  //sort nots list
  sortnotslist = (a, b) => {
    if (a.notificationId > b.notificationId) {
      return -1;
    }
    if (a.notificationId < b.notificationId) {
      return 1;
    }
    return 0;
  }
  //check new nots available
  checkNewNotsAvailable = () => {
    var cloadlist = (this.props.signState.notifiDetails ? this.props.signState.notifiDetails : { startIndex: 0, datalist: [] });
    var ctoastList = (cloadlist && cloadlist.datalist && cloadlist.datalist.length > 0 ? cloadlist.datalist : []);
    var ctotalcount = (cloadlist && cloadlist.totalcount ? cloadlist.totalcount : 0);

    var isavailblenew = false;
    if (ctoastList && ctoastList.length > 0) {
      for (var i = 0; i < ctoastList.length; i++) {
        if (ctoastList[i]["status"] && ctoastList[i]["status"] === "unseen") {
          isavailblenew = true;
        }
      }
    }
    this.setState({ isnewnotsavailable: isavailblenew, ntotalcount: ctotalcount });
  }
  //update notification status
  updateNotifiationStatus = (cidx, isdelete) => {
    // console.log(cidx)
    var cdataobj = (this.props.signState.notifiDetails ? this.props.signState.notifiDetails : { startIndex: 0, datalist: [] });
    var cdata = (cdataobj && cdataobj.datalist && cdataobj.datalist.length > 0 ? cdataobj.datalist : []);
    const findnotobj = cdata[cidx];

    if (findnotobj && findnotobj.notificationId > 0 && (findnotobj.status === "unseen" || (findnotobj.status === "read" && isdelete))) {
      var sobj = [{
        notificationId: findnotobj.notificationId,
        notificationReadStatus: "read",
        receptId: findnotobj.receptId,
        isDeleteNotification: isdelete
      }];

      //update current Obj
      findnotobj.status = "read";
      findnotobj.isDelete = isdelete;

      submitSets(submitCollection.updateNotification, sobj, false).then(res => {
        //console.log(res);
        if (res && res.status) {
          cdata[cidx]["status"] = "read";
          //console.log(sobj);
          /* this.props.setNotifiAction(cdataobj); //update main list
          this.checkNewNotsAvailable(); */
          this.loadNotificationsList(0);
        } else {
          //alertService.error("");
        }
      });
    }
    //if not delete
    if(!isdelete){
        //  console.log(findnotobj);
      //redirect if planogram
      if(findnotobj && findnotobj.payload && findnotobj.payload.payloadTypeId === "4" && findnotobj.payload.planogramId > 0){
        const spgobj = { id: parseInt(findnotobj.payload.planogramId), tags: [], isnotsredirect: true };
        this.planogramViewRedirect(spgobj);
      }
      // redirect to feed
      if (findnotobj && findnotobj.payload && (findnotobj.payload.payloadTypeId === "1" || findnotobj.payload.payloadTypeId === "2") && findnotobj.payload.taskId > 0) {
        this.props.setFeedTableData({ taskdetail: findnotobj.payload, data: null });

        // this.props.history.push('/');
        window.open(window.location.origin);
        this.resetRedirectDetails(2);
      }
      // redirect to chat
      //console.log(findnotobj && findnotobj);
      if (findnotobj && findnotobj.payload && findnotobj.payload.payloadTypeId === "3" && findnotobj.payload.taskId > 0) {
        this.props.setFeedTableData({ taskdetail: findnotobj.payload, data: null });

        // this.props.history.push('/');
        window.open(window.location.origin);
        this.resetRedirectDetails(3);
      }
      // redirect to manual comp
      if (findnotobj && findnotobj.payload && (findnotobj.payload.payloadTypeId === "5" && findnotobj.payload.complianceId > 0)) {
        this.props.setmanualCompRedirect(findnotobj.payload.complianceId);
        
        // this.props.history.push('/');
        window.open(window.location.origin);
        this.resetRedirectDetails(4);
      }
      // redirect to new products
      if (findnotobj && findnotobj.payload && findnotobj.payload.payloadTypeId === "7") {
        this.props.setNewProdRedirect(findnotobj.payload.payloadTypeId);
        
        // this.props.history.push('/');
        window.open(window.location.origin);
        this.resetRedirectDetails(5);
      }
      // show bulk update response
      if (findnotobj && findnotobj.payload && findnotobj.payload.payloadTypeId === "8") {
        this.loadBulkUpdateLog(findnotobj.payload.bulkUpdateType, findnotobj.payload.bulkUpdateLogId, );
      }
      //Master Planogram Implementation 
      if (findnotobj && findnotobj.payload && findnotobj.payload.payloadTypeId === "9") {
         //
        this.loadMasterPlanogramImplementation(findnotobj.payload.vmpImplementJobDetails)
      }
      //Excel Import bulk Update
      if (findnotobj && findnotobj.payload && findnotobj.payload.payloadTypeId === "10") {
        //
        this.loadExcelImportBulkUpdateLog(findnotobj.payload.excelimportbulkUpdateLogId);
     }
    }
  }

  //load Master Planogram Implementation 

  loadMasterPlanogramImplementation = (id) =>{

    let cqparam = "?id="+id;
    this.setState({ showLoadingModal: true }, () => {
      submitSets(submitCollection.implementationJobComplete, cqparam, false, null, true).then(resp => {
        // console.log(resp)
        this.setState({ showLoadingModal: false });
        if(resp && resp.status && resp.extra && Object.keys(resp.extra).length > 0){
          this.setState({ masterPlanogramModal: true, responseObj: resp.extra});
        }else{
          // alertService.error(resp.extra?resp.extra:this.props.t("erroroccurred"))
        }
      });
    });
  }


  //load bulk update 
  loadBulkUpdateLog = (viewtype, bulklogid, bulklogtype) => {
    let newrestype = (viewtype?NewProdSendTypes[viewtype]:null);
    let cqparam = "?bulkUpdateId="+bulklogid;

    this.setState({ showLoadingModal: true }, () => {
      submitSets(submitCollection.bulkUpdateLog, cqparam, false).then(resp => {
        //console.log(res);
        this.setState({ showLoadingModal: false });
        if(resp && resp.status && resp.extra && Object.keys(resp.extra).length > 0){

          let respobj = { responseType: newrestype, prods: resp.extra };
          this.setState({ isShowResponseModal: true, responseObj: respobj });
        }
      });
    });
  }

  loadExcelImportBulkUpdateLog = ( bulklogid) => {
    // let newrestype = (viewtype?NewProdSendTypes[viewtype]:null);
    let cqparam = "?bulkUpdateId="+bulklogid;

    this.setState({ showLoadingModal: true }, () => {
      submitSets(submitCollection.ExcelImportbulkUpdateLog, cqparam, false).then(resp => {
        //console.log(res);
        this.setState({ showLoadingModal: false });
        if(resp && resp.status && resp.extra && Object.keys(resp.extra).length > 0){

          let respobj = { prods: resp.extra };
          this.setState({ excelBulkImportUpdateDetailsModelShow: true, responseObj: respobj });
        }
      });
    });
  }

  //toggle bulk response modal
  toggleResponseModal = () => {
      this.setState({ isShowResponseModal: !this.state.isShowResponseModal });
  }
  //toggleMasterPlanogramModal
  toggleMasterPlanogramModal = () =>{
    this.setState({
      masterPlanogramModal : !this.state.masterPlanogramModal
    })
  }



  toggleExcelBulkImportUpdateDetailsModelShow= () =>{
    this.setState({
      excelBulkImportUpdateDetailsModelShow : !this.state.excelBulkImportUpdateDetailsModelShow
    })
  }

  //planogram redirect
  planogramViewRedirect = (spgobj) => {
    var cqparam = "?floorLayoutId="+spgobj.id;
    submitSets(submitCollection.findStoreByFloorLayoutId, cqparam, false).then(res => {
      //console.log(res);
      if(res && res.status && res.extra && Object.keys(res.extra).length > 0){
        var cexobj = res.extra;
        this.props.setFieldStore(cexobj.storeId);
        this.props.setPLanogramdetailsView(null);
        this.props.setFieldView(null);
        this.props.setPLanogramView(spgobj);

        // this.props.history.push('/');
        window.open(window.location.origin);

        this.resetRedirectDetails(1, spgobj);
      }
    });
  }
  //redirect reset
  resetRedirectDetails = (rtype, spgobj) => {
    setTimeout(() => {
      if(rtype === 1){
        let newspgobj = spgobj;
        newspgobj.isnotsredirect = false;

        this.props.setPLanogramView(spgobj);

      } else if(rtype === 2 || rtype === 3){
        this.props.setFeedTableData(null);

      } else if(rtype === 4){
        this.props.setmanualCompRedirect(null);

      } else if(rtype === 5){
        this.props.setNewProdRedirect(null);

      }
    }, 2500);
  }
  
  //update notification startidx
  updateNotState = (cidx) => {
    this.setState({ nstartindex: cidx });
  }
  //dark mode toggle
  dmodeToggle = (cstate) => {
    if ((cstate ? !cstate : this.state.dmode)) {
      document.body.classList.remove("d-mode");
      localStorage.removeItem("pgdmode", true);
    } else {
      document.body.classList.add("d-mode");
      localStorage.setItem("pgdmode", true);
    }

    this.setState({
      dmode: (cstate ? cstate : !this.state.dmode)
    });
  }
  //get b-end commiunication stat
  getComStat = () => {
    submitSets(submitCollection.checkstat, null).then(resp => {
      //console.log(resp);
      this.setState({ cstat: resp });
    });
  }
  //delete firebase token
  removeFirebaseToken = () => {
    if(this.props.signState!==null&&this.props.signState.signinDetails){
      try {
        messaging.deleteToken();
      } catch (error) {
        //console.log(error);
      }  
    }
  }
  //
  handleSignObj = (cobj) => {
    if (cobj) { //if signin
      sessionStorage.removeItem("plgsearchfilters");
      
      //restrictUserIsLogged
      // let isUserRestricted = (cobj.userUUID === "53bd6158-b53c-4032-9855-b6a9d0481da9"?true:false);

      this.setState({ 
        selectedStore: cobj.storeId, 
        isAvailableLazyLoading: false,
        // restrictUserIsLogged: isUserRestricted,
      }, () => {
        setCookie("storeId", (cobj.storeId && cobj.storeId > 0?cobj.storeId:0));
        setCookie("ischangedStore", false);
        
        //clean redux
        this.props.setFieldRecList([]); //clean recent prodlist

        setTimeout(() => {
          if(this.props.signState!==null && this.props.signState.signinDetails){
            if(!this.props.signState.signinDetails.isAiUser){
              this.loadStoresList(null);
            }
            this.loadNotificationsList(0); //load notifications
            this.GetSalesLogWarings(); //load sales log warnings
          }
        },100);

        var iswaittillstores = (cobj.storeId && cobj.storeId > 0?100:1000);
        setTimeout(() => {
          this.setState({ isAvailableLazyLoading: true });  
        }, iswaittillstores);
      });
    } 
    this.props.setSigninObj(cobj);
    setTimeout(() => {this.saveUserLanguage(i18n.language);}, 200);
  }
  //LAN-H02 update body class on change language rtl support
  handleLangObj = (cobj) => {
    //console.log(cobj);
    this.props.setLangObj(cobj);

    const isRTL = i18n.dir(cobj.code);
    this.saveUserLanguage(cobj.code);
    if (isRTL === "rtl") {
      document.body.classList.add("rtlview");
    } else {
      document.body.classList.remove("rtlview");
    }
  }

  saveUserLanguage = (code) => {
    if(code && this.props.signState.signinDetails !== false && this.props.signState.signinDetails !== null && this.props.signState.signinDetails !== undefined){
      let sobj = {language:code};
        submitSets(submitCollection.updateUserLanguage, sobj, false).then(res => {
          if(res && res.status){}
        });
    }
  }
  
  //handle change branch details
  handleChangeStoreBranch = (etxt, type) => {
    const clangobj = (localStorage.getItem("pglangobj") ? JSON.parse(localStorage.getItem("pglangobj")) : undefined);
    const isRTL = i18n.dir((clangobj ? clangobj.code : this.props.langState ? this.props.langState.languageDetails.code : "he"));

    const ctxt = etxt;
    if(ctxt > 0){
      if (type === 2) {
        confirmAlert({
            title: this.props.t('CHANGE_CURRENT_STORE'),
            message: this.props.t('THISWILL_REDIRECT_LANDING_PAGE_R_U_SURE'),
            overlayClassName: (isRTL==="rtl"?"alertrtl-content":""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                  this.setState({ selectedStore: ctxt, ischangedStore: true });
                  setCookie("storeId", ctxt);
                  setCookie("ischangedStore", true);
                  //redirect to landing page of user
                  setTimeout(() => {
                    /* const { pathname } = this.props.location;
                    if(pathname === "/storeProducts" && grantPermission("storeProducts")){
                      this.props.setPrevPage("/storeProducts");
                      this.props.history.push("/");
                    } else{ */
                      /* if(grantPermission("planogram")){
                        this.props.history.push("/planograms");
                      } else if(grantPermission("taskfeed")){
                        this.props.history.push("/tasks");
                      } */

                      //redirect to layout view
                      if(grantPermission("planogram")){
                        this.redirectToLayout(ctxt);
                      }

                      
                    /* } */
                  },300);
                }
            }, {
                label: this.props.t('btnnames.no')
            }]
        });
      }
    }
  }
  //load redirect to layout by changing store drop in navbar
  redirectToLayout = (storeid) => {
    // console.log(storeid);
    if(storeid > 0){
      let sobj = { storeId: storeid };
      submitSets(submitCollection.newSearchPlanograms, sobj, false, null, true).then(res => {
          // console.log(res);
          if (res && res.status) {
            if(res.extra && res.extra.length > 0){
              let rowobj = res.extra[0];
              const spgobj = { id: parseInt(rowobj.id > 0?rowobj.id:0), tags: [], isnotsredirect: true };
              
              this.props.setFieldStore(rowobj.storeId);
              this.props.setPLanogramdetailsView(null);
              this.props.setFieldView(null);
              this.props.setPLanogramView(spgobj);

              this.props.history.push('/');
              this.resetRedirectDetails(1, spgobj);
            }
          } else {
              // alertService.error(res && res.extra?res.extra:this.props.t("erroroccurred"));
          }
      });
    }
  }
  //get load handles
  loadStoresList = (pdata) => {
    const getcurrentdata = (pdata && pdata["storelist"] ? pdata["storelist"] : false);
    //const cuserdetails = (this.props.signedobj!==null&&this.props.signedobj.signinDetails?this.props.signedobj.signinDetails:null);
    //console.log(getcurrentdata);
    if (getcurrentdata) {
      this.setState({ loadedBranchList: getcurrentdata });
    } else {
      submitSets(submitCollection.getStores, true).then(res => {
        if (res.extra && typeof res.extra !== "string" && res.extra.length > 0) {
          this.setState({ loadedBranchList: res.extra });
          persistService.persist(res.extra, false, "storelist");
          //set first store as default load one if user don't have default one
          if(!getCookie("storeId") || parseInt(getCookie("storeId")) === 0){
            setCookie("storeId",res.extra[0].id);
            this.setState({ selectedStore: res.extra[0].id });
          }
        } else{ // if response empty
          this.setState({ loadedBranchList: [] });
          persistService.persist([], false, "storelist");
        }
      });
    }
  }
  //clear service workers
  clearServiceWorkers = () => {
    if(window.navigator && navigator.serviceWorker) {
      navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
          registration.unregister();
        }
      });
    }
  }
  //load new product count
  loadNewProductsCounts = () => {
    submitSets(submitCollection.getMPNewProductsCount, null).then(res => {
      if(res && res.status && res.extra){
          this.props.setNewProdCountAction(res.extra);
      } else{
          this.props.setNewProdCountAction(0);
      }
    });
  }

  //load new product count
  loadCatelogimportCounts = () =>{ 
    // getCatelogImportCount
    submitSets(submitCollection.getCatelogImportCount, null).then(res => {
      if(res && res.status===true && res.extra){
          this.props.setCatelogimportCountAction(res.extra);
      } else{
          this.props.setCatelogimportCountAction(0);
      }
    });
  }

  updatestore =(id)=>{
    this.setState({
      storeId:id
    })
  }
  setHomePageval=(val)=>{
    var path=val
    
    if(val===REQPages.taskfeed){
      path=Routers.tasks
    }else if(val===REQPages.masterplanograms){
      path=Routers.masterplanograms
    }
    //console.log(val);
    this.props.setHomePage(path);
    this.setState({HomePageVal:path});
  }

  getAristoNotificationCount =()=>{
    submitSets(submitCollection.getAristoNotificationOngoingProductCount, null).then(res => {
      // console.log(res)
      if(res && res.status===true ){
        this.props.setNewProductNotificationAction(res.count);
      }
    });
  }
  
  render() {
    const clangobj = (localStorage.getItem("pglangobj") ? JSON.parse(localStorage.getItem("pglangobj")) : undefined);
    const isRTL = i18n.dir((clangobj ? clangobj.code : this.props.langState ? this.props.langState.languageDetails.code : "he"));
    
    let isAUIAllow = (this.props.signState &&this.props.signState.signinDetails?this.props.signState.signinDetails.isAUION:false);
    let countryCode = this.props.signState &&this.props.signState.signinDetails?this.props.signState.signinDetails.countryCode:null;
    let isUserRestricted = this.state.restrictUserIsLogged;
    
    //const isRTL = i18n.dir("en");
    // console.log(this.props);
    //console.log(this.state.HomePageVal);
    return (
      <div className={"App " + (isRTL === "rtl" ? "rtlview" : "")}>
        {/* dir={isRTL} <Detector  polling={{interval: 10000}} render={({ online }) => (
          <div className="netdown-main"><div className={"alert alert-dark netdown-warning "+(online ? "d-none" : "show-warning")}>
            You are currently {online ? "online" : "offline"}
          </div></div>
        )} /> */}
        <Alerts />
        {/*<ToastMain/>*/}
        <NoConnectionNotify isRTL={isRTL} />
        <AppDownNotify globsettingobj={this.state.globsettingobj} isonloadglobal={this.state.isonloadglobal} isRTL={isRTL} />
        {(this.props.signState !== null && this.props.signState.signinDetails) ? <NavbarTop isUserRestricted={isUserRestricted} issalewarningLoading={this.state.issalewarningLoading} GetSalesLogWarings={this.GetSalesLogWarings} saleLogState={this.props.saleLogState} loadNewProductsCounts={this.loadNewProductsCounts} removeFirebaseToken={this.removeFirebaseToken} loadedBranchList={this.state.loadedBranchList} handleLangObj={this.handleLangObj} isnotsloading={this.state.isnotsloading} updateNotState={this.updateNotState} ntotalcount={this.state.ntotalcount} nmaxresults={this.state.nmaxresults} nstartindex={this.state.nstartindex} langobj={this.props.langState} dmode={this.state.dmode} isRTL={isRTL} toastlist={this.props.signState.notifiDetails} updateNotifiationStatus={this.updateNotifiationStatus} loadNotificationsList={this.loadNotificationsList} selectedStore={this.state.selectedStore} handleChangeStoreBranch={this.handleChangeStoreBranch} signedobj={this.props.signState} handleSignObj={this.handleSignObj} isnewnotsavailable={this.state.isnewnotsavailable} checkNewNotsAvailable={this.checkNewNotsAvailable} dmodeToggle={this.dmodeToggle} /> : <></>}
        <SidebarMenu isUserRestricted={isUserRestricted} notificationCount={this.props.newProductCountState.newProductNotificationCount} dmode={this.state.dmode} globsettingobj={this.state.globsettingobj} langobj={this.props.langState} isRTL={isRTL} signedobj={this.props.signState} newprodscount={this.props.newProductCountState} catelogImportLogCountState={this.props.catelogImportLogCountState} />
        {this.state.isAvailableLazyLoading ? <LazyLoading setProdList={this.props.setProdList} setAiProdList={this.props.setAiProdList} signedobj={this.props.signState} /> : <></>}
        <Switch>
          <RoleBasedRouting path="/resetPassword"><PagesList.ResetPassword /></RoleBasedRouting>
          <RoleBasedRouting path="/confirmation"><PagesList.ConfirmationPassword /></RoleBasedRouting>

          <RoleBasedRouting path={Routers.dashboard} exact reqpage={"newdashboard"}><PagesList.NewDashboardComponent HomePageVal={this.state.HomePageVal} isRTL={isRTL} dmode={this.state.dmode} dashState={this.props.dashboardState}/></RoleBasedRouting>
          
          <RoleBasedRouting path={Routers.departments} exact reqpage={"departments"}><PagesList.DepartmentsComponent HomePageVal={this.state.HomePageVal} isRTL={isRTL} deptState={this.props.deptState}/></RoleBasedRouting>
          <RoleBasedRouting path={Routers.departments_details} reqpage={"departments"}><PagesList.DepartmentDetailsComponent HomePageVal={this.state.HomePageVal} isRTL={isRTL} deptState={this.props.deptState}/></RoleBasedRouting>
          <RoleBasedRouting path={Routers.chaindepartments} exact reqpage={"chaindepartments"}><PagesList.ChainDepartmentsComponent HomePageVal={this.state.HomePageVal} isRTL={isRTL} deptState={this.props.deptState} /></RoleBasedRouting>
          <RoleBasedRouting path={Routers.chaindepartments_details} reqpage={"chaindepartments"}><PagesList.ChainDepartmentDetailsComponent HomePageVal={this.state.HomePageVal} isRTL={isRTL} deptState={this.props.deptState} navigatedata={this.props.navigateState.navigateDetails}/></RoleBasedRouting>
          <RoleBasedRouting path={Routers.chaindepartments_addnewdepartment} reqpage={"chaindepartments"}><PagesList.AddNewDepartment HomePageVal={this.state.HomePageVal} isRTL={isRTL} deptState={this.props.deptState} /></RoleBasedRouting>
          <RoleBasedRouting path={Routers.tags} exact reqpage={"tags"}><PagesList.TagsComponent HomePageVal={this.state.HomePageVal} isRTL={isRTL}/></RoleBasedRouting>
          <RoleBasedRouting path={Routers.brands} exact reqpage={"brands"}><PagesList.BrandsComponent HomePageVal={this.state.HomePageVal} isRTL={isRTL} navigatedata={this.props.navigateState.navigateDetails}/></RoleBasedRouting>
          <RoleBasedRouting path={Routers.suppliers} exact reqpage={"suppliers"}><PagesList.SuppliersComponent HomePageVal={this.state.HomePageVal} isRTL={isRTL} navigatedata={this.props.navigateState.navigateDetails}/></RoleBasedRouting>
          <RoleBasedRouting path={Routers.products} exact reqpage={"products"}><PagesList.ProductsComponent HomePageVal={this.state.HomePageVal} loadExcelImportBulkUpdateLog ={this.loadExcelImportBulkUpdateLog} isRTL={isRTL} dmode={this.state.dmode} prodState={this.props.prodState} /></RoleBasedRouting>
          <RoleBasedRouting path={Routers.products_details} reqpage={"products"}><PagesList.AddNewItemComponent HomePageVal={this.state.HomePageVal} isRTL={isRTL} prodState={this.props.prodState} ismodal={false}/></RoleBasedRouting>
          <RoleBasedRouting path={Routers.displayunits} exact reqpage={"displayunits"}><PagesList.DisplayUnits HomePageVal={this.state.HomePageVal} isRTL={isRTL} dunitState={this.props.dunitState}/></RoleBasedRouting>
          <RoleBasedRouting path={Routers.displayunits_details} reqpage={"displayunits"}><PagesList.NewDisplayUnit HomePageVal={this.state.HomePageVal} isRTL={isRTL} dmode={this.state.dmode} dunitState={this.props.dunitState}/></RoleBasedRouting>
          <RoleBasedRouting path={Routers.floors} exact reqpage={"floors"}><PagesList.Floors HomePageVal={this.state.HomePageVal} isRTL={isRTL} floorState={this.props.floorState}/></RoleBasedRouting>
          <RoleBasedRouting path={Routers.floors_details} reqpage={"floors"}><PagesList.FloorDetails HomePageVal={this.state.HomePageVal} isRTL={isRTL} floorState={this.props.floorState}/></RoleBasedRouting>
          <RoleBasedRouting path={Routers.planograms} exact reqpage={"planogram"}><PagesList.Planograms HomePageVal={this.state.HomePageVal} updatestore={this.updatestore} isRTL={isRTL} dmode={this.state.dmode} /></RoleBasedRouting>
          <RoleBasedRouting path={Routers.planograms_details} reqpage={"planogram"}><PagesList.PlanogramDetails HomePageVal={this.state.HomePageVal} storeId={this.state.storeId} selectedStore={this.state.selectedStore} isRTL={isRTL} dmode={this.state.dmode} dunitState={this.props.dunitState} planogramState={this.props.planogramState} signedobj={this.props.signState}/></RoleBasedRouting>
          <RoleBasedRouting path={Routers.planograms_displayunit} reqpage={"planogram"}><PagesList.PlanDunitComponent HomePageVal={this.state.HomePageVal} isRTL={isRTL} dmode={this.state.dmode} planogramState={this.props.planogramState} prodState={this.props.prodState} signedobj={this.props.signState}/></RoleBasedRouting>
          <RoleBasedRouting path={Routers.hierarchy} exact reqpage={"hierarchy"}><PagesList.Hierarchy HomePageVal={this.state.HomePageVal} isRTL={isRTL} /></RoleBasedRouting>
          <RoleBasedRouting path="/landing"><PagesList.LandingPage  handleLangObj={this.handleLangObj} isRTL={isRTL} removeFirebaseToken={this.removeFirebaseToken} langobj={this.props.langState}/></RoleBasedRouting>
          {/* <RoleBasedRouting path="/stores" exact reqpage={"stores"}><StoresComponent isRTL={isRTL}/></RoleBasedRouting>
          <RoleBasedRouting path="/stores/details" reqpage={"stores"}><StoresDetailsComponent /></RoleBasedRouting> */}
          {/* <RoleBasedRouting path="/messages" exact reqpage={"messages"}><MessagesComponent/></RoleBasedRouting> */}
          <RoleBasedRouting path="/excelupload" exact reqpage={"excelupload"}><PagesList.ExcelUploadComponent HomePageVal={this.state.HomePageVal} isRTL={isRTL}/></RoleBasedRouting>
          <RoleBasedRouting path="/regions" exact reqpage={"regions"}><PagesList.RegionsComponent HomePageVal={this.state.HomePageVal} isRTL={isRTL}/></RoleBasedRouting>
          <RoleBasedRouting path="/branches" exact reqpage={"branches"}><PagesList.BranchesComponent countryCode={countryCode} HomePageVal={this.state.HomePageVal} isRTL={isRTL}/></RoleBasedRouting>
          <RoleBasedRouting path="/users" exact reqpage={"users"}><PagesList.Users HomePageVal={this.state.HomePageVal} isRTL={isRTL}  signedDetails={this.props.signState.signinDetails} userDetails={this.props.usersState} /></RoleBasedRouting>
          <RoleBasedRouting path="/users/details" exact reqpage={"users"}><PagesList.UserDetails countryCode={countryCode}  HomePageVal={this.state.HomePageVal} isRTL={isRTL} signedDetails={this.props.signState} userDetails={this.props.usersState} /></RoleBasedRouting>
          <RoleBasedRouting path="/usergroups" exact reqpage={"usergroups"}><PagesList.UserGroupsComponent HomePageVal={this.state.HomePageVal} isRTL={isRTL}/></RoleBasedRouting>
          <RoleBasedRouting path="/salesLog" exact reqpage={"salesLog"}><PagesList.SalesLog HomePageVal={this.state.HomePageVal} isRTL={isRTL} globsettingobj={this.state.globsettingobj} /></RoleBasedRouting>
          <RoleBasedRouting path="/newProducts" exact reqpage={"newProducts"}><PagesList.NewProducts HomePageVal={this.state.HomePageVal} isRTL={isRTL}/></RoleBasedRouting>
          <RoleBasedRouting path="/catelogueImport" exact reqpage={"catelogueImport"}><PagesList.CatelogueImport HomePageVal={this.state.HomePageVal} isRTL={isRTL} navigatedata={this.props.navigateState.navigateDetails} /></RoleBasedRouting>
          <RoleBasedRouting path="/profilesettings" exact><PagesList.ProfileSettingsComponent  signedDetails={this.props.signState} isRTL={isRTL} handleSignObj={this.handleSignObj} /></RoleBasedRouting>
          
          <RoleBasedRouting path="/storeProducts" exact reqpage={"storeProducts"}><PagesList.StoreProducts HomePageVal={this.state.HomePageVal} isRTL={isRTL} loadedBranchList={this.state.loadedBranchList} selectedStore={this.state.selectedStore} /></RoleBasedRouting>

          <RoleBasedRouting path="/manualcompliance" exact reqpage={"manualcomp"}><PagesList.ManualComplianceComponent isRTL={isRTL} dmode={this.state.dmode} manCompState={this.props.manualComplianceState} /></RoleBasedRouting>
          <RoleBasedRouting path="/manualcompliance/details" exact reqpage={"manualcomp"}><PagesList.MCDetailsComponent isRTL={isRTL} dmode={this.state.dmode} prodState={this.props.prodState} manualComplianceState={this.props.manualComplianceState} signedobj={this.props.signState} /></RoleBasedRouting>

          {/* <RoleBasedRouting path="/masterplanograms" exact reqpage={"masterPlanogram"}><MasterPlanograms isRTL={isRTL} dmode={this.state.dmode} /></RoleBasedRouting> */}
          <RoleBasedRouting path="/masterplanograms" exact reqpage={"masterPlanogram"}><PagesList.SelectDept HomePageVal={this.state.HomePageVal} isRTL={isRTL} dmode={this.state.dmode} isUserRestricted={isUserRestricted} selectedStore={this.state.selectedStore} signedobj={this.props.signState} mpstate={this.props.masterPlanogramState}  signedDetails={this.props.signState.signinDetails} /></RoleBasedRouting>
          {/* <RoleBasedRouting path="/masterplanograms/depversion" exact reqpage={"masterPlanogram"}><DepartmentVersionView isRTL={isRTL} mpstate={this.props.masterPlanogramState} dmode={this.state.dmode} /></RoleBasedRouting>
          <RoleBasedRouting path="/masterplanograms/selectcat" exact reqpage={"masterPlanogram"}><SelectCategory isRTL={isRTL} mpstate={this.props.masterPlanogramState} dmode={this.state.dmode} selectedStore={this.state.selectedStore} /></RoleBasedRouting> */}
          <RoleBasedRouting path="/masterplanograms/layoutview" exact reqpage={"masterPlanogram"}><PagesList.MPCategoryView  isRTL={isRTL} mpstate={this.props.masterPlanogramState} signedobj={this.props.signState} dmode={this.state.dmode} selectedStore={this.state.selectedStore} signedDetails={this.props.signState.signinDetails}  /></RoleBasedRouting>
          {/* <RoleBasedRouting path="/masterplanograms/branddetails" exact reqpage={"masterPlanogram"}><BrandDrawView isRTL={isRTL} mpstate={this.props.masterPlanogramState} dmode={this.state.dmode} selectedStore={this.state.selectedStore} /></RoleBasedRouting>
          <RoleBasedRouting path="/masterplanograms/productdetails" exact reqpage={"masterPlanogram"}><ProductDrawView isRTL={isRTL} mpstate={this.props.masterPlanogramState} dmode={this.state.dmode} selectedStore={this.state.selectedStore} /></RoleBasedRouting> */}
          
          {isAUIAllow && <RoleBasedRouting path="/prodnotifications" exact reqpage={"masterPlanogram"}><PagesList.ProdNotificationsComponent ongoingCount={this.getAristoNotificationCount}  isRTL={isRTL} mpstate={this.props.masterPlanogramState} dmode={this.state.dmode} selectedStore={this.state.selectedStore} /></RoleBasedRouting>}
          {/* {isAUIAllow && <RoleBasedRouting path="/aristomaps" exact reqpage={"masterPlanogram"}><AristoMapComponent HomePageVal={this.state.HomePageVal} isRTL={isRTL} mpstate={this.props.masterPlanogramState} dmode={this.state.dmode} selectedStore={this.state.selectedStore} /></RoleBasedRouting>} */}
          {isAUIAllow && <RoleBasedRouting path="/newproductlogs" exact reqpage={"masterPlanogram"}><PagesList.NewProductLogs HomePageVal={this.state.HomePageVal} isRTL={isRTL} dmode={this.state.dmode} signedobj={this.props.signState} /></RoleBasedRouting>}

          <RoleBasedRouting path="/tasks" exact reqpage={"taskfeed"}><PagesList.Tasks HomePageVal={this.state.HomePageVal} isRTL={isRTL} signedobj={this.props.signState} taskFeedState={this.props.taskFeedState} questionState={this.props.questionState} dmode={this.state.dmode} /></RoleBasedRouting>
          <RoleBasedRouting path="/tasks/summery" exact reqpage={"taskfeed"}><PagesList.TaskSummery HomePageVal={this.state.HomePageVal} isRTL={isRTL} signedobj={this.props.signState} taskFeedState={this.props.taskFeedState} /></RoleBasedRouting>
          <RoleBasedRouting path="/questionlist" exact reqpage={"taskfeed"}><PagesList.QuestionearList HomePageVal={this.state.HomePageVal} isRTL={isRTL} signedobj={this.props.signState} questionState={this.props.questionState} dmode={this.state.dmode} /></RoleBasedRouting>
          <RoleBasedRouting path="/questionlist/details" exact reqpage={"taskfeed"}><PagesList.QuestionDetails HomePageVal={this.state.HomePageVal} isRTL={isRTL} signedobj={this.props.signState} questionState={this.props.questionState} dmode={this.state.dmode} /></RoleBasedRouting>
          
          <RoleBasedRouting exact path="/signin"><PagesList.SignInComponent langobj={this.props.langState} isRTL={isRTL} globsettingobj={this.state.globsettingobj} removeFirebaseToken={this.removeFirebaseToken} handleSignObj={this.handleSignObj} setHomePageval={this.setHomePageval} /></RoleBasedRouting>
          <RoleBasedRouting exact path="/"><PagesList.RedirectComponent langobj={this.props.langState} mpstate={this.props.masterPlanogramState} newprodState={this.props.newProductCountState} manualcomp={this.props.manualComplianceState} signedobj={this.props.signState} planogramState={this.props.planogramState} taskFeedState={this.props.taskFeedState} handleSignObj={this.handleSignObj}/></RoleBasedRouting>
          <RoleBasedRouting><PagesList.NoMatchComponent signedobj={this.props.signState} /></RoleBasedRouting>

        </Switch>

        <AcViewModal showmodal={this.state.showLoadingModal} message={this.props.t('PLEASE_WAIT')} />

        {this.state.isShowResponseModal?
          <ResponseProdsModal t={this.props.t} isRTL={isRTL} 
            responseObj={this.state.responseObj} 
            toggleResponseModal={this.toggleResponseModal}
            />
        :<></>}


        {this.state.masterPlanogramModal?
          <MasterPlanogramImplementationModal t={this.props.t} isRTL={isRTL} 
            responseObj={this.state.responseObj} 
            toggleResponseModal={this.toggleMasterPlanogramModal}
            planogramViewRedirect={this.planogramViewRedirect}
            />
        :<></>}


      {this.state.excelBulkImportUpdateDetailsModelShow?
          <ExcelBulkImportUpdateDetailsModel t={this.props.t} isRTL={isRTL} 
            responseObj={this.state.responseObj} 
            toggleResponseModal={this.toggleExcelBulkImportUpdateDetailsModelShow}
            planogramViewRedirect={this.planogramViewRedirect}
            />
        :<></>}


      



      </div>
    );
  }

}

const mapStateToProps = state => ({
  ...state
});

const mapDispatchToProps = dispatch => ({
  setHomePage: (payload) => dispatch(setHomePageAction(payload)),
  setSigninObj: (payload) => dispatch(loginAction(payload)),
  setLangObj: (payload) => dispatch(languageAction(payload)),
  setNotifiAction: (payload) => dispatch(notifiAction(payload)),
  setProdList: (payload) => dispatch(loadProdsAction(payload)),
  setAiProdList: (payload) => dispatch(loadProdsAiAction(payload)),
  setPLanogramView: (payload) => dispatch(viewSetAction(payload)),
  setPLanogramdetailsView: (payload) => dispatch(PDviewDataAction(payload)),
  setFieldRecList: (payload) => dispatch(recprodsFieldAction(payload)),
  setFieldView: (payload) => dispatch(viewFieldAction(payload)),
  setFieldStore: (payload) => dispatch(setFieldStoreAction(payload)),
  setFeedTableData: (payload) => dispatch(feedTableDataAction(payload)),
  setmanualCompRedirect: (payload) => dispatch(complianceResetSetAction(payload)),
  setSaleWarnings: (payload) => dispatch(viewSaleWarningAction(payload)),
  setNewProdCountAction:(payload) => dispatch(setNewProdCountAction(payload)),
  setNewProductNotificationAction:(payload)=>dispatch(setNewProductNotificationCount(payload)),
  setNewProdRedirect:(payload) => dispatch(setNewProdRedirectAction(payload)),
  setPrevPage: (payload) => dispatch(prevPageAction(payload)),
  setCatelogimportCountAction:(payload) => dispatch(setCatelogimportCountAction(payload)),
  setCatelogimportCountRedirectAction:(payload) => dispatch(setCatelogimportCountRedirectAction(payload)),
});

export default withTranslation()(withRouter(connect(mapStateToProps, mapDispatchToProps)(App)));
