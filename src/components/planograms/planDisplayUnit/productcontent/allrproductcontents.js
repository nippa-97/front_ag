import React from 'react';
import { Col, Button, Badge, Tab, ButtonGroup, Dropdown, Row, InputGroup, Form } from 'react-bootstrap';
import { PlusIcon, DashIcon, SearchIcon } from '@primer/octicons-react';
import FeatherIcon from 'feather-icons-react';
import { confirmAlert } from 'react-confirm-alert';

import { ProdsAddSidebar  } from './productsidebar';
import { ViewProposeList } from '../viewProposeList'; //propose list
import PgDunitClipBoard from './clipboardcontent';
// import PgHistoryTabView from './historytabcontent';
import ProdMDModal from '../prodmdedit';

//import using services
import { submitCollection } from '../../../../_services/submit.service'; //gets backend paths
import { alertService } from '../../../../_services/alert.service'; //common alert services
import { submitSets } from '../../../UiComponents/SubmitSets'; //backcalls handlers
import { TooltipWrapper } from '../../../newMasterPlanogram/AddMethods';
import ProductRotate from '../productRotate';
// import { removeGhostImage } from '../../../common_layouts/ghostDragWrapper';
import { measureConverter } from '../../../../_services/common.service';

import loadinggif from '../../../../assets/img/loading-sm.gif';
import imagePlaceholder from '../../../../assets/img/icons/default_W100_100.jpg';
import Select from 'react-select';
import _ from "lodash";
/**
 * using to show product panel
 *
 */
 export default class AllProductContents extends React.Component {
    constructor (props){
        super (props);

        this.state = {
            isShowProductSidebar: false,
            searchStartIdx: 0, maxProdResults: 8,
            totalSearchProdCount: 0,
            srchprodsloading: false,

            isListViewActive: "LIST",

            tabActiveKey: "add",

            clipDragType: "MULTIPLE",

            prodEditModalView: false, prodEditObj: null, //product edit view

            showrotateprod: false, selectedrotateprod: null, isshowrotateedit: true, //rotate product
            departmentList:[],categortList:[],categoryList:[],subCategoryList:[],brandList:[],supplierList:[],
            filterObj:{departmentId:-1,categoryId:-1,subCategoryId:-1,brandId:-1,supplierId:-1},
            filteredloadedProposeList:null,
            mainList:{},
            show:false,
            isFilter:false,
        }
    }

    componentDidMount(){
        // console.log(this.props.importedScrollHeight);
        let importScrollDiv = document.getElementById("allupload-scrollcontent");
        if(this.props.importedScrollHeight > 0 && importScrollDiv){
            document.getElementById("allupload-scrollcontent").scrollTop = this.props.importedScrollHeight;
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.loadedProposeList !== this.props.loadedProposeList) {
            this.setState({
                mainList:this.props.loadedProposeList
            },()=>{
                this.loadfilterList()
            })
        }
      }
    //toggle product search and add sidebar
    toggleProdSidebarView = () => {
        this.setState({ isShowProductSidebar: !this.state.isShowProductSidebar }, () => {
            if(this.state.isShowProductSidebar){
                this.props.updateSearchProdList([]);
                this.setState({searchStartIdx: 1});
            }
        });
    }
    //filter product
    handleFilterProducts = (evt) => {
        var ctxt = evt.target.value;
        if(evt.nativeEvent.which === 13){
            this.props.updateSearchProdList([]);
            this.setState({searchStartIdx: 1}, () => {
                if(!this.state.srchprodsloading){
                    this.searchProdList(ctxt,0);
                }
            });
        }
    }
    //#PLG-DU-PD-H04 search products list view
    searchProdList = (ctxt, startidx) => {
        let fieldid = this.state.statfieldid;
        let psobj = { productName: ctxt, isReqPagination:true, startIndex: startidx, maxResult:this.state.maxProdResults, withImageUrl:true, floorLayoutAisleHasFieldId:fieldid }
        
        this.setState({srchprodsloading: true});
        submitSets(submitCollection.getProductList, psobj, true).then(res => {
            //console.log(res);
            let cdata = (startidx === 0?[]:this.props.searchProdLoadedList);
            
            this.setState({srchprodsloading: false});
            if(res && res.status){
                let loadedData = (res.extra && res.extra.length > 0?res.extra:[]);
                for (let i = 0; i < loadedData.length; i++) {
                    let proditem = loadedData[i];

                    let findprodinexisting = this.props.existnewprodlist.findIndex(existprod => existprod.productInfo.id === proditem.id);

                    proditem["prodalreadyadded"] = (findprodinexisting > -1);
                    cdata.push(proditem);
                }

                this.props.updateSearchProdList(cdata);
                this.setState({ searchStartIdx: startidx });

                if(startidx === 0){
                    this.setState({totalSearchProdCount: res.count});
                }

                //load product modal if the product is from GS1
                if(loadedData.length === 1){
                    let pobj = loadedData[0];

                    if(pobj.fromProductLookup === true){
                        //pobj.fromProductLookup=true;
                        this.setState({selectedProduct:{prodDetails:pobj}},()=>{this.toggleProductUpdateModal()});
                    }
                }

            } else{
                alertService.error(this.props.t('NO_RESULT_FOUND'));
                // this.setState({ searchProdLoadedList: cdata });
                this.props.updateSearchProdList(cdata);
            }
        });
    }
    //#PLG-DU-PD-H05 onclick load more button in search
    loadMoreProds = () => {
        //add maxcount to current start index
        var cstarttxt = (this.state.searchStartIdx === 0?(this.state.maxProdResults):(this.state.searchStartIdx + this.state.maxProdResults));
        var ctxt = document.getElementById("filterprodtxt").value; //get filter typed value
        this.searchProdList(ctxt,cstarttxt);
    }
    //#PLG-DU-PD-H06 toggle products view
    toggleProdListView = (cstat) => {
        this.setState({isListViewActive: null}, () => {
            setTimeout(() => {
                this.setState({isListViewActive: cstat});
            }, 200);
        });
    }
    setPropActiveTab = (settab) => {
        this.setState({ tabActiveKey: settab });
    }

    //toggle clipboard drag type
    toggleClipDragType = (ctype) => {
        this.setState({ clipDragType: ctype });
    }

    //#PLG-DU-PD-H07 handle product edit modal view
    handlePEMView = (view, obj, isdrag) => {
        //if it's update and close - update filtered/recent product list
        if(!view && obj && Object.keys(obj).length > 0){
            let searchProdList = this.props.searchProdLoadedList;
            let recentProdList = this.props.recentAddedProdList;
            
            //update filtered list
            for (let i = 0; i < searchProdList.length; i++) {
                if(searchProdList[i].id === obj.id){
                    // obj["fieldid"] = viewobj.id;
                    searchProdList[i] = obj;
                }
            }
            //update recent list
            for (var l = 0; l < recentProdList.length; l++) {
                if(recentProdList[l].id === obj.id){
                    // obj["fieldid"] = viewobj.id;
                    recentProdList[l] = obj;
                }
            }
            //set state/redux
            // this.props.setFieldRecList(crecprods);
            this.setState({ recentProdList: recentProdList }); //searchProdLoadedList: searchProdList, 
            this.props.updateSearchProdList(searchProdList);

            if(isdrag){
                this.setState({isShowProductSidebar: false});
            }
        }

        this.setState({prodEditModalView: view, prodEditObj: obj});
    }
    //#PLG-DU-PD-H12 toggle rotate product modal
    toggleRotateProd = (cprod,isshowedit) => {
        this.setState({ showrotateprod: !this.state.showrotateprod, selectedrotateprod: (cprod?cprod:null), isshowrotateedit: isshowedit });
    }
    //update rotate product
    updateRotateProd = (cprod) => {
        this.handlePEMView(false,cprod);
        this.setState({ showrotateprod: false, selectedrotateprod: null, isshowrotateedit: null });
    }

    getScrollPosition = (e) => {
        if(this.state.srchprodsloading === false && this.props.searchProdLoadedList.length < this.state.totalSearchProdCount){
            var top = document.getElementById("pgprodlistlist").scrollTop;
            var sheight = document.getElementById("pgprodlistlist").scrollHeight;
            var position = ((sheight - top) - 1);
            var clientHeight = e.target.clientHeight;
            position = Math.trunc(position); 

            if(position <= clientHeight){
                this.loadMoreProds();
            }
        }
    }

    handleGhostOnDrag = (e, obj) => {
        let viewobj = structuredClone(obj);
        // console.log(viewobj);
        let drawzoomx = this.props.zoomDrawX;

        let prodwidth = measureConverter(viewobj.uom, this.props.displayUOM, viewobj.width) * this.props.displayRatio;
        let prodheight = measureConverter(viewobj.uom, this.props.displayUOM, viewobj.height) * this.props.displayRatio;

        viewobj["drawWidth"] = prodwidth * (drawzoomx > 0?(drawzoomx * 2):1);
        viewobj["drawHeight"] = prodheight * (drawzoomx > 0?(drawzoomx * 2):1);
        
        this.props.ghostFromParent(e, viewobj, true);
    }

    //delete imported prods
    deleteImportedProds = (prodlist, deleteType) => {
        let avaiablebarcodes = [];
        for (let i = 0; i < prodlist.length; i++) {
            if(deleteType === "SELECTED"){
                if(prodlist[i].isSelected){
                    avaiablebarcodes.push(prodlist[i].barcode);
                }
            } else{
                avaiablebarcodes.push(prodlist[i].barcode);
            }
        }

        if(deleteType === "SELECTED" && avaiablebarcodes.length === 0){
            alertService.error(this.props.t("NO_SELECTED_PRODUCTS"));
            return false;
        }

        /* if( avaiablebarcodes.length > 0){ */
            confirmAlert({
                title: this.props.t('DELETE_IMPORTPRODS'),
                message: this.props.t('SURETO_DELETE_IMPORTED'),
                overlayClassName: (this.props.isRTL==="rtl"?"alertrtl-content":""),
                buttons: [{
                        label: this.props.t('btnnames.yes'),
                        onClick: () => {
                            this.props.toggleLoadingModal(true, () => {
                                let sendobj = {
                                    floorlayoutId: this.props.saveObj.floorLayoutId,
                                    barcodes: avaiablebarcodes,
                                    isAll: (deleteType === "ALL"?true:false),
                                };
                        
                                submitSets(submitCollection.deleteImportedBarcodes, sendobj, true).then(res => {
                                    // console.log(res);
                                    if(res && res.status){
                                        // let datalist = (res.extra && res.extra.length > 0?res.extra:[]);
                                        // console.log(datalist);
                                        if(deleteType === "SINGLE"){
                                            this.props.setImportedProds([], true, true, avaiablebarcodes);
                                        } else{
                                            this.props.sendExcelData([], this.props.totalExcelProdCount);
                                        }
                                    }
                        
                                    this.props.toggleLoadingModal(false);

                                    /* if(this.props.isImportDataLoading === false && this.props.excelStartIndex < this.props.totalExcelProdCount){
                                        let top = document.getElementById("allupload-scrollcontent").scrollTop;
                                        this.props.updateImportScrollList(top);
                                    } */

                                });
                            });
                        }
                    }, {
                        label: this.props.t('btnnames.no')
                    }]
            });
        /* } else{
            alertService.error(this.props.t("NO_PRODS_AVAILABLE_TO_DELETE"));
        } */
        
    }

    getWarnScrollPosition = (e) => {
        if(this.props.isImportDataLoading === false && this.props.excelStartIndex < this.props.totalExcelProdCount){
            var top = document.getElementById("allupload-scrollcontent").scrollTop;
            var sheight = document.getElementById("allupload-scrollcontent").scrollHeight;

            var position = (sheight - top);
            var clientHeight = e.target.clientHeight;
            position = Math.trunc((position - 1)); 
            if(position <= clientHeight){
                this.props.loadImportProdList();
            }

            this.props.updateImportScrollList(top);
        }
    }

    loadfilterList = ()=>{
        let data = this.state.mainList;
        let departmentList = [{value:-1, label:this.props.t("ALL")}];
        let categortList = [{value:-1, label:this.props.t("ALL"),dep:-1}];
        let subCategoryList = [{value:-1, label:this.props.t("ALL"),catId:-1}];
        let brandList = [{value:-1, label:this.props.t("ALL")}];
        let supplierList = [{value:-1, label:this.props.t("ALL")}];
 
        if(data && data.fieldList){
            let fieldlist = data.fieldList;
            for (const field of fieldlist) {
                if(field && field.removeItemArray && field.removeItemArray.length > 0){
                    let removeProducts = field.removeItemArray;
                    for (let index = 0; index < removeProducts.length; index++) {
                        const product = removeProducts[index];
                        if(product.departmentId > 0 && product.departmentName !== ""){
                            if(!departmentList.find((data)=>{return data.value === product.departmentId})){
                                let obj = {value:product.departmentId,label:product.departmentName}
                                departmentList.push(obj);
                            }
                        }

                        if(product.brandId > 0 && product.brandName !== ""){
                            if(!brandList.find((data)=>{return data.value === product.brandId})){
                                let obj = {value:product.brandId,label:product.brandName}
                                brandList.push(obj);
                            }
                        }

                        if(product.categoryId > 0 && product.categoryName !== ""){
                            if(!categortList.find((data)=>{return data.value === product.categoryId})){
                                let obj = {value:product.categoryId,label:product.categoryName,dep:product.departmentId}
                                categortList.push(obj);
                            }
                        }

                        if(product.subcategoryId > 0 && product.subcategoryName !== ""){
                            if(!subCategoryList.find((data)=>{return data.value === product.subcategoryId})){
                                let obj = {value:product.subcategoryId,label:product.subcategoryName,catId:product.categoryId}
                                subCategoryList.push(obj);
                            }
                        }

                        if(product.supplierId > 0 && product.supplierName !== ""){
                            if(!supplierList.find((data)=>{return data.value === product.supplierId})){
                                let obj = {value:product.supplierId,label:product.supplierName}
                                supplierList.push(obj);
                            }
                        }
                        
                    }
                }
                if(field && field.addingItemArray && field.addingItemArray.length > 0){
                    let addProducts = field.addingItemArray;
                    for (let index = 0; index < addProducts.length; index++) {
                        const product = addProducts[index];
                        if(product.departmentId > 0 && product.departmentName !== ""){
                            if(!departmentList.find((data)=>{return data.value === product.departmentId})){
                                let obj = {value:product.departmentId,label:product.departmentName}
                                departmentList.push(obj);
                            }
                        }

                        if(product.brandId > 0 && product.brandName !== ""){
                            if(!brandList.find((data)=>{return data.value === product.brandId})){
                                let obj = {value:product.brandId,label:product.brandName}
                                brandList.push(obj);
                            }
                        }

                        if(product.categoryId > 0 && product.categoryName !== ""){
                            if(!categortList.find((data)=>{return data.value === product.categoryId})){
                                let obj = {value:product.categoryId,label:product.categoryName}
                                categortList.push(obj);
                            }
                        }

                        if(product.subcategoryId > 0 && product.subcategoryName !== ""){
                            if(!subCategoryList.find((data)=>{return data.value === product.subcategoryId})){
                                let obj = {value:product.subcategoryId,label:product.subcategoryName}
                                subCategoryList.push(obj);
                            }
                        }

                        if(product.supplierId > 0 && product.supplierName !== ""){
                            if(!supplierList.find((data)=>{return data.value === product.supplierId})){
                                let obj = {value:product.supplierId,label:product.supplierName}
                                supplierList.push(obj);
                            }
                        }
                        
                    }
                }
            }
        }
        let sorted_departmentList = _.orderBy(departmentList, ['value'],['asc']);
        let sorted_categortList = _.orderBy(categortList, ['value'],['asc']);
        let sorted_subCategoryList = _.orderBy(subCategoryList, ['value'],['asc']);
        let sorted_brandList = _.orderBy(brandList, ['value'],['asc']);
        let sorted_supplierList = _.orderBy(supplierList, ['value'],['asc']);
        this.setState({
            departmentList:sorted_departmentList,
            categortList:sorted_categortList,
            subCategoryList:sorted_subCategoryList,
            brandList:sorted_brandList,
            supplierList:sorted_supplierList
        },()=>{
            this.filterProduts();
        })

    }

    handleFilter =(e,ckey)=>{
        let filterObj = JSON.parse(JSON.stringify(this.state.filterObj));

        if(filterObj[ckey] === e.value){
            return false
        }

        filterObj[ckey] = e.value
        if('departmentId' === ckey){
          filterObj['categoryId'] = -1
          filterObj['subCategoryId'] = -1
        }
        if('categoryId' === ckey){
            filterObj['subCategoryId'] = -1
        }
        this.setState({
            filterObj:filterObj
        },()=>{
            this.checkfilter();
        })
    }

    checkfilter = ()=>{
        let value = false;
        let obj = this.state.filterObj;
        if(obj.brandId > 0 || obj.categoryId > 0 || obj.departmentId > 0 || obj.subCategoryId > 0  || obj.supplierId > 0){
            value = true
        }
        this.setState({
            isFilter:value
        })
    }

    filterProduts =()=>{
        let data = JSON.parse(JSON.stringify(this.state.mainList));
        if(data && data.fieldList){
            let fieldlist = data.fieldList;
            for (const field of fieldlist) {
                if(field && field.removeItemArray && field.removeItemArray.length > 0){
                    let filterobj = this.state.filterObj
                    const condition = (obj) => (
                        (filterobj.brandId > 0 ? obj.brandId === filterobj.brandId : true) &&
                        (filterobj.departmentId > 0 ? obj.departmentId === filterobj.departmentId : true) &&
                        (filterobj.categoryId> 0 ? obj.categoryId === filterobj.categoryId : true) &&
                        (filterobj.subCategoryId > 0 ? obj.subcategoryId === filterobj.subCategoryId : true) &&
                        (filterobj.supplierId > 0 ? obj.supplierId === filterobj.supplierId : true)
                    );
                    let removeProducts = field.removeItemArray.filter(condition);
                    field.removeItemArray = removeProducts;
                }
                if(field && field.addingItemArray && field.addingItemArray.length > 0){
                    let filterobj = this.state.filterObj
                    const condition = (obj) => (
                        (filterobj.brandId > 0 ? obj.brandId === filterobj.brandId : true) &&
                        (filterobj.departmentId > 0 ? obj.departmentId === filterobj.departmentId : true) &&
                        (filterobj.categoryId> 0 ? obj.categoryId === filterobj.categoryId : true) &&
                        (filterobj.subCategoryId > 0 ? obj.subcategoryId === filterobj.subCategoryId : true) &&
                        (filterobj.supplierId > 0 ? obj.supplierId === filterobj.supplierId : true)
                    );
                    let addingItemArray = field.addingItemArray.filter(condition);
                    field.addingItemArray = addingItemArray;
                }
            }
        }
        this.setState({
            filteredloadedProposeList:data
        })
    }

    filterReset = ()=>{
       let filterObj ={departmentId:-1,categoryId:-1,subCategoryId:-1,brandId:-1,supplierId:-1}
       this.setState({
        filterObj:filterObj
       },()=>{
        this.filterProduts()
        this.checkfilter();
       })
    }
    handleDropDown = (ckey)=>{
        this.setState({
            show:!this.state.show
        },()=>{
            if(ckey === "r"){
                this.filterReset()
            }

            if(ckey === "s"){
                this.filterProduts()
            }
        })
    }
    toggleExcelProdSelect = (issingle, prodidx, isnone) => {
        // e.stopPropagation();
        let prodlist = this.props.excelUploadList;
        if(issingle){
            prodlist[prodidx].isSelected = !prodlist[prodidx].isSelected; 
        } else{
            for (let i = 0; i < prodlist.length; i++) {
                prodlist[i].isSelected = (!isnone?true:false);
            }
        }
        
        this.props.updateImportedList(prodlist);
    }

    render (){
        let { fieldStatus } = this.props;
        let newprodcount = (this.props.existnewprodlist?this.props.existnewprodlist.filter(x => x.existviewtype === 2).length:0);

        let filterDepartments = this.state.departmentList;
        filterDepartments[0] = {value:-1, label:this.props.t("ALL")}
        let filtercategoryList = this.state.categortList.filter((d)=>{return (d.dep === this.state.filterObj.departmentId || d.dep === -1)});
        filtercategoryList[0] = {value:-1, label:this.props.t("ALL"),dep:-1};
        let filterSubcategoryList = this.state.subCategoryList.filter((d)=>{return d.catId === this.state.filterObj.categoryId || d.catId === -1 });
        filterSubcategoryList[0] = {value:-1, label:this.props.t("ALL"),catId:-1}
        let filterBrnadList = this.state.brandList;
        filterBrnadList[0] = {value:-1, label:this.props.t("ALL")};
        let filterSupplierList = this.state.supplierList;
        filterSupplierList[0] = {value:-1, label:this.props.t("ALL")};

        return (<>
            <ProdsAddSidebar t={this.props.t} isRTL={this.props.isRTL} 
                isListViewActive={this.state.isListViewActive}
                recentProdList={this.props.recentAddedProdList} 
                filteredProdList={this.props.searchProdLoadedList} 
                isShowProdView={this.state.isShowProductSidebar}
                ptotalresults={this.state.totalSearchProdCount}
                copyToClipboard={this.props.copyToClipboard} 
                drawRectCanvas={this.props.drawRectCanvas} 
                dragStart={this.props.dragStart} 
                dragProdView={this.props.dragProdView}
                handleProductImgPreview={this.props.handlePreviewModal} 
                getScrollPosition={this.getScrollPosition}
                handleFilterProducts={this.handleFilterProducts}
                handlePEMView={this.handlePEMView} 
                loadMoreProds={this.loadMoreProds}
                prodDragEnd={this.props.prodDragEnd}
                srchprodsloading={this.state.srchprodsloading}
                toggleRotateProd={this.toggleRotateProd} 
                toggleProdView={this.toggleProdSidebarView} 
                toggleProdListView={this.toggleProdListView}
                handleopenDetailmodal={this.props.handleopenDetailmodal} 
                />

            <Col xs={12} className="markswitch-list">
                {(fieldStatus === "ACTIVE" || fieldStatus === "DRAFT")?
                    <Button variant="warning" className="addbtn-link" onClick={this.toggleProdSidebarView}><PlusIcon size={12}/></Button>
                :<></>}

                <ul className="list-inline">
                    <li className={"list-inline-item"+(this.props.proposeselecttab === "key-1"?" active":"")} onClick={() => this.props.handleProposeTabs("key-1")}>{this.props.t("EXISTING")}</li>
                    <li className={"list-inline-item"+(this.props.proposeselecttab === "key-2"?" active":"")} onClick={() => this.props.handleProposeTabs("key-2")}>{this.props.t("NEW")} {newprodcount > 0?<Badge bg='danger'>{newprodcount}</Badge>:<></>}</li>
                    <li className={"list-inline-item"+(this.props.proposeselecttab === "key-3"?" active":"")} onClick={() => this.props.handleProposeTabs("key-3")}>{this.props.t("CLIPBOARD")} {this.props.totalCutCount > 0?<Badge bg='danger'>{this.props.totalCutCount}</Badge>:<></>}</li>
                    {/* <li className={"list-inline-item"+(this.props.proposeselecttab === "key-4"?" active":"")} onClick={() => this.props.handleProposeTabs("key-4")}>{this.props.t("HISTORY")} {this.props.historyTabList && this.props.historyTabList.length > 0?<Badge bg='danger'>{this.props.historyTabList.length}</Badge>:<></>}</li> */}
                </ul>
            </Col>
            <Col xs={12}>
                <Tab.Container transition={false} activeKey={this.props.proposeselecttab}>
                    <Col>
                        <Tab.Content className={(this.props.zoompanactive?"disable-action":"")}>
                        <Tab.Pane eventKey="key-1">
                            <ul className="list-inline pgview-addeditems">
                                {this.props.existnewprodlist && this.props.existnewprodlist.length > 0?<>
                                    {this.props.existnewprodlist.map((npitem, npidx) => {
                                        return <React.Fragment key={npidx}>{npitem.existviewtype===1?<li className="list-inline-item" style={{marginRight:"2px",marginBottom:"4px"}}>
                                            <TooltipWrapper text={(npitem.productInfo.brandName&&npitem.productInfo.brandName!==""&&npitem.productInfo.brandName!=="-"?((npitem.productInfo.barcode ? (npitem.productInfo.barcode + " - "):"") + npitem.productInfo.brandName+" "):(this.props.t("notavailable")+" "))+npitem.productInfo.productName}>
                                                <div className="existnew-subview" onClick={(e)=>this.props.handlePreviewModal(npitem.productInfo,true)}>
                                                    <div className="circleview-content">{npitem.productFacingQty}</div>
                                                    <img src={npitem.productInfo.imageUrl} className="img-fluid" style={{height:"25px"}} 
                                                        onMouseDown={(e) => {this.props.drawRectCanvas(npitem.productInfo,-1)}} 
                                                        onDragStart={(e) => this.props.dragStart(e, npitem.productInfo)}
                                                        onDrag={e => this.handleGhostOnDrag(e, npitem.productInfo)} 
                                                        onDragEnd={() => this.props.prodDragEnd()}
                                                        alt="existing product" />
                                                </div>
                                            </TooltipWrapper>
                                        </li>:<></>}</React.Fragment>;
                                    })}
                                </>:<></>}
                            </ul>
                        </Tab.Pane>
                        <Tab.Pane eventKey="key-2">
                            <Col className='propose-controls'>
                                <ul className='list-inline main-list'>
                                    <li className={'list-inline-item highlight'+(this.props.showNewTabType === "new"?" active":"")} onClick={() => this.props.handleViewProposeList("new")}>{this.props.t("products")}</li>
                                    <li className={'list-inline-item highlight'+(this.props.showNewTabType === "propose"?" active":"")} onClick={() => this.props.handleViewProposeList("propose")}>{this.props.t("btnnames.propose")}</li>
                                    <li className={'list-inline-item highlight'+(this.props.showNewTabType === "imported"?" active":"")} onClick={() => this.props.handleViewProposeList("imported")}>{this.props.t("IMPORTED")}</li>

                                    {this.props.showNewTabType === "propose"?<li className='list-inline-item float-right propose-filters'>
                                        <Col>
                                            <ul className="list-inline text-right">
                                                <li className="list-inline-item" >
                                                    <Dropdown show={this.state.show} onToggle={()=>{this.setState({show:!this.state.show})}}>
                                                        <Dropdown.Toggle  style={{cursor:"pointer"}} as={ButtonGroup} className='filters-drop-down' variant="success" id="dropdown-basic">
                                                            <FeatherIcon  icon="sliders" size={16} />
                                                           {this.state.isFilter?<div className='red-dot-more-filters'></div>:<></>} 
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu className='pro-filters'>
                                                            <Row >
                                                                <Col>
                                                                    <label>{this.props.t('department')}</label>
                                                                    <Select 
                                                                        placeholder={this.props.t("department")} 
                                                                        onChange={(e) => this.handleFilter(e,"departmentId")} 
                                                                        options={filterDepartments} 
                                                                        value={filterDepartments.filter(option => option.value === this.state.filterObj.departmentId)} 
                                                                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                                        maxMenuHeight={200}    
                                                                    />
                                                                </Col>
                                                                <Col className="">
                                                                    <label>{this.props.t('category')}</label>
                                                                    <Select 
                                                                        placeholder={this.props.t("category")}  
                                                                        options={filtercategoryList} 
                                                                        onChange={(e) => this.handleFilter(e,"categoryId")} 
                                                                        value={filtercategoryList.filter(option => option.value === this.state.filterObj.categoryId)} 
                                                                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                                        maxMenuHeight={200}    
                                                                    />
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                               
                                                                <Col>
                                                                    <label>{this.props.t('subcategory')}</label>
                                                                    <Select 
                                                                        placeholder={this.props.t("subcategory")}  
                                                                        value={filterSubcategoryList.filter(option => option.value === this.state.filterObj.subCategoryId)} 
                                                                        onChange={(e) => this.handleFilter(e,"subCategoryId")} 
                                                                        options={filterSubcategoryList} 
                                                                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                                        maxMenuHeight={200}    
                                                                    />
                                                                </Col>
                                                                <Col className="">
                                                                    <label>{this.props.t('brand')}</label>
                                                                    <Select 
                                                                        placeholder={this.props.t("brand")} 
                                                                        onChange={(e) => this.handleFilter(e,"brandId")} 
                                                                        value={filterBrnadList.filter(option => option.value === this.state.filterObj.brandId)} 
                                                                        options={filterBrnadList} 
                                                                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                                        maxMenuHeight={200}    
                                                                    />
                                                                </Col>
                                                            </Row>
                                                            <Row>
                                                                <Col className="">
                                                                    <label>{this.props.t('suplable')}</label>
                                                                    <Select 
                                                                        onChange={(e) => this.handleFilter(e,"supplierId")} 
                                                                        value={filterSupplierList.filter(option => option.value === this.state.filterObj.supplierId)}
                                                                        options={filterSupplierList} 
                                                                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                                        maxMenuHeight={200}    
                                                                    />
                                                                </Col>
                                                                <Col>
                                                                </Col>
                                                            </Row>
                                                            <div className='btns d-flex justify-content-end'>
                                                                <Button type="button" size='sm' variant="outline-secondary" onClick={()=>{this.handleDropDown('r')}} className="filter-btn reset-btn">{this.props.t('btnnames.reset')}</Button>
                                                                <Button variant='danger' style={{ background: "#ed327a",border: "#ed327a",color: "#f0f0f0"}} className='mainlist-btn searchbtn' onClick={()=>this.handleDropDown('s')} size='sm'>{this.props.t("btnnames.search")}</Button>
                                                            </div>
                                                          
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                               
                                                </li>
                                                <li className="list-inline-item">
                                                    <ButtonGroup>
                                                        <Button variant="default" onClick={() => this.setPropActiveTab("add")} active={this.state.tabActiveKey === "add"} size="sm"><PlusIcon size={16} /></Button>
                                                        <Button variant="default" onClick={() => this.setPropActiveTab("remove")} active={this.state.tabActiveKey === "remove"} size="sm"><DashIcon size={16} /></Button>
                                                    </ButtonGroup>
                                                </li>
                                            </ul>
                                        </Col>
                                    </li>:<></>}
                                </ul>
                            </Col>
                            
                            {this.props.showNewTabType === "new"?<Col>
                                <ul className="list-inline pgview-addeditems add">
                                    {this.props.existnewprodlist && this.props.existnewprodlist.length > 0?<>
                                        {this.props.existnewprodlist.map((npitem, npidx) => {
                                            return <React.Fragment key={npidx}>{npitem.existviewtype===2?<li className="list-inline-item" style={{marginRight:"2px",marginBottom:"4px"}}>
                                                <TooltipWrapper text={(npitem.productInfo.brandName&&npitem.productInfo.brandName!==""&&npitem.productInfo.brandName!=="-"?((npitem.productInfo.barcode ? (npitem.productInfo.barcode + " - "):"") + npitem.productInfo.brandName+" "):(this.props.t("notavailable")+" "))+npitem.productInfo.productName}>
                                                    <div className="existnew-subview" onClick={(e)=>this.props.handlePreviewModal(npitem.productInfo,true)}>
                                                        <div className="circleview-content">{npitem.productFacingQty}</div>
                                                        <img src={npitem.productInfo.imageUrl} className="img-fluid" style={{height:"25px"}} alt="new product" onMouseDown={(e) => {this.props.drawRectCanvas(npitem.productInfo,-1)}} onDragStart={(e) => this.props.dragStart(e, npitem.productInfo)}/>
                                                    </div>
                                                </TooltipWrapper>
                                            </li>:<></>}</React.Fragment>;
                                        })}
                                    </>:<>
                                        <li className='list-inline-item text-center nocontent-txt'>{this.props.t("NO_CONTENT_FOUND")}</li>
                                    </>}
                                </ul>
                            </Col>
                            :this.props.showNewTabType === "propose"?<Col>
                                <ViewProposeList t={this.props.t} isRTL={this.props.isRTL} 
                                    tabActiveKey={this.state.tabActiveKey}
                                    drawRectCanvas={this.props.drawRectCanvas} 
                                    dragStart={this.props.dragStart} 
                                    copytoclipboard={this.props.copyToClipboard} 
                                    loadedproposelist={this.state.filteredloadedProposeList} 
                                    toggleProposeHighlight={this.props.toggleProposeHighlight}
                                    handleProductImgPreview={this.props.handlePreviewModal} 
                                    prodDragEnd={this.props.prodDragEnd}
                                    handleGhostOnDrag={this.handleGhostOnDrag}
                                    />
                            </Col>
                            :<Col>
                                <InputGroup size="sm" className={"imported-searchwrapper"+(this.props.excelUploadList.length > 0?"":" not-available")}>
                                    <span className='searchicon-content'><SearchIcon size={18}/></span>
                                    
                                    {this.props.isImportDataLoading?
                                        <img src={loadinggif} alt="loading animation" style={{height:"15px"}}/>
                                    :<></>}
                                    
                                    <Form.Control id="filterprodtxt" placeholder={this.props.t('srchproduct')} 
                                        value={this.props.excelSearchText} onFocus={e => e.target.select()} 
                                        onChange={e => this.props.updateExcelSearchText(e)} 
                                        onKeyDown={e => this.props.updateExcelSearchText(e)} />
                                </InputGroup>
                                
                                {this.props.excelUploadList && this.props.excelUploadList.length > 0?<>
                                    <ul className="imported-deleteoptions list-inline text-right">
                                        <li className="list-inline-item" onClick={() => this.deleteImportedProds(this.props.excelUploadList, "SELECTED")}><FeatherIcon icon="trash" size={14} /> {this.props.t("APPLY_TYPES.SELECTED")}</li>
                                        <li className="list-inline-item" onClick={() => this.deleteImportedProds([], "ALL")}><FeatherIcon icon="trash" size={14} /> {this.props.t("ALL")}</li>
                                    </ul>
                                </>:<></>}
                                
                                {this.props.excelUploadList && this.props.excelUploadList.length > 0?<>
                                    <span className='allupload-option' onClick={() => this.toggleExcelProdSelect(false, null, false)}>{this.props.t("SELECT_ALL")}</span>
                                    <span className='allupload-option' onClick={() => this.toggleExcelProdSelect(false, null, true)}>{this.props.t("SELECT_NONE")}</span>
                                </>:<></>}

                                <ul id="allupload-scrollcontent" className="list-inline pgview-addeditems imported" onScroll={(e)=> this.getWarnScrollPosition(e)}>
                                    {this.props.excelUploadList && this.props.excelUploadList.length > 0?<>
                                        {this.props.excelUploadList.map((npitem, npidx) => {
                                            return <li key={npidx} className={"list-inline-item"+(npitem.isAdded?" added":"")} style={{marginRight:"2px",marginBottom:"4px"}}>
                                                <span className='close-link' onClick={() => this.deleteImportedProds([npitem],"SINGLE")}><FeatherIcon icon="x" size={12} /></span>
                                                <input type='checkbox' className='select-check' checked={npitem.isSelected} onChange={e => this.toggleExcelProdSelect(true, npidx)} />
                                                <TooltipWrapper text={<>
                                                    <small style={{fontSize:"0.75rem"}}>{npitem.barcode}</small><br/>{npitem.productName}<br/>
                                                    <small>{this.props.t("brand")}: {(npitem.brandName && npitem.brandName !== "" && npitem.brandName!=="-"?(npitem.brandName+" "):(this.props.t("notavailable")+" "))}</small>
                                                </>}>
                                                    <div className="existnew-subview" onClick={(e)=>this.props.handlePreviewModal(npitem,true)}>
                                                        <img src={(npitem.imageUrl?npitem.imageUrl:imagePlaceholder)} className="img-fluid" style={{height:"25px"}} alt="imported product" 
                                                            onMouseDown={(e) => {this.props.drawRectCanvas(npitem,-1)}} 
                                                            onDragStart={(e) => this.props.dragStart(e, npitem)}
                                                            onDrag={e => this.handleGhostOnDrag(e, npitem)} 
                                                            onDragEnd={() => this.props.prodDragEnd()}
                                                            />
                                                    </div>
                                                </TooltipWrapper>
                                            </li>;
                                        })}
                                    </>:<>
                                        {this.props.isImportDataLoading?
                                        <Col className="text-center" style={{paddingTop:"95px"}}><img src={loadinggif} alt="loading animation" style={{height:"20px"}}/></Col>
                                        :<li className='list-inline-item text-center nocontent-txt'>{this.props.t("NO_CONTENT_FOUND")}</li>}
                                    </>}

                                    {this.props.isImportDataLoading && this.props.excelStartIndex > 0?
                                        <Col className="text-center" style={{paddingTop:"10px", paddingBottom:"10px"}}><img src={loadinggif} alt="loading animation" style={{height:"20px"}}/></Col>
                                    :<></>}
                                </ul>
                            </Col>}
                        </Tab.Pane>
                        <Tab.Pane eventKey="key-3">
                            <PgDunitClipBoard 
                                cutArray={this.props.clipBoardList} 
                                clipDragType={this.state.clipDragType}
                                totalCutCount={this.props.totalCutCount}
                                zoomDrawX={this.props.zoomDrawX}
                                dragStart={this.props.dragStart}
                                drawRectCanvas={this.props.drawRectCanvas} 
                                ghostFromParent={this.props.ghostFromParent} 
                                setPreviewGuid={this.props.setPreviewGuid}
                                prodDragEnd={this.props.prodDragEnd}
                                toggleClipDragType={this.toggleClipDragType}
                                updateSingleCutProduct={this.props.updateSingleCutProduct}
                                />
                        </Tab.Pane>
                        {/* <Tab.Pane eventKey="key-4">
                            <PgHistoryTabView 
                                copyToClipboard={this.props.copyToClipboard} 
                                historyTabList={this.props.historyTabList} 
                                handleProductImgPreview={this.props.handlePreviewModal} 
                                />
                        </Tab.Pane> */}
                        </Tab.Content>
                    </Col>
                </Tab.Container>
            </Col>

            {this.state.showrotateprod?
                <ProductRotate isRTL={this.props.isRTL} dmode={this.props.dmode} 
                    isshowrotateedit={this.state.isshowrotateedit} 
                    showrotateprod={this.state.showrotateprod} 
                    selectedrotateprod={this.state.selectedrotateprod} 
                    displayuom={this.props.displayUOM} 
                    viewrotateprod={this.toggleRotateProd} 
                    updaterotateprod={this.updateRotateProd} 
                    />
            :<></>}

            {this.state.prodEditModalView?
                <ProdMDModal isRTL={this.props.isRTL} 
                    pemshow={this.state.prodEditModalView} 
                    pemobj={this.state.prodEditObj} saveobj={this.props.saveObj} 
                    handlepemview={this.handlePEMView} 
                    />
            :<></>}
        </>)    
    }
}