import React, { PureComponent } from 'react'
import { Button, Col, Row } from 'react-bootstrap';
import { withTranslation } from 'react-i18next'
import {  withRouter } from 'react-router-dom';
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react';
import PrismaZoom from 'react-prismazoom';
import FeatherIcon from 'feather-icons-react';
import {AUICheckboxIcons} from "../../../../../../assets/icons/icons"
import { CalculateRatio, floorAspectRatioDrawBox, measureConverter } from '../../../../../../_services/common.service';
import { submitCollection } from '../../../../../../_services/submit.service';
import { submitSets } from '../../../../../UiComponents/SubmitSets';
// import { autoimsamplelayputpos } from './pushbranchsample';
import { TooltipWrapper } from "../../../../AddMethods"
import { PushBranchGetboxNamefromDealer } from '../../../../MPSimulationCommenMethods';
import { AcViewModal } from '../../../../../UiComponents/AcImports';

import './pushBranchView.css'
import { confirmAlert } from 'react-confirm-alert';
import AllSimulationModal from '../../../AllSimulationModal/AllSimulationModal';
// import { alertService } from '../../../../../../_services/alert.service';
import { SimulationTypesFE } from '../../../../../../enums/masterPlanogramEnums';


class PushBranchView extends PureComponent {
    constructor(props) {
        super(props)
        this.displaydivmap = React.createRef();
        this.catboxdiv = React.createRef();
        this.drawSVG = React.createRef(); //svg draw
        this.svgZoomCreatePoint = null;
        this.storeAssignCatDiv = React.createRef();

        this.state = {
            sliderItems:[],
            sliderIndex:0,
            singleitemwidth: 45, slideritems: 12,
            slideritemwidth: 540, 
            BrshowcategoryList:[],
            divWidthfloor:  0,
            divHeightfloor:0,

            DrawUOM: "",
            viewHeight: 0, viewWidth: 0,
            imageurl: "",
            drawratio: 1,
            departmentColor:"",
            floormaprects:[],
            floorDrawmaprects:[],
            dragstartIsleIdx:-1,
            onTopHasTagsIndexes:[],
            usedcatsinopen:[],
            isloading:false,
           
            mpId:this.props.mpId,
            storeId: null, storeName: "",
            aisleAllocationId:null,
            isNextButton:false,

            zoomEnabled: false, zoomStrenth: 0, zoomRate: 1,

            //pargination
            maxResultStoreslist : null,
            switchStoreList:[],
            totalPages:null,
            currentPage:1,
            storesList:[],
            startpage: 1, totalresults: 0,


            //simulatoin
            isallsimulatemodal:false,
            defSaveObj: this.getDefSaveObj(),
            openOneCategory:false,
            Iscompleted:false,
           //departclick
            clickedDepobj:null,
            catList:[],
            zoomReset: true,

            //sim preview store obj
            isleSimObj: null,
        }
    }
    
    componentDidMount(){
    
        this._isMounted = true;
        if(this._isMounted){
            // console.log(this.catboxdiv.current ? (this.catboxdiv.current.offsetWidth-50) : 0);
            this.initSVGCreatePoint();
            let count =Math.floor(this.storeAssignCatDiv.current.offsetWidth/150)
            this.setState({
                maxResultStoreslist : count
            },()=>{
                if(this.props.implemAisleStores && this.props.implemAisleStores.length > 0){
                    this.loadswitchStoreList();
                    // this.setState({
                    //     storesList:this.props.implemAisleStores
                    // },()=>{
                    //     this.parginateStore()
                    // })
                } else{
                    this.loadswitchStoreList();
                }
            })            
        }
    }

    parginateStore=()=>{
        let data = this.state.storesList;
        let stores = data.slice(0, this.state.maxResultStoreslist);
        let totalPages = Math.ceil(data.length / this.state.maxResultStoreslist);
        // console.log(stores[0]);
        
        this.setState({
            switchStoreList : stores,
            totalPages : totalPages,
            storeId: stores[0].storeId,
            storeName: stores[0].storeName,
            isNextButton:data.length > 1 ?true : false
        },()=>{
            this.getPushBranchdetails();
        });
    }

     handleNextPage = () => {
        if (this.state.currentPage < this.state.totalPages) {
            this.setState(preState=>{
                return {currentPage :(preState.currentPage+1)}
            },()=>{
               this.updatePageData(this.state.currentPage)
            })
        }
      }

    handlePrevPage = () => {
        if (this.state.currentPage > 1) {
            this.setState(preState=>{
                return {currentPage :(preState.currentPage-1)}
            },()=>{
               this.updatePageData(this.state.currentPage)
            })
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentPage !== this.state.currentPage) {
           this.updatePageData(this.state.currentPage)
        }

        if(prevProps.storeId !== this.state.storeId){
            // this.setState({
            //     zoomReset:false
            // },()=>{
            //     this.setState({
            //         zoomReset:true
            //     })
            // })
        }
    }

    updatePageData = (pageNumber) => {
        let data = this.state.storesList
        const startIndex = (pageNumber - 1) * this.state.maxResultStoreslist;
        const endIndex = startIndex + this.state.maxResultStoreslist;
       let  store = data.slice(startIndex, endIndex);
       this.setState({
        switchStoreList:store
       })
      }
    componentWillUnmount(){
        this._isMounted = false;
    }
    //default save object
    getDefSaveObj = () => {
        let cmasterPlanogram=this.props.defSaveObj.masterPlanogram
        let cdepartment=this.props.defSaveObj.department
        return { mp_id: this.props.mpId, is_new: true, is_delete: false, department: cdepartment, categories: [],masterPlanogram:cmasterPlanogram };
    }
    //get store list
    loadswitchStoreList = () =>{
        let sobj ={mpId:this.state.mpId,isReqPagination:false, startIndex:0, maxResult:this.state.maxResultStoreslist, isReqCount:false,isAisleMoreThanOneOnly:true}
        this.setState({
            isloading: true
        },()=>{
            submitSets(submitCollection.loadImplementingStores,sobj, true).then(res => {
                if (res && res.status){
                    let stores = res.extra.filter((d)=>{return d.aisleCount > 1});
                    
                    if(stores.length >= 1){
                        for (let i = 0; i < stores.length; i++) {
                            const storeobj = stores[i];
                            
                            for (let j = 0; j < this.props.dataObj.length; j++) {
                              const fieldObj = this.props.dataObj[j];
                              
                              for (let l = 0; l < fieldObj.storesGroupByTags.length; l++) {
                                const tagObj = fieldObj.storesGroupByTags[l];
                                
                                let isFoundStore = tagObj.disconnectedStores.find(x => x.id === storeobj.storeId);
                                if(isFoundStore){
                                  storeobj["fieldCount"] = fieldObj.fieldCount;
                                  storeobj["tagList"] = tagObj.tags;
                                }
                                
                                let isConFoundStore = tagObj.connectedStores.find(x => x.id === storeobj.storeId);
                                if(isConFoundStore){
                                  storeobj["fieldCount"] = fieldObj.fieldCount;
                                  storeobj["tagList"] = tagObj.tags;
                                }
                              }
                            }
                    
                        }

                        this.setState({
                            storesList:stores
                        },()=>{
                            this.parginateStore()
                        })    
                    }else{
                        this.setState({
                            isloading : false
                        })
                    }
                  
                        //   this.setState({
                        //     switchStoreList:res.extra,
                        // },()=>{
                        //     this.setState({
                        //         storeId:this.state.switchStoreList[0].storeId
                        //     },()=>{
                        //         this.getPushBranchdetails();
                        //     })
                       
                        // })

                    // if(stores.length >= 1){
                    //     this.setState({
                    //         switchStoreList:stores,
                    //     },()=>{
                    //         this.setState({
                    //             storeId:this.state.switchStoreList[0].storeId
                    //         },()=>{
                    //             this.getPushBranchdetails();
                    //         })
                       
                    //     })
                    // }else{
                    //     this.setState({
                    //         isloading : false
                    //     })
                    // }
                   
                }
            })
        })
     
    }
    //store tab change
    storeTabChange = (storeId, storeName) =>{
        const index = this.state.switchStoreList.findIndex(store => store.storeId === storeId);
        const isNextButton = (this.state.switchStoreList.length -1) === (index)?false:true; 

        this.setState({
            storeId: storeId, 
            storeName: storeName,
            isNextButton:isNextButton
        },()=>{
            this.getPushBranchdetails()
        })
    }

    //get floor map details call
    getPushBranchdetails=()=>{
        this.setState({
            divWidthfloor: this.displaydivmap.current ? (this.displaydivmap.current.offsetWidth-50) : 0,
            divHeightfloor: this.displaydivmap.current ? (this.displaydivmap.current.offsetHeight-130) : 0,
            isloading:true
        },()=>{
            let  sobj = { mpId: this.state.mpId, storeId: (this.state.storeId?this.state.storeId:this.state.switchStoreList[0].storeId) };
            submitSets(submitCollection.loadCurrentActiveFloorLayoutWithPositions,sobj, true).then(res => {
                var drawobj;
                if (res && res.status) {
                     drawobj = res.extra;
                     this.setState({
                        aisleAllocationId:res.extra.aisleAllocationId,
                        clickedDepobj:{
                            color: drawobj.departmentColor,
                            id:drawobj.departmentId,
                            name:drawobj.departmentName,
                        }
                     })
                    // console.log(res)
                    // drawobj=autoimsamplelayputpos
    
                    
                    // this.loadIsleDetails(drawobj)
                    // this.setState({},()=>{
                        this.loadLayoutDetails(drawobj);
                    // })
                }else{
                    this.setState({isloading:false})
                }
            })
        })
    }
    //load isle drop zone from backcall
    // loadIsleDetails=(drawobj)=>{
    //     var aisleArray=[]
    //     console.log(drawobj); 
    //     var aisleList=drawobj.aisles
    //     var catList=drawobj.categories
    //     aisleList.forEach(aisle => {
    //         var catarray=[]
    //         catList.forEach(cat => {
    //             if(cat.aisleAllocationSlotId===aisle.aisleAllocationSlotId){
    //                 catarray.push(
    //                     {}
    //                 )
    //             }
    //         });
    //     });
    // }
    loadLayoutDetails = (drawobj) => {
        //console.log(drawobj);
        if (drawobj) {
            // var fobj = drawobj.floor;
            var reopenplanos = drawobj.aisles;
            var reopenplanosDrawing=drawobj.drawbleAisles ?drawobj.drawbleAisles:[]
            this.setState({  DrawUOM: drawobj.uom }, () => {
                let sum = 0 ; 
                for (const reopenplanosData of reopenplanos) {
                    sum +=reopenplanosData.assignedCategories.length
                }

                let index =this.state.switchStoreList.findIndex((store)=> {return store.storeId === this.state.storeId})
                let StoresList =  this.state.switchStoreList
                StoresList[index].assignedCategoryCount = sum

                this.setState({
                    switchStoreList :StoresList
                },()=>{
                    let completed = true ;
                    for (const store of this.state.switchStoreList) {
                        if(store.assignedCategoryCount !== store.categoryCount){
                            completed = false;
                            break;
                        }
                    }
                    this.setState({
                        Iscompleted:completed
                    },()=>{
                        this.setState({ 
                        }, () => {
                           var dimention = {};
                           dimention = floorAspectRatioDrawBox(drawobj.floorWidth, drawobj.floorHeight, this.state.divWidthfloor, this.state.divHeightfloor);
                           var ratio = CalculateRatio(drawobj.floorWidth, dimention.dwidth)
    
                           this.setState({ viewHeight: dimention.dheight, viewWidth: dimention.dwidth, imageurl: drawobj.imageUrl, drawratio: ratio,departmentColor:drawobj.departmentColor }, () => {
    
                               var newupdate = this.reconverttoopn(reopenplanosDrawing);//this.reconverttoopn(reopenplanos)

                             for (const aisle of drawobj.aisles) {
                                for (const category of aisle.assignedCategories) {
                                    newupdate.usedcatids.push(category.mpHasCatId)
                                }
                             }
                               for (let h = 0; h < drawobj.categories.length; h++) {
                                   const cat =  drawobj.categories[h];
                                   var alreadyhave=newupdate.usedcatids.find(x=>x===cat.mpHasCatId)
                                   if(alreadyhave){
                                       cat.isDisable=true
                                   }
                                   for (let i = 0; i < newupdate.newRects.length; i++) {
                                    const element = newupdate.newRects[i];
                                    var minX=0
                                    // var Y=0
                                    var showidx=0
                                    if(element.aisleNo!==null){
                                       var isfirst=true
                                        for (let l = 0; l < element.fields.length; l++) {
                                            
                                            const field = element.fields[l];
                                            if(field.department.id===drawobj.departmentId){
                                                if(isfirst){
                                                    minX=(field.x)
                                                    isfirst=false
                                                    showidx=l
                                                }else{
                                                    field["isShowNo"]=minX>field.x?true:false
                                                    showidx=minX>field.x?l:showidx
                                                    minX=(minX>field.x)?field.x:minX
                                                   
                                                    
                                                }

                                            }
                                            
                                           
                                        }
                                        element["NoFieldshowidx"]=showidx
                                    }
                                   }
                               }
                               this.setState({  floormaprects: reopenplanos,floorDrawmaprects:newupdate.newRects,BrshowcategoryList:drawobj.categories,isloading:false },()=>{
                                this.setState({
                                    zoomReset:false
                                },()=>{
                                    this.setState({
                                        zoomReset:true
                                    })
                                })
                               });
                           });
                       });
                    })
                })

                   
            });
        }
    }
    //init svg create point
    initSVGCreatePoint = () => {
        if(this.drawSVG && this.drawSVG.createSVGPoint){
            this.svgZoomCreatePoint = this.drawSVG.createSVGPoint();
        }
    }
    //
    reconverttoopn = (rectset) => {
        // console.log(this.state.DrawUOM);
        var usedcatisd=[]
        var newRects = JSON.parse(JSON.stringify(rectset))
        // console.log(rectset);
        for (let i = 0; i < newRects.length; i++) {
            var element = newRects[i];

            for (let index = 0; index < element.fields.length; index++) {
                var element2 = element.fields[index];
                // element2.width = (element2.width * this.state.drawratio);
                // element2.height = (element2.height * this.state.drawratio);
                //console.log(element2.masterFieldUom, this.state.DrawUOM,element2.masterFieldDepth);
                const currentmsteruom = (element2.masterFieldUom && element2.masterFieldUom !== "none" ? element2.masterFieldUom : element2.uom);
                element2.drawDepth = measureConverter(currentmsteruom, this.state.DrawUOM, element2.depth) * this.state.drawratio;
                element2.drawWidth = measureConverter(currentmsteruom, this.state.DrawUOM, element2.width) * this.state.drawratio; 
                element2.x = (element2.x * this.state.drawratio);
                element2.y = (element2.y * this.state.drawratio);

                element.fields[index] = element2
            }
            // if(element.assignedCategories){
            //     for (let i = 0; i < element.assignedCategories.length; i++) {
            //         var islecat=element.assignedCategories[i]
            //         // if(usedcatisd.length>0){
            //         //     var alreadyhave=usedcatisd.find(x=>x.id===islecat.id)
            //         //     if(!alreadyhave){
            //         //         usedcatisd.push(islecat.id)
            //         //     }
            //         // }else{
            //             usedcatisd.push(islecat.mpHasCatId)
            //         // }
            //     }
            // }
            newRects[i] = element
        }
        // this.setState({usedcatsinopen:usedcatisd},()=>{
        //     console.log(this.state.usedcatsinopen);
        // })
        return {newRects:newRects,usedcatids:usedcatisd};


    }
    setSliderIndex = (isadd) => {
        let curindex = this.state.sliderIndex;
        if(isadd && (curindex + 1) === this.state.sliderLength){
            curindex = 0;
        } else if(isadd){
            curindex = (curindex + 1);
        } else if(curindex > 0){
            curindex = (curindex - 1);
        }

        this.setState({ sliderIndex: curindex });
    }
    
    setSelectedDragableItem = (item,index) =>{
        this.setState({selectedProductDrag:item, selectedProductIDDrag:index});
    }
    replaceIsleArray=(aisleArray,IsRemove)=>{
        // console.log(IsRemove);
        if(IsRemove){
            this.disableEnableCatActive(false,this.state.selectedProductDrag.mpHasCatId)
        }else{
            this.disableEnableCatActive(true,this.state.selectedProductDrag.mpHasCatId)
        }
       
        this.setState({floormaprects:aisleArray},()=>{
            this.saveSimulationPositions()
        });
    
    }
    disableEnableCatActive=(isDisable,catid)=>{
        var catlist=JSON.parse(JSON.stringify(this.state.BrshowcategoryList))
        console.log(catlist)
        for (let i = 0; i < catlist.length; i++) {
            const cat = catlist[i];
            if(cat.mpHasCatId===catid){
                cat.isDisable=isDisable
                break
            }
        }
        this.setState({BrshowcategoryList:catlist},()=>{
            console.log(this.state.BrshowcategoryList)
        })
    }
    onSortIslecats=(oldIndex, newIndex,startIsleIdx,DropIsleIdx)=>{
        // let olditem = this.state.floormaprects[startIsleIdx].assignedCategories[oldIndex];
        // let newitem = this.state.floormaprects[startIsleIdx].assignedCategories[newIndex];
        let newfixidx =newIndex// this.checkProductIdxOnTop(olditem, newitem, newIndex, oldIndex); //this.checkProductIdxOnTop(olditem, newIndex, oldIndex);
       
        this.setState(({floormaprects}) => ({
            floormaprects: arrayMoveLTR(floormaprects, oldIndex, newfixidx,startIsleIdx),
        }),()=>{
            // if(oldIndex !== newfixidx){
            //     this.AddHistory();
            //     this.saveBrandProductSnapshot(null,null,null,true,false,false,false);
            // }
            this.saveSimulationPositions()
        });
        if(this.props.isRTL==="ltr"){
        }
        else if(this.props.isRTL==="rtl"){
            
        }
    }
    //find dropping idx is overlapping on top has tag or on top has tag idx adding to normal one
    // checkProductIdxOnTop = (olditem, newitem,newidx, oldidx) => {
    //     let hasTagidxs = this.state.onTopHasTagsIndexes;
    //     let isOverlappingHasTags = hasTagidxs.includes(newitem.productId);

    //     let newreturnidx = newidx; //return index
    //     // if((olditem.isHasTags && !isOverlappingHasTags) || (!olditem.isHasTags && isOverlappingHasTags)){
    //     //     newreturnidx = oldidx;

    //     //     if(olditem.isHasTags && !isOverlappingHasTags){
    //     //         // newreturnidx = (hasTagidxs[(hasTagidxs - 1)] + 1);
    //     //         alertService.warn(this.props.t("cannot_change_hastags_to_normal"));
    //     //     } else{
    //     //         alertService.warn(this.props.t("cannot_change_normal_to_hastags"));
    //     //     }
    //     // }

    //     return newreturnidx;
    // }

    //change zoom strenth
    setZoomStrength = (evt) => {
        let curvalue = evt.target.value;
        let czoomrate = 0;

        if(curvalue > 1){
            if(curvalue <= 30){
                czoomrate = 1;
                curvalue = 30;
            } else if(curvalue > 30 && curvalue <= 60){
                czoomrate = 2;
                curvalue = 60;
            } else if(curvalue > 60 && curvalue <= 100){
                czoomrate = 3;
                curvalue = 100;
            }    
        } else{
            curvalue = 0;
        }
        
        // console.log(evt.target.value);
        this.setState({ zoomStrenth: curvalue, zoomRate: czoomrate }, () => {
            if(this.state.zoomRate > 0){
                this.handleZoomInOut(true, false);
            } else{
                this.handleZoomInOut(false, false);
            }
        });
    }
    //toggle zoom view
    toggleZoomTool = () => {
        this.setState({ zoomEnabled: !this.state.zoomEnabled });
    }
    //handle zoom feature
    handleZoomInOut = (iszoomin, isreset) => {
        let svg = document.getElementById('mainzoomsvg-view');
        let viewBox = svg.viewBox.baseVal;
        
        let zoomsizex = this.state.zoomRate;
        if(iszoomin){
            viewBox.x = this.state.viewWidth / (4 * zoomsizex);
            viewBox.y = this.state.viewHeight / (4 * zoomsizex);
            viewBox.width = this.state.viewWidth / (2 * zoomsizex);
            viewBox.height = this.state.viewHeight / (2 * zoomsizex);
            
            if(zoomsizex === 0){
                viewBox.x = 0;
                viewBox.y = 0;
            }

            zoomsizex = zoomsizex + 1;
        } else{
            viewBox.x = 0;
            viewBox.y = 0;
            viewBox.width = this.state.viewWidth;
            viewBox.height = this.state.viewHeight;

            zoomsizex = 0;
        }

        //console.log(bkpvb,viewBox);
        this.setState({ zoomRate: zoomsizex });
    }
    //find real xy locations of clicking location according to svg viewbox
    xyChangeCoords = (evt) => {
        //console.log(evt);
        this.svgZoomCreatePoint.x = evt.clientX;
        this.svgZoomCreatePoint.y = evt.clientY;
    
        // The cursor point, translated into svg coordinates
        var cursorpt =  this.svgZoomCreatePoint.matrixTransform(this.drawSVG.getScreenCTM().inverse());
        //console.log("(" + cursorpt.x + ", " + cursorpt.y + ")");

        return {x: cursorpt.x, y: cursorpt.y};
    }
    //clickon svgMouseDown
    svgMouseDown=(e)=>{
        this.toggleZoompan(e,true,true);
    }
    //clickon svgMouseMove
    svgMouseMove=(e)=>{
        /* if(this.state.isAllowPan){
            this.handlePanView(e);
        } */
    }
    //clickon svgMouseUp
    svgMouseUp=(e)=>{
        this.toggleZoompan(e,true,false)
    }
    //toggle zoom pan tool
    toggleZoompan = (evt,ismove,enablemove) => {
        this.setState({ isAllowPan: enablemove });
    }
    //enables pan
    handlePanView = (event) => {
        if(this.state.isAllowPan){
            let svg = document.getElementById('mainzoomsvg-view');
            let viewBox = svg.viewBox.baseVal;

            //block more going more than layout size
            //get current viewbox x,y location change
            let newmovex = (viewBox.x - event.movementX);
            let newmovey = (viewBox.y - event.movementY);

            viewBox.x = newmovex;
            viewBox.y = newmovey;
        }
    }
    //onchange map intract 
    mapInstractChange = (scale, translation) => {
        console.log(scale, translation);
    }

    nextStore = () =>{
        let id = this.state.storeId
        const index = this.state.switchStoreList.findIndex(store => store.storeId === id);
        const isNextButton = (this.state.switchStoreList.length -1) === (index+1)?false:true; 
     
         if(index<this.state.switchStoreList.length - 1){
            this.setState({
                storeId : this.state.switchStoreList[index+1].storeId,
                isNextButton:isNextButton
            },()=>{
                console.log(this.state)
                this.getPushBranchdetails()
            })
        }
    }

    saveSimulationPositions = ()=>{
        let aisles =this.state.floormaprects.map((aisle)=>{
            let orderNoCount = 0;
                return{ aisleAllocationSlotId:aisle.aisleAllocationSlotId,
                    assingedCategories:  aisle.assignedCategories.map((value)=>{
                        return{
                            mpHasCatId:value.mpHasCatId,
                            isAdd:value.isAdd?value.isAdd : false,
                            isRemove:value.isRemove?value.isRemove:false,
                            orderNo:value.isRemove?null:++orderNoCount
                        }
                    })
                }
            })

           let sobj = {
                aisleAllocationId : this.state.aisleAllocationId,
                aisles:aisles
            }

        submitSets(submitCollection.saveSimulationPositions,sobj, true).then(res => {
            if (res && res.status){
                this.setState({
                    isloading:true,
                    floormaprects:[]
                },()=>{
                    this.getPushBranchdetails()
                })
     
            }
        })
    }
    simulateHandleClick=()=>{
        let storeobj = this.state.storesList.find(x => x.storeId === this.state.storeId);
        // console.log(storeobj);

        this.setState({ isleSimObj: storeobj }, () => {
            this.toggleSimulateAllModal();
        });
    }

    //simulation trigger methods
    toggleSimulateAllModal=()=>{
        if(this.state.isallsimulatemodal){
            this.sendmarkStackableCall()
            //close model
            confirmAlert({
                title: this.props.t('CLOSE_SIMULATION'),
                message: "",
                overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                buttons: [{
                    label: this.props.t('btnnames.yes'),
                    onClick: () => {
                        this.setState({ isallsimulatemodal: !this.state.isallsimulatemodal,openOneCategory:false });
                    }
                }, {
                    label: this.props.t('btnnames.no'),
                    onClick: () => {
                        return false;
                    }
                }]
            });
        }else{
            //open model
            this.setState({ isallsimulatemodal: !this.state.isallsimulatemodal,openOneCategory:false });
        }
    }
    sendmarkStackableCall=(type)=>{
        if(this.props.mpstate.mpStackableProdList!==null&&this.props.mpstate.mpStackableProdList.length>0){
            this.setState({
                // loadinggif:true,loadingstackablecall:true,
                isStackableEdited:false},()=>{
                var sobj =this.props.mpstate.mpStackableProdList!==null?this.props.mpstate.mpStackableProdList:[]
                submitSets(submitCollection.bulkUpdateByProductClick, sobj, false, null, true).then(res => {
                    if(res && res.status){
                        // alertService.success(res.extra===""?this.props.t("SUCCESSFULLY_UPDATED"):res.extra)
                        this.setState({
                            // loadinggif: false,loadingstackablecall:false,
                            markablestackable:false, stackableCountofmark:"",},()=>{
                            
                        });
                    }else{
                        // alertService.error(res.extra===""?this.props.t("erroroccurred"):res.extra)
                        // this.setState({loadinggif: false,loadingstackablecall:false})
                    }
                });
                if(type==="back"){
                    this.toggleOneCategory()
                }
            })
        }
      
    }
    //toggle onecategory open: 
    toggleOneCategory=()=>{
        this.setState({openOneCategory:!this.state.openOneCategory})
    }
     // change haveChnagesinCat
     handlehaveChnagesinCat=(val)=>{
        this.setState({haveChnagesinCat:val})
    }
    //simulation triiger methods end
    handleClickonField=(obj)=>{
        this.setState({clickedDepobj:obj})
    }

    render() {
        // console.log(this.props)
        let {BrshowcategoryList,viewWidth,viewHeight,floormaprects,floorDrawmaprects,imageurl,selectedProductDrag,clickedDepobj} = this.state;
        let sliderleftmargin = (this.state.sliderIndex > 0?(Math.abs((this.state.slideritemwidth * this.state.sliderIndex)) * -1):0);
        
        return (
                <div className='aisleAllo-Modal-div'>
                <Row >
                    <Col xs={8} className="push-branchview">
                        <Col>
                            <Col  className={'pushbranch-view-switch '+(this.state.sliderItems && this.state.sliderItems.length === 1?'':'')+this.props.isRTL+(this.state.isDeptListLoading===true ?" d-none":"")} style={{position:"relative"}}>
                               {this.state.currentPage > 1 && <div className={'slider-indicator '} onClick={this.handlePrevPage}><ChevronLeftIcon size={16}/></div>}
                               {this.state.currentPage < this.state.totalPages && <div className={'slider-indicator right'}onClick={this.handleNextPage}><ChevronRightIcon size={16}/></div> }  
                                
                                <Col className='slider-content carousel-content' ref={this.storeAssignCatDiv}>
                                    <Col className='slider-innercontent' style={this.props.isRTL === "rtl"?{marginRight:sliderleftmargin}:{marginLeft:sliderleftmargin}}>
                                        {this.state.switchStoreList.length>0?this.state.switchStoreList.map((branch,b)=>
                                        <Button key={b}  className={`tab-item ${this.state.storeId === branch.storeId && "active"} `}  onClick={()=>{this.storeTabChange(branch.storeId, branch.storeName)}}>
                                            <div className='d-flex flex-row gap-2 justify-content-center'>
                                              <TooltipWrapper text={branch.storeName}>
                                              <span>{branch.storeName.slice(0,8).slice(0, 8)}{branch.storeName.length > 8 && "..."}</span>
                                            </TooltipWrapper>
                                            {branch.assignedCategoryCount === branch.categoryCount ? <span> <AUICheckboxIcons icon="rounded-check" size={18} color="black"  /></span> :<span>  <AUICheckboxIcons icon="rounded" size={18} color="black"  /></span>  } 
                                            </div>
                                            </Button>)
                                        :<></>}
                                    </Col>
                                </Col> 
                                <BranchCatview rtl={this.props.isRTL} selectedProductDrag={selectedProductDrag} catList={BrshowcategoryList} isleArray={floormaprects} t={this.props.t} setSelectedDragableItem={this.setSelectedDragableItem} replaceIsleArray={this.replaceIsleArray} onSortIslecats={this.onSortIslecats} />
                            </Col>
                        </Col>
                    </Col>
                    <Col xs={4} >
                        <Col className="middle-section mapsection" style={{textAlign:"center"}}  ref={this.displaydivmap}>
                            <div className='Aisleall0-depdiv'>
                                <div className='depsec-aisleallo' style={{visibility:(clickedDepobj!==null)?"visible":"hidden"}}>
                                    <div> <span className='colorbox' style={{backgroundColor:(clickedDepobj!==null)?clickedDepobj.color:"black"}}></span></div>
                                   
                                    <span className='deplable-aisleallo'>{((clickedDepobj!==null)&&clickedDepobj.name)?clickedDepobj.name:"-"}</span>
                                </div>
                            </div>
                            {/* <ul className={'list-inline '+(this.props.isRTL === "rtl"?"text-left":"text-right")}>
                                <li className='list-inline-item'>
                                    <Button size='sm' className={'default'+(this.state.zoomEnabled?" active":"")} onClick={this.toggleZoomTool}><SearchIcon size={16}/> Zoom</Button>
                                </li>
                                <li className='list-inline-item'>
                                    <div className="slidecontainer">
                                        <input type="range" min="1" max="100" value={this.state.zoomStrenth} onChange={e => this.setZoomStrength(e)} className="slider" />
                                    </div>
                                </li>
                            </ul> */}
                            <Col id='simulation-zoom-wrapper' style={{maxHeight:(this.state.divHeightfloor-35)}}>
                                {
                                    this.state.zoomReset ?
                                    <PrismaZoom   minZoom={1} maxZoom={5}>
                                    <svg id="mainzoomsvg-view" className={"PDmap"} preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" 
                                        viewBox={'0 0 '+viewWidth+' '+viewHeight} height={viewHeight} width={viewWidth}
                                        onMouseDown={(e) => this.svgMouseDown(e)}
                                        onMouseMove={(e) => this.svgMouseMove(e)} 
                                        onMouseUp={(e) => this.svgMouseUp(e)} 
                                        ref={(ref) => this.drawSVG = ref}
                                        >
                                        <rect x={0} y={0} width={viewWidth} height={viewHeight} strokeWidth={4} fill="none" style={{ stroke: (this.props.dmode?'#2CC990':'#CBCBCB') }} />
                                        <image href={imageurl} width={viewWidth} height={viewHeight} />  
                                        <g>
                                            {floorDrawmaprects.map((rect, i) =>
                                                <React.Fragment key={i} >{!rect.isDelete ?
                                                    rect.fields.map((field, d) => {
                                                        return <Rect key={d} pointerEvents="all"
                                                        isshowaisleNo={(rect.NoFieldshowidx !== undefined&&rect.NoFieldshowidx===d)?true:false}
                                                            clickedDepobj={clickedDepobj}
                                                            fill="red" width={field.drawWidth} height={field.drawDepth} obj={rect} field={field} 
                                                            departmentId={this.props.departmentId}
                                                            x={(field.x)} y={(field.y)} rotation={(field.rotation)} 
                                                            isRTL={this.props.isRTL}
                                                            arrayLength={rect.fields.length} 
                                                            // minX={rect.fields.reduce((min, item) => item.x < min ? item.x : min, rect.fields[0].x)}
                                                            // minY={rect.fields.reduce((min, item) => item.y < min ? item.y : min, rect.fields[0].y)}
                                                            handleClickonField={this.handleClickonField}
                                                        />
                                                    })
                                                    : <rect key={i} />}
                                                </React.Fragment>
                                            )}
                                        </g>
                                                    
                                        {this.state.zoomEnabled?<>
                                            <rect x={0} y={0} width={viewWidth} height={viewHeight} stroke="none" fill="#fff" fillOpacity={0.2} departmentColor={this.state.departmentColor}  />
                                        </>:<></>}
                                    </svg>     
                                </PrismaZoom>:<></>
                                }
                                
                            </Col>
                            <h5 className='text-center simulation-zoom-text'><FeatherIcon icon="zoom-in" size={28}/><br/>{this.props.t('Zoom_Info')}</h5>
                        </Col> 
                    </Col>
                </Row>
                <Row>
                    <Col className='branchview-btn d-flex justify-content-end gap-3'>
                        <Button variant="warning" onClick={()=>this.simulateHandleClick()}  size="sm" >{this.props.t("Simulate")}</Button>
                     {this.state.switchStoreList.length > 1 && this.state.isNextButton && <Button variant="success"  size="sm" onClick={this.nextStore}  >{this.props.t("NEXT")}</Button>}   
                      {this.state.Iscompleted === true && <Button variant="success"  size="sm" onClick={() => this.props.hadleUpdateImplementData()}  >{this.props.t("DONE")}</Button>} 
                    </Col>
                </Row>
                {this.state.isallsimulatemodal?<AllSimulationModal 
                    isSalesCycle={false}
                    isFromStandaloneView={false}
                    importedDataObj={this.props.importedDataObj}
                    simType={SimulationTypesFE.IsleAllocation}
                    storeId={this.state.storeId}
                    storeName={this.state.storeName}
                    department={this.state.defSaveObj.department}
                    // bottomFieldCount={this.state.bottomFieldCount}
                    defSaveObj={this.state.defSaveObj} 
                    mpstate={this.props.mpstate} 
                    chartFilterDates={this.state.chartFilterDates}
                    isallsimulatemodal={this.state.isallsimulatemodal} 
                    isRTL={this.props.isRTL} 
                    dmode={this.props.dmode}
                    // loadedTagsList={this.state.loadedTagsList} 
                    openOneCategory={this.state.openOneCategory} 
                    haveChnagesinCat={this.state.haveChnagesinCat}
                    signedobj={this.props.signedobj} 
                    isDirectSimulation={true}
                    handlehaveChnagesinCat={this.handlehaveChnagesinCat}
                    toggleOneCategory={this.toggleOneCategory} 
                    toggleLoadingModal={this.toggleLoadingModal}
                    toggleSimulateAllModal={this.toggleSimulateAllModal} 
                    sendmarkStackableCall={this.sendmarkStackableCall}
                    isIsleSimulation={true}
                    isleSimObj={this.state.isleSimObj}
                    />:<></> }
                    <AcViewModal showmodal={this.state.isloading} message={this.props.t('PLEASE_WAIT')} />
                </div>
        )
    }
}

class Rect extends React.Component {
    constructor() {
        super();

        this.state = {
            rotationEnable: false,
            startx: 0,
            starty: 0,

            beforeremoveisle: {}

        }
    }
    componentDidMount() {
  
    }

     isOddOrEven(num) {
        return num % 2 === 0 ? "Even" : "Odd";
      }
    
    render() {
        return (
            <>
                {(this.props.obj != null) ? !this.props.obj.itype ? (
                    <g className="field-rect">
                        {/* {console.log(this.props.clickedDepobj,this.props.field.department.id)} */}
                        <rect 
                            opacity={(this.props.clickedDepobj!==null)?this.props.clickedDepobj.id===this.props.field.department.id?1:0.1:1}
                            fill={this.props.field.department.color ? this.props.field.department.color : "#444"} height={this.props.height} width={this.props.width} x={this.props.x} y={this.props.y} className="shelf"
                            transform={"rotate(" + this.props.rotation + " " + (this.props.x + this.props.width / 2) + " " + (this.props.y + this.props.height / 2) + ") "}
                            style={{ cursor: "pointer" }}
                            ref={(r) => this[this.props.obj.f_uuid] = r}
                            onClick={e => this.props.handleClickonField(this.props.field.department)}
                            // onMouseDown={e => this.props.clickrack(e, this.props.field, this.props.obj)}

                        />
                        <rect
                            opacity={(this.props.clickedDepobj!==null)?this.props.clickedDepobj.id===this.props.field.department.id?1:0.4:1}
                            fill="#dc3545" stroke="#dc3545" height={(this.props.height) / 4} width={this.props.width} x={this.props.x} y={this.props.y}
                            transform={"rotate(" + this.props.rotation + " " + (this.props.x + this.props.width / 2) + " " + (this.props.y + this.props.height / 2) + ") "}
                           
                             />

                        {/* <circle className="field-circle" cx={(this.props.x)} cy={this.props.y} r="5" stroke="black" strokeWidth="1" fill="red"
                            transform={"rotate(" + this.props.rotation + " " + (this.props.x + this.props.width / 2) + " " + (this.props.y + this.props.height / 2) + ") "}
                            onMouseDown={(e) => (this.props.obj.fields.length === 1 && !this.props.planoLock) && this.props.handlerotationStart(e, true, this.props.field, this[this.props.obj.f_uuid], this.props.field.rotation)}
                        /> */}
                        
                        {/* {this.props.field.noInFloorLayout && <circle
                            cx={this.props.Feildnoshow === 2 ? ((this.props.x + (this.props.width) / 2)) : (this.props.x + (this.props.width / 2) + 1)}
                            cy={this.props.Feildnoshow === 2 ? (this.props.y - 23) : (this.props.y + (this.props.height / 2))}
                            r="9" stroke="black" strokeWidth="1" fill="#f7e4a9"
                            className={(this.props.Feildnoshow === 2 ? "onhovertext" : "")}
                            onClick={e => this.props.clickrack(e, this.props.field, this.props.obj)}
                            style={{ display: (this.props.Feildnoshow === 1 ? "block" : "none"), cursor: "pointer" }}

                        />} */}
                       {
                        // (this.props.minX === this.props.x ) && (this.props.minY === this.props.y ) &&
                        (this.props.obj.aisleNo&&this.props.obj.aisleNo!==null) &&this.props.isshowaisleNo&&
                        <>
                           <circle cx={(this.props.x+this.props.width/2)+5} cy={(this.props.y+this.props.height/2)} r="8" stroke="#5128A0" strokeWidth="1" fill="#5128A0"
                           onClick={e => this.props.handleClickonField(this.props.field.department)}
                        // transform={"rotate(" + this.props.rotation + " " + (this.props.x + this.props.width / 2) + " " + (this.props.y + this.props.height / 2) + ") "}
                        
                         />
                            <text x={((this.props.x+this.props.width/2) - 3)+(this.props.isRTL==="rtl" ?11:5)} y={(this.props.y+this.props.height/2)+(this.props.isRTL==="rtl"?3:2)} fill="white" fontWeight={700} fontSize="11" 
                            onClick={e => this.props.handleClickonField(this.props.field.department)} >{`${this.props.obj.aisleNo?this.props.obj.aisleNo:""}`}</text>
                     
                        </>
                        
                       } 


                    
                        {/* <text className={(this.props.Feildnoshow === 2 ? "onhovertext" : "")} fontSize="11" height={this.props.height} width={this.props.width}
                            x={this.props.Feildnoshow === 2 ? (((this.props.x + (this.props.width) / 2) - 5)) :
                                (this.props.field.noInFloorLayout && (this.props.field.noInFloorLayout.toString().length === 1 ? (this.props.isRTL === "rtl" ? (this.props.x + (this.props.width / 2) + 4) : this.props.x + (this.props.width / 2) - 2) : (this.props.isRTL === "rtl" ? (this.props.x + (this.props.width / 2) + 6) : (this.props.x + (this.props.width / 2) - 4))))}
                            y={this.props.Feildnoshow === 2 ? (this.props.y + (this.props.height / 2) - 25) : (this.props.y + (this.props.height / 2) + 4)}
                            fill="black" onClick={e => this.props.clickrack(e, this.props.field, this.props.obj)}
                            style={{ display: (this.props.Feildnoshow === 1 ? "block" : "none"), cursor: "pointer" }}
                       

                        >{this.props.field.noInFloorLayout > 0 && this.props.field.noInFloorLayout}</text> */}
                    </g>
                ) :
                    //isle draw
                    <g className="field-rect">
                        <rect fill={this.props.departmentColor ? this.props.departmentColor : "#444"}  height={this.props.height} width={this.props.width} x={this.props.x} y={this.props.y} className="shelf"
                            transform={"rotate(" + this.props.rotation + " " + (this.props.x + this.props.width / 2) + " " + (this.props.y + this.props.height / 2) + ") "}
                            style={{ cursor: "pointer" }}
                            ref={(r) => this[this.props.obj.f_uuid] = r}
                        />
                        <circle className="field-circle" cx={(this.props.x)} cy={this.props.y} r="5" stroke="black" strokeWidth="1" fill="red"
                            transform={"rotate(" + this.props.rotation + " " + (this.props.x + this.props.width / 2) + " " + (this.props.y + this.props.height / 2) + ") "}
                            onMouseDown={(e) => (this.props.obj.fields.length === 1 && !this.props.planoLock) && this.props.handlerotationStart(e, true, this.props.field, this[this.props.obj.f_uuid], this.props.field.rotation)}
                        />
                    </g>
                    : (
                        <></>
                    )}
            </>
        )
    }
}

class BranchCatview extends React.Component {
    constructor(props) {
        super(props)
        this.catboxdiv = React.createRef();
        this._isMounted = false;
        
        this.state = {
            catboxDivwidth:0
        }
    }
    

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            // console.log(this.catboxdiv.current ? (this.catboxdiv.current.offsetWidth-50) : 0);
            this.setState({catboxDivwidth:this.catboxdiv.current ? (this.catboxdiv.current.offsetWidth-50) : 0})
        }
    }



    componentWillUnmount(){
        this._isMounted = false;
    }
    // getwidthtoPercentage=(fullwidth,percentage)=>{
    //     var length=fullwidth*(percentage/100)
    //     console.log(length);
    //     return length
    // }
    ondragOver=(e)=>{
        e.preventDefault()
        // e.dataTransfer.dropEffect = "none"
    }
    handleDragStart=(e)=> {
        // this.style.opacity = '0.4';
      }
    ondropIslebox=(fromtype,isleidx,oldIndex)=>{
        // console.log(fromtype,isleidx,oldIndex);
        var isles=JSON.parse(JSON.stringify(this.props.isleArray))
        var selecteditem=this.props.selectedProductDrag
        if(fromtype==="from-cat-box"){
            let cats = isles[isleidx].assignedCategories
            selecteditem.isAdd = true
            cats.push(selecteditem)
     
            this.props.replaceIsleArray(isles)
        }
        if(fromtype==="from-isle-box"){
    
            let cats = isles[isleidx].assignedCategories
            selecteditem.isAdd = true
            cats.push(selecteditem);

            let remislecats=isles[this.state.dragstartIsleIdx].assignedCategories;

            if(remislecats[oldIndex].isAdd){
                remislecats.splice(oldIndex, 1);
            }else{
                remislecats[oldIndex].isRemove = true
            }
           

            this.props.replaceIsleArray(isles);
        }
    }
    removeCatFromIsle=(isleIdx,idx)=>{
        // console.log(isleIdx,idx);
        var isles=JSON.parse(JSON.stringify(this.props.isleArray))
        var remislecats=isles[isleIdx].assignedCategories

        remislecats[idx].isRemove = true
        this.props.replaceIsleArray(isles,true)
        // remislecats.splice(idx, 1)
    }
    onSortEndCatbox=({oldIndex, newIndex}, evt)=>{
         //check if dragged to mvp and drop it to mvp
         if(this.state.dragSortMousePosition){
            let pathlist = (this.state.dragSortMousePosition.path ? this.state.dragSortMousePosition.path : []);

            if(pathlist.length === 0 && evt.composedPath){//findBrowserType() === "firefox" &&
                pathlist = evt.composedPath();
            }
    
            var idavailable=-1
            var isleidx=-1
            for (let index = 0; index <  this.props.isleArray.length; index++) {
                idavailable = pathlist.findIndex(x => x.id === ("drop-box"+index));
                if(idavailable>-1){
                    isleidx=index
                    break
                }
            }
            if(idavailable>-1){
                // console.log("in isle cat",oldIndex, newIndex,isleidx);
                this.ondropIslebox("from-cat-box",isleidx)
            }
            // else{
            //     var isontopavl = pathlist.findIndex(x => x.id === "ontop-sortable");
            //     if(isontopavl>-1){
                    
            //     }
            // }
        }
        else{
            // this.props.onSortEndOnTop(oldIndex, newIndex);
        }
    }
    onSortEndIslebox=({oldIndex, newIndex}, evt)=>{
         //check if dragged to mvp and drop it to mvp
        //  console.log(this.state.dragSortMousePosition);
         if(this.state.dragSortMousePosition){
            let pathlist = (this.state.dragSortMousePosition.path ? this.state.dragSortMousePosition.path : []);

            if(pathlist.length === 0 && evt.composedPath){//findBrowserType() === "firefox" &&
                pathlist = evt.composedPath();
            }
    
            var idavailable=-1
            var isleidx=-1
            for (let index = 0; index <  this.props.isleArray.length; index++) {
                idavailable = pathlist.findIndex(x => x.id === ("drop-box"+index));
                
                if(idavailable>-1){
                    isleidx=index
                    break
                }
            }
            if(idavailable>-1){
                if(isleidx===this.state.dragstartIsleIdx){
                    //same box move
                    this.props.onSortIslecats(oldIndex, newIndex,this.state.dragstartIsleIdx,isleidx);
                }else{
                    // not same box move
                    this.ondropIslebox("from-isle-box",isleidx,oldIndex)
                }
            }
            else{
               
            }
        }
        else{
            // this.props.onSortEndOnTop(oldIndex, newIndex);
        }
    }
    onSortMoveCatbox=(event)=>{
        this.setState({dragSortMousePosition:event});
    }
    onSortMoveIslebox=(event,startisleIdx)=>{
        this.setState({dragSortMousePosition:event,dragstartIsleIdx:startisleIdx});
    }
   
    render() {
        // console.log(this.props.catList)
        // var {catboxDivwidth} = this.state;
        var {catList,isleArray} = this.props;
        return (
            <Col className="middle-section" style={{textAlign:"center",borderTopLeftRadius:"0px"}} > 
                <Col className='droparea-box ' >
                    {isleArray.sort((a, b) => a.aisleNo - b.aisleNo).map((aisle, iidx) => {
                                return(
                                <React.Fragment key={iidx}>
                                    {aisle.assignedCategories.length === 0 &&<span className='drag-here-text'>{this.props.t('Drag_Drop_Info')}</span>}
                                    <Col key={iidx} className='in-box col-centered'>
                                        <Row>
                                            <Col className='number' >{aisle.aisleNo}.<small>{aisle.aislePercentage}%</small></Col>
                                                <Col className='dropbox' id={'drop-box'+iidx} 
                                                // style={{display:"inline-flex"}}
                                                 onDragOver={(e)=>this.ondragOver(e)}>
                                         
                                                    <IsleSortableContainer  rtl={(this.props.isRTL==="rtl"?true:false)} onSortEnd={this.onSortEndIslebox} useDragHandle={false} axis="xy"  lockToContainerEdges={false} getContainer={this.getContainer} onSortStart={this.sortEvent}  onSortMove={(e)=>this.onSortMoveIslebox(e,iidx)} distance={10}  >
                                                        
                                                        {aisle.assignedCategories&&aisle.assignedCategories.map((cat, cidx) => {
                                                            if(cat.isRemove){
                                                                return <React.Fragment > </React.Fragment>
                                                            }
                                                            return <React.Fragment key={cidx}>
                                                                {
                                                                    <IsleSortableItem sum={aisle.assignedCategories.reduce((acc, obj) => acc + obj.percentage, 0)}  isleIndex={iidx}  disabled={false} key={cidx} index={cidx} rownumber={cidx} product={cat} trans={this.props.t} handleChangeArchive={this.handleChangeArchive} showFullSidebar={this.props.showFullSidebar} showFullSidebarSizeChange={this.props.showFullSidebarSizeChange} isrtl={this.props.isRTL} handleImagePreviewModal={this.handleImagePreviewModal} getProductData={this.getProductData}  setSelectedDragableItem={this.props.setSelectedDragableItem} removeCatFromIsle={this.removeCatFromIsle}/>
                                                                }
                                                            </React.Fragment>
                                                            })
                                                        }
                                                      
                                                    </IsleSortableContainer>
                                                </Col>
                                        </Row>
                                       
                                    </Col>
                                </React.Fragment>
                                )
                        })
                    }
                    {/* <Col className='in-box col-centered'>
                        <Row>
                            <Col className='number' >2.</Col>
                            <Col className='dropbox' style={{display:"inline-flex"}} onDragOver={(e)=>this.ondragOver(e)}>
                                
                                    <Col className='catcard' >
                                        <div>Canned Food </div>
                                        <div >10%</div>
                                    </Col>
                            </Col>
                        </Row>
                    </Col> */}
                    
                </Col> 
                <hr />
                
                {/* <Col className='cat-box' ref={this.catboxdiv}>
                    <Col style={{display:"flex"}}>
                        {(catList.length)>0?catList.map((cat,c)=>
                            <Col key={c} className='catcard' draggable style={{flex:("0 "+cat.percentage+"%")}}  onDragStart={(e)=>this.handleDragStart(e)}>
                                {console.log(cat,catList)}
                                <div>{cat.categoryName}</div>
                                <div >{cat.percentage + "%"}</div>
                            </Col>)
                        :<></>}
                    </Col>
                </Col>         */}
                <Col className='cat-box' id='cat-loading-box' ref={this.catboxdiv}>
                    <CatSortableContainer   rtl={(this.props.isRTL==="rtl"?true:false)} onSortEnd={this.onSortEndCatbox} useDragHandle={false} axis="xy" hideSortableGhost={false} lockToContainerEdges={true} getContainer={this.getContainer} onSortStart={this.sortEvent}  onSortMove={this.onSortMoveCatbox} distance={10} >
                        {catList.map((xitem, xidx) => {
                            return(
                                <CatSortableItem collection={xidx} disabled={xitem.isDisable} key={xidx} index={xidx} rownumber={xidx} product={xitem} trans={this.props.t} handleChangeArchive={this.handleChangeArchive} showFullSidebar={this.props.showFullSidebar} showFullSidebarSizeChange={this.props.showFullSidebarSizeChange} isrtl={this.props.isRTL} handleImagePreviewModal={this.handleImagePreviewModal} getProductData={this.getProductData}  setSelectedDragableItem={this.props.setSelectedDragableItem}/>
                            )
                        })}
                        
                    </CatSortableContainer>  
                </Col>
                
            </Col>
        )
    }
}

const CatSortableContainer = SortableContainer(({children}) => {
    return <Row>{children}</Row>;
});

const IsleSortableContainer = SortableContainer(({children}) => {
    return <Row>{children}</Row>;
});
const IsleSortableItem = SortableElement(({sum,rownumber ,index,isleIndex, isrtl, product, trans,showFullSidebarSizeChange, handleChangeArchive, handleImagePreviewModal, getProductData, handlePerentageChange, handlePerentageBlur, handlePercentageOnFocus, handlePlusMinus, dragStart, dragEnd, setSelectedDragableItem,removeCatFromIsle}) => 
    <div  className='branchpush-cats-view-main branchpush-prodview-col' onMouseDown={()=>setSelectedDragableItem(product, product.id)} style={{width:(product.percentage+"%")}}>
       {/* {console.log(rownumber)} */}
        <Col className='catcard'>
            <div>
                {/* {product.categoryName} */}
                <TooltipWrapper text={PushBranchGetboxNamefromDealer(product,"name")}>
                    <span className='name'>{PushBranchGetboxNamefromDealer(product,"name").length >= Math.floor((product.percentage/100 * window.innerWidth * 0.75)/12)?PushBranchGetboxNamefromDealer(product,"name").substring(0,Math.floor((product.percentage/100 * window.innerWidth * 0.75)/12)-5)+ "...":PushBranchGetboxNamefromDealer(product,"name")}</span>
                </TooltipWrapper>
                {/* <span className='name'>{PushBranchGetboxNamefromDealer(product,"name")}</span> */}
                <span className='spanclose' onClick={()=>removeCatFromIsle(isleIndex,rownumber)}>X</span>
            </div>
            <div >
            <TooltipWrapper text={product.percentage + "% / " +((product.percentage/sum) * 100).toFixed(2)+"%" }>
                    <span className='name'>{(product.percentage + "% / " +((product.percentage/sum) * 100).toFixed(2)+"%").length >= Math.floor((product.percentage/100 * window.innerWidth * 0.75)/12)?(product.percentage + "% / " +((product.percentage/sum) * 100).toFixed(2)+"%").substring(0,Math.floor((product.percentage/100 * window.innerWidth * 0.75)/12)-2)+ "...":(product.percentage + "% / " +((product.percentage/sum) * 100).toFixed(2)+"%" )}</span>
                </TooltipWrapper>
               {/* <span>{product.percentage + "% / " +((product.percentage/sum) * 100).toFixed(2)+"%" }</span>  */}
            </div>
        </Col>
        
    </div>
)
const CatSortableItem = SortableElement(({rownumber , isrtl, product, trans, handleImagePreviewModal, getProductData, dragStart, dragEnd, setSelectedDragableItem}) => 
    
    <div className='branchpush-cats-view-main branchpush-prodview-col' onMouseDown={()=>setSelectedDragableItem(product, product.id)} style={{width:(product.percentage+"%")}}>
        <Col className='catcard' 
        style={{opacity:product.isDisable? 0.5:1}}
        //  style={{flex:("0 "+product.percentage+"%")}}
           >
             <TooltipWrapper text={PushBranchGetboxNamefromDealer(product,"name")}>
                <div>{PushBranchGetboxNamefromDealer(product,"name").length > Math.floor((product.percentage/100 * window.innerWidth * 0.75)/12)?PushBranchGetboxNamefromDealer(product,"name").substring(0,Math.floor((product.percentage/100 * window.innerWidth * 0.75)/12)-4)+ "...":PushBranchGetboxNamefromDealer(product,"name")}</div>
            </TooltipWrapper>
            <div >{product.percentage + "%"}</div>
        </Col>
    </div>
   
    )

    const arrayMoveLTR = (array, from, to,startIsleIdx) => {
        
        var oriArray=JSON.parse(JSON.stringify(array))
        var islecatArray=oriArray[startIsleIdx].assignedCategories
        islecatArray = islecatArray.slice();
        arrayMoveMutate(islecatArray, from, to);
        //rechange rank number
        for (let i = 0; i < islecatArray.length; i++) {
            islecatArray[i].orderNo = (i+1);
        }
        oriArray[startIsleIdx].assignedCategories=islecatArray
     
        return oriArray;
        
    };
    const arrayMoveMutate = (array, from, to) => {
        array.splice(to < 0 ? array.length + to : to, 0, array.splice(from, 1)[0]);
    };
export default withTranslation()(withRouter((PushBranchView)))