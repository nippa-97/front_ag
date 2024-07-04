import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Breadcrumb, Button, Col, Row } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';

import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { alertService } from '../../../_services/alert.service';
import { ProductFilterProductTypes, ProductSearchCritieriaTypes } from '../../../enums/productsEnum';
import { AcViewModal } from '../../UiComponents/AcImports';

import ArchiveProductsView from './ArchiveProductsView/archiveProductsView';
import NewProductView from './NewProductsView/newProductView';
import { samplenewprods } from './newprodSampledata';
import EditNewProduct from './EditProduct/EditNewProduct';

import'./newProducts.scss';


class NewProducts extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            EditProdEnable: false,
            SelectedTab:"NewProducts",
            allBrands:[{value:"-1", label:"All Brands"}],
            subcategorylist:[{value:"-1", label:"All Brands"}],
            newProductFilters:null,
            archivedProductFilters:null,

            startpage: 1, 
            totalresults: 0,
            defaultPageCount: 10, 
            currentPage: 1, 
            totalPages: 0,
            ftablebody:[],
            pageItemsList:[],
            isdataloaded:false,

            selectedProduct:null,
            showNewProds:true,

            newprodsTemfbodydata:[],
            tagList:[],
            DepartmetList:[{value:"-1", label:this.props.t("NONE")}], oriDeptList: [],
            brandsList:[{value:"-1", label:this.props.t("NONE")}],
            supplierList:[{value:"-1", label:this.props.t("NONE")}],

            isLoadingDefaultObj: true, defaultFiltersObj: {},
            multiSelectList: { newProds: [], archive: [], allAction: -1 },
            
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            this.loadAllBrands();
            this.getAllSubCategories();
            this.getDepartments()
            this.getTagList()
            this.getSupplierList()
            this.getbrands();

            this.loadDefaultFilters();
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    
    //default search object
    defaultSearchObjLoad  = () => {
        let defaultfilters = this.state.defaultFiltersObj;

        let ccompletetype = (defaultfilters && defaultfilters.completeStatus?defaultfilters.completeStatus:"None");

        //from date check
        let dateRangeCount = (defaultfilters && defaultfilters.dateRangeDateCount?defaultfilters.dateRangeDateCount:0);

        let fnewdate = new Date();
        let cnewdate = fnewdate.setDate(fnewdate.getDate() - dateRangeCount);
        let newfdate = new Date(cnewdate);
        // console.log(newfdate);

        return {
            freeSearchValue:"", brandId:0, date: null,
            isFromDefaultFilter: false,
            //  completeStatus:"None",
            isReqPagination: true, startIndex: 0, maxResult: 8,
            isReqCount: true,
            isArchived: (this.state.SelectedTab === "Archive"),
            moreFilter: {
                completeStatus: ccompletetype,
                isCombineFiltering: true,
                productTypes: ProductFilterProductTypes.ALL,
                productMissingTypes: (defaultfilters && ccompletetype === "None" && defaultfilters.missingTypes?defaultfilters.missingTypes:[]),
                productSource: (defaultfilters && defaultfilters.productSource?defaultfilters.productSource:""),
                imageSource: (defaultfilters && defaultfilters.imageSource?defaultfilters.imageSource:"None"),
                searchDateType: "dateRange",
                shouldIgnoreHiddenDepartment: (defaultfilters && defaultfilters.isHiddenDepartment?defaultfilters.isHiddenDepartment:false),
                saleDateCount: (defaultfilters && defaultfilters.saleDateCount?defaultfilters.saleDateCount:0),
                createdDateRange: { isHasSelectedDateRange: (dateRangeCount > 0), fromDate: ((dateRangeCount > 0)?newfdate:null), toDate: ((dateRangeCount > 0)?new Date():null) },
                swiches: {
                    isMandatory: false,
                    isNoos: false,
                    isFavorite: false,
                    isPremium: false,
                    isOverride: false,
                    isStackable:false,
                    isBlock:false,
                },
                mappings: {
                    departmentId: -1,
                    categoryId: -1,
                    subCategoryId: -1,
                    brandId: -1,
                    supplierId: -1
                },
                dimensions: {
                    width: {
                        searchCriteria: ProductSearchCritieriaTypes.Equal,
                        lowerBound: 0,
                        upperBound: 0
                    }, 
                    height: {
                        searchCriteria: ProductSearchCritieriaTypes.Equal,
                        lowerBound: 0,
                        upperBound: 0
                    },
                    depth: {
                        searchCriteria: ProductSearchCritieriaTypes.Equal,
                        lowerBound: 0,
                        upperBound: 0
                    }
                },
                productTags: [], displayTags: [],
            },
        }
    }

    loadDefaultFilters = () => {
        this.setState({ isLoadingDefaultObj: true }, () => {
            submitSets(submitCollection.getDefaultNewProductFilters, null).then(res => {
                // console.log(res);

                let cdefsettings = null;
                if(res && res.status && res.extra){
                    cdefsettings = res.extra;
                }

                this.setState({ defaultFiltersObj: cdefsettings, isLoadingDefaultObj: false });
            })
        });
    }

    getSupplierList = () => {
        var csobj={
            isReqPagination:false
        }
        submitSets(submitCollection.searchSuppliers, csobj, true).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].supplierId, label:res.extra[i].supplierName});
                }
                this.setState({supplierList:cdata})
            }else{
                alertService.error(this.props.t("ERROR_OCCURED"));
            }
        })
    }
    getbrands=()=>{
        var csobj={
            isReqPagination:false
        }
        submitSets(submitCollection.findAllBrands, csobj, true).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].brandId, label:res.extra[i].brandName});
                }
                this.setState({brandsList:cdata})
            }else{
                alertService.error(this.props.t("ERROR_OCCURED"));
            }
        })
    }
    getTagList=()=>{
        var csobj={
            isReqPagination: false,
            tagName: "",
            type: "",
        }
        submitSets(submitCollection.searchTags, csobj, true).then(res => {
            var cdata = [];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].id, label:res.extra[i].tagName});
                }
                this.setState({tagList:cdata})
            }else{
                alertService.error(this.props.t("ERROR_OCCURED"));
            }
        })
    }

     //get all subcategories
     getAllSubCategories = () =>{
        var obj = {isReqPagination:false};
        submitSets(submitCollection.getFullListOfSubCategories, obj, false).then(resp => {
            let arr = [{value:0, label:""}];
            if(resp && resp.status){
                for (let i = 0; i < resp.extra.length; i++) {
                    arr.push({
                        value:resp.extra[i].subCategoryId,
                        label:resp.extra[i].subCategoryName,
                    });
                    
                }
                this.setState({subcategorylist:arr});
            } 
        });
    }

    loadAllBrands = () =>{
        let sobj = {isReqPagination:false}
        submitSets(submitCollection.searchBrand, sobj, false).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].brandId, label:res.extra[i].brandName});
                }
                this.setState({allBrands:cdata});
            } 
        });
    }

    SelectNewProducts=() => {
        let existingList = this.state.multiSelectList;

        this.setState({
            SelectedTab:"NewProducts", 
            newProductFilters: null,
            multiSelectList: { newProds: existingList.newProds, archive: existingList.archive, allAction: -1 },
        });
        
        this.setTemporaryftabledata([]);
        this.updateDeptList(null, true);
    }
    SelectArchive=() => {
        let existingList = this.state.multiSelectList;

        this.handleEditClose();
        this.setState({
            SelectedTab:"Archive",
            archivedProductFilters: null,
            multiSelectList: { newProds: existingList.newProds, archive: existingList.archive, allAction: -1 },
        });
        
        this.updateDeptList(null, true);
    }
    //click on Edit button in new poroducts table
    handleTableEditBtn=(pobj)=>{
        this.setState({EditProdEnable:false, selectedProduct:pobj},()=>{
            this.setState({ EditProdEnable:true})
        })
    }
    //close Edit component
    handleEditClose=(isloadmainlist)=>{
        this.setState({EditProdEnable:false});

        if(isloadmainlist===true){
            this.setState({showNewProds:false},()=>{this.setState({showNewProds:true})});
        }

        if(isloadmainlist==="delete"){
            if(this.state.SelectedTab==="NewProducts"){
                let filterobj = this.state.newProductFilters;
                if(filterobj.pagtotal===1 || filterobj.pagtotal<1){
                    filterobj = null;
                }
                this.setState({showNewProds:false, newProductFilters:filterobj},()=>{this.setState({showNewProds:true})});
            }
            else if(this.state.SelectedTab==="Archive"){

            }
        }
    }

    setFilterData = (type,cobj) =>{
        //console.log(cobj);
        this.setState({[type]:cobj});
    }

    setTemporaryftabledata=(list)=>{
        this.setState({newprodsTemfbodydata:list});
    }
    getDepartments = () => {
        var csobj = { isReqPagination: false, isIgnoreHide: false };
        
        submitSets(submitCollection.searchDepatments, csobj, true).then(res => {
            var cdata = [{value:0, label:""}];
            if(res && res.status){
                for (let i = 0; i < res.extra.length; i++) {
                    cdata.push({value:res.extra[i].departmentId, label:res.extra[i].name});
                }
                this.setState({DepartmetList: cdata, oriDeptList: (res.extra && res.extra.length > 0?res.extra:[])})
            }else{
                alertService.error(this.props.t("ERROR_OCCURED"));
            }
        })
    }

    updateDeptList = (csearchobj, isreset) => {
        let newdeptlist = [{value:0, label:""}];
        
        if(this.state.oriDeptList && this.state.oriDeptList.length > 0){
            for (let i = 0; i < this.state.oriDeptList.length; i++) {
                const oriitem = this.state.oriDeptList[i];

                if(oriitem && oriitem.departmentId > 0){
                    if(isreset || !oriitem.hide || (csearchobj && csearchobj.moreFilter && !csearchobj.moreFilter.shouldIgnoreHiddenDepartment)){
                        newdeptlist.push({ value: oriitem.departmentId, label: oriitem.name });
                    }
                }
            }
        }
        
        this.setState({DepartmetList: newdeptlist});
    }

    //update multiple select table row list
    updateMultiSelect = (type, isreset, prodlist) => {
        let multiList = JSON.parse(JSON.stringify(this.state.multiSelectList));
        
        if(isreset){
            if(type === "allAction"){
                multiList[type] = -1;
            } else{
                multiList[type] = [];
            }
        } else{
            if(type === "allAction"){
                multiList[type] = prodlist;
            } else{
                for (let i = 0; i < prodlist.length; i++) {
                    const proditem = prodlist[i];
    
                    let checkalreadyadded = multiList[type].findIndex(x => x.productId === proditem.productId);
    
                    if(checkalreadyadded > -1){
                        multiList[type].splice(checkalreadyadded,1);
                    } else{
                        multiList[type].push(proditem);
                    }    
                }
            }
        }

        // console.log(multiList);
        this.setState({ multiSelectList: null }, () => {
            this.setState({ multiSelectList: multiList });
        });
    }

    render() {
        var {SelectedTab}=this.state
        return (<>
            <Col xs={12} className={"main-content compmain-content mdatacontent-main mrformcontent-main "+(this.props.isRTL==="rtl"?"RTL":"LTR")} dir={this.props.isRTL}>
                <div className=''>
                    <Row>
                        {/* <Mdsidebarmenu /> */}
                        <Col xs={12} lg={12}>
                            <Breadcrumb dir="ltr">
                                {this.props.isRTL==="rtl"?<>
                                    <Breadcrumb.Item active>{this.props.t('NEWPRODUCTS')}</Breadcrumb.Item>
                                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                                        </>:<>
                                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                                            <Breadcrumb.Item active>{this.props.t('NEWPRODUCTS')}</Breadcrumb.Item>
                                        </>}
                            </Breadcrumb>
                            <Col className={"prodlist-container newprods-container"} style={{paddingTop: "0px"}}>
                                <Row>
                                    <Col  md={(this.state.EditProdEnable?7:12)} lg={(this.state.EditProdEnable?8:12)} ref={this.whitecontainer} className="white-container">
                                        <Col className="tabs">
                                            <Button style={{paddingLeft:"0px"}} className={SelectedTab==="NewProducts"?'tab-btn-select':""} onClick={()=>this.SelectNewProducts()}>{this.props.t("NEW_PRODUCTS")}</Button>
                                            <Button className={SelectedTab==="Archive"?'tab-btn-select':""}  onClick={()=>this.SelectArchive()}>{this.props.t("ARCHIVE")}</Button>
                                        </Col>

                                        {!this.state.isLoadingDefaultObj?<>
                                            {SelectedTab==="NewProducts"?
                                                <>
                                                {this._isMounted?
                                                <>
                                                {this.state.showNewProds === true ?
                                                            <NewProductView 
                                                                whitecontainer={this.whitecontainer}
                                                                isRTL={this.props.isRTL}
                                                                brandsList={this.state.brandsList}
                                                                supplierList={this.state.supplierList}
                                                                tagList={this.state.tagList}
                                                                DepartmetList={this.state.DepartmetList}
                                                                oriDeptList={this.state.oriDeptList}
                                                                subcategorylist={this.state.subcategorylist} 
                                                                brands={this.state.allBrands} 
                                                                data={samplenewprods}  
                                                                EditProdEnable={this.state.EditProdEnable} 
                                                                filterDataObj = {this.state.newProductFilters}
                                                                newprodsTemfbodydata={this.state.newprodsTemfbodydata}
                                                                multiSelectList={this.state.multiSelectList}
                                                                defaultSearchObjLoad={this.defaultSearchObjLoad}
                                                                handleTableEditBtn={this.handleTableEditBtn} 
                                                                handleEditClose={this.handleEditClose}
                                                                setFilterData={this.setFilterData} 
                                                                setTemporaryftabledata={this.setTemporaryftabledata}
                                                                updateMultiSelect={this.updateMultiSelect}
                                                                updateDeptList={this.updateDeptList}
                                                            />
                                                        :<></>
                                                    }
                                                </>
                                                :<></>}
                                                    
                                                </>
                                                :
                                                <ArchiveProductsView 
                                                    whitecontainer={this.whitecontainer}
                                                    isRTL={this.props.isRTL}
                                                    brandsList={this.state.brandsList}
                                                    supplierList={this.state.supplierList}
                                                    tagList={this.state.tagList}
                                                    DepartmetList={this.state.DepartmetList}
                                                    oriDeptList={this.state.oriDeptList}
                                                    subcategorylist={this.state.subcategorylist} 
                                                    brands={this.state.allBrands} 
                                                    EditProdEnable={this.state.EditProdEnable} 
                                                    filterDataObj = {this.state.archivedProductFilters}
                                                    multiSelectList={this.state.multiSelectList}
                                                    defaultSearchObjLoad={this.defaultSearchObjLoad}
                                                    handleEditClose={this.handleEditClose}
                                                    setFilterData={this.setFilterData} 
                                                    updateMultiSelect={this.updateMultiSelect}
                                                    updateDeptList={this.updateDeptList}
                                                />
                                            }
                                        </>:<></>}
                                    </Col>

                                    {this.state.EditProdEnable? <Col md={5} lg={4} >
                                        <Col className="white-container">
                                            <EditNewProduct 
                                                handleEditClose={this.handleEditClose} 
                                                isRTL={this.props.isRTL} 
                                                selectedProduct={this.state.selectedProduct}  
                                                subcategorylist={this.state.subcategorylist} 
                                                brands={this.state.allBrands}  
                                            />
                                        </Col>
                                    </Col>:<></>}
                                </Row>
                            </Col>
                        </Col>        
                    </Row>
                </div>
            </Col>

            <AcViewModal showmodal={this.state.isLoadingDefaultObj} message={this.props.t('PLEASE_WAIT')} />
        </>);
    }
}

export default  withTranslation()(withRouter(NewProducts));