import React, { useEffect, useRef, useState } from 'react';
import * as d3 from "d3";
import { Button, ButtonGroup, Col, Dropdown, Form, InputGroup, Overlay, Row, Tooltip, Image } from 'react-bootstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard
import FeatherIcon from 'feather-icons-react';

import { v4 as uuidv4 } from 'uuid'; //unique id
// import { roundOffDecimal, measureConverter } from '../../../../../_services/common.service';
import i18n from "../../../../../_translations/i18n"; 
// import { checkSimulateSnapAllow } from '../../../AddMethods';
import { elmAccordingtoXY, GetContainingProdsByBox, groupBy, getSnappingLocation } from '../mpsimCommenMethods';
import { convertUomtoSym, numOfDecimalsLimit, roundOffDecimal, stringtrim } from '../../../../../_services/common.service';
import { CodeSquareIcon, DiffAddedIcon, ListUnorderedIcon, SearchIcon, XIcon } from '@primer/octicons-react';

import { notSimulatedReason, catRuleEnums, catRectEnums } from '../../../../../enums/masterPlanogramEnums';
import { ReplaceProdIconArrow, FilterIconNew } from '../../../../../assets/icons/icons';
import { alertService } from '../../../../../_services/alert.service';
import Select from 'react-select';
import { PopoverWrapper, TooltipWrapper } from '../../../AddMethods';
import SalesCycleIcon from '../../../../../assets/img/icons/sale_cycle.png';
import ThreeDQtyIcon from '../../../../../assets/img/icons/3d_qty.png';
import SaleQtyIcon from '../../../../../assets/img/icons/sale_qty.png';
import DayCountIcon from '../../../../../assets/img/icons/day_count.png';
import MiniThreeDQtyIcon from '../../../../../assets/img/icons/mini_3d_qty.png';
import MiniSaleQtyIcon from '../../../../../assets/img/icons/mini_sale_qty.png';
import MiniDayCountIcon from '../../../../../assets/img/icons/mini_day_count.png';
import WarnIcon from '../../../../../assets/img/icons/warn_full.png';
import DefaultProdImg from '../../../../../assets/img/icons/default_W100_100.jpg';

  export class BlockRectangle extends React.Component {
    constructor(props){
        super(props);

        this._guideTimeout = null;
        this._dragStartXY = {x: 0, y: 0};

        this.state = {
            selectBlockObj: null, bkpBlockObj: null,
            droppingShelveIdx: -1, droppingShelveObj: null,
            isviewcmenu: false, contxtmenu: {xpos:0, ypos: 0, xidx: 0, scatidx: 0},
        }
    }
  
    componentDidMount() {
      //#PDU-SM07 - d3 init
      const handleDrag = d3.drag()
        .subject(() => {
          const me = d3.select(this["LM01"]);
          return { x: me.attr('x'), y: me.attr('y') }
        })
        .on('start', (event) => {
          this._dragStartXY = { x: event.x, y: event.y };
          this.props.dragStart(event, this.props.curitem.prod.productInfo, true);
        })
        .on('drag', (event) => {
          const me = d3.select(this["LM01"]);
          me.attr('x', event.x);
          me.attr('y', event.y);

          //scroll parent div with d3 drag
          let parent = document.getElementById(this.props.wrapperId);
          let zoomXRatio = this.props.zoomXRatio;

          let w = parent.offsetWidth; 
          let h = parent.offsetHeight;
          let sL = parent.scrollLeft;
          let sT = parent.scrollTop;

          let movewidth = (this.state.selectBlockObj.drawWidth + (zoomXRatio > 0?(zoomXRatio + 1):1));
          let moveheight = (this.state.selectBlockObj.drawHeight + (zoomXRatio > 0?(zoomXRatio + 1):1));

          let x = (event.x * (zoomXRatio > 0?(zoomXRatio + 1):1));
          let x2 = ((event.x * (zoomXRatio > 0?(zoomXRatio + 1):1)) + movewidth);
          let y = (event.y * (zoomXRatio > 0?(zoomXRatio + 1):1));
          let y2 = ((event.y * (zoomXRatio > 0?(zoomXRatio + 1):1)) + moveheight);

          //if dragging horizontal
          if (x2 > w + sL) {
            parent.scrollLeft = (x2 - w);  
          } else if (x < sL) {
            parent.scrollLeft = (x);
          }
          
          //if dragging vertical
          if (y2 > h + sT) {
            parent.scrollTop = (y2 - h);
          } else if (y < sT) {
            parent.scrollTop = (y);
          }

          this.onDragGuidline(event,event.x,event.y);
        })
        .on('end', (event) => {
          this.updateSaveObj(event,event.x,event.y);
        });
      
      handleDrag(d3.select(this["LM01"]));
      //#PDU-SM08
      var handleResizeXLeft = d3.drag()
        .subject(() => {
          const me = d3.select(this["rsx_left"]);
          return { x: me.attr('x'), y: me.attr('y') }
        })
        .on('drag', (event) => {
          let isallowresize = this.checkAllowMoveResize(event, false);
          if(isallowresize.isallow){
            const me = d3.select(this["rsx_left"]);
            me.attr('x', event.x);
          }
        })
        .on('end', (event) => {
          this.checkAllowMoveResize(event, false, true);
        });
        handleResizeXLeft(d3.select(this["rsx_left"]));
  
      var handleResizeXRight = d3.drag()
        .subject(() => {
          const me = d3.select(this["rsx_right"]);
          return { x: me.attr('x'), y: me.attr('y') }
        })
        .on('drag', (event) => {
          let isallowresize = this.checkAllowMoveResize(event, true);
          if(isallowresize.isallow){
            const me = d3.select(this["rsx_right"]);
            me.attr('x', event.x);
          }
        })
        .on('end', (event) => {
          this.checkAllowMoveResize(event, true, true);
        });
        handleResizeXRight(d3.select(this["rsx_right"]));
  
      
      //#PDU-SM09 - calc new product block
      let prodinfo = this.props.curitem.prod;
      let blockobj = this.props.currentSelectedBlock;
      //recalc
      if(blockobj){
        var firsttime=true
        let startx = 0; let starty = 0; 
        let endx = 0, endy = 0;
        let maximx = 0;
        let sortlowYprods = blockobj.drawingProducts.sort((a,b) => a.y - b.y);
        starty = sortlowYprods[0].y
        for (let i = 0; i < blockobj.drawingProducts.length; i++) {
          const locitem = blockobj.drawingProducts[i];
          
          if(!locitem.isDelete){
            //set lowest x
            if(firsttime){
              startx = locitem.x;
            }else{
              if( startx > locitem.x){
                startx = locitem.x;
              }
            }
            //set lowest y
            // if(starty === 0 || starty > locitem.y){
            //   starty = locitem.y;
            // }
            //set highest x
            if(endx === 0 || endx < (locitem.x + locitem.drawWidth)){
              endx = (locitem.x + locitem.drawWidth);
            }
            //set highest y
            if(endy === 0 || endy < (locitem.y + locitem.drawHeight)){
              endy = (locitem.y + locitem.drawHeight);
            }
  
            if(locitem.x > maximx){
              maximx = locitem.x;
            }
          }
          firsttime=false
        }
        
        let drawwidth = (endx - startx);
        let drawheight = (endy - starty);
        let blocktotalwidth = (drawwidth / this.props.displayratio);
        let blocktotalheight = (drawheight / this.props.displayratio);
        
        blockobj.x = startx;
        blockobj.OrigX = startx
        blockobj.y = starty;
        blockobj.width = blocktotalwidth;
        blockobj.height = blocktotalheight;
        blockobj.uom = prodinfo.uom;
        blockobj.drawWidth = drawwidth;
        blockobj.drawHeight = drawheight;
        blockobj.newDrawingProducts = JSON.parse(JSON.stringify(blockobj.drawingProducts));
        var movingObj=this.setmovingObj( blockobj.newDrawingProducts);
        blockobj.selectedshelves=movingObj
        this.setState({ selectBlockObj: blockobj, bkpBlockObj: JSON.parse(JSON.stringify(blockobj)) },()=>{
          // console.log(this.state.selectBlockObj)
        });
      }
  
    }

    componentWillUnmount(){
      if(this._guideTimeout){
        clearTimeout(this._guideTimeout);
      }
    }

    setmovingObj=(drawingprods)=>{
      var groupobj=groupBy(drawingprods,"shelfrank")
      var slevtedShelves=[]
      if(Object.keys(groupobj).length>0){
        for (var key of Object.keys(groupobj)) {
          var ele=groupobj[key]
          var heightsetProd=0
          for (let i = 0; i < ele.length; i++) {
            const prod = ele[i];
            if(heightsetProd<prod.drawHeight){
              heightsetProd=prod.drawHeight
            }
          }

          let sortlowxprods = ele.sort((a,b) => a.x - b.x);
          let lowprodx = roundOffDecimal(sortlowxprods[0].x,2);
          let highprodx = roundOffDecimal((sortlowxprods[(sortlowxprods.length - 1)].x + sortlowxprods[(sortlowxprods.length - 1)].drawWidth),2);

          var obj = {
            rank: ele[0].shelfrank,
            heighestdrawingProduct: heightsetProd,
            selectedProducts: ele,
            lowProdX: lowprodx,
            highProdX: highprodx,
          }
          slevtedShelves.push(obj)
        }
      }
      return slevtedShelves
    }
    
    //#PDU-SM10 - check if allow to resize or move rect
    checkAllowMoveResize = (event, isoppside, isend, isychange) => {
      
      let oriblockobj = this.state.bkpBlockObj;
      const blockobj = this.state.selectBlockObj;
  
      //if resize/move allowed
      let isallowchange = {isallow: false};
  
      if(!isoppside){
        if(event.x > oriblockobj.x && event.x < ((oriblockobj.x + oriblockobj.drawWidth) - 10)){
          isallowchange.isallow = true;
        }
      } else{
        if(event.x < (oriblockobj.x + oriblockobj.drawWidth) && event.x > (oriblockobj.x + 10)){
          isallowchange.isallow = true;
        }
      }
      
      if(isend && isallowchange.isallow){
        //adjust x
        for (let i = 0; i < oriblockobj.drawingProducts.length; i++) {
          const prodlocation = oriblockobj.drawingProducts[i];
          
          if(isychange){
            
            if(prodlocation.y <= event.y && (prodlocation.y + prodlocation.drawHeight) >= event.y){
              if(!isoppside){
                let ygap = (prodlocation.y - blockobj.y);
                blockobj.drawHeight = (blockobj.drawHeight - ygap);
                blockobj.height = (blockobj.drawHeight / this.props.displayratio);
  
                blockobj.y = prodlocation.y;
              } else{
                blockobj.drawHeight = ((prodlocation.y + prodlocation.drawHeight) - oriblockobj.y);
                blockobj.height = (blockobj.drawHeight / this.props.displayratio);
              }
            }
          } else{
            if(prodlocation.x <= event.x && (prodlocation.x + prodlocation.drawWidth) >= event.x){
              if(!isoppside){
                //left
                let xgap = (prodlocation.x - blockobj.x);
                blockobj.drawWidth = (blockobj.drawWidth - xgap);
                blockobj.width = (blockobj.drawWidth / this.props.displayratio);
  
                blockobj.x = prodlocation.x;
              } else{
                blockobj.drawWidth = ((prodlocation.x + prodlocation.drawWidth) - this.state.selectBlockObj.x);
                blockobj.width = (blockobj.drawWidth / this.props.displayratio);
              }
            }
          }
        }
        //filter inside blockobj product locations
        blockobj.newDrawingProducts = oriblockobj.drawingProducts.filter( xitem => 
          xitem.x >= blockobj.x && (xitem.x + xitem.drawWidth) <= (blockobj.x + blockobj.drawWidth) &&
          xitem.y >= blockobj.y && (xitem.y + xitem.drawHeight) <= (blockobj.y + blockobj.drawHeight)
        );
        
        if(!isoppside){
          if(isychange){
            const me = d3.select(this["rsy_top"]);
            me.attr('y', blockobj.y);
          } else{
            const me = d3.select(this["rsx_left"]);
            me.attr('x', blockobj.x);
          }
          
        } else{
          if(isychange){
            const me = d3.select(this["rsy_bottom"]);
            me.attr('y', (blockobj.y + blockobj.drawHeight));
          } else{
            const me = d3.select(this["rsx_right"]);
            me.attr('x', (blockobj.x + blockobj.drawWidth));
          }
        }
  
        this.setState({ selectBlockObj: blockobj });
      }
  
      //console.log(isallowchange);
      return isallowchange;
    }
    checkAllowinsideField=()=>{

    }
    //find which shelve product moving and validate is it can add to shelve
    onDragGuidline = (evt,cx,cy) => {
      if(this._guideTimeout){ 
        clearTimeout(this._guideTimeout); 
      
        if(this.props.isFirstTimeDrawguid){
          this.props.setPreviewGuid(false, null, null, true, []);
        }
      }

      this._guideTimeout = setTimeout(() => {
        this.Setguidline(evt,cx,cy);
      }, 200);
    }

    Setguidline=(evt,cx,cy)=>{
      var props={
        evt:evt,cx:cx,cy:cy,selectBlockObj:this.state.selectBlockObj,
        mapFields:this.props.mapFields,
        mapCatRects:this.props.mapCatRects,
        mapproductList:this.props.mapproductList,
        setPreviewGuid:this.props.setPreviewGuid,
        updateGhostObjDetails:this.props.updateGhostObjDetails,
      }
      setGuidlineComman(props)
    }
    
    //#PDU-SM11 - update new block changes and save main object
    updateSaveObj = (evt,cx,cy) => {
      let checkSaftyMargin = 3;
      let dragStartXY = this._dragStartXY;

      if(dragStartXY.x !== cx || dragStartXY.y !== cy){
        let historydata = null;
        let movingObj = structuredClone(this.state.selectBlockObj);
        let dropallow = true;

        var MOStartX = roundOffDecimal(cx,2);
        var MOStartY = roundOffDecimal(cy,2);
        var MOEndX = roundOffDecimal((cx + movingObj.drawWidth),2);
        var MOEndY = roundOffDecimal((cy + movingObj.drawHeight),2);
  
        var containElem = elmAccordingtoXY(cx,cy,movingObj.drawWidth,movingObj.drawHeight,this.props.mapFields,this.props.mapCatRects)

        var selectingField = containElem.field;
        
        if(containElem.isInsideShelf&& selectingField){
          var fieldStartX = roundOffDecimal(selectingField.x,2);
          var fieldStartY = roundOffDecimal(selectingField.y,2);
          var fieldEndX = roundOffDecimal((selectingField.x+selectingField.drawWidth),2);
          var fieldEndY = roundOffDecimal((selectingField.x+selectingField.drawHeight),2);
         
          let isinsidefield = false;
          //check moving box is inside field
          if((fieldStartX < MOStartX && fieldEndX > MOEndX) && (fieldStartY < MOStartY && fieldEndY > MOEndY)){
            isinsidefield = true;
          } else{
            if(fieldStartY < MOStartY && fieldEndY > MOEndY){
              //if item x1 is less than field x1 and item x2 not greater than field x2
              
              if(fieldStartX > MOStartX && fieldEndX > MOEndX){
                MOStartX = fieldStartX;
                isinsidefield = true;
              }
              //if item x1 is greater than field x1 and item x2 not less than field x2
              if(fieldStartX < MOStartX && fieldEndX < MOEndX){
                MOStartX = roundOffDecimal((fieldEndX - movingObj.drawWidth),2);
                isinsidefield = true;
              }
            }

            //if block inside field but not from bottom of field
            if((fieldStartX < MOStartX && fieldEndX > MOEndX) && fieldStartY < MOStartY){
              MOStartY = roundOffDecimal((fieldEndY - selectingField.drawHeight),2);
              MOEndY = roundOffDecimal(fieldEndY,2);
              isinsidefield = true;
            }
          }
          
          //if is it inside field
          if(isinsidefield){
            historydata=JSON.parse(JSON.stringify(this.props.mapproductList))
            
  
            var existingProducts = JSON.parse(JSON.stringify(this.props.mapproductList));
            let changefield = this.props.mapFields[selectingField.key];
            //console.log("loc2");
            var containProds = GetContainingProdsByBox(MOStartX , MOStartY, MOEndX, MOEndY, existingProducts, changefield, false, null, [], true);
            // console.log("loc12",MOStartX , MOStartY, MOEndX, MOEndY, existingProducts, changefield);
            let lowestprodx = MOStartX;
            let cutshelfs = []; 
            let droppingXProd = null; //to find prod available in dropping x1 position
            let isDropPosBetweenEnd = false;
            let isRightSideDropXProd = false;

            if(containProds.selectedProds&&containProds.selectedProds.length>0){
              var notDeletedContainProds = containProds.selectedProds.filter(f => !f.isDelete);
  
              for (let p = 0; p < notDeletedContainProds.length; p++) {
                const prod = notDeletedContainProds[p];
                // movingObj.selectedshelves.forEach(ele => {
                  for (let j = 0; j < movingObj.selectedshelves.length; j++) {
                    const ele = movingObj.selectedshelves[j];
                    var ishaveinSlectedshleves=ele.selectedProducts.find(x=>x.id===prod.id)
                      //check save moving produtcs not cutting
                      if(ishaveinSlectedshleves === undefined){
                        let prodstartx = (prod.x);
                        
                        let checkprodwidth = (((prod.drawWidth / 3) > 8)?(prod.drawWidth / 3):(prod.drawWidth / 2));
                        let prodmiddlex = (prod.x + checkprodwidth);
                        
                        if(lowestprodx > prodstartx && lowestprodx < prodmiddlex){
                          lowestprodx = prod.x;
                        }
                        
                        //left side
                        let prodendx = roundOffDecimal((prod.x + prod.drawWidth),2);
                        if((prod.x <= MOStartX && MOStartX <= prodendx)){
                          droppingXProd = prod;

                          let lowSaftyStartX = (MOStartX - checkSaftyMargin);
                          let highSaftyStartX = (MOStartX + checkSaftyMargin);

                          if(lowSaftyStartX <= prodendx && highSaftyStartX >= prodendx){
                            isDropPosBetweenEnd = true;
                          }
                        }

                        //right side
                        if(!droppingXProd && (prod.x <= MOEndX && MOEndX <= (prod.x + prod.drawWidth))){
                          droppingXProd = prod;
                          isRightSideDropXProd = true;

                          let lowSaftyEndX = (MOEndX - checkSaftyMargin);
                          let highSaftyEndX = (MOEndX + checkSaftyMargin);

                          if(lowSaftyEndX <= prodstartx && highSaftyEndX >= prodstartx){
                            isDropPosBetweenEnd = true;
                          }
                        }
                      }
                  }
                  
                // });
               
              }
            }
  
            let containshelfs = (selectingField.contain_shelfs?selectingField.contain_shelfs:[]);
            
            //if dropping position x not have product find last left product x to drop
            let isRightFieldUpdated = false;
            if(!droppingXProd){
              lowestprodx = getSnappingLocation(lowestprodx, selectingField, existingProducts, movingObj, containshelfs);
            }

            lowestprodx = (
              droppingXProd && isDropPosBetweenEnd && isRightSideDropXProd?(droppingXProd.x - movingObj.drawWidth):
              droppingXProd && isDropPosBetweenEnd?(droppingXProd.x + droppingXProd.drawWidth):
            lowestprodx);

            //if end x is more than field end x
            let checkheighstx = (lowestprodx + movingObj.drawWidth);
            //left side
            if(lowestprodx <= selectingField.x){
              lowestprodx = selectingField.x;
            }

            //right side
            if(checkheighstx >= (selectingField.x+selectingField.drawWidth)){
              lowestprodx = ((selectingField.x+selectingField.drawWidth) - movingObj.drawWidth);
            }

            var maxEndX = 0; var maxY = 0; var maxEndY = 0;
            for (let m = 0; m < movingObj.selectedshelves.length; m++) {
              const changeshelf = movingObj.selectedshelves[m];
              
              //if found
              if(containshelfs[m]){
                //check shelf is lager than highest product in shelve line
                if((containshelfs[m].drawHeight<changeshelf.heighestdrawingProduct
                  // ||containshelfs[m].drawHeight===changeshelf.heighestdrawingProduct
                  )
                  ){
                  dropallow = false
                  //dont drop 
                  break
                }
                let curshelfitemy = (containshelfs[m]?(containshelfs[m].y + containshelfs[m].drawHeight):0);
                //dragfromcat
                this.props.TouchedCatListUpdate(changeshelf.selectedProducts[0].categoryRectId)
                for (let k = 0; k < changeshelf.selectedProducts.length; k++) {
                  const changeproditem = changeshelf.selectedProducts[k];
                  
                  let gapbetweenoribox = (changeproditem.x - movingObj.x);

                  changeproditem["x"] = (lowestprodx + gapbetweenoribox);
                  changeproditem["y"] = (curshelfitemy - changeproditem.drawHeight);
                  changeproditem["shelfrank"] = containshelfs[m].rank;
                  changeproditem["field_custom_id"] = containshelfs[m].field_custom_id;
                  changeproditem["categoryRectId"] = containElem.catrect.catrectId;
                  
                  existingProducts[changeproditem.prodidx] = changeproditem;
                  existingProducts[changeproditem.prodidx]["isDelete"] = false;
                  
                  if(maxY<changeproditem.y){
                    maxY=changeproditem.y
                    maxEndY=changeproditem.y+changeproditem.drawHeight;
                  }
  
                  let curprodendx = (changeproditem.x + changeproditem.drawWidth);
                  if(curprodendx > maxEndX){
                    maxEndX = curprodendx
                  }
                } 
               
              }
              
            }
            
            var newMOEndY = roundOffDecimal(maxEndY - this.props.checkSaftyMargin,2);
            // var saftyMargintoStart=1
            
            //console.log("loc3"); +saftyMargintoStart)
            var ccontainProds = GetContainingProdsByBox(lowestprodx, MOStartY, maxEndX, newMOEndY, this.props.mapproductList, changefield, true, movingObj, containshelfs);
            // console.log(ccontainProds);

            // console.log("loc14",(lowestprodx+saftyMargintoStart), MOStartY, maxEndX, newMOEndY, this.props.mapproductList, changefield, true, movingObj, containshelfs);
            if(dropallow){
              if(historydata!==null){
                this.props.fieldHistoryAdd(historydata,1);
              }
              let isruleupdating = false;
              //removingcutting prod
              if(ccontainProds.selectedProds&&ccontainProds.selectedProds.length>0){
                var cnotDeletedContainProds = ccontainProds.selectedProds.filter(f => !f.isDelete);
                
                for (let p = 0; p < cnotDeletedContainProds.length; p++) {
                  const prod = cnotDeletedContainProds[p];
                  // console.log(prod.x);
                  prod["startingPointDraw"]=prod.x
                  prod["startingPoint"]=prod.x/this.props.displayratio
                  prod.isNew= true
                  prod.isDelete= false
                  let isincontainshelfs = containshelfs.findIndex(l => l.rank === prod.shelfrank);
  
                  if(isincontainshelfs > -1){
                    var ishaveinSelectedshleves = movingObj.newDrawingProducts.find(x => x.id === prod.id);
                    //check save moving produtcs not cutting
                    if(ishaveinSelectedshleves === undefined){
                      let findshelfitemidx = cutshelfs.findIndex(x => x.shelfrank === prod.shelfrank);
  
                      if(findshelfitemidx > -1){
                        cutshelfs[findshelfitemidx].products.push(prod);
                      } else{
                        cutshelfs.push({ shelfrank: prod.shelfrank, products: [prod] });
                      }
                      
                      existingProducts[prod.prodidx]["isDelete"] = true;
                      
                      if(existingProducts[prod.prodidx].subcategory && existingProducts[prod.prodidx].subcategory.type === catRectEnums.rule){
                          isruleupdating = true;
                      }
                    } 
                  }
                }
              }
  
              const arrayHashmap = cutshelfs.reduce((obj, item) => {
                obj[item.shelfrank] ? obj[item.shelfrank].products.push(...item.products) : (obj[item.shelfrank] = { ...item });
                return obj;
              }, {});
              
              const mergedArray = Object.values(arrayHashmap);
              var selcutlist={
                groupUUID: uuidv4(),isNew:true, isDelete: false, mode:"cut" ,uom:containshelfs[0].uom,shelf:mergedArray
              }
              //drop to cat update touchedcat list
              this.props.TouchedCatListUpdate(containElem.catrect.catrectId)
  
              this.props.updateProductList(existingProducts, isruleupdating);
              this.props.updateCutList(selcutlist);
              // console.log(cutshelfs);
              this.setState({selectBlockObj:null})
            }else{
              alertService.error(i18n.t("SOME_PRoD_HEIGHT_EXCEED_SELECTED_SHELF_HEIGHT"),4000);
              this.resetToOriginalState()
              clearTimeout(this._guideTimeout); 
            }
            
  
          }else{
            this.resetToOriginalState()
          }
        }else{
          this.resetToOriginalState()
        }
        
        this.props.setPreviewGuid(true,null,selectingField)
      }
    }
    //#PDU-SM12
    resetToOriginalState = () => {
      let resetobj = JSON.parse(JSON.stringify(this.state.bkpBlockObj));
      let blockobj = this.state.selectBlockObj;
      const me = d3.select(this["LM01"]);
      me.attr('x', resetobj.x);
      me.attr('y', resetobj.y);
  
      blockobj.x = resetobj.x;
      blockobj.y = resetobj.y;

      this.setState({ selectBlockObj: blockobj });
    }
    
    render() {
        let blockobj = this.state.selectBlockObj;
        let ghostobj = this.props.ghostWrapperObj;
        
        return <g>
                  <rect onMouseDown={(e)=>this.props.handleBlockContextMenu(e,true,blockobj?blockobj.x:0,blockobj?blockobj.y:0,blockobj?blockobj.drawWidth:0,blockobj?blockobj.drawHeight:0,blockobj.drawingProducts)}
                   x={blockobj?blockobj.x:0} y={blockobj?blockobj.y:0} width={ghostobj?ghostobj.width:blockobj?blockobj.drawWidth:0} height={ghostobj?ghostobj.height:blockobj?blockobj.drawHeight:0} 
                  pointerEvents="all" fill="green" fillOpacity={0.3} ref={(r) => this["LM01"] = r} />
        
                  {/* <rect x={blockobj?blockobj.x:0} className="resize-controls-y" ref={(r) => this["rsx_left"] = r} y={blockobj?blockobj.y:0} width={"3"} height={blockobj?blockobj.drawHeight:0} fill="green" fillOpacity={"0.6"} />
                  <rect x={blockobj?((blockobj.x + blockobj.drawWidth) - 3):0} className="resize-controls-y" ref={(r) => this["rsx_right"] = r} y={blockobj?blockobj.y:0} width={"3"} height={blockobj?blockobj.drawHeight:0} fill="green" fillOpacity={"0.6"} />
                 */}
              </g>
    }
  }

  export function setGuidlineComman(props){
    // var evt=props.evt
    var cx = structuredClone(props.cx);
    var cy = structuredClone(props.cy);
    // console.log(cx, cy);
    
    var selectBlockObj = structuredClone(props.selectBlockObj);
    var mapCatRects = props.mapCatRects;
    var mapFields = props.mapFields;
    var mapproductList = props.mapproductList;

    var previewShelves = [];
    let movingObj = JSON.parse(JSON.stringify(selectBlockObj));
    // console.log(movingObj);
    var MOStartX = roundOffDecimal(cx,2);
    var MOStartY = roundOffDecimal(cy,2);
    var MOEndX = roundOffDecimal((cx + movingObj.drawWidth),2);
    var MOEndY = roundOffDecimal((cy + movingObj.drawHeight),2);

    var containElem = elmAccordingtoXY(cx,cy,movingObj.drawWidth,movingObj.drawHeight,mapFields,mapCatRects);
    // console.log(props, containElem);

    let ghostobj = { width: 0, height: 0 };

    var selectingField = containElem.field;
    if(selectingField){
      var fieldStartX = roundOffDecimal(selectingField.x,2);
      var fieldStartY = roundOffDecimal(selectingField.y,2);
      var fieldEndX = roundOffDecimal((selectingField.x+selectingField.drawWidth),2);
      var fieldEndY = roundOffDecimal((selectingField.x+selectingField.drawHeight),2);
      
      let isinsidefield = false;
      //check inside field
      if((fieldStartX < MOStartX && fieldEndX > MOEndX) && (fieldStartY < MOStartY && fieldEndY > MOEndY)){
        isinsidefield = true;
      } else{
        if(fieldStartY < MOStartY && fieldEndY > MOEndY){
          //if item x1 is less than field x1 and item x2 not greater than field x2
          
          if(fieldStartX > MOStartX && fieldEndX > MOEndX){
            MOStartX = fieldStartX;
            isinsidefield = true;
          }
          //if item x1 is greater than field x1 and item x2 not less than field x2
          if(fieldStartX < MOStartX && fieldEndX < MOEndX){
            MOStartX = roundOffDecimal((fieldEndX - movingObj.drawWidth),2);
            isinsidefield = true;
          }
        }

        //if block inside field but not from bottom of field
        if((fieldStartX < MOStartX && fieldEndX > MOEndX) && fieldStartY < MOStartY){
          cy = roundOffDecimal((fieldEndY - selectingField.drawHeight),2);
          MOStartY = roundOffDecimal((fieldEndY - selectingField.drawHeight),2);
          MOEndY = roundOffDecimal(fieldEndY,2);
          isinsidefield = true;
        }
      }
      
      let previewprodlist = [];
      if(isinsidefield){
        var existingProducts = JSON.parse(JSON.stringify(mapproductList));
        let changefield = mapFields[selectingField.key];
        
        // console.log("loc1");
        let containProds = GetContainingProdsByBox(MOStartX , MOStartY, MOEndX, MOEndY, existingProducts, changefield, false, null, [], true);
        // console.log(containProds);
        
        let lowestprodx = MOStartX;
        let highestprodx2 = roundOffDecimal((lowestprodx + movingObj.drawWidth),2);
        
        // let cutshelfs = []; 
        let droppingXProd = null; //to find prod available in dropping x1 position
        if(containProds.selectedProds&&containProds.selectedProds.length>0){
          var notDeletedContainProds = containProds.selectedProds.filter(f => !f.isDelete);
          
          for (let p = 0; p < notDeletedContainProds.length; p++) {
            const prod = notDeletedContainProds[p];
            
              for (let j = 0; j < movingObj.selectedshelves.length; j++) {
                const ele = movingObj.selectedshelves[j];
                var ishaveinSlectedshleves = ele.selectedProducts.find(x=>x.id===prod.id)
                //check save moving produtcs not cutting
                if(ishaveinSlectedshleves === undefined){
                  let prodstartx = (prod.x);
                  let checkprodwidth = (((prod.drawWidth / 3) > 8)?(prod.drawWidth / 3):(prod.drawWidth / 2));
                  let prodmiddlex = (prod.x + checkprodwidth);
                  
                  if(lowestprodx > prodstartx && lowestprodx < prodmiddlex){
                    lowestprodx = prod.x;
                    highestprodx2 = roundOffDecimal((lowestprodx + movingObj.drawWidth),2);
                  }

                  //left side
                  if(prod.x <= MOStartX && MOStartX <= roundOffDecimal((prod.x + prod.drawWidth),2)){
                    droppingXProd = prod;
                  }

                  //right side
                  if(!droppingXProd && (prod.x <= MOEndX && MOEndX <= roundOffDecimal((prod.x + prod.drawWidth),2))){
                    droppingXProd = prod;
                  }

                  //add lower than max dropping x2 products
                  let prodx2 = roundOffDecimal((prod.x + prod.drawWidth),2);
                  if(prodx2 <= highestprodx2){
                    previewprodlist.push(prod);
                  }
                }
              }
          }
        }
        
        let containshelfs = (selectingField.contain_shelfs?selectingField.contain_shelfs:[]);

        //if dropping position x not have product find last left product x to drop
        if(!droppingXProd){
          lowestprodx = getSnappingLocation(lowestprodx, selectingField, existingProducts, movingObj, containshelfs);
        }
        
        //reset guidlines
        containshelfs.forEach(conshlf => {
          conshlf.previewguid={startX:-1,endX:-1}
        });
      
        for (let m = 0; m < movingObj.selectedshelves.length; m++) {
          const changeshelf = movingObj.selectedshelves[m];
          var maxEndX = 0; var maxY = 0; //var maxEndY = 0;
          var stratingXofshelvf=0
          //if found
          if(containshelfs[m]){
            
            let curshelfitemy = (containshelfs[m]?(containshelfs[m].y + containshelfs[m].drawHeight):0);
            for (let k = 0; k < changeshelf.selectedProducts.length; k++) {
              const changeproditem = changeshelf.selectedProducts[k];
              
              let gapbetweenoribox = (changeproditem.x - movingObj.x);
              //only first time
              if(k===0){
                stratingXofshelvf=(lowestprodx + gapbetweenoribox);
              }
              
              changeproditem["x"] = (lowestprodx + gapbetweenoribox);
              changeproditem["y"] = (curshelfitemy - changeproditem.drawHeight);
              changeproditem["shelfrank"] = containshelfs[m].rank;
              
              existingProducts[changeproditem.prodidx] = changeproditem;
              existingProducts[changeproditem.prodidx]["isDelete"] = false;
              if(maxY<changeproditem.y){
                maxY=changeproditem.y
                // maxEndY=changeproditem.y+changeproditem.drawHeight;
              }

              let curprodendx = (changeproditem.x + changeproditem.drawWidth);
              if(curprodendx > maxEndX){
                maxEndX = curprodendx
              }
              
            } 

            // console.log(stratingXofshelvf, maxEndX);
            containshelfs[m]["previewguid"] = { startX: stratingXofshelvf, endX: maxEndX };
            // console.log(structuredClone(containshelfs[m]));

            if(containshelfs[m].previewguid.startX > -1){
              let gapbetweenguidelines = (containshelfs[m].previewguid.endX - containshelfs[m].previewguid.startX);

              ghostobj.width = (gapbetweenguidelines > ghostobj.width?gapbetweenguidelines:ghostobj.width);
              ghostobj.height += (containshelfs[m].drawHeight + containshelfs[m].drawGap);
            }
          }
          
          
        }
        //checking inside shelf or not
        if(containElem.isInsideShelf){
          previewShelves = structuredClone(containshelfs);
        }
        
        
      } else{
        props.setPreviewGuid(true);
      }

      props.updateGhostObjDetails(ghostobj);
      props.setPreviewGuid(false, previewShelves, selectingField, false, previewprodlist);

    } else{
      props.setPreviewGuid(true);
    }

  }
  export function BlockContextMenu(props) {
    var xPos = props.xpos; //x position
    var yPos = props.ypos; //y position
    
    //handle click a button.  type: 1-delete,2-close,3-cut
    const handleClick = (type,event) => {
        if(type === 1){
            props.handleBlockDelete(false,true);
        } else if(type === 3){
          props.handleBlockCut();
        } else if(type === 5){
          props.handleBlockCut(true);
        } else
        {
            props.handlclose();
        }
    }
    
    return (<div className="rect-context-menu" onContextMenu={(e)=>{ e.preventDefault()}} style={{ top: yPos, left:  props.isRTL==="rtl"?(xPos-40):(xPos+5), }}>
              <ul className="text-center">
                  <li onClick={() => handleClick(1)}>{i18n.t("btnnames.delete")}</li><hr/>
                  <li onClick={() => handleClick(5)}>{i18n.t("COPY")}</li><hr/>
                  <li onClick={() => handleClick(3)}>{i18n.t("CUT")}</li><hr/>
                  <li onClick={() => handleClick(2)}>{i18n.t("btnnames.close")}</li>
              </ul>
            </div>
            );
  }
  
  export class NoSimProductsComp extends React.Component{
    constructor(props){
      super(props);

      this.state = {
        isListViewActive: "LIST",
        isdropdownopen:false,
      }
    }

    setisListViewActive = (ctype) =>{
      this.setState({ isListViewActive: ctype });
    }
    showWhyNotEligible=(prod)=>{
      //check reson not undifine
      var icon =<></>
      var nonsimreson=prod.notSimulatedReason
      // nonsimreson="none"
      if(nonsimreson){
        if(nonsimreson===notSimulatedReason.none){
          icon =<span title={this.props.t("NO_REASON")}><FeatherIcon color="red" icon="slash" size={14} /></span>
        }else
        if(nonsimreson===notSimulatedReason.heightIssue){
          icon =<span title={this.props.t("HEIGHT_NOT_ENOUGH")}><FeatherIcon color="red" icon="arrow-up-circle" size={14} /></span>
        }else
        if(nonsimreson===notSimulatedReason.minQtyIssue){
          icon =<span title={this.props.t("MIN_QTY")} style={{color:"red"}}>Qty</span>
        }
        else
        if(nonsimreson===notSimulatedReason.noEnoughSpace){
          icon =<span title={this.props.t("NOT_ENOGH_SPACE")} style={{color:"red"}}><CodeSquareIcon size={14} /></span>
        }else
        if(nonsimreson===notSimulatedReason.noTagMatching){
          icon =<span title={this.props.t("NO_TAG_MATCHING")}><FeatherIcon color="red" icon="tag" size={14} /></span>
        }
      }
      

      return icon
    }
    onToggleHandler = (isOpen) => {
         this.setState({isdropdownopen:isOpen})
    }
    render(){
      let filtercategoryList = JSON.parse(JSON.stringify(this.props.nonsimFilter_categoryList));
      filtercategoryList[0] = {value:-1, label:this.props.t("NONE")};
      let filterBrnadList = JSON.parse(JSON.stringify(this.props.nonsimFilter_brandsList));
      filterBrnadList[0] = {value:-1, label:this.props.t("NONE")};
      let filterSupplierList = JSON.parse(JSON.stringify(this.props.nonsimFilter_supplierList));
      filterSupplierList[0] = {value:-1, label:this.props.t("NONE")};
      let filterSubcategoryList = JSON.parse(JSON.stringify(this.props.nonsimFilter_subcategoryList));
      filterSubcategoryList[0] = {value:-1, label:this.props.t("NONE")};
      return <Col>
        <Col className='filter-tags'>
            <Row >
              {this.props.selectedNonSimFilterCat.value>0?<TooltipWrapper placement="bottom" text=  {this.props.selectedNonSimFilterCat.label}>
                <Col className={"item" }>
                  <span className='lable'>C: {this.props.selectedNonSimFilterCat.label}</span>
                  <span className='close' onClick={()=> this.props.togglenonSimFilter({value:-1, label:this.props.t("NONE")},"cat")}><XIcon size={15} /></span>
                </Col>
              </TooltipWrapper>:<></>}
              {this.props.selectedNonSimFiltersubCat.value>0?<TooltipWrapper placement="bottom" text=  {this.props.selectedNonSimFiltersubCat.label}>
                <Col className={"item" }>
                <span className='lable'>SC: {this.props.selectedNonSimFiltersubCat.label}</span>
                <span className='close' onClick={()=>this.props.togglenonSimFilter({value:-1, label:this.props.t("NONE")},"subcat")}><XIcon size={15} /></span>
                </Col> 
              </TooltipWrapper>:<></>}
              {this.props.selectedNonSimFilterBrand.value>0?<TooltipWrapper placement="bottom" text=  {this.props.selectedNonSimFilterBrand.label}>
                <Col className={"item" }>
                <span className='lable'>B: {this.props.selectedNonSimFilterBrand.label}</span>
                <span className='close' onClick={()=>this.props.togglenonSimFilter({value:-1, label:this.props.t("NONE")},"brand")}><XIcon size={15} /></span>
                </Col> 
              </TooltipWrapper>:<></>}
              {this.props.selectedNonSimFilterSupp.value>0?<TooltipWrapper placement="bottom" text=  {this.props.selectedNonSimFilterSupp.label}>
                <Col className={"item" }>
                <span className='lable'>S: {this.props.selectedNonSimFilterSupp.label}</span>
                <span className='close' onClick={()=>this.props.togglenonSimFilter({value:-1, label:this.props.t("NONE")},"supllier")}><XIcon size={15} /></span>
                </Col> 
              </TooltipWrapper>:<></>}
            </Row>
        </Col>
        <Col className='searchprodBox'>
        
          {(this.state.isListViewActive!==null&&this.props.nonfilteredNonEProducts&&this.props.nonfilteredNonEProducts.length>0&&(this.props.nonfilteredNonEProducts.filter(p=>p.isAdded!==true).length>0)?<>
            <div className='filter-sec'>
              <InputGroup size="sm" className="mb-3 input-search">
                  <InputGroup.Text id="inputGroup-sizing-sm"><SearchIcon size={18}/></InputGroup.Text>
                  <Form.Control id="filterprodtxt" aria-label="Small" value={this.props.noSim_filter} placeholder={this.props.t('srchproduct')} aria-describedby="inputGroup-sizing-sm" onChange={e => this.props.handleFilterNoEProducts(e.target.value)}/>
              </InputGroup>
              <Dropdown className='morefilterbtn nonfim-filter' show={this.state.isdropdownopen} onToggle={(isOpen, e, metadata) => this.onToggleHandler(isOpen, e, metadata)}>
                <Dropdown.Toggle variant="outline-primary" size='sm' id="dropdown-basic">
                    <div className='Fbutton'><FilterIconNew  /></div>
                    {(parseInt(this.props.selectedNonSimFilterCat.value)>0||parseInt(this.props.selectedNonSimFiltersubCat.value)>0||parseInt(this.props.selectedNonSimFilterBrand.value)>0||parseInt(this.props.selectedNonSimFilterSupp.value)>0)?
                    <div className='red-dot-more-filterscomman'></div>
                    :<></>}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Col className='prodlist-container nonsimfilter-container'>
                    <Row>
                      <Col className="form-subcontent">
                          <label>{this.props.t('category')}</label>
                          <Select 
                              placeholder={this.props.t("category")} 
                              options={filtercategoryList} 
                              onChange={(e) => this.props.togglenonSimFilter(e,"cat")} 
                              value={filtercategoryList.filter(option => option.value === this.props.selectedNonSimFilterCat.value)} 
                              className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                              maxMenuHeight={200}    
                              />
                      </Col>
                      <Col className="form-subcontent">
                          <label>{this.props.t('subcategory')}</label>
                          <Select 
                          placeholder={this.props.t("subcategory")} 
                          options={filterSubcategoryList} 
                          onChange={(e) => this.props.togglenonSimFilter(e,"subcat")} 
                          value={filterSubcategoryList.filter(option => option.value === this.props.selectedNonSimFiltersubCat.value)} 
                          className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                          maxMenuHeight={200}    
                                      />
                      </Col>
                    </Row>
                    <Row>
                    <Col className="form-subcontent">
                      <label>{this.props.t('brand')}</label>
                          <Select 
                          placeholder={this.props.t("brand")} 
                          options={filterBrnadList} 
                          onChange={(e) =>  this.props.togglenonSimFilter(e,"brand")} 
                          value={filterBrnadList.filter(option => option.value ===this.props.selectedNonSimFilterBrand.value)} 
                          className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                          maxMenuHeight={200}    
                          />
                      </Col>
                      <Col className="form-subcontent">
                          <label>{this.props.t('suplable')}</label>
                          <Select 
                          placeholder={this.props.t("suplable")} 
                          options={filterSupplierList} 
                          onChange={(e) => this.props.togglenonSimFilter(e,"supllier")} 
                          value={filterSupplierList.filter(option => option.value === this.props.selectedNonSimFilterSupp.value)} 
                          className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                          maxMenuHeight={200}    
                                      />
                      </Col>
                    </Row>
                  </Col>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            
      
            <ButtonGroup className={"pviewchange-list "+(this.props.isRTL=== "rtl"?"float-left":"float-right")}>
                <Button variant="secondary" onClick={() => this.setisListViewActive("LIST")} className={(this.state.isListViewActive==="LIST"?"active":"")}><ListUnorderedIcon size={14} /></Button>
                <Button variant="secondary" onClick={() => this.setisListViewActive("GRID")} className={(this.state.isListViewActive==="GRID"?"active":"")}><DiffAddedIcon size={14}/></Button>
            </ButtonGroup>

              <Col className="col-xs-12 div-con">
                  <h5>{this.props.t('productslist')}
                  ({this.props.nonfilteredNonEProducts.filter(x=>x.isAdded!==true && x.isFilterd!==true && x.barcode && x.productName).length})
                  </h5>
                  <Col xs={12}  className="div-con subprod-list" style={{maxHeight:(this.props.catDivHeight-100)}}>
                    <Row style={this.props.isRTL === "rtl"?{marginRight:"0px",width:"100%"}:{marginLeft:"0px",width:"100%"}}>
                        {(this.props.nonfilteredNonEProducts ? this.props.nonfilteredNonEProducts.map((prod, i) =>
                        
                          { return  (!prod.isAdded && !prod.isFilterd && prod.barcode && prod.productName)?
                          <Col key={i} className={"sub-item"+(this.state.isListViewActive==="LIST"?"":" rectview")} xs={this.state.isListViewActive==="LIST"?12:4}><Col style={{ margin: 5}}>
                            {/* <span className={"editlink "+(prod.rotatetype&&(prod.rotatetype!=="default"&&prod.rotatetype!=="front"?"highred":""))} title={prod.rotatetype?(prod.rotatetype.replace("_"," ")):"default"} onClick={() => this.toggleRotateProd(prod,true)} style={(this.props.isRTL==="rtl"?{left:"35px"}:{right:"35px"})}><IssueReopenedIcon size={14}/></span>
                            <span className="editlink" onClick={() => this.handlePEMView(true,prod,false)}><ArrowSwitchIcon size={14}/></span> */}
                            <ProdRectView t={this.props.t} isRTL={this.props.isRTL} viewtype={this.state.isListViewActive} prod={prod}>
                                <div className="thumb-div" draggable id={prod.id} onClick={()=>this.props.handlePreviewModal(prod,true)} onMouseDown={(e) => {this.props.drawRectCanvas(prod)}} onDragStart={(e) => this.props.dragStart(e, prod)} onDrag={e => this.props.dragProdView(e, prod)} onDragEnd={() => this.props.prodDragEnd()}>
                                  <img key={i} src={prod.imageUrl} className={(prod.width >= prod.height)?"img-resize-ver":"img-resize-hor"} alt=""/>
                                </div>
                              </ProdRectView>
                              {(this.state.isListViewActive==="LIST"?
                                  <>
                                  <CopyToClipboard text={(prod.barcode?prod.barcode:"-")} onCopy={() => this.props.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{(prod.barcode?prod.barcode:"-")}</small></CopyToClipboard>
                                  <small className="nonesimReeson">{this.showWhyNotEligible(prod)}</small>
                                  {prod.isDimensionsChange?<small className="dimention-chnged"> <TooltipWrapper text={this.props.t("DIMENSION_CHNGES_NOT_AFFECTED")}><FeatherIcon icon="alert-triangle" size={16} /></TooltipWrapper></small>:<></>}
                                  <br/>
                                  <div style={{cursor:"pointer"}} onClick={()=>this.props.handleopenDetailmodal(prod)}>
                                  {(prod.productName?prod.productName:"-")}<br/>
                                  <small>{this.props.t("brand")+": "}{(prod.brandName && prod.brandName !== "" && prod.brandName !== "-")?(prod.brandName+" "):(this.props.t("notavailable")+" ")}</small><br/>
                                  <small style={{fontSize:"0.75rem"}}><i>
                                    {this.props.t('width')}: {(prod.width > 0?(roundOffDecimal(prod.width,numOfDecimalsLimit)+""+convertUomtoSym(prod.uom)):"0cm")}, 
                                    {this.props.t('height')}: {prod.height > 0?(roundOffDecimal(prod.height,numOfDecimalsLimit)+""+convertUomtoSym(prod.uom)):"0cm"}</i></small>
                                    </div>
                                  </>:
                              <></>)}
                          </Col></Col>
                          :<div key={i}></div>}
                          ):(<></>)
                        )}
                        {/* {this.state.srchprodsloading?<Col xs={12} className="text-center" style={{marginBottom: "5px"}}><img src={loadinggif} className="img-fluid" style={{height:"20px"}} alt="" /></Col>:<></>} */}
                    </Row>
                    {/* {props.filteredNonEProducts.length < this.state.ptotalresults?
                    <Col xs={12} className="ploadmore-link text-center" onClick={() => {this.loadMoreProds()}}>{this.props.t('btnnames.loadmore')}</Col>:<></>} */}
                  </Col>
                </Col>
              </>:
              <Col style={{paddingTop:"10px"}}><h4 className='text-center' style={{color: "#ccc", marginTop:"2rem"}}>{this.props.t("NO_PRODUCTS_AVAILABLE")}</h4></Col>)}
            </Col>
              
        </Col>;
    }
  }

  function ProdRectView(props) {
    const [show, setShow] = useState(false);
    const target = useRef(null);
    const prod = props.prod;
    const isshowview = (props.viewtype === "LIST"?false:true);
    const trans = props.t;
    return (
      <>
        <div ref={target} onMouseOver={() => setShow(isshowview)} onMouseOut={() => setShow(false)}>
          {props.children}
        </div>
        <Overlay target={target.current} transition={false} show={show} placement={props.isRTL==="rtl"?"left":"right"}>
          {(props) => (
            <Tooltip {...props}>
              <><small style={{fontSize:"0.75rem"}}>{prod.barcode&&prod.barcode}</small><br/>{(prod.brandName&&prod.brandName!==""&&prod.brandName!=="-"?(prod.brandName+" "):(i18n.t("notavailable")+" "))+prod.productName}<br/>
              <small style={{fontSize:"0.75rem"}}><i>{trans?trans('WIDTH'):"Width"} {prod.width+""+convertUomtoSym(prod.uom)}, {trans?trans('HEIGHT'):"Height"} {prod.height+""+convertUomtoSym(prod.uom)}</i></small></>
            </Tooltip>
          )}
        </Overlay>
      </>
    );
  }

  export function DimensionChangedProdComp (props){
    const [productEditWarningsList,setproductEditWarningsList] = useState([]);
    
    useEffect(() => { 
      setproductEditWarningsList(props.productEditWarningsList)
    }, [props.productEditWarningsList]);
    
    const handleFilterProducts = (evt) => { 
      let updList=structuredClone(props.productEditWarningsList)
      let newlist=[]
      let searchTxt = (evt.target.value && evt.target.value.length > 0?evt.target.value:"");
            for (let i = 0; i < updList.length; i++) {
                const nonladprod = updList[i];
                let nonSearchQuery = ((nonladprod.barcode?nonladprod.barcode.toLowerCase():"")+" "+(nonladprod.productName?nonladprod.productName.toLowerCase():""));
                let isnotfiltered=(nonSearchQuery.includes(searchTxt.toLowerCase())  );
                if(isnotfiltered){
                  newlist.push(nonladprod)
                }
            }
            setproductEditWarningsList(newlist)
    }
    return <Col >
      <Col className='searchprodBox'>                    
        {props.productEditWarningsList.length>0?<InputGroup size="sm" className="mb-3 input-search">
            <Form.Control id="filterprodtxt" aria-label="Small" placeholder={props.t('srchproduct')} aria-describedby="inputGroup-sizing-sm" onKeyUp={e => handleFilterProducts(e)}/>
            {/* <InputGroup.Prepend> */}
                <InputGroup.Text id="inputGroup-sizing-sm"><SearchIcon size={18}/></InputGroup.Text>
            {/* </InputGroup.Prepend> */}
        </InputGroup>:<></>}
        {(productEditWarningsList.length>0?<>
              <Col className="col-xs-12 div-con">
                  <h5>{props.t('productslist')} <span className='clearall-dim-prod' onClick={()=>props.handleacknowledgeSimulationWarning()}>{props.t("btnnames.clearall")}</span>
                  </h5>
                 
                  <Col xs={12}  className="div-con subprod-list" style={{maxHeight:(props.catDivHeight-100)}}>
                    <Row style={props.isRTL === "rtl"?{marginRight:"0px",width:"100%"}:{marginLeft:"0px",width:"100%"}}>
                        {(productEditWarningsList ?productEditWarningsList.map((prod, i) =>
                        
                          { return  (!prod.isAdded && !prod.isFilterd && prod.barcode && prod.productName)?
                          <Col key={i} className="sub-item" xs={12}><Col style={{ margin: 5}}>
                            {/* <span className={"editlink "+(prod.rotatetype&&(prod.rotatetype!=="default"&&prod.rotatetype!=="front"?"highred":""))} title={prod.rotatetype?(prod.rotatetype.replace("_"," ")):"default"} onClick={() => this.toggleRotateProd(prod,true)} style={(this.props.isRTL==="rtl"?{left:"35px"}:{right:"35px"})}><IssueReopenedIcon size={14}/></span>
                            <span className="editlink" onClick={() => this.handlePEMView(true,prod,false)}><ArrowSwitchIcon size={14}/></span> */}
                            <ProdRectView t={props.t} isRTL={props.isRTL} viewtype={"LIST"} prod={prod}>
                                {/* onMouseDown={(e) => {props.drawRectCanvas(prod)}} onDragStart={(e) => props.dragStart(e, prod)} onDrag={e => props.dragProdView(e, prod)} onDragEnd={() => props.prodDragEnd()} */}
                                <div className="thumb-div" draggable id={prod.id} onClick={()=>props.handlePreviewModal(prod,true)}>
                                  <img key={i} src={prod.imageUrl} className={(prod.width >= prod.height)?"img-resize-ver":"img-resize-hor"} alt=""/>
                                </div>
                              </ProdRectView>
                                  <>
                                  <CopyToClipboard text={(prod.barcode?prod.barcode:"-")} onCopy={() => props.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{(prod.barcode?prod.barcode:"-")}</small></CopyToClipboard>
                                  <TooltipWrapper placement="bottom" text=  {props.t("REMOVE")}><small onClick={()=>props.handleacknowledgeSimulationWarning(prod)} className="nonesimReeson aknowladge"><FeatherIcon icon="delete" size={16} /></small></TooltipWrapper>
                                  <br/>
                                  <div style={{cursor:"pointer"}} onClick={()=>props.handleopenDetailmodal(prod)}>
                                    {(prod.productName?prod.productName:"-")}<br/>
                                    <small>{props.t("brand")+": "}{(prod.brandName && prod.brandName !== "" && prod.brandName !== "-")?(prod.brandName+" "):(props.t("notavailable")+" ")}</small><br/>
                                    <small style={{fontSize:"0.75rem"}}><i>{props.t('width')}: {(prod.width > 0?(prod.width+""+convertUomtoSym(prod.uom)):"0cm")}, {props.t('height')}: {prod.height > 0?(prod.height+""+convertUomtoSym(prod.uom)):"0cm"}</i></small>
                                  </div>
                                 </>
                             
                          </Col></Col>
                          :<div key={i}></div>}
                          ):(<></>)
                        )}
                        {/* {this.state.srchprodsloading?<Col xs={12} className="text-center" style={{marginBottom: "5px"}}><img src={loadinggif} className="img-fluid" style={{height:"20px"}} alt="" /></Col>:<></>} */}
                    </Row>
                    {/* {props.filteredNonEProducts.length < this.state.ptotalresults?
                    <Col xs={12} className="ploadmore-link text-center" onClick={() => {this.loadMoreProds()}}>{this.props.t('btnnames.loadmore')}</Col>:<></>} */}
                  </Col>
                </Col>
              </>:
              <Col style={{paddingTop:"10px"}}><h4 className='text-center' style={{color: "#ccc", marginTop:"2rem"}}>{props.t("NO_PRODUCTS_AVAILABLE")}</h4></Col>)}
        {/* <Col className="col-xs-12 div-con">
          <h5>{i18n.t('productslist')}</h5>
          <><CopyToClipboard text={(prod.barcode?prod.barcode:"-")} onCopy={() => this.props.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{(prod.barcode?prod.barcode:"-")}</small></CopyToClipboard>
                                  <small className="nonesimReeson">{this.showWhyNotEligible(prod)}</small>
                                  <br/>
                                  {(prod.productName?prod.productName:"-")}<br/>
                                  <small>{this.props.t("brand")+": "}{(prod.brandName && prod.brandName !== "" && prod.brandName !== "-")?(prod.brandName+" "):(this.props.t("notavailable")+" ")}</small><br/>
                                  <small style={{fontSize:"0.75rem"}}><i>{this.props.t('width')}: {(prod.width > 0?(prod.width+""+convertUomtoSym(prod.uom)):"0cm")}, {this.props.t('height')}: {prod.height > 0?(prod.height+""+convertUomtoSym(prod.uom)):"0cm"}</i></small></>
        </Col> */}
      </Col>
    </Col>
  }

  export class SaleCycleComp extends React.Component{
    constructor(props){
      super(props);

      this.state = {
        isdropdownopen:false,
      }
    }

    onToggleHandler = (isOpen) => {
         this.setState({isdropdownopen:isOpen})
    }
    
    render(){
      let filtercategoryList = JSON.parse(JSON.stringify(this.props.scFilter_categoryList));
      filtercategoryList[0] = {value:-1, label:this.props.t("Any")};
      let filterBrnadList = JSON.parse(JSON.stringify(this.props.scFilter_brandsList));
      filterBrnadList[0] = {value:-1, label:this.props.t("Any")};
      let filterSupplierList = JSON.parse(JSON.stringify(this.props.scFilter_supplierList));
      filterSupplierList[0] = {value:-1, label:this.props.t("Any")};
      let filterSubcategoryList = JSON.parse(JSON.stringify(this.props.scFilter_subcategoryList));
      filterSubcategoryList[0] = {value:-1, label:this.props.t("Any")};
      let filterStatusList = JSON.parse(JSON.stringify(this.props.scFilter_statusList));
      filterStatusList[0] = {value:-1, label:this.props.t("Any")};
      return <Col>
        <Col className='filter-tags'>
            <Row >
              {this.props.selectedScFilterCat.value>0?<TooltipWrapper placement="bottom" text=  {this.props.selectedScFilterCat.label}>
                <Col className={"item" }>
                  <span className='lable'>C: {this.props.selectedScFilterCat.label}</span>
                  <span className='close' onClick={()=> this.props.toggleSCFilter({value:-1, label:this.props.t("NONE")},"cat")}><XIcon size={15} /></span>
                </Col>
              </TooltipWrapper>:<></>}
              {this.props.selectedScFiltersubcat.value>0?<TooltipWrapper placement="bottom" text=  {this.props.selectedScFiltersubcat.label}>
                <Col className={"item" }>
                <span className='lable'>SC: {this.props.selectedScFiltersubcat.label}</span>
                <span className='close' onClick={()=>this.props.toggleSCFilter({value:-1, label:this.props.t("NONE")},"subcat")}><XIcon size={15} /></span>
                </Col> 
              </TooltipWrapper>:<></>}
              {this.props.selectedScFilterBrand.value>0?<TooltipWrapper placement="bottom" text=  {this.props.selectedScFilterBrand.label}>
                <Col className={"item" }>
                <span className='lable'>B: {this.props.selectedScFilterBrand.label}</span>
                <span className='close' onClick={()=>this.props.toggleSCFilter({value:-1, label:this.props.t("NONE")},"brand")}><XIcon size={15} /></span>
                </Col> 
              </TooltipWrapper>:<></>}
              {this.props.selectedScFilterSupp.value>0?<TooltipWrapper placement="bottom" text=  {this.props.selectedScFilterSupp.label}>
                <Col className={"item" }>
                <span className='lable'>S: {this.props.selectedScFilterSupp.label}</span>
                <span className='close' onClick={()=>this.props.toggleSCFilter({value:-1, label:this.props.t("NONE")},"supllier")}><XIcon size={15} /></span>
                </Col> 
              </TooltipWrapper>:<></>}
              {parseInt(this.props.selectedScFilterStat.value)!==-1?<TooltipWrapper placement="bottom" text=  {this.props.selectedScFilterStat.label}>
                <Col className={"item" }>
                <span className='lable'>STS: {this.props.selectedScFilterStat.label}</span>
                <span className='close' onClick={()=>this.props.toggleSCFilter({value:-1, label:this.props.t("NONE")},"status")}><XIcon size={15} /></span>
                </Col> 
              </TooltipWrapper>:<></>}
            </Row>
        </Col>

        <Col className='searchprodBox'>
        
          <div className='filter-sec'>
            <InputGroup size="sm" className="mb-3 input-search">
                <Form.Control id="filterprodtxt" aria-label="Small" value={this.props.sc_filter} placeholder={this.props.t('srchproduct')} aria-describedby="inputGroup-sizing-sm" onChange={e => this.props.handleFilterSCProducts(e.target.value)}/>
                <InputGroup.Text id="inputGroup-sizing-sm"><SearchIcon size={18}/></InputGroup.Text>
            </InputGroup>
            <Dropdown className='morefilterbtn nonfim-filter' show={this.state.isdropdownopen} onToggle={(isOpen, e, metadata) => this.onToggleHandler(isOpen, e, metadata)}>
              <Dropdown.Toggle variant="outline-primary" size='sm' id="dropdown-basic">
                  <div className='Fbutton'><FilterIconNew  /></div>
                  {(parseInt(this.props.selectedScFilterCat.value)>0||parseInt(this.props.selectedScFiltersubcat.value)>0||parseInt(this.props.selectedScFilterBrand.value)>0||parseInt(this.props.selectedScFilterSupp.value)>0||parseInt(this.props.selectedScFilterStat.value)>0)?
                  <div className='red-dot-more-filterscomman'></div>
                  :<></>}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Col className='prodlist-container nonsimfilter-container'>
                  <Row>
                    <Col className="form-subcontent">
                        <label>{this.props.t('category')}</label>
                        <Select 
                            placeholder={this.props.t("category")} 
                            options={filtercategoryList} 
                            onChange={(e) => this.props.toggleSCFilter(e,"cat")} 
                            value={filtercategoryList.filter(option => option.value === this.props.selectedScFilterCat.value)} 
                            className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                            maxMenuHeight={200}    
                            />
                    </Col>
                    <Col className="form-subcontent">
                        <label>{this.props.t('subcategory')}</label>
                        <Select 
                        placeholder={this.props.t("subcategory")} 
                        options={filterSubcategoryList} 
                        onChange={(e) => this.props.toggleSCFilter(e,"subcat")} 
                        value={filterSubcategoryList.filter(option => option.value === this.props.selectedScFiltersubcat.value)} 
                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                        maxMenuHeight={200}    
                                    />
                    </Col>
                  </Row>
                  <Row>
                  <Col className="form-subcontent">
                    <label>{this.props.t('brand')}</label>
                        <Select 
                        placeholder={this.props.t("brand")} 
                        options={filterBrnadList} 
                        onChange={(e) =>  this.props.toggleSCFilter(e,"brand")} 
                        value={filterBrnadList.filter(option => option.value ===this.props.selectedScFilterBrand.value)} 
                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                        maxMenuHeight={200}    
                        />
                    </Col>
                    <Col className="form-subcontent">
                        <label>{this.props.t('suplable')}</label>
                        <Select 
                        placeholder={this.props.t("suplable")} 
                        options={filterSupplierList} 
                        onChange={(e) => this.props.toggleSCFilter(e,"supllier")} 
                        value={filterSupplierList.filter(option => option.value === this.props.selectedScFilterSupp.value)} 
                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                        maxMenuHeight={200}    
                                    />
                    </Col>
                    <Col className="form-subcontent">
                        <label>{this.props.t(`SALE_CYCLE`)+' '+this.props.t(`status`)}</label>
                        <Select 
                        placeholder={this.props.t(`status`)} 
                        options={filterStatusList} 
                        onChange={(e) => this.props.toggleSCFilter(e,"status")} 
                        value={filterStatusList.filter(option => option.value === this.props.selectedScFilterStat.value)} 
                        className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                        maxMenuHeight={200}    
                                    />
                    </Col>
                  </Row>
                </Col>
              </Dropdown.Menu>
            </Dropdown>
            <span className="sim-edit-info-icon">
              <PopoverWrapper cusid="sim-edit-pop" trigger={["hover","focus"]} 
                  text={
                      <div className='popover-cont'>
                            <h6>{this.props.t("SALE_CYCLE_LOGIC")}</h6>
                            <div className="formula">
                                <span className="image">
                                  <Image src={SalesCycleIcon}/>
                                </span>
                                <span className="word">
                                  {this.props.t("SALE_CYCLE")}
                                </span>
                                <span className="signs">
                                  =
                                </span>
                                <span className="image">
                                  <Image src={ThreeDQtyIcon}/>
                                </span>
                                <span className="word">
                                  {this.props.t('THREEDQTY')}
                                </span>
                                <span className="signs">
                                  {this.props.isRTL === "rtl" ?')/' : '/('}
                                </span>
                                <span className="image">
                                  <Image src={SaleQtyIcon}/>
                                </span>
                                <span className="word">
                                  {this.props.t('SALEQTY')}
                                </span>
                                <span className="signs">
                                  /
                                </span>
                                <span className="image">
                                  <Image src={DayCountIcon}/>
                                </span>
                                <span className="word">
                                  {this.props.t('DAYCOUNT')}
                                </span>
                                <span className="signs">
                                  {this.props.isRTL === "rtl" ? '(' : ')'}
                                </span>
                            </div>
                      </div>
                  } placement="top">
                  <FeatherIcon icon="info" size={20}/>
              </PopoverWrapper>
            </span>
          </div>
          { this.props.isChainSaleCycle ?
          <div className="chain-level-warn">
            <span className="chain-warn-icon">
                  <Image src={WarnIcon} />
            </span>
            <span className="chain-warn-text">
                  {this.props.t('CAL_CHAIN')} 
            </span>
          </div>
          :<></>}
            {(this.props.nonfilteredSCProducts&&this.props.nonfilteredSCProducts.length>0?
            <>
            <Col className="col-xs-12 div-con">
                <Col xs={12}  className="div-con subprod-list sale-cycle-list">
                  <Row style={this.props.isRTL === "rtl"?{marginRight:"0px",width:"100%"}:{marginLeft:"0px",width:"100%"}}>
                      {(this.props.nonfilteredSCProducts ? this.props.nonfilteredSCProducts.map((prod, i) => {
                        return (// { return  (!prod.isAdded && !prod.isFilterd && prod.barcode && prod.productName)?
                        <Col key={i} style={{ border: this.props.selectedScProductId === prod.productId ? this.props.dmode ? "2px solid #2CC990" : "2px solid #5128A0" : "none", background: this.props.dmode ? "#374658" : "#F2F1FF"}} className={"sub-item"} xs={12}>
                          <Col style={{ margin: 5}}>
                                <>
                                  <div className={"color-strip-"+(prod.salesAvailable ? prod.anomaly==="no" ? "normal" : prod.anomaly==="high" ? "high" : "low"  :"none")}></div>

                                  <ProdRectView t={this.props.t} isRTL={this.props.isRTL} viewtype={"LIST"} prod={prod}>
                                    <div className="thumb-div-sc" id={prod.productId} onClick={()=>this.props.handlePreviewModal(prod,true)}>
                                      <img key={i} src={prod.imageUrl ? prod.imageUrl : DefaultProdImg} className={(prod.width >= prod.height)?"img-resize-ver":"img-resize-hor"} alt=""/>
                                    </div>
                                  </ProdRectView>
                                  <CopyToClipboard text={(prod.productBarcode?prod.productBarcode:"-")} onCopy={() => this.props.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{(prod.productBarcode?prod.productBarcode:"-")}</small></CopyToClipboard>
                                  <span className={"anomaly-value-"+(prod.salesAvailable ? prod.anomaly==="no" ? "normal" : prod.anomaly==="high" ? "high" : "low"  :"none")}>{prod.salesCycle ? prod.salesCycle.toFixed(2) : "-"}</span>
                                  <br/>
                                  <div className="sc-prod-name" style={{cursor:"pointer"}} onClick={()=>this.props.showSelectedSCProduct(prod.productId)}>
                                  {(prod.productName?prod.productName:"-")}<br/>
                                  </div>
                                  <div className="metrics">
                                          <span className="single-metric" title={this.props.t('THREEDQTY')}>
                                            <Image src={MiniThreeDQtyIcon}/>
                                            {prod.prodQty ? prod.prodQty : "-"}
                                          </span>

                                          <span className="single-metric" title={this.props.t('SALEQTY')}>
                                            <Image src={MiniSaleQtyIcon}/>
                                            {prod.salesAvailable ? prod.saleQty : "-"}
                                          </span>

                                          <span className="single-metric" title={this.props.t('DAYCOUNT')}>
                                            <Image src={MiniDayCountIcon}/>
                                            {prod.dayCount}
                                          </span>
                                  </div>
                                </>
                          </Col>
                        </Col>
                      )}
                        // :<div key={i}></div>}
                        ):(<></>)
                      )}
                  </Row>
                </Col>
              </Col>    
            </>:
            <Col style={{paddingTop:"10px"}}><h4 className='text-center' style={{color: "#ccc", marginTop:"2rem"}}>{this.props.t("NO_PRODUCTS_AVAILABLE")}</h4></Col>)}
      </Col>

      </Col>
    }
  }

  export function RuleWarningsComp (props){
    return <Col className='ruleswarn-content' style={{maxHeight:(props.sidebarDivHeight+25)}}>
      
      {props.isRuleWarn && props.isRuleWarn.totalcount > 0?<>
        <Row className='ruletitle-row'>
            <Col xs={8} className="title-col">{props.trans("rules")}</Col>
            <Col xs={2} className="title-col">{props.trans("RULE_PER")}</Col>
            <Col xs={2} className="title-col">{props.trans("SIMULATED_PER")}</Col>
        </Row> 

        {props.mapRulesList.map((citem, cidx) => {
          return <React.Fragment key={cidx}>
            {citem.subCategoryRulePercentageDtos && citem.subCategoryRulePercentageDtos.length > 0?<><Row className="scroll-content">
              {citem.subCategoryRulePercentageDtos.map((subrule, sruledix) => {

                let ruleitemname = ((subrule.level === catRuleEnums.sup && subrule.supplier)?subrule.supplier.supplierName
                  :(subrule.level === catRuleEnums.brand && subrule.brand)?subrule.brand.brandName:"-")
                let mainbarcolor=subrule.ruleState === "danger"?"#bd132a":subrule.ruleState === "warning"?"#dbb427":subrule.ruleState === "default"?"#0eab3a":"none"
                return <React.Fragment key={sruledix}>
                  
                  <Col xs={12} className={'singlerulewarn-contain'+(subrule.ruleState?(" "+subrule.ruleState):"")}>
                    <Row className='rulewarn-wrapper'>
                      <Col xs={8} style={{padding: "0px 5px"}}>
                      <CustomProgressBarForRules text={stringtrim(ruleitemname+" - "+(subrule.level?subrule.level.substring(0,3):""),30)} mainbarcolor={mainbarcolor} mainbarpercentage={subrule.simulatedPercentage} textcolor={"white"} showsubbar="true" subbarpercentage={subrule.rulePercentage} />
                        {/* <div className={'rulewarn-icon'+(subrule.ruleState?(" "+subrule.ruleState):"")}>
                          {subrule.ruleState === "danger"?<FeatherIcon icon="x-square" size={14} />:subrule.ruleState === "warning"?<FeatherIcon icon="alert-octagon" size={14} />:<FeatherIcon icon="check" size={14} />}
                        </div> */}

                        {/* <h6>{ruleitemname}<br/><small>{subrule.level}</small></h6> */}
                      </Col>
                      <Col xs={2} className='simper-wrapper'>
                        <Col className='simper-content'><label>{subrule.rulePercentage}%</label></Col>
                      </Col>
                      <Col xs={2} className='simper-wrapper'>
                        <Col className={'simper-content'+(subrule.ruleState?(" "+subrule.ruleState):"")}><label>{subrule.simulatedPercentage}%</label></Col>  
                      </Col>
                    </Row>
                  </Col>
                </React.Fragment>;
              })}
            </Row></>:<></>}
          </React.Fragment>
        })}
      </>:
      <h5 className='text-center' style={{color: "#ccc", marginTop:"2rem"}}>{props.trans("NO_RULES_AVAILABLE")}</h5>}
      </Col>;
    }

  export function CustomProgressBarForRules(props) {
    return(
        <Col xs={12} className={"custom-progress-bar "+(props.isRTL)}>
            <Col className="name" style={{color:(props.subbarpercentage > 10 && props.textcolor?props.textcolor:"white"),textTransform:"uppercase"}}>{(props.text ? props.text:"")}</Col>
            <Col className="main-bar" style={{width:(props.mainbarpercentage+"%"), background:props.mainbarcolor}}></Col>
            {
                props.showsubbar==="true" || props.showsubbar === true ?
                <Col className="sub-bar" style={{width:(props.subbarpercentage+"%"),opacity:"0.5"}}></Col>
                :<></>
            }
            {
                props.showpercentage ?
                <span className='progress-txt'>{(props.mainbarpercentage+"%")}</span>
                :<></> 
            }
        </Col>
    )
  }

  export function ReplaceProductsTab (props){
    const [imgdropdown, setImgdropdown] = useState(null);
    const [contextMargin, setContextMargin] = useState(0);

    var prod={
      imageUrl:"https://d3ginyfiwc1r8i.cloudfront.net/main/8/7290017088693/854800_W100_100.png",height:12.5,width:32,
      barcode:8080808080,productName: "PRODUCT 197"
    }

    const handleMouseEnter = (evt, val) => {
      let elem = document.getElementById(val);
      let rect = elem.getBoundingClientRect();
      setContextMargin(rect.top);
      
      setImgdropdown(val);
    }

    const handleMouseLeave = () => {
      setImgdropdown(null);
    }
    var {replaceProds}=props
    return <Col className='replacedProd-content'>
      {replaceProds.length > 0?
      <>
       <div className='maindiv' style={{maxHeight:(props.catDivHeight+25)}}>
        {replaceProds.map((rprod,r) => {
          let tooltipid = props.viewSimID;

          return <Col key={r} className='card'>
              <Col style={{display:"flex",justifyContent:"space-between"}}>
                <div >
                  <div className="thumb-div" id={("prev"+r+""+tooltipid)} onMouseEnter={(e) => handleMouseEnter(e, ("prev"+r+""+tooltipid))} onMouseLeave={handleMouseLeave}> 
                    <img  src={rprod.currentProducts[0].imageUrl} className={(prod.width >= prod.height)?"img-resize-ver":"img-resize-hor"} alt=""/>
                    {rprod.replacedProducts.length>1&&<span className='MoreNo' 
                      // style={{left: "98px"}}
                      >{"+"+(rprod.currentProducts.length-1)}</span>}
                      {(imgdropdown===("prev"+r+""+tooltipid))&&
                      <div className="dropdown-content prev" style={{ top: (contextMargin+60)}}>
                      {rprod.currentProducts.length>0?rprod.currentProducts.map((prev,p)=> <div key={p} className='insideboxnameboxcard'>
                          <div className="thumb-div"  >
                            <img  src={prev.imageUrl} className={(prod.width >= prod.height)?"img-resize-ver":"img-resize-hor"} alt=""/>
                          </div>
                          <div className='text'><CopyToClipboard text={prev.barcode} onCopy={() => props.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{prev.barcode}</small></CopyToClipboard>
                          <h2 style={{fontSize:"0.75rem"}}>{prev.productName}</h2>
                          </div>
                        </div>):<></>}
                      </div>
                      }
                  </div>
                </div>
                <div style={{marginTop:"17px"}} className='arrow'><ReplaceProdIconArrow /></div>
                <div >
                  <div className="thumb-div" id={("now"+r+""+tooltipid)} onMouseEnter={(e) => handleMouseEnter(e, ("now"+r+""+tooltipid))} onMouseLeave={handleMouseLeave} >
                    <img  src={rprod.replacedProducts[0].imageUrl} className={(prod.width >= prod.height)?"img-resize-ver":"img-resize-hor"} alt=""/>
                    {rprod.replacedProducts.length>1&&<span className='MoreNo' 
                      // style={{left: "98px"}}
                      >{"+"+(rprod.replacedProducts.length-1)}</span>}
                      {(imgdropdown===("now"+r+""+tooltipid))&&
                      <div className="dropdown-content new" style={{ top: (contextMargin+60)}}>
                        {rprod.replacedProducts.length>0?rprod.replacedProducts.map((now,n)=> <div key={n} className='insideboxnameboxcard'>
                          <div className="thumb-div"  >
                            <img  src={now.imageUrl} className={(now.width >= now.height)?"img-resize-ver":"img-resize-hor"} alt=""/>
                          </div>
                          <div className='text'><CopyToClipboard text={now.barcode} onCopy={() => props.copyToClipboard()}><small style={{fontSize:"0.75rem"}}>{now.barcode}</small></CopyToClipboard>
                          <h2 style={{fontSize:"0.75rem"}}>{now.productName}</h2>
                          </div>
                        </div>):<></>}
                        
                      </div>
                      }
                  </div>
                </div>
              </Col>
            </Col>
          })}
       </div>
      </>
       :
      <h5 className='text-center' style={{color: "#ccc", marginTop:"2rem"}}>{props.trans("NO_REPLACED_PRODS_AVAILABLE")}</h5>} 
      </Col>;
    }

 