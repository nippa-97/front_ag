import React, { Component } from 'react';
import { Row, Col, Button, Collapse , InputGroup } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import {  PlusIcon, DashIcon, TrashIcon, ReplyIcon , ChevronDownIcon } from '@primer/octicons-react';
import FeatherIcon from 'feather-icons-react';
import {sortableContainer, sortableElement, SortableHandle} from 'react-sortable-hoc-rtl'; //react-sortable-hoc //react-sortable-hoc-rtl
import { confirmAlert } from 'react-confirm-alert';
// import { CopyToClipboard } from 'react-copy-to-clipboard';

import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { alertService } from '../../../_services/alert.service';
import { AcViewModal } from '../../UiComponents/AcImports';
//import { getNameorIdorColorofBox } from '../AddMethods';
//import { catRectEnums } from '../../../enums/masterPlanogramEnums';

import ProductPreview from './productdetails/productpreview';
import PreviewImage from '../../common_layouts/image_preview/imagePreview';
import loader from '../../../assets/img/loading-sm.gif'
import './productsSideBar.css';
import { roundOffDecimal } from '../../../_services/common.service'; //, findBrowserType
import { TooltipWrapper } from '../AddMethods';

const NewSortableContainer = sortableContainer(({children}) => {
    return <Row>{children}</Row>;
});

const SortableContainer = sortableContainer(({children}) => {
    return <Row>{children}</Row>;
});

const OnTopSortableContainer = sortableContainer(({children}) => {
    return <Row>{children}</Row>;
});

const NewSortableItem = sortableElement(({rownumber , isrtl, product, trans, handleImagePreviewModal, getProductData, dragStart, dragEnd, setSelectedProduct}) => 
    
    <div className='proddet-view-main prodview-col'>
        <Col className={'proddet-view new-prod-item ' +(isrtl==="rtl"?"RTL":"LTR")} pid={product.productId} data-type={"new"} data-index={rownumber} data-obj={JSON.stringify(product)} >
            <div className="prd-draghandler" onMouseDown={()=>setSelectedProduct(product, product.productId)}><NewDragHandler/></div>
            <div className="image-view" onClick={()=>handleImagePreviewModal(product,true)}>
                <img src={product.imgUrl} className={(product.width >= product.height)?"img-resize-ver":"img-resize-hor"} alt="" onDragStart={(e)=>e.preventDefault() } />
            </div>
            <div className="prod-details" onClick={()=>getProductData(product)}>
                <label className={"prod-txt "+(isrtl==="rtl"?"RTL":"LTR")}>
                    <TooltipWrapper text={product.barcode}><small>{product.barcode}</small></TooltipWrapper>
                    {(product.productName.substring(0,30)+(product.productName.length > 30?"..":""))}
                </label>
            </div>
            <div className='bottom-values' onClick={()=>getProductData(product)}>
                
                <Col xs={12}>
                    <label>{product.suggestedSpace}%</label>
                    <span className={isrtl==="rtl"?"float-right":"float-left"}>SPF</span>
                </Col>
            </div>
        </Col>
    </div>
);

const SortableItem = sortableElement(({rownumber , isrtl, product, trans,showFullSidebarSizeChange, handleChangeArchive, handleImagePreviewModal, getProductData, handlePerentageChange, handlePerentageBlur, handlePercentageOnFocus, handlePlusMinus, dragStart, dragEnd, setSelectedProduct}) => 
    
    <div className="proddet-view-main prodview-col" >
        
        <Col className={'proddet-view '+(isrtl==="rtl"?"RTL":"LTR")} pid={product.productId} data-type={"mvp"} data-index={rownumber} data-obj={JSON.stringify(product)} draggable="false" onDragStart={(event)=>dragStart(event)} onDragEnd={(event)=>dragEnd(event)}>
            <label className='archive-check'><input type="checkbox" checked={product.isArchive} onChange={() => handleChangeArchive("mvp", rownumber, product)} /> </label>

            <div className="prd-rank">{product.rank}</div>
            <div className="prd-draghandler" onMouseDown={()=>setSelectedProduct(product, product.productId)}><DragHandler /></div>
            <div className="image-view" onClick={()=>handleImagePreviewModal(product,true)}>
                {product.isMandatory?<label className='man-label'>M</label>:<></>}
                <img src={product.imgUrl} className={(product.width >= product.height)?"img-resize-ver":"img-resize-hor"} alt="" onDragStart={(e)=>e.preventDefault() } />
            </div>
            <div className={"prod-details "+(isrtl==="rtl"?"RTL":"LTR")} onClick={()=>getProductData(product)}>
                <label className="prod-txt">
                    <TooltipWrapper text={product.barcode}><small>{product.barcode}</small></TooltipWrapper>
                    {(product.productName.substring(0,30)+(product.productName.length > 30?"..":""))}
                </label>
            </div>
            <div className={'bottom-values '+(isrtl==="rtl"?"RTL":"LTR")} dir={isrtl}>
                <Col xs={12}><label>{(product.suggestedSpace?(product.suggestedSpace%1===0?product.suggestedSpace:product.suggestedSpace.toFixed(2)):0)}%</label><span>Rec</span></Col>
                <Row>
                    {/* <label>{(product.suggestedSpace?(product.suggestedSpace%1===0?product.suggestedSpace:product.suggestedSpace.toFixed(2)):0)}%</label> */}
                    <Col xs={4}><span>{trans("FACING")}</span></Col>
                    <Col xs={8} className="mvp-per-col">
                        <InputGroup size='sm'>
                            <Button variant="outline-secondary" onClick={(e) => handlePlusMinus(product.productId,"min")}><FeatherIcon icon="minus" size={7}/></Button>
                            <input type="number" className='preaddinput form-control' value={product.preAddedSuggestedSpace} onChange={(e) => handlePerentageChange(e,product.productId)} onBlur={(e)=> handlePerentageBlur(e,product.productId)} onFocus={()=>handlePercentageOnFocus()} />
                            <Button variant="outline-secondary" onClick={(e) => handlePlusMinus(product.productId,"plus")}><FeatherIcon icon="plus" size={7}/></Button>
                        </InputGroup>
                        {/* <input type="number" className='preaddinput' value={product.preAddedSuggestedSpace} onChange={(e) => handlePerentageChange(e,product.productId)} onBlur={(e)=> handlePerentageBlur(e,product.productId)} onFocus={()=>handlePercentageOnFocus()} />
                        <label className='perc-mark-lbl'></label> */}
                    </Col>
                </Row>
            </div>
        </Col>
    </div>
);

const OnTopSortableItem = sortableElement(({rownumber , isrtl, product, trans, showFullSidebarSizeChange, handleChangeArchive, handleImagePreviewModal, getProductData, handlePerentageChange, handlePerentageBlur, handlePercentageOnFocus, handlePlusMinus, dragStart, dragEnd, setSelectedProduct}) => 
    
    <div className='proddet-view-main prodview-col' >
        <Col className={'proddet-view ' +(isrtl==="rtl"?"RTL":"LTR")} pid={product.productId} data-type={"ontop"} data-index={rownumber} data-obj={JSON.stringify(product)} draggable="false" onDragStart={(event)=>dragStart(event)} onDragEnd={(event)=>dragEnd(event)}>
        <label className='archive-check'><input type="checkbox" checked={product.isArchive} onChange={() => handleChangeArchive("ontop", rownumber, product)} /> </label>
            
            <div className="prd-rank">{product.rank}</div>
            <div className="prd-draghandler" onMouseDown={()=>setSelectedProduct(product,product.productId)}><OnTopDragHandler/></div>
            <div className="image-view" onClick={()=>handleImagePreviewModal(product,true)}>
                {product.isHasTags?<label className='man-label'>T</label>:<></>}
                <img src={product.imgUrl} className={(product.width >= product.height)?"img-resize-ver":"img-resize-hor"} alt="" onDragStart={(e)=>e.preventDefault() } />
            </div>
            <div className="prod-details" onClick={()=>getProductData(product)}>
                <label className="prod-txt">
                    <TooltipWrapper text={product.barcode}><small>{product.barcode}</small></TooltipWrapper>
                    {(product.productName.substring(0,30)+(product.productName.length > 30?"..":""))}
                </label>
            </div>
            <div className={'bottom-values '+(isrtl==="rtl"?"RTL":"LTR")} dir={isrtl}>
                <Col xs={12}><label>{(product.suggestedSpace?(product.suggestedSpace%1===0?product.suggestedSpace:product.suggestedSpace.toFixed(2)):0)}%</label><span>Rec</span></Col>
                <Row>
                    <Col xs={4}><span>{trans("FACING")}</span></Col>
                    <Col xs={8} className="mvp-per-col">
                        <InputGroup size='sm'>
                            <Button variant="outline-secondary" onClick={(e) => handlePlusMinus(product.productId,"min")}><FeatherIcon icon="minus" size={7}/></Button>
                            <input type="number" className='preaddinput form-control' value={product.preAddedSuggestedSpace} onChange={(e) => handlePerentageChange(e,product.productId)} onBlur={(e)=> handlePerentageBlur(e,product.productId)} onFocus={()=>handlePercentageOnFocus()} />
                            <Button variant="outline-secondary" onClick={(e) => handlePlusMinus(product.productId,"plus")}><FeatherIcon icon="plus" size={7}/></Button>
                        </InputGroup>
                    </Col>
                </Row>
            </div>
        </Col>
    </div>
        
     
);

const NewDragHandler = SortableHandle(() => <div className="handle"><FeatherIcon icon="move" size={14}/></div>);

const DragHandler = SortableHandle(() => <div className="handle"><FeatherIcon icon="move" size={14}/></div>);

const OnTopDragHandler = SortableHandle(() => <div className="handle"><FeatherIcon icon="move" size={14}/></div>);

var valueChangeTimer = null;

export class ProductsSidebar extends Component {
    constructor(props){
        super(props);

        this._isMounted = false;
        
        this.state = {
            showSidebar: false,
            prodlistViewTypes:{new:true, mvp:true, ontop:true},
            isShowPreviewModal:false,
            selectedProduct:null,
            tagslist:[],
            isdataloading:false,

            showPreviewImageModal:false, productId:0,

            draggingObj : null,dragItemIndex:-1, dragItemType:"",

            textChangelist : [],
            textChangelistOntop : [],

            allocateProds:[],

            allArchiveItems: [],

            dragSortMousePosition:null,

            selectedProductDrag:null, selectedProductIDDrag:-1,

            snapId:-1,originalData:{}
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
           if(process.env.NODE_ENV==="production"){
             console.log = () => { };
           }
        
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    
    setProdListView = (type) =>{
        var obj = this.state.prodlistViewTypes;
        obj[type] = !obj[type];
        this.setState({prodlistViewTypes:obj});
    }

    //get data for product preview modal
    getProductData = (citem ) => {
        if(citem){
            this.setState({isdataloading:true, selectedProduct:null,originalData:{}, isShowPreviewModal:false, snapId:(citem.snapId?citem.snapId:-1)},()=>{
                let svobj = "?productId="+citem.productId;
                submitSets(submitCollection.findProdByID, svobj).then(res => {
                    //console.log(res.extra);
                    this.setState({isdataloading:false});
                    if(res && res.status && res.extra){
                        this.setState({selectedProduct: (res.extra?res.extra:null) , originalData: (res.extra?res.extra:null)},()=>{
                            this.toggleProductEditModal();
                        });
                    } else{
                        alertService.error(this.props.t("PRODUCT_NOT_FOUND"));
                    }
                });
            });
            // if(!citem.isNew){
            // } else{
            //     this.setState({ isShowPreviewModal: false, selectedProduct: null });
            //     alertService.error(this.props.t("SAVE_PRODUCT_BEFORE_EDIT"));
            // }
        } else{
            this.setState({ isShowPreviewModal: false, selectedProduct: null });
        }
    }
    
    toggleProductEditModal = () =>{
        this.setState({isShowPreviewModal:!this.state.isShowPreviewModal});
    }

    //save product details
    handleSaveProduct = (saveobj, updateSnapshot) => {
        this.setState({isdataloading:true});

        let defSaveObj = this.props.defSaveObj;

        saveobj.mpId = defSaveObj.mp_id;
        saveobj.snapId = this.state.snapId;
        saveobj.isApprovedSnapshot = updateSnapshot;
        saveobj.isUpdateOnlyFlags = false;
        
        submitSets(submitCollection.updateProds, saveobj, false, null, true).then(res => {
            this.setState({isdataloading:false});
            if(res && res.status){
                alertService.success(this.props.t("PRODUCT_DETAILS_SUCCESSFULLY_UPDATED"));
                if(updateSnapshot===true){
                    this.updateSnapshots(saveobj,true);
                }
                else{
                    this.props.loadSidebarProductList();
                }
                this.setState({ isShowPreviewModal: false, selectedProduct: null });
            } else{
                // alertService.error(res && res.extra?res.extra:this.props.t("erroroccurred"));
            }
        });
    }

    updateSnapshots = (product,isreload) =>{
        this.setState({savemodalshow:false});
        var oriProd = this.state.originalData;
        let hasTags = false;
        for (let i = 0; i < product.productTags.length; i++) {
            if(product.productTags[i].isDelete!==true){
                hasTags = true;
            }
        }

        let sobj = {
            snapId:this.state.snapId,
            productId: oriProd.id,
            subCategoryId: oriProd.subCategoryId,
            brandId: oriProd.brandId,
            isMvp: (oriProd.isMvp?oriProd.isMvp:false),
            isOnTop: (oriProd.isOnTop?oriProd.isOnTop:false),
            isMandatory: (oriProd.isMandatory?oriProd.isMandatory:false),
            isHasTags: hasTags,
            isApprovedSnapshot : true,
            isUpdateOnlyFlags : true,
        } 

        submitSets(submitCollection.updateMpSnapShot, sobj , true, null, true).then(resp => {
            this.setState({ savemodalshow:false});

            if(isreload===true){
                this.props.loadSidebarProductList();
            }

            if(resp && resp.status){
                
            }
            else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
    }

    handleImagePreviewModal = (obj,type) =>{
        this.setState({productId:(obj?obj.productId:0), showPreviewImageModal:type});
    }

    sortEvent = (event) =>{
        //console.log(event);
    }

    //Drag to MVP
    dragStart = (event) =>{
        var draggingObj = JSON.parse(event.target.getAttribute("data-obj"));
        var dragItemIndex = event.target.getAttribute("data-index");
        var dragItemType = event.target.getAttribute("data-type");
        
        ///console.log(draggingObj);
        this.setState({draggingObj:draggingObj, dragItemIndex:dragItemIndex, dragItemType:dragItemType});
        
        // event.target.classList.add('hide-dragable-original');
    }

    dropToMvp = (event) =>{
        if(this.state.draggingObj && this.state.dragItemType!=="mvp"){
            this.props.AddHistory(); //add old object to history

            var mvpProds = JSON.parse(JSON.stringify(this.props.loadedMvpProds)) ;
            var onTopProds = JSON.parse(JSON.stringify(this.props.loadedTopProds)) ;
            var newProds = JSON.parse(JSON.stringify(this.props.loadedNewProducts)) ;
            let mvpmanindexes = this.props.mvpMandatoryIndexes;
            let ontopmanindexes = this.props.onTopHasTagsIndexes;
    
            var dragItem = this.state.draggingObj;
    
            if(this.state.dragItemType === "new"){
                newProds.splice(this.state.dragItemIndex,1);
                //dragItem.isNewProduct = false;
                dragItem.isMVP = true;
                dragItem.rank = (mvpProds.length > 0? (mvpProds.length + 1) : 1);
            }
    
            if(this.state.dragItemType === "ontop"){
                if(dragItem.isHasTags === true){
                    var otindx = ontopmanindexes.indexOf(this.state.draggingObj.productId); 
                    if(otindx>-1){
                        ontopmanindexes.splice(otindx,1);
                    }
                }
                onTopProds.splice(this.state.dragItemIndex,1);
                dragItem.isMVP = true;
                dragItem.isOnTop = false;
        
                dragItem.rank = (mvpProds.length>=0 ? (mvpProds.length + 1) : 1);

                for (let x = 0; x < onTopProds.length; x++) {
                    onTopProds[x].rank = (x+1);
                }

            }

            dragItem["isNew"] = true;
            dragItem.isOnTopTag = false;
            dragItem.isOverride = true;
            //dragItem.isMandatory = false;
            
            if(dragItem.isMandatory){
                let lastmanidx = mvpmanindexes.indexOf(dragItem.productId);
                lastmanidx = (lastmanidx<0? (mvpmanindexes.length) :0);
                mvpProds.splice((lastmanidx), 0, dragItem);
                mvpmanindexes.push((dragItem.productId));

                for (let x = 0; x < mvpProds.length; x++) {
                    mvpProds[x].rank = (x+1);
                }

                //let lastmanidx = mvpmanindexes[(mvpmanindexes.length - 1)];
                //mvpProds.insert((lastmanidx + 1), dragItem);

                //mvpmanindexes.push((lastmanidx + 1));
                //lastaddedidx = (lastmanidx + 1);
            } else{
                mvpProds.push(dragItem);
            }

            var arraySet = {
                loadedMvpProds:mvpProds,
                loadedTopProds:onTopProds,
                loadedNewProducts:newProds,
                loadedNewTestingProds: this.props.loadedNewTestingProds
            }

            var temnewlist = [];
            if(this.state.dragItemType === "new"){
                temnewlist = newProds;
            }

            if(event){event.target.classList.remove('drag-enter');}
            
            let hasSnapFlag = (this.state.dragItemType==="new"?false:this.props.isHasSnap);
            this.props.saveBrandProductSnapshot(mvpProds,onTopProds,temnewlist,hasSnapFlag,false,false,false);

            this.props.setMainProductArrays(arraySet, mvpmanindexes, ontopmanindexes);
            this.setState({ draggingObj: null }, () => {
                //load recommended percentage if its new item
                //if(this.state.dragItemType === "new"){
                    //this.updateNewProdRec(lastaddedidx, dragItem);
                    // this.props.loadSidebarBrandList();
                //}
            });
        }
    }
    //Drag to MVP end

    //Drag to On top
    dragStartToOnTop = (event) =>{
        var draggingObj = JSON.parse(event.target.getAttribute("data-obj"));
        var dragItemIndex = event.target.getAttribute("data-index");
        var dragItemType = event.target.getAttribute("data-type");
        
        this.setState({draggingObj:draggingObj, dragItemIndex:dragItemIndex, dragItemType:dragItemType});
        
        // event.target.classList.add('hide-dragable-original');
    }

    dropToOnTop = (event) =>{
        if(this.state.draggingObj && this.state.dragItemType!=="ontop"){
            this.props.AddHistory();

            let mvpProds = JSON.parse(JSON.stringify(this.props.loadedMvpProds)) ;
            let onTopProds = JSON.parse(JSON.stringify(this.props.loadedTopProds)) ;
            let newProds = JSON.parse(JSON.stringify(this.props.loadedNewProducts)) ;
            let ontopmanindexes = this.props.onTopHasTagsIndexes;
            let mvpmanindexes = this.props.mvpMandatoryIndexes;
            var dragItem = this.state.draggingObj;

            if(this.state.dragItemType === "mvp"){
                if(dragItem.isMandatory === true){
                    var otindx = mvpmanindexes.indexOf(this.state.draggingObj.productId); 
                    if(otindx>-1){
                        mvpmanindexes.splice(otindx,1);
                    }
                }

                mvpProds.splice(this.state.dragItemIndex,1);
                dragItem.isMVP = false;
                dragItem.isOnTop = true;
                dragItem.rank = (onTopProds.length>=0 ? (onTopProds.length + 1) : 1);

                // if(dragItem.isOnTopTag === false){
                //     dragItem.isOnTopTag = (dragItem.isHasTags ? dragItem.isHasTags :dragItem.isOnTopTag);
                // }

                for (let x = 0; x < mvpProds.length; x++) {
                    mvpProds[x].rank = (x+1);
                }
            }
            if(this.state.dragItemType === "new"){
                newProds.splice(this.state.dragItemIndex,1);
                //dragItem.isNewProduct = false;
                dragItem.isMVP = false;
                dragItem.isOnTop = true;

                // if(dragItem.isOnTopTag === false){
                //     dragItem.isOnTopTag = (dragItem.isHasTags ? dragItem.isHasTags :dragItem.isOnTopTag);
                // }

                dragItem.rank = (onTopProds.length > 0? (onTopProds.length + 1) : 1);
            }

            dragItem["isNew"] = true;
            dragItem.isMandatory = false;
            dragItem.isOverride = true;

            if(dragItem.isHasTags===true){
                let lastmanidx = ontopmanindexes.indexOf(dragItem.productId);//(ontopmanindexes.length>0 ? ontopmanindexes[(ontopmanindexes.length - 1)] : 0);
                lastmanidx = (lastmanidx<0? (ontopmanindexes.length) :0);
                onTopProds.splice((lastmanidx), 0, dragItem);
                ontopmanindexes.push((dragItem.productId));

                for (let x = 0; x < onTopProds.length; x++) {
                    onTopProds[x].rank = (x+1);
                }
                
            }
            else{
                onTopProds.push(dragItem);
            }

            var arraySet = {
                loadedMvpProds:mvpProds,
                loadedTopProds:onTopProds,
                loadedNewProducts:newProds,
                loadedNewTestingProds: this.props.loadedNewTestingProds
            }

            var temnewlist = [];
            if(this.state.dragItemType === "new"){
                temnewlist = newProds;
            }

            if(event){event.target.classList.remove('drag-enter');}

            let hasSnapFlag = (this.state.dragItemType==="new"?false:this.props.isHasSnap);
            this.props.saveBrandProductSnapshot(mvpProds,onTopProds,temnewlist,hasSnapFlag,false,false,false);

            this.props.setMainProductArrays(arraySet, mvpmanindexes,ontopmanindexes);
            this.setState({ draggingObj: null }, () => {
                //load recommended percentage if its new item
                //if(this.state.dragItemType === "new"){
                    ///this.updateNewProdRec(lastaddedidx, dragItem);
                    // this.props.loadSidebarBrandList();
                //}
            });
        }
    }

    //drag on top end

    onSortMoveNew = (event) =>{
        this.setState({dragSortMousePosition:event});
    }

    onSortEndNew = ({oldIndex, newIndex}, evt) => {
        //check if dragged to mvp and drop it to mvp
        if(this.state.dragSortMousePosition){
            let pathlist = (this.state.dragSortMousePosition.path ? this.state.dragSortMousePosition.path : []);
            //console.warn(pathlist);
            if(pathlist.length === 0 && evt.composedPath){ //findBrowserType() === "firefox" &&
                pathlist = evt.composedPath();
            }

            var mvpavl = pathlist.findIndex(x => x.id === "mvp-sortable");
            var ontopavl = pathlist.findIndex(x => x.id === "ontop-sortable");
            
            if(mvpavl>-1 || ontopavl>-1){
                var newProds = JSON.parse(JSON.stringify(this.props.loadedNewProducts)) ;
                var draggingObj = newProds.find(x => x.productId === this.state.selectedProductIDDrag)
                var dragItemIndex = newProds.findIndex(x => x.productId === this.state.selectedProductIDDrag)
                var dragItemType = "new";
                //console.log(dragItemIndex);
                //console.log(this.state.selectedProductIDDrag);
                this.setState({draggingObj:draggingObj, dragItemIndex:dragItemIndex, dragItemType:dragItemType, dragSortMousePosition:null},()=>{
                    if(mvpavl>-1){
                        this.dropToMvp();
                    }
                    else if(ontopavl>-1){
                        this.dropToOnTop();
                    }
                });
            }
            
        }
    }

    onSortMoveOntop = (event) =>{
        this.setState({dragSortMousePosition:event});
    }

    onSortEndOnTop = ({oldIndex, newIndex}, evt) => {
        

        //check if dragged to mvp and drop it to mvp
        if(this.state.dragSortMousePosition){
            let pathlist = (this.state.dragSortMousePosition.path ? this.state.dragSortMousePosition.path : []);

            if(pathlist.length === 0 && evt.composedPath){//findBrowserType() === "firefox" &&
                pathlist = evt.composedPath();
            }

            var idavailable = pathlist.findIndex(x => x.id === "mvp-sortable");
            
            if(idavailable>-1){
                var onTopProds = JSON.parse(JSON.stringify(this.props.loadedTopProds)) ;
                var draggingObj = onTopProds.find(x => x.productId === this.state.selectedProductIDDrag)//this.state.selectedProductDrag;
                var dragItemIndex = onTopProds.findIndex(x => x.productId === this.state.selectedProductIDDrag)//this.state.selectedProductIDDrag;
                var dragItemType = "ontop";
                this.setState({draggingObj:draggingObj, dragItemIndex:dragItemIndex, dragItemType:dragItemType, dragSortMousePosition:null},()=>{
                    this.dropToMvp();
                });
            }
            else{
                var isontopavl = pathlist.findIndex(x => x.id === "ontop-sortable");
                if(isontopavl>-1){
                    this.props.onSortEndOnTop(oldIndex, newIndex);
                }
            }
        }
        else{
            this.props.onSortEndOnTop(oldIndex, newIndex);
        }
        
    }

    onSortMoveMVP = (event) =>{
        this.setState({dragSortMousePosition:event});
    }

    onSortEndMvp = ({oldIndex, newIndex}, evt) =>{
        //check if dragged to ontop and drop it to ontop
        if(this.state.dragSortMousePosition){
            let pathlist = (this.state.dragSortMousePosition.path ? this.state.dragSortMousePosition.path : []);
            
            if(pathlist.length === 0 && evt.composedPath){//findBrowserType() === "firefox" && 
                pathlist = evt.composedPath();
            }

            var idavailable = pathlist.findIndex(x => x.id === "ontop-sortable");
            
            if(idavailable>-1){
                var mvpProds = JSON.parse(JSON.stringify(this.props.loadedMvpProds)) ;
                var draggingObj = mvpProds.find(x => x.productId === this.state.selectedProductIDDrag)//this.state.selectedProductDrag;
                var dragItemIndex = mvpProds.findIndex(x => x.productId === this.state.selectedProductIDDrag)//this.state.selectedProductIDDrag;
                var dragItemType = "mvp";
                this.setState({draggingObj:draggingObj, dragItemIndex:dragItemIndex, dragItemType:dragItemType, dragSortMousePosition:null},()=>{
                    this.dropToOnTop();
                    this.props.removeMandatoryIndex(oldIndex);
                });

            }
            else{
                var ismvpavl = pathlist.findIndex(x => x.id === "mvp-sortable");
                if(ismvpavl>-1){
                    this.props.onSortEnd(oldIndex, newIndex);
                }
            }
        }
        else{
            this.props.onSortEnd(oldIndex, newIndex);
        }
    }


    dragEnd = (event) =>{
        //console.log(event);
        // event.target.classList.remove('hide-dragable-original');
    }

    dragEnter = (event) =>{
        event.preventDefault();
        event.target.classList.add('drag-enter');
    }

    dragLeave = (event) =>{
        event.preventDefault();
        event.target.classList.remove('drag-enter');
    }
    
    allowDrop = (event) =>{
        event.preventDefault();
        event.target.classList.add('drag-enter');
    }

    //MVP percentage changes
    handlePercentageOnFocus = () =>{
        let mvpProds = JSON.parse(JSON.stringify(this.props.loadedMvpProds));
        this.setState({textChangelist:mvpProds});
    }

    handlePerentageBlur = (e, pid) =>{
        var temmvp = this.state.textChangelist;
        var index = temmvp.findIndex(x => x.productId === pid);
        if(index>-1){
            var oldval = (temmvp[index].preAddedSuggestedSpace && temmvp[index].preAddedSuggestedSpace!=="" ? parseFloat(temmvp[index].preAddedSuggestedSpace) : 0);
            var newval = (e.target.value && e.target.value!=="" ? parseFloat(e.target.value) : 0);
            var isChanged = (oldval=== newval ? false : true);

            if(isChanged === true){
                this.props.AddHistory(temmvp);
                this.props.saveBrandProductSnapshot(null,null,null,true,false,false,false);
            }
        }
    }

    handlePerentageChange = (e,pid) =>{
        let mvpProds = JSON.parse(JSON.stringify(this.props.loadedMvpProds));
        var onTopProds = JSON.parse(JSON.stringify(this.props.loadedTopProds)) ;
        var newProds = JSON.parse(JSON.stringify(this.props.loadedNewProducts)) ;
        var index = mvpProds.findIndex(x => x.productId === pid);
       
        if(index > -1){
            // var savedval = JSON.parse(JSON.stringify(mvpProds[index].preAddedSuggestedSpace));
            var newval = (e.target.value <0 ? 0 :e.target.value);
           
            //var val = (newval>100 ? 100 : newval);

            if(newval>100){
                alertService.warn(this.props.t("PLS_ENTER_VALID_PERCENTAGE"));
            }
            else{
                if(mvpProds[index].preAddedSuggestedSpace !== newval){
                    this.props.AddHistory(); //add old object to history
                }
    
                mvpProds[index].preAddedSuggestedSpace  = newval;
            }
            
            // let mvpAndOntopList = mvpProds.concat(onTopProds);
            // if(this.getMvpPercentageTotal(mvpAndOntopList)>100){
            //     //alertService.warn("Total is larger than 100");
            //     mvpProds[index].preAddedSuggestedSpace  = savedval;
            // }

            var arraySet = {
                loadedMvpProds:mvpProds,
                loadedTopProds:onTopProds,
                loadedNewProducts:newProds,
                loadedNewTestingProds: this.props.loadedNewTestingProds
            }
            
            this.props.setMainProductArrays(arraySet);
            this.props.triggerProdSidebarChange(true);
        }
    }

    handlePlusMinus = (pid,type) =>{//type min, plus
        if(valueChangeTimer){
            clearTimeout(valueChangeTimer);
        }

        let mvpProds = JSON.parse(JSON.stringify(this.props.loadedMvpProds));
        var onTopProds = JSON.parse(JSON.stringify(this.props.loadedTopProds)) ;
        var newProds = JSON.parse(JSON.stringify(this.props.loadedNewProducts)) ;
        var index = mvpProds.findIndex(x => x.productId === pid);
       
        if(index > -1){
            this.props.AddHistory(); //add old object to history

            // var savedval = (mvpProds[index].preAddedSuggestedSpace ? Math.trunc(mvpProds[index].preAddedSuggestedSpace) : 0);
            const prevvalue = parseFloat(mvpProds[index].preAddedSuggestedSpace);
            var savedval = (mvpProds[index].preAddedSuggestedSpace && mvpProds[index].preAddedSuggestedSpace!=="" ?parseFloat(mvpProds[index].preAddedSuggestedSpace):0);

            //------------------------------------
            if(type==="min"){
                savedval = (savedval - 1);
            }
            else{
                savedval = (savedval + 1);
            }
            
            if(savedval>100){
                savedval = 100;
            }
            if(savedval<0){
                savedval=0;
            }

            // const totalBeforeChange =  this.getMvpPercentageTotal(mvpProds.concat(onTopProds));
            
            mvpProds[index].preAddedSuggestedSpace  = savedval;
            
            // plus
            if(type==="plus"){
                let mvpAndOntopList = mvpProds.concat(onTopProds);
                let totalperc = this.getMvpPercentageTotal(mvpAndOntopList);
                let decimalvalue = savedval - Math.floor(savedval);
                
                let diff = (100 - totalperc);
                // console.log(diff);
                if(diff > -1 && diff < 0){
                    let remainder = (1 + diff);
                    mvpProds[index].preAddedSuggestedSpace  = roundOffDecimal((prevvalue + remainder),2);
                } else if(diff === -1 && decimalvalue > 0){
                    let remainder = (1 - decimalvalue);
                    mvpProds[index].preAddedSuggestedSpace  = roundOffDecimal((prevvalue + remainder),2);
                }
            }

            // last old
            // if(type==="plus" && totalBeforeChange!==100){
            //     let mvpAndOntopList = mvpProds.concat(onTopProds);
            //     let totalperc = this.getMvpPercentageTotal(mvpAndOntopList);
            //     let remainderFromTotal = totalperc%100;
                
            //     //let diff = (100 - totalperc);
            //     // console.log(diff);
            //     if(remainderFromTotal<1 && remainderFromTotal!==0 && mvpProds[index].autoCalculatedPlus!==true){
            //         let remainder = (savedval-(totalperc%100)).toFixed(2);
            //         mvpProds[index].preAddedSuggestedSpace  = (remainder);
            //         mvpProds[index].autoCalculatedPlus = true;
            //     }
            //     else{
            //         mvpProds[index].autoCalculatedPlus = false;
            //     }
            // }

            // test plus
            // if(type==="plus"){
            //     let mvpAndOntopList = mvpProds.concat(onTopProds);
            //     let totalperc = this.getMvpPercentageTotal(mvpAndOntopList);
                
            //     let diff = (100 - totalperc);
            //     console.log(diff);
            //     if(diff >= -1 && diff < 0){
            //         // let remainder = (savedval+diff).toFixed(2);
            //         mvpProds[index].preAddedSuggestedSpace  = (prevvalue + diff);
            //         mvpProds[index].autoCalculatedMin = true;

            //     }
            //     else{
            //         mvpProds[index].autoCalculatedMin = false;
            //     }
            // }

            //minus
            if(type==="min"){
                let mvpAndOntopList = mvpProds.concat(onTopProds);
                let totalperc = this.getMvpPercentageTotal(mvpAndOntopList);
                let decimalvalue = savedval - Math.floor(savedval);
                
                let diff = (100 - totalperc);
                // console.log(diff,decimalvalue);
                if(diff < 1 && diff > 0){
                    let remainder = (1 - diff);
                    mvpProds[index].preAddedSuggestedSpace  = roundOffDecimal((prevvalue - remainder),2);

                } else if(diff === 1 && decimalvalue > 0){
                    mvpProds[index].preAddedSuggestedSpace  = roundOffDecimal((prevvalue - decimalvalue),2);
                }
            }

            // if(type==="min"){//old
            //     let mvpAndOntopList = mvpProds.concat(onTopProds);
            //     let totalperc = this.getMvpPercentageTotal(mvpAndOntopList);
            //     let remainderFromTotal =  ((totalperc+1) % 100);
                
            //     // let diff = (100 - (totalperc+1));
            //     // console.log((totalperc+1) , remainderFromTotal, diff);
                
            //     // let diffavl =false;
            //     // if((totalperc+1) === remainderFromTotal && Math.trunc(diff)===0){
            //     //     diffavl = true;
            //     // }
            //     // console.log(diffavl);

            //     if(((remainderFromTotal<1 && remainderFromTotal!==0))){//&& mvpProds[index].autoCalculatedMin!==true
            //         //console.log("HERE");
            //         let remainder = ((savedval+1)-(totalperc%99)).toFixed(2);
            //         mvpProds[index].preAddedSuggestedSpace  = (remainder);
            //         mvpProds[index].autoCalculatedMin = true;
            //     }
            //     else{
            //         mvpProds[index].autoCalculatedMin = false;
            //     }
            //     //console.log(remainderFromTotal);
            // }

            // if(type==="min"){//new
            //     let mvpAndOntopList = mvpProds.concat(onTopProds);
            //     let totalperc = this.getMvpPercentageTotal(mvpAndOntopList);
            //     let decimalvalue = savedval - Math.floor(savedval);

            //     let diff = (100 - totalperc);
                
            //     if(diff <= 1 && diff > 0 && decimalvalue > 0){
            //         // let remainder = (savedval+diff).toFixed(2);
            //         mvpProds[index].preAddedSuggestedSpace  = (prevvalue - decimalvalue);
            //         mvpProds[index].autoCalculatedMin = true;

            //     } else if(diff > 1 && diff < 2){
            //         // mvpProds[index].preAddedSuggestedSpace  = (mvpProds[index].preAddedSuggestedSpace + 1);
            //     }
            //     else{
            //         mvpProds[index].autoCalculatedMin = false;
            //     }
            // }

        
            var arraySet = {
                loadedMvpProds:mvpProds,
                loadedTopProds:onTopProds,
                loadedNewProducts:newProds,
                loadedNewTestingProds: this.props.loadedNewTestingProds
            }
            
            this.props.setMainProductArrays(arraySet);
            this.props.triggerProdSidebarChange(true);

            valueChangeTimer = setTimeout(() => {
                this.props.saveBrandProductSnapshot(null,null,null,true,false,false,false);
            }, 800);
        }
    }

    getMvpPercentageTotal = (mvpProds) =>{
        let total = 0;
        for (let i = 0; i < mvpProds.length; i++) {
            const perc = (mvpProds[i].preAddedSuggestedSpace && mvpProds[i].preAddedSuggestedSpace!=="" ? parseFloat(mvpProds[i].preAddedSuggestedSpace) : 0);
            total = total + perc;
        }
        return total.toFixed(2);
    }

    //ONTOP percentage changes
    handlePercentageOnFocusOnTop = () =>{
        let ontopProds = JSON.parse(JSON.stringify(this.props.loadedTopProds));
        this.setState({textChangelistOntop:ontopProds});
    }

    handlePerentageBlurOnTop = (e, pid) =>{
        var temontop = this.state.textChangelistOntop;
        var index = temontop.findIndex(x => x.productId === pid);
        if(index>-1){
            var oldval = (temontop[index].preAddedSuggestedSpace && temontop[index].preAddedSuggestedSpace!=="" ? parseFloat(temontop[index].preAddedSuggestedSpace) : 0);
            var newval = (e.target.value && e.target.value!=="" ? parseFloat(e.target.value) : 0);
            var isChanged = (oldval=== newval ? false : true);
            
            if(isChanged === true){
                this.props.AddHistory(temontop);
                this.props.saveBrandProductSnapshot(null,null,null,true,false,false,false);
            }
        }
    }

    handlePerentageChangeOnTop = (e,pid) =>{
        let mvpProds = JSON.parse(JSON.stringify(this.props.loadedMvpProds));
        var onTopProds = JSON.parse(JSON.stringify(this.props.loadedTopProds)) ;
        var newProds = JSON.parse(JSON.stringify(this.props.loadedNewProducts)) ;
        var index = onTopProds.findIndex(x => x.productId === pid);
       
        if(index > -1){
            // var savedval = JSON.parse(JSON.stringify(onTopProds[index].preAddedSuggestedSpace));
            var newval = (e.target.value <0 ? 0 :e.target.value);
           
            //var val = (newval>100 ? 100 : newval);
            
            if(newval>100){
                alertService.warn(this.props.t("PLS_ENTER_VALID_PERCENTAGE"));
            }
            else{
                onTopProds[index].preAddedSuggestedSpace  = newval;
            }
            
            // if(this.getMvpPercentageTotal(onTopProds)>100){
            //     //alertService.warn("Total is larger than 100");
            //     onTopProds[index].preAddedSuggestedSpace  = savedval;
            // }

            var arraySet = {
                loadedMvpProds:mvpProds,
                loadedTopProds:onTopProds,
                loadedNewProducts:newProds,
                loadedNewTestingProds: this.props.loadedNewTestingProds
            }
            
            this.props.setMainProductArrays(arraySet);
            this.props.triggerProdSidebarChange(true);
        }
    }

    handlePlusMinusOnTop = (pid,type) =>{//type min, plus
        if(valueChangeTimer){
            clearTimeout(valueChangeTimer);
        }

        let mvpProds = JSON.parse(JSON.stringify(this.props.loadedMvpProds));
        var onTopProds = JSON.parse(JSON.stringify(this.props.loadedTopProds)) ;
        var newProds = JSON.parse(JSON.stringify(this.props.loadedNewProducts)) ;
        var index = onTopProds.findIndex(x => x.productId === pid);
       
        if(index > -1){
            this.props.AddHistory(); //add old object to history
            //var savedval = (onTopProds[index].preAddedSuggestedSpace ? Math.trunc(onTopProds[index].preAddedSuggestedSpace) : 0);
            const prevvalue = parseFloat(onTopProds[index].preAddedSuggestedSpace);
            var savedval = (onTopProds[index].preAddedSuggestedSpace && onTopProds[index].preAddedSuggestedSpace!=="" ?parseFloat(onTopProds[index].preAddedSuggestedSpace):0);
            
            //-----------------------
            if(type==="min"){
                savedval = (savedval - 1);
            }
            else{
                savedval = (savedval + 1);
            }
            if(savedval>100){
                savedval = 100;
            }
            if(savedval<0){
                savedval=0;
            }

            //const totalBeforeChange =  this.getMvpPercentageTotal(mvpProds.concat(onTopProds));

            onTopProds[index].preAddedSuggestedSpace  = savedval;
            
            // plus
            if(type==="plus"){
                let mvpAndOntopList = mvpProds.concat(onTopProds);
                let totalperc = this.getMvpPercentageTotal(mvpAndOntopList);
                let decimalvalue = savedval - Math.floor(savedval);
                
                let diff = (100 - totalperc);
                // console.log(diff);
                if(diff > -1 && diff < 0){
                    let remainder = (1 + diff);
                    onTopProds[index].preAddedSuggestedSpace  = roundOffDecimal((prevvalue + remainder),2);
                } else if(diff === -1 && decimalvalue > 0){
                    let remainder = (1 - decimalvalue);
                    onTopProds[index].preAddedSuggestedSpace  = roundOffDecimal((prevvalue + remainder),2);
                }
            }
            
            
            // old plus
            // if(type==="plus" && totalBeforeChange!==100){
            //     let mvpAndOntopList = mvpProds.concat(onTopProds);
            //     let totalperc = this.getMvpPercentageTotal(mvpAndOntopList);
            //     let remainderFromTotal = totalperc%100;

            //     if(remainderFromTotal<1 && remainderFromTotal!==0 && onTopProds[index].autoCalculatedPlus!==true){
            //         let remainder = (savedval-(totalperc%100)).toFixed(2);
            //         onTopProds[index].preAddedSuggestedSpace  = (remainder);
            //         onTopProds[index].autoCalculatedPlus = true;
            //     }
            //     else{
            //         onTopProds[index].autoCalculatedPlus = false;
            //     }
            // }

            //minus
            if(type==="min"){
                let mvpAndOntopList = mvpProds.concat(onTopProds);
                let totalperc = this.getMvpPercentageTotal(mvpAndOntopList);
                let decimalvalue = savedval - Math.floor(savedval);

                let diff = (100 - totalperc);
                // console.log(diff,decimalvalue);
                if(diff < 1 && diff > 0){
                    let remainder = (1 - diff);
                    onTopProds[index].preAddedSuggestedSpace  = roundOffDecimal((prevvalue - remainder),2);

                } else if(diff === 1 && decimalvalue > 0){
                    onTopProds[index].preAddedSuggestedSpace  = roundOffDecimal((prevvalue - decimalvalue),2);
                }
            }


            //old minus
            // if(type==="min"){
            //     let mvpAndOntopList = mvpProds.concat(onTopProds);
            //     let totalperc = this.getMvpPercentageTotal(mvpAndOntopList);
            //     let remainderFromTotal =  totalperc%100;

            //     if(remainderFromTotal<1 && remainderFromTotal!==0){//
            //         let remainder = ((savedval+1)-(totalperc%99)).toFixed(2);
            //         onTopProds[index].preAddedSuggestedSpace  = (remainder);
            //         onTopProds[index].autoCalculatedMin = true;
            //     }
            //     else{
            //         onTopProds[index].autoCalculatedMin = false;
            //     }
                
            // }

            var arraySet = {
                loadedMvpProds:mvpProds,
                loadedTopProds:onTopProds,
                loadedNewProducts:newProds,
                loadedNewTestingProds: this.props.loadedNewTestingProds
            }
            
            this.props.setMainProductArrays(arraySet);
            this.props.triggerProdSidebarChange(true);

            valueChangeTimer = setTimeout(() => {
                this.props.saveBrandProductSnapshot(null,null,null,true,false,false,false);
            }, 800);
        }
    }

    // initAllocateProds = () =>{
    //     let mvpProds = JSON.parse(JSON.stringify(this.props.loadedMvpProds));
    //     mvpProds.forEach(function (element) {element.allocated_amt = 0;element.isSelected=false});
    //     this.setState({allocateProds:mvpProds});
    // }

    // changeAllocatedProdSelect = (i) =>{
    //     let prods = this.state.allocateProds;
    //     prods[i].isSelected = !prods[i].isSelected;
    //     console.log(prods[i])


    //     this.setState({allocateProds:prods});
    // }

    //handle save obj
    handleSaveProds = (isarchive) => {
        this.props.validateAndSaveProducts(isarchive);
        // let mvpprodlist = this.props.loadedMvpProds;
        // let topprodlist = this.props.loadedTopProds;
        // let newprodlist = this.props.loadedNewProducts;

        // let cdefSaveObj = this.props.defSaveObj;
        // let selcatobj = this.props.selectedCat;
        
        // let catrectid = (selcatobj.type === catRectEnums.default?selcatobj.category.category_id:-1);
        // let catmpid = selcatobj.id;
        // let iscatrulebased = (selcatobj.type === catRectEnums.rule);

        // let catruleobj = null;
        // if(iscatrulebased){
        //     catruleobj = {
        //         level: selcatobj.rule.level,
        //         id: getNameorIdorColorofBox(selcatobj, "num"),
        //     }
        // }

        // let selectedsubcat = this.props.selectedSubCat;
        // let subcatid = (selectedsubcat.type === catRectEnums.default?selectedsubcat.sub_category.subCategoryId:-1);
        // let isscatrulebased = (selectedsubcat.type === catRectEnums.rule);

        // let selectedbrand = this.props.selectedBrand;

        // let ruleobj = null;
        // if(isscatrulebased){
        //     ruleobj = {
        //         level: selectedsubcat.rule.level,
        //         id: getNameorIdorColorofBox(selectedsubcat, "num"),
        //     }
        // }

        // let totalpers = 0;
        // for (let i = 0; i < mvpprodlist.length; i++) {
        //     const mvpitem = mvpprodlist[i];
        //     mvpitem["isArchive"] = (isarchive && mvpitem.isArchive?mvpitem.isArchive:false);

        //     let itemper = (mvpitem.preAddedSuggestedSpace?parseFloat(mvpitem.preAddedSuggestedSpace):0)
        //     totalpers += itemper;
        // }

        // for (let i = 0; i < topprodlist.length; i++) {
        //     const ontopitem = topprodlist[i];
        //     ontopitem["isArchive"] = (isarchive && ontopitem.isArchive?ontopitem.isArchive:false);

        //     let itemper = (ontopitem.preAddedSuggestedSpace?parseFloat(ontopitem.preAddedSuggestedSpace):0)
        //     totalpers += itemper;
        // }
        
        // if(roundOffDecimal(totalpers,2) > 100 && isarchive!==true){
        //     alertService.error(this.props.t("cannot_change_morethan_100"));
        //     return false;
        // }

        // this.props.saveBrandProductSnapshot(mvpprodlist,topprodlist,newprodlist,false,false,!isarchive,isarchive);
        // let saveObj = {
        //     mpId:cdefSaveObj.mp_id,
        //     departmentId: (cdefSaveObj?cdefSaveObj.department.department_id:-1),
        //     mpCategoryBoxId: catmpid,
        //     mpCatHasSubCatId:(selectedsubcat.mpHasCatHasSubCatid ? selectedsubcat.mpHasCatHasSubCatid : -1),
        //     categoryId: catrectid,
        //     isCatRuleBased: iscatrulebased,
        //     catRuleObj: (catruleobj?catruleobj:{}),
        //     subcategoryId: subcatid,
        //     isSubCatRuleBased: (ruleobj?true:false),
        //     subCatRuleObj: (ruleobj?ruleobj:{}),
        //     brandId: (selectedbrand?selectedbrand:-1),
        //     isHasSnap:(isarchive===true ? this.props.isHasSnap : true),

        //     mvpProducts: mvpprodlist,
        //     onTopProducts: topprodlist,
        //     newProducts:(newprodlist?newprodlist:[]),
        // }

        // //console.log(saveObj);
        // this.setState({isdataloading:true}, () => {
        //     submitSets(submitCollection.saveMpProductChanges, saveObj).then(res => {
        //         //console.log(res.extra);
        //         this.setState({isdataloading:false});
        //         if(res && res.status===true){
        //             alertService.success(this.props.t("BRAND_PRODS_UPDATED"));
        //             this.props.loadSidebarProductList();
        //         } else{
        //             alertService.error((res&&res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
        //         }
        //     });
        // });
    }

    //handle toggle product is archive
    handleChangeArchive = (ptype, pidx, pitem) => {
        let allArchiveItems = this.state.allArchiveItems;
        let mvpProds = JSON.parse(JSON.stringify(this.props.loadedMvpProds));
        var onTopProds = JSON.parse(JSON.stringify(this.props.loadedTopProds)) ;
        var newProds = JSON.parse(JSON.stringify(this.props.loadedNewProducts)) ;

        let changevalue = false;
        if(ptype === "mvp"){
            mvpProds[pidx]["isArchive"] = (mvpProds[pidx].isArchive !== undefined?!mvpProds[pidx].isArchive:true);
            changevalue = mvpProds[pidx].isArchive;
        } else if(ptype === "new"){
            newProds[pidx]["isArchive"] = (newProds[pidx].isArchive !== undefined?!newProds[pidx].isArchive:true);
            changevalue = newProds[pidx].isArchive;
        } else{
            onTopProds[pidx]["isArchive"] = (onTopProds[pidx].isArchive !== undefined?!onTopProds[pidx].isArchive:true);
            changevalue = onTopProds[pidx].isArchive;
        }
        
        if(changevalue){
            allArchiveItems.push(pitem);
        } else{
            let findIdx = allArchiveItems.findIndex(x => x.productId === pitem.productId);

            if(findIdx > -1){
                allArchiveItems.splice(findIdx,1);
            }
        }
        
        this.setState({ allArchiveItems: allArchiveItems }, () => {
            var arraySet = {
                loadedMvpProds:mvpProds,
                loadedTopProds:onTopProds,
                loadedNewProducts:newProds,
                loadedNewTestingProds: this.props.loadedNewTestingProds
            }
            
            this.props.setMainProductArrays(arraySet);
        });
    }
    //handle archive all selected items
    handleArhiveAll = () => {
        let archiveitems = this.state.allArchiveItems;
        
        if(archiveitems && archiveitems.length > 0){
            confirmAlert({
                title: this.props.t('ARCHIVE_SELECTED_PRODS'),
                message: (this.props.isHasSnap===true?this.props.t("SNAPSHOT_AFFECT_MSG"):"")+(this.props.t('ARE_YOU_SURE_TO_ARCHIVE')),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        this.handleSaveProds(true);
                    }
                }, {
                    label: this.props.t('btnnames.no')
                }]
            });
        } else{
            alertService.error(this.props.t("NO_ARCHIVE_ITEMS"));
        }
    }
    //handle update last added new product recommanded percentage
    updateNewProdRec = (lastidx, lastitem) => {
        // console.log(lastidx);
    }

    setSelectedProduct = (product,index) =>{
        //console.log(product);
        this.setState({selectedProductDrag:product, selectedProductIDDrag:index});
    }

    closeSidebar =()=>{
        if(this.props.hasUnsavedProductsSidebarChanges===true){
            confirmAlert({
                title: this.props.t('UNSAVE_CHANGES'),
                message: (this.props.t('YOU_HAVE_UNSAVED_CHANGES_SURE_TO_LEAVE')),
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        this.props.triggerProdSidebarChange(false);
                        this.props.toggleSidebar(false);
                    }
                }, {
                    label: this.props.t('btnnames.no')
                }]
            });
        }
        else{
            this.props.toggleSidebar(false);
        }
    }

    getContainer = () => {//getContainer={this.getContainer}
        return document.getElementById("product-types-list");
    };

    render(){
        
        // if(document.querySelector("#mvp-sortable")){
        //     var mvpmain =  document.querySelector("#mvp-sortable");
        //     var mvpmainrow = mvpmain.querySelector('.row');
        //     if(mvpmainrow){
        //         if(this.props.isRTL==="rtl"){
        //             mvpmainrow.classList.add("justify-content-end");
        //         } else{
        //             mvpmainrow.classList.remove("justify-content-end");
        //         }
        //     }
        // }

        // //
        // if(document.querySelector("#ontop-sortable")){
        //     var ontopmain =  document.querySelector("#ontop-sortable");
        //     var ontopmainrow = ontopmain.querySelector('.row');
        //     if(ontopmainrow){
        //         if(this.props.isRTL==="rtl"){
        //             ontopmainrow.classList.add("justify-content-end");
        //         } else{
        //             ontopmainrow.classList.remove("justify-content-end");
        //         }
        //     }
        // }
        
        
        var loadedMvpProds = (this.props.loadedMvpProds ? (this.props.isRTL==="rtl" ? this.props.loadedMvpProds: this.props.loadedMvpProds) :[]);
        var loadedTopProds = (this.props.loadedTopProds ? (this.props.isRTL==="rtl" ? this.props.loadedTopProds: this.props.loadedTopProds) :[]);

        var unlocatedPercentage = 0; var totalpers = 0;
        var totalMvpNadOntopProds = loadedMvpProds.concat(loadedTopProds);

        totalMvpNadOntopProds.map((obj)=>{
            var per = (obj.preAddedSuggestedSpace?parseFloat(obj.preAddedSuggestedSpace):0)
            totalpers += per;
            return totalpers;
        })
        unlocatedPercentage = (100 - totalpers).toFixed(2);

        return(
            <Col xs={12} className={"product-sidebar "+(this.props.isAUIDisabled === true?"aui-readonly ":"")+(this.props.showFullSidebar?"full-sidebar ":"")+(this.props.isRTL==="rtl"?"RTL":"LTR")+ " "+(this.props.showSidebar===true ?" active ":" deactive ")}>
                <Col xs={12} className="product-sidebar-sub">
                    <Button className='prod-side-toggle' onClick={()=> this.props.toggleFullSidebar()}>{this.props.showFullSidebar? <DashIcon size={25}/> : <PlusIcon size={25}/>}</Button>
                    <Col className='heading-section'>
                        <h3>
                            {this.props.t("products")}
                            <div className='header-btns'>
                                <Button size={"sm"} onClick={() => this.closeSidebar()} className="d-inline close">{this.props.t("btnnames.close")}</Button>
                                <Button size={"sm"} className="d-inline reset" onClick={() => this.props.productUndoChanges(true)} disabled={((this.props.historyList && this.props.historyList.length>0) || this.props.isHasSnap===true?false:true)} >{this.props.t("btnnames.reset")}</Button>
                                <Button size={"sm"} onClick={() => this.handleSaveProds()} className="d-inline save">{this.props.t("btnnames.save")}</Button>
                            </div>
                        </h3>
                    </Col>
                    <Col xs={12} className="body-section">
                        <Col xs={12} className={"brand-tabs "+(this.props.isProductsLoaded===false?" disabled":"")}>
                            <Row className='brand-tab-row'>
                                <Col xs={10}  className="brand-tab-col">
                                    {(this.props.loadedSidebarBrands && this.props.loadedSidebarBrands.length > 0)?
                                        this.props.loadedSidebarBrands.map((brand,i)=>{
                                            return(<React.Fragment key={i}>
                                                {/*  */}
                                                <Col onClick={()=>this.props.changeSidebarBrand(brand)} className={'d-inline brand-tab-item '+(this.props.selectedBrand === brand.brandId?" active":"")}>
                                                    {/* brand.newProdCount */}
                                                    {/* {this.props.loadedNewProducts.length > 0 && this.props.selectedBrand === brand.brandId?<label className='count-label'>{this.props.loadedNewProducts.length}</label>:<></>} */}
                                                    {brand.newProdCount > 0?<label className='count-label'>{brand.newProdCount}</label>:<></>}
                                                    <span>{brand.brandName}</span>
                                                </Col>
                                            </React.Fragment>)
                                        })
                                    :<></>}
                                </Col>
                                <Col className="bothbtn" xs={2} style={{textAlign:(this.props.isRTL==="rtl"?"left":"right"), padding:"0"}}>
                                    <span className='d-inline' onClick={() => this.props.productUndoChanges()}><ReplyIcon className={(this.props.historyList && this.props.historyList.length > 0?"":"deactivated")} size={18}  /> </span>   
                                    <span className='d-inline archive-link' onClick={() => this.handleArhiveAll()}><TrashIcon size={18}/> </span>
                                </Col>    

                            </Row>
                        </Col>

                        {
                            this.props.isProductsLoaded===false ?
                                <Col xs={12} style={{textAlign:"center",paddingTop:"30%"}}><img className='loader-gif' src={loader} alt="loader"/></Col>
                            :
                            <Col xs={12} className="product-types-list" id="product-types-list">
                                
                                <Col xs={12} className={"prodtype-section "+(this.props.loadedNewProducts.length>0 ? "" : " ")}>
                                    <h5 onClick={()=>this.setProdListView("new")}>{this.props.t("NEW")} <ChevronDownIcon /></h5>
                                    
                                    <Collapse in={this.state.prodlistViewTypes.new}><div>
                                        <h6 className='prodsidebar-subheader'>{this.props.t("NEWTESTINGPRODS")}</h6>

                                        <Col className='prodsview-list newprod-section'>
                                            <Row>
                                                <Col xs={12} className={"no-prods-msg "+(this.props.loadedNewTestingProds && this.props.loadedNewTestingProds.length > 0? "d-none" : " ")}>{this.props.t("NO_PRODUCTS_AVAILABLE")}</Col>

                                                <Col xs={12} style={{ direction: this.props.isRTL, padding:"0px 10px" }}>
                                                    <Row>
                                                    {this.props.loadedNewTestingProds.map((xitem, xidx) => {
                                                        return(<div className='prodview-col' key={xidx}>
                                                            <Col className={'proddet-view new-prod-item '+(this.props.isRTL==="rtl"?"RTL":"LTR")}>
                                                                <div className="image-view" onClick={()=>this.handleImagePreviewModal(xitem,true)}>
                                                                    <img src={xitem.imgUrl} className='img-resize-ver' alt="" onDragStart={(e)=>e.preventDefault() } />
                                                                </div>
                                                                <div className="prod-details" onClick={()=>this.getProductData(xitem)}>
                                                                    <label className="prod-txt">
                                                                        <TooltipWrapper text={xitem.barcode}><small>{xitem.barcode}</small></TooltipWrapper>
                                                                        {(xitem.productName.substring(0,30)+(xitem.productName.length > 30?"..":""))}
                                                                    </label>
                                                                </div>
                                                                <div className='bottom-values' onClick={()=>this.getProductData(xitem)}>
                                                                    
                                                                    <Col xs={12}><label>{xitem.suggestedSpace}%</label><span>SPF</span></Col>
                                                                </div>
                                                            </Col>
                                                        </div>);
                                                    })}
                                                    </Row>
                                                </Col>
                                            </Row>
                                        </Col>
                                        
                                        <h6 className='prodsidebar-subheader'>{this.props.t("NEWPENDINGPRODS")}</h6>
                                        <Col className='prodsview-list newprod-section'>
                                            <Row>
                                                <Col xs={12} className={"no-prods-msg "+(this.props.loadedNewProducts.length>0 ? "d-none" : " ")}>{this.props.t("NO_PRODUCTS_AVAILABLE")}</Col>
                                                
                                                <Col xs={12} style={{ direction: this.props.isRTL, padding:"0px 10px" }}>
                                                    <NewSortableContainer rtl={(this.props.isRTL==="rtl"?true:false)} onSortEnd={this.onSortEndNew} useDragHandle={true} axis="xy" hideSortableGhost={true} lockToContainerEdges={true} getContainer={this.getContainer} onSortStart={this.sortEvent} onSortOver={this.sortEvent} onSortMove={this.onSortMoveNew} distance={10}>
                                                        {this.props.loadedNewProducts.map((xitem, xidx) => {
                                                            return(
                                                                <NewSortableItem key={xidx} index={xidx} rownumber={xidx} product={xitem} trans={this.props.t} handleChangeArchive={this.handleChangeArchive} showFullSidebar={this.props.showFullSidebar} showFullSidebarSizeChange={this.props.showFullSidebarSizeChange} isrtl={this.props.isRTL} handleImagePreviewModal={this.handleImagePreviewModal} getProductData={this.getProductData}  setSelectedProduct={this.setSelectedProduct}/>
                                                            )
                                                        })}
                                                        
                                                    </NewSortableContainer> 

                                                </Col>
                                                
                                                {/* {this.props.loadedNewProducts.map((xitem, xidx) => {
                                                    return(
                                                        <div className='prodview-col'  key={xidx} >
                                                            <Col className={'proddet-view new-prod-item ' +(this.props.isRTL==="rtl"?"RTL":"LTR")} data-type={"new"} data-index={xidx} data-obj={JSON.stringify(xitem)} draggable="true" onDragStart={(event)=>this.dragStart(event)} onDragEnd={(event)=>this.dragEnd(event)}>
                                                                
                                                                
                                                                <div className="prd-draghandler"><FeatherIcon icon="move" size={14}/></div>
                                                                <div className="image-view" onClick={()=>this.handleImagePreviewModal(xitem,true)}>
                                                                    {xitem.isMandatory?<label className='man-label'>M</label>:<></>}
                                                                    <img src={xitem.imgUrl} alt="" onDragStart={(e)=>e.preventDefault() } />
                                                                </div>
                                                                <div className="prod-details" onClick={()=>this.getProductData(xitem)}>
                                                                    <label className="prod-txt">
                                                                        <small>{xitem.barcode}</small>
                                                                        {(xitem.productName.substring(0,30)+(xitem.productName.length > 30?"..":""))}
                                                                    </label>
                                                                </div>
                                                                <div className='bottom-values' onClick={()=>this.getProductData(xitem)}>
                                                                    
                                                                    <Col xs={12}><label>{xitem.suggestedSpace}%</label><span>SPF</span></Col>
                                                                </div>
                                                            </Col>
                                                        </div>
                                                    )
                                                })} */}
                                            </Row>    
                                        </Col>
                                    </div>
                                    </Collapse>
                                </Col>

                                {loadedMvpProds.length > 0 || loadedTopProds.length > 0?<><div className={'unallocated-txt'}>
                                    {unlocatedPercentage !== "0.00" &&  unlocatedPercentage !== "-0.00"?
                                        <label style={{background:((unlocatedPercentage>0 && unlocatedPercentage<100) ? "#F1C40F" : unlocatedPercentage==="0.00" ?"#2ECC71" : "#EC7063" )}} className={(this.props.isRTL==="rtl"?"float-left":" float-right")}>
                                            {this.props.t("unallocated_space")} {unlocatedPercentage} %
                                        </label>
                                    :
                                        <FeatherIcon className={(this.props.isRTL==="rtl"?"float-left":" float-right")}  icon="check-circle"/>
                                    }
                                </div></>
                                :<></>}

                                <Col xs={12} className="prodtype-section " onDrop={(e)=>this.dropToMvp(e)} onDragEnter={(e)=>this.dragEnter(e)} onDragOver={(e)=>this.allowDrop(e)} onDragLeave={(e)=>this.dragLeave(e)}> 
                                    <h5 onClick={()=>this.setProdListView("mvp")}>{this.props.t("MVP")} <ChevronDownIcon /></h5>
                                    <Collapse id='mvp-sortable' in={this.state.prodlistViewTypes.mvp}>
                                        <Col xs={12} className={'prodsview-list mvp-section'+(loadedMvpProds.length > 0? "":" no-prods")}>
                                            <Col xs={12} className={"no-prods-msg "+(loadedMvpProds.length>0 ? "d-none" : " ")}>
                                                {this.props.t("NO_PRODUCTS_AVAILABLE")}<br/><small>{this.props.t("DROP_PROD_FROM_ONTOPNEW")}</small>
                                            </Col>

                                            <Col xs={12} style={{ direction: this.props.isRTL, padding:"0px" }}>
                                                <SortableContainer rtl={(this.props.isRTL==="rtl"?true:false)} onSortEnd={this.onSortEndMvp} useDragHandle={true} axis="xy" hideSortableGhost={true} lockToContainerEdges={true} getContainer={this.getContainer} onSortStart={this.sortEvent} onSortOver={this.sortEvent} onSortMove={this.onSortMoveMVP} distance={10}>
                                                    {loadedMvpProds.map((xitem, xidx) => {
                                                        return(
                                                            <SortableItem key={xidx} index={xidx} rownumber={xidx} product={xitem} trans={this.props.t} handleChangeArchive={this.handleChangeArchive} showFullSidebar={this.props.showFullSidebar} showFullSidebarSizeChange={this.props.showFullSidebarSizeChange} isrtl={this.props.isRTL} handleImagePreviewModal={this.handleImagePreviewModal} getProductData={this.getProductData} handlePerentageChange={this.handlePerentageChange} handlePerentageBlur={this.handlePerentageBlur} handlePercentageOnFocus={this.handlePercentageOnFocus} handlePlusMinus={this.handlePlusMinus} dragStart={this.dragStartToOnTop} dragEnd={this.dragEnd} setSelectedProduct={this.setSelectedProduct}/>
                                                        )
                                                    })}
                                                </SortableContainer> 
                                            </Col>

                                        </Col>
                                        
                                    </Collapse>
                                </Col>

                                <Col xs={12} className={"prodtype-section "+(this.props.loadedTopProds.length>0 ? "" : " ")} onDrop={(e)=>this.dropToOnTop(e)} onDragEnter={(e)=>this.dragEnter(e)} onDragOver={(e)=>this.allowDrop(e)} onDragLeave={(e)=>this.dragLeave(e)}>
                                    <h5 onClick={()=>this.setProdListView("ontop")}>{this.props.t("ON_TOP")} <ChevronDownIcon /></h5>
                                    <Collapse id='ontop-sortable' in={this.state.prodlistViewTypes.ontop}>
                                        <Col className={'prodsview-list ontop-section'+(this.props.loadedTopProds.length > 0? "":" no-prods")}>
                                            <Col xs={12} className={"no-prods-msg "+(this.props.loadedTopProds.length>0 ? "d-none" : " ")}>
                                                {this.props.t("NO_PRODUCTS_AVAILABLE")}<br/><small>{this.props.t("DROP_PROD_FROM_MVPNEW")}</small>
                                            </Col>                              
                                            
                                            <Col xs={12} style={{ direction: this.props.isRTL, padding:"0px" }}>
                                                <OnTopSortableContainer rtl={(this.props.isRTL==="rtl"?true:false)} onSortEnd={this.onSortEndOnTop} useDragHandle={true} axis="xy" hideSortableGhost={true} lockToContainerEdges={true} getContainer={this.getContainer} onSortStart={this.sortEvent} onSortOver={this.sortEvent} onSortMove={this.onSortMoveOntop} distance={10}>
                                                    {loadedTopProds.map((xitem, xidx) => {
                                                        return(
                                                            <OnTopSortableItem key={xidx} index={xidx} rownumber={xidx} product={xitem} trans={this.props.t} handleChangeArchive={this.handleChangeArchive} showFullSidebar={this.props.showFullSidebar} showFullSidebarSizeChange={this.props.showFullSidebarSizeChange} isrtl={this.props.isRTL} handleImagePreviewModal={this.handleImagePreviewModal} getProductData={this.getProductData} handlePerentageChange={this.handlePerentageChangeOnTop} handlePerentageBlur={this.handlePerentageBlurOnTop} handlePercentageOnFocus={this.handlePercentageOnFocusOnTop} handlePlusMinus={this.handlePlusMinusOnTop} dragStart={this.dragStart} dragEnd={this.dragEnd} setSelectedProduct={this.setSelectedProduct}/>
                                                        )
                                                    })}
                                                    
                                                </OnTopSortableContainer>
                                            </Col>

                                            
                                        </Col>

                                    </Collapse>
                                </Col>
                            
                            </Col>
                        }
                    </Col>
                </Col>

                {this.state.selectedProduct && this.state.isShowPreviewModal===true?
                    <ProductPreview 
                        isRTL={this.props.isRTL} 
                        isshow={this.state.isShowPreviewModal}
                        isAUIDisabled={this.props.isAUIDisabled}
                        showFullSidebar={this.props.showFullSidebar}
                        handleSaveProduct={this.handleSaveProduct} 
                        selectedProduct={this.state.selectedProduct} 
                        tagslist={this.state.tagslist} 
                        toggleProductEditModal={this.toggleProductEditModal} 
                        loadedTagsList={this.props.loadedTagsList}
                        handleImagePreviewModal={this.handleImagePreviewModal}
                    />
                    :<></>
                }

                {this.state.showPreviewImageModal===true ? 
                    <PreviewImage 
                        productid={this.state.productId ? this.state.productId : null} 
                        loadfromback={true} 
                        imgurl={""} 
                        isshow={this.state.showPreviewImageModal} 
                        isRTL={this.props.isRTL} 
                        handlePreviewModal={this.handleImagePreviewModal}
                        hideheaderlables={false}
                        />
                    :<></>
                }

                <AcViewModal showmodal={this.state.isdataloading} />
            </Col>
        )
    }
}

export default withTranslation()(withRouter(connect(null)(ProductsSidebar)));

