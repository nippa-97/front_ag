import React from "react";
import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid'; //unique id

import { checkProductIsInBottom, checkProductThoughBlock, checkThroughProductsTest, elmAccordingtoXY, GetContainingProdsByBox, getSnappingLocation, groupBy, stackProdBlockToTop } from "../additionalcontents";
import { roundOffDecimal } from "../../../../_services/common.service";
import i18n from "../../../../_translations/i18n"; 

export class BlockRectangle extends React.Component {
    constructor(props){
        super(props);

        this._guideTimeout = null;

        this.state = {
            selectBlockObj: null, bkpBlockObj: null,
            droppingShelveIdx: -1, droppingShelveObj: null,
            isviewcmenu: false, contxtmenu: {xpos:0, ypos: 0, xidx: 0, scatidx: 0},

            blockDragStart: { x: 0, y: 0 },
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
                // this.props.dragStart(event, this.props.curitem.prod.productInfo, true);
                this.setState({ blockDragStart: { x: event.x, y: event.y } });
            })
            .on('drag', (event) => {
                const me = d3.select(this["LM01"]);
                me.attr('x', event.x);
                me.attr('y', event.y);

                //scroll parent div with d3 drag
                let parent = document.getElementById("maindrawsvg-wrapper");
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
                
                this.onDragGuidline(event, event.x, event.y);
            })
            .on('end', (event) => {
                this.updateSaveObj(event,event.x,event.y);
            });
      
        handleDrag(d3.select(this["LM01"]));

        //#PDU-SM09 - calc new product block
        let selectedBlock = this.props.currentSelectedBlock;
        let blockobj = (selectedBlock?selectedBlock.rectdetails:null);
        //recalc
        if(blockobj){
            blockobj.OrigX = blockobj.x;
            blockobj.drawWidth = blockobj.width;
            blockobj.drawHeight = blockobj.height;
            blockobj.uom = this.props.displayuom;

            let blocktotalwidth = (blockobj.width / this.props.displayratio);
            let blocktotalheight = (blockobj.height / this.props.displayratio);

            blockobj.width = blocktotalwidth;
            blockobj.height = blocktotalheight;

            blockobj.drawingProducts = selectedBlock.drawingProducts;
            blockobj.newDrawingProducts = structuredClone(selectedBlock.drawingProducts);

            var movingObj = this.setmovingObj(blockobj.newDrawingProducts);
            blockobj.selectedshelves = movingObj;
            
            // console.log(blockobj);
            this.setState({ selectBlockObj: blockobj, bkpBlockObj: structuredClone(blockobj) });
        }
    }

    componentWillUnmount(){
      if(this._guideTimeout){
        clearTimeout(this._guideTimeout);
      }
    }

    setmovingObj = (drawingprods) => {
        // let fieldObj = viewobj.fieldsList[blockobj.fieldidx];
        let groupobj = groupBy(drawingprods,"shelfrank")
        let slevtedShelves = [];
        
        if(Object.keys(groupobj).length>0){
            for (let key of Object.keys(groupobj)) {
                let ele = groupobj[key];

                let heightsetProd = 0;
                for (let i = 0; i < ele.length; i++) {
                    const prod = ele[i];
                    if(heightsetProd < prod.drawHeight){
                        heightsetProd = prod.drawHeight;
                    }
                }

                let sortlowxprods = ele.sort((a,b) => a.x - b.x);
                let lowprodx = roundOffDecimal(sortlowxprods[0].x,2);
                let highprodx = roundOffDecimal((sortlowxprods[(sortlowxprods.length - 1)].x + sortlowxprods[(sortlowxprods.length - 1)].drawWidth),2);

                let obj = {
                    rank: ele[0].shelfrank,
                    heighestdrawingProduct: heightsetProd,
                    selectedProducts: ele,
                    lowProdX: lowprodx,
                    highProdX: highprodx,
                }

                slevtedShelves.push(obj);
            }
        }

        return slevtedShelves;
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
            this.props.setPreviewGuid(false, null, null, true);
        }
      }

      this._guideTimeout = setTimeout(() => {
            this.Setguidline(evt,cx,cy);
      }, 300);
    }

    Setguidline = (evt,cx,cy) => {
      let previewShelves = [];
      let movingObj = structuredClone(this.state.selectBlockObj);
      // console.log(movingObj);

      //get highest x prod for overlapping allowance check
      let highXProdList = movingObj.drawingProducts.sort((a, b) => b.x - a.x);
      let highXProd = highXProdList[0];
      let highXProdAllow = (this.props.allowovrflwprod?((highXProd.drawWidth / 4) * 3):0);
      
      let MOStartX = roundOffDecimal(cx,10);
      let MOStartY = roundOffDecimal(cy,10);
      let MOEndX = roundOffDecimal((cx + movingObj.drawWidth),10);
      let MOEndY = roundOffDecimal((cy + movingObj.drawHeight),10);
      
      let containElem = elmAccordingtoXY(cx, cy, MOEndX, MOEndY, this.props.saveObj, movingObj);
      
      let selectingField = containElem.field;
      MOStartX = roundOffDecimal((containElem.startX),10);

      if(selectingField){
        let fieldStartX = roundOffDecimal(selectingField.x,10);
        let fieldStartY = roundOffDecimal(selectingField.y,10);
        let fieldOldEndX = (selectingField.x + selectingField.drawWidth);
        let fieldEndX = roundOffDecimal((fieldOldEndX + highXProdAllow),10);
        let fieldEndY = roundOffDecimal((selectingField.y + selectingField.drawHeight),10);

        // console.log(selectingField);
       
        let isinsidefield = false;
        //check inside field
        // console.log(fieldStartX +"<"+ MOStartX, fieldEndX +">"+ MOEndX , fieldStartY +"<"+ MOStartY, fieldEndY +">"+ MOEndY);
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
              MOStartX = roundOffDecimal((fieldEndX - movingObj.drawWidth),10);
              isinsidefield = true;
            }
          }
        }
        
        if(isinsidefield){
            let changefield = this.props.saveObj.fieldsList[selectingField.key];
            
            //check for leftside overlap products
            // console.log(selectingField.contain_shelfs);
            let overflowLeftAllow = -1;
            for (let i = 0; i < selectingField.contain_shelfs.length; i++) {
              const shelfobj = selectingField.contain_shelfs[i];
              let shelfx = shelfobj.x;

              for (let j = 0; j < shelfobj.overLappingDto.length; j++) {
                const overlapobj = shelfobj.overLappingDto[j];
                
                if(!overlapobj.isDelete){
                  let prodStart = roundOffDecimal((shelfx+overlapobj.x), 10);
                  let prodEnd = roundOffDecimal((prodStart + overlapobj.drawWidth), 10);

                  // let prodStartY = roundOffDecimal(overlapobj.y, 10);
                  // let prodEndY = roundOffDecimal((overlapobj.y + overlapobj.drawHeight), 10);

                  //sets shelf start y and end y as prod start y and end y to check overlap prod check
                  let prodStartY = roundOffDecimal(shelfobj.y, 10);
                  let prodEndY = roundOffDecimal((shelfobj.y + shelfobj.drawHeight), 10);
  
                  if(!checkThroughProductsTest(MOStartX, MOStartY, MOEndX, MOEndY, prodStart, prodStartY, prodEnd, prodEndY)){
                    overflowLeftAllow = prodEnd;
                  }
                }
              }
            }
            
            // console.log(overflowLeftAllow);
            if(overflowLeftAllow > -1){
              MOStartX = roundOffDecimal(overflowLeftAllow, 10);
              MOEndX = roundOffDecimal((overflowLeftAllow + movingObj.drawWidth),10);
            }

            //check drop is overlapping right side field shelf prod list
            if(MOEndX > fieldOldEndX && changefield.rightSidePlanogramFieldDto){
              let findrightsidefield = this.props.saveObj.fieldsList.find(x => x.id === changefield.rightSidePlanogramFieldDto.id);
              let extraOverlapValue = roundOffDecimal((MOEndX - fieldOldEndX),10);
              
              let foundOverflowX = -1;
              let isShelfOverlapAllowed = false;
              
              for (let i = 0; i < selectingField.contain_shelfs.length; i++) {
                const containshelf = selectingField.contain_shelfs[i];
                
                let findrightshelf = findrightsidefield.planogramShelfDto.find(x => x.id === containshelf.leftPlanogramShelfId);
                if(findrightshelf){

                  let checkAllowX1 = findrightshelf.x;
                  let checkAllowy1 = findrightshelf.y;
                  let checkAllowX2 = roundOffDecimal((findrightshelf.x + extraOverlapValue),10);
                  let checkAllowY2 = roundOffDecimal((findrightshelf.y + findrightshelf.drawHeight),10);
                  // console.log(findrightshelf);

                  let shelfOverflowX = -1;

                  for (let l = 0; l < findrightshelf.planogramProduct.length; l++) {
                    const shelfprod = findrightshelf.planogramProduct[l];

                    if(!shelfprod.isDelete){
                      for (let k = 0; k < shelfprod.productBlock.length; k++) {
                        const prodblock = shelfprod.productBlock[k];
                        
                        if(!prodblock.isDelete){
                          for (let j = 0; j < prodblock.productLocations.length; j++) {
                            const prodblockloc = prodblock.productLocations[j];
                            
                            if(!prodblockloc.isDelete){
                              let prodStart = roundOffDecimal(prodblockloc.x, 10);
                              let prodStartY = roundOffDecimal(prodblockloc.y, 10);
                              let prodEnd = roundOffDecimal((prodblockloc.x + prodblockloc.drawWidth), 10);
                              let prodEndY = roundOffDecimal((prodblockloc.y + prodblockloc.drawHeight), 10);
      
                              if(!checkThroughProductsTest(checkAllowX1, checkAllowy1, checkAllowX2, checkAllowY2, prodStart, prodStartY, prodEnd, prodEndY)){
                                if(shelfOverflowX === -1 || shelfOverflowX > prodblockloc.x){
                                  shelfOverflowX = prodblockloc.x;
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }

                  let gapBetweenShelfX = roundOffDecimal((shelfOverflowX - findrightshelf.x), 10);
                  
                  if(shelfOverflowX > -1 && foundOverflowX < gapBetweenShelfX){
                    foundOverflowX = gapBetweenShelfX;
                    isShelfOverlapAllowed = false;
                  } else{
                    isShelfOverlapAllowed = true;
                  }

                }
              }

              let fieldEndX = roundOffDecimal((selectingField.obj.startX + selectingField.obj.drawWidth), 10);
              
              if(foundOverflowX > -1){
                //get end of field
                let addtoShelfEndX = (fieldEndX + foundOverflowX);

                MOStartX = roundOffDecimal((addtoShelfEndX - movingObj.drawWidth), 10);
                MOEndX = roundOffDecimal(addtoShelfEndX,10);
                // console.log(MOStartX, MOEndX);
              } else if(!isShelfOverlapAllowed){
                MOStartX = roundOffDecimal((fieldEndX - movingObj.drawWidth), 10);
                MOEndX = roundOffDecimal(fieldEndX, 10);
              }
            }
            
            let containProds = GetContainingProdsByBox(MOStartX , MOStartY, MOEndX, MOEndY, changefield, selectingField.key, movingObj);
            // console.log(containProds);
            
            // let lowestprodx = (containProds && containProds.rectDetails?containProds.rectDetails.x:MOStartX);
            let lowestprodx = MOStartX;
            let droppingXProd = null; //to find prod available in dropping x1 position

            if(containProds.selectedProds && containProds.selectedProds.length > 0){
                var notDeletedContainProds = containProds.selectedProds.filter(f => !f.isDelete);

                for (let p = 0; p < notDeletedContainProds.length; p++) {
                const prod = notDeletedContainProds[p];
                
                    for (let j = 0; j < movingObj.selectedshelves.length; j++) {
                    const ele = movingObj.selectedshelves[j];
                    var ishaveinSlectedshleves = ele.selectedProducts.find(x => x.id === prod.id);

                    //check save moving produtcs not cutting
                    if(ishaveinSlectedshleves === undefined){
                        if(lowestprodx > prod.x){
                            lowestprodx = prod.x;
                        }

                        if(prod.x <= MOStartX && MOStartX <= roundOffDecimal((prod.x + prod.drawWidth),10)){
                            droppingXProd = prod;
                        }
                    }
                    }
                }
            }

            let containshelfs = (selectingField.contain_shelfs?selectingField.contain_shelfs:[]);

            //if dropping position x not have product find last left product x to drop
            if(!droppingXProd){
                lowestprodx = getSnappingLocation(lowestprodx, selectingField, movingObj, containshelfs);
            }
            
            //reset guidlines
            containshelfs.forEach(conshlf => {
                conshlf.previewguid = {startX: -1, endX: -1};
            });
        
            for (let m = 0; m < movingObj.selectedshelves.length; m++) {
                const changeshelf = movingObj.selectedshelves[m];
                let maxEndX = 0; var maxY = 0; //var maxEndY = 0;
                let stratingXofshelvf = 0;
                //if found
                if(containshelfs[m]){
                    let curshelfitemy = (containshelfs[m]?(containshelfs[m].y + containshelfs[m].drawHeight):0);

                    for (let k = 0; k < changeshelf.selectedProducts.length; k++) {
                        const changeproditem = changeshelf.selectedProducts[k];
                        
                        let gapbetweenoribox = (changeproditem.x - movingObj.x);
                        //only first time
                        if(k===0){
                            stratingXofshelvf=(lowestprodx + gapbetweenoribox)
                        }
                        
                        changeproditem["x"] = (lowestprodx + gapbetweenoribox);
                        changeproditem["y"] = (curshelfitemy - changeproditem.drawHeight);
                        changeproditem["shelfrank"] = containshelfs[m].rank;
                        
                        // existingProducts[changeproditem.prodidx] = changeproditem;
                        // existingProducts[changeproditem.prodidx]["isDelete"] = false;
                        if(maxY<changeproditem.y){
                            maxY=changeproditem.y
                            // maxEndY=changeproditem.y+changeproditem.drawHeight;
                        }

                        let curprodendx = (changeproditem.x + changeproditem.drawWidth);
                        if(curprodendx > maxEndX){
                            maxEndX = curprodendx;
                        }
                        
                    } 
                    containshelfs[m]["previewguid"] = {startX: stratingXofshelvf, endX: maxEndX};
                }
            }
          previewShelves = containshelfs;
          
          // console.log(selectingField);
          this.props.setPreviewGuid(false, previewShelves, selectingField);
        } else{
          this.props.setPreviewGuid(true);
        }

      } else{
        this.props.setPreviewGuid(true);
      }
    }
    //#PDU-SM11 - update new block changes and save main object
    updateSaveObj = (evt,cx,cy) => {
      let moveStartObj = this.state.blockDragStart;
      // console.log(moveStartObj.x, moveStartObj.y, cx, cy);

      if(moveStartObj.x !== cx || moveStartObj.y !== cy){
        let movingObj = structuredClone(this.state.selectBlockObj);
  
        let MOStartX = roundOffDecimal(cx,10);
        let MOStartY = roundOffDecimal(cy,10);
        let MOEndX = roundOffDecimal((cx + movingObj.drawWidth),10);
        let MOEndY = roundOffDecimal((cy + movingObj.drawHeight),10);
  
        let containElem = elmAccordingtoXY(cx, cy, MOEndX, MOEndY, this.props.saveObj, movingObj);
        let selectingField = containElem.field;
        MOStartX = containElem.startX;
  
        //get highest x prod for overlapping allowance check
        let highXProdList = movingObj.drawingProducts.sort((a, b) => b.x - a.x);
        let highXProd = highXProdList[0];
        let highXProdAllow = (this.props.allowovrflwprod?((highXProd.drawWidth / 4) * 3):0);
        
        if(selectingField){
          let fieldStartX = roundOffDecimal(selectingField.x,10);
          let fieldStartY = roundOffDecimal(selectingField.y,10);
          let fieldOldEndX = (selectingField.x + selectingField.drawWidth);
          let fieldEndX = roundOffDecimal((fieldOldEndX + highXProdAllow),10);
          let fieldEndY = roundOffDecimal((selectingField.y + selectingField.drawHeight),10);
         
          let isinsidefield = false;
          //check moving box is inside field
          // console.log(fieldStartX +"<"+ MOStartX, fieldEndX +">"+ MOEndX , fieldStartY +"<"+ MOStartY, fieldEndY +">"+ MOEndY);
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
                MOStartX = roundOffDecimal((fieldEndX - movingObj.drawWidth),10);
                isinsidefield = true;
              }
            }
          }
          
          //if is it inside field
          if(isinsidefield){
              this.props.fieldHistoryAdd(structuredClone(this.props.saveObj),1);

              //current full save obj
              let viewObj = structuredClone(this.props.saveObj);
              //change field
              let changefield = viewObj.fieldsList[selectingField.key];

              //check for leftside overlap products
              // console.log(selectingField.contain_shelfs);
              let overflowLeftAllow = -1;
              for (let i = 0; i < selectingField.contain_shelfs.length; i++) {
                const shelfobj = selectingField.contain_shelfs[i];
                let shelfx = shelfobj.x;

                for (let j = 0; j < shelfobj.overLappingDto.length; j++) {
                  const overlapobj = shelfobj.overLappingDto[j];
                  
                  if(!overlapobj.isDelete){
                    let prodStart = roundOffDecimal((shelfx+overlapobj.x), 10);
                    let prodEnd = roundOffDecimal((prodStart + overlapobj.drawWidth), 10);

                    // let prodStartY = roundOffDecimal(overlapobj.y, 10);
                    // let prodEndY = roundOffDecimal((overlapobj.y + overlapobj.drawHeight), 10);
  
                    //sets shelf start y and end y as prod start y and end y to check overlap prod check
                    let prodStartY = roundOffDecimal(shelfobj.y, 10);
                    let prodEndY = roundOffDecimal((shelfobj.y + shelfobj.drawHeight), 10);

                    if(!checkThroughProductsTest(MOStartX, MOStartY, MOEndX, MOEndY, prodStart, prodStartY, prodEnd, prodEndY)){
                      overflowLeftAllow = prodEnd;
                    }
                  }
                  
                }
              }
              
              if(overflowLeftAllow > -1){
                MOStartX = roundOffDecimal(overflowLeftAllow, 10);
                MOEndX = roundOffDecimal((overflowLeftAllow + movingObj.drawWidth),10);
              }
              
              //check drop is overlapping right side field shelf prod list
              if(MOEndX > fieldOldEndX && changefield.rightSidePlanogramFieldDto){
                let findrightsidefield = this.props.saveObj.fieldsList.find(x => x.id === changefield.rightSidePlanogramFieldDto.id);
                let extraOverlapValue = roundOffDecimal((MOEndX - fieldOldEndX),2);
                
                let foundOverflowX = -1;
                let isShelfOverlapAllowed = false;
                
                for (let i = 0; i < selectingField.contain_shelfs.length; i++) {
                  const containshelf = selectingField.contain_shelfs[i];
                  
                  let findrightshelf = findrightsidefield.planogramShelfDto.find(x => x.id === containshelf.leftPlanogramShelfId);
                  if(findrightshelf){

                    let checkAllowX1 = findrightshelf.x;
                    let checkAllowy1 = findrightshelf.y;
                    let checkAllowX2 = roundOffDecimal((findrightshelf.x + extraOverlapValue), 10);
                    let checkAllowY2 = roundOffDecimal((findrightshelf.y + findrightshelf.drawHeight), 10);

                    let shelfOverflowX = -1;

                    for (let l = 0; l < findrightshelf.planogramProduct.length; l++) {
                      const shelfprod = findrightshelf.planogramProduct[l];

                      if(!shelfprod.isDelete){
                        for (let k = 0; k < shelfprod.productBlock.length; k++) {
                          const prodblock = shelfprod.productBlock[k];
  
                          if(!prodblock.isDelete){
                            for (let j = 0; j < prodblock.productLocations.length; j++) {
                              const prodblockloc = prodblock.productLocations[j];
                              
                              if(!prodblockloc.isDelete){
                                let prodStart = roundOffDecimal(prodblockloc.x, 10);
                                let prodStartY = roundOffDecimal(prodblockloc.y, 10);
                                let prodEnd = roundOffDecimal((prodblockloc.x + prodblockloc.drawWidth), 10);
                                let prodEndY = roundOffDecimal((prodblockloc.y + prodblockloc.drawHeight), 10);
      
                                if(!checkThroughProductsTest(checkAllowX1, checkAllowy1, checkAllowX2, checkAllowY2, prodStart, prodStartY, prodEnd, prodEndY)){
                                  if(shelfOverflowX === -1 || shelfOverflowX > prodblockloc.x){
                                    shelfOverflowX = prodblockloc.x;
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }

                    let gapBetweenShelfX = roundOffDecimal((shelfOverflowX - findrightshelf.x), 10);
                    if(shelfOverflowX > -1 && foundOverflowX < gapBetweenShelfX){
                      foundOverflowX = gapBetweenShelfX;
                      isShelfOverlapAllowed = false;
                    } else{
                      isShelfOverlapAllowed = true;
                    }
                    
                  }
                }
                
                let fieldEndX = roundOffDecimal((selectingField.obj.startX + selectingField.obj.drawWidth), 10);
                
                if(foundOverflowX > -1){
                  let addtoShelfEndX = (fieldEndX + foundOverflowX);

                  MOStartX = roundOffDecimal((addtoShelfEndX - movingObj.drawWidth), 10);
                  MOEndX = roundOffDecimal(addtoShelfEndX, 10);
                  // console.log(MOStartX, MOEndX);

                } else if(!isShelfOverlapAllowed){
                  MOStartX = roundOffDecimal((fieldEndX - movingObj.drawWidth), 10);
                  MOEndX = roundOffDecimal(fieldEndX, 10);
                }
              }

              let containProds = GetContainingProdsByBox(MOStartX , MOStartY, MOEndX, MOEndY, changefield, selectingField.key, movingObj);
              
              let lowestprodx = MOStartX;
              let cutshelfs = []; 
              let droppingXProd = null; //to find prod available in dropping x1 position
  
              if(containProds.selectedProds && containProds.selectedProds.length > 0){
                  var notDeletedContainProds = containProds.selectedProds.filter(f => !f.isDelete);
  
                  for (let p = 0; p < notDeletedContainProds.length; p++) {
                    const prod = notDeletedContainProds[p];
  
                    for (let j = 0; j < movingObj.selectedshelves.length; j++) {
                      const ele = movingObj.selectedshelves[j];
                      var ishaveinSlectedshleves=ele.selectedProducts.find(x=>x.id===prod.id)
                        //check save moving produtcs not cutting
                        if(ishaveinSlectedshleves === undefined){
                            if(lowestprodx > prod.x){
                                lowestprodx = prod.x;
                            }
  
                            if(prod.x <= MOStartX && MOStartX <= roundOffDecimal((prod.x + prod.drawWidth), 10)){
                                droppingXProd = prod;
                            }
                        }
                    }
                  }
              }
  
              let containshelfs = (selectingField.contain_shelfs?selectingField.contain_shelfs:[]);
              let lowestshelfy = containshelfs[0].y;
              let highestshelfy = (containshelfs[(containshelfs.length - 1)].y + containshelfs[(containshelfs.length - 1)].drawHeight);
  
              // console.log(containshelfs);
  
              //if dropping position x not have product find last left product x to drop
              if(!droppingXProd){
                  lowestprodx = getSnappingLocation(lowestprodx, selectingField, movingObj, containshelfs);
              }
            
              var maxEndX = 0; var maxY = 0; // var maxEndY = 0;
              //selected block products
              let overlapcutlist = [];
              for (let m = 0; m < movingObj.selectedshelves.length; m++) {
                  const changeshelf = movingObj.selectedshelves[m];
                  
                  //if found
                  if(containshelfs[m]){
                    let curcontainshelf = changefield.planogramShelfDto[containshelfs[m].shelfidx];
                    let curshelfitemy = (curcontainshelf?(curcontainshelf.y + curcontainshelf.drawHeight):0);
                    
                    for (let k = 0; k < changeshelf.selectedProducts.length; k++) {
                        const changeproditem = changeshelf.selectedProducts[k];
  
                        let newprody = (curshelfitemy - changeproditem.gapFromBottom);
                        //if product is inside shelf
                        if(newprody >= curcontainshelf.y){
                          var allowbottom = checkProductIsInBottom(curcontainshelf.y, curcontainshelf.drawHeight, newprody, changeproditem.drawHeight);

                          let gapbetweenoribox = (changeproditem.x - movingObj.x);
                          changeproditem["previd"] = changeproditem.id;
                          changeproditem["id"] = uuidv4();
                          changeproditem["x"] = (lowestprodx + gapbetweenoribox);
                          changeproditem["y"] = newprody;
                          changeproditem["isDelete"] = false;
                          changeproditem["isNew"] = true;
                          changeproditem["isRightSideOverLap"] = false;
                          changeproditem["overLappingDto"] = null;
                          changeproditem["isbottom"] = allowbottom;
                          changeproditem["uom"] = this.props.displayuom;

                          let prodLocEndX = roundOffDecimal((changeproditem.x + changeproditem.drawWidth),10);
                          if(prodLocEndX > fieldOldEndX && changefield.rightSidePlanogramFieldDto){
                            let overlapStartX = (fieldOldEndX - changeproditem.x);
                            let crossLocWidth = (prodLocEndX - fieldOldEndX);
                            
                            let overlaplocobj = {
                              shelfId: curcontainshelf.leftPlanogramShelfId, 
                              id: uuidv4(),
                              crossingWidth: crossLocWidth,
                              productWidth: changeproditem.productWidth, 
                              productHeight: changeproditem.productHeight, 
                              productDepth: changeproditem.productDepth,
                              productRotation: changeproditem.productRotation,
                              productUom: changeproditem.productUom,
                              drawWidth: changeproditem.drawWidth,
                              drawHeight: changeproditem.drawHeight,
                              qty: 1, 
                              sideType: "Left", 
                              fieldUom: this.props.displayuom,
                              x: (Math.abs(overlapStartX) * -1), 
                              y: changeproditem.y, 
                              isNew: true, isDelete: false
                            };

                            changeproditem["isRightSideOverLap"] = true;
                            changeproditem["overLappingDto"] = overlaplocobj;

                          }
                          
                          if(maxY < changeproditem.y){
                              maxY = changeproditem.y;
                              // maxEndY = (changeproditem.y + changeproditem.drawHeight);
                          }
  
                          let curprodendx = (changeproditem.x + changeproditem.drawWidth);
                          if(curprodendx > maxEndX){
                              maxEndX = curprodendx;
                          }  
                          
                        } else{
                          //otherwise it's gonna add to the clipboard

                          // if(!lowestcutprody || lowestcutprody > newprody){
                          //   lowestcutreducey = changeproditem.gapFromBottom;
                          // }
  
                          let newcutprod = structuredClone(changeproditem);
                          
                          let newprodshelf = viewObj.fieldsList[newcutprod.fieldidx].planogramShelfDto[newcutprod.shelfidx];
                          let newshelfx2 = (newprodshelf.y + newprodshelf.drawHeight);
                          
                          let findshelfitemidx = overlapcutlist.findIndex(x => x.rank === newcutprod.shelfrank);
  
                          if(findshelfitemidx > -1){
                            overlapcutlist[findshelfitemidx].prods.push(newcutprod);
                          } else{
                            overlapcutlist.push({ rank: newcutprod.shelfrank, shelfbottomy: newshelfx2, iscopy: false, prods: [newcutprod] });
                          }
  
                          //delete prod
                          changeproditem["isDelete"] = true;
                        }
                    }
                  }
                  
              }
              // console.log(movingObj);
  
              for (let j = 0; j < overlapcutlist.length; j++) {
                const overcutshelf = overlapcutlist[j];
                
                let hightprody = overcutshelf.prods.sort((a,b) => ((b.y + b.drawHeight) - (a.y + a.drawHeight)));
                let bottomygap = (overcutshelf.shelfbottomy - (hightprody[0].y + hightprody[0].drawHeight));
                // console.log(overcutshelf.shelfbottomy, (hightprody[0].y + hightprody[0].drawHeight));
  
                for (let l = 0; l < overcutshelf.prods.length; l++) {
                  const overcutprod = overcutshelf.prods[l];
                  overcutprod["gapFromBottom"] = (overcutprod.gapFromBottom - bottomygap);
                }
              }
             
              let newchangeprods = [];
              let saftyMargintoStart = 1;
  
              let newMOStartX = roundOffDecimal((lowestprodx + saftyMargintoStart), 10);
              let newmOStartY = roundOffDecimal(lowestshelfy, 10);
              let newMOEndX = roundOffDecimal((maxEndX - this.props.checkSaftyMargin), 10);
              let newMOEndY = roundOffDecimal(highestshelfy, 10);

              let ccontainProds = GetContainingProdsByBox(newMOStartX, newmOStartY, newMOEndX, newMOEndY, changefield, selectingField.key, movingObj);
              
              if(ccontainProds.selectedProds && ccontainProds.selectedProds.length > 0){
                  var cnotDeletedContainProds = ccontainProds.selectedProds.filter(f => !f.isDelete);
                  // console.log(ccontainProds.selectedProds);

                  for (let p = 0; p < cnotDeletedContainProds.length; p++) {
                    const prod = cnotDeletedContainProds[p];
    
                    let isincontainshelfs = containshelfs.findIndex(l => l.rank === prod.shelfrank);
    
                    if(isincontainshelfs > -1){
                      var ishaveinSelectedshleves = movingObj.newDrawingProducts.find(x => x.previd === prod.id);
                      // console.log(movingObj);
                      //check save moving produtcs not cutting
                      if(!ishaveinSelectedshleves){
                        let findshelfitemidx = cutshelfs.findIndex(x => x.rank === prod.shelfrank);

                        if(findshelfitemidx > -1){
                            cutshelfs[findshelfitemidx].prods.push(prod);
                        } else{
                            cutshelfs.push({ rank: prod.shelfrank, iscopy: false, prods: [prod] });
                        }
                        
                        let prodshelf = viewObj.fieldsList[prod.fieldidx].planogramShelfDto[prod.shelfidx];
                        let proddetails = prodshelf.planogramProduct[prod.prodidx];
                        let prodblock = proddetails.productBlock[prod.blockidx];

                        let prodlocobj = prodblock.productLocations[prod.locidx];
                        prodlocobj["isDelete"] = true;

                        if(prodlocobj.overLappingDto){
                          prodlocobj.overLappingDto["isDelete"] = true;

                          let changerightfield = viewObj.fieldsList.findIndex(x => x.id === changefield.rightSidePlanogramFieldDto.id);
                          let changerightshelf = (changerightfield > -1?viewObj.fieldsList[changerightfield].planogramShelfDto.findIndex(x => x.id === prodlocobj.overLappingDto.shelfId):-1);
    
                          if(changerightshelf > -1){
                            let rightoverlaplist = viewObj.fieldsList[changerightfield].planogramShelfDto[changerightshelf].overLappingDto;
                            let findalreadyrightadded = rightoverlaplist.findIndex(x => x.id === prodlocobj.overLappingDto.id && !x.isDelete);
    
                            if(findalreadyrightadded > -1){
                              if(rightoverlaplist[findalreadyrightadded].isNew){
                                rightoverlaplist.splice(findalreadyrightadded, 1);
                              } else{
                                rightoverlaplist[findalreadyrightadded].isDelete = true;
                              }
                            }
                          }
                        }

                        //delete block also if all products deleted inside block
                        let locdeletedcount = prodblock.productLocations.filter(blockprod => blockprod.isDelete);
                        if(locdeletedcount.length === prodblock.productLocations.length){
                          prodblock["isDelete"] = true;
                        }

                        //delete product if all blocks deleted inside product
                        let blockdeletedcount = proddetails.productBlock.filter(blockprod => blockprod.isDelete);
                        if(blockdeletedcount === proddetails.productBlock.length){
                          proddetails["isDelete"] = true;
                        }

                        if(prodlocobj.isbottom){
                          let isaddedtochanges = newchangeprods.findIndex(x => x.type === "QTY_REMOVE" && x.product.id === proddetails.productInfo.id);

                          if(isaddedtochanges === -1){
                            let newrdobj = {type:"QTY_REMOVE", loclist: [prodlocobj], product: proddetails.productInfo, fieldidx: prod.fieldidx, shelve: prod.shelfidx, prodobj: proddetails, locobj: null, changeqty: 1};
                            newchangeprods.push(newrdobj);
                          } else{
                            newchangeprods[isaddedtochanges].changeqty = (newchangeprods[isaddedtochanges].changeqty + 1);
                            newchangeprods[isaddedtochanges].loclist.push(prodlocobj);
                          }
                        }
                      } 
                    }
                  }
              }
              
              //selected block products create new field product details
              for (let m = 0; m < movingObj.selectedshelves.length; m++) {
                const changeshelf = movingObj.selectedshelves[m];
                
                //if found
                if(containshelfs[m]){
                  let cursaveshelf = changefield.planogramShelfDto[containshelfs[m].shelfidx];
                  let newshelfproducts = cursaveshelf.planogramProduct;
                  
                  let blockIdList = [];
                  for (let k = 0; k < changeshelf.selectedProducts.length; k++) {
                    const changeproditem = changeshelf.selectedProducts[k];
  
                    let prodshelf = viewObj.fieldsList[changeproditem.fieldidx].planogramShelfDto[changeproditem.shelfidx];
                    let proddetails = prodshelf.planogramProduct[changeproditem.prodidx];
                    let prodblock = proddetails.productBlock[changeproditem.blockidx];
  
                    let prodlocobj = prodblock.productLocations[changeproditem.locidx];
                    prodlocobj["isDelete"] = true;

                    if(prodlocobj.overLappingDto){
                      prodlocobj.overLappingDto["isDelete"] = true;

                      let changerightfield = viewObj.fieldsList.findIndex(x => x.id === changefield.rightSidePlanogramFieldDto.id);
                      let changerightshelf = (changerightfield > -1?viewObj.fieldsList[changerightfield].planogramShelfDto.findIndex(x => x.id === prodlocobj.overLappingDto.shelfId):-1);

                      if(changerightshelf > -1){
                        let rightoverlaplist = viewObj.fieldsList[changerightfield].planogramShelfDto[changerightshelf].overLappingDto;
                        let findalreadyrightadded = rightoverlaplist.findIndex(x => x.id === prodlocobj.overLappingDto.id && !x.isDelete);

                        if(findalreadyrightadded > -1){
                          if(rightoverlaplist[findalreadyrightadded].isNew){
                            rightoverlaplist.splice(findalreadyrightadded, 1);
                          } else{
                            rightoverlaplist[findalreadyrightadded].isDelete = true;
                          }
                        }
                      }
                    }
  
                    if(!changeproditem.isDelete){
                      //add to change
                      if(changeproditem.isbottom){
                        let isaddedtochanges = newchangeprods.findIndex(x => x.type === "QTY_ADD" && x.product.id === proddetails.productInfo.id);
    
                        if(isaddedtochanges === -1){
                          let newrdobj = {type:"POSITION_CHANGE", loclist: [], product: proddetails.productInfo, fieldidx: changeproditem.fieldidx, shelve: changeproditem.shelfidx, prodobj: proddetails, locobj: null, changeqty: 0};
                          newchangeprods.push(newrdobj);
                        } else{
                          // newchangeprods[isaddedtochanges].changeqty = (newchangeprods[isaddedtochanges].changeqty + 1);
                        }
                      }
                      
                      let newprodblock = structuredClone(prodblock);
                      newprodblock["oldid"] = newprodblock.id;
                      newprodblock["id"] = uuidv4();
                      newprodblock["isDelete"] = false;
                      newprodblock["isNew"] = true;
                      newprodblock["productLocations"] = [changeproditem];

                      //add to updating block list
                      blockIdList.push(newprodblock.id);
  
                      let isproductadded = newshelfproducts.findIndex(proditem => (!proditem.isDelete && proditem.productInfo.id === proddetails.productInfo.id));
                      if(isproductadded > -1){
                        let foundprodobj = newshelfproducts[isproductadded];
                        
                        //find block if its close to a block3
                        var findblockadded = -1;
                        for (var l = 0; l < foundprodobj.productBlock.length; l++) {
                            const blockitem = foundprodobj.productBlock[l];
                            var checkrslt = checkProductThoughBlock(changeproditem.x, changeproditem.y, proddetails.productInfo, blockitem, false, this.props.displayuom, this.props.displayratio, this.props.saftyMargin);
                            
                            if(checkrslt){
                              findblockadded = l;
                            }
                        }
                        // console.log(findblockadded);

                        // let findblockadded = foundprodobj.productBlock.findIndex(blockitem => blockitem.oldid === prodblock.id);

                        if(findblockadded > -1){
                          let foundprodblock = foundprodobj.productBlock[findblockadded];
                          
                          foundprodblock.productLocations.push(changeproditem);
  
                        } else{
                          foundprodobj.productBlock.push(newprodblock);
                        }
  
                      } else{
                        let newprodobj = structuredClone(proddetails);
                        newprodobj["id"] = uuidv4();
                        newprodobj["isDelete"] = false;
                        newprodobj["isNew"] = true;
                        newprodobj["productBlock"] = [newprodblock];
  
                        newshelfproducts.push(newprodobj);
                      }  
                      
                      //right field overlap object update
                      if(changeproditem.isRightSideOverLap && changeproditem.overLappingDto){

                        let changerightfield = viewObj.fieldsList.findIndex(x => x.id === changefield.rightSidePlanogramFieldDto.id);
                        let changerightshelf = (changerightfield > -1?viewObj.fieldsList[changerightfield].planogramShelfDto.findIndex(x => x.id === changeproditem.overLappingDto.shelfId):-1);
  
                        if(changerightshelf > -1){
                          let rightoverlaplist = viewObj.fieldsList[changerightfield].planogramShelfDto[changerightshelf].overLappingDto;
                          let findalreadyrightadded = rightoverlaplist.findIndex(x => x.id === changeproditem.overLappingDto.id && !x.isDelete);
  
                          if(findalreadyrightadded > -1){
                            rightoverlaplist[findalreadyrightadded].crossingWidth = changeproditem.overLappingDto.crossingWidth;
                            rightoverlaplist[findalreadyrightadded].x = changeproditem.overLappingDto.x;
                            rightoverlaplist[findalreadyrightadded].y = changeproditem.overLappingDto.y;
  
                          } else{
                            let rightoverlapobj = structuredClone(changeproditem.overLappingDto);
                            rightoverlapobj["productDto"] = proddetails.productInfo;
                            rightoverlaplist.push(rightoverlapobj);
                          }
                        }

                      }

                    } 
                  }
  
                  // console.log(blockIdList);
                  for (let l = 0; l < newshelfproducts.length; l++) {
                    const singlenewprod = newshelfproducts[l];
  
                    let findprodinmoving = movingObj.drawingProducts.findIndex(moveprod => moveprod.prodMdId === singlenewprod.productInfo.id);
                    
                    if(findprodinmoving > -1 && !singlenewprod.isDelete){
                      for (let j = 0; j < singlenewprod.productBlock.length; j++) {
                        const singnewblock = singlenewprod.productBlock[j];
                        
                        if(!singnewblock.isDelete){
                          let findBlockInChangeList = blockIdList.find(x => x === singnewblock.id);

                          if(findBlockInChangeList){
                            let returnstackobj = stackProdBlockToTop(singnewblock, cursaveshelf, this.props.isStackableEnabled);
                            // console.log(returnstackobj);
                            
                            singlenewprod.productBlock[j] = returnstackobj;
                          }
                        }
                      }  
                    }
                  }
                }
                
            }
            
            // console.log(newchangeprods);
            this.props.handleRDChanges(newchangeprods);
            this.props.updateProductList(viewObj);
  
            let newcutshelfs = cutshelfs.concat(overlapcutlist);
            this.props.updateCutList(newcutshelfs);
            
            this.setState({ selectBlockObj: null });
          } else{
            this.resetToOriginalState()
          }
        } else{
          this.resetToOriginalState()
        }

        this.props.setPreviewGuid(true,null,selectingField);
      }
    }
    //#PDU-SM12
    resetToOriginalState = () => {
      let resetobj = structuredClone(this.state.bkpBlockObj);
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
        return <g>
            <rect onMouseDown={(e)=>this.props.handleBlockContextMenu(e, true, (blockobj?blockobj.y:0), blockobj.drawingProducts)}
            x = {blockobj?blockobj.x:0} y={blockobj?blockobj.y:0} width={blockobj?blockobj.drawWidth:0} height={blockobj?blockobj.drawHeight:0} 
            pointerEvents="all" fill="green" fillOpacity={0.3} ref={(r) => this["LM01"] = r} />
        </g>;
    }
  }

export function BlockContextMenu(props) {
  var xPos = props.xpos; //x position
  var yPos = props.ypos; //y position
  
  //handle click a button.  type: 1-delete,2-close,3-cut
  const handleClick = (type,event) => {
      if(type === 1){
          props.handleBlockDelete();
      } else if(type === 3){
        props.handleBlockCut();
      } else if(type === 5){
        props.handleBlockCut(true);
      } else
      {
          props.handlclose();
      }
  }
  
  return (<div className="rect-context-menu" onContextMenu={(e)=>{ e.preventDefault()}} style={{ top: yPos, left: (xPos-(props.isRTL==="rtl"?20:0)), }}>
      <ul className="text-center">
          <li onClick={() => handleClick(1)}>{i18n.t("btnnames.delete")}</li><hr/>
          <li onClick={() => handleClick(5)}>{i18n.t("COPY")}</li><hr/>
          <li onClick={() => handleClick(3)}>{i18n.t("CUT")}</li><hr/>
          <li onClick={() => handleClick(2)}>{i18n.t("btnnames.close")}</li>
      </ul>
    </div>
    );
}