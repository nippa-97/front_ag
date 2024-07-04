import { measureConverter, roundOffDecimal } from '../../../../_services/common.service'
import { v4 as uuidv4 } from 'uuid'; //unique id
import i18n from '../../../../_translations/i18n';

import { checkThroughProductsTest } from '../../../planograms/planDisplayUnit/additionalcontents';

import { getNameorIdorColorofBox, convertWidthPercent } from '../../AddMethods';
import { catRuleEnums } from '../../../../enums/masterPlanogramEnums';
// import { alertService } from '../../../../_services/alert.service';
// import { catRuleEnums } from '../../../../enums/masterPlanogramEnums';

export function makeRatiofromhieghestField(cfieldList, displayUOM, divHeight) {
    let heighestheight = 0
    let heighestuom = 'cm'
    // loop for make ratio
    for (let farry = 0; farry < cfieldList.length; farry++) {
        const fld = cfieldList[farry]
        //find highest field
        let drawHeight = measureConverter(fld.uom, displayUOM, fld.height)

        if (heighestheight < drawHeight) {
            heighestheight = fld.height
            heighestuom = fld.uom
        }
    }
    //define ratio
    let redicedheight = divHeight
    var dimention =
        redicedheight /
        measureConverter(heighestuom, displayUOM, heighestheight)
    return dimention
}

export function makemapFieldObj(cfieldList, displayUOM, displayRatio, divHeight, actualFields) {
    var cmapfieldObj = {}
    var fieldStartX=0
    var svgwidth=0

    //sort field list by order
    cfieldList = cfieldList.sort((a,b) => a.order - b.order);

    for (let f = 0; f < cfieldList.length; f++) {
        const field = cfieldList[f]
        var fieldheightgap=0
        field['drawHeight'] =
            measureConverter(field.uom, displayUOM, field.height) * displayRatio
        field['drawWidth'] =
            measureConverter(field.uom, displayUOM, field.width) * displayRatio
        field["x"] = fieldStartX
        field["y"] =divHeight - field.drawHeight
        fieldheightgap=divHeight - field.drawHeight
        field["startYgap"] =fieldheightgap
        field["height"] = measureConverter(field.uom, displayUOM, field.height);
        field["width"] = measureConverter(field.uom, displayUOM, field.width);
        field["depth"] = measureConverter(field.uom, displayUOM, field.depth);
        field["uom"] = displayUOM;
        field["realFieldDrawWidth"] = measureConverter(field.uom, displayUOM, field.realFieldWidth) * displayRatio;
       
        //find original field object
        let oriFieldObj = actualFields.find(x => x.mpField.id === field.mpFieldId);
        if(oriFieldObj){
            let oriMdObj = oriFieldObj.mpField;
            field["oriFieldDrawWidth"] = measureConverter(oriMdObj.field_uom, displayUOM, oriMdObj.field_width) * displayRatio;
        }

        // field seprators
        for (let sp = 0; sp < field.separators.length; sp++) {
            var sep=field.separators[sp]
            var uomconvertedSep= measureConverter(field.uom,displayUOM,(sep.x)) * displayRatio;
            sep.drawX=fieldStartX+uomconvertedSep
        }

        //loop shelf
        let prevGap = 0;

        field.shelf = field.shelf.sort((a,b) => a.rank - b.rank);
        for (let x = 0; x < field.shelf.length; x++) {
            const shelf = field.shelf[x]
            let drawHeight =
            measureConverter(field.uom, displayUOM, shelf.height) *
                displayRatio
                let drawGap =
                measureConverter(field.uom, displayUOM, shelf.gap) *
                displayRatio
                //pick x, y
                shelf.x = fieldStartX
                shelf.y = fieldheightgap+prevGap
                shelf.drawWidth = field.drawWidth
                shelf.drawHeight = drawHeight
                shelf.drawGap = drawGap
                prevGap = prevGap + (drawHeight + drawGap)
                shelf.previewguid={startX: -1, endX: -1};
                shelf.field_custom_id = field.field_custom_id;
                shelf.height = measureConverter(field.uom, displayUOM, shelf.height);
                shelf.width = measureConverter(field.uom, displayUOM, shelf.width);
                shelf.gap =  measureConverter(field.uom, displayUOM, shelf.gap);
                shelf.uom = displayUOM;
            }
        //grouping
        cmapfieldObj[field.field_custom_id] = field
        fieldStartX=fieldStartX+field.drawWidth
        svgwidth=+svgwidth+field.drawWidth
    }
    return {mapfieldObj:cmapfieldObj,svgWidth:svgwidth,svgHeight:0}
}
export function makemapactualFieldObj(cfieldList, displayUOM, displayRatio, divHeight, actualFields) {
    // var cmapfieldObj = {}
    var fieldStartX=0
    var array=[]
    //sort field list by order
    cfieldList = cfieldList.sort((a,b) => a.order - b.order);

    for (let f = 0; f < cfieldList.length; f++) {
            const filedgroup=cfieldList[f]
            
            const field = cfieldList[f].mpField
            for (let i = 0; i < filedgroup.fieldCount; i++) {
                var fieldheightgap=0
            field['drawHeight'] =
                measureConverter(field.field_uom, displayUOM, field.field_height) * displayRatio
            field['drawWidth'] =
                measureConverter(field.field_uom, displayUOM, field.field_width) * displayRatio
            field["x"] = fieldStartX
            field["y"] =divHeight - field.drawHeight
            fieldheightgap=divHeight - field.drawHeight
            field["startYgap"] =fieldheightgap
            field["height"] = measureConverter(field.uom, displayUOM, field.field_height);
            field["width"] = measureConverter(field.uom, displayUOM, field.field_width);
            field["depth"] = measureConverter(field.uom, displayUOM, field.field_depth);
            field["uom"] = displayUOM;
            field["realFieldDrawWidth"] = measureConverter(field.uom, displayUOM, field.realFieldWidth) * displayRatio;
            // field["fieldName"]=field.fieldName
        
            //find original field object
            let oriFieldObj = actualFields.find(x => x.mpField.id === field.mpFieldId);
            if(oriFieldObj){
                let oriMdObj = oriFieldObj.mpField;
                field["oriFieldDrawWidth"] = measureConverter(oriMdObj.field_uom, displayUOM, oriMdObj.field_width) * displayRatio;
            }
            //grouping
            array.push(structuredClone(field))
            // cmapfieldObj[field.field_id] = field
            fieldStartX=fieldStartX+field.drawWidth
            
        }
        
    }
    return {mapfieldObj:array}
}
export function makemapCatObj(Catrects,displayUOM,displayRatio,mapfieldObj) {
    var cmapCatObj={}
    for (let c = 0; c < Catrects.length; c++) {
        const Catrect = Catrects[c]
        var field = mapfieldObj[Catrect.field_custom_id];
        var catdrawtopshelf=null
        let topcatContainShelf=null
        if(field){
            var ccatDrawHeight = 0
            
            Catrect.contain_shelves = Catrect.contain_shelves.sort((a,b) => a.rank - b.rank);
            
            // var catDrawsgap = 0
            topcatContainShelf = Catrect.contain_shelves.find((x) =>
                Math.min(x.rank)
            )
             if(topcatContainShelf!==null){
                catdrawtopshelf = field.shelf.find(
                    (y) => y.rank === topcatContainShelf.rank
                )
             }

            //contentshelfs loop
            for (let catc = 0; catc < Catrect.contain_shelves.length; catc++) {
                const shlf = Catrect.contain_shelves[catc]
                var selectedShelf = field.shelf.find(f => f.rank===shlf.rank);
                // console.log(selectedShelf);

                if(selectedShelf){
                    shlf['drawWidth'] = selectedShelf.drawWidth
                    shlf['drawHeight'] =selectedShelf.drawHeight
                    shlf['x'] =selectedShelf.x
                    shlf['y'] = selectedShelf.y
                    // ccatDrawHeight = ccatDrawHeight +measureConverter(shlf.uom, displayUOM, shlf.height) *displayRatio
                    let contshelfheight = (measureConverter(shlf.uom, displayUOM, shlf.height) * displayRatio);
                    let contshelfgap = (measureConverter(shlf.uom, displayUOM, shlf.gap) * displayRatio);
                    ccatDrawHeight = (selectedShelf.y + contshelfheight + contshelfgap);
                }
            }
            //set catergory draw parameters
            if(field.shelf.length!==Catrect.contain_shelves.length){
                Catrect['drawfromConShelf'] = true;
            }
            //check shelf count wrong from back
            if(catdrawtopshelf){
                Catrect['drawWidth'] = measureConverter(Catrect.uom,displayUOM,Catrect.width) * displayRatio
                Catrect['drawHeight'] = roundOffDecimal((ccatDrawHeight - field.y),2);
                Catrect['x'] =field.x+measureConverter(field.uom, displayUOM, Catrect.startx) *displayRatio
                Catrect['y'] = ((catdrawtopshelf!==null))?catdrawtopshelf.y:0
                cmapCatObj[Catrect.field_custom_id+"_"+Catrect.id] = Catrect
             }
        }
    }
    
    // console.log(cmapCatObj);
    return cmapCatObj
}

// export function makemapsubCatObj(csubCategoryList,displayUOM,displayRatio,mapfieldObj){
//     var cmapSubCatObj={}
//     for (let i = 0; i < csubCategoryList.length; i++) {
//         const subcatRect = csubCategoryList[i];
//         var scatDrawHeight=0
//         var scatDrawsgap=0

//         var field=mapfieldObj[subcatRect.field_custom_id]
//         //find sub cat start point
//         var topsubcatContainShelf=subcatRect.contain_shelves.find(x=>Math.min(x.rank))
//         var subcatdrawtopshelf= field.shelf.find(y=>y.rank===topsubcatContainShelf.rank)
//         //contentshelfs loop
//         subcatRect.contain_shelves.forEach(sshlf => {
//             scatDrawHeight=scatDrawHeight+ (measureConverter(sshlf.uom,displayUOM,sshlf.height) * displayRatio);
//                 scatDrawsgap=scatDrawsgap+ (measureConverter(sshlf.uom,displayUOM,sshlf.gap) * displayRatio);
//             });
//         subcatRect["drawWidth"]=measureConverter(subcatRect.uom,displayUOM,subcatRect.width) * displayRatio;
//         subcatRect["drawHeight"]=scatDrawHeight+scatDrawsgap
//         subcatRect["x"]=field.x+measureConverter(field.uom,displayUOM,subcatRect.startx) * displayRatio;
//         subcatRect["y"]=subcatdrawtopshelf.y

//         cmapSubCatObj[subcatRect.field_custom_id+"_"+subcatRect.id] = subcatRect
        
//     }
//     return cmapSubCatObj
// }
// export function makemapbrandObj(brandList,displayUOM,displayRatio,mapfieldObj){
//     var cmapBrandObj={}
//     for (let i = 0; i < brandList.length; i++) {
//         const brandRect = brandList[i];
//         var brndDrawHeight=0
//         var brndDrawsgap=0
//         var field=mapfieldObj[brandRect.field_custom_id]                               
//         var topbrandContainShelf=brandRect.contain_shelves.find(x=>Math.min(x.rank))
//         var branddrawtopshelf= field.shelf.find(y=>y.rank===topbrandContainShelf.rank)
        
//         //contentshelfs loop
//         brandRect.contain_shelves.forEach(bshlf => {
//             brndDrawHeight=brndDrawHeight+ (measureConverter(bshlf.uom,displayUOM,bshlf.height) * displayRatio);
//             brndDrawsgap=brndDrawsgap+ (measureConverter(bshlf.uom,displayUOM,bshlf.gap) * displayRatio);
//         });
//         brandRect["drawWidth"]=measureConverter(brandRect.uom,displayUOM,brandRect.width) * displayRatio;
//         brandRect["drawHeight"]=brndDrawHeight+brndDrawsgap
//         brandRect["x"]=field.x+measureConverter(field.uom,displayUOM,brandRect.startx) * displayRatio;
//         brandRect["y"]=branddrawtopshelf.y
        
//         cmapBrandObj[brandRect.field_custom_id+"_"+brandRect.id] = brandRect
//     }
  
//     return cmapBrandObj
// }
export function makemaProductsObj(productList,displayUOM,displayRatio,mapfieldObj, isPreviewShow, previewProdList){
    var productsarray = [];
    
    for (let i = 0; i < productList.length; i++) {
        const prod = productList[i];
        var field=mapfieldObj[prod.field_custom_id]
        if(field){
            var selectedShelf=field.shelf.find(x=>x.rank===prod.shelfrank)
            // console.log(selectedShelf.y,selectedShelf.drawHeight,prod.drawHeight)
            
            // console.log(newY)
            prod["drawWidth"]=measureConverter(prod.uom,displayUOM,prod.width) * displayRatio;
            prod["drawHeight"]=measureConverter(prod.uom,displayUOM,prod.height) * displayRatio;
            var newY=roundOffDecimal(((selectedShelf.y+selectedShelf.drawHeight)-prod.drawHeight),1)
            prod["x"]=field.x+measureConverter(field.uom,displayUOM,prod.startingPoint) * displayRatio;
            prod["y"]=newY;
            prod["width"]=measureConverter(prod.uom,displayUOM,prod.width);
            prod["height"]=measureConverter(prod.uom,displayUOM,prod.height);
            prod["depth"]=measureConverter(prod.uom,displayUOM,prod.depth);
            prod["uom"]=displayUOM;
            // product qty loop
            // var pstartX=0
            // for (let l = 0; l < prod.qty; l++) {
            //     var field=mapfieldObj[prod.field_custom_id]
            //     var selectedShelf=field.shelf.find(x=>x.rank===prod.shelfrank)
                
            //     var newY=roundOffDecimal(((selectedShelf.y+selectedShelf.drawHeight)-prod.drawHeight),1)
            //     var Dprod=JSON.parse(JSON.stringify(prod))
            //     if(l===0){
            //         pstartX= measureConverter(prod.uom,displayUOM,prod.startingPoint) * displayRatio;
            //     }
            //     Dprod["x"]=field.x+pstartX
            //     Dprod["y"]=newY
            //     Dprod["fuuid"]=uuidv4()

            //     productsarray.push(Dprod)
            //     pstartX=pstartX+prod.drawWidth
            // }

            //new prod preview check
            prod.isPreviewNewProd = false;
            //console.log(isPreviewShow, previewProdList);
            if(isPreviewShow){
                for (let i = 0; i < previewProdList.length; i++) {
                    const groupObj = previewProdList[i];
                    
                    let isFoundInNewProd = groupObj.products.find(newprodobj => newprodobj.productInfo.productId === prod.productId);
                    if(isFoundInNewProd){
                        prod.isPreviewNewProd = true;
                        break;
                    }
                }
            }

            productsarray.push(prod);
        }
    }

    // console.log(productsarray);
    return productsarray;
}
export function clipBoardRedrawObj(ClipBoardtListArray,displayRatio){
    var clipboard=JSON.parse(JSON.stringify(ClipBoardtListArray))
    var cutlist=clipboard.cutpastelist
    for (let i = 0; i < cutlist.length; i++) {
        const cutitem = cutlist[i];
        for (let c = 0; c < cutitem.prods.length; c++) {
            const prod = cutitem.prods[c];
            prod["drawHeight"]=(prod.drawHeightCoppy/cutitem.ratio)*displayRatio
            prod["drawWidth"]=(prod.drawWidthCoppy/cutitem.ratio)*displayRatio 
            prod["x"]=(prod.xCoppy/cutitem.ratio)*displayRatio  
        }
        cutitem["height"]=(cutitem.heightCoppy/cutitem.ratio)*displayRatio  
        cutitem["width"]=(cutitem.widthCoppy/cutitem.ratio)*displayRatio  
    }
    return clipboard
}
export function disableFieldShelves(cfieldList,cobj){
    let returnobj = { fieldlist: cfieldList, isfieldsmatching: true };

    let prevfieldobj = null;
    for (const fieldObj of returnobj.fieldlist) {
        //check previous field details
        if(prevfieldobj){
            //check height details
            if((roundOffDecimal(fieldObj.height,2) !== roundOffDecimal(prevfieldobj.height,2)) || fieldObj.shelf.length !== prevfieldobj.shelf.length){
                returnobj.isfieldsmatching = false;
            }

            //check shelfs heights
        }

        for (const shelfObj of fieldObj.shelf) {
            let categoryObj = cobj.categoryList.find(a=> a.field_custom_id === fieldObj.field_custom_id);

            let containshelfavailable;
            if(categoryObj){
                containshelfavailable = categoryObj.contain_shelves.find(a=> a.rank === shelfObj.rank);
            }

            if(containshelfavailable){
                shelfObj['isDisable'] = false;
            }else{
                shelfObj['isDisable'] = true;
            }
                
        }

        prevfieldobj = fieldObj;
    }

    return returnobj;
}


// Accepts the array and key
export function groupBy  (array, key) {
    // Return the end result
    return array.reduce((result, currentValue) => {
      // If an array already present for key, push it to the array. Else create an array and push the object
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
      );
      // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
      return result;
    }, {}); // empty object is the initial value for result object
  };

  export function GetContainingProdsByBox(minStartX, minStartY, minEndX, minEndY, mapproductList, fieldobj, ismultipleshelf, moveobj, dropshelfs, ischeckoverlap){
    // console.log(minStartX,minStartY,minEndX,minEndY);
    var selectedProds = [];
    var startProd = null;
    var isNoproducts = false;

    var roundminStartX=roundOffDecimal(minStartX,10)
    var roundminEndX=roundOffDecimal(minEndX,10)
    // console.log(fieldobj);

    for (let i = 0; i < mapproductList.length; i++) {
        const prod = JSON.parse(JSON.stringify(mapproductList[i]));
        
        // if(!fieldobj || (fieldobj && fieldobj.field_custom_id === prod.field_custom_id)){
            prod["prodidx"] = i;
        
            var prodStart = roundOffDecimal(prod.x, 10);
            var prodStartY = roundOffDecimal(prod.y, 10);
            var prodEnd= roundOffDecimal((prod.x + prod.drawWidth), 10);
            var prodEndY = roundOffDecimal((prod.y + prod.drawHeight), 10);

            if(roundminStartX > prodStart && roundminEndX < prodEnd){
                startProd = prod
            }
            
            /* if((prodStart>minStartX&&prodStart<minEndX)||(prodEnd>minStartX&&prodEnd<minEndX)){
                if((prodStartY>minStartY&&prodStartY<minEndY)||(prodEndY>minStartY&&prodEndY<minEndY)){
                    selectedProds.push(prod)
                }
            
            } */
            
            //if multiple shelves selected
            if(ismultipleshelf && moveobj && moveobj.selectedshelves && moveobj.selectedshelves.length > 0){
                //console.log(ismultipleshelf, moveobj.selectedshelves, dropshelfs);
                for (let j = 0; j < moveobj.selectedshelves.length; j++) {
                    const moveshelf = moveobj.selectedshelves[j];
                    let dropshelf = dropshelfs[j];

                    if(dropshelf&&dropshelf.rank === prod.shelfrank){
                        let gapbetweenorix = (moveshelf.lowProdX - moveobj.OrigX);
                        let newshelflowx = roundOffDecimal((minStartX + gapbetweenorix),10);
                        
                        let gapbetweenhighorix = (moveshelf.highProdX - moveobj.OrigX);
                        let newshelfhighx = roundOffDecimal((minStartX + gapbetweenhighorix),10);
                        
                        if(!checkThroughProductsTest(newshelflowx,minStartY,newshelfhighx,minEndY,prodStart,prodStartY,prodEnd,prodEndY)){
                            selectedProds.push(prod);
                        }
                    }
                }
            } else{
                let prodshelf = fieldobj.shelf.find(pshelf => pshelf.rank === prod.shelfrank);
                if(prodshelf){
                    let prodshelfheight = (prodshelf.y + prodshelf.drawHeight + prodshelf.drawGap);

                    let newstarty = JSON.parse(JSON.stringify(minStartY));
                    let newendy = JSON.parse(JSON.stringify(minEndY));

                    let isinsideshelf = (
                        (newstarty >= prodshelf.y && prodshelfheight >= newstarty) || 
                        (newendy >= prodshelfheight && prodshelf.y >= newstarty) ||
                        (newendy > prodshelf.y && prodshelfheight >= newendy)
                    );
                    
                    if(ischeckoverlap && isinsideshelf){
                        newstarty = (prodshelf.y);
                        newendy = roundOffDecimal(prodshelfheight,10);
                    }
                    

                    if(!checkThroughProductsTest(roundminStartX,newstarty,roundminEndX,newendy,prodStart,prodStartY,prodEnd,prodEndY)){
                        selectedProds.push(prod);
                    }
                }
            }
        // }
    }
    
    if(selectedProds.length === 0){
        if(startProd === null){
            isNoproducts=true
        }else{
            // selectedProds.push(startProd)
        }
    }

    return {startProd:startProd,selectedProds:selectedProds,isNoproducts:isNoproducts}
}
//old function when cat edit is there
// export function GetContainingProdsByBoxOld(minStartX, minStartY, minEndX, minEndY, mapproductList, fieldobj, ismultipleshelf, moveobj, dropshelfs, ischeckoverlap){
//     // console.log(minStartX,minStartY,minEndX,minEndY);
//     var selectedProds = [];
//     var startProd = null;
//     var isNoproducts = false;
//     let additionalgap = 2;

//     var roundminStartX=roundOffDecimal(minStartX,2)
//     var roundminEndX=roundOffDecimal(minEndX,2)
//     // console.log(fieldobj);

//     for (let i = 0; i < mapproductList.length; i++) {
//         const prod = JSON.parse(JSON.stringify(mapproductList[i]));
        
//         if(!fieldobj || (fieldobj && fieldobj.field_custom_id === prod.field_custom_id)){
//             prod["prodidx"] = i;
        
//             var prodStart = roundOffDecimal(prod.x, 2);
//             var prodStartY = roundOffDecimal(prod.y, 2);
//             var prodEnd= roundOffDecimal((prod.x + prod.drawWidth), 2);
//             var prodEndY = roundOffDecimal((prod.y + prod.drawHeight), 2);

//             if(roundminStartX > prodStart && roundminEndX < prodEnd){
//                 startProd = prod
//             }
            
//             /* if((prodStart>minStartX&&prodStart<minEndX)||(prodEnd>minStartX&&prodEnd<minEndX)){
//                 if((prodStartY>minStartY&&prodStartY<minEndY)||(prodEndY>minStartY&&prodEndY<minEndY)){
//                     selectedProds.push(prod)
//                 }
            
//             } */
            
//             //if multiple shelves selected
//             if(ismultipleshelf && moveobj && moveobj.selectedshelves && moveobj.selectedshelves.length > 0){
//                 //console.log(ismultipleshelf, moveobj.selectedshelves, dropshelfs);
//                 for (let j = 0; j < moveobj.selectedshelves.length; j++) {
//                     const moveshelf = moveobj.selectedshelves[j];
//                     let dropshelf = dropshelfs[j];

//                     if(dropshelf.rank === prod.shelfrank){
//                         let gapbetweenorix = (moveshelf.lowProdX - moveobj.OrigX);
//                         let newshelflowx = roundOffDecimal((minStartX + gapbetweenorix),2);
                        
//                         let gapbetweenhighorix = ((moveshelf.highProdX - moveobj.OrigX) - additionalgap);
//                         let newshelfhighx = roundOffDecimal((minStartX + gapbetweenhighorix),2);
                        

//                         if(!checkThroughProductsTest(newshelflowx,minStartY,newshelfhighx,minEndY,prodStart,prodStartY,prodEnd,prodEndY)){
//                             selectedProds.push(prod);
//                         }
//                     }
//                 }
//             } else{
//                 let prodshelf = fieldobj.shelf.find(pshelf => pshelf.rank === prod.shelfrank);
//                 if(prodshelf){
//                     let prodshelfheight = (prodshelf.y + prodshelf.drawHeight + prodshelf.drawGap);

//                     let newstarty = JSON.parse(JSON.stringify(minStartY));
//                     let newendy = JSON.parse(JSON.stringify(minEndY));

//                     let isinsideshelf = (
//                         (newstarty >= prodshelf.y && prodshelfheight >= newstarty) || 
//                         (newendy >= prodshelfheight && prodshelf.y >= newstarty) ||
//                         (newendy > prodshelf.y && prodshelfheight >= newendy)
//                     );
                    
//                     if(ischeckoverlap && isinsideshelf){
//                         newstarty = (prodshelf.y);
//                         newendy = roundOffDecimal(prodshelfheight,2);
//                     }
                    
//                     if(!checkThroughProductsTest(roundminStartX,newstarty,roundminEndX,newendy,prodStart,prodStartY,prodEnd,prodEndY)){
//                         selectedProds.push(prod);
//                     }
//                 }
//             }
//         }
//     }
    
//     if(selectedProds.length === 0){
//         if(startProd === null){
//             isNoproducts=true
//         }else{
//             // selectedProds.push(startProd)
//         }
//     }

//     return {startProd:startProd,selectedProds:selectedProds,isNoproducts:isNoproducts}
// }

export function elmAccordingtoXY(x,y,width,height,mapFields,mapCatRects){
    // console.log(x,y,width,height,mapFields,mapCatRects);
    // let rectobj = {x: x, y:y, width:width, height: height};
    // let recty2 = (y + height);

    //x-pontx,y-point y, fields-fields structures,
    var objDetails = { field: null, catRectDetails: null, catrect: null };
    
    // check map 
    let selectedCatRect = null;
    let selectedRectKey = null;
    
    if(Object.keys(mapCatRects).length > 0){
        for (let key of Object.keys(mapCatRects)) {
            var catrect = mapCatRects[key];

            let rectx1 = roundOffDecimal(catrect.x,2);
            let recty1 = roundOffDecimal(catrect.y,2);
            let rectx2 = roundOffDecimal((catrect.x + catrect.drawWidth),2);
            let recty2 = roundOffDecimal((catrect.y + catrect.drawHeight),2);
            
            if(rectx1 <= x && recty1 <= y && rectx2 >= x && recty2 >= y){
                selectedCatRect = catrect;
                selectedRectKey = key;
            }
        }
    }
    
    if(selectedCatRect){
        let selectedField = mapFields[selectedCatRect.field_custom_id];
        let selectedFieldKey = selectedField.field_custom_id;
        // console.log(selectedCatRect, mapFields);

        let starty = null; 
        let heightmargin = 0;
        let currank = 0;

        let fieldcontainshelfs = [];
        let insiedonshelf=false
        for (let i = 0; i < selectedCatRect.contain_shelves.length; i++) {
            const Dshlf = selectedCatRect.contain_shelves[i];
            var insideshelf = checkhaveElementforxy(x,y,Dshlf)
            if(insideshelf){
                starty=Dshlf.y
                currank=Dshlf.rank
                insiedonshelf=true
            }
            
            if(starty!==null){
                if(currank !== Dshlf.rank){
                    break;
                }else{
                    heightmargin = heightmargin+Dshlf.drawHeight
                    currank=currank+1
                }
            }

            let findfieldshelf = selectedField.shelf.findIndex(fieldshelf => fieldshelf.rank === Dshlf.rank);
            if(findfieldshelf > -1){
                let foundfieldshelf = selectedField.shelf[findfieldshelf];
                let shelfheight = (foundfieldshelf.drawHeight + foundfieldshelf.drawGap);

                if(y <= (foundfieldshelf.y + shelfheight)){ //if(!foundfieldshelf.isDisable && y <= (foundfieldshelf.y + shelfheight)){      
                    fieldcontainshelfs.push(foundfieldshelf);
                }
            }
        }

        objDetails["catRectDetails"] = selectedCatRect;

        objDetails["catrect"] = {
            key:selectedRectKey, catrectId:selectedCatRect.id, drawWidth:selectedCatRect.drawWidth, drawHeight:selectedCatRect.drawHeight, x:selectedCatRect.x, y:selectedCatRect.y,
            drawHeightMargin:heightmargin, drawMarginstartY:starty
        }
        objDetails["field"] = {
            key:selectedFieldKey, fieldId: selectedField.fieldId, drawWidth:selectedField.drawWidth, drawHeight:selectedField.drawHeight, x:selectedField.x, y:selectedField.y,
            shelf:selectedField.shelf, contain_shelfs: fieldcontainshelfs,uom:selectedField.uom,field_custom_id:selectedField.field_custom_id
        }
        objDetails["isInsideShelf"]=insiedonshelf
    }
    
    // console.log(objDetails);
    return objDetails;
}

export function checkhaveElementforxy(x,y,elem){
    var isHave=false
    var startX=elem.x
    var startY=elem.y
    var endY=elem.y+elem.drawHeight
    var endX =elem.x+elem.drawWidth
    var isinX=(x>startX&&x<endX);
    var isinY=(y>startY&&y<endY);
    isHave=isinX&&isinY
    return isHave
}
//export simulation object to VMP view
export function exportSimulationToVMP(catrect, fields, prodlist, totaldivwidth, checksaftymargin){
    // console.log(catrect);

    //define data needed object and arrays
    let catlist = catrect;
    // let fieldlist = fields;
    
    //get first category object to get category details
    let firstcatitem = catlist[0];

    //create export object
    let exportobj = {
        mpHasCategoryId: firstcatitem.virtualBoxId,
        mpHasCategoryHasRectId: firstcatitem.id,
        sub_categories: [],
    };

    //product list loop and group same shelf sub categories with group
    let subcatlist = [];
    for (let i = 0; i < prodlist.length; i++) {
        const proditem = prodlist[i];

        if(!proditem.isDelete){
            // let prodfield = fields[proditem.field_custom_id];

            //get lowest x item before this product
            let lowestxprods = prodlist.filter(lowprod => (!lowprod.isDelete && lowprod.field_custom_id === proditem.field_custom_id && lowprod.shelfrank === proditem.shelfrank && lowprod.x < proditem.x));
            if(lowestxprods && lowestxprods.length > 0){
                let sortlowxprods = lowestxprods.sort((a,b) => b.x - a.x);
                let highestprod = sortlowxprods[0];

                proditem["isnoleftprods"] = false;
                proditem["leftprodid"] = highestprod.productId;
                proditem["leftprodendx"] =  roundOffDecimal((highestprod.x + highestprod.drawWidth),2);
                proditem["isleftprodsame"] = (highestprod.productId === proditem.productId);
                proditem["isleftscatsame"] = (getNameorIdorColorofBox(highestprod.subcategory, "num") === getNameorIdorColorofBox(proditem.subcategory, "num"));
                proditem["isleftbrandsame"] = (getNameorIdorColorofBox(highestprod.brand, "num") === getNameorIdorColorofBox(proditem.brand, "num"));
            } else{
                proditem["isnoleftprods"] = true; 
            }

            //get lowest x item before this product
            let highestxprods = prodlist.filter(highprod => (!highprod.isDelete && highprod.field_custom_id === proditem.field_custom_id && highprod.shelfrank === proditem.shelfrank && highprod.x > proditem.x));
            if(highestxprods && highestxprods.length > 0){
                let sorthighxprods = highestxprods.sort((a,b) => a.x - b.x);
                let lowestprod = sorthighxprods[0];

                proditem["isnorightprods"] = false;
                proditem["rightprodid"] = lowestprod.productId;
                proditem["rightprodstartx"] =  roundOffDecimal(lowestprod.x,2);
                proditem["isrightprodsame"] = (lowestprod.productId === proditem.productId);
                proditem["isrightscatsame"] = (getNameorIdorColorofBox(lowestprod.subcategory, "num") === getNameorIdorColorofBox(proditem.subcategory, "num"));
                proditem["isrightbrandsame"] = (getNameorIdorColorofBox(lowestprod.brand, "num") === getNameorIdorColorofBox(proditem.brand, "num"));
            } else{
                proditem["isnorightprods"] = true;
            }

            let prodsaftywidth = (proditem.drawWidth / 4);

            let prodx1 = roundOffDecimal((proditem.x - prodsaftywidth),2);
            let prody1 = roundOffDecimal(proditem.y,2);
            let prodx2 = roundOffDecimal((proditem.x + proditem.drawWidth),2);
            let prody2 = roundOffDecimal((proditem.y + proditem.drawHeight),2);

            let prodendx = (proditem.x + proditem.drawWidth);
            //find sub category added
            let prodscatid = getNameorIdorColorofBox(proditem.subcategory,"num");
            let findsubcatadded = subcatlist.findIndex(scat => getNameorIdorColorofBox(scat,"num") === prodscatid);

            if(findsubcatadded > -1){
                //find shelf added
                let foundscatitem = subcatlist[findsubcatadded];
                let findshelfadded = -1;
                for (let j = 0; j < foundscatitem.prodshelfs.length; j++) {
                    const findprodshelf = foundscatitem.prodshelfs[j];
                    if(findprodshelf.rank === proditem.shelfrank){
                        for (let l = 0; l < findprodshelf.prods.length; l++) {
                            const findshelfprod = findprodshelf.prods[l];
                            
                            if(findshelfprod.productId === proditem.productId){
                                let fprodx1 = roundOffDecimal(findshelfprod.x,2);
                                let fprody1 = roundOffDecimal(findshelfprod.y,2);
                                let fprodx2 = roundOffDecimal((findshelfprod.x + findshelfprod.drawWidth),2);
                                let fprody2 = roundOffDecimal((findshelfprod.y + findshelfprod.drawHeight),2);

                                let checkProdOverlapping = checkThroughProductsTest(prodx1, prody1, prodx2, prody2, fprodx1, fprody1, fprodx2, fprody2);
                                if (!checkProdOverlapping) {
                                    findshelfadded = j;
                                    break;
                                }
                            }
                        }
                    }
                    if(findshelfadded > -1){ break; }
                }

                //check lowest shelf is available that not in range of single check
                if(findshelfadded === -1){
                    if(proditem.isleftscatsame && foundscatitem.prodshelfs.length > 0){
                        let sortxbyhighest = foundscatitem.prodshelfs.sort((a,b) => b.x - a.x);
                        
                        let findlowsameshelf = sortxbyhighest.findIndex(lowshelf => lowshelf.rank === proditem.shelfrank && lowshelf.subCategoryId === getNameorIdorColorofBox(proditem.subcategory,"num") && lowshelf.startx < proditem.x);
                        if(findlowsameshelf > -1){
                            findshelfadded = findlowsameshelf;
                        }
                    }
                }
                
                if(findshelfadded > -1){
                    //update found shelf item
                    let foundshelfitem = foundscatitem.prodshelfs[findshelfadded];

                    let isstartxlow = (proditem.x < foundshelfitem.startx);
                    let isendxhigh = (prodendx > foundshelfitem.endx);

                    foundshelfitem.startx = roundOffDecimal((isstartxlow?proditem.x:foundshelfitem.startx),2);
                    foundshelfitem.endx = roundOffDecimal((isendxhigh?prodendx:foundshelfitem.endx),2);
                    
                    foundshelfitem.isleftscatsame = (isstartxlow?proditem.isleftscatsame:foundshelfitem.isleftscatsame);
                    foundshelfitem.leftprodendx = (isstartxlow?proditem.leftprodendx:foundshelfitem.leftprodendx);
                    foundshelfitem.isnoleftprods = (isstartxlow?proditem.isnoleftprods:foundshelfitem.isnoleftprods);

                    foundshelfitem.isrightscatsame = (isendxhigh?(proditem.isrightscatsame?proditem.isrightscatsame:false):foundshelfitem.isrightscatsame);
                    foundshelfitem.rightprodstartx = (isendxhigh?(proditem.rightprodstartx?proditem.rightprodstartx:0):foundshelfitem.rightprodstartx);
                    foundshelfitem.isnorightprods = (isendxhigh?proditem.isnorightprods:foundshelfitem.isnorightprods);

                    foundshelfitem.prods.push(proditem);

                } else{ //add new shelf
                    foundscatitem.prodshelfs.push(
                        {
                            productId: proditem.productId,
                            subCategoryId: getNameorIdorColorofBox(proditem.subcategory, "num"),
                            rank: proditem.shelfrank , 
                            startx: roundOffDecimal(proditem.x,2), 
                            endx: roundOffDecimal((proditem.x + proditem.drawWidth),2), 
                            prods: [proditem],

                            isleftscatsame: (proditem.isleftscatsame?proditem.isleftscatsame:false),
                            leftprodendx: (proditem.leftprodendx?proditem.leftprodendx:0),
                            isnoleftprods: (proditem.isnoleftprods?proditem.isnoleftprods:false),

                            isrightscatsame: (proditem.isrightscatsame?proditem.isrightscatsame:false),
                            rightprodstartx: (proditem.rightprodstartx?proditem.rightprodstartx:0),
                            isnorightprods: (proditem.isnorightprods?proditem.isnorightprods:false),
                        }
                    );
                }

            } else{ //add new sub category with new shelf object
                subcatlist.push({ 
                    id: uuidv4(),
                    sub_category: proditem.subcategory.sub_category,
                    type: proditem.subcategory.type,
                    rule: proditem.subcategory.rule,
                    rects: [],
                    prodshelfs: [
                        {
                            productId: proditem.productId,
                            subCategoryId: getNameorIdorColorofBox(proditem.subcategory, "num"),
                            rank: proditem.shelfrank , 
                            startx: roundOffDecimal(proditem.x,2), 
                            endx: roundOffDecimal((proditem.x + proditem.drawWidth),2), 
                            prods: [proditem],

                            isleftscatsame: (proditem.isleftscatsame?proditem.isleftscatsame:false),
                            leftprodendx: (proditem.leftprodendx?proditem.leftprodendx:0),
                            isnoleftprods: (proditem.isnoleftprods?proditem.isnoleftprods:false),

                            isrightscatsame: (proditem.isrightscatsame?proditem.isrightscatsame:false),
                            rightprodstartx: (proditem.rightprodstartx?proditem.rightprodstartx:0),
                            isnorightprods: (proditem.isnorightprods?proditem.isnorightprods:false),
                        }
                    ]
                });
            }    
        }
    }
    exportobj.sub_categories = subcatlist;

    //break subcat shelfs in to rects
    for (let j = 0; j < exportobj.sub_categories.length; j++) {
        const expsubcat = exportobj.sub_categories[j];
        expsubcat.prodshelfs = expsubcat.prodshelfs.sort((a,b) => a.rank - b.rank); //sort shelf list to lowest

        let scatrects = [];
        for (let l = 0; l < expsubcat.prodshelfs.length; l++) {
            //find scat rect already added
            const prodshelfitem = expsubcat.prodshelfs[l];
            let prodshelfwidth = (prodshelfitem.endx - prodshelfitem.startx);

            let checkshelfx_a = (prodshelfitem.startx - checksaftymargin);
            let checkshelfx_b = (prodshelfitem.startx + checksaftymargin);

            let checkshelfx2_a = ((prodshelfitem.startx + prodshelfwidth) - checksaftymargin);
            let checkshelfx2_b = ((prodshelfitem.startx + prodshelfwidth) + checksaftymargin);

            let findscatrect = scatrects.findIndex(scatrect => {
                return (scatrect.lastrank + 1) === prodshelfitem.rank && 
                (scatrect.x >= checkshelfx_a && checkshelfx_b >= scatrect.x) && 
                (checkshelfx2_a <= (scatrect.x + scatrect.width) && (scatrect.x + scatrect.width) <= checkshelfx2_b)
            });

            if(findscatrect === -1){
                //find if shelf is free to merge
                findscatrect = scatrects.findIndex(scatrect => {
                    let scatrectwidth = (scatrect.x + scatrect.width);

                    return (scatrect.lastrank + 1) === prodshelfitem.rank && 
                    ((scatrect.x <= prodshelfitem.startx && prodshelfitem.isnoleftprods) || (scatrect.x <= prodshelfitem.startx && prodshelfitem.leftprodendx < scatrect.x) || 
                    (scatrect.x >= prodshelfitem.startx && scatrect.isnoleftprods) || (scatrect.x >= prodshelfitem.startx && scatrect.leftprodendx < prodshelfitem.startx)) &&

                    ((scatrectwidth >= prodshelfitem.endx && prodshelfitem.isnorightprods) || (scatrectwidth >= prodshelfitem.endx && prodshelfitem.rightprodstartx > scatrectwidth) || 
                    (scatrectwidth <= prodshelfitem.endx && scatrect.isnorightprods) || (scatrectwidth <= prodshelfitem.endx && scatrect.rightprodstartx > prodshelfitem.endx))
                });
            }

            if(findscatrect > -1){
                let foundscatrect = scatrects[findscatrect];
                let foundrectwidth = (foundscatrect.x + foundscatrect.width);

                let isstartxlow = (prodshelfitem.startx < foundscatrect.x);
                let isendxhigh = (prodshelfitem.endx > foundrectwidth);

                foundscatrect.lastrank = prodshelfitem.rank;
                foundscatrect.contain_shelves.push({id: uuidv4(), rank: prodshelfitem.rank });

                foundscatrect.x = roundOffDecimal((isstartxlow?prodshelfitem.startx:foundscatrect.x),2);
                foundscatrect.width = roundOffDecimal((isendxhigh?(prodshelfitem.endx - foundscatrect.x):foundscatrect.width),2);

                foundscatrect.isleftscatsame = (isstartxlow?prodshelfitem.isleftscatsame:foundscatrect.isleftscatsame);
                foundscatrect.leftprodendx = (isstartxlow?prodshelfitem.leftprodendx:foundscatrect.leftprodendx);
                foundscatrect.isnoleftprods = (isstartxlow?prodshelfitem.isnoleftprods:foundscatrect.isnoleftprods);

                foundscatrect.isrightscatsame = (isendxhigh?prodshelfitem.isrightscatsame:foundscatrect.isrightscatsame);
                foundscatrect.rightprodstartx = (isendxhigh?prodshelfitem.rightprodstartx:foundscatrect.rightprodstartx);
                foundscatrect.isnorightprods = (isendxhigh?prodshelfitem.isnorightprods:foundscatrect.isnorightprods);

                let scatbrandlist = foundscatrect.brands;
                for (let k = 0; k < prodshelfitem.prods.length; k++) {
                    const shelfprod = prodshelfitem.prods[k];
                    let prodbrandid = getNameorIdorColorofBox(shelfprod.brand, "num");

                    let findbranditem = scatbrandlist.findIndex(rectbrand => getNameorIdorColorofBox(rectbrand, "num") === prodbrandid);
                    
                    if(findbranditem > -1){
                        let foundbranditem = scatbrandlist[findbranditem];
                        foundbranditem.brandprods.push(shelfprod);
                        
                    } else{
                        scatbrandlist.push({
                            id: uuidv4(),
                            brand: shelfprod.brand.brand,
                            type: shelfprod.brand.type,
                            rule: shelfprod.brand.rule,
                            rects: [],
                            brandprods: [shelfprod],
                        });
                    }
                }
                foundscatrect.brands = scatbrandlist;

            } else{
                
                let scatbrandlist = [];
                for (let k = 0; k < prodshelfitem.prods.length; k++) {
                    const shelfprod = prodshelfitem.prods[k];
                    let prodbrandid = getNameorIdorColorofBox(shelfprod.brand, "num");

                    let findbranditem = scatbrandlist.findIndex(rectbrand => getNameorIdorColorofBox(rectbrand, "num") === prodbrandid);
                    
                    if(findbranditem > -1){
                        let foundbranditem = scatbrandlist[findbranditem];
                        foundbranditem.brandprods.push(shelfprod);
                        
                    } else{
                        scatbrandlist.push({
                            id: uuidv4(),
                            brand: shelfprod.brand.brand,
                            type: shelfprod.brand.type,
                            rule: shelfprod.brand.rule,
                            rects: [],
                            brandprods: [shelfprod],
                        });
                    }
                }

                scatrects.push({
                    id: uuidv4(),
                    box_width_percentage: convertWidthPercent(prodshelfwidth, totaldivwidth),
                    isSnapped: false,
                    x: roundOffDecimal(prodshelfitem.startx,2),
                    x_percentage: convertWidthPercent(prodshelfitem.startx, totaldivwidth),
                    width: prodshelfwidth,
                    lastrank: prodshelfitem.rank,
                    contain_shelves: [
                        {id: uuidv4(), rank: prodshelfitem.rank }
                    ],
                    brands: scatbrandlist,

                    isleftscatsame: (prodshelfitem.isleftscatsame?prodshelfitem.isleftscatsame:false),
                    leftprodendx: (prodshelfitem.leftprodendx?prodshelfitem.leftprodendx:0),
                    isnoleftprods: (prodshelfitem.isnoleftprods?prodshelfitem.isnoleftprods:false),

                    isrightscatsame: (prodshelfitem.isrightscatsame?prodshelfitem.isrightscatsame:false),
                    rightprodstartx: (prodshelfitem.rightprodstartx?prodshelfitem.rightprodstartx:0),
                    isnorightprods: (prodshelfitem.isnorightprods?prodshelfitem.isnorightprods:false),
                });
            }
        }

        //final finishes of rect object
        for (let z = 0; z < scatrects.length; z++) {
            const scatrectitem = scatrects[z];
            
            for (let x = 0; x < scatrectitem.brands.length; x++) {
                const scatbranditem = scatrectitem.brands[x];
                
                let brandrects = [];
                for (let c = 0; c < scatbranditem.brandprods.length; c++) {
                    const brandproditem = scatbranditem.brandprods[c];
                    let branditemx2 = (brandproditem.x + brandproditem.drawWidth);

                    let prodsaftywidth = (brandproditem.drawWidth / 4);

                    let prodx1 = roundOffDecimal((brandproditem.x - prodsaftywidth),2);
                    let prody1 = roundOffDecimal(brandproditem.y,2);
                    let prodx2 = roundOffDecimal((brandproditem.x + brandproditem.drawWidth),2);
                    let prody2 = roundOffDecimal((brandproditem.y + brandproditem.drawHeight),2);

                    let findbrandrect = -1;
                    for (let v = 0; v < brandrects.length; v++) {
                        const brandrect = brandrects[v];
                        if(brandrect.lastrank === brandproditem.shelfrank){
                            for (let l = 0; l < brandrect.products.length; l++) {
                                const blockrectprod = brandrect.products[l];
                                
                                if(blockrectprod.productId === brandproditem.productId){
                                    let fprodx1 = roundOffDecimal(blockrectprod.x,2);
                                    let fprody1 = roundOffDecimal(blockrectprod.y,2);
                                    let fprodx2 = roundOffDecimal((blockrectprod.x + blockrectprod.drawWidth),2);
                                    let fprody2 = roundOffDecimal((blockrectprod.y + blockrectprod.drawHeight),2);
    
                                    let checkProdOverlapping = checkThroughProductsTest(prodx1, prody1, prodx2, prody2, fprodx1, fprody1, fprodx2, fprody2);
                                    if (!checkProdOverlapping) {
                                        findbrandrect = v;
                                    }
                                }
                            }
                        }
                    }

                    if(findbrandrect === -1){
                        //check lowest brand shelf is available that not in range of single check
                        if(brandproditem.isleftbrandsame && brandrects.length > 0){
                            let sortxbyhighest = brandrects.sort((a,b) => b.x - a.x);
                            
                            let findlowsameshelf = sortxbyhighest.findIndex(lowshelf => lowshelf.lastrank === brandproditem.shelfrank && lowshelf.brandId === getNameorIdorColorofBox(brandproditem.brand,"num") && lowshelf.x < brandproditem.x);
                            if(findlowsameshelf > -1){
                                findbrandrect = findlowsameshelf;
                            }
                        }
                    }

                    if(findbrandrect > -1){
                        let foundbrandrect = brandrects[findbrandrect];
                        let foundbrandrx2 = (foundbrandrect.x + foundbrandrect.width);

                        foundbrandrect.x = roundOffDecimal((brandproditem.x < foundbrandrect.x?brandproditem.x:foundbrandrect.x),2);
                        foundbrandrect.x_percentage = convertWidthPercent(foundbrandrect.x, scatrectitem.width);
                        foundbrandrect.width = roundOffDecimal((branditemx2 > foundbrandrx2?(branditemx2 - foundbrandrect.x):foundbrandrect.width),2);
                        foundbrandrect.box_width_percentage = convertWidthPercent(foundbrandrect.width, scatrectitem.width);
                        foundbrandrect.products.push(brandproditem);

                        let isstartxlow = (brandproditem.x < foundbrandrect.x);
                        let isendxhigh = (branditemx2 > foundbrandrx2);

                        foundbrandrect.isleftbrandsame = (isstartxlow?brandproditem.isleftbrandsame:foundbrandrect.isleftbrandsame);
                        foundbrandrect.leftprodendx = (isstartxlow?brandproditem.leftprodendx:foundbrandrect.leftprodendx);
                        foundbrandrect.isnoleftprods = (isstartxlow?brandproditem.isnoleftprods:foundbrandrect.isnoleftprods);

                        foundbrandrect.isrightbrandsame = (isendxhigh?(brandproditem.isrightbrandsame?brandproditem.isrightbrandsame:false):foundbrandrect.isrightbrandsame);
                        foundbrandrect.rightprodstartx = (isendxhigh?(brandproditem.rightprodstartx?brandproditem.rightprodstartx:0):foundbrandrect.rightprodstartx);
                        foundbrandrect.isnorightprods = (isendxhigh?brandproditem.isnorightprods:foundbrandrect.isnorightprods);

                    } else{
                        brandrects.push({
                            id: uuidv4(),
                            x: roundOffDecimal(brandproditem.x,2),
                            x_percentage: convertWidthPercent(brandproditem.x, scatrectitem.width),
                            isSnapped: false,
                            width: roundOffDecimal((branditemx2 - brandproditem.x),2),
                            box_width_percentage: convertWidthPercent((branditemx2 - brandproditem.x), scatrectitem.width),
                            lastrank: brandproditem.shelfrank,
                            brandId: getNameorIdorColorofBox(brandproditem.brand, "num"),
                            contain_shelves: [
                                {id: uuidv4(), rank: brandproditem.shelfrank }
                            ],
                            products: [brandproditem],

                            isleftbrandsame: (brandproditem.isleftbrandsame?brandproditem.isleftbrandsame:false),
                            leftprodendx: (brandproditem.leftprodendx?brandproditem.leftprodendx:0),
                            isnoleftprods: (brandproditem.isnoleftprods?brandproditem.isnoleftprods:false),

                            isrightbrandsame: (brandproditem.isrightbrandsame?brandproditem.isrightbrandsame:false),
                            rightprodstartx: (brandproditem.rightprodstartx?brandproditem.rightprodstartx:0),
                            isnorightprods: (brandproditem.isnorightprods?brandproditem.isnorightprods:false),
                        });
                    }
                }

                //merge brand rects if they align by same x1,x2 values
                let updatedbrandrects = [];
                
                brandrects = brandrects.sort((a,b) => a.lastrank - b.lastrank);

                for (let j = 0; j < brandrects.length; j++) {
                    const brandrectitem = brandrects[j];
                    let brandrectwidth = (brandrectitem.x + brandrectitem.width);

                    let checkbrectx_a = (brandrectitem.x - checksaftymargin);
                    let checkbrectx_b = (brandrectitem.x + checksaftymargin);

                    let checkbrectx2_a = (brandrectwidth - checksaftymargin);
                    let checkbrectx2_b = (brandrectwidth + checksaftymargin);

                    let findbrandrect = updatedbrandrects.findIndex(brandrect => {
                        return (brandrect.lastrank + 1) === brandrectitem.lastrank && 
                        (brandrect.x >= checkbrectx_a && checkbrectx_b >= brandrect.x) && 
                        (checkbrectx2_a <= (brandrect.x + brandrect.width) && (brandrect.x + brandrect.width) <= checkbrectx2_b)
                    });

                    if(findbrandrect === -1){
                        //find if shelf is free to merge
                        findbrandrect = updatedbrandrects.findIndex(brandrect => {
                            let checkbrandrectwidth = (brandrect.x + brandrect.width);
        
                            return (brandrect.lastrank + 1) === brandrectitem.lastrank && 
                            ((brandrect.x <= brandrectitem.x && brandrectitem.isnoleftprods) || (brandrect.x <= brandrectitem.x && brandrectitem.leftprodendx < brandrect.x) || 
                            (brandrect.x >= brandrectitem.x && brandrect.isnoleftprods) || (brandrect.x >= brandrectitem.x && brandrect.leftprodendx < brandrectitem.x)) &&
        
                            ((checkbrandrectwidth >= brandrectwidth && brandrectitem.isnorightprods) || (checkbrandrectwidth >= brandrectwidth && brandrectitem.rightprodstartx > checkbrandrectwidth) || 
                            (checkbrandrectwidth <= brandrectwidth && brandrect.isnorightprods) || (checkbrandrectwidth <= brandrectwidth && brandrect.rightprodstartx > brandrectwidth))
                        });
                    }

                    if(findbrandrect > -1){
                        let updaterectobj = updatedbrandrects[findbrandrect];
                        let updaterectx2 = (updaterectobj.x + updaterectobj.width);

                        let isstartxlow = (brandrectitem.x < updaterectobj.x);
                        let isendxhigh = (brandrectwidth > updaterectx2);

                        updaterectobj.x = (isstartxlow?brandrectitem.x:updaterectobj.x);
                        updaterectobj.width = (isendxhigh?(roundOffDecimal(brandrectwidth - updaterectobj.x),2):updaterectobj.width);

                        updaterectobj.contain_shelves = updaterectobj.contain_shelves.concat(brandrectitem.contain_shelves);
                        updaterectobj.products = updaterectobj.products.concat(brandrectitem.products);
                        updaterectobj.lastrank = brandrectitem.lastrank;
                    } else{
                        let xgapbetweenscat = (brandrectitem.x - scatrectitem.x);
                        
                        brandrectitem.x_percentage = convertWidthPercent(xgapbetweenscat, scatrectitem.width);
                        brandrectitem.box_width_percentage = convertWidthPercent(brandrectitem.width, scatrectitem.width);
                        
                        updatedbrandrects.push(brandrectitem);
                    }
                }

                scatbranditem.rects = updatedbrandrects;
            }
        }

        expsubcat.rects = scatrects;
    }

    return exportobj;
}
//get snapping location
export function getSnappingLocation (clowestprodx, selectingField, existingProducts, movingObj, containshelfs){
    // if( selectingField.field_custom_id===undefined){
    //     alertService.error("field_custom_id not passing")
    // }
    
    let lowestprodx = clowestprodx;

    let lowXProds = existingProducts.filter(z => !z.isDelete && (containshelfs.length > 0?(z.shelfrank === containshelfs[0].rank):true) && (z.x < lowestprodx)&& (z.field_custom_id === selectingField.field_custom_id));//chnged to filter by field
    let highestXProds = existingProducts.filter(z => !z.isDelete && (containshelfs.length > 0?(z.shelfrank === containshelfs[0].rank):true) && (z.x >= (lowestprodx+movingObj.drawWidth))&&(z.field_custom_id === selectingField.field_custom_id));//chnged to filter by field
 
    let newdrawingprods = (movingObj.newDrawingProducts?movingObj.newDrawingProducts:movingObj.products?movingObj.products:[]);
    let firstdrawitem = (newdrawingprods && newdrawingprods.length > 0?newdrawingprods[0]:movingObj);
    
    let checkprodwidth = (((firstdrawitem.drawWidth / 3) > 8)?(firstdrawitem.drawWidth / 3):(firstdrawitem.drawWidth / 2));

    let notUpdatedX = false;
    //console.log(highestXProds.length);
    if(highestXProds.length>0){
        let sortxbylowest = highestXProds.sort((a,b) => a.x - b.x);
        
        let notdroppinglowest = null;
        for (let l = 0; l < sortxbylowest.length; l++) {
            const sortlitem = sortxbylowest[l];
            let isfindindrop = newdrawingprods.findIndex(k => k.id === sortlitem.id);

            if(isfindindrop === -1){
                notdroppinglowest = sortlitem;
                break;
            }
        }
        
        if(notdroppinglowest){
            let sortitemx1 = notdroppinglowest.x;
            let sortitemx2 = (notdroppinglowest.x + notdroppinglowest.drawWidth);
            
            let moveprodx2 = (lowestprodx + movingObj.drawWidth);

            let checkprodwidth = (((notdroppinglowest.drawWidth / 3) > 8)?(notdroppinglowest.drawWidth / 3):(notdroppinglowest.drawWidth / 2));
            
            let saftylowestx = (moveprodx2 + checkprodwidth);
            let sortitemx1safty = (sortitemx1 - checkprodwidth);
            
            if((saftylowestx >= sortitemx1 || sortitemx1safty <= moveprodx2) && saftylowestx <= sortitemx2){ //
                lowestprodx =(notdroppinglowest.x - movingObj.drawWidth);
                // lowestprodx = roundOffDecimal((notdroppinglowest.x - movingObj.drawWidth),2);
            } else{
                notUpdatedX = true;
            }
        }
    }else{
        notUpdatedX = true;
    }

    if(notUpdatedX){
        let saftyheighstx= (lowestprodx + movingObj.drawWidth + checkprodwidth);
        
        if(saftyheighstx >= (selectingField.x+selectingField.drawWidth)){
            lowestprodx= ((selectingField.x+selectingField.drawWidth) - movingObj.drawWidth);
        }
    } else{
        //if end x is more than field end x
        let checkheighstx= (lowestprodx + movingObj.drawWidth);
        
        if(checkheighstx >= (selectingField.x+selectingField.drawWidth)){
            lowestprodx= ((selectingField.x+selectingField.drawWidth) - movingObj.drawWidth);
        }
    }

    if(lowXProds.length > 0){
        let sortxbyhighest = lowXProds.sort((a,b) => b.x - a.x);
        
        let notdroppinghighest = null;
        for (let l = 0; l < sortxbyhighest.length; l++) {
            const sortlitem = sortxbyhighest[l];
            let isfindindrop = newdrawingprods.findIndex(k => k.id === sortlitem.id);

            if(isfindindrop === -1){
                notdroppinghighest = sortlitem;
                break;
            }
        }
        
        if(notdroppinghighest){
            let sortitemx1 = notdroppinghighest.x;
            let sortitemx2 = (notdroppinghighest.x + notdroppinghighest.drawWidth);

            let saftylowestx = (lowestprodx - checkprodwidth);
            let sortitemx2safty = (sortitemx2 + checkprodwidth);
            
            if(saftylowestx >= sortitemx1 && (saftylowestx <= sortitemx2 || sortitemx2safty >= lowestprodx)){ //
                lowestprodx = (notdroppinghighest.x + notdroppinghighest.drawWidth);
                // lowestprodx = roundOffDecimal((notdroppinghighest.x + notdroppinghighest.drawWidth),2);
            }
        }
        
    } else{
        let saftylowestx = (lowestprodx - checkprodwidth);
        if(saftylowestx <= selectingField.x){
            lowestprodx = selectingField.x;
        }
        
    }

    return lowestprodx;
}
//get rule percentage status by compare percentages
export function getRulePercentageStatus(ruleobj){
    let exportstate = "default";
    if(ruleobj){
        let gapbetweenpercentages = (ruleobj.rulePercentage - ruleobj.simulatedPercentage);
        
        if((gapbetweenpercentages > 0 && gapbetweenpercentages > 5) || (gapbetweenpercentages < 0 && gapbetweenpercentages < -5)){
            exportstate = "danger";
        } else if(gapbetweenpercentages > 0 || gapbetweenpercentages < 0){
            exportstate = "warning";
        }
    }

    return exportstate;
}
//find and update rule percentage
export function getAllRuleWarnings(catlist, rulelist, prodlist, isonload, issingleobj, ruleindexes) {
    let exportrulelist = (rulelist && rulelist.length > 0?rulelist:[]);
    var mainwarnstateArray=[]
    if(issingleobj){
        if(exportrulelist.length > 0){
            let findcatobj = Object.keys(catlist).filter(catkey => catlist[catkey].id === exportrulelist[ruleindexes.parentidx].categoryId);

            if(findcatobj && findcatobj.length > 0){
                let ccatobj = catlist[findcatobj[0]];
                let totalcatwidth = (ccatobj.drawWidth * ccatobj.contain_shelves.length);
                
                let rulesubobj = exportrulelist[ruleindexes.parentidx].subCategoryRulePercentageDtos[ruleindexes.ruleidx];

                let filterruleprods = prodlist.filter(x => !x.isDelete && 
                    ((rulesubobj.level === catRuleEnums.brand && getNameorIdorColorofBox(x.subcategory, "num") === rulesubobj.brand.brandId) ||
                    (rulesubobj.level === catRuleEnums.sup && getNameorIdorColorofBox(x.subcategory, "num") === rulesubobj.supplier.supplierId) ));
                    
                if(filterruleprods.length > 0){
                    let totalfilter = filterruleprods.reduce((parenttotal, filteritem) => {
                        return parenttotal + filteritem.drawWidth;
                    }, 0);
                    
                    rulesubobj["simulatedPercentage"] = roundOffDecimal(convertWidthPercent(totalfilter, totalcatwidth),2);
                } else{
                    rulesubobj["simulatedPercentage"] = 0;
                }
            }
        }

    }

    let iswarnavailable = false;
    let totalwarncount = 0;
    for (let i = 0; i < exportrulelist.length; i++) {
        const ruleitem = exportrulelist[i];

        let findcatobj = Object.keys(catlist).filter(catkey => catlist[catkey].id === ruleitem.categoryId);
        
        if(findcatobj && findcatobj.length > 0){
            let ccatobj = catlist[findcatobj[0]];
            // let cfieldobj = fieldlist[ccatobj.field_custom_id];

            // let heightdetails = findHeightFromShelves(ccatobj.contain_shelves, cfieldobj, true);
            let totalcatwidth = (ccatobj.drawWidth * ccatobj.contain_shelves.length);
            // console.log(totalcatwidth);
            
            for (let j = 0; j < ruleitem.subCategoryRulePercentageDtos.length; j++) {
                const subruleitem = ruleitem.subCategoryRulePercentageDtos[j];

                //if not onload check product list to find available products to checking rule
                if(!isonload && !issingleobj){
                    let filterruleprods = prodlist.filter(x => !x.isDelete && 
                        ((subruleitem.level === catRuleEnums.brand && getNameorIdorColorofBox(x.subcategory, "num") === subruleitem.brand.brandId) ||
                        (subruleitem.level === catRuleEnums.sup && getNameorIdorColorofBox(x.subcategory, "num") === subruleitem.supplier.supplierId) ));

                    if(filterruleprods.length > 0){
                        let totalfilter = filterruleprods.reduce((parenttotal, filteritem) => {
                            return parenttotal + filteritem.drawWidth;
                        }, 0);
                        
                        subruleitem["simulatedPercentage"] = roundOffDecimal(convertWidthPercent(totalfilter, totalcatwidth),2);
                    } else{
                        subruleitem["simulatedPercentage"] = 0;
                    }
                }

                subruleitem["ruleState"] = getRulePercentageStatus(subruleitem);
                if(subruleitem.ruleState==="danger"){
                    mainwarnstateArray.push(1)
                }else if(subruleitem.ruleState==="warning"){
                    mainwarnstateArray.push(2)
                }else if(subruleitem.ruleState==="default"){
                    mainwarnstateArray.push(3)
                }
                
                if(subruleitem.ruleState !== "default"){
                    iswarnavailable = true;
                }

                totalwarncount += 1;
            }
            // var mainWarnStatus=mainwarnstateArray.some(a=>a===1)?"danger":mainwarnstateArray.some(b=>b===2)?"warning":"default"
        }
        
    }    
    var mainWarnStatus=mainwarnstateArray.some(a=>a===1)?"danger":mainwarnstateArray.some(b=>b===2)?"warning":"default"
    
    
    return {iswarn: {isshow: iswarnavailable, totalcount: totalwarncount,mainWarnStatus:mainWarnStatus}, rulelist: exportrulelist };
}
//find available rule for brand 
export function findRuleAvailableForBrand(brandid, isrulebrand, rulelevel, rulelist) {

    let exportruleobj = {isavailable: false, ruleparentidx: -1, ruleidx: -1, ruleobj: null};
    for (let i = 0; i < rulelist.length; i++) {
        const ruleparent = rulelist[i];
        
        for (let j = 0; j < ruleparent.subCategoryRulePercentageDtos.length; j++) {
            const ritem = ruleparent.subCategoryRulePercentageDtos[j];

            let ritemid = (ritem.level === catRuleEnums.sup?ritem.supplier.supplierId:ritem.level === catRuleEnums.brand?ritem.brand.brandId:-1);
            if((isrulebrand && (ritem.level === rulelevel && ritemid === brandid)) ||
            (!isrulebrand && ritem.level === catRuleEnums.brand && ritemid === brandid)){
                exportruleobj.isavailable = true;
                exportruleobj.ruleparentidx = i;
                exportruleobj.ruleidx = j;
                exportruleobj.ruleobj = ritem;

                break;
            }
        }

        if(exportruleobj.isavailable){ break; }
    }

    return exportruleobj;
}
export function convertProductstoFullScreen(products,displayRatio,fullScreenRatio){
    var prods=   products
    prods.forEach(prod => {
        prod.drawHeight=(prod.drawHeight/displayRatio)*fullScreenRatio
        prod.drawWidth=(prod.drawWidth/displayRatio)*fullScreenRatio
        prod.x=(prod.x/displayRatio)*fullScreenRatio
        prod.y=(prod.y/displayRatio)*fullScreenRatio
    });
    return prods
}
export function convertfieldstoFullScreen(filedmapobj, displayRatio, fullScreenRatio, displayUOM, actualFields){
    
    var svgwidth=0
    var cfiledmapobj=filedmapobj
    for (let key of Object.keys(cfiledmapobj)) {
        var fieldobj = cfiledmapobj[key];
        fieldobj.drawHeight=(fieldobj.drawHeight/displayRatio)*fullScreenRatio
        fieldobj.drawWidth=(fieldobj.drawWidth/displayRatio)*fullScreenRatio
        fieldobj.x=(fieldobj.x/displayRatio)*fullScreenRatio
        fieldobj.y=(fieldobj.y/displayRatio)*fullScreenRatio
        fieldobj.startYgap=(fieldobj.startYgap/displayRatio)*fullScreenRatio
        fieldobj.drawHeight=(fieldobj.drawHeight/displayRatio)*fullScreenRatio
        fieldobj.realFieldDrawWidth = ((fieldobj.realFieldDrawWidth / displayRatio) * fullScreenRatio);

        //find original field object
        let oriFieldObj = actualFields.find(x => x.mpField.id === cfiledmapobj[key].mpFieldId);
        if(oriFieldObj){
            let oriMdObj = oriFieldObj.mpField;
            fieldobj.oriFieldDrawWidth = measureConverter(oriMdObj.field_uom, displayUOM, oriMdObj.field_width) * fullScreenRatio;
        }
        
        fieldobj.separators.forEach(sep => {
            sep.drawX=(sep.drawX/displayRatio)*fullScreenRatio
        });

        fieldobj.shelf.forEach(shlf => {
            shlf.drawHeight=(shlf.drawHeight/displayRatio)*fullScreenRatio
            shlf.drawWidth=(shlf.drawWidth/displayRatio)*fullScreenRatio
            shlf.y=(shlf.y/displayRatio)*fullScreenRatio
            shlf.x=(shlf.x/displayRatio)*fullScreenRatio
            shlf.drawGap=(shlf.drawGap/displayRatio)*fullScreenRatio
        });

        svgwidth=svgwidth+ fieldobj.drawWidth
    }
   return {svgWidth:svgwidth,fields:cfiledmapobj} 

}

//validate heirarchy missing details in dropping products
export function validateHeirarchyMissings(draggingProduct, deptid, deptname) {
    let validateList = [];
    let heirarchyMissingTypes = [];

    if(!draggingProduct.width || !draggingProduct.height || !draggingProduct.uom || draggingProduct.uom === "" || !draggingProduct.depth){
        heirarchyMissingTypes.push("DETAILS");
        // validateList.push({type:"Dimension",text:i18n.t('PROD_DIMENTIONS_NOTAVAILABLE')})
    } 
    
    if(!draggingProduct.brandId || draggingProduct.brandId === undefined || draggingProduct.brandId === -1){
        heirarchyMissingTypes.push("BRAND");
    }

    if(!draggingProduct.imageUrl || draggingProduct.imageUrl === "" || draggingProduct.imageSource==="Default"){
        heirarchyMissingTypes.push("IMAGE");
        // validateList.push({type:"image",text:i18n.t('PROD_IMAGE_NOTFOUND')})
    } 
    
    if(draggingProduct.hierarchyCompleteStatus==="HaveIssues"){
        heirarchyMissingTypes.push("HEIRARCHY");
        // validateList.push({type:"Hierarchy_Issue",text:i18n.t('Hierarchy_Issue')})
    } 

    if(heirarchyMissingTypes.length > 0){
        let missingHeirarchyMsg = 'PRODUCT_IS_MISSING_';
        for (let k = 0; k < heirarchyMissingTypes.length; k++) {
            missingHeirarchyMsg += (heirarchyMissingTypes[k]+(heirarchyMissingTypes.length === (k + 1)?"":"_"));
        }

        validateList.push({type:"Hierarchy_Issue",text:i18n.t(missingHeirarchyMsg)});
    }

    if(deptid > 0 && draggingProduct.departmentId > 0 && deptid !== draggingProduct.departmentId){
        validateList.push({type:"Department", text: i18n.t('Product_department_not_matching')+" ("+deptname+")"})
    }
    
    if(draggingProduct.mpUsageStatus==="Archived" ){
        validateList.push({type:"Archived",text:i18n.t('Product_is_Archived')})
    } 
    
    if(draggingProduct.mpUsageStatus==="New" ){
        validateList.push({type:"New",text:i18n.t('Product_is_NewProduct')})
    } 
    
    if(draggingProduct.mpUsageStatus === "None"){
        validateList.push({type:"None",text:i18n.t('product_Didnt_sendto_dep')})
    }

    return validateList;
}