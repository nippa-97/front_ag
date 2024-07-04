import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import {Col, Breadcrumb, Form, Button, Row } from 'react-bootstrap';
//import Select from 'react-select';
import { confirmAlert } from 'react-confirm-alert';

import { AcNoDataView, AcTable, AcViewModal} from '../../../UiComponents/AcImports';
//import { PlusIcon , XIcon, TriangleDownIcon, TriangleRightIcon, TriangleLeftIcon} from '@primer/octicons-react';

import './styles.scss';
import { alertService } from '../../../../_services/alert.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { FindMaxResult, measureConverter, preventinputToString, preventinputotherthannumbers, roundOffDecimal } from '../../../../_services/common.service';

import {  withTranslation } from "react-i18next";
import "../../../../_translations/i18n";

import MDSidebarMenu from '../../../common_layouts/mdsidebarmenu';
import Category from '../AddNew/category';
import SubCategory from '../AddNew/subcategory';

import AddCategoryFieldModal from '../AddCategoryModal/addcategorymodal';

// import doubleRightIcon from '../../../assets/img/icons/double-right.png';
import { viewSetChainDepPrevAction} from '../../../../actions/dept/dept_action';
import { connect } from 'react-redux';
import SwitchParentModal from '../switchParentModal/switchParentModal';
import ResultSummery from '../resultSummery/resultSummery';
import StackableModal from '../stackablemodal/stackableModal';
import { stackableLevels } from '../../../../enums/departmentCategoriesEnums';

/**
 * department add/update components
 *
 * @class DepartmentDetailsComponent
 * @extends {React.Component}
 */

//const categoriesTemp = [{categoryName:"Category 1 Test",isDelete:false,id:-1,isNew:false,subCategory:[{subCategoryName:"Sub Category 1",id:-1,isDelete:false,isNew:false,brands:[{brandId:1,brandName:"brnad 1",supId:1,supName:"sup 1",isDelete:false,isNew:false,},{brandId:2,brandName:"brnad 2",supId:1,supName:"sup 1",isDelete:false,isNew:false,}]},{subCategoryName:"Sub Category 2",id:-1,isDelete:false,isNew:false,brands:[{brandId:1,brandName:"brnad 1",supId:1,supName:"sup 1",isDelete:false,isNew:false,}]}]},{categoryName:"Category 1",isDelete:false,id:-1,isNew:false,subCategory:[{subCategoryName:"Sub Category 1",id:-1,isDelete:false,isNew:false,brands:[{brandId:1,brandName:"brnad 1",supId:1,supName:"sup 1",isDelete:false,isNew:false,},{brandId:2,brandName:"brnad 2",supId:1,supName:"sup 1",isDelete:false,isNew:false,}]},{subCategoryName:"Sub Category 2",id:-1,isDelete:false,isNew:false,brands:[{brandId:1,brandName:"brnad 1",supId:1,supName:"sup 1",isDelete:false,isNew:false,}]}]}];
//const brnandlist = [{value :0, label:null},{value :1, label:"brand 1"}, {value :2, label:"brand 2"}];

export class DepartmentDetailsComponent extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            isButtonDisable:false,
            viewType:"dep",//cat,subcat,brand
            isedit: false,
            isModalEdit:false,
            cdepobj:this.defaultDepartmentObjectLoad(),
            sobj: this.defaultFilterObjectLoad(), vobj: {},
            alldepratmentList: [{value :0, label:"-"}],
            departmentslist : [{value :0, label:"-"}],
            brnandlist : [{value :0, label:"-"}],

            isdataloaded: false, //is table data loaded
            isnottesting: true,
            ftablebody: [], //showing page table data
            toridata:[],startpage: 1, totalresults: 0, //startpage and total results 

            catobj:this.defaultCategoryObjectLoad(),
            initialCatObj:this.defaultCategoryObjectLoad(),
            subcatobj:this.defaultSubCategoryObjectLoad(),

            //new category add
            showCatNewModal: false,
            loadDunitList:[], 
            fieldStartIdx: 0, fieldMaxResults: 12, fieldTotalCount: 0,
            singleFieldWidth: 300, singleFieldHeight: 310, minWidthCheckValue: 160, oldCatLength: 0,
            activeTabKey: "fieldselect", 

            divWidth: 0, divHeight: 0, displayUOM: "cm", displayRatio: 0,
            svgwidth: "100%",
            fieldLevelObj: null, fieldEyeLevels: [],
            
            isFromLog:false, 
            oneresultheight:55, maxShowresultcount:0,orimaxShowresultcount:0,//find max result varibles

            showSwitchModal:false,
            chaindeps:[],
            parentupdatebulkobj:null,
            showresultSummeryModal:false,
            summeryres:null,
            showStackableModal:false,
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            this.setState({
                divWidth: 380,
                divHeight: 350,
            });

            //md load
            this.getDunits();

            //get edit object if available
            var cisedit = (this.props.deptState&&this.props.deptState.chainDepartmentDetails?true:false);
            this.setState({
                isedit: cisedit,
                //sobj: (cisedit?this.props.deptState.chainDepartmentDetails:this.defaultCategoryObjectLoad())
            });
            //console.log(this.props.deptState);
            if(this.props.deptState && this.props.deptState.chainDepartmentDetails && cisedit===true){  
                let csobj = this.defaultFilterObjectLoad();
                csobj.departmentId = this.props.deptState.chainDepartmentDetails.chainDepartmentId;
                let cdobj = this.props.deptState.chainDepartmentDetails;

                var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145)
                this.setState({
                    sobj:csobj,
                    cdepobj:cdobj,
                    maxShowresultcount:maxresutcount.maxresultCount,orimaxShowresultcount:maxresutcount.maxresultCount
                },()=>{
                    this.handleTableSearch(null,"click");
                    this.initExistingEditMode();
                });
            }

            this.loadBrands();
            this.loadallchaindepartments()
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    //handleresultSummeryModal
    handleresultSummeryModal=()=>{
        this.setState({showresultSummeryModal:!this.state.showresultSummeryModal})
    }

    initExistingEditMode = () =>{
        const queryParams = new URLSearchParams(window.location.search);
        const isFromLog = queryParams.get('isFromLog');
        
        if(isFromLog==="true" && this.props.navigatedata){
            if((this.props.navigatedata.main_type === "Category" || this.props.navigatedata.main_type === "SubCategory") && this.props.navigatedata.main_obj){
                this.setState({catobj:this.props.navigatedata.main_obj.category, isModalEdit:true, isButtonDisable:false, isFromLog:isFromLog},()=>{
                    this.changeViewType("cat");
                });
            }
        }
        
    }

    //default department object
    defaultDepartmentObjectLoad = () => {
        return {
            startIndex: 0,
            maxResult: 0,
            categories: [],
            isDelete: false,
            isNew: false,
            chainDepartmentId: 0,
            departmentId: 0,
            departmentName: "",
            departmentColor: "#FFF",
            displayName: ""
        };
    }

    //default filter object
    defaultFilterObjectLoad = () => { 
        return {searchValue:"", isReqPagination:true,  maxResult:8,startIndex:0, isReqCount:false,};
    }

    //default category obj 
    defaultCategoryObjectLoad = () =>{
        return {id:-1,categoryName:"",color:"#FFF", isDelete: false, isNew: true, subCategory:[], maxResult:8,startIndex:0};
    }

    //default sub category obj 
    defaultSubCategoryObjectLoad = () =>{
        return {isDelete: false,isNew: true,brands: [],subCategoryId: 0,categoryId: 0,subCategoryName: ""};
    }

    //get all Dunits
    getDunits = () => {
        var csobj = { isReqPagination: true, startIndex: this.state.fieldStartIdx, maxResult: this.state.fieldMaxResults };
        submitSets(submitCollection.mpFieldList, csobj).then(res => {
            //console.log(res.extra);

            if (res && res.status) {
                var list = this.state.loadDunitList.concat(res.extra);
                list.forEach(ele => { ele["isSelected"] = false });

                this.setState({ 
                    loadDunitList: list, 
                    fieldTotalCount: (this.state.fieldStartIdx === 0?res.count:this.state.fieldTotalCount),
                });
            }
        });
    }
    //display unit load more items
    loadMoreDunits = () => {
        this.setState({ fieldStartIdx: (this.state.fieldStartIdx + this.state.fieldMaxResults) }, () => {
            this.getDunits();
        });
    }

    //load brands
    loadBrands = () => {
        let sobj = {isReqPagination:false }
        submitSets(submitCollection.findAllBrands, sobj, true).then(res => {
            if(res && res.status){
                let brnd = res.extra; 
                let tempbrands = [{value :0, label:"-"}];
                for (let i = 0; i < brnd.length; i++) {
                    tempbrands.push({value :brnd[i].brandId, label:brnd[i].brandName});
                }

                this.setState({brnandlist:tempbrands});
            } 
        });
    }
    loadallchaindepartments=()=>{
        this.setState({loading:true},()=>{
            var sobj={
                departmentName:"", isReqPagination:false,
            }
            submitSets(submitCollection.searchChainDepatments, sobj, true).then(res => {
                var depdata = [];
                var alldepdata=[];
                if(res && res.status){
                    if(res.extra.length>0){
                        res.extra.forEach(dep => {
                            var depd={
                                value: dep.departmentId,label:dep.departmentName
                            }
                            if(dep.departmentId!==this.state.cdepobj.departmentId){
                                depdata.push(depd)
                            }
                            alldepdata.push(depd)
                                
                        });
                    }
                    
                    this.setState({
                        departmentslist : depdata,chaindeps:res.extra,
                        alldepratmentList:alldepdata
                    })
                }else{
                    alertService.error(this.props.t("erroroccurred"))
                }
            })
        })
        
    }

    //set filter object
    handleFilterObject = (evt,etype,ctype,msg) => {
        var cobj = this.state.sobj;

        if(etype === "searchValue"){
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
            var maxresutcount=this.state.maxShowresultcount
            var csobj=this.state.sobj
            csobj.maxResult=maxresutcount
            this.setState({
                sobj:csobj,
                isdataloaded: false,
                loading:true
            });


            submitSets(submitCollection.getAllCategoriesFromDepartment, this.state.sobj, true).then(res => {
                var cdata = [];
                if(res && res.status){
                    var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                    if(cpageidx > -1){
                        cdata[cpageidx].data = res.extra;
                    } else{
                        cdata.push({page:(this.state.startpage),data:res.extra});
                    }
                    
                    this.setState({
                        toridata: cdata,
                        totalresults: (this.state.startpage === 1 || this.state.sobj.isReqCount===true ?res.count:this.state.totalresults),
                        loading:false
                    }, () => {
                        this.loadTableData();
                        let serachobj = this.state.sobj;
                        serachobj.isReqCount = false;
                        this.setState({sobj:serachobj});
                    });
                } else{
                    this.setState({
                        toridata: cdata,loading:false
                    }, () => {
                        this.loadTableData();
                    });
                }
            });
        }
    }

    //on pagination page change or after tabledata loaded, 
    //this function use to select current selected page table data from toridata
    loadTableData = () => {
        var cdata = [];
        if(this.state.toridata && this.state.toridata.length > 0){

            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
            if(cfindList){
                for (var i = 0; i < cfindList.data.length; i++) {
                    const citem = cfindList.data[i];
                    cdata.push({
                        0:citem,
                        1:citem.categoryName,
                        2:(citem.fieldId > 0?citem.field.fieldName.substring(0,25):"-"),
                        3:(citem.fieldId > 0?citem.isEyeLevelRank:"-"),
                        4: {type:"button", variant:"secondary", action:"switch", size:"sm", icon:"repeat", iconsize: 14, text:""},
                        5: {type:"button", variant:"secondary", action:"edit", size:"sm", icon:"edit-2", iconsize: 14, text:""},
                        6: {type:"button", variant:"secondary", action:"stack", size:"sm",title:this.props.t("IS_stackable"), icon:"layers", iconsize: 14, text:"",did:citem.id},
                        // 6: {type:"button", variant:"secondary", action:"delete", size:"sm", icon:"trash-2", iconsize: 14,  text:""},
                    });
                }
            }

        }
        this.setState({ ftablebody: cdata }, () => {
            this.setState({isdataloaded: true});
        });
    }

    //pagination page change handle
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
        });
    }

    //reset table filters 
    resetTableFilters = () => {
        let sobj = this.defaultFilterObjectLoad();
        sobj.departmentId = this.props.deptState.chainDepartmentDetails.chainDepartmentId;
        this.setState({ sobj: sobj, startpage: 1}, () => {
            this.handleTableSearch(null,"click");
        });
    }

    //dep change
    handleDepartmentChange = (e) =>{
        let tempObj = this.state.cdepobj;
        tempObj.departmentId = e.value;
        tempObj.displayName = e.label;
        this.setState({cdepobj:tempObj});
    }

    //change view types
    changeViewType = (type,isRefresh, actiontype) =>{
        this.setState({viewType:type});
        if(isRefresh){
           
            if(actiontype==="delete"){
                let serachobj = this.state.sobj;
                const stindx = serachobj.startIndex;
                const maxresult = serachobj.maxResult;
                
                if(this.state.ftablebody.length===1 && this.state.startpage>1 ){
                    serachobj.startIndex = (stindx - maxresult);
                    serachobj.isReqCount = true;
                    this.setState({sobj:serachobj , startpage:(this.state.startpage - 1)},()=>{
                        this.handleTableSearch(null,"click");
                    });
                }
                else{
                    serachobj.isReqCount = true;
                    this.setState({sobj:serachobj},()=>{
                        this.handleTableSearch(null,"click");
                    });
                }
            }
            else{
                this.handleTableSearch(null,"click");
            }
        }
    }

    //initialize new modal
    initNewCatModal = () =>{
        if(this.state.cdepobj.departmentId>0){
            var depobj = this.state.cdepobj;
            depobj.categories = [];
            this.setState({catobj:this.defaultCategoryObjectLoad(), cdepobj:depobj, isModalEdit:false, isButtonDisable:false});
            this.handleModalToggle();
        }
        else{
            alertService.warn(this.props.t('SELECT_DEPARTMENT'));
        }
    }

    //toggle add/edit modal
    handleModalToggle = () => {
        this.setState({showCatNewModal: !this.state.showCatNewModal})
    }

    AddCategory = (type) => {
        
        if(type === 3){
            
            let isNameChanged = false;
            let isColorChanged = false;
            let isFieldRemoved = false;
            let noFields = false;

            if(!this.state.initialCatObj.field && !this.state.catobj.field){
                noFields = true; 
            }

            if(noFields){
                if(this.state.initialCatObj.categoryName !== this.state.catobj.categoryName){
                    isNameChanged = true;
                }
            
                if(this.state.initialCatObj.color !== this.state.catobj.color){
                    isColorChanged = true;
                }

                if(!isNameChanged && !isColorChanged){
                    alertService.warn(this.props.t("NO_CHANGES_AVAILABLE"));
                    return false;
                }
            }else{
                if(this.state.initialCatObj.categoryName !== this.state.catobj.categoryName){
                    isNameChanged = true;
                }
            
                if(this.state.initialCatObj.color !== this.state.catobj.color){
                    isColorChanged = true;
                }

                if(this.state.initialCatObj.field && !this.state.catobj.field){
                    isFieldRemoved = true;   
                }

                if(!isNameChanged && !isColorChanged && !isFieldRemoved){
                    alertService.warn(this.props.t("NO_CHANGES_AVAILABLE"));
                    return false;
                }
            }
           
        }

        if(type === 2){
            let isNameChanged = false;
            let isColorChanged = false;
            let isFieldChanged = false;

            if(this.state.initialCatObj.categoryName !== this.state.catobj.categoryName){
                isNameChanged = true;
            }
        
            if(this.state.initialCatObj.color !== this.state.catobj.color){
                isColorChanged = true;
            }

            if(this.state.initialCatObj.field){

                let selectedfield = this.state.loadDunitList.find(x => x.isSelected);

                if(!selectedfield || (selectedfield && this.state.fieldEyeLevels && this.state.fieldEyeLevels.length > 0)){
                    let fieldeyelevel = (selectedfield?this.state.fieldEyeLevels[0]:false);

                    let sldEyeLevelRank = (fieldeyelevel?fieldeyelevel.rank:0);
                    let sldFieldId = (selectedfield?selectedfield.fieldId:-1);

                    if(this.state.initialCatObj.field.id !== sldFieldId){
                        isFieldChanged = true;
                    }else{
                        if(this.state.initialCatObj.isEyeLevelRank !== sldEyeLevelRank){
                            isFieldChanged = true;
                        }
                    }

                }else{
                    isFieldChanged = true;
                }

            }else{
                isFieldChanged = true;
            }

            if(!isNameChanged && !isColorChanged && !isFieldChanged){
                alertService.warn(this.props.t("NO_CHANGES_AVAILABLE"));
                return false;
            }
        }
            

        if(this.state.catobj.categoryName !== ""){
            let selectedfield = this.state.loadDunitList.find(x => x.isSelected);

            if(!selectedfield || (selectedfield && this.state.fieldEyeLevels && this.state.fieldEyeLevels.length > 0)){
                let fieldeyelevel = (selectedfield?this.state.fieldEyeLevels[0]:false);

                let catobj = this.state.catobj;
                catobj["isEyeLevelRank"] = (fieldeyelevel?fieldeyelevel.rank:0);
                catobj["fieldId"] = (selectedfield?selectedfield.fieldId:-1);
                catobj["field"] = selectedfield;

                var depobj = this.state.cdepobj;
                depobj.categories.push(catobj);
                
                this.setState({cdepobj: depobj});
    
                if(this.state.cdepobj.chainDepartmentId>0){
                    this.handleDepartmentUpdate();
                }
                else{
                   // this.handleDepartmentSave();
                }  
            } else{
                alertService.error(this.props.t("select_eye_level_to_continue"));
            }
        }
        else{
            alertService.warn(this.props.t('enter_catgory_name_placeholder'));
        }
    }
    //handling delete category
    handleDeleteCategory=(item)=>{
        confirmAlert({
            title: this.props.t('suretodelete'),
            message: this.props.t('THIS_ACTION_WILL_DELETE_THIS_CATEGORY_SURE'),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.handleDeleteCategorybulkCall([{id:item[0].id,name:item[0].categoryName}])
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
        
    }
    //handleDeleteCategorubulkCall
    handleDeleteCategorybulkCall=(ids)=>{
        var payload={
            categoryIds:ids
        }
        this.setState({loading:true},()=>{
            submitSets(submitCollection.bulkCategoryDelete, payload, true).then(res => {
                if(res){
                    if(res.extra.length>1){
                        
                    }else{
                        if(res.extra[0].success){
                            alertService.success(res.extra[0].response[0]?res.extra[0].response[0]:this.props.t("SUCCESSFULLY_DELETED"))
                            this.handleTableSearch(null,"click");
                            this.setState({loading:false})
                        }else{
                            alertService.error(res.extra[0].response[0]?res.extra[0].response[0]:this.props.t("erroroccurred"))
                            let respobj = { responseType: "category", prods: res.extra,actionType: "Delete", };
                            this.setState({loading:false,summeryres:respobj,showresultSummeryModal:true},()=>{
                                // this.handleresultSummeryModal()
                            })
                        }
                    }
                }else{
                    this.setState({loading:false})
                    alertService.error(this.props.t("erroroccurred"))
                }
            })
        })
    }
    //switching category parent one select
    handlSwitchCategoryParent=(citem)=>{
        var ccatobj=this.state.catobj
        ccatobj=citem[0]
        this.setState({catobj:ccatobj},()=>{
            this.handleSwitchModal()
        })
    }
    //on tablerow click handle set object to redux and redirect to edit view
    handleRowClick = (cidx,citem,caction) => {
        // console.log(cidx,citem,caction);
        if(caction){
            if(caction==='edit'){
                this.handleEdtCategorymodalopen(citem)
            }
            if(caction==='delete'){
                this.handleDeleteCategory(citem)
            }
            if(caction==='switch'){
                this.handlSwitchCategoryParent(citem)
            }
            if(caction==="stack"){
                this.handleStackabledepproducts(this.state.ftablebody[cidx])
            }
        }else{
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
            if(cfindList){
                if(citem && citem[0].id && citem[0].id !== ""){
                    let finditem = cfindList.data.find(z => z.id === citem[0].id);
                    if(finditem){
                        //console.log(finditem);
                        this.setState({catobj:finditem, isModalEdit:true, isButtonDisable:false},()=>{
                            this.changeViewType("cat");
                        });
                    }
                } else{
                    this.setState({catobj:cfindList.data[cidx], isModalEdit:true, isButtonDisable:false});
                    this.changeViewType("cat");
                }
            }
        }
        
    }
    handleEdtCategorymodalopen=(citem)=>{
        this.handleModalToggle()
        var ccatobj=this.state.catobj
        ccatobj=citem[0]
        this.setState({catobj:ccatobj, initialCatObj:{...ccatobj}, isModalEdit: true},()=>{
            if(ccatobj.field){
                let newfieldobj = {
                    fieldId: ccatobj.field.id
                };
                this.handleSelectfield(newfieldobj, ccatobj.isEyeLevelRank);
            } else{
                this.handleSelectfield(null);
            }
        })
        // catobj
    }

    changeCatColor = (color) =>{
        let ssobj = this.state.catobj;
        ssobj.color = color;
        this.setState({catobj:ssobj});
    }

    handleDepartmentUpdate = () =>{
        let sobj =  JSON.parse(JSON.stringify(this.state.cdepobj));
        
        if(sobj.departmentId===undefined || sobj.departmentId<1){
            alertService.warn(this.props.t('select_departement_warn'));
            return false;
        }

        let validated  = true;
        let categories = sobj.categories;

        if(categories===undefined || categories.length<1){
            alertService.warn(this.props.t('add_categories_warn'));
            return false;
        }

        let deletedcats = 0;
        for (let h = 0; h < categories.length; h++) {   
            if(categories[h].isDelete === true){
                deletedcats++;
            }
        }

        if(categories.length === deletedcats){
            alertService.warn(this.props.t('add_categories_warn'));
            return false;
        }

        for (let c = 0; c < categories.length; c++) {
            if(categories[c].categoryName==="" && categories[c].isDelete===false){
                alertService.warn(this.props.t('category_name_empty_warn'));
                validated = false;
                return false;
            }
            else{
                for (let s = 0; s < categories[c].subCategory.length; s++) {
                    if(categories[c].subCategory[s].subCategoryName==="" && categories[c].subCategory[s].isDelete===false){
                        alertService.warn(this.props.t('subcategory_name_empty_warn'));
                        this.handleMainCatCollapse(c,false);
                        validated = false;
                        return false;
                    }
                    else{
                        for (let b = 0; b < categories[c].subCategory[s].brands.length; b++) {
                           if((categories[c].subCategory[s].brands[b].brandId<1 || categories[c].subCategory[s].brands[b].brandId===undefined) && categories[c].subCategory[s].brands[b].isDelete === false){
                            alertService.warn(this.props.t('brand_empty_warn'));
                            this.handleSubCatCollapse(c,s,false);
                            validated = false;
                            return false;
                           }
                        }
                    }
                }
            }
        }

        if(validated===false){
            return false;
        }
        this.setState({isButtonDisable:true});
        submitSets(submitCollection.updateChainDepatments, sobj, true, null, true).then(resp => {
            this.setState({isButtonDisable:false});
            if(resp && resp.status){
                alertService.success(this.props.t('SUCCESSFULLY_UPDATED'));
                let serachobj = this.state.sobj;
                serachobj.isReqCount = true;
                var updatedsobj=sobj
                updatedsobj.categories=[]
                this.setState({sobj:serachobj,cdepobj:updatedsobj},()=>{
                  
                    this.handleTableSearch(null,"click");
                });
                
                this.handleModalToggle();
            } 
            else{
                // if(resp.extra){
                //     if(resp.extra==="DEP_WITH_CAT_EXISTS"){
                //         alertService.error(this.props.t('DEP_WITH_CAT_EXISTS'));
                //     }
                //     else{
                //         alertService.error(resp.extra);
                //     }
                // }
                // else{
                //     alertService.error(this.props.t('ERROR_OCCURRED'));
                // }
                //alertService.error((resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
    }

     //delete department
    //  handleDepartmentDelete = (resp) => {
    //     if(resp && resp.status){
    //         alertService.success(this.props.t('SUCCESSFULLY_DELETED'));
    //         //this.props.history.push("/chaindepartments");
    //         this.initBack("/chaindepartments","delete");
    //     } else{
    //         if(resp&&resp.extra==="CANT_DELETE_REFERENCE"){
    //             alertService.error(this.props.t("CANT_DELETE_REFERENCE"));
    //         }
    //         else{
    //             alertService.error((resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
    //         }
    //     }
    // }

    //set subcategory obj
    setSubCategoryObj = (obj) =>{
        if(obj){
            this.setState({subcatobj:obj});
        }
        else{
            this.setState({subcatobj:this.defaultSubCategoryObjectLoad()});
        }
    }

    goTo = (path) =>{
        //if(this.state.totalresults===0){
            // confirmAlert({
            //     title: this.props.t('CONFIRM_TO_SUBMIT'),
            //     message: this.props.t('NO_CATS_AVL_ARE_YOU_SURE_CONTINUE'),
            //     buttons: [{
            //         label: this.props.t('btnnames.yes'),
            //         onClick: () => {
            //            this.props.history.push(path);
            //         }
            //     }, {
            //         label: this.props.t('btnnames.no'),
            //         onClick: () => {
            //             //
            //         }
            //     }
            //     ]
            // });
        //}
        //else{
        //}
        if(path==="/chaindepartments"){
            this.initBack(path,"back");
        }
        else{
            this.props.history.push(path);
        }
    }

    handleLongeNames = (txt) =>{
        if (txt.length > 20) {
            var shortname = txt.substring(0, 23) + " ...";
            return shortname;
        }
        else{
            return txt;
        }
    }

    handleModalReset = () => {
        if(!this.state.isModalEdit){
            this.handleSelectfield(null);
        }
        this.setState({ activeTabKey: "fieldselect" }); // fieldEyeLevels: []
    }

    toggleActiveTab = (ctab) => {
        let selectedfield = this.state.loadDunitList.find(x => x.isSelected);
        //validate category and field
        if(ctab === "fielddraw"){
            if(this.state.catobj.categoryName && this.state.catobj.categoryName !== ""){
                if(selectedfield){
                    this.calcFieldObject(selectedfield);
                } else{
                    // alertService.error(this.props.t("selectfield"));
                    // return false;
                    this.AddCategory(3);
                }
            } else{
                alertService.error(this.props.t("category_name_empty_warn"));
                return false;
            }
        }

        if(ctab === "fieldselect" || (ctab === "fielddraw" && selectedfield)){
            this.setState({ activeTabKey: ctab });
        }
    }
    // creating field
    calcFieldObject = (fieldObj) => {
        let exportfield = JSON.parse(JSON.stringify(fieldObj));
        //calculate dimention
        var dimention = (this.state.divHeight / measureConverter(exportfield.uom,this.state.displayUOM,exportfield.height));
        
        //current field width/height
        exportfield["drawHeight"] = measureConverter(exportfield.uom,this.state.displayUOM,exportfield.height) * dimention;
        exportfield["drawWidth"] = measureConverter(exportfield.uom,this.state.displayUOM,exportfield.width) * dimention;
        
        if (exportfield.fieldShelves) {
            let cshelfs = (exportfield.fieldShelves?exportfield.fieldShelves:[]);
            
            let prevGap = 0;
            for (let i = 0; i < cshelfs.length; i++) {
                const shelf = cshelfs[i];
                let drawHeight = measureConverter(exportfield.uom,this.state.displayUOM,shelf.height) * dimention;
                let drawGap = measureConverter(exportfield.uom,this.state.displayUOM,shelf.gap) * dimention;

                //pick x, y
                shelf.x = 0;
                shelf.y = roundOffDecimal(prevGap,2);
                
                shelf.drawWidth = exportfield.drawWidth;
                shelf.drawHeight = roundOffDecimal(drawHeight,2);
                shelf.drawGap = roundOffDecimal(drawGap,2);

                prevGap = prevGap + (drawHeight + drawGap);
            }
        }
        //console.log(exportfield);
        this.setState({ fieldLevelObj: exportfield }); // , fieldEyeLevels: []
    }
    //
    handleSelectRow = (sidx, sitem) => {
        let ceyelevels = [];

        //check already added
        let fieldshelveidx = this.state.fieldEyeLevels.findIndex(x => x.rank === sitem.rank);
        if(fieldshelveidx > -1){
            ceyelevels.splice(fieldshelveidx,1);
        } else{
            ceyelevels.push(sitem);
        }
        
        this.setState({ fieldEyeLevels: ceyelevels }, () => {
            // this.AddCategory();
        });
    }
    //selecting field
    handleSelectfield = (field, eyelevels)=>{
        var list=this.state.loadDunitList
        for (let i = 0; i < list.length; i++) {
            const ele = list[i];
         if(field && ele.fieldId === field.fieldId){
            ele.isSelected = true;
         } else{
            ele.isSelected = false;
         }  
        }
        
        this.setState({loadDunitList: list, fieldEyeLevels: []}, () => {
            if(eyelevels && eyelevels > 0){
                this.handleSelectRow(null, { rank: eyelevels });
            }
            /* if(ismanual){
                this.toggleActiveTab("fielddraw");
            } */
        })
    }
    
    initBack = (path,viewType) =>{
        if(this.props.deptState.chainDepPrevData){
            let prevdata = this.props.deptState.chainDepPrevData;
            prevdata.viewType = viewType;
            this.props.setChainPrevFilters(prevdata);
            this.props.history.push(path);
        }
        else{
            this.props.history.push(path);
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

    handleSwitchModal=()=>{
        if(this.state.showSwitchModal){
            this.setState({parentupdatebulkobj:null})
        }
        this.setState({showSwitchModal:!this.state.showSwitchModal},()=>{
           
        })
    }
    handleParentChange=(evt)=>{
        var obj={
            oldDeptParent:this.state.cdepobj.departmentId,
            newDeptParent:evt.value,
            categoryIds:[
                {
                    id: this.state.catobj.id,
                    name:this.state.catobj.categoryName
                }        
            ]
        }
        this.setState({parentupdatebulkobj:obj}) 
    }
    handleswitchparentupdate=()=>{
        if(this.state.parentupdatebulkobj===null){
            //validate msg
            alertService.error(this.props.t("please_select_a_dep_to_switch"))
        }else{
            confirmAlert({
                title: this.props.t('suretochangeparent'),
                message: this.props.t('THIS_ACTION_WILL_CHANGE_PARENT_CURRENT_TO_NEW'),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        this.sendbulkCategoryParentUpdatecall(this.state.parentupdatebulkobj)    
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {
                        return false;
                    }
                }]
            })
        }
        
        
    }
    sendbulkCategoryParentUpdatecall=(obj)=>{
        this.setState({loading:true},()=>{
            submitSets(submitCollection.bulkCategoryParentUpdate, obj, true, null ,true).then(res => {
                if(res){
                    if(res.status){
                        if(res.extra.length>1){
                            //bulk update
                         }else{
                             if(res.extra[0].success){
                                //  alertService.success(res.extra[0].response[0]?res.extra[0].response[0]:this.props.t("succussfuly"))
                                alertService.success(this.props.t("SUCCESSFULLY_UPDATED"));
                                 this.setState({loading:false,showSwitchModal:false,parentupdatebulkobj:null},()=>{
                                     this.handleTableSearch(null,"click");
                                 })
                             }else{
                                 alertService.error(res.extra[0].response[0]?res.extra[0].response[0]:this.props.t("erroroccurred"))
                                 let respobj = { responseType: "category", prods: res.extra,actionType: "changeParent", };
                                 this.setState({loading:false,summeryres:respobj,showresultSummeryModal:true},()=>{
                                    //  this.handleresultSummeryModal()
                                 })
                             } 
                         }
                    }else{
                        this.setState({loading:false})
                        // alertService.error(res.extra)
                    }
                    
                }else{
                    this.setState({loading:false})
                    alertService.error(this.props.t("erroroccurred"))
                }
            })
        })
    }

    updateCatObjFromChild = (changeobj) => {
        this.setState({ catobj: changeobj });
    }
    //handling stackable products marking or removing
    handleStackabledepproducts=(obj)=>{
        this.setState({showStackableModal:true,selectedrowid:obj[0].id,selectedName:obj[1]})
    }
    handleToggleStackableModal=()=>{
        this.setState({showStackableModal:false})
    }
    render(){
        const ftableheaders = [{text: "", width: "1%"}, this.props.t('categoryName'), this.props.t('dunitname'), this.props.t('EYE_LEVEL'),{text: "", width: "1%"},{text: "", width: "1%"},{text: "", width: "1%"}];

        return (<>
            <Col xs={12} className={"main-content depatartment-category-view "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Row>
                  <MDSidebarMenu/>
                  <Col xs={12} md={10}>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                        <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                        <li className="breadcrumb-item"><Link to="#" onClick={()=>this.goTo("/chaindepartments")} role="button">{this.props.t('chaindepartments')}</Link></li>
                        <li className="breadcrumb-item"><Link to="#" onClick={()=>this.goTo("/"+this.props.HomePageVal)} role="button">{this.props.t('home')}</Link></li>
                        </>:<>
                        <li className="breadcrumb-item"><Link to="#" onClick={()=>this.goTo("/"+this.props.HomePageVal)} role="button">{this.props.t('home')}</Link></li>
                        <li className="breadcrumb-item"><Link to="#" onClick={()=>this.goTo("/chaindepartments")} role="button">{this.props.t('chaindepartments')}</Link></li>
                        <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                        </>}
                    </Breadcrumb>  
                    <Col className="white-container additem-content" ref={this.whitecontainer}>
                        <Col xs={12} md={9} lg={9} className="col-centered">
                                {/* <Col xs={12} className="dep-wizard-main">
                                    <Row>
                                        <Col xs={4} className={"wizard-item dep " +(this.state.viewType==="dep"?" active":"")}>
                                            <Col className="wizard-inner">
                                                <h6>{this.props.t("department")}</h6>
                                                <h5>{this.state.cdepobj.departmentName}</h5>
                                            </Col>
                                        </Col>
                                        <Col xs={4} className={"wizard-item cat "+(this.state.viewType==="cat"?" active":"")}>
                                            <Col className="wizard-inner">
                                                <h6>{this.props.t("category")}</h6>
                                                <h5>{this.state.viewType==="cat" || this.state.viewType==="subcat" ? (this.state.catobj.categoryName) :this.props.t("selectcategory")}</h5>
                                            </Col>
                                        </Col>
                                        <Col xs={4} className={"wizard-item subcat "+(this.state.viewType==="subcat"?" active":"")}>
                                            <Col className="wizard-inner">
                                                <h6>{this.props.t("subcategory")}</h6>
                                                <h5>{this.state.viewType==="subcat" ? (this.state.subcatobj.subCategoryName) : this.props.t("selectsubcategory")}</h5>
                                            </Col>
                                        </Col>
                                    </Row>
                                </Col> */}

                            <Row>
                                <Col xs={12} className="col-centered">
                                    
                                    <nav className="breadcrumbs sub-breadscrumb">
                                        <div className="breadcrumbs__item content-text" onClick={()=>this.goTo("/chaindepartments")}>
                                            <small>{this.props.t("department")}</small>
                                            <label>{this.handleLongeNames(this.state.cdepobj.departmentName)}</label>
                                        </div>
                                        {this.state.viewType === "cat"?<>
                                            <div className="breadcrumbs__item content-text" onClick={()=>this.changeViewType("dep")}>
                                                <small>{this.props.t("category")}</small>
                                                <label>{this.handleLongeNames(this.state.catobj.categoryName)}</label>
                                            </div>
                                            <div className="breadcrumbs__item is-active">
                                                <div className='scub-span single'>{this.props.t("sub_categories")}</div>
                                            </div>
                                        </>:<>
                                            <div className="breadcrumbs__item is-active">
                                                <div className='scub-span single'>{this.props.t("categories")}</div>
                                            </div>
                                            <div className="breadcrumbs__item is-disabled">
                                                <div className='scub-span single'>{this.props.t("sub_categories")}</div>
                                            </div>
                                        </>}
                                    </nav>

                                </Col>
                            </Row>
                            
                            <Col className='main-details-section'>
                            {
                                this.state.viewType==="dep" ?
                                <Col className="formcontrol-main depcat-categoriespage">
                                    <Col xs={12}>
                                        <Row>
                                            <Col xs={12}>
                                                <Col className="custom-filters form-inline">
                                                    <Form.Control placeholder={this.props.t('searchcategory')} value={this.state.sobj.searchValue} onChange={e => this.handleFilterObject(e,"searchValue","change",this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e,"searchValue","enter")} onKeyDown={(e)=>{preventinputToString(e,this.state.sobj.searchValue,(this.props.t('Character.search_text')))}} />
                                                    
                                                    <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                                    <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => evt.key === "."?evt.preventDefault(): preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } /></span>
                                                    <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                                                    <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                                                </Col>
                                                <Button type="submit" className="highlight-btn" onClick={this.initNewCatModal} variant="success">{this.props.t('btnnames.addnewcat')}</Button>
                                                
                                                {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0?
                                                    <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}/>
                                                :this.state.isdataloaded?<>
                                                    <AcNoDataView />
                                                </>:<></>}
                                            
                                            </Col>

                                        </Row>
                                    </Col>
                                    
                                    <Col className="savebtns-section">
                                        {/* <Link to="#" onClick={()=>this.goTo("/chaindepartments")} style={{float:(this.props.isRTL==="rtl"?"right":"left")}}><Button variant="secondary" type="button">{this.props.t('btnnames.back')}</Button></Link> */}
                                        {this.state.isedit?<>
                                            {/* <AcButton eleid="dangerdeplink" avariant="danger" aconfirm={true} adelete={true} asubmit={submitCollection.deleteChainDepatments}  aobj={this.state.cdepobj} avalidate={this.state.vobj} aclass={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} atype="button" aresp={this.handleDepartmentDelete}>{this.props.t('btnnames.deletedepartment')}</AcButton> */}
                                        </>:
                                            // <Button style={{float:(this.props.isRTL==="rtl"?"left":"right")}} onClick={()=>this.handleDepartmentSave()} size='lg' id="savebtnlink" variant="success" className="float-right formview-btn">{this.props.t('btnnames.save')}</Button>
                                            <></>
                                        }
                                    </Col>

                                </Col>:
                                this.state.viewType==="cat"?
                                    <Category whitecontainer={this.whitecontainer} isRTL={this.props.isRTL} alldepratmentList={this.state.alldepratmentList} departmentslist={this.state.departmentslist} cats={this.state.toridata} depobj={this.state.cdepobj} catobj={this.state.catobj} changeViewType={this.changeViewType} setSubCategoryObj={this.setSubCategoryObj} isFromLog={this.state.isFromLog} navigatedata={this.props.navigatedata}/>
                                :
                                this.state.viewType==="subcat"?
                                    <SubCategory isRTL={this.props.isRTL} depobj={this.state.cdepobj} catobj={this.state.catobj} subcatobj={this.state.subcatobj} changeViewType={this.changeViewType} brandlist={this.state.brnandlist} />
                                :<></>

                            }
                            
                            </Col>
                        </Col>
                    </Col>
                  </Col>
                  
                </Row>

                <AddCategoryFieldModal 
                    isUpdateField={this.state.isModalEdit}
                    showCatNewModal={this.state.showCatNewModal}
                    catobj={this.state.catobj}
                    vobj={this.state.vobj}
                    isRTL={this.props.isRTL}
                    fieldTotalCount={this.state.fieldTotalCount}
                    fieldLevelObj={this.state.fieldLevelObj}
                    fieldEyeLevels={this.state.fieldEyeLevels}
                    loadDunitList={this.state.loadDunitList} 
                    activeTabKey={this.state.activeTabKey}
                    loadMoreDunits={this.loadMoreDunits}
                    handleModalReset={this.handleModalReset}
                    handleModalToggle={this.handleModalToggle}
                    handleSelectfield={this.handleSelectfield}
                    handleSelectRow={this.handleSelectRow}
                    toggleActiveTab={this.toggleActiveTab}
                    AddCategory={this.AddCategory}
                    UpdateCategory={this.AddCategory}
                    updateCatObjFromChild={this.updateCatObjFromChild}
                    dmode={this.props.dmode}
                    departmentData = {this.state.cdepobj}
                    changeCatColor={this.changeCatColor}
                    />
                <SwitchParentModal 
                    isRTL={this.props.isRTL}
                    parentupdatebulkobj={this.state.parentupdatebulkobj}
                    dtype={"department"} showSwitchModal={this.state.showSwitchModal} currentName={this.state.cdepobj.departmentName}
                    departmentslist={this.state.departmentslist}
                    handleParentChange={this.handleParentChange}
                    handleSwitchModal={this.handleSwitchModal}
                    handleUpdate={this.handleswitchparentupdate} />
                {/* <ResultSummery showresultSummeryModal={this.state.showresultSummeryModal}
                        summeryres={this.state.summeryres}
                        handleresultSummeryModal={this.handleresultSummeryModal}
                        /> */}
                {this.state.showresultSummeryModal? 
                    <ResultSummery responseObj={this.state.summeryres} toggleResponseModal={this.handleresultSummeryModal}
                    t={this.props.t} isRTL={this.props.isRTL} /> 
                :<></>}
                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />    
                {this.state.showStackableModal?<StackableModal isRTL={this.props.isRTL} level={stackableLevels.category} selectedName={this.state.selectedName}
                 sid={this.state.selectedrowid} show={this.state.showStackableModal} handleClose={this.handleToggleStackableModal} />:<></>}
            </Col>
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setChainPrevFilters: (payload) => dispatch(viewSetChainDepPrevAction(payload)),
});

export default  withTranslation()(withRouter(connect(null,mapDispatchToProps)(DepartmentDetailsComponent) ));
