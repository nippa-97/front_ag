import React, { Component } from 'react'
import { Col,Row,Button,Collapse,Badge, ButtonGroup, Modal } from 'react-bootstrap'
import {  PlusIcon, DashIcon, ChevronDownIcon } from '@primer/octicons-react';
import { confirmAlert } from 'react-confirm-alert';
import Switch from "react-switch";
import FeatherIcon from 'feather-icons-react';
// import FeatherIcon from 'feather-icons-react';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { ConnectedLinkIcon, DisconnectedLinkIcon, ActiveVersionIcon, NoneVersionIcon, ConfirmVersionIcon, AUICheckboxIcons, InfoIcon, NoneVersionActiveIcon, MPWarnIcon } from '../../../assets/icons/icons';
import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { PopoverWrapper, TooltipWrapper } from '../AddMethods'; // PopoverWrapper, 
import { alertService } from '../../../_services/alert.service';
import { impleStatus, markSimUpdateTypes } from '../../../enums/masterPlanogramEnums';

import SearchMPList from '../categoryview/searchMPList';
import { ContImplementModal, CategoryAssingWarn, DisconStoreSelectWarn, ImplementSuccesMsg, TagWarning } from '../contimplement/continueimpl';
import MPsimulateAllCategory from '../simulateview/MPsimulateAllCategory/MPsimulateAllCategory';
import { NoFieldEditModal } from './nofieldedit/nofieldeditview';
import { UniqueDunitEditModal } from './uniquedunit/uniquedunit';
import IsleAlocateModal from './isleAlocateModal/IsleAlocateModal';
import { NewProdsView } from './newproducts/newproducts';
import IssueStoresList from './issuestores/issuestores';
import AllSimulationModal from '../simulateview/AllSimulationModal/AllSimulationModal';

// import { mpsetClipBoardandotherforCatSetAction } from '../../../actions/masterPlanogram/masterplanogram_action';

import loadinggif from '../../../assets/img/loading-sm.gif';

import "./auisidebar.css";
import DisConStoreWarningimpModal from './disconectedStoreWarningModal/disConStoreWarningimpModal';
import { AcViewModal } from '../../UiComponents/AcImports';
import { setNewProductNotificationCount} from '../../../actions/newProductCount/newProductCount_action';
import { AuiConvertedetailsSetAction } from '../../../actions/masterPlanogram/masterplanogram_action';

export class AuiSideBarComponent extends Component {

    constructor(props) {
      super(props)
      this.auiStorediv = React.createRef();
      this._iscallingstackable=false
      this.state = {
        //  screen:false,
         openIndexes:null,
         group:"fields",
         sobj: this.defaultFilterObject(this.props.defSaveObj),
         dataObj:[],
         newData:[],
         fieldCount:null,
         simreload:false,
         tagStoreGroup:[],
         deptSettings:[],
         isLoaded: false,
         defSaveObj: this.getDefSaveObj(),
         openOneCategory:false,
         haveChnagesinCat:false,
         selectedTagGroup: null,
         tagList:[],
         storeId:-1,
         storeName:"",
         isStoreReset: false,
         curAUIVersionList: [],
         colWidth:0,
        
         isFixed: true,
         isSalesCycle: false,
         isChainSalesCycle: false,
         
         //continue implement
         isShowContImpleModal: false,
         showCatAssignWarn: false,
         showDisStoreSelWarn: false,
         showTagWarn: false,
         totalDisStoreCount: 0,
         continueDataObj: null,
         //aisle store details
         implemAisleStores: [],
         //
         showImplemSucMsg: false,
         
         IsIsleAllocationModal:false,
         notagid:null,

         isEnableImplement: false,
         //no fields edit
         showNofieldsEdit: false, noFieldEditList: [],
         //unique displayunit edit
         showUniqueDunitEdit: false, isNonDiffAvailable: false, uniqueDunitList: [],
         //
         otherApproveCount: 0,

         disableSalesCycle : false,
         //new products
         isShowNewProds: false,

         showIssueStores: false, issueStoreList: [],

        allCatList: [], allBrandsList: [], allVersionsList: [],
        newProdsCount: 0,
        //aui imp warning new prod
        AuiMarkImpStoreWarning:false,
        isLoading:false,
        disconnectWarningobj:null,
        originatedMpId:-1,
        originatedSnapshotId:-1,
        newSnapshotId:-1,
        originatedMpName: null,
        simOption: null,
        simulationObj: null,
        disableChecks: false,
        selectedstorecon:null,

        //new prod sidebar preview
        isShowPreviewSimulation: false, isReloadNewProd: true,
        selectedSimPreviewObj: { fieldObj: null, tagObj: null, storeObj: null, selectedProds: [], mpId: -1 },

        //check sim edit enabled
        isSimEditDisabled: false,
        //reset to current and check
        isShowResetWarnModal: false,
        resetCheckAvailable: null,
        isWarnmodaldontSimstore:false,
      }
    }

    componentDidMount() {
      this._isMounted = true;
      
      if (this._isMounted) {
        // this.loadData();
        var rdxobjauidetails=this.props.mpstate.auiConvertedDetails
        if(rdxobjauidetails){
          this.setState({isFixed:rdxobjauidetails.isPrioratizeUserPercentage})
        }
        if(this.props.depDirectType === "AUI"){
          this.props.updateDepDirectType(null);
          this.haneleSidebar(true);
        }
        if(this.auiStorediv ){
          // console.log(this.auiStorediv.current.offsetWidth)
          if(this.auiStorediv.current.offsetWidth !== null){
            this.setState({
              colWidth:this.auiStorediv.current.offsetWidth
            })
          }
        }

        //load new product onload data
        this.loadAllCategories();
        this.loadAllBrands();
        this.loadAllVersions();
        this.getNewProdCount();
      }
    }

    componentDidUpdate(prevProps){
      if(this.props.auiMpObj){
          if (this.props.auiMpObj !== prevProps.auiMpObj && !this.props.auiMpObj.isOpened) {
              this.changeAUIVersion(this.props.auiMpObj);
          }
      }
    }

    defaultFilterObject = (defsaveobj) => {
      return { departmentId: (defsaveobj?defsaveobj.department.id:0), mpId: (defsaveobj?defsaveobj.mp_id:0)};
    }
    //default save object
    getDefSaveObj = () => {
      return { mp_id: -1, is_new: true, is_delete: false, department: {}, categories: [] };
    }
    //
    loadData = (isreturndata, _callback, isupdatenofield, iscontinueimplem, isnofieldreset, storeId, isconttocategory) =>{
      submitSets(submitCollection.getAutoImplementationInfo,this.state.sobj, true).then(res => {
          if(res && res.status){
            let data = (res.extra && res.extra.info && res.extra.info.length > 0?res.extra.info:[]);

            // data.forEach((item) => {
            //   item.storesGroupByTags.forEach((group) => {
            //     group.disconnectedStores.forEach((store) => {
            //       if (store.isDifferentStruc === true) {
            //         store.isApproved = false;
            //       }
            //     });
            
            //     group.connectedStores.forEach((store) => {
            //       if (store.isDifferentStruc === true) {
            //         store.isApproved = false;
            //       }
            //     });
            //   });
            // });
  
            for (let i = 0; i < data.length; i++) {
              let d = data[i];
              
              let temp = 0;
              let distemp = 0;
              let isshowactive = false;

              for (let j = 0; j < d.storesGroupByTags.length; j++) {
                let constorecount = d.storesGroupByTags[j].connectedStores.length;
                let disconstorecount = d.storesGroupByTags[j].disconnectedStores.length;

                d.storesGroupByTags[j]["id"] = ("taggroup_"+i+"_"+j);
                d.storesGroupByTags[j]["totalStores"] = (constorecount + disconstorecount);

                //if connected stores available
                let filterDots = d.storesGroupByTags[j].connectedStores.filter(x=> x.isTemporaryDot);
                let disfilterDots = d.storesGroupByTags[j].disconnectedStores.filter(x=> x.isTemporaryDot);
                let totalDotcount = (filterDots.length + disfilterDots.length);
                
                if(totalDotcount > 0){
                  isshowactive = true;
                }
                //get total count of connected stores
                temp = temp + constorecount;
                //get total count of disconnected stores
                distemp = distemp + d.storesGroupByTags[j].disconnectedStores.length;
              }

              d.isShowActive = isshowactive;
              d.storeCount = temp;
              d.disStoreCount = distemp;
              d.totalStores = (temp + distemp);

              d = this.checkIsStoreApproved(d);
            }
            //console.log(data);
            
            let nofieldlist = (res.extra && res.extra.zeroFieldCountGroup && res.extra.zeroFieldCountGroup.length > 0?res.extra.zeroFieldCountGroup:[]);
  
            //only update nofield list
            if(isupdatenofield){
              this.setState({ 
                dataObj: data,
                noFieldEditList: nofieldlist,
              }, () => {
                this.enableImplementContinue(); //enable implement button

                if(iscontinueimplem){
                  /* if(isconttocategory){
                    if(this.contCheckDisAvailable()){
                      this.toggleDisStoreWarn();
                    } else{
                      this.continueImplementUpdate();
                    }
                  } else{
                    this.implementContinue(true);
                  } */

                  this.implementContinue(true);
                }

                //find selected field count available in reloaded list
                if(isnofieldreset){
                  // let isselectedavail = this.state.dataObj.findIndex(x => x.fieldCount === this.state.fieldCount);
                  // if(isselectedavail === -1){
                    this.setState({
                      openIndexes:null,
                      fieldCount:null,
                      simreload:false,
                      tagStoreGroup:[],
                      selectedTagGroup: null,
                      tagList:[],
                      storeId:-1,
                      storeName:"",
                      isStoreReset: false,
                      notagid:null,
                    }, () => {
                      this.setState({simreload: true});
                      this.handleToggle(0, this.state.dataObj[0].fieldCount, true, false);
                      this.camefromAuiConvertedhandle()
                    });
                  // } 
                }
              });
            } else{
              this.setState({
                dataObj: data,
                noFieldEditList: nofieldlist,
                isLoaded: true,
                storeId: storeId? storeId : -1
              },() => {
                if(!isreturndata){
                  //setting 1st time 1st field card in list defualt
                  if(this.state.dataObj && this.state.dataObj.length > 0){
                    this.handleToggle(0, this.state.dataObj[0].fieldCount, false, false);
                  }
                  this.enableImplementContinue();

                  if((data && data.length > 0)||(nofieldlist&&nofieldlist.length>0)){
                    this.props.handleAuiOpen(true);
                  } else{
                    alertService.error(this.props.t("NO_ACTIVE_PLANOGRAMS"));
                  }
                } else{
                  if(_callback){
                    _callback();
                  }
                }
                this.camefromAuiConvertedhandle()
              });  
            }

            if(isconttocategory){
              this.props.toggleLoadingModal(false);
            }
          }
      });
    }

    camefromAuiConvertedhandle=()=>{
      //check redux sate and handle
      var rdxobj=this.props.mpstate.auiConvertedDetails
      
      if(this.props.mpstate.auiConvertedDetails){
        // var filedcardidx=this.state.dataObj.findIndex(x=>x.fieldCount===rdxobj.simulateCount)
        let data = this.state.dataObj.find((d)=>{ return d.fieldCount === rdxobj.simulateCount; });
        let isTagssame=false
        let selectedtagcard=null
        if(data){
          for (let i = 0; i < data.storesGroupByTags.length; i++) {
            const sg = data.storesGroupByTags[i];
            const areArraysSame = JSON.stringify(sg.tags) === JSON.stringify(rdxobj.selectedTags);
            if(areArraysSame){
              isTagssame=true
              selectedtagcard=sg
              break
            }
          }
          if(rdxobj.isCustomPushEnabled){
            if(isTagssame){
              //only fieldcount and tag
              this.autoclicktagcardonload(rdxobj,selectedtagcard)
            }else{
              alertService.warn(this.props.t("Converted_simulations_group_was_not_found_in_the_AUI"),3000)
              this.props.setAuiConvertedetails(null)
            }
            
            // this.handleToggle(filedcardidx,rdxobj.simulateCount, false, true)
          }else{
            //click on store
            if(rdxobj.selectedBrch&&rdxobj.selectedBrch>0){
              this.autoclicktagcardonload(rdxobj,selectedtagcard,true)
            }else if(isTagssame){
              this.autoclicktagcardonload(rdxobj,selectedtagcard)
            }else{
              alertService.warn(this.props.t("Converted_simulations_group_was_not_found_in_the_AUI"),3000)
              this.props.setAuiConvertedetails(null)
            }
          }
        }else{
          alertService.warn(this.props.t("Converted_simulations_group_was_not_found_in_the_AUI"),3000)
          this.props.setAuiConvertedetails(null)
        }
      }
       
    }
    autoclicktagcardonload = (rdxobj,card,isStoreopen) => {
      var filedcardidx=this.state.dataObj.findIndex(x=>x.fieldCount===rdxobj.simulateCount)
      this.resetAuiView(false, () => {
        this.setState({ openIndexes:filedcardidx, fieldCount:rdxobj.simulateCount }, () => {
          let data = this.state.dataObj.filter((d)=>{ return d.fieldCount === rdxobj.simulateCount; });
            // console.log(data);
            var taggroup = null;
            var tags = [];

            if(data.length > 0){
              taggroup = data[0].storesGroupByTags[0];
              tags = taggroup.tags;
            }
            
            this.setState({
                tagStoreGroup: data,
                selectedTagGroup: taggroup,
                tagList: tags, 
            }, ()=>{;
              if(isStoreopen){
                let selstore=undefined
                let taggroup=null
                for (let i = 0; i < data[0].storesGroupByTags.length; i++) {
                  const sgt = data[0].storesGroupByTags[i];
                  var haved=sgt.disconnectedStores.find(x=>x.id===rdxobj.selectedBrch)
                  var havec=sgt.connectedStores.find(x=>x.id===rdxobj.selectedBrch)
                  if(haved||havec){
                    taggroup=sgt
                    selstore=haved?haved:havec
                    break 
                  }
                }
                if(selstore&&!selstore.isReset){
                  // this.resetRelogramNextStep(selstore, val, true, "connectedStores", index, vidx, z)
                  this.resetRelogramNextStep(selstore, taggroup)
                }else{
                  this.setStore(selstore,taggroup,undefined,undefined)
                }
                // this.setStore(selstore,taggroup,undefined,undefined)
                
              }else{
                this.tagcardclick(card)
              }
            });
        })
      })
    }

    changeSaleCycleActive = (val) => {
      this.setState({isSalesCycle: val});
    }

    updateIsChainSaleCycle = (val) => {
      this.setState({isChainSalesCycle: val});
    }
    
    checkIsStoreApproved = (fieldobj, isreapprove) => {
      let completedcount = 0;
      let isDotCount = 0; 

      //colors check
      let isyellow = false;
      let isallgreen = false;
      //disconnected approved count
      // let totalDisStoreCount = 0;

      let totalYellowStoreCount = 0;
      let totalGreenStoreCount = 0;

      let checktype = (isreapprove?"isReApproved":"isApproved")

      // let calObj={noDif: 0, dif: 0}

      for (let i = 0; i < fieldobj.storesGroupByTags.length; i++) {
        const storeobj = fieldobj.storesGroupByTags[i];
        //filter approved list

        let notResetConStores = storeobj.connectedStores.filter(x => this.checkStoreReset(x));
        let notResetDisStores = storeobj.disconnectedStores.filter(x => this.checkStoreReset(x));

        let filteritems = notResetConStores.filter(x => x[checktype]);
        let disfilteritems = notResetDisStores.filter(x => x[checktype]);

        let filterDots = storeobj.connectedStores.filter(x=> x["isTemporaryDot"]);
        let disfilterDots = storeobj.disconnectedStores.filter(x=> x["isTemporaryDot"]);

        // let filterDifitems = storeobj.connectedStores.filter(x => x["isDifferentStruc"]);
        // let disFilterDifitems = storeobj.disconnectedStores.filter(x => x["isDifferentStruc"]);

        // let filterNotDifitems = storeobj.connectedStores.filter(x => !x["isDifferentStruc"]);
        // let disFilterNotDifitems = storeobj.disconnectedStores.filter(x => !x["isDifferentStruc"]);

        // calObj.noDif += (filterNotDifitems.length + disFilterNotDifitems.length);
        // calObj.dif += (filterDifitems.length + disFilterDifitems.length);

        // console.log(fieldobj.fieldCount)
       
        // let difCount = filterDifitems.length + disFilterDifitems.length;

        //current store disconnected approved count
        /* let prevapproveitem = storeobj.disconnectedStores.filter(x => {
          return (x.prevApproved && !x[checktype]);
        });
        if(prevapproveitem.length > 0){
          totalDisStoreCount = (totalDisStoreCount + prevapproveitem.length);
        } */
        //check yellow
        let yellowcount = storeobj.connectedStores.filter(x => x.planogramStatus === impleStatus.CONFIRMED);
        let disyellowcount = storeobj.disconnectedStores.filter(x => x.planogramStatus === impleStatus.CONFIRMED);
        let totalyellowcount = (yellowcount.length + disyellowcount.length);

        totalYellowStoreCount += totalyellowcount;

        // isyellow = (totalyellowcount > 0?true:isyellow);
        //check green
        let greencount = storeobj.connectedStores.filter(x => x.planogramStatus === impleStatus.ACTIVE);
        let disgreencount = storeobj.disconnectedStores.filter(x => x.planogramStatus === impleStatus.ACTIVE);
        let totalgreencount = (greencount.length + disgreencount.length);

        totalGreenStoreCount += totalgreencount;

        let totalapprovecount = (filteritems.length + disfilteritems.length);
        let totalDotcount = (filterDots.length + disfilterDots.length);
        isDotCount += totalDotcount;
        let totalstorecount = (notResetConStores.length + notResetDisStores.length);
        // let totalstorecountmindif = (storeobj.connectedStores.length + storeobj.disconnectedStores.length - difCount);

        // isallgreen = (totalgreencount > 0 && totalgreencount === totalstorecount?true:isallgreen);

        storeobj.planogramStatus = (totalyellowcount > 0?impleStatus.CONFIRMED:(totalgreencount > 0 && totalgreencount === totalstorecount)?impleStatus.ACTIVE:impleStatus.NONE);

        storeobj[checktype] = false;
        if(totalapprovecount > 0 && totalapprovecount === totalstorecount){
          completedcount = (completedcount + 1);
          storeobj[checktype] = true;
        }
      }

      // console.log(completedcount,fieldobj.storesGroupByTags.length,calObj)
      
      // if(calObj.noDif === 1 && calObj.dif > 0){
      //   if(calObj.dif>1){
      //     if(fieldobj.storesGroupByTags.length === 3 && calObj.noDif === 1 && calObj.dif === 2){
      //       fieldobj.planogramStatus = (isyellow?impleStatus.CONFIRMED:isallgreen?impleStatus.ACTIVE:impleStatus.NONE);
      //       fieldobj[checktype] = (completedcount > 0 && completedcount === fieldobj.storesGroupByTags.length - calObj.dif);
      //     }else{
      //       fieldobj.planogramStatus = (isyellow?impleStatus.CONFIRMED:isallgreen?impleStatus.ACTIVE:impleStatus.NONE);
      //       fieldobj[checktype] = (completedcount > 0 && completedcount === fieldobj.storesGroupByTags.length - calObj.dif + (calObj.dif-1));
      //     }

      //   }else{
      //     if(calObj.dif === 1 && calObj.noDif === 1){
      //       if(fieldobj.storesGroupByTags.length>1){
      //         fieldobj.planogramStatus = (isyellow?impleStatus.CONFIRMED:isallgreen?impleStatus.ACTIVE:impleStatus.NONE);
      //         fieldobj[checktype] = (completedcount > 0 && completedcount === fieldobj.storesGroupByTags.length - calObj.dif);
      //       }else{
      //         fieldobj.planogramStatus = (isyellow?impleStatus.CONFIRMED:isallgreen?impleStatus.ACTIVE:impleStatus.NONE);
      //         fieldobj[checktype] = (completedcount > 0 && completedcount === fieldobj.storesGroupByTags.length);
      //       }
      //     }else{
      //       fieldobj.planogramStatus = (isyellow?impleStatus.CONFIRMED:isallgreen?impleStatus.ACTIVE:impleStatus.NONE);
      //       fieldobj[checktype] = (completedcount > 0 && completedcount === fieldobj.storesGroupByTags.length - calObj.dif);
      //     }
      //   }
      // }else{
        
      //   // console.log( completedcount,fieldobj.storesGroupByTags.length)
      //   if(calObj.noDif>1){
      //     if(calObj.dif===0){
      //       fieldobj.planogramStatus = (isyellow?impleStatus.CONFIRMED:isallgreen?impleStatus.ACTIVE:impleStatus.NONE);
      //       fieldobj[checktype] = (completedcount > 0 && completedcount === fieldobj.storesGroupByTags.length);
      //     }else if(fieldobj.storesGroupByTags.length > 1 && calObj.noDif >=2 && calObj.dif === 1){
      //       fieldobj.planogramStatus = (isyellow?impleStatus.CONFIRMED:isallgreen?impleStatus.ACTIVE:impleStatus.NONE);
      //       fieldobj[checktype] = (completedcount > 0 && completedcount === fieldobj.storesGroupByTags.length);
      //     }else{
      //       fieldobj.planogramStatus = (isyellow?impleStatus.CONFIRMED:isallgreen?impleStatus.ACTIVE:impleStatus.NONE);
      //       fieldobj[checktype] = (completedcount > 0 && completedcount === fieldobj.storesGroupByTags.length - calObj.dif + (calObj.dif-1));
      //     }
      //   }else{

          isyellow = (totalYellowStoreCount > 0?true:isyellow);
          isallgreen = (totalGreenStoreCount > 0 && totalGreenStoreCount === fieldobj.totalStores?true:isallgreen);

          fieldobj.planogramStatus = (isyellow?impleStatus.CONFIRMED:isallgreen?impleStatus.ACTIVE:impleStatus.NONE);
          fieldobj[checktype] = (completedcount > 0 && completedcount === fieldobj.storesGroupByTags.length);
          fieldobj["isDot"] = (isDotCount === fieldobj.totalStores? true : false);
      //   }
      // }
      
      // this.setState({ totalDisStoreCount: totalDisStoreCount });
      
      return fieldobj;
    }

    handleToggle = (index, fieldCount, isignorechanges, isshowsim) => {
      //marking stackable
      if(this.props.mpstate.mpStackableProdList!==null&&this.props.mpstate.mpStackableProdList.length>0){
        //if have stakable to save
        if(isshowsim){this.sendmarkStackableCall(null,()=>this.handleToggleNextstep(index, fieldCount, isignorechanges, isshowsim))}
      }else{
        //nostackable to update
        this.handleToggleNextstep(index, fieldCount, isignorechanges, isshowsim)
      }
      
      
    
    }
    handleToggleNextstep=(index, fieldCount, isignorechanges, isshowsim)=>{
      //marking stackable end
      if(isshowsim && !isignorechanges && this.props.mpstate.mpstackHistory!==null&&this.props.mpstate.mpstackHistory.past.length>0){
       
        confirmAlert({
            title: this.props.t('UNSAVE_CHANGES'),
            message: (this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {   
                  // this.reSetNewProdsRemoveProdstoPrevious()
                  this.continueHandleToggle(index, fieldCount, true);
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {   
                    return false
                }
            }]
        });
      }else{
        this.continueHandleToggle(index, fieldCount, isshowsim)
      }
    }

    //reset aui view
    resetAuiView = (issimclear, _callback) => {
      this.setState({
        openIndexes:null,
        fieldCount:null,
        simreload:false,
        selectedTagGroup: null,
        tagList:[],
        tagStoreGroup: [],
        storeId:-1,
        storeName:"",
        notagid:null,
        disableChecks: false,
        originatedMpId: -1,
        originatedSnapshotId: -1,
        newSnapshotId:-1,
        originatedMpName: null,
        simOption: null,
        openOneCategory: false,
      },()=>{
        this.setState({
          simreload: (issimclear?true:false),
        }, () => {
          if(_callback){
            _callback();
          }  
        });
      });
    }

    continueHandleToggle=(index, fieldCount, isshowsim)=>{
      if(isshowsim){
        this.toggleOneCategory("close");
        
        this.resetAuiView(false, () => {
          this.setState({ openIndexes:index, fieldCount:fieldCount }, () => {
            let data = this.state.dataObj.filter((d)=>{ return d.fieldCount === fieldCount; });
            var taggroup = null;
            var tags = [];

            if(data.length > 0){
              taggroup = data[0].storesGroupByTags[0];
              tags = taggroup.tags;
            }

            this.setState({
                tagStoreGroup: data,
                selectedTagGroup: taggroup,
                tagList: tags, 
                newSnapshotId: (taggroup && taggroup.snapshotId > 0?taggroup.snapshotId:-1),
            }, ()=>{;
              this.setState({ simreload:true });
            });
          });
        });
      } else{
        this.setState({ openIndexes:index });
      }  
    }

    saveSimulationObjToSideBarComp = (dataObj) => {
      this.setState({simulationObj:dataObj});
    }

    haneleSidebar = () => {
      if(!this.props.isAuiOpen){
        this.props.notsaveConfirm((iscontinue) => {
          if(iscontinue){
            if(this.props.isUpdatesAvailable && typeof this.props.resetUpdatesAvailable === "function"){
                this.props.resetUpdatesAvailable();
            }

            this.resetAuiView(false, () => {
              if(this.props.isShowNewProdOnload){
                this.toggleNewProd(true);
                this.props.updateShowNewProd(false);
              } else{
                this.setState({ isShowNewProds: false });
              }

              this.getNewProdCount();
              this.loadAuiVersionList(true);  
            });    
          }
        });
      } else{
        if(this.props.mpstate.mpstackHistory!==null&&this.props.mpstate.mpstackHistory.past.length>0){
          confirmAlert({
            title: this.props.t('UNSAVE_CHANGES'),
            message: (this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {   
                  this.setState({openOneCategory:false},()=>{
                    // this.reSetNewProdsRemoveProdstoPrevious()
                    this.props.updateAUIMPObject({isOpened:true});
                    this.props.handleAuiOpen(!this.props.isAuiOpen)
                  }) 
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {   
                  // this.props.handleAuiOpen(!this.props.isAuiOpen)
                  return false
                }
            }]
        });
        }else{
          this.setState({openOneCategory:false})
          this.props.updateAUIMPObject({isOpened:true});
          this.props.handleAuiOpen(!this.props.isAuiOpen)
        }
      }  
    }
    //load aui versions list and continue load last aui version
    loadAuiVersionList = (isonload) => {
      this.props.toggleLoadingModal(true, () => {
        let cvmpobj = this.props.defSaveObj;
        let svobj = { chainHasDepartmentId: (cvmpobj?cvmpobj.chainHasDepartmentId:0), isAUIConverted: true };

        submitSets(submitCollection.mpVerList, svobj, false).then(res => {
          if(res && res.status && res.extra && res.extra.length > 0){
            this.setState({ 
              curAUIVersionList: (res.extra && res.extra.length > 0?res.extra:[]), 
              isAUIVersionsFound: (res.extra && res.extra.length > 0) 
            }, () => {
              let foundauiversion = (this.state.curAUIVersionList.length?this.state.curAUIVersionList[0]:false);

              //find current open vmp from aui version list
              let findfromaui = this.state.curAUIVersionList.find(x => x.masterPlanogram.id === cvmpobj.mp_id);
              if(findfromaui){
                foundauiversion = findfromaui;
              }

              this.triggerSimulation(foundauiversion);
              this.setState({ deptSettings:this.props.deptsettings }, () => {
                
                // if(isDelete !== "yes"){
                this.props.handleAuiOpen(!this.props.isAuiOpen);
                // }
              });
            });
            
          } else{
            alertService.warn(this.props.t("NO_AUI_VERSIONS"));
            this.setState({ curAUIVersionList: [], isAUIVersionsFound: false, isLoaded: true });
          }

          this.props.toggleLoadingModal(false);
        });  
      });
    }
    //
    setGroup = (data) =>{
      this.setState({ group: data });
    }

    triggerSimulation = (cversion, ismanualtrigger) => {
      if(cversion){
        //
          let parentSaveObj = this.props.defSaveObj;

          let csaveobj = JSON.parse(JSON.stringify(cversion));
          csaveobj["chainHasDepartmentId"] = (parentSaveObj?parentSaveObj.chainHasDepartmentId:0);
          csaveobj["mp_id"] = csaveobj.masterPlanogram.id;
          csaveobj["name"] = csaveobj.masterPlanogram.name;
          csaveobj["searchFromDate"] = csaveobj.masterPlanogram.searchFromDate;
          csaveobj["createdDate"] = csaveobj.masterPlanogram.created_date
          csaveobj["searchToDate"] = csaveobj.masterPlanogram.searchToDate;
          csaveobj["version"] = csaveobj.masterPlanogram.version;
          csaveobj["edited_user"] = (csaveobj.masterPlanogram.edited_user?csaveobj.masterPlanogram.edited_user:"-");
          csaveobj["categories"] = [];

          this.props.toggleLoadingModal((ismanualtrigger?true:false), () => {
            this.setState({ defSaveObj: csaveobj, sobj: this.defaultFilterObject(csaveobj), openIndexes: null }, () => {
              this.resetAuiView(true, () => {
                this.loadData(false, null, false, false, false, null, ismanualtrigger);
              });
            });  
          });
        //
        
      }
    }
    //simulation
    //toggle onecategory open: 
    toggleOneCategory=(type)=>{
      if(type==="close"){
        this.setState({openOneCategory:false})
      }else{
        this.setState({openOneCategory:!this.state.openOneCategory})
      }
    }
    //
    sendmarkStackableCall=(type,callback)=>{
      if(this.props.mpstate.mpStackableProdList!==null&&this.props.mpstate.mpStackableProdList.length>0){
        this.setState({
            // loadinggif:true,loadingstackablecall:true,
            isLoading:true,
            isStackableEdited:false},()=>{
            var sobj =this.props.mpstate.mpStackableProdList!==null?this.props.mpstate.mpStackableProdList:[]
            submitSets(submitCollection.bulkUpdateByProductClick, sobj, false, null, true).then(res => {
                if(res && res.status){
                    // Call handleToggleNextstep after res is complete
                    if (typeof callback === 'function') {
                      callback();
                    }
                    // alertService.success(res.extra===""?this.props.t("SUCCESSFULLY_UPDATED"):res.extra)
                    this.setState({
                        // loadinggif: false,loadingstackablecall:false,
                        isLoading:false,
                        markablestackable:false, stackableCountofmark:"",},()=>{
                        
                    });
                }else{
                    // alertService.error(res.extra===""?this.props.t("erroroccurred"):res.extra)
                    this.setState({
                      // loadinggif: false,loadingstackablecall:false
                      isLoading:false,
                    })
                }
            });
            if(type==="back"){
                this.toggleOneCategory()
            }
        })
      }
    }
    // change haveChnagesinCat
    handlehaveChnagesinCat=(val)=>{
      this.setState({haveChnagesinCat:val})
    }
    tagcardclick = (list) => {
      if(this.props.mpstate.mpstackHistory!==null&&this.props.mpstate.mpstackHistory.past.length>0){
        confirmAlert({
            title: this.props.t('UNSAVE_CHANGES'),
            message: (this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {   
                  // this.reSetNewProdsRemoveProdstoPrevious()
                  this.tagcardclickMethodcall(list)
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {   
                    return false
                }
            }]
        });
      }else{
        this.tagcardclickMethodcall(list)
      }
    }
    tagcardclickMethodcall = (list) => {

      let newSnapshotId = -1;
      let simOption = null;

      let tagStoreGroup = this.state.dataObj.filter(obj => obj.fieldCount === this.state.fieldCount)

      if(list.snapshotId && list.snapshotId > 0){
        newSnapshotId = list.snapshotId;
        simOption = list.simOption;
      }
    
      this.setState({ 
        tagStoreGroup: tagStoreGroup,
        selectedTagGroup: list,
        tagList: list.tags,
        storeId: -1,
        storeName: "",
        notagid: list.tags.length>0?null:list.id, 
        simreload: false,
        originatedMpId: -1,
        originatedSnapshotId: -1,
        disableChecks: false,
        newSnapshotId:newSnapshotId,
        originatedMpName: null,
        simOption: simOption,
        
      },()=>{
        
        this.toggleOneCategory("close")
        this.setState({simreload: true},()=>{
          this.props.setAuiConvertedetails(null)
        });
      })
    }

    HandleisFixed=(val) => {
      if(this.props.mpstate.mpstackHistory!==null&&this.props.mpstate.mpstackHistory.past.length>0){
        confirmAlert({
            title: this.props.t('UNSAVE_CHANGES'),
            message: (this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {   
                  // this.reSetNewProdsRemoveProdstoPrevious()
                  this.setState({simreload:false,isFixed: val,openOneCategory:false},() => {
                    if(this.state.dataObj && this.state.dataObj.length > 0){
                      this.setState({ simreload:true });
                    }
                  });
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {   
                    return false
                }
            }]
        });
      }else{
        this.setState({simreload:false,isFixed: val,openOneCategory:false},()=>{
          if(this.state.dataObj && this.state.dataObj.length > 0){
            this.setState({ simreload:true });
          }
        });
      }
    }
    // reSetNewProdsRemoveProdstoPrevious=()=>{
    //   if(this.props.mpstate.mpstackHistory!==null&&this.props.mpstate.mpstackHistory.past.length>0){
    //     let mpstackHistory = JSON.parse(JSON.stringify(this.props.mpstate.mpstackHistory));
    //     var clipboardArray=JSON.parse(JSON.stringify(this.props.mpstate.mpClipoardnOther))
       
    //     for (let i = 0; i < clipboardArray.length; i++) {
    //       const clip = clipboardArray[i];
    //       if(clip.catId===mpstackHistory.CatId){
    //         clip.removeprodlist=mpstackHistory.past[0].removeprodlist
    //         clip.addprodlist=mpstackHistory.past[0].addprodlist
    //       }
    //     }
        
    //     this.props.setMpClipBoardsforCats(clipboardArray)
    //   }
    // }

    resetRelogram = (store, taggroup, ischild, subchildType, parentidx, storeidx, tagidx ) => {

      if(this.props.mpstate.mpstackHistory!==null&&this.props.mpstate.mpstackHistory.past.length>0 && store.isReset){
        confirmAlert({
            title: this.props.t('UNSAVE_CHANGES'),
            message: (this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {   
                  // this.reSetNewProdsRemoveProdstoPrevious();
                  this.resetRelogramNextStep(store, taggroup, ischild, subchildType, parentidx, storeidx, tagidx );
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {   
                    return false
                }
            }]
        });
      }else{
        this.resetRelogramNextStep(store, taggroup, ischild, subchildType, parentidx, storeidx, tagidx );
      }

    }

    resetRelogramNextStep = (store, taggroup, ischild, subchildType, parentidx, storeidx, tagidx, _callback ) => {

      this.props.toggleLoadingModal(true);
  
      if(store.isReset && store.isApproved){
        this.changeDataObjCheck(ischild, subchildType, parentidx, storeidx, tagidx, false, undefined, null, true)
      }

      let defSaveObj = this.state.defSaveObj;

      // let reqObj ={
      //   mpId: defSaveObj?defSaveObj.mp_id:0,
      //   storeId: store.id,
      //   fieldCount: this.state.fieldCount,
      //   tags: taggroup.tags
      // }
      let reqObj ={
        mpId: defSaveObj?defSaveObj.mp_id:0,
        resetStores:[
          {
            storeId: store.id,
            fieldCount: this.state.fieldCount,
            tags: taggroup.tags
          }
        ]
      }

      //update isReset of the record in the condisjob table
      submitSets(submitCollection.updateIsReset, reqObj, true).then(res => {
        if(res && res.status){
          alertService.success(this.props.t(!store.isReset ? "RESETTING_TO_CURRENT_VERSION" : "REVERTING_TO_RELOGRAM"));

          if((this.state.isWarnmodaldontSimstore&&this.state.isShowResetWarnModal)){
            
            this.loadData(true,() => {
              this.updatedRelogram(store,taggroup, true);

              if(_callback){
                _callback();
              }
            },false,false,false,null);
          }else{
            //new auto implementation data and redirect to the store
            this.loadData(true,() => {
              this.updatedRelogram(store,taggroup, true);

              if(_callback){
                _callback();
              }
            },false,false,false,store.id);
          }
          
        } else{
          alertService.error(this.props.t("erroroccurred"));
          this.props.toggleLoadingModal(false);
        }
      });

    }

    //update with new relogram data

    updatedRelogram = (store, taggroup, nocheckunsaved) => {

      let newDataObj = this.state.dataObj.map((item)=>item.storesGroupByTags)

      let newtaggroup = newDataObj
      .flatMap((subArray) => subArray)
      .find((obj) => obj.id === taggroup.id);

      let newstore = newtaggroup.connectedStores.concat(newtaggroup.disconnectedStores).find((obj) => obj.id === store.id)

      if((this.state.isWarnmodaldontSimstore&&this.state.isShowResetWarnModal)){
        //nothing happen
      }else{
        this.setStore(newstore, newtaggroup, undefined, undefined, nocheckunsaved);
      }
     

      this.props.toggleLoadingModal(false);

    }

    reloadSimAndStore = (store, taggroup) => {
      this.loadData(true,() => this.updatedRelogram(store,taggroup),false,false,false,store.id);
    }

    reloadSimAndTag = (list) => {

      this.loadData(true,() => this.loadingLatestTagSim(list),false,false,false,null);

    }

    loadingLatestTagSim = (list) => {
      let newDataObj = this.state.dataObj.map((item)=>item.storesGroupByTags)

      let newtaggroup = newDataObj
      .flatMap((subArray) => subArray)
      .find((obj) => obj.id === list.id);

      this.tagcardclickMethodcall(newtaggroup);

      this.props.toggleLoadingModal(false);
    }

    setStore = (store, taggroup, fieldidx, fieldcount, nocheckunsaved) => {

      if(nocheckunsaved){
        this.setStoreMethodCall(store, taggroup, fieldidx, fieldcount);
      }else{
        //marking stackable
       if(this.props.mpstate.mpStackableProdList!==null&&this.props.mpstate.mpStackableProdList.length>0){
         //if have stakable to save
         this.sendmarkStackableCall(null,()=>this.setStoreNextStep(store, taggroup, fieldidx, fieldcount))
       }else{
         this.setStoreNextStep(store, taggroup, fieldidx, fieldcount)
       }
        //marking stackable end
      }
    }

    setStoreNextStep = (store, taggroup, fieldidx, fieldcount) =>{
      if(this.props.mpstate.mpstackHistory!==null&&this.props.mpstate.mpstackHistory.past.length>0){
        confirmAlert({
            title: this.props.t('UNSAVE_CHANGES'),
            message: (this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {   
                  // this.reSetNewProdsRemoveProdstoPrevious();
                  this.setStoreMethodCall(store, taggroup, fieldidx, fieldcount);
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {   
                    return false
                }
            }]
        });
      }else{
        this.setStoreMethodCall(store, taggroup, fieldidx, fieldcount);
      }
    }
    setStoreMethodCall = (store, taggroup, fieldidx, fieldcount) => {
      
      this.setState({
        selectedTagGroup: null,
        tagList: null,
        simreload:false,
        disableChecks: false,
        openIndexes: (fieldidx > -1?fieldidx:this.state.openIndexes), 
        fieldCount: (fieldcount?fieldcount:this.state.fieldCount),
      },()=>{
        this.toggleOneCategory("close")

        let sobj = this.state.defSaveObj;

        let originatedMpId = -1;
        let originatedSnapshotId = -1;
        let originatedMpName = null;
        let newSnapshotId = -1;
        let simOption = null;

        // if(store.snapshotId && store.snapshotId > 0){
        //   newSnapshotId = store.snapshotId;
        //   simOption = store.simOption;
        // }else{
        //   if(!store.isReset){
        //     if(store.originatedMp && store.originatedMp.mpId > 0){
        //         if(sobj.mp_id !== store.originatedMp.mpId){
        //             originatedMpId = store.originatedMp.mpId;
        //             originatedSnapshotId = store.originatedMp.originatedSnapshotId;
        //             originatedMpName = store.originatedMp.mpName;
        //             this.setState({disableChecks: true})
        //         }else{
        //             originatedSnapshotId = store.originatedMp.originatedSnapshotId;
        //             originatedMpName = store.originatedMp.mpName;
        //         }
        //       }
        //     }
        // }
        
        if(!store.isReset){
          if(store.originatedMp && store.originatedMp.mpId > 0){
              if(sobj.mp_id !== store.originatedMp.mpId){
                  originatedMpId = store.originatedMp.mpId;
                  originatedSnapshotId = store.originatedMp.originatedSnapshotId;
                  originatedMpName = store.originatedMp.mpName;
                  this.setState({disableChecks: true})
              }else{
                  originatedSnapshotId = store.snapshotId ? store.snapshotId : store.originatedMp.originatedSnapshotId;
                  originatedMpName = store.originatedMp.mpName;
              }
          } else {
            if(store.snapshotId && store.snapshotId > 0){
              newSnapshotId = store.snapshotId;
            }
          }
        }else{
          if(store.snapshotId && store.snapshotId > 0){
            newSnapshotId = store.snapshotId;
            simOption = store.simOption;
          }
        }

        //get selected field object
        let fieldObjData = this.state.dataObj.filter((d)=>{ return d.fieldCount === this.state.fieldCount; });
        
        this.setState({
          tagStoreGroup: fieldObjData,
          selectedTagGroup: taggroup,
          tagList: taggroup.tags,
          storeId: store.id,
          storeName: store.name,
          newSnapshotId: newSnapshotId,
          originatedMpId: originatedMpId,
          originatedSnapshotId : originatedSnapshotId,
          originatedMpName : originatedMpName,
          simOption : simOption,
          simreload: true,
          isStoreReset: store.isReset,
        },()=>{
          this.props.setAuiConvertedetails(null)
        })
      })
    }

    resetStore = () => {
      this.setState({
        storeId:-1
      })
    }
    hadleAuiMarkImpStoreWarning=(cval)=>{
      this.setState({AuiMarkImpStoreWarning:cval},()=>{
      })
    }
    changeDataObjCheckTrigger=(ischild, subchildType, parentidx, storeidx, tagidx, cval, _callback, noloadingtoggleoff,isFromAuto,ignoremultipleselvalidation)=>{
      
      let cdataobj = this.state.dataObj;
      let haverelolist=[]  
      // let allowmultipleCheck=true
      
      let allstores=[]
      let arrayobj=structuredClone(cdataobj[parentidx])

      if(ignoremultipleselvalidation){
        this.changeDataObjCheckTriggerNext(ischild, subchildType, parentidx, storeidx, tagidx, cval, _callback, noloadingtoggleoff,isFromAuto,ignoremultipleselvalidation)
      }else{
        if((!ischild&&cval)){
          if(this.state.originatedMpId>1){
            alertService.warn(this.props.t("CANNOT_PROCEED_SELECTION_WITHA_RELOGRAM"))
          }else{
            arrayobj.storesGroupByTags.forEach(tgrp => {
              let mergedArray = tgrp.disconnectedStores.concat(tgrp.connectedStores);
  
              allstores=allstores.concat(mergedArray)
            });
    
            allstores.forEach(el => {
              let isPlanogram=this.checkStoreReset(el)
              if(!isPlanogram){
                haverelolist.push(el)
              }
            });
    
            if(cval&&haverelolist.length>0){
              // allowmultipleCheck=false
              this.setState({isShowResetWarnModal:true,resetCheckAvailable:{parentidx:parentidx}})
            }else{
              this.changeDataObjCheckTriggerNext(ischild, subchildType, parentidx, storeidx, tagidx, cval, _callback, noloadingtoggleoff,isFromAuto,ignoremultipleselvalidation)
            }
          }     
        }else{
          this.changeDataObjCheckTriggerNext(ischild, subchildType, parentidx, storeidx, tagidx, cval, _callback, noloadingtoggleoff,isFromAuto,ignoremultipleselvalidation)
        }
      }
      
      

    }
    changeDataObjCheckTriggerNext=(ischild, subchildType, parentidx, storeidx, tagidx, cval, _callback, noloadingtoggleoff,isFromAuto,ignoremultipleselvalidation)=>{
      var ismarkApproveDisconnectcallng=true
      let defSaveObj = this.state.defSaveObj;
      let cdataobj = this.state.dataObj;
      let storelist = [];
      let isSimEditDisabled = this.state.isSimEditDisabled;
      let isSimChangesAvailable = (this.props.mpstate.mpstackHistory !== null && this.props.mpstate.mpstackHistory.past.length > 0);
      // console.log(isSimEditDisabled, isSimChangesAvailable);
      
      if(ischild){
        let cstoreobj = cdataobj[parentidx].storesGroupByTags[storeidx];
        
        let selectedStoreObj = cstoreobj[subchildType][tagidx];
        
        if(!isSimEditDisabled && isSimChangesAvailable && !selectedStoreObj.isApproved){
          alertService.error(this.props.t("You_have_unsaved_changes_please_save_before_continue"));
          return false;
        }

        if(cval && !selectedStoreObj.isReset && selectedStoreObj.originatedMp && selectedStoreObj.originatedMp.mpId > 0 && selectedStoreObj.originatedMp.mpId !== defSaveObj.mp_id){
          // this.showDisabledWarning("reset");
          this.setState({ 
            resetCheckAvailable: { storeidx: storeidx, parentidx: parentidx, tagidx: tagidx, subchildType: subchildType },
          }, () => {
            if(this.state.originatedMpId>0){
              if(selectedStoreObj.originatedMp.mpId===this.state.originatedMpId){
                if(this.state.storeId===selectedStoreObj.id){
                  ismarkApproveDisconnectcallng=false
                  this.setState({islookRelgramandclkIt:true},()=>{
                    this.checktoggleResetProdWarn(selectedStoreObj);//keep exist
                  })
                }else{
                  alertService.warn(this.props.t("DISABLED_CHECK_RESET"))
                }
                
              }else{
                alertService.warn(this.props.t("DISABLED_CHECK_RESET"))
              }
            }else{
              ismarkApproveDisconnectcallng=false
              this.checktoggleResetProdWarn(selectedStoreObj,true)
            }
          });

        } else{
          var allow=true
          if(cval){
            if(selectedStoreObj.originatedMp){
              if(this.state.originatedMpId>0&&!isFromAuto){
                allow=false
                alertService.warn(this.props.t("CANNOT_PROCEED_SELECTION_WITHA_RELOGRAM"))
              }

            }else{
              if(this.state.originatedMpId>0){
                // watch on relogram
                allow=false
                alertService.warn(this.props.t("DISABLED_CHECK_RESET"))
              }
            }
            
          }

          if(allow){
            selectedStoreObj.isApproved = cval;
            cdataobj[parentidx] = this.checkIsStoreApproved(cdataobj[parentidx]);
            
            storelist.push(selectedStoreObj);
          }
        }
      } else{
        let allselstores=this.state.selectedTagGroup.connectedStores.concat(this.state.selectedTagGroup.disconnectedStores)
        var relogramlist=[]
        // let totalstorecount = 0;
        let changedstorecount = 0;

        let fieldItem = cdataobj[parentidx];
        if(!isSimEditDisabled && isSimChangesAvailable && !fieldItem.isApproved){
          alertService.error(this.props.t("You_have_unsaved_changes_please_save_before_continue"));
          return false;
        }

        for (let i = 0; i < cdataobj[parentidx].storesGroupByTags.length; i++) {
          const storeitem = cdataobj[parentidx].storesGroupByTags[i];
          
          storeitem.isApproved = cval;

          for (let j = 0; j < storeitem.connectedStores.length; j++) {
            const tagitem = storeitem.connectedStores[j];

            // if(!cval || this.checkStoreReset(tagitem)){
              // if(tagitem.isDifferentStruc){
              //   tagitem.isApproved = false;
              // }else{
                if(this.state.isfromTagcard){
                  tagitem.isApproved =allselstores.find(x=>x.id===tagitem.id)?cval:!cval
                }else{
                  tagitem.isApproved = cval;
                }
                
              // }
              storelist.push(tagitem);
              changedstorecount++;
            // }

            // totalstorecount++;
          }

          for (let j = 0; j < storeitem.disconnectedStores.length; j++) {
            const tagitem = storeitem.disconnectedStores[j];

            // if(!cval || this.checkStoreReset(tagitem)){
              // if(tagitem.isDifferentStruc){
              //   tagitem.isApproved = false;
              // }else{
                if(this.state.isfromTagcard){
                  tagitem.isApproved =allselstores.find(x=>x.id===tagitem.id)?cval:!cval
                }else{
                  tagitem.isApproved = cval;
                }
                
              // }
              storelist.push(tagitem);
              changedstorecount++;
            // }

            // totalstorecount++;
          }
        }
        var filteredisapproves=storelist.filter(x=>x.isApproved===true)
        filteredisapproves.forEach(element => {
          let isPlanogram=this.checkStoreReset(element)
          if(!isPlanogram){
            relogramlist.push(element)
          }
        });

        if(cval&&relogramlist.length>0){
          // alertService.warn(this.props.t("SOME_STORE_NEEDS_TORESET"));
          this.resetAllRelogramsofthis(relogramlist,cdataobj,parentidx,storelist)
        }
        
        if(changedstorecount > 0){
          cdataobj[parentidx].isApproved = cval;
        }
      }
      //another line have to change if this changes
      var isnodotList=storelist.filter(x=>(x.isTemporaryDot===false&&x.isApproved))
      this.setState({ dataObj: cdataobj ,isfromTagcard:false}, () => {
        if(isnodotList.length>0){
          //disconnect modal
          this.DisconnectWarningcallandaction(isnodotList)
        }
        if(ismarkApproveDisconnectcallng){
          if(this.state.islookRelgramandclkIt){
            this.setState({islookRelgramandclkItobj:{storelist:storelist,noloadingtoggleoff:noloadingtoggleoff}})

          }else{
            this.updateStoreApproveStatus(storelist, false, noloadingtoggleoff); 
          }
          
        }
        this.enableImplementContinue();

        if(_callback){
          _callback();
        }
      });

    }
    updatestoreStatusAftersim=()=>{
      var islookRelgramandclkItobj=this.state.islookRelgramandclkItobj
      this.updateStoreApproveStatus(islookRelgramandclkItobj.storelist, false, islookRelgramandclkItobj.noloadingtoggleof)
      this.setState({islookRelgramandclkItobj:undefined,islookRelgramandclkIt:false})
    }

    // changeDataObjCheckTriggerOld=(ischild, subchildType, parentidx, storeidx, tagidx, cval, _callback, noloadingtoggleoff)=>{
    //   var ismarkApproveDisconnectcallng=true
    //   let defSaveObj = this.state.defSaveObj;
    //   let cdataobj = this.state.dataObj;
    //   let storelist = [];

    //   let isSimEditDisabled = this.state.isSimEditDisabled;
    //   let isSimChangesAvailable = (this.props.mpstate.mpstackHistory !== null && this.props.mpstate.mpstackHistory.past.length > 0);
    //   // console.log(isSimEditDisabled, isSimChangesAvailable);
      
    //   if(ischild){
    //     let cstoreobj = cdataobj[parentidx].storesGroupByTags[storeidx];
        
    //     let selectedStoreObj = cstoreobj[subchildType][tagidx];
        
    //     if(!isSimEditDisabled && isSimChangesAvailable && !selectedStoreObj.isApproved){
    //       alertService.error(this.props.t("You_have_unsaved_changes_please_save_before_continue"));
    //       return false;
    //     }

    //     if(cval && !selectedStoreObj.isReset && selectedStoreObj.originatedMp && selectedStoreObj.originatedMp.mpId > 0 && selectedStoreObj.originatedMp.mpId !== defSaveObj.mp_id){
    //       // this.showDisabledWarning("reset");
    //       this.setState({ 
    //         resetCheckAvailable: { storeidx: storeidx, parentidx: parentidx, tagidx: tagidx, subchildType: subchildType },
    //       }, () => {
    //         if(this.state.originatedMpId>0){
    //           if(selectedStoreObj.originatedMp.mpId===this.state.originatedMpId){
    //             if(this.state.storeId===selectedStoreObj.id){
    //               ismarkApproveDisconnectcallng=false
    //               this.checktoggleResetProdWarn(selectedStoreObj);//keep exist
    //             }else{
    //               alertService.warn(this.props.t("DISABLED_CHECK_RESET"))
    //             }
                
    //           }else{
    //             alertService.warn(this.props.t("DISABLED_CHECK_RESET"))
    //           }
    //         }else{
    //           ismarkApproveDisconnectcallng=false
    //           this.checktoggleResetProdWarn(selectedStoreObj,true)
    //         }
    //       });

    //     } else{
    //       var allow=true
    //       if(cval){
    //         if(selectedStoreObj.originatedMp){
    //           if(this.state.originatedMpId>0){
    //             allow=false
    //             alertService.warn(this.props.t("CANNOT_PROCEED_SELECTION_WITHA_RELOGRAM"))
    //           }

    //         }else{
    //           if(this.state.originatedMpId>0){
    //             // watch on relogram
    //             allow=false
    //             alertService.warn(this.props.t("DISABLED_CHECK_RESET"))
    //           }
    //         }
            
    //       }

    //       if(allow){
    //         selectedStoreObj.isApproved = cval;
    //         cdataobj[parentidx] = this.checkIsStoreApproved(cdataobj[parentidx]);
            
    //         storelist.push(selectedStoreObj);
    //       }
    //     }
    //   } else{
    //     let totalstorecount = 0;
    //     let changedstorecount = 0;

    //     let fieldItem = cdataobj[parentidx];
    //     if(!isSimEditDisabled && isSimChangesAvailable && !fieldItem.isApproved){
    //       alertService.error(this.props.t("You_have_unsaved_changes_please_save_before_continue"));
    //       return false;
    //     }

    //     for (let i = 0; i < cdataobj[parentidx].storesGroupByTags.length; i++) {
    //       const storeitem = cdataobj[parentidx].storesGroupByTags[i];
          
    //       storeitem.isApproved = cval;

    //       for (let j = 0; j < storeitem.connectedStores.length; j++) {
    //         const tagitem = storeitem.connectedStores[j];

    //         if(!cval || this.checkStoreReset(tagitem)){
    //           // if(tagitem.isDifferentStruc){
    //           //   tagitem.isApproved = false;
    //           // }else{
    //             tagitem.isApproved = cval;
    //           // }
    //           storelist.push(tagitem);
    //           changedstorecount++;
    //         }

    //         totalstorecount++;
    //       }

    //       for (let j = 0; j < storeitem.disconnectedStores.length; j++) {
    //         const tagitem = storeitem.disconnectedStores[j];

    //         if(!cval || this.checkStoreReset(tagitem)){
    //           // if(tagitem.isDifferentStruc){
    //           //   tagitem.isApproved = false;
    //           // }else{
    //             tagitem.isApproved = cval;
    //           // }
    //           storelist.push(tagitem);
    //           changedstorecount++;
    //         }

    //         totalstorecount++;
    //       }
    //     }

    //     if(totalstorecount !== changedstorecount){
    //       alertService.warn(this.props.t("SOME_STORE_NEEDS_TORESET"));
    //     }
        
    //     if(changedstorecount > 0){
    //       cdataobj[parentidx].isApproved = cval;
    //     }
    //   }
    //   //another line have to change if this changes
    //   var isnodotList=storelist.filter(x=>(x.isTemporaryDot===false&&x.isApproved))
    //   this.setState({ dataObj: cdataobj }, () => {
    //     if(isnodotList.length>0){
    //       //disconnect modal
    //       this.DisconnectWarningcallandaction(isnodotList)
    //     }
    //     if(ismarkApproveDisconnectcallng){
    //       this.updateStoreApproveStatus(storelist, false, noloadingtoggleoff); 
    //     }
    //     this.enableImplementContinue();

    //     if(_callback){
    //       _callback();
    //     }
    //   });
    // }
    checktoggleResetProdWarn=(selectedStoreObj,isDontsimstore)=>{
      if(isDontsimstore){
        this.setState({isWarnmodaldontSimstore:true})
      }
      this.toggleResetProdWarn(true);
    }
    // sendDisconnectWarningcallandaction=(storeid,ischild, subchildType, parentidx, storeidx, tagidx, cval, _callback)=>{
    //   var storelistsel=this.getselstorelistDataObjCheck(ischild, subchildType, parentidx, storeidx, tagidx, cval, _callback)
    //   this.setState({isLoading:true},()=>{
    //     var saveobj={
    //       // storeId: storeid,
    //       storeIds:storelistsel,
    //       mpId: this.props.defSaveObj?this.props.defSaveObj.mp_id:-1
    //     }
    //     submitSets(submitCollection.disconnectWarning, saveobj, true).then(res => {
    //       this.setState({isLoading:false})
    //       if(res && res.status){
    //         if(res.extra.length>0){
    //           this.handlewillwarningDetails(res.extra)
    //           // this.handlewillwarningDetails(conflictprodres.extra)
             
    //         }else{
    //           this.changeDataObjCheckTrigger(ischild, subchildType, parentidx, storeidx, tagidx, cval, _callback)
    //         }
    //           // alertService.success(this.props.t("SUCCESSFULLY_UPDATED"));
    //       } else{
    //         alertService.error(res.extra?res.extra:this.props.t("erroroccurred"));
            
    //       }
    //     });
    //   })
      
    // }
    
    DisconnectWarningcallandaction=(store)=>{
      var storelistsel=store.map((item) => item.id)
      let defsaveobj = this.state.defSaveObj;
      this.setState({isLoading:true},()=>{
        var saveobj={
          // storeId: storeid,
          storeIds:storelistsel,
          mpId: defsaveobj?defsaveobj.mp_id:-1
          // mpId: this.props.defSaveObj?this.props.defSaveObj.mp_id:-1
        }
        submitSets(submitCollection.disconnectWarning, saveobj, true, null, true).then(res => {
          this.setState({isLoading:false})
          if(res && res.status){
            if(res.extra.length>0){
              this.handlewillwarningDetails(res.extra)
             
            }
          } else{
            // alertService.error(res.extra?res.extra:this.props.t("erroroccurred"));
            
            }
          });
        }
      )
      
    }
    getselstorelistDataObjCheck=(ischild, subchildType, parentidx, storeidx, tagidx, cval, _callback)=>{
      let cdataobj = this.state.dataObj;
      let storelist = [];
      if(ischild){
        let cstoreobj = cdataobj[parentidx].storesGroupByTags[storeidx];

        cstoreobj[subchildType][tagidx].isApproved = cval;
        cdataobj[parentidx] = this.checkIsStoreApproved(cdataobj[parentidx]);
        
        storelist.push(cstoreobj[subchildType][tagidx].id);
      } else{
        cdataobj[parentidx].isApproved = cval;

        for (let i = 0; i < cdataobj[parentidx].storesGroupByTags.length; i++) {
          const storeitem = cdataobj[parentidx].storesGroupByTags[i];
          storeitem.isApproved = cval;

          for (let j = 0; j < storeitem.connectedStores.length; j++) {
            const tagitem = storeitem.connectedStores[j];
            // if(tagitem.isDifferentStruc){
            //   tagitem.isApproved = false;
            // }else{
              tagitem.isApproved = cval;
            // }
            storelist.push(tagitem.id);
          }

          for (let j = 0; j < storeitem.disconnectedStores.length; j++) {
            const tagitem = storeitem.disconnectedStores[j];
            // if(tagitem.isDifferentStruc){
            //   tagitem.isApproved = false;
            // }else{
              tagitem.isApproved = cval;
            // }
            storelist.push(tagitem.id);
          }
        }
      }

      return storelist
    }
    handlemarkselectingconflictmodal=(idx,type)=>{
      var array=this.state.disconnectWarningobj
      for (let i = 0; i < array.length; i++) {
        const store = array[i];
        if(store.storeName===this.state.selectedstorecon.storeName){
          var obj=store
          obj[type][idx]["isSelected"]=obj[type][idx].isSelected?!(obj[type][idx].isSelected):true
        }
        
      }
     
      // console.log(obj[type][idx])
      this.setState({disconnectWarningobj:array})
    }
    handlemarkselectingconflictmodalAll=(idx,type)=>{
      var array=this.state.disconnectWarningobj
      for (let i = 0; i < array.length; i++) {
        const store = array[i];
       
        if(store.storeId===this.state.selectedstorecon.storeId){
          //if not work make to var
          let obj=store
          obj["selectAll"]=!obj.selectAll
          obj.oldToNewList.forEach(element => {
            element["isSelected"]=obj.selectAll
          });
          obj.newToOldList.forEach(element => {
            element["isSelected"]=obj.selectAll
          });
          obj.commonList.forEach(element => {
            element["isSelected"]=obj.selectAll
          });
        }
        
      }
     
      // console.log(obj[type][idx])
      this.setState({disconnectWarningobj:array})
    }
    handlewillwarningDetails=(res)=>{
      var array=res
      for (let i = 0; i < array.length; i++) {
        const obj = array[i];
        var oldToNewList=[]
        var newToOldList=[]
        var commonList=[]
        for (let i = 0; i < obj.productList.length; i++) {
          const proditem = obj.productList[i];
          if(proditem.updatingType==="oldToNew"){
            oldToNewList=oldToNewList.concat(proditem)
          }else if(proditem.updatingType==="newToOld"){
            newToOldList=newToOldList.concat(proditem)
          }else {
            commonList=commonList.concat(proditem)
          }
          
        }

        obj.oldToNewList=oldToNewList
        obj.newToOldList=newToOldList
        obj.commonList=commonList
          
      }
      
      this.setState({disconnectWarningobj:array,selectedstorecon:array[0]})
      this.hadleAuiMarkImpStoreWarning(true)
    }
    //change and update field and store tag
    changeDataObjCheck = (ischild, subchildType, parentidx, storeidx, tagidx, cval, _callback,storeid, noloadingtoggleoff,isFromAuto) => {
      // var isdotmain=cval&&this.state.dataObj[parentidx].isDot
      //this should remove popoup to modal
      // if(cval&&(subchildType?(subchildType==="disconnectedStores"):false)){
      // if(isdotmain){
      //   this.sendDisconnectWarningcallandaction(storeid,ischild, subchildType, parentidx, storeidx, tagidx, cval, _callback)

      // }else{
        this.changeDataObjCheckTrigger(ischild, subchildType, parentidx, storeidx, tagidx, cval, _callback, noloadingtoggleoff,isFromAuto)
      // }
      
    }

    //check store needs to reset
    checkStoreReset = (store) => {
      let defsaveobj = this.state.defSaveObj;
      return (store.isReset || (store.originatedMp && store.originatedMp.mpId === null) || (store.originatedMp && store.originatedMp.mpId > 0 && store.originatedMp.mpId === defsaveobj.mp_id));
    }

    //continue implementation process
    toggleContinueImpleModal = (iscontinue, isback, backobj) => {
      this.setState({ isShowContImpleModal: !this.state.isShowContImpleModal}, () => {
        if(iscontinue === true){
          if(isback){
            this.setState({ 
              dataObj: backobj
            });
          } else{
            this.continueImplementUpdate();
          }
        }
      });
    }
    //update approval status
    updateStoreApproveStatus = (storelist, iscontinueimplem, noloadingtoggleoff) => {
      //console.log(storelist);
      this.props.toggleLoadingModal((iscontinueimplem ? true : noloadingtoggleoff ? true : false), () => {
        let defsaveobj = this.state.defSaveObj;

        let newstorelist = [];
        for (let i = 0; i < storelist.length; i++) {
          const storeitem = storelist[i];

          let searchObj;
          
          if(this.state.simulationObj){
            if(this.state.simulationObj.simulationSnapshotId > -1){
              searchObj = {
                "snapshotId": this.state.simulationObj.simulationSnapshotId
              }
            }else{
              searchObj = {
                "mpId": this.state.simulationObj.searchDto.mpId,
                "selectedTagsId": this.state.simulationObj.searchDto.selectedTagsId,
                "fieldCount": this.state.simulationObj.searchDto.fieldCount,
                "storeId": this.state.simulationObj.searchDto.storeId,
                "isPrioratizeUserPercentage":this.state.simulationObj.searchDto.isPrioratizeUserPercentage,
              }
            }
          }
          
          newstorelist.push({ storeId: storeitem.id, isApproved: storeitem.isApproved, isReApproved: storeitem.isReApproved, searchObj:searchObj });
        }

        if(newstorelist.length>0){
          let saveobj = {
            mpId: (defsaveobj?defsaveobj.mp_id:0),
            approvalType: markSimUpdateTypes.ReApproval,
            stores: newstorelist
          }
  
          submitSets(submitCollection.markApproveDisconnect, saveobj, true).then(res => {
              if(res && res.status){
                  // alertService.success(this.props.t("SUCCESSFULLY_UPDATED"));
                  if(iscontinueimplem){
                    this.loadData(false, null, true, true, false, null, true);
                  }
              } else{
                this.props.toggleLoadingModal(false);
              }
          }); 
        } 
      });
    }

  //toggle category missing warning modal
  toggleCatAssignWarn = (iscontinue,type) => {
    this.setState({ showCatAssignWarn: !this.state.showCatAssignWarn }, () => {
      if(type==="letsgo"){
        this.triggerisleAllocationModal(true)
      }
    });
  }
  //toggle disconnected stores warning modal
  toggleDisStoreWarn = (iscontinue) => {
    this.setState({ showDisStoreSelWarn: !this.state.showDisStoreSelWarn }, () => {
      if(iscontinue){
        this.toggleContinueImpleModal();
      }
    });
  }
  //toggle Tags warning modal
  toggleTagWarn = (iscontinue, isclick) => {
    this.setState({ showTagWarn: !this.state.showTagWarn }, () => {
      if(iscontinue){
        if(this.contCheckDisAvailable()){
          this.toggleDisStoreWarn();
        } else{
          this.continueImplementUpdate();
        }
      } else if(isclick){
        //remove disconnected once and continue implement
        this.checkOtherThanMixtag();
      }
    });
  }

  //check dis available
  contCheckDisAvailable = () => {
    let isDisconSelected = false;
    let cdataobj = this.state.dataObj;
    
    for (let i = 0; i < cdataobj.length; i++) {
      const fieldobj = cdataobj[i];

      for (let j = 0; j < fieldobj.storesGroupByTags.length; j++) {
        const storeobj = fieldobj.storesGroupByTags[j];
        
        for (let l = 0; l < storeobj.disconnectedStores.length; l++) {
          const disconstore = storeobj.disconnectedStores[l];
          
          if(disconstore.isApproved){
            if(!disconstore.isDifferentShelfStruc || (disconstore.isDifferentShelfStruc && disconstore.isForced)){
              isDisconSelected = true;
            }
          }
        }
      }
    }

    return isDisconSelected;    
  }

  //check mix tag not available stores
  checkOtherThanMixtag = () => {
    let mixlist = this.state.newData;
    let dataobj = JSON.parse(JSON.stringify(this.state.continueDataObj));

    let isNoMixTagAvailable = false;
    let storList = [];

    //console.log(dataobj);
    for (let i = 0; i < dataobj.length; i++) {
      const fieldobj = dataobj[i];
      // console.log(fieldobj);
      
      if(fieldobj.prevApproved){
        let isFoundInMixTag = mixlist.find(x => x.fieldCount === fieldobj.fieldCount);

        if(isFoundInMixTag){
          if(isFoundInMixTag.mixTags){
            for (let j = 0; j < fieldobj.storesGroupByTags.length; j++) {
              const taggroup = fieldobj.storesGroupByTags[j];
              
              for (let l = 0; l < taggroup.connectedStores.length; l++) {
                const constore = taggroup.connectedStores[l];
                
                if(constore.isApproved) {
                  constore.isApproved = false;
                  storList.push(constore);
                }
              }

              for (let l = 0; l < taggroup.disconnectedStores.length; l++) {
                const disconstore = taggroup.disconnectedStores[l];
                
                if(disconstore.isApproved) {
                  disconstore.isApproved = false;
                  storList.push(disconstore);
                }
              }
            }  
          } else{
            isNoMixTagAvailable = true;
          }
        
        }
      }
    }
    //console.log(mixlist);

    //console.log(isNoMixTagAvailable, storList, mixlist);
    this.setState({ continueDataObj: dataobj }, () => {
      if(isNoMixTagAvailable){
        this.updateStoreApproveStatus(storList, true);
      }  
    });
    
  }

  triggerisleAllocationModal=(val)=>{
    this.setState({IsIsleAllocationModal:val})
  }

  changeAUIVersion = (changever) => {
    this.setState({ originatedMp: -1, originatedMpName: null, originatedSnapshotId: -1 })
    // console.log(changever);
    this.triggerSimulation(changever, true);
  }

  arraysAreSimilar = (array) => {

    let n = array.length;
    let result = false;
    
    if (n <= 1) {
      result = true;
    } else {
      let firstElement = JSON.stringify(array[0]);
      result = array.every(function(element) {
        return JSON.stringify(element) === firstElement;
      });
      
    }
    return result;
  }

  implementBtn = ()=>{
    var issendOssemcall=this.props.signedobj.signinDetails&&this.props.signedobj.signinDetails.isOssemOn&&this.props.signedobj.signinDetails.isOssemOn?true:false;
    //check sim edit enabled
    let isSimEditDisabled = this.state.isSimEditDisabled;
    let isSimChangesAvailable = (this.props.mpstate.mpstackHistory !== null && this.props.mpstate.mpstackHistory.past.length > 0);
    // console.log(isSimEditDisabled, isSimChangesAvailable);

    if(!isSimEditDisabled && !isSimChangesAvailable){
      if(issendOssemcall){
        this.props.toggleLoadingModal(true,()=>{
          submitSets(submitCollection.saveComparePlanogramAndSimulation, { id: this.state.sobj.mpId}, true).then(res => {
            if(res && res.status){
              this.props.toggleLoadingModal(false);
              this.implementContinue();
            } else{
              this.props.toggleLoadingModal(false);
            }
          })
        })
      }else{
        this.implementContinue()
      }
    } else{
      alertService.error(this.props.t("You_have_unsaved_changes_please_save_before_continue"));
    }
  }

  //implementation continue modal
  implementContinue = (isignoredifffield) => {
    this.props.toggleLoadingModal(true, () => {
      this.loadData(true, () => {
        this.props.toggleLoadingModal(false);
        
        let cdataobj = structuredClone(this.state.dataObj);
        // console.log(cdataobj);
        
        let isDisconSelected = false;
        // let isDisAvailable = false;
        let selDisCount = 0;
        let isMixTags = false;

        let uniquedunits = [];
        
        for (let i = 0; i < cdataobj.length; i++) {
          const fieldobj = cdataobj[i];

          let isfieldprevapprove = false;
          let isfieldDisconSelected = false;
          let showingTagsList = [];

          for (let j = 0; j < fieldobj.storesGroupByTags.length; j++) {
            const storeobj = fieldobj.storesGroupByTags[j];
            
            let isShowInImplem = false;
            let isprevapprove = false;
            let istagsshow = false;

            for (let l = 0; l < storeobj.disconnectedStores.length; l++) {
              const disconstore = storeobj.disconnectedStores[l];
              
              if(disconstore.isApproved){
                if(!disconstore.isDifferentShelfStruc || (disconstore.isDifferentShelfStruc && disconstore.isForced)){
                  isDisconSelected = true;
                  isfieldDisconSelected = true;

                  isShowInImplem = true;
                  istagsshow = true;
                }

                if(disconstore.isDifferentShelfStruc){
                  disconstore["storeId"] = disconstore.id;
                  uniquedunits.push(disconstore);
                }

                if(!disconstore.isReApproved){
                  selDisCount = (selDisCount + 1);
                }
                
                // disconstore["isReApproved"] = false;
                disconstore["prevApproved"] = true;

                isprevapprove = true;
                // isDisAvailable = true;
              } else{
                disconstore["prevApproved"] = false;
              }
            }

            for (let l = 0; l < storeobj.connectedStores.length; l++) {
              const constore = storeobj.connectedStores[l];

              if(constore.isApproved){
                constore["prevApproved"] = true;
                isprevapprove = true;
              }
            }

            // storeobj["isReApproved"] = false;
            if(istagsshow){
              showingTagsList = showingTagsList.concat(storeobj.tags);
            }

            storeobj["prevApproved"] = isprevapprove;
            storeobj["isShowInImplement"] = isShowInImplem;

            if(storeobj.prevApproved){
              isfieldprevapprove = true;
            }
          }

          //remove duplicates
          let noduptaglist = [];
          for (let z = 0; z < showingTagsList.length; z++) {
            const tagitem = showingTagsList[z];
            let isalreadyadded = noduptaglist.findIndex(x => x.id === tagitem.id);
            
            if(isalreadyadded === -1){
              noduptaglist.push(tagitem);
            }
          }
          showingTagsList = noduptaglist;

          fieldobj["showingTagsList"] = showingTagsList;
          fieldobj["isFieldDisconSelected"] = isfieldDisconSelected;

          // fieldobj["isReApproved"] = false;
          fieldobj["prevApproved"] = isfieldprevapprove;
        }
        // console.log(cdataobj);
        
        // Filter store Tags according to fields
        let notdiffapprovals = false;

        let otherApproveCount = 0;
        
        let oj = cdataobj.map((item) => {
          const storeTagMap = {};
          
          item.storesGroupByTags.forEach((storeGroup) => {
            storeGroup.disconnectedStores.forEach((store) => {
              if (store.isApproved) {
                if(!store.isDifferentShelfStruc || (store.isDifferentShelfStruc && store.isForced)){
                  if (storeGroup.tags.length > 0) {
                    storeGroup.tags.forEach((tag) => {
                      if (!storeTagMap[store.id]) {
                        storeTagMap[store.id] = {
                          storeID: store.id,
                          tags: [{ id: tag.id, name: tag.name }],
                        };
                      } else {
                        storeTagMap[store.id].tags.push({
                          id: tag.id,
                          name: tag.name,
                        });
                      }
                    });
                  } else {
                    storeTagMap[store.id] = {
                      storeID: store.id,
                      tags: [{ noTag: "noTag" }],
                    };
                  }  
                }
                
                if(!store.isDifferentShelfStruc){
                  notdiffapprovals = true;
                }
              }
            });
            storeGroup.connectedStores.forEach((store) => {
              if (store.isApproved) {
                if (storeGroup.tags.length > 0) {
                  storeGroup.tags.forEach((tag) => {
                    if (!storeTagMap[store.id]) {
                      storeTagMap[store.id] = {
                        storeID: store.id,
                        tags: [{ id: tag.id, name: tag.name }],
                      };
                    } else {
                      storeTagMap[store.id].tags.push({
                        id: tag.id,
                        name: tag.name,
                      });
                    }
                  });
                } else {
                  storeTagMap[store.id] = {
                    storeID: store.id,
                    tags: [{ noTag: "noTag" }],
                  };
                }

                if(!store.isDifferentShelfStruc){
                  notdiffapprovals = true;
                }

                otherApproveCount = (otherApproveCount + 1);
              }
            });
          });

          const tagArray = Object.values(storeTagMap);
            return { fieldCount: item.fieldCount, stores: tagArray };
          });

          // filter mixtags
          let haveMix = oj.map(obj => {
              let mixTags = false;
        
              if(obj.stores.length > 0){
        
                let Alltags = [];
                for (let i = 0; i < obj.stores.length; i++) {
                  const store = obj.stores[i];
                  
                  Alltags.push(store.tags);
                }
        
                let haveSim = this.arraysAreSimilar(Alltags);

                if(haveSim){
                    mixTags = false;
                }else{
                    mixTags = true;
                }
        
              }else{
                  mixTags = false;
              }
              return { fieldCount: obj.fieldCount, mixTags };
          });
    
          for (let i = 0; i < haveMix.length; i++) {
            if (haveMix[i].mixTags === true) {
              isMixTags = true;
            }
          }

      /* let filternofieldcounts = this.state.noFieldEditList.filter(x => x.fieldCount > 0);
      if(filternofieldcounts && filternofieldcounts.length > 0){
        otherApproveCount = (otherApproveCount + filternofieldcounts.length);
      } */

      // console.log(haveMix);

        this.setState({ 
          continueDataObj: cdataobj, 
          totalDisStoreCount: selDisCount,
          newData: haveMix,
          isNonDiffAvailable: notdiffapprovals,
          uniqueDunitList: uniquedunits,
          otherApproveCount: otherApproveCount
        }, () => {
            if(!isignoredifffield && uniquedunits.length > 0){ //if different field structure stores approved
              //open diff field structure edit modal
              this.handleToggleUniqueDunits(true);
            } else if(this.state.group === "fields" && isMixTags){
              this.toggleTagWarn();
            } else if(isDisconSelected){
              this.toggleDisStoreWarn();
            }/*  else if(isDisAvailable){
              this.toggleContinueImpleModal();
            } */ 
            else{
              this.continueImplementUpdate();
            }  
        });  
      });
    });
    
  }
  //implementation update changes
  continueImplementUpdate = () => {
    // console.log(this.state.dataObj);

    this.props.toggleLoadingModal(true, () => {
      let csaveobj = this.state.defSaveObj;
      let sobj = { mpId: csaveobj.mp_id };

      submitSets(submitCollection.loadImplementingStores,sobj, true).then(res => {
        if (res && res.status && res.extra && res.extra.length > 0){
          this.compareImpleStores(res.extra);
        } else{
          this.setState({ implemAisleStores: [] });
          this.updateImplementData();
        }

        this.props.toggleLoadingModal(false);
      })
    })

    // this.toggleCatAssignWarn();
  }
  //compare implem
  compareImpleStores = (loadedstores) => {
    let multiStoreList = loadedstores.filter(x => x.aisleCount > 1);
    
    if(multiStoreList && multiStoreList.length > 0){
      for (let i = 0; i < multiStoreList.length; i++) {
        const storeobj = multiStoreList[i];
        
        for (let j = 0; j < this.state.dataObj.length; j++) {
          const fieldObj = this.state.dataObj[j];
          
          for (let l = 0; l < fieldObj.storesGroupByTags.length; l++) {
            const tagObj = fieldObj.storesGroupByTags[l];
            
            let isFoundStore = tagObj.disconnectedStores.find(x => x.id === storeobj.storeId);
            if(isFoundStore){
              storeobj["fieldCount"] = fieldObj.fieldCount;
            }
            
            let isConFoundStore = tagObj.connectedStores.find(x => x.id === storeobj.storeId);
            if(isConFoundStore){
              storeobj["fieldCount"] = fieldObj.fieldCount;
            }
          }
        }

      }

      this.setState({ implemAisleStores: multiStoreList }, () => {
        this.toggleCatAssignWarn();
      });
    } else{
      this.setState({ implemAisleStores: [] });
      this.updateImplementData();
    }
  }
  //update view changes
  updateImplementData = (updatetype) => {
    let  sobj = {
        mpId : this.state.sobj.mpId?this.state.sobj.mpId:0,
        type: (updatetype?updatetype:"NORMAL"),
    }
  
    submitSets(submitCollection.auiImplementation,sobj, true, null, true).then(res => {
        if (res && res.status){
          if(res.extra && res.extra.cantContinue){
            let issuestores = (res.extra.stores && res.extra.stores.length > 0?res.extra.stores:[]);
            if(issuestores.length > 0){
              this.setState({ issueStoreList: issuestores }, () => {
                  this.handleToggleIssueStores(true);
              });
            }
          } else{
            this.toggleImplemSucMsg();
          }
        } else{
          // alertService.error(res.status === false && res.extra && res.extra !== ""?res.extra:this.props.t("erroroccurred"));
        }
    });
  }
  //implementation success message
  toggleImplemSucMsg = () => {
    this.setState({ showImplemSucMsg: !this.state.showImplemSucMsg }, () => {
      if(!this.state.showImplemSucMsg){
        this.haneleSidebar();
      }
    });
  }
  //enable implement btn if connected or disconnected stores approved
  enableImplementContinue = () => {
    let isApprovedAvailble = false;
    let dataobj = this.state.dataObj;
    for (let i = 0; i < dataobj.length; i++) {
      const fieldobj = dataobj[i];

      let isfieldactive = false;
      for (let j = 0; j < fieldobj.storesGroupByTags.length; j++) {
        const storegroup = fieldobj.storesGroupByTags[j];
        
        let conapproved = storegroup.connectedStores.filter(x => x.isApproved === true);
        let disconapproved = storegroup.disconnectedStores.filter(x => x.isApproved === true);

        if(conapproved.length > 0 || disconapproved.length > 0){
          isApprovedAvailble = true;
        }

        if(storegroup.connectedStores && storegroup.connectedStores.length > 0){
          isfieldactive = true;
        }
      }
      fieldobj["isActive"] = isfieldactive;
    }

    /* let filternofieldcounts = this.state.noFieldEditList.filter(x => x.fieldCount > 0);
    if(filternofieldcounts && filternofieldcounts.length > 0){
      isApprovedAvailble = true;
    } */
    
    this.setState({ isEnableImplement: isApprovedAvailble, dataObj: dataobj });
  }
  //toggle no fields edit modal
  handleToggleNoFields = (isshow, isupdated) => {
    this.setState({ showNofieldsEdit: isshow }, () => {
      if(isupdated){
        this.loadData(false, null, true, false, true);
      }
    });
  }
  //toggle unique dunit edit modal
  handleToggleUniqueDunits = (isshow, iscontinue) => {
    this.setState({ showUniqueDunitEdit: isshow }, () => {
      if(iscontinue){
        this.props.toggleLoadingModal(true, () => {
          this.loadData(false, null, true, true);
        });
      }
    });
  }

  checkForStoresWithoutDiffStruc = (storeGroupsByTags) =>{
    let sum = 0;

    for(let obj of storeGroupsByTags){
      for(let store of obj.connectedStores){
        if (!store.isDifferentStruc) {
          sum += 1;
        }
      }
      
      for(let store of obj.disconnectedStores){
        if (!store.isDifferentStruc) {
          sum += 1;
        }
      }
    }

    if(sum === 0){
      return true;
    }else{
      return false;
    }
  }

  disableSalesCycle = (val) => {

    if(val === true){
      this.setState({ disableSalesCycle: val, isSalesCycle: false });
    }else{
      this.setState({ disableSalesCycle: val});
    }
  }
  //toggle new product view
  toggleNewProd = (viewtype) => {
    if(viewtype){
      this.getNewProdCount();
    }

    this.setState({ isShowNewProds: viewtype, }, () => {
      //if toggling back to simulation view 
      if(!viewtype){
        this.setState({ simreload: false, openOneCategory: false}, () => {
          this.setState({ simreload: true });
        });
      }
    });
  }

  handleToggleIssueStores = (isshow) => {
    this.setState({ showIssueStores: isshow });
  }

  //load all categories
  loadAllCategories = () => {
    /* let defsaveobj = this.props.defSaveObj;
    var obj = { chainHasDepartmentId: (defsaveobj?defsaveobj.department.department_id:0), isReqPagination:false};

    submitSets(submitCollection.mpCategoryList, obj).then(resp => {
      if(resp && resp.status){
        let arr = [{value:-1, label: this.props.t("any_category")}];
        for (let i = 0; i < resp.extra.length; i++) {
            arr.push({
              value: resp.extra[i].categoryId, 
              label: resp.extra[i].categoryName,
              obj: resp.extra[i]
            });
        }
        this.setState({ allCatList: arr });
      } 
    }); */

    let arr = [{value:-1, label: this.props.t("any_category")}];
    for (let i = 0; i < this.props.loadedCatsList.length; i++) {
      let viewobj = this.props.loadedCatsList[i].obj;
      
      arr.push({
        value: viewobj.categoryId, 
        label: viewobj.categoryName,
        obj: viewobj
      });
    }

    this.setState({ allCatList: arr });
  }

  //load all brands
  loadAllBrands = () => {
    let sobj = {isReqPagination:false }
    submitSets(submitCollection.findAllBrands, sobj).then(res => {
        if(res && res.status){
            let brnd = res.extra; 
            let tempbrands = [{value : -1, label: this.props.t("any_brand")}];
            for (let i = 0; i < brnd.length; i++) {
                tempbrands.push({value :brnd[i].brandId, label:brnd[i].brandName, obj: brnd[i] });
            }

            this.setState({ allBrandsList: tempbrands });
        } 
    });
  }

  //load all versions
  loadAllVersions = () => {
    let defsaveobj = this.props.defSaveObj;
    let sobj = { departmentId: (defsaveobj?defsaveobj.department.department_id:0) };

    submitSets(submitCollection.mpVersionList, sobj).then(res => {
      if(res && res.status){
        this.setState({ allVersionsList: (res.extra && res.extra.length > 0?res.extra:[]) });
      } 
    });
  }

  getNewProdCount = () => {
    let defsaveobj = this.props.defSaveObj;
    let sobj = { departmentId: (defsaveobj?defsaveobj.department.department_id:0) };
    submitSets(submitCollection.countNewProducts, sobj).then(res => {
        if(res && res.status){
            this.setState({ newProdsCount: res.count });
        } 
    });
  }
  tagGroupSwitchClick=(evt, parentobj, tgidx, cval)=>{
    evt.stopPropagation();
    let cdataobj = this.state.dataObj;
    let parentidx = cdataobj.findIndex(x => x.fieldCount === parentobj.fieldCount);
    const storeitem = cdataobj[parentidx].storesGroupByTags[tgidx];
    let newrelos=[]
    let allstores=storeitem.connectedStores.concat(storeitem.disconnectedStores)
    if(cval){
      allstores.forEach(element => {
        let isPlanogram=this.checkStoreReset(element)
        if(!isPlanogram){
          newrelos.push(element)
        }
      });
      if(newrelos.length>0){
        this.setState({isShowResetWarnModal:true,resetCheckAvailable:{parentidx:parentidx},isfromTagcard:true})
      }else{
         this.tagGroupSwitchClickNext(evt, parentobj, tgidx, cval)
      }
    }else{
      this.tagGroupSwitchClickNext(evt, parentobj, tgidx, cval)
    }
  }
  //onclick tag switch
  tagGroupSwitchClickNext = (evt, parentobj, tgidx, cval) => {
    // console.log(parentidx, tgidx, cval);
    // evt.stopPropagation();
    var relogramlist=[]
    let cdataobj = this.state.dataObj;
    let parentidx = cdataobj.findIndex(x => x.fieldCount === parentobj.fieldCount);
    let storelist = [];
    
    const storeitem = cdataobj[parentidx].storesGroupByTags[tgidx];
    storeitem.isApproved = cval;

    for (let j = 0; j < storeitem.connectedStores.length; j++) {
      const tagitem = storeitem.connectedStores[j];
      tagitem.isApproved = cval;

      storelist.push(tagitem);
    }

    for (let j = 0; j < storeitem.disconnectedStores.length; j++) {
      const tagitem = storeitem.disconnectedStores[j];
      tagitem.isApproved = cval;

      storelist.push(tagitem);
    }

    storelist.forEach(element => {
      let isPlanogram=this.checkStoreReset(element)
      if(!isPlanogram){
        relogramlist.push(element)
      }
    });

   
      if(cval&&relogramlist.length>0){
        alertService.warn(this.props.t("SOME_STORE_NEEDS_TORESET"));
        this.resetAllRelogramsofthis(relogramlist,cdataobj,parentidx,storelist,true)
      }else{
        this.continuemarkingstores(cdataobj,parentidx,storelist)
      }
   
  }
  continuemarkingstores=(cdataobj,parentidx,storelist)=>{
    let approvedcount = cdataobj[parentidx].storesGroupByTags.filter(x => x.isApproved);
    cdataobj[parentidx].isApproved = (approvedcount.length === cdataobj[parentidx].storesGroupByTags.length);
    //another line have to change if this changes
    var isnodotList=storelist.filter(x=>(x.isTemporaryDot===false&&x.isApproved))
      
    this.setState({ dataObj: cdataobj }, () => {
        if(isnodotList.length>0){
          //disconnect modal
          this.DisconnectWarningcallandaction(isnodotList)
        }
      this.updateStoreApproveStatus(storelist);
      this.enableImplementContinue();
    });
  }
  resetAllRelogramsofthis=(relogramlist,cdataobj,parentidx,storelist,isuppertags)=>{
    let cmarkingRelograms={
      relogramlist:relogramlist,
      cdataobj:cdataobj,
      parentidx:parentidx,
      storelist:storelist
    }
    // this.setState({markingRelograms:cmarkingRelograms})
    this.resetStoreSetcall(cmarkingRelograms,isuppertags)
  }
  resetStoreSetcall=(relograms,isuppertags)=>{
    this.props.toggleLoadingModal(true);
    var crelograms=relograms.relogramlist
    let defSaveObj = this.state.defSaveObj;
    let cresetStores=[]
    let selctedFcountcard=relograms.cdataobj[relograms.parentidx]
    crelograms.forEach(element => {
      var ob={
        storeId:element.id,
        fieldCount: this.state.fieldCount,
        // tags: this.state.selectedTagGroup.tags
        tags: this.getTagsByGroupId(selctedFcountcard.storesGroupByTags, element.id)
      }
      cresetStores.push(ob)
    }); 
    
    let reqObj ={
      mpId: defSaveObj?defSaveObj.mp_id:0,
      resetStores:cresetStores
    }
    //update isReset of the record in the condisjob table
    submitSets(submitCollection.updateIsReset, reqObj, true).then(res => {
      if(res && res.status){
        alertService.success(this.props.t("RESETTING_TO_CURRENT_VERSION"));
        this.resettingallRelogramstoplano(relograms)
        if(isuppertags){
          this.continuemarkingstores(relograms.cdataobj,relograms.parentidx,relograms.storelist)

        }
      }else{
        alertService.error(this.props.t("erroroccurred"));
        this.props.toggleLoadingModal(false);
      }
    })
  }
  getTagsByGroupId=(data, groupId)=> {
    let tags=[]
    for (let i = 0; i < data.length; i++) {
      const el = data[i];
      let haveinC=el.connectedStores.find(x=>x.id===groupId)
      let haveinD=el.disconnectedStores.find(x=>x.id===groupId)
      if(haveinC||haveinD){
        tags=el.tags
        break
      }
      
    }
    return tags
  }

  resettingallRelogramstoplano=(relograms)=>{
    var cdataObj=this.state.dataObj
    var selectedfcard=cdataObj[relograms.parentidx]
    for (let i = 0; i < selectedfcard.storesGroupByTags.length; i++) {
      const tag = selectedfcard.storesGroupByTags[i];
      tag.connectedStores.forEach(ele => {
        ele.isReset=true
      });
      tag.disconnectedStores.forEach(ele => {
        ele.isReset=true
      });
    }
    this.setState({dataObj:cdataObj})  
  }
  showDisabledWarning = (type) => {
    if(type === "fields"){
      alertService.warn(this.props.t('DISABLED_OTHER_FIELDS'));
    }else{
      alertService.warn(this.props.t('DISABLED_CHECK_RESET'));
    }
  }
  handleConfStoretab=(idx)=>{
    var objarray=this.state.disconnectWarningobj
    this.setState({selectedstorecon:objarray[idx]})
  }
  ClickApplyDiscon=()=>{
    let selecteditem = this.state.selectedstorecon;
    // console.log(selecteditem);
    
    let allSelectedProds = [];

    let newToOldList = [];
    selecteditem.newToOldList.forEach(el => {
      if(el.isSelected){
        el.products.forEach(el2 => {
          newToOldList.push(el2.newProductMetaId);
          allSelectedProds.push(el2.newProductMetaId);
        });
      }
    });
    
    let oldToNewList = [];
    selecteditem.oldToNewList.forEach(el => {
      if(el.isSelected){
        el.products.forEach(el2 => {
          oldToNewList.push(el2.newProductMetaId);
          allSelectedProds.push(el2.newProductMetaId);
        });
      }
    });
    
    let commonList = [];
    selecteditem.commonList.forEach(el => {
      if(el.isSelected){
        el.products.forEach(el2 => {
          commonList.push(el2.newProductMetaId);
          allSelectedProds.push(el2.newProductMetaId);
        });
      }
    });
   
    if(allSelectedProds.length > 0){
      let cobj={
        currentMpId: selecteditem.currentVersionId,
        updatingMpId:selecteditem.updatingVersionId,
        products: [
          {
            updatingType:"newToOld",
            newProductMetaId:newToOldList
          },
          {
            updatingType:"oldToNew",
            newProductMetaId:oldToNewList
          },
          {
            updatingType:"common",
            newProductMetaId:commonList
          }
        
        ]
      }

      // console.log(cobj);
      this.setState({ isLoading: true }, () => {
        submitSets(submitCollection.applyDisconnectWarning, cobj, true, null, true).then(res => {
          this.setState({isLoading:false});
  
          if(res && res.status){
            this.nexttaborclose();
          } else{
            // alertService.error(res.extra?res.extra:this.props.t("erroroccurred"));
          }
        });
      });
    } else{
      alertService.error(this.props.t("SELECT_PRODSTO_CONTINUE"));
    }
  }
  nexttaborclose=()=>{
    var selecteditem=this.state.selectedstorecon
    var objarray=this.state.disconnectWarningobj
    var currentidx=objarray.findIndex(x=>x.storeId===selecteditem.storeId)
    if(objarray.length===(currentidx+1)){
      //close modal
      alertService.success(this.props.t("successfilly_applied"))
      this.hadleAuiMarkImpStoreWarning(false)
    }else{
      alertService.warn(this.props.t("successfullyapplied_apply_to_next_store"),400)
      this.handleConfStoretab(currentidx+1)
    }
  }

  toggleSimPreviewView = (isAutoClose, storetype, storeidx, tagidx, fieldidx, selectedprodlist, mpid, snpshotId, dataobj,mpversionname, mpFromDate, mpToDate) => {
    // console.log(isAutoClose);
    if(!this.state.isShowPreviewSimulation){
      let fieldobj = dataobj[fieldidx];
      let taggroupobj = fieldobj.storesGroupByTags[tagidx];
      let storeobj = taggroupobj[storetype][storeidx];

      let selectedPreview = this.state.selectedSimPreviewObj;
      selectedPreview.fieldObj = fieldobj;
      selectedPreview.tagObj = taggroupobj;
      selectedPreview.storeObj = storeobj;
      selectedPreview.selectedProds = (selectedprodlist && selectedprodlist.length > 0?selectedprodlist:[]);
      selectedPreview.mpId = mpid;
      selectedPreview.snapshotId = snpshotId;
      selectedPreview.mpversionname=mpversionname;
      selectedPreview.mpFromDate=mpFromDate;
      selectedPreview.mpToDate=mpToDate;
      //reset edit mode of simulation
      this.toggleOneCategory("close");

      this.setState({ 
        isShowPreviewSimulation: true,
        selectedSimPreviewObj: selectedPreview
      });  
    } else{
      if(isAutoClose){
        this.setState({ isShowPreviewSimulation: false, isReloadNewProd: false }, () => {
          this.setState({ isReloadNewProd: true });
        });
      } else{
        confirmAlert({
          title: this.props.t('CLOSE_SIMULATION'),
          message: "",
          overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
          buttons: [{
              label: this.props.t('btnnames.yes'),
              onClick: () => {
                this.setState({ isShowPreviewSimulation: false });
              }
          }, {
              label: this.props.t('btnnames.no')
          }]
        });  
      }
    }
  }

  getAristoNotificationCount =()=>{
    submitSets(submitCollection.getAristoNotificationOngoingProductCount, null).then(res => {
      if(res && res.status===true ){
        this.props.setNewProductNotificationAction(res.count);
      }
    });
  }

  updateSimDisabled = (isdisabled) => {
    this.setState({ isSimEditDisabled: isdisabled });
  }

  toggleResetProdWarn = (isshow,isfromresetcurrent,isclosemanualbutton) => {
    this.setState({ isShowResetWarnModal: isshow },()=>{
      if(isfromresetcurrent){
        this.setState({isWarnmodaldontSimstore:false})
      }
      if(!isshow&&isclosemanualbutton){
        this.setState({islookRelgramandclkIt:false})       
      }
    });
  }

  continueResetProdWarn = () => {
    let resetDetails = structuredClone(this.state.resetCheckAvailable);
    if(resetDetails&&((resetDetails.storeidx!==undefined)&&resetDetails.subchildType)){
      let selectedTagList = this.state.dataObj[resetDetails.parentidx].storesGroupByTags[resetDetails.storeidx];
      let selectedStore = selectedTagList[resetDetails.subchildType][resetDetails.tagidx];

      // console.log(selectedStore);
      // store, taggroup, ischild, subchildType, parentidx, storeidx, tagidx
      this.resetRelogramNextStep(selectedStore, selectedTagList, true, resetDetails.subchildType, resetDetails.parentidx, resetDetails.storeidx, resetDetails.tagidx, () => {
        this.toggleResetProdWarn(false,true);
        this.changeDataObjCheck(true, resetDetails.subchildType, resetDetails.parentidx, resetDetails.storeidx, resetDetails.tagidx, true, undefined, selectedStore.id,false,true);

        this.setState({ resetCheckAvailable: null });
      });

    }else{
      this.changeDataObjCheckTrigger(false,null,resetDetails.parentidx,null,null,true,undefined,undefined,undefined,true)
      this.toggleResetProdWarn(false,true);
      this.setState({ resetCheckAvailable: null });
      
    }
    
  }

  render() {
    let {IsIsleAllocationModal, defSaveObj} = this.state;
    let { deptsettings } = this.props;
    
    return (
     <Col xs={12} className={`aui-sidebar ${this.props.isAuiOpen?"full":""}`}>
            <button className='aui-side-toggle' onClick={() => this.haneleSidebar()}>{this.props.isAuiOpen?<DashIcon size={25}/>:<PlusIcon size={25}/> }</button>
            {/* <Row>
                <Col className='aui-sidebar-sub'>
                    
                </Col>
            </Row> */}
            
          <div className='full-aui-content'>
            {this.props.isAuiOpen?<>
              <Col className='d-flex gap-2'>
                <div className='aui-top-department-name'>
                  <TooltipWrapper text={this.props.department_name}><span className='aui-dempartment-name'>
                    {(this.props.department_name?this.props.department_name.substring(0, 25):"-")+" - "+(this.props.department_name.length > 25?"..":"")}
                  </span></TooltipWrapper>
                  <span className='aui-dempartment'>{this.props.t('department')}</span>
                </div>
                <div className={'fields-count-top shadow-sm d-flex gap-2 p-2 bg-white'+(this.state.isShowNewProds?" notactive":"")} onClick={() => this.toggleNewProd(false)}>
                  <div className='fields-count-top-sub'>
                    <span className='fields-count-number'>{this.state.fieldCount ? this.state.fieldCount : 0}</span>
                    <span className='fields-count-text'>{this.props.t('fields')}</span>
                  </div>
                </div>
                <div className={'fields-count-top shadow-sm d-flex gap-2 p-2 newprod-toggle bg-white'+(!this.state.isShowNewProds?" notactive":"")} onClick={() => this.toggleNewProd(true)}>
                  <div className='fields-count-top-sub'>
                    <span className='fields-count-text'>{this.props.t("NEW_PRODUCTS")} {this.state.newProdsCount > 0?<Badge bg='danger'>{this.state.newProdsCount}</Badge>:<></>}</span>
                  </div>
                </div>
              </Col>
            </>:<></>}
              
             <Row className="aui-content-left-right" xl={2}>
             {!this.state.isShowNewProds?<>
                {this.props.isAuiOpen ?<>
                    <Col id="aui-sim-scroll-main" className="left-side-content  shadow-sm bg-white aui" xl={9}  lg={9} >
                      <div className='left-side-content-badge d-flex flex-row-reverse'>
                        <Badge className='badge-top'>{(deptsettings && deptsettings.mvp_percentage > 0?deptsettings.mvp_percentage:0)+"%"} {this.props.t('MVP')}</Badge>
                        <Badge className='badge-top'>{(deptsettings && deptsettings.min_qty > 0)?deptsettings.min_qty:0} {this.props.t('FACING')}</Badge>
                        <Badge className='badge-top'> {this.props.t('MIN')} {deptsettings && deptsettings.min_revenue > 0?deptsettings.min_revenue:0} </Badge>

                        <ButtonGroup className='aui-per-toggle'>
                          <Button size='sm' active={!this.state.isFixed } onClick={() => this.HandleisFixed(!this.state.isFixed)}>{this.props.t('products')}</Button>
                          <Button size='sm' active={this.state.isFixed } onClick={() => this.HandleisFixed(!this.state.isFixed)}>{this.props.t('FIXED_PER')}</Button>
                        </ButtonGroup>

                        {/* <label className="pure-material-switch plg-check">
                            <input type="checkbox" checked={this.state.isSalesCycle} onChange={() => this.setState({ isSalesCycle: !this.state.isSalesCycle })} />
                            <span style={{color:(this.props.dmode?'#2CC990':'#5128a0')}}>{this.props.t('SALE_CYCLE')}</span>
                        </label> */}
                        <div className='Scycle'>
                        {this.state.disableSalesCycle?
                        <TooltipWrapper text={this.props.t('LESS_PRD')} placement="bottom">
                          <div>
                          <span style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('SALE_CYCLE')}</span>
                          <Switch disabled={this.state.disableSalesCycle} onChange={() => this.setState({ isSalesCycle: !this.state.isSalesCycle })} checked={this.state.isSalesCycle} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                          handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(this.state.isSalesCycle?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                          <InfoIcon size={16} color={"red"} />
                          </div>
                        </TooltipWrapper> :
                        <>
                          <span style={{color:(this.props.dmode?'#2CC990':'#4F4F4F')}}>{this.props.t('SALE_CYCLE')}</span>
                          <Switch onChange={() => this.setState({ isSalesCycle: !this.state.isSalesCycle })} checked={this.state.isSalesCycle} height={17} width={30} uncheckedIcon={true} checkedIcon={true}
                          handleDiameter={12} activeBoxShadow={"none"} className={"Scycleswitch"+(this.state.isSalesCycle?" checked":"")} onColor={"#f2f1ff"} offColor={"#f2f1ff"} offHandleColor={"#C2BFBF"} onHandleColor={this.props.dmode?"#2CC990":"#5128A0"} />
                          {this.state.isSalesCycle && this.state.isChainSalesCycle && 
                            <PopoverWrapper cusid="salecycle-pop" trigger={["hover","focus"]} 
                              text={
                                  <div>
                                        <h6>{this.props.t("SALECYCLE_MESSAGE")}</h6>
                                  </div>
                              } placement="top">
                              <FeatherIcon className="alrt" icon="alert-triangle" size={20}/>
                            </PopoverWrapper>
                          }
                        </>
                        }
                        </div>
                        
                        <SearchMPList isRTL={this.props.isRTL} dmode={this.props.dmode} 
                          showNewButton={false}
                          isAUICon={true} 
                          isAuiViewsAllow={this.props.isAuiViewsAllow}
                          defSaveObj={this.state.defSaveObj} 
                          loadMPDetails={this.props.loadMPDetails} 
                          changeDepartmentAndLoadData={this.props.changeDepartmentAndLoadData}
                          changeAUIVersion={this.changeAUIVersion}
                          handleAuiOpen={this.props.handleAuiOpen}
                          loadAuiVersionList={this.loadAuiVersionList}
                          showLoadingModal={this.props.showLoadingModal}
                          mainScreenMpId={this.props.mainScreenMpId}
                          notsaveConfirm={this.props.notsaveConfirm}
                          />

                      </div>
                      <div className='d-flex tags-store-gp-main'>
                        {this.state.tagStoreGroup && this.state.tagStoreGroup.map((d, didx)=>{
                          return(<React.Fragment key={didx}>
                            {d.storesGroupByTags.map((val,i)=>{
                              return(<React.Fragment key={i}>
                                <div className={'tags-store-gp'+(this.state.selectedTagGroup && this.state.selectedTagGroup.id === val.id?" selgroup":"")} onClick={()=>this.tagcardclick(val)}>
                                  <div className='tags-list-gp'>
                                      <span> (<b>{val.totalStores}</b> {this.props.t((val.totalStores > 1?'stores':'STORE'))})</span>
                                      {/* <span className={'taglist-switch '+impleStatus.ACTIVE}>{val.planogramStatus === impleStatus.ACTIVE?<ActiveVersionIcon  size={25}/>:val.planogramStatus === impleStatus.CONFIRMED?<ConfirmVersionIcon size={25} />:<NoneVersionIcon size={25}/>}</span> */}
                                      <span className={'taglist-switch '+(this.state.selectedTagGroup && this.state.selectedTagGroup.id === val.id? !this.state.disableChecks ? "":" disabled-tag " : " disabled-tag " )+' '+val.planogramStatus+' '+(val.isApproved?"":"not-selected")} 
                                      onClick={e => ((this.state.selectedTagGroup && this.state.selectedTagGroup.id === val.id)? !this.state.disableChecks ? this.tagGroupSwitchClick(e, d, i, (val.isApproved?false:true)): null : null)}>
                                        {val.isApproved?<NoneVersionActiveIcon size={25}/>:<NoneVersionIcon size={25}/>}
                                      </span>
                                  </div>
                                  <div className='tags-list d-flex flex-column gap-1'>
                                    {val.tags.length > 0? 
                                      val.tags.map((tag,tagKey)=>{
                                        return(<React.Fragment key={tagKey}>
                                          <TooltipWrapper text={tag.name} >
                                            <div>
                                              {val.isDifferentStruc && tagKey === 0 && <label className='info-icon'>!</label>}
                                              <Badge className='tags-bg'>{tag.name.slice(0, 8)}{tag.name.length > 8 && "..."}</Badge>  
                                            </div>
                                          </TooltipWrapper>
                                        </React.Fragment>)
                                      }):<div>
                                        {val.isDifferentStruc && <label className='info-icon'>!</label>}
                                        <Badge className='no-tags-bg'>{this.props.t("NO_TAG")}</Badge>
                                      </div>
                                    }
                                  </div>
                              </div>
                            </React.Fragment>)
                            })}
                          </React.Fragment>)
                        })
                        }
                      </div>
                      <div className="simulation-Aui MPSimulateAllModal ">
                    
                      {this.state.simreload?<>
                        <MPsimulateAllCategory
                          isAuiViewsAllow={this.props.isAuiViewsAllow}
                          simType="AUI" 
                          depDirectType={this.props.depDirectType}
                          storeId={this.state.storeId}
                          isStoreReset={this.state.isStoreReset}
                          selectedTagGroup={this.state.selectedTagGroup}
                          isFromStandaloneView={false}
                          isKeepPreviousMpId={true}
                          importedDataObj={this.props.importedDataObj}
                          reloadSimAndTag={this.reloadSimAndTag}
                          saveSimulationObjToSideBarComp={this.saveSimulationObjToSideBarComp}
                          originatedMpId={this.state.originatedMpId}
                          originatedMpName={this.state.originatedMpName}
                          simOption={this.state.simOption}
                          originatedSnapshotId={this.state.originatedSnapshotId}
                          newSnapshotId={this.state.newSnapshotId}
                          reloadSimAndStore={this.reloadSimAndStore}
                          storeName={this.state.storeName}
                          department={this.state.defSaveObj.department}
                          bottomFieldCount={this.state.fieldCount}
                          defSaveObj={this.state.defSaveObj} 
                          mpstate={this.props.mpstate} 
                          chartFilterDates={this.props.chartFilterDates}
                          isallsimulatemodal={true} 
                          isRTL={this.props.isRTL} 
                          dmode={this.props.dmode}
                          isDirectSimulation={true}
                          loadedTagsList={[]} //tag list for drop down for selection
                          openOneCategory={this.state.openOneCategory} 
                          haveChnagesinCat={this.state.haveChnagesinCat}
                          signedobj={this.props.signedobj} 
                          selectedTagList={this.state.tagList}
                          isFixed={this.state.isFixed}
                          handlehaveChnagesinCat={this.handlehaveChnagesinCat}
                          toggleOneCategory={this.toggleOneCategory} 
                          toggleLoadingModal={this.props.toggleLoadingModal}
                          // toggleSimulateAllModal={this.props.toggleSimulateAllModal} 
                          sendmarkStackableCall={this.sendmarkStackableCall}
                          tagStoreGroup={this.state.tagStoreGroup}
                          resetStore={this.resetStore}
                          isSalesCycle={this.state.isSalesCycle}
                          notagid={this.state.notagid}
                          changeSaleCycleActive={this.changeSaleCycleActive}
                          disableSalesCycleState={this.state.disableSalesCycle}
                          disableSalesCycle={this.disableSalesCycle}
                          updateImportedDataObj={this.props.updateImportedDataObj}
                          updateIsChainSaleCycle={this.updateIsChainSaleCycle}
                          updatestoreStatusAftersim={this.updatestoreStatusAftersim}
                          islookRelgramandclkIt={this.state.islookRelgramandclkIt}
                          />
                        </>
                      :<></>}
                        
                      </div>
                    </Col>
                </>:<></>}   

                <Col className='right-side-content-main d-flex flex-column' ref={this.auiStorediv} xl={3} lg={3}>
                  {this.props.isAuiOpen?<>
                    {
                    !this.state.isLoaded ? 
                    <div className='right-side-content shadow-sm bg-white'>
                      <div className='isloader'>
                        <img src={loadinggif} alt="loading" /> 
                      </div>
                    </div> :
                    <div className={'right-side-content shadow-sm bg-white'+(!this.state.isEnableImplement?" full-height":"")}>
                        {this.state.dataObj && this.state.dataObj.length > 0?<>
                          <div className='right-side-content-header d-flex justify-content-center'>
                            <div className='right-side-content-header-sub'>
                              <ul className='list-inline ul'>
                                <li className={`list-inline-item aui-content-title${this.state.group === "fields"?"-active":""}`} onClick={()=>{this.setGroup("fields")}}>{this.props.t('fields')}</li>
                                <li className={`list-inline-item aui-content-title${this.state.group === "tags"?"-active":""}`} onClick={()=>{this.setGroup("tags")}}>{this.props.t('tags')}</li>
                              </ul>
                            </div>
                          </div>
                          {this.state.group === "fields" &&  <div className='aui-fields-tags-content mt-2'>
                              <div className="collapsible-sections">
                                {this.state.dataObj.map((item, index) => {

                                    let fpstatus = item.planogramStatus;
                                    return(<div key={index} className={`collapsible-section${(this.state.fieldCount === item.fieldCount)? "-active":""} ${(this.state.fieldCount === item.fieldCount && this.state.openIndexes !== index)? " marg-bottom":""}`}> {/* this.state.openIndexes === index &&  */}
                                    <div className='collapsible-section-header'>
                                      <Button onClick={() => this.handleToggle(index, item.fieldCount, false, false)}
                                        aria-controls={`collapse-${index}`}
                                        aria-expanded={this.state.openIndexes === index}
                                        variant="link"
                                        className="collapsible-section-toggle btn-light-text"
                                      >
                                        <div onClick={() => this.handleToggle(index,item.fieldCount, false, true)}>
                                          <span className="collapsible-section-title-count">{item.fieldCount}</span>
                                          <span className="collapsible-section-title">{this.props.t((item.fieldCount > 1?'fields':'FIELD'))}</span>
                                          <span className="collapsible-section-sub-title">(<b>{item.totalStores}</b> { this.props.t((item.totalStores > 1?'stores':'STORE'))})</span>
                                        </div>
                                    
                                      <span className="collapsible-section-icon">
                                      {this.state.openIndexes === index?<></>:<ChevronDownIcon size={25} />}
                                      </span>
                                      </Button>
                                    </div>
                                    <div className="collapsible-section-sub-header d-flex ">
                                        {item.isShowActive?<PopoverWrapper text={<>
                                          <Col className='aui-popover-content'>
                                            <h5>{defSaveObj && defSaveObj.name?defSaveObj.name:"-"}</h5>
                                            
                                            <Col xs={12} className="badgelist-content">
                                              <Badge className='badge-top'>{(deptsettings && deptsettings.mvp_percentage > 0?deptsettings.mvp_percentage:0)+"%"} {this.props.t('MVP')}</Badge>
                                              <Badge className='badge-top'>{(deptsettings && deptsettings.min_qty > 0)?deptsettings.min_qty:0} {this.props.t('FACING')}</Badge>
                                              <Badge className='badge-top'> {this.props.t('MIN')} {deptsettings && deptsettings.min_revenue > 0?deptsettings.min_revenue:0} </Badge>
                                            </Col>

                                            <span className='bottom-spec-txt'>
                                              <b>{defSaveObj && defSaveObj.version?("v"+defSaveObj.version):"-"}{" "}</b> 
                                              {defSaveObj && defSaveObj.edited_user?defSaveObj.edited_user:"-"}
                                            </span>
                                          </Col>
                                        </>} trigger={['hover', 'focus']} placement="top" cusid="aui-popover-content">
                                            <span className='aui-status'>{this.props.t('ACTIVE')}</span>
                                        </PopoverWrapper>:<></>}
                                        <div className='IssueOpenedIconIcon'>

                                          {item.isDifferentStruc && <label className='info-icon'>!</label>}
                                          <div className={"el-checkbox"+(fpstatus === impleStatus.ACTIVE?" green":fpstatus === impleStatus.CONFIRMED?" orange":"")} style={{marginTop:"2px"}}>
                                            <input type="checkbox" name="check" id={("fieldtag_"+index)} 
                                              checked={item.isApproved} 
                                              //disabled={this.checkForStoresWithoutDiffStruc(item.storesGroupByTags)}
                                              onChange={() => (this.state.fieldCount === item.fieldCount || (this.state.fieldCount !== item.fieldCount && item.isApproved))?this.changeDataObjCheck(false, null, index, null, null, !item.isApproved): this.showDisabledWarning("fields")}  /* !this.state.disableChecks ?  */
                                              />
                                            {/* <label className={this.checkForStoresWithoutDiffStruc(item.storesGroupByTags) ?"el-icon-viewno":"el-icon-view"} htmlFor={("fieldtag_"+index)}> */}
                                            <label className={"el-icon-view"} htmlFor={("fieldtag_"+index)}>
                                              {item.isApproved? 
                                                item.isDot ? <AUICheckboxIcons icon="rounded-dot-check" size={18} color={(fpstatus === impleStatus.ACTIVE?"#5FAF4E":fpstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F")} /> : <AUICheckboxIcons icon="rounded-check" size={18} color={(fpstatus === impleStatus.ACTIVE?"#5FAF4E":fpstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F")} />
                                              : item.isDot ? <AUICheckboxIcons icon="rounded-dot" size={18} color={(fpstatus === impleStatus.ACTIVE?"#5FAF4E":fpstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F")} /> : <AUICheckboxIcons icon="rounded" size={18} color={(fpstatus === impleStatus.ACTIVE?"#5FAF4E":fpstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F")} /> 
                                              }
                                            </label>
                                          </div>


                                        </div>
                                        <div className="d-flex aui-fieldicon-wrapper">
                                          <span><ConnectedLinkIcon size={20} /></span> 
                                          <span className='aui-store-count'>{item.storeCount}</span>
                                        </div>
                                        <div >
                                          |
                                        </div>
                                        <div className="d-flex aui-fieldicon-wrapper justify-content-center">
                                          <span><DisconnectedLinkIcon size={14}  /></span>
                                          <span  className='aui-Dis-store-count'>{item.disStoreCount}</span>
                                        </div>
                  
                                    </div>
                                    {this.state.openIndexes === index && <hr style={{"margin":"0",marginTop:"10px"}}></hr>}
                                    <Collapse in={this.state.openIndexes === index}>
                                    <div id={`collapse-${index}`} className="collapsible-section-content">
                                      <div className='d-flex stores-details'>
                                        <div className='main-cd'>
                                          <span className='store-cd-status-fileds'>{item.storeCount} {this.props.t('CONNECTED')}</span>
                                          <div className='main-stores-aui d-flex flex-column'>
                                            {item.storesGroupByTags.map((val, vidx)=>{
                                              return(<React.Fragment key={vidx}>
                                                {val.connectedStores.map((store,z)=>{

                                                  let spstatus = store.planogramStatus;
                                                  return(<div className='stores-aui' key={z}>
                                                      <div className={"el-checkbox"+(spstatus === impleStatus.ACTIVE?" green":spstatus === impleStatus.CONFIRMED?" orange":"")} style={{paddingLeft: "10px"}}>
                                                        <input type="checkbox" name="check" id={("fcon_"+index+"_"+vidx+"_"+z)} 
                                                          checked={store.isApproved}
                                                          //disabled={store.isDifferentStruc} 
                                                          onChange={() => (this.state.fieldCount === item.fieldCount || (this.state.fieldCount !== item.fieldCount && store.isApproved))?this.changeDataObjCheck(true, "connectedStores", index, vidx, z, !store.isApproved): this.showDisabledWarning("fields")} /* !this.state.disableChecks ?  */
                                                          />
                                                        {/* <label className={store.isDifferentStruc?"el-icon-viewno":"el-icon-view"} htmlFor={("fcon_"+index+"_"+vidx+"_"+z)}> */}
                                                        <label className={"el-icon-view"} htmlFor={("fcon_"+index+"_"+vidx+"_"+z)}>
                                                          {store.isApproved? 
                                                            store.isTemporaryDot ? <AUICheckboxIcons icon="rounded-dot-check" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F")} /> :  <AUICheckboxIcons icon="rounded-check" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F")} />
                                                          : store.isTemporaryDot ? <AUICheckboxIcons icon="rounded-dot" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F" )} /> : <AUICheckboxIcons icon="rounded" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F" )} />
                                                          }
                                                        </label>
                                                          <span className={"margin-r"+(store.id === this.state.storeId?" selstore":"")}>
                                                            
                                                              <span>
                                                                {!store.isReset ? 
                                                                  <TooltipWrapper text={
                                                                    <span>{store.name}{store.originatedMp && store.originatedMp.mpId > 0?<>
                                                                      {/* <br/><small>{this.props.t("RELOGRAM")}: {!store.isReset?store.originatedMp.mpName:(defSaveObj.name? defSaveObj.name : null)}</small> */}
                                                                      <br/><small>{this.props.t("RELOGRAM")}: {store.originatedMp.mpName}</small>
                                                                    </>:<></>}</span>}>
                                                                    <span onClick={()=>{this.setStore(store, val, index, item.fieldCount)}}>{store.name.length > (Math.floor((this.state.colWidth/2)/19)) ? store.name.slice(0, (Math.floor((this.state.colWidth/2)/19)))+".." :store.name}</span>
                                                                  </TooltipWrapper>
                                                                  :
                                                                  <span onClick={()=>{this.setStore(store, val, index, item.fieldCount)}}>{store.name.length > (Math.floor((this.state.colWidth/2)/19)) ? store.name.slice(0, (Math.floor((this.state.colWidth/2)/19)))+".." :store.name}</span>
                                                                }    
                                                                {/* {store.id === this.state.storeId && store.originatedMp && store.originatedMp.mpId > 0 && store.originatedMp.mpId !== defSaveObj.mp_id && !store.isReset? */}
                                                                {store.id === this.state.storeId && store.originatedMp && store.originatedMp.mpId > 0 && store.originatedMp.mpId !== defSaveObj.mp_id ?
                                                                  // <Button className='aui-refreshlink' size='sm' onClick={()=>{this.resetRelogram(store, val)}} title={this.props.t("btnnames.reset")}><SyncIcon size={12} /></Button>
                                                                  // <Button className={!store.isReset ? 'aui-reset-btn-reset' : 'aui-reset-btn-current'} variant='outline-secondary' size='sm' onClick={()=>{ this.resetRelogram(store, val, true, "connectedStores", index, vidx, z) }} title={!store.isReset ? this.props.t("RELOGRAM") : this.props.t("CURRENT_VERSION")}>{!store.isReset ? "R" : "C"}</Button>
                                                                <>
                                                                  <Button className={!store.isReset ? 'aui-reset-btn-reset-active' : 'aui-reset-btn-reset'} variant='outline-secondary' size='sm' onClick={()=>{ this.resetRelogram(store, val, true, "connectedStores", index, vidx, z) }} title={this.props.t("RELOGRAM")}>{"R"}</Button>
                                                                  <Button className={!store.isReset ? 'aui-reset-btn-current' : 'aui-reset-btn-current-active'} variant='outline-secondary' size='sm' onClick={()=>{ this.resetRelogram(store, val, true, "connectedStores", index, vidx, z) }} title={this.props.t("planogram")}>{"P"}</Button>
                                                                </>
                                                                :<></>}
                                                              </span>
                                                            
                                                            {(store.isDifferentStruc || store.isDifferentShelfStruc)?<span className={'shelficon'+(store.isDifferentStruc && store.isDifferentShelfStruc?" multiple":"")}>
                                                              {store.isDifferentStruc?<TooltipWrapper text={this.props.t("DIFFFIELD.WIDTH")}><FeatherIcon icon="minus-square" size={10} /></TooltipWrapper>:<></>}
                                                              {store.isDifferentShelfStruc?<TooltipWrapper text={this.props.t("DIFFFIELD.SHELF")}><FeatherIcon icon="align-left" size={10} /></TooltipWrapper>:<></>}
                                                            </span>:<></>}
                                                            
                                                          </span>

                                                      </div>
                                                  </div>)
                                                })}
                                              </React.Fragment>)
                                            })
                                            }
                                          </div>
                                        </div>
                                        <div className='main-cd'>
                                          <span className='store-dc-status--fileds'>{item.disStoreCount} {this.props.t('DISCONNECTED')}</span>
                                          <div className='main-stores-aui  d-flex flex-column'>
                                            {item.storesGroupByTags.map((val, vidx)=>{
                                                return(<React.Fragment key={vidx}>
                                                  {val.disconnectedStores.map((store,z)=>{
                                                    let spstatus = store.planogramStatus;
                                                    return(<div className='stores-aui discon'  key={z}>
                                                        <div className={"el-checkbox"+(spstatus === impleStatus.ACTIVE?" green":spstatus === impleStatus.CONFIRMED?" orange":"")}>
                                                          <input type="checkbox" name="check" id={("fdis_"+index+"_"+vidx+"_"+z)} 
                                                            checked={store.isApproved}
                                                            //disabled={store.isDifferentStruc} 
                                                            onChange={() => (this.state.fieldCount === item.fieldCount || (this.state.fieldCount !== item.fieldCount && store.isApproved))?this.changeDataObjCheck(true, "disconnectedStores", index, vidx, z, !store.isApproved,undefined,store.id) : this.showDisabledWarning("fields")}
                                                            />
                                                          {/* <label className={store.isDifferentStruc?"el-icon-viewno":"el-icon-view"} htmlFor={("fdis_"+index+"_"+vidx+"_"+z)}> */}
                                                          <label className={"el-icon-view"} htmlFor={("fdis_"+index+"_"+vidx+"_"+z)}>
                                                            {store.isApproved?
                                                              store.isTemporaryDot ? <AUICheckboxIcons icon="rounded-dot-check" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F" )} /> : <AUICheckboxIcons icon="rounded-check" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F" )} />
                                                            : store.isTemporaryDot ? <AUICheckboxIcons icon="rounded-dot" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F" )} /> : <AUICheckboxIcons icon="rounded" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F" )} />
                                                            }
                                                          </label>
                                                          
                                                            <span className={"margin-r"+(store.id === this.state.storeId?" selstore":"")}>
                                                  
                                                                <span>
                                                                  {!store.isReset ? 
                                                                    <TooltipWrapper text={
                                                                      <span>{store.name}{store.originatedMp && store.originatedMp.mpId > 0?<>
                                                                      {/* <br/><small>{this.props.t("RELOGRAM")}: {!store.isReset?store.originatedMp.mpName:(defSaveObj.name? defSaveObj.name : null)}</small> */}
                                                                      <br/><small>{this.props.t("RELOGRAM")}: {store.originatedMp.mpName}</small>
                                                                    </>:<></>}</span>}>
                                                                        <span onClick={()=>{this.setStore(store, val, index, item.fieldCount)}}>{store.name.length > (Math.floor((this.state.colWidth/2)/19)) ? store.name.slice(0, (Math.floor((this.state.colWidth/2)/19)))+".." :store.name}</span>
                                                                    </TooltipWrapper>
                                                                    :
                                                                    <span onClick={()=>{this.setStore(store, val, index, item.fieldCount)}}>{store.name.length > (Math.floor((this.state.colWidth/2)/19)) ? store.name.slice(0, (Math.floor((this.state.colWidth/2)/19)))+".." :store.name}</span>
                                                                  }
                                                                  {/* {store.id === this.state.storeId && store.originatedMp && store.originatedMp.mpId > 0 && store.originatedMp.mpId !== defSaveObj.mp_id && !store.isReset? */}
                                                                  {store.id === this.state.storeId && store.originatedMp && store.originatedMp.mpId > 0 && store.originatedMp.mpId !== defSaveObj.mp_id ?
                                                                    // <Button className='aui-refreshlink' size='sm' onClick={()=>{this.resetRelogram(store, val)}} title={this.props.t("btnnames.reset")}><SyncIcon size={12} /></Button>
                                                                      // <Button className={!store.isReset ? 'aui-reset-btn-reset' : 'aui-reset-btn-current'} variant='outline-secondary' size='sm' onClick={()=>{ this.resetRelogram(store, val, true, "disconnectedStores", index, vidx, z) }} title={!store.isReset ? this.props.t("RELOGRAM") : this.props.t("CURRENT_VERSION")}>{!store.isReset ? "R" : "C"}</Button>
                                                                    <>
                                                                      <Button className={!store.isReset ? 'aui-reset-btn-reset-active' : 'aui-reset-btn-reset'} variant='outline-secondary' size='sm' onClick={()=>{ this.resetRelogram(store, val, true, "disconnectedStores", index, vidx, z) }} title={this.props.t("RELOGRAM")}>{"R"}</Button>
                                                                      <Button className={!store.isReset ? 'aui-reset-btn-current' : 'aui-reset-btn-current-active'} variant='outline-secondary' size='sm' onClick={()=>{ this.resetRelogram(store, val, true, "disconnectedStores", index, vidx, z) }} title={this.props.t("planogram")}>{"P"}</Button>
                                                                    </>
                                                                  :<></>}
                                                                </span>
                                                            
                                                              {(store.isDifferentStruc || store.isDifferentShelfStruc)?<span className={'shelficon'+(store.isDifferentStruc && store.isDifferentShelfStruc?" multiple":"")}>
                                                                {store.isDifferentStruc?<TooltipWrapper text={this.props.t("DIFFFIELD.WIDTH")}><FeatherIcon icon="minus-square" size={10} /></TooltipWrapper>:<></>}
                                                                {store.isDifferentShelfStruc?<TooltipWrapper text={this.props.t("DIFFFIELD.SHELF")}><FeatherIcon icon="align-left" size={10} /></TooltipWrapper>:<></>}
                                                              </span>:<></>}
                                                               
                                                            </span>
                                                        </div>
                                                    </div>)
                                                  })}
                                                </React.Fragment>)
                                              })
                                              }
                                          </div>
                                        </div>
                                      </div>
                                      </div>
                                    </Collapse>
                                  </div>
                                    )
                                  }
                                )}

                                {/* no fields view */}
                                {this.state.noFieldEditList && this.state.noFieldEditList.length > 0?
                                  <div className={`collapsible-section`}>
                                    <div className='collapsible-section-header'>
                                      <Button onClick={() => this.handleToggleNoFields(true)} variant="link" className="collapsible-section-toggle btn-light-text">
                                        <div>
                                          <span className="collapsible-section-title">{this.props.t('NO_FIELDS')}</span>
                                          <span className="collapsible-section-sub-title">(<b>{this.state.noFieldEditList.length}</b> { this.props.t((0 > 1?'stores':'STORE'))})</span>
                                        </div>
                                    
                                        <span className="collapsible-section-icon"><FeatherIcon icon="edit" size={16} /></span>
                                      </Button>
                                    </div>
                                  </div>
                                :<></>}

                              </div>
                              <div>
                        
                              </div>
                            </div>
                          }
                          {
                            this.state.group === "tags" &&  <div className='aui-fields-tags-content mt-2'>
                              <div className="collapsible-sections">
                                {this.state.dataObj.map((item, index) => {

                                  let fpstatus = item.planogramStatus;
                                  return <div key={index} className={`collapsible-section${this.state.fieldCount === item.fieldCount? "-active":""} ${(this.state.fieldCount === item.fieldCount && this.state.openIndexes !== index)? " marg-bottom":""}`}> {/* this.state.openIndexes === index */}
                                    <div className='collapsible-section-header'>
                                      <Button onClick={() => this.handleToggle(index,item.fieldCount, false, false)}
                                        aria-controls={`collapse-${index}`}
                                        aria-expanded={this.state.openIndexes === index}
                                        variant="link"
                                        className="collapsible-section-toggle btn-light-text"
                                        >
                                        <div onClick={() => this.handleToggle(index,item.fieldCount, false, true)}>
                                          <span className="collapsible-section-title-count">{item.fieldCount}</span>
                                          <span className="collapsible-section-title">{this.props.t((item.fieldCount > 1?'fields':'FIELD'))}</span>
                                          <span className="collapsible-section-sub-title">(<b>{item.totalStores}</b> {this.props.t((item.totalStores > 1?'stores':'STORE'))})</span>
                                        </div>
                                    
                                      <span className="collapsible-section-icon">
                                      {this.state.openIndexes === index ?<></>:<ChevronDownIcon size={25} />}
                                      </span>
                                      </Button>
                                    </div>
                                    <div className="collapsible-section-sub-header d-flex">
                                      {item.isShowActive?<PopoverWrapper text={<>
                                        <Col className='aui-popover-content'>
                                          <h5>{defSaveObj && defSaveObj.name?defSaveObj.name:"-"}</h5>
                                          
                                          <Col xs={12} className="badgelist-content">
                                            <Badge className='badge-top'>{(deptsettings && deptsettings.mvp_percentage > 0?deptsettings.mvp_percentage:0)+"%"} {this.props.t('MVP')}</Badge>
                                            <Badge className='badge-top'>{(deptsettings && deptsettings.min_qty > 0)?deptsettings.min_qty:0} {this.props.t('FACING')}</Badge>
                                            <Badge className='badge-top'> {this.props.t('MIN')} {deptsettings && deptsettings.min_revenue > 0?deptsettings.min_revenue:0} </Badge>
                                          </Col>

                                          <span className='bottom-spec-txt'>
                                            <b>{defSaveObj && defSaveObj.version?("v"+defSaveObj.version):"-"}{" "}</b> 
                                            {defSaveObj && defSaveObj.edited_user?defSaveObj.edited_user:"-"}
                                          </span>
                                        </Col>
                                      </>} trigger={['hover', 'focus']} placement="top" cusid="aui-popover-content">
                                          <span className='aui-status'>{this.props.t('ACTIVE')}</span>
                                      </PopoverWrapper>:<></>}

                                        <div className='IssueOpenedIconIcon'>
                                        {item.isDifferentStruc && <label className='info-icon'>!</label>}
                                          <div className={"el-checkbox"+(fpstatus === impleStatus.ACTIVE?" green":fpstatus === impleStatus.CONFIRMED?" orange":"")} style={{marginTop: "2px"}}>
                                            <input type="checkbox" name="check" id={("tagtag_"+index)} 
                                              checked={index.isApproved}
                                              //disabled={this.checkForStoresWithoutDiffStruc(item.storesGroupByTags)} 
                                              onChange={() => (this.state.fieldCount === item.fieldCount || (this.state.fieldCount !== item.fieldCount && item.isApproved))? !this.state.disableChecks ? this.changeDataObjCheck(false, null, index, null, null, !item.isApproved): this.showDisabledWarning("reset") : this.showDisabledWarning("fields")}
                                              />
                                            {/* <label className={this.checkForStoresWithoutDiffStruc(item.storesGroupByTags)?"el-icon-viewno":"el-icon-view"} htmlFor={("tagtag_"+index)}> */}
                                            <label className={"el-icon-view"} htmlFor={("tagtag_"+index)}>
                                              {item.isApproved?
                                                item.isDot ? <AUICheckboxIcons icon="rounded-dot-check" size={18} color={(fpstatus === impleStatus.ACTIVE?"#5FAF4E":fpstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F")} /> : <AUICheckboxIcons icon="rounded-check" size={18} color={(fpstatus === impleStatus.ACTIVE?"#5FAF4E":fpstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F")} />
                                              : item.isDot ? <AUICheckboxIcons icon="rounded-dot" size={18} color={(fpstatus === impleStatus.ACTIVE?"#5FAF4E":fpstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F")} /> : <AUICheckboxIcons icon="rounded" size={18} color={(fpstatus === impleStatus.ACTIVE?"#5FAF4E":fpstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F")} /> 
                                              }
                                            </label>
                                          </div>
                                        </div>
                                        <div className="d-flex aui-fieldicon-wrapper ">
                                          <span><ConnectedLinkIcon size={20} /></span> 
                                          <span className='aui-store-count'>{item.storeCount}</span>
                                        </div>
                                        <div>
                                          |
                                        </div>
                                        <div className="d-flex aui-fieldicon-wrapper justify-content-center">
                                          <span><DisconnectedLinkIcon size={14}  /></span>
                                          <span  className='aui-Dis-store-count'>{item.disStoreCount}</span>
                                        </div>
                                    </div>
                                    <Collapse in={this.state.openIndexes === index}>
                                      <div id={`collapse-${index}`} className="collapsible-section-content">
                                        <div className='store-types d-flex'>
                                          <div style={{width: "50%", paddingLeft: "8px"}}>
                                            <span className='store-cd-status'>{item.storeCount} {this.props.t('CONNECTED')}</span>
                                          </div>
                                          <div style={{width: "50%"}}>
                                            <span className='store-cd-status'>{item.disStoreCount} {this.props.t('DISCONNECTED')}</span>
                                          </div>
                                        </div>
                                        <div className='collapsible-section-content-main'>
                                          {item.storesGroupByTags.map((val,j)=>{
                                              return(<React.Fragment key={j}>
                                                <div className={'aui-tags-group d-flex'+(j > 0?" bordertop":"")}>
                                                <span className='tags-stores-count'>({val.connectedStores.length+val.disconnectedStores.length})</span>
                                                  <div className='tags-list-Tag d-flex gap-1'>
                                                    {val.tags.length > 0?val.tags.map((tags,m)=>{
                                                        return(<React.Fragment key={m}>
                                                            {tags.name.length > 8 ?
                                                            <TooltipWrapper text={tags.name}  key={m}>
                                                              <div>
                                                                <Badge className='tags-bg'> {tags.name.slice(0, 8)}{tags.name.length > 8 && "..."}</Badge>  
                                                              </div>
                                                            </TooltipWrapper>
                                                          : <Badge className='tags-bg'> {tags.name}</Badge>}  
                                                        </React.Fragment>)

                                                      }) :<Badge className='no-tags-bg'>{this.props.t("NO_TAG")}</Badge>
                                                    }
                                                  </div>
                                            <div>
                                            
                                            </div>
                                          </div>
                                          <div className='tag-stors-group '>
                                              <div style={{display:"inline-block",width:"49%"}}>
                                                {val.connectedStores.length > 0?val.connectedStores.map((store,storeKey)=>{

                                                    let spstatus = store.planogramStatus;
                                                    return(<div className='stores-aui gap-1' key={storeKey}>
                                                      <div className={"el-checkbox"+(spstatus === impleStatus.ACTIVE?" green":spstatus === impleStatus.CONFIRMED?" orange":"")} style={{paddingLeft: "10px"}}>
                                                        <input type="checkbox" name="check" id={("tcon_"+index+"_"+j+"_"+storeKey)} 
                                                          checked={store.isApproved} 
                                                          //disabled={store.isDifferentStruc} 
                                                          onChange={() => (this.state.fieldCount === item.fieldCount || (this.state.fieldCount !== item.fieldCount && store.isApproved))?this.changeDataObjCheck(true, "connectedStores", index, j, storeKey, !store.isApproved) : this.showDisabledWarning("fields")}
                                                          />
                                                        {/* <label className={store.isDifferentStruc?"el-icon-viewno":"el-icon-view"} htmlFor={("tcon_"+index+"_"+j+"_"+storeKey)}> */}
                                                        <label className={"el-icon-view"} htmlFor={("tcon_"+index+"_"+j+"_"+storeKey)}>
                                                          {store.isApproved?
                                                            store.isTemporaryDot ? <AUICheckboxIcons icon="rounded-dot-check" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F")} /> : <AUICheckboxIcons icon="rounded-check" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F")} />
                                                          : store.isTemporaryDot ? <AUICheckboxIcons icon="rounded-dot" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F")} /> : <AUICheckboxIcons icon="rounded" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F")} />
                                                          }
                                                        </label>
                                                        
                                                          <span className={"margin-r"+(store.id === this.state.storeId?" selstore":"")}>
                                                          
                                                                <span>
                                                                {!store.isReset ?
                                                                  <TooltipWrapper text={
                                                                    <span>{store.name}{store.originatedMp && store.originatedMp.mpId > 0?<>
                                                                    {/* <br/><small>{this.props.t("RELOGRAM")}: {!store.isReset?store.originatedMp.mpName:(defSaveObj.name? defSaveObj.name : null)}</small> */}
                                                                      <br/><small>{this.props.t("RELOGRAM")}: {store.originatedMp.mpName}</small>
                                                                    </>:<></>}</span>}>
                                                                    <span onClick={()=>{this.setStore(store, val, index, item.fieldCount)}}>{store.name.length > (Math.floor((this.state.colWidth/2)/19)) ? store.name.slice(0, (Math.floor((this.state.colWidth/2)/19)))+".." :store.name}</span>
                                                                  </TooltipWrapper>
                                                                  :
                                                                  <span onClick={()=>{this.setStore(store, val, index, item.fieldCount)}}>{store.name.length > (Math.floor((this.state.colWidth/2)/19)) ? store.name.slice(0, (Math.floor((this.state.colWidth/2)/19)))+".." :store.name}</span>
                                                                }
                                                                  {/* {store.id === this.state.storeId && store.originatedMp && store.originatedMp.mpId > 0 && store.originatedMp.mpId !== defSaveObj.mp_id && !store.isReset? */}
                                                                  {store.id === this.state.storeId && store.originatedMp && store.originatedMp.mpId > 0 && store.originatedMp.mpId !== defSaveObj.mp_id ?
                                                                  // <Button className='aui-refreshlink' size='sm' onClick={()=>{this.resetRelogram(store, val)}} title={this.props.t("btnnames.reset")}><SyncIcon size={12} /></Button>
                                                                  // <Button className={!store.isReset ? 'aui-reset-btn-reset' : 'aui-reset-btn-current'} variant='outline-secondary' size='sm' onClick={()=>{ this.resetRelogram(store, val, true, "connectedStores", index, j, storeKey) }} title={!store.isReset ? this.props.t("RELOGRAM") : this.props.t("CURRENT_VERSION")}>{!store.isReset ? "R" : "C"}</Button>
                                                                  <>
                                                                    <Button className={!store.isReset ? 'aui-reset-btn-reset-active' : 'aui-reset-btn-reset'} variant='outline-secondary' size='sm' onClick={()=>{ this.resetRelogram(store, val, true, "connectedStores", index, j, storeKey) }} title={this.props.t("RELOGRAM")}>{"R"}</Button>
                                                                    <Button className={!store.isReset ? 'aui-reset-btn-current' : 'aui-reset-btn-current-active'} variant='outline-secondary' size='sm' onClick={()=>{ this.resetRelogram(store, val, true, "connectedStores", index, j, storeKey) }} title={this.props.t("planogram")}>{"P"}</Button>
                                                                  </>
                                                                  :<></>}
                                                                </span>

                                                            {(store.isDifferentStruc || store.isDifferentShelfStruc)?<span className={'shelficon'+(store.isDifferentStruc && store.isDifferentShelfStruc?" multiple":"")}>
                                                              {store.isDifferentStruc?<TooltipWrapper text={this.props.t("DIFFFIELD.WIDTH")}><FeatherIcon icon="minus-square" size={10} /></TooltipWrapper>:<></>}
                                                              {store.isDifferentShelfStruc?<TooltipWrapper text={this.props.t("DIFFFIELD.SHELF")}><FeatherIcon icon="align-left" size={10} /></TooltipWrapper>:<></>}
                                                            </span>:<></>}

                                                          </span>
                                                      </div>
                                                    </div>)
                                                  }):<></>}
                                              </div>
                                              <div style={{display:"inline-block",width:"51%"}}>
                                                {val.disconnectedStores.length > 0?val.disconnectedStores.map((store,storeKey)=>{

                                                    let spstatus = store.planogramStatus;
                                                    return(<div className='stores-aui discon gap-1'  key={storeKey}>
                                                      <div className={"el-checkbox"+(spstatus === impleStatus.ACTIVE?" green":spstatus === impleStatus.CONFIRMED?" orange":"")}>
                                                        <input type="checkbox" name="check" id={("tdis_"+index+"_"+j+"_"+storeKey)} 
                                                          checked={store.isApproved}
                                                          // disabled={store.isDifferentStruc} 
                                                          onChange={() => (this.state.fieldCount === item.fieldCount || (this.state.fieldCount !== item.fieldCount && store.isApproved))?this.changeDataObjCheck(true, "disconnectedStores", index, j, storeKey, !store.isApproved) : this.showDisabledWarning("fields")}
                                                          />
                                                        {/* <label className={store.isDifferentStruc?"el-icon-viewno":"el-icon-view"} htmlFor={("tdis_"+index+"_"+j+"_"+storeKey)}> */}
                                                        <label className={"el-icon-view"} htmlFor={("tdis_"+index+"_"+j+"_"+storeKey)}>
                                                          {store.isApproved?
                                                            store.isTemporaryDot ? <AUICheckboxIcons icon="rounded-dot-check" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F" )} /> : <AUICheckboxIcons icon="rounded-check" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F" )} />
                                                          : store.isTemporaryDot ? <AUICheckboxIcons icon="rounded-dot" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F" )} /> : <AUICheckboxIcons icon="rounded" size={15} color={( spstatus === impleStatus.ACTIVE?"#5FAF4E":spstatus === impleStatus.CONFIRMED?"#F39C12":"#4F4F4F" )} />
                                                          }
                                                        </label>
                                                        
                                                          <span className={"margin-r"+(store.id === this.state.storeId?" selstore":"")}>

                                                              <span>
                                                                {!store.isReset ?
                                                                <TooltipWrapper text={
                                                                  <span>{store.name}{store.originatedMp && store.originatedMp.mpId > 0?<>
                                                                  {/* <br/><small>{this.props.t("RELOGRAM")}: {!store.isReset?store.originatedMp.mpName:(defSaveObj.name? defSaveObj.name : null)}</small> */}
                                                                   <br/><small>{this.props.t("RELOGRAM")}: {store.originatedMp.mpName}</small>
                                                                  </>:<></>}</span>}>
                                                                  <span onClick={()=>{this.setStore(store, val, index, item.fieldCount)}}>{store.name.length > (Math.floor((this.state.colWidth/2)/19)) ? store.name.slice(0, (Math.floor((this.state.colWidth/2)/19)))+".." :store.name}</span>
                                                                </TooltipWrapper>
                                                                  :
                                                                <span onClick={()=>{this.setStore(store, val, index, item.fieldCount)}}>{store.name.length > (Math.floor((this.state.colWidth/2)/19)) ? store.name.slice(0, (Math.floor((this.state.colWidth/2)/19)))+".." :store.name}</span>
                                                                }
                                                                {/* {store.id === this.state.storeId && store.originatedMp && store.originatedMp.mpId > 0 && store.originatedMp.mpId !== defSaveObj.mp_id && !store.isReset? */}
                                                                {store.id === this.state.storeId && store.originatedMp && store.originatedMp.mpId > 0 && store.originatedMp.mpId !== defSaveObj.mp_id ?
                                                                  // <Button className='aui-refreshlink' size='sm' onClick={()=>{this.resetRelogram(store, val)}} title={this.props.t("btnnames.reset")}><SyncIcon size={12} /></Button>
                                                                  // <Button className={!store.isReset ? 'aui-reset-btn-reset' : 'aui-reset-btn-current'} variant='outline-secondary' size='sm' onClick={()=>{ this.resetRelogram(store, val, true, "disconnectedStores", index, j, storeKey) }} title={!store.isReset ? this.props.t("RELOGRAM") : this.props.t("CURRENT_VERSION")}>{!store.isReset ? "R" : "C"}</Button>
                                                                <>
                                                                  <Button className={!store.isReset ? 'aui-reset-btn-reset-active' : 'aui-reset-btn-reset'} variant='outline-secondary' size='sm' onClick={()=>{ this.resetRelogram(store, val, true, "disconnectedStores", index, j, storeKey) }} title={this.props.t("RELOGRAM")}>{"R"}</Button>
                                                                  <Button className={!store.isReset ? 'aui-reset-btn-current' : 'aui-reset-btn-current-active'} variant='outline-secondary' size='sm' onClick={()=>{ this.resetRelogram(store, val, true, "disconnectedStores", index, j, storeKey) }} title={this.props.t("planogram")}>{"P"}</Button>
                                                                </>
                                                                :<></>}
                                                              </span>

                                                            {(store.isDifferentStruc || store.isDifferentShelfStruc)?<span className={'shelficon'+(store.isDifferentStruc && store.isDifferentShelfStruc?" multiple":"")}>
                                                              {store.isDifferentStruc?<TooltipWrapper text={this.props.t("DIFFFIELD.WIDTH")}><FeatherIcon icon="minus-square" size={10} /></TooltipWrapper>:<></>}
                                                              {store.isDifferentShelfStruc?<TooltipWrapper text={this.props.t("DIFFFIELD.SHELF")}><FeatherIcon icon="align-left" size={10} /></TooltipWrapper>:<></>}
                                                            </span>:<></>}
                                                      
                                                          </span>
                                                      </div>
                                                    </div>)
                                                  }):<></>}
                                              </div>
                                            </div>
                                            </React.Fragment>)
                                          
                                            })
                                          }
                                        
                                        </div>
                                      </div>
                                    </Collapse>
                                  </div>
                                })}
                               
                                {this.state.noFieldEditList && this.state.noFieldEditList.length > 0?
                                  <div className={`collapsible-section`}>
                                    <div className='collapsible-section-header'>
                                      <Button onClick={() => this.handleToggleNoFields(true)} variant="link" className="collapsible-section-toggle btn-light-text">
                                        <div>
                                          <span className="collapsible-section-title">{this.props.t('NO_FIELDS')}</span>
                                          <span className="collapsible-section-sub-title">(<b>{this.state.noFieldEditList.length}</b> { this.props.t((0 > 1?'stores':'STORE'))})</span>
                                        </div>
                                    
                                        <span className="collapsible-section-icon"><FeatherIcon icon="edit" size={16} /></span>
                                      </Button>
                                    </div>
                                  </div>
                                :<></>}
                              </div>
                              <div>
                        
                              </div>
                            </div>
                          }
                        </>:this.state.noFieldEditList && this.state.noFieldEditList.length > 0?
                          <>
                            <div className='aui-fields-tags-content mt-3'>
                              <div className="collapsible-sections">
                                  {/* no fields view */}
                                  {this.state.noFieldEditList && this.state.noFieldEditList.length > 0?
                                    <div className={`collapsible-section`}>
                                      <div className='collapsible-section-header'>
                                        <Button onClick={() => this.handleToggleNoFields(true)} variant="link" className="collapsible-section-toggle btn-light-text">
                                          <div>
                                            <span className="collapsible-section-title">{this.props.t('NO_FIELDS')}</span>
                                            <span className="collapsible-section-sub-title">(<b>{this.state.noFieldEditList.length}</b> { this.props.t((0 > 1?'stores':'STORE'))})</span>
                                          </div>
                                      
                                          <span className="collapsible-section-icon"><FeatherIcon icon="edit" size={16} /></span>
                                        </Button>
                                      </div>
                                    </div>
                                  :<></>}
                              </div>
                            </div>
                          </>
                        :<div className='nocontent-txt'>
                          <h6 className='text-center'>{this.props.t("NO_RESULT_FOUND")}</h6>
                        </div>}   
                    </div>
                
                  }
                  {this.state.isEnableImplement?<div className='p-2 text-center'>{/* this.state.dataObj && this.state.dataObj.length > 0 &&  */}
                    <Button className='aui-Implement-btn w-100' onClick={() => this.implementBtn()}>{this.props.t('IMPLEMENT')}</Button>
                  </div>:<></>}
                  </>:<></>}
                </Col>
              </>:<>
                  {this.state.isReloadNewProd?<NewProdsView t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode}  isShowLoadingModal={this.props.isShowLoadingModal}
                    allBrandsList={this.state.allBrandsList}
                    allCatList={this.state.allCatList}
                    allVersionsList={this.state.allVersionsList}
                    defSaveObj={this.props.defSaveObj}
                    dataObj={this.state.dataObj}
                    newProdsCount={this.state.newProdsCount}
                    getNewProdCount={this.getNewProdCount}
                    toggleLoadingModal={this.props.toggleLoadingModal}
                    notificationCount={this.getAristoNotificationCount}
                    toggleSimPreviewView={this.toggleSimPreviewView}
                    />:<></>}
              </>}
             
            </Row> 
          </div>

          {this.state.isShowContImpleModal?
            <ContImplementModal t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} 
              isShowContImpleModal={this.state.isShowContImpleModal}
              dataObj={this.state.continueDataObj}
              otherApproveCount={this.state.otherApproveCount}
              totalDisStoreCount={this.state.totalDisStoreCount}
              signedobj={this.props.signedobj}
              changeDataObjCheck={this.changeDataObjCheck}
              checkIsStoreApproved={this.checkIsStoreApproved}
              toggleContinueImpleModal={this.toggleContinueImpleModal}
              updateStoreApproveStatus={this.updateStoreApproveStatus}
              mpId={this.state.sobj.mpId?this.state.sobj.mpId:0} 
              />
          :<></>}

          {this.state.showNofieldsEdit?
            <NoFieldEditModal t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} 
              defSaveObj={this.state.defSaveObj}
              showNofieldsEdit={this.state.showNofieldsEdit}
              dataObj={this.state.noFieldEditList}
              handleToggleNoFields={this.handleToggleNoFields}
              toggleLoadingModal={this.props.toggleLoadingModal}
              implementContinue={this.implementContinue}
              />
          :<></>}

          {this.state.showUniqueDunitEdit?
            <UniqueDunitEditModal t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} 
              defSaveObj={this.state.defSaveObj}
              isNonDiffAvailable={this.state.isNonDiffAvailable}
              showUniqueDunitEdit={this.state.showUniqueDunitEdit}
              dataObj={this.state.uniqueDunitList}
              handleToggleUniqueDunits={this.handleToggleUniqueDunits}
              implementContinue={this.implementContinue}
              toggleLoadingModal={this.props.toggleLoadingModal}
              />
          :<></>}

          {this.state.showTagWarn?<TagWarning t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} 
            dataObj={this.state.dataObj}
            newData={this.state.newData}
            showTagWarn={this.state.showTagWarn}
            toggleTagWarn={this.toggleTagWarn}
            />:<></>}
            
          {this.state.showDisStoreSelWarn?<DisconStoreSelectWarn t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} 
            showDisStoreSelWarn={this.state.showDisStoreSelWarn}
            toggleDisStoreWarn={this.toggleDisStoreWarn}
            />:<></>}

          {this.state.showCatAssignWarn?<CategoryAssingWarn t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} 
            showCatAssignWarn={this.state.showCatAssignWarn}
            toggleCatAssignWarn={this.toggleCatAssignWarn}
            />:<></>}

          {this.state.showImplemSucMsg?<ImplementSuccesMsg t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} 
            showImplemSucMsg={this.state.showImplemSucMsg}
            toggleImplemSucMsg={this.toggleImplemSucMsg}
            />:<></>}
          
          {IsIsleAllocationModal?
            <IsleAlocateModal
              defSaveObj={this.state.defSaveObj}
              departmentId={this.state.sobj.departmentId} 
              isShow={this.state.IsIsleAllocationModal}  
              implemAisleStores={this.state.implemAisleStores}
              mpstate={this.props.mpstate} 
              dataObj={this.state.dataObj}
              mpId={this.state.sobj.mpId?this.state.sobj.mpId:0} 
              handleShow={this.triggerisleAllocationModal} 
              hadleUpdateImplementData={this.updateImplementData}
              completedStatus={this.state.showImplemSucMsg}
              isRTL={this.props.isRTL}
              />
          :<></>}

          {this.state.showIssueStores?
            <IssueStoresList t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} 
              showIssueStores={this.state.showIssueStores}
              issueStoreList={this.state.issueStoreList}
              handleToggleIssueStores={this.handleToggleIssueStores}
              updateImplementData={this.updateImplementData}
              />
          :<></>}

          {this.state.AuiMarkImpStoreWarning?
            <DisConStoreWarningimpModal t={this.props.t} isRTL={this.props.isRTL} 
              disconnectWarningobj={this.state.disconnectWarningobj} 
              selectedstorecon={this.state.selectedstorecon} 
              isshow={this.state.AuiMarkImpStoreWarning} 
              hadleAuiMarkImpStoreWarning={this.hadleAuiMarkImpStoreWarning}
              handlemarkselectingconflictmodal={this.handlemarkselectingconflictmodal} 
              handleConfStoretab={this.handleConfStoretab}
              handlemarkselectingconflictmodalAll={this.handlemarkselectingconflictmodalAll} 
              ClickApplyDiscon={this.ClickApplyDiscon} 
              />
          :<></>}

          {/* no fields view */}

          {this.state.isShowPreviewSimulation?
            <AllSimulationModal t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} 
              simType="AUI" 
              depDirectType={this.props.depDirectType}
              isFromStandaloneView={true}
              importedDataObj={this.props.importedDataObj}
              storeId={this.state.storeId}
              selectedTagGroup={this.state.selectedTagGroup}
              reloadSimAndTag={this.reloadSimAndTag}
              saveSimulationObjToSideBarComp={this.saveSimulationObjToSideBarComp}
              originatedMpId={this.state.originatedMpId}
              originatedMpName={this.state.originatedMpName}
              simOption={this.state.simOption}
              originatedSnapshotId={this.state.originatedSnapshotId}
              newSnapshotId={this.state.newSnapshotId}
              reloadSimAndStore={this.reloadSimAndStore}
              storeName={this.state.storeName}
              department={this.state.defSaveObj.department}
              bottomFieldCount={this.state.fieldCount}
              defSaveObj={this.state.defSaveObj} 
              mpstate={this.props.mpstate} 
              chartFilterDates={this.props.chartFilterDates}
              isallsimulatemodal={true} 
              isDirectSimulation={true}
              loadedTagsList={[]} //tag list for drop down for selection
              openOneCategory={this.state.openOneCategory} 
              haveChnagesinCat={this.state.haveChnagesinCat}
              signedobj={this.props.signedobj} 
              selectedTagList={this.state.tagList}
              isFixed={this.state.isFixed}
              handlehaveChnagesinCat={this.handlehaveChnagesinCat}
              toggleOneCategory={this.toggleOneCategory} 
              toggleSimulateAllModal={this.toggleSimPreviewView} 
              toggleLoadingModal={this.props.toggleLoadingModal}
              sendmarkStackableCall={this.sendmarkStackableCall}
              tagStoreGroup={this.state.tagStoreGroup}
              resetStore={this.resetStore}
              isSalesCycle={this.state.isSalesCycle}
              notagid={this.state.notagid}
              isShowFromPreview={true}
              selectedSimPreviewObj={this.state.selectedSimPreviewObj}
              changeSaleCycleActive={this.changeSaleCycleActive}
              disableSalesCycleState={this.state.disableSalesCycle}
              disableSalesCycle={this.disableSalesCycle}
              updateSimDisabled={this.updateSimDisabled}
              updateImportedDataObj={this.props.updateImportedDataObj}
              isNewProdSim={true}
              updateIsChainSaleCycle={this.updateIsChainSaleCycle}
              />
          :<></>}
          
          <AcViewModal showmodal={this.state.isLoading} message={this.props.t('PLEASE_WAIT')} />

          <Modal className="dropwarning MPAlertBox resetwarn-prod" show={this.state.isShowResetWarnModal} onHide={() => this.toggleResetProdWarn(false,false,true)}
              size="md" aria-labelledby="contained-modal-title-vcenter" centered backdrop="static" >
              <Modal.Header closeButton>
                  <Modal.Title></Modal.Title>
              </Modal.Header>
              <Modal.Body>
                  <div className='messagediv'>
                     <div className='icondiv'><MPWarnIcon width={127} height={107} /></div>
                     <h4>{this.props.t("SELECTED_STORE_NEED_REST_BEFORE_SELECT_CURRENT_SIM")} 
                     <span className='bold_text'>{this.props.t("DO_YOU_WANTS_TO_CONTINUE")}</span></h4>
                  </div>
              </Modal.Body>
              <Modal.Footer>
                  <Button  className='btn noaction' onClick={() => this.toggleResetProdWarn(false,false,true)}>{this.props.t("btnnames.close")}</Button>
                  <Button className='btn action' onClick={() => this.continueResetProdWarn()}>{this.props.t("RESET_AND_CONTINUE")}</Button>
              </Modal.Footer>
          </Modal>
        </Col>
    )
  }
}
const mapDispatchToProps = dispatch => ({
  // setMpClipBoardsforCats: (payload) => dispatch(mpsetClipBoardandotherforCatSetAction(payload)),
  setNewProductNotificationAction:(payload)=>dispatch(setNewProductNotificationCount(payload)),
  setAuiConvertedetails: (payload) => dispatch(AuiConvertedetailsSetAction(payload)),
});
export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(AuiSideBarComponent)))
