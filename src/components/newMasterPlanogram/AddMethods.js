
import React, { Component } from 'react';
import { Col, Row, OverlayTrigger, Tooltip, Popover } from 'react-bootstrap';
import { alertService } from '../../_services/alert.service';
import { v4 as uuidv4 } from 'uuid'; //unique id

//import { alertService } from '../../_services/alert.service';
//import { removeGhostImage } from '../common_layouts/ghostDragWrapper';

import { roundOffDecimal, measureConverter, floorAspectRatioDrawBox } from '../../_services/common.service';
import { checkThroughProductsTest } from '../planograms/planDisplayUnit/additionalcontents';

import { catRectEnums, catRuleEnums } from '../../enums/masterPlanogramEnums';

//adjust draw rect size by field shelves
export function checkDrawRectInShelve (drawfield, subobj, drawWidth, isbrand, rectobj) {
    // console.log(subobj);
    let adjustobj = JSON.parse(JSON.stringify(rectobj));
    adjustobj["y"] = 0;
    adjustobj["height"] = 0;

    let rectheight = roundOffDecimal((rectobj.y + rectobj.height),2);
    let saftyxvalue = 0.01;
    let saftyyvalue = 2;
    
    //if y value is less than zero
    adjustobj.y = (adjustobj.y < 0?0:adjustobj.y);
    
    let fieldstotal = drawWidth; let containshleves = []; //define fieldtotal and contain shelve arr
    //check field object - to adjust height to each shelve
    if(drawfield){
        //loop field shelve to adjust rect height with shelve heights
        let newfieldheight = 0;
        let shelfitems = (drawfield.field_shelves?drawfield.field_shelves:drawfield.shelf?drawfield.shelf:[]);
        
        for (let i = 0; i < shelfitems.length; i++) {
            const shelfitem = shelfitems[i];
            
            let issubcontains = (subobj?subobj.contain_shelves.findIndex(x => x.rank === shelfitem.rank):-1);
            
            let shelveyheight = roundOffDecimal((shelfitem.y + shelfitem.drawHeight + shelfitem.drawGap),2); //shelf height
            // let extrashelfy = roundOffDecimal((shelfitem.y + (shelfitem.drawHeight / 2)),2); //add more half of shelve height to shelf y
            let extrashelfy = roundOffDecimal((shelfitem.y + saftyyvalue),2);
            let extrashelfheight = roundOffDecimal((shelveyheight + (shelfitem.drawHeight / 2)),2); //add more half of shelve height to shelf height

            if(shelveyheight > rectobj.y){
                if(issubcontains > -1){
                    // let checky1 = (shelfitem.y - (shelfitem.drawHeight / 2));
                    let checky1 = (shelfitem.y - saftyyvalue); // changed 2023/03/23 - large shelves half reduce portion is more less than draw rect y
                    //let checky2 = (shelveyheight - (shelfitem.drawHeight / 2));
                    
                    if((rectobj.y >= checky1) && (shelveyheight > rectobj.y)){
                        adjustobj.y = roundOffDecimal(shelfitem.y,2);
                    }
                    //console.log(rectheight , extrashelfy , extrashelfheight , rectheight);
                    if((rectheight >= extrashelfy) && (extrashelfheight >= rectheight)){
                        adjustobj.height = roundOffDecimal((shelveyheight - adjustobj.y),2);
                    }
                    //console.log(drawfield.field_shelves.length , (i + 1) , extrashelfheight , rectheight);

                    let sortcontainshelves = [];
                    if(subobj){
                        sortcontainshelves = subobj.contain_shelves.sort((a, b) => a.rank - b.rank);
                    }
                    //if its more than last field shelf item height
                    let checklength = (subobj?sortcontainshelves[(subobj.contain_shelves.length - 1)].rank:drawfield.field_shelves.length);
                    
                    if(checklength === (i + 1) && (extrashelfheight < rectheight)){
                        adjustobj.height = roundOffDecimal((shelveyheight - adjustobj.y),2);
                    } 

                    //if adjustable height is less than one shelve
                    /* if(roundOffDecimal((shelfitem.drawHeight + shelfitem.drawGap),2) > roundOffDecimal(adjustobj.height,2)){
                        adjustobj.height = roundOffDecimal((shelfitem.drawHeight + shelfitem.drawGap),2);
                    } */
                } else{
                    if(adjustobj.y !== 0 && shelfitem.y > adjustobj.y){
                        break;
                    }
                }

                newfieldheight = newfieldheight + (shelfitem.drawHeight + shelfitem.drawGap);
            }
            
        }  
        
        let newxend = roundOffDecimal((adjustobj.y + adjustobj.height),2);
        
        for (let i = 0; i < shelfitems.length; i++) {
            const shelfitem = shelfitems[i];
            
            let shelveyheight = roundOffDecimal((shelfitem.y + shelfitem.drawHeight + shelfitem.drawGap),2); //shelf height
            
            //contain shelves check
            if((adjustobj.y <= shelfitem.y) && (newxend >= shelveyheight)){
                let shelveobj = { rank : shelfitem.rank, height : shelfitem.height , gap : shelfitem.gap, uom : shelfitem.uom, shelfidx: i };
                containshleves.push(shelveobj);
            }            
        }
        
        //is existing item, check rect original shelve count and new are equal
        if(rectobj.brands && rectobj.brands.length > 0){
            //if new contain shelves count less than earlier shelves
            if(rectobj.contain_shelves.length > containshleves.length){

                //if containshelves is empty
                if(containshleves.length === 0){
                    //add new contain shelve from dropping location y
                    let finddroppingshelve = drawfield.field_shelves.findIndex(xshelf => {
                        return (xshelf.y <= adjustobj.y && (xshelf.y + xshelf.drawHeight + xshelf.drawGap) > adjustobj.y);
                    });
                    
                    let foundsitem = drawfield.field_shelves[finddroppingshelve];

                    let shelveobj = { rank : foundsitem.rank, height : foundsitem.height , gap : foundsitem.gap, uom : foundsitem.uom, shelfidx: finddroppingshelve };
                    //set height of main return object
                    adjustobj["height"] = (foundsitem.drawHeight + foundsitem.drawGap);

                    containshleves.push(shelveobj);
                }
                
                let neededtoaddcount = (rectobj.contain_shelves.length - containshleves.length);
                let drawfieldshelves = drawfield.field_shelves;

                //find can add more shelves from bottom first
                let isCannotAddtoBotorTop = false;
                let lastcontainshelve = JSON.parse(JSON.stringify(containshleves[(containshleves.length - 1)]));
                if(drawfieldshelves[(lastcontainshelve.shelfidx + 1)]){
                    let iscannotaddedtobottom = false;

                    for (let b = 0; b < drawfieldshelves.length; b++) {
                        const nextshelveobj = drawfieldshelves[b];
                        
                        if(nextshelveobj.rank > lastcontainshelve.rank){
                            let isbottomshelfcontains = (subobj?subobj.contain_shelves.findIndex(x => x.rank === nextshelveobj.rank):-1);
                            if(isbottomshelfcontains > -1){
                                adjustobj.height = roundOffDecimal((adjustobj.height + (nextshelveobj.drawHeight + nextshelveobj.drawGap)),2);

                                let shelveobj = { rank : nextshelveobj.rank, height : nextshelveobj.height , gap : nextshelveobj.gap, uom : nextshelveobj.uom, shelfidx: b };
                                containshleves.push(shelveobj);

                                neededtoaddcount = (neededtoaddcount - 1);
                                if(neededtoaddcount <= 0){
                                    break;
                                }
                            } else{
                                iscannotaddedtobottom = true;
                                isCannotAddtoBotorTop = true;
                                break;
                            }
                        }
                    }

                    //find can add more shelves from top
                    if(iscannotaddedtobottom){
                        isCannotAddtoBotorTop = false;
                        let firstcontainshelve = JSON.parse(JSON.stringify(containshleves[0]));
                        
                        if(drawfieldshelves[(firstcontainshelve.shelfidx - 1)]){
                            for (let k = (drawfieldshelves.length - 1); k >= 0; k--) {
                                const prevshelveobj = drawfieldshelves[k];
                                
                                if(prevshelveobj.rank < firstcontainshelve.rank){
                                    let istopshelfcontains = (subobj?subobj.contain_shelves.findIndex(x => x.rank === prevshelveobj.rank):-1);
                                    if(istopshelfcontains > -1){
                                        adjustobj.y = roundOffDecimal(prevshelveobj.y,2);
                                        adjustobj.height = roundOffDecimal((adjustobj.height + (prevshelveobj.drawHeight + prevshelveobj.drawGap)),2);

                                        let shelveobj = { rank : prevshelveobj.rank, height : prevshelveobj.height , gap : prevshelveobj.gap, uom : prevshelveobj.uom, shelfidx: k };
                                        containshleves.unshift(shelveobj);

                                        neededtoaddcount = (neededtoaddcount - 1);
                                        if(neededtoaddcount <= 0){
                                            break;
                                        }
                                    } else{
                                        isCannotAddtoBotorTop = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    
                }

                if(isCannotAddtoBotorTop){
                    containshleves = [];
                }
            } 
            else if(rectobj.contain_shelves.length < containshleves.length){ //if new contain shelfs more than before
                let neededtoreducecount = (containshleves.length - rectobj.contain_shelves.length);
                containshleves.splice((containshleves.length - 1), neededtoreducecount);
            }
        }
    }
    
    // console.log(containshleves);
    adjustobj["contain_shelves"] = containshleves;
    
    if(fieldstotal < ((rectobj.x + rectobj.width) - saftyxvalue)){
        adjustobj = false;
    }
    // console.log(adjustobj);
    return adjustobj;
}

export function checkSnapAllow (rect, drawWidth, issubcat, otherrects, subcatitem) {
    //create rect box from product width,height
    var xa = (rect.x - 25);
    //var ya = (rect.y - (rect.height / 4));
    var xb = (rect.x + rect.width + 25);
    //var yb = (rect.y + rect.height + (rect.height / 4));
    
    //loop though product list
    var founditem = false;
    
    //if false find it near a shelve end
    if(issubcat){
        let snappinglist = [];

        //is it left
        if(xa <= 0){ // && 0 <= rect.x
            let reducewidth1 = (rect.x + rect.width);
            // founditem = {"x":0, "width": roundOffDecimal(reducewidth1,2)};
            snappinglist.push({"x":0, "width": roundOffDecimal(reducewidth1,2), "isleft": true });
        }

        //is it right
        let nrectx1 = (founditem?founditem.x:rect.x);
        let nrectwidth2 = (founditem?founditem.width:rect.width);

        if(xb >= drawWidth){ // && (rect.x + rect.width) <= drawWidth
            let reducewidth2 = ((drawWidth - (nrectx1 + nrectwidth2)) + nrectwidth2);
            let reducex2 = nrectx1;
            // founditem = {"x": roundOffDecimal(reducex2,2), "width": roundOffDecimal(reducewidth2,2)};
            snappinglist.push({"x": roundOffDecimal(reducex2,2), "width": roundOffDecimal(reducewidth2,2), "isright": true });
        }
        
        //check is it snapping other drawed rects
        for (let i = 0; i < otherrects.length; i++) {
            const otherrect = otherrects[i];
            if(!otherrect.isDelete){
                for (let l = 0; l < otherrect.rects.length; l++) {
                    const subrect = otherrect.rects[l];
                    
                    if(!subrect.isDelete && subrect.id !== rect.id){
                        let nrectx = (founditem?founditem.x:rect.x);
                        let nrectwidth = (founditem?founditem.width:rect.width);
                        // let nrectx = rect.x;
                        // let nrectwidth = rect.width;

                        let nxa = (nrectx - 25);
                        let nxb = (nrectx + nrectwidth + 25);

                        //is it left
                        if(nxa <= (subrect.x + subrect.width) && (subrect.x + subrect.width) <= rect.x){
                            let reducewidth3 = ((nrectx - (subrect.x + subrect.width)) + nrectwidth);
                            //founditem = {"x":roundOffDecimal((subrect.x + subrect.width),2), "width": roundOffDecimal(reducewidth3,2), "isleftsnap":l, "leftparent": i};
                            snappinglist.push({"x":roundOffDecimal((subrect.x + subrect.width),2), "width": roundOffDecimal(reducewidth3,2), "isleft": true, "isleftsnap":l, "leftparent": i});
                        }
                        //is it right
                        if(nxb >= subrect.x && (nrectx + rect.width) <= subrect.x){
                            let reducewidth4 = ((subrect.x - (nrectx + nrectwidth)) + nrectwidth);
                            //let reducex4 = nrectx;
                            //founditem = {"x": roundOffDecimal(nrectx,2), "width": roundOffDecimal(reducewidth4,2), "isrightsnap":true};
                            snappinglist.push({"x": roundOffDecimal(nrectx,2), "width": roundOffDecimal(reducewidth4,2), "isright": true, "isrightsnap":true});
                        }
                    }
                }
            }
        }
        
        //get all snapping list and get closest one
        // console.log(snappinglist);
        if(snappinglist.length > 0){
            let leftsnaplist = snappinglist.filter(x => x.isleft);
            let leftsortlist = leftsnaplist.sort((a, b) => b.x - a.x);
            if(leftsortlist.length > 0){
                founditem = leftsortlist[0]
            }

            let rightsnaplist = snappinglist.filter(x => x.isright);
            let rightsortlist = rightsnaplist.sort((a, b) => a.width - b.width);
            if(rightsortlist.length > 0){
                if(!founditem){
                    founditem = rightsortlist[0];
                } else{
                    let newrightx2 = (rightsortlist[0].x + rightsortlist[0].width);
                    founditem.width = (newrightx2 - founditem.x);
                }
            }
        }

    } else{
        let snappinglist = [];

        //if brand align inside sub category
        const scatitem = subcatitem;
        
        let subrectx2 = (scatitem.x + scatitem.width);

        let nrectx2 = (founditem?founditem.x:rect.x);
        let nrectwidth2 = (founditem?founditem.width:rect.width);

        let nxa2 = (nrectx2 - 25);
        let nxb2 = (nrectx2 + nrectwidth2 + 25);
        
        //is it snapping left of sub cat
        if(nxa2 <= scatitem.x){
            let reducewidth1 = (nrectwidth2 - (scatitem.x - nrectx2));
            //founditem = {"x":roundOffDecimal(scatitem.x,2), "width": roundOffDecimal(reducewidth1,2)};
            snappinglist.push({"x":roundOffDecimal(scatitem.x,2), "width": roundOffDecimal(reducewidth1,2), "isleft": true});
        }
        //is it snapping right of sub cat
        nrectx2 = (founditem?founditem.x:nrectx2);
        nrectwidth2 = (founditem?founditem.width:rect.width);
        
        if(nxb2 >= subrectx2){ // && (nrectx2 + nrectwidth2) <= subrectx2
            let reducewidth2 = ((scatitem.x + scatitem.width) - nrectx2);
            //let reducex4 = nrectx2;
            // founditem = {"x": roundOffDecimal(nrectx2,2), "width": roundOffDecimal(reducewidth2,2)};
            snappinglist.push({"x": roundOffDecimal(nrectx2,2), "width": roundOffDecimal(reducewidth2,2), "isright": true});
        }
        // console.log(snappinglist);
        
        nrectx2 = (founditem?founditem.x:nrectx2);
        nrectwidth2 = (founditem?founditem.width:rect.width);
        
        //check is it snapping other drawed brands
        for (let l = 0; l < otherrects.length; l++) {
            const branditem = otherrects[l];

            if(!branditem.isDelete){
                for (let v = 0; v < branditem.rects.length; v++) {
                    const brectitem = branditem.rects[v];
                    if(!brectitem.isDelete && brectitem.id !== rect.id){
                        //is it left
                        if(nxa2 <= (brectitem.x + brectitem.width) && (brectitem.x + brectitem.width) <= nrectx2){
                            let cbrectx2 = roundOffDecimal((brectitem.x + brectitem.width),2);

                            if(!founditem || (founditem && founditem.x < cbrectx2)){
                                let reducewidth3 = ((nrectx2 - (brectitem.x + brectitem.width)) + nrectwidth2);
                                // founditem = {"x": cbrectx2, "width": roundOffDecimal(reducewidth3,2), "isleftsnap":l};
                                snappinglist.push({"x": cbrectx2, "width": roundOffDecimal(reducewidth3,2), "isleftsnap":l, "isleft": true});
                            }
                        }
                        //is it right
                        if(nxb2 >= brectitem.x && (nrectx2 + rect.width) <= brectitem.x){
                            let reducewidth4 = roundOffDecimal(((brectitem.x - (nrectx2 + nrectwidth2)) + nrectwidth2),2);
                            
                            if(!founditem || (founditem && founditem.width > reducewidth4)){
                                // founditem = {"x": roundOffDecimal(nrectx2,2), "width": reducewidth4, "isrightsnap":true};
                                snappinglist.push({"x": roundOffDecimal(nrectx2,2), "width": reducewidth4, "isrightsnap":true, isright: true});
                            }
                        }
                    }
                }
                
            }
        }

        //get all snapping list and get closest one
        // console.log(snappinglist);
        if(snappinglist.length > 0){
            let leftsnaplist = snappinglist.filter(x => x.isleft);
            let leftsortlist = leftsnaplist.sort((a, b) => b.x - a.x);
            if(leftsortlist.length > 0){
                founditem = leftsortlist[0]
            }

            let rightsnaplist = snappinglist.filter(x => x.isright);
            let rightsortlist = rightsnaplist.sort((a, b) => a.width - b.width);
            if(rightsortlist.length > 0){
                if(!founditem){
                    founditem = rightsortlist[0];
                } else{
                    let newrightx2 = (rightsortlist[0].x + rightsortlist[0].width);
                    founditem.width = (newrightx2 - founditem.x);
                }
            }
        }
    }
    
    return founditem;
}

//convert width percentages
export function convertWidthPercent (width,convtwidth,isreverse) {
    let expval = roundOffDecimal(((width / convtwidth) * 100),2);
    
    if(isreverse){
        expval = roundOffDecimal(((width * convtwidth) / 100),2)
    }

    return expval;
}

//light/dark color
export function shadeColor(color, percent) {
    //light - shadeColor("#63C6FF",40);
    //dark - shadeColor("#63C6FF",-40);

    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length===1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length===1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length===1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

//calculate rect percentage to sending parent size
export function getRectPercentage (childObj, parentWidth, parentObj, isBrand) {
    //parent width * field object shelves list length to get total field width
    let parentSize = parentWidth;
    if(!isBrand){
        let allowtoeditlength = parentObj.field_shelves.filter(x => x.isAllowEdit);
        parentSize = (parentWidth * allowtoeditlength.length);
    }
    let curchildwidth = roundOffDecimal(childObj.width,2);
    // child width * child contain shelves length to get total child width
    let childSize = (curchildwidth * childObj.contain_shelves.length);
    
    let childPercentage = ((childSize / parentSize) * 100);
    let singlePercentage = ((curchildwidth / parentObj.width) * 100);
    if(!isBrand){
        singlePercentage = ((curchildwidth / parentWidth) * 100);
    }
    
    return {percentage: roundOffDecimal(childPercentage,2), box_percentage: roundOffDecimal(singlePercentage,2)};
}

//calculate how much should reduce from child when parent change
export function getReduceSizeValue (childValue, parentValue, changeValue) {
    let childPercentage = ((childValue / parentValue) * 100); //child percentage according to parent
    let childChangeValue = ((changeValue / 100) * childPercentage); //get change value by the percentage of child

    return roundOffDecimal(childChangeValue,2);
}

//check snap allow - using to check product that adding is near of already added near product location
//or near of walls of dropping shelve
export function checkSimulateSnapAllow (newx, newy, draggingProduct, shelfObj, displayUOM, displayRatio, saleSaftyMargin) {
    //check rotate details available
    var dragprodwidth = draggingProduct.width;
    var dragprodheight = draggingProduct.height;
    
    //snap - find nearest product same as this product
    var sconvprodwidth = (measureConverter(draggingProduct.uom,displayUOM,dragprodwidth) * displayRatio);
    var sconvprodheight = (measureConverter(draggingProduct.uom,displayUOM,dragprodheight) * displayRatio);
    //create product box from product width,height
    var xa = newx;
    var ya = newy;
    var xb = newx + sconvprodwidth;
    var yb = newy + sconvprodheight;
    //with safty margin
    /* let saftylowxwidth = (sconvprodwidth / 2);
    let saftyhighwidth = (sconvprodwidth / 2);

    let blockprods = (draggingProduct.prods?draggingProduct.prods:draggingProduct.drawingProducts?draggingProduct.drawingProducts:[])
    if(blockprods && blockprods.length > 0){
        let lowxprod = blockprods[0];
        let highxprod = blockprods[(blockprods.length - 1)];
        var scalelowwidth = (measureConverter(draggingProduct.uom,displayUOM,lowxprod.width) * displayRatio);
        var scalehighxwidth = (measureConverter(draggingProduct.uom,displayUOM,highxprod.width) * displayRatio);

        saftylowxwidth = (scalelowwidth / 2);
        saftyhighwidth = (scalehighxwidth / 2);
        //console.log(saftylowxwidth,saftyhighwidth);
    } */

    /* var snx1 = newx - saftylowxwidth;
    var sny1 = newy - (sconvprodheight / 3);
    var snx2 = newx + sconvprodwidth + saftyhighwidth;
    var sny2 = newy + sconvprodheight + (sconvprodheight /3); */
    
    //loop though product list
    var founditem = false;
    var snapAllowProducts = [];

    /* for (var l = 0; l < shelfObj.brand.length; l++) {
        const blockitem = shelfObj.brand[brandIdx];
        //console.log(blockitem);
        if(!blockitem.isDelete){
            for (var k = 0; k < blockitem.drawingProducts.length; k++) {
                const locitem = blockitem.drawingProducts[k];
                
                if(!locitem.isDelete){
                    //check snap side - snap should work if it's on left/right side
                    var locx1 = roundOffDecimal(locitem.x,2);
                    var locy1 = roundOffDecimal((locitem.y - saleSaftyMargin),2);
                    var locx2 = roundOffDecimal((locitem.x + locitem.drawWidth),2);
                    var locy2 = roundOffDecimal((locitem.y + locitem.drawHeight),2);

                    var snapAllow = checkThroughProductsTest(snx1, sny1, snx2, sny2, locx1, locy1, locx2, locy2)

                    if(!snapAllow){
                        snapAllowProducts.push({planoLocation :locitem, shelf: shelfObj});
                    }
                }

            }
        }
    } */

    //console.log(snapAllowProducts);
    //loop and find nearest product that snapping. otherwise there can be invalid snap
    var nearest = null
    var previousGapBetweenaddingProd = 0
    if(snapAllowProducts.length === 1){
        nearest = snapAllowProducts[0]
    }else{
        for (let i = 0; i < snapAllowProducts.length; i++) {
            const snapAllowProd = snapAllowProducts[i];
            const prodLocation = snapAllowProd.planoLocation;

            var gapBetweenaddingProd = prodLocation.x - newx;

            //if minuse we have to plus it, sort purposes
            if(gapBetweenaddingProd < 0){
                gapBetweenaddingProd = gapBetweenaddingProd * -1
            }

            if(i === 0){
                nearest = snapAllowProducts[i]                 
                previousGapBetweenaddingProd = gapBetweenaddingProd
            }else{
                if(gapBetweenaddingProd < previousGapBetweenaddingProd){
                    nearest = snapAllowProducts[i]
                    previousGapBetweenaddingProd = gapBetweenaddingProd
                }
            }    
        }
    }
    
    //pick nearest snappign prod
    if(nearest!=null){
        const prodLocation = nearest.planoLocation;
        
        var x1 = roundOffDecimal(prodLocation.x,2);
        var y1 = roundOffDecimal((prodLocation.y - saleSaftyMargin),2);
        var x2 = roundOffDecimal((prodLocation.x + prodLocation.drawWidth),2);
        var y2 = roundOffDecimal((prodLocation.y + prodLocation.drawHeight),2);

        //right side snap
        if (x1 < xb && ((x2 > xa) === false) && y1 < yb && y2 > ya) {
            founditem = {"x":((prodLocation.x + prodLocation.drawWidth)), "y": ((prodLocation.y + prodLocation.drawHeight) - sconvprodheight)};
        }

        //left side snap
        if (((x1 < xb) === false) && x2 > xa && y1 < yb && y2 > ya) {
            founditem = {"x":((prodLocation.x - sconvprodwidth)), "y": ((prodLocation.y + prodLocation.drawHeight) - sconvprodheight)};
        }
    }
    
    //if false find it near a shelve end
    if(!founditem){
        // var allwovrlow = false; //only right side allowed

        //find brand details
        /* let brandobj = shelfObj.brand[brandIdx];

        //is it left
        if(snx1 < brandobj.x && xa > brandobj.x){
            var slx1 = brandobj.x;
            var sly1 = ((shelfObj.y + shelfObj.drawHeight) - sconvprodheight);
            founditem = {"x":slx1, "y": sly1};
        }
        //is it right
        else if(xb < (brandobj.x + brandobj.drawWidth) && snx2 > (brandobj.x + brandobj.drawWidth)){
            var slx2 = (allwovrlow && (snx1 < (brandobj.x + brandobj.drawWidth))?newx:((brandobj.x + brandobj.drawWidth) - sconvprodwidth));
            var sly2 = ((shelfObj.y + shelfObj.drawHeight) - sconvprodheight);
            founditem = {"x":slx2, "y": sly2};
        } */
        //console.log(founditem);
        if(founditem){
            var notoverlappingprod = checkAllowToAdd(null, shelfObj, null, draggingProduct, founditem.x, founditem.y, displayRatio);
            if(!notoverlappingprod){
                founditem = false;
            }
        }
    }
    return founditem;
}

export function checkProductThoughBlock (x,y,prodobj,blockobj,isignoreprod,displayUOM,displayRatio,saftyMargin) {
    //check rotate details available
    var dragprodwidth = prodobj.width;
    var dragprodheight = prodobj.height;
    
    //set xy,width/heights of product
    var sconvprodwidth = (measureConverter(prodobj.uom,displayUOM,dragprodwidth) * displayRatio);
    var sconvprodheight = (measureConverter(prodobj.uom,displayUOM,dragprodheight) * displayRatio);
    //add extra safty margin to check location in products
    var x1 = x - (saftyMargin + ((sconvprodwidth / 4) * 3));
    var y1 = y - (saftyMargin + ((sconvprodwidth / 4) * 3));
    var x2 = (x + sconvprodwidth) + (saftyMargin + ((sconvprodwidth / 4) * 3));
    var y2 = (y + sconvprodheight) + (saftyMargin + ((sconvprodwidth / 4) * 3));

    //check allow product in checking block
    var allowblock = false;
    if(blockobj){
        for (var i = 0; i < blockobj.drawingProducts.length; i++) {
            const locitem = blockobj.drawingProducts[i];
            if(!locitem.isDelete){
                var xa = locitem.x;
                var ya = locitem.y;
                var xb = (locitem.x + locitem.drawWidth);
                var yb = (locitem.y + locitem.drawHeight);
                //check checking location safty margin in location inside location
                var isallowtoblock = checkThroughProductsTest(x1,y1,x2,y2,xa,ya,xb,yb);
                if(!isallowtoblock){
                    allowblock = true;
                }
            }
        }
    }
    return allowblock;
}

 //check product allowed to add inside shelve
export function checkAllowToAdd(e, shelfObj, draggingProduct, xa, ya, saftyMargin) {
    //check allowed
    var allowToAdd = true;
    
    if(draggingProduct){
        let dpwidth = draggingProduct.drawWidth;
        let dpheight = draggingProduct.drawHeight;

        let xb = roundOffDecimal((draggingProduct.x + dpwidth),2);
        let yb = roundOffDecimal((draggingProduct.y + dpheight),2);

        var shelveCheck = checkOnShelfBox(draggingProduct.x, draggingProduct.y, xb, yb, shelfObj, dpwidth, dpheight, saftyMargin); //check allow to add shelve
        
        //console.log(allowToAdd, shelveCheck);
        allowToAdd = (allowToAdd && shelveCheck.boxAllow);
    } else{
        allowToAdd = false;
    }

    return {allowToAdd:allowToAdd,shelfAllow:shelveCheck.boxAllow,shelfid:shelveCheck.shelfid};
}

export function checkOnFieldBox(xa, ya, xb, yb, fieldObj, checkSaftyMargin){
    var fieldXa=roundOffDecimal(fieldObj.x,2)
    var fieldboxYa=roundOffDecimal(fieldObj.y,2)
    var fieldboxXb=roundOffDecimal((fieldObj.x + (fieldObj.drawWidth + checkSaftyMargin)),2);
    var fieldboxYb=roundOffDecimal((fieldObj.y + (fieldObj.drawHeight + checkSaftyMargin)),2);
    
    var boxAllow = false;
    if (fieldXa <= xa && xb <= fieldboxXb && fieldboxYa <= ya && yb <= fieldboxYb) {
        boxAllow = true;
    }
             
    return boxAllow;
}
//check product x,y endpoints are allowed to drag inside shelve
export function checkOnShelfBox(xa, ya, xb, yb, shelfObj, dpwidth, dpheight, checkSaftyMargin) {
    var allowovrlflw = false;
    var overflowprodwidth = (allowovrlflw?((dpwidth / 4) * 3):0); //if overflow allowed 3/4 of product allow to overlap
    
    let dxa = roundOffDecimal(xa,2);
    let dya = roundOffDecimal(ya,2);

    //get shelve x,y end points
    var p1 = shelfObj.x; 
    var q1 = roundOffDecimal((shelfObj.y - checkSaftyMargin),2);
    var p2 = roundOffDecimal(((shelfObj.x + shelfObj.drawWidth) + overflowprodwidth),2);
    var q2 = roundOffDecimal((shelfObj.y + shelfObj.drawHeight + checkSaftyMargin),2);
    
    //check is it allowed
    var boxAllow = false;
    // console.log(p1 +"<="+ dxa , xb +"<="+ p2 , q1 +"<="+ dya , yb +"<="+ q2);
    if (p1 <= dxa && xb <= p2 && q1 <= dya && yb <= q2) {
        boxAllow = true;
    }
    
    //check is it overlap
    var p3 = shelfObj.x;
    var p4 = (shelfObj.x + shelfObj.drawWidth);
    var isOverlap = true;
    var overlapX = 0;

    if (p3 <= dxa && xb <= p4 && q1 <= dya && yb <= q2) {
        isOverlap = false;
    } else if(allowovrlflw){
        overlapX = ((shelfObj.x + shelfObj.drawWidth) - xa);
    }
    
    if(isOverlap){
        isOverlap = (allowovrlflw?shelfObj["overlappingAllow"]:false);
        if(!allowovrlflw || !shelfObj.overlappingAllow){
            boxAllow = false;
        }
    }

    return {boxAllow:boxAllow, isOverlap: isOverlap, overlapX: overlapX,shelfid:shelfObj.id};
}

//find zoom viewport sizes
export function newViewportSizes(zoomXRatio, checkitem) {
    //let svg = document.getElementById('mainsvg-view');
    //let viewBox = svg.viewBox.baseVal;
    
    let drawzoomx = zoomXRatio;

    //let newmovex = viewBox.x * (drawzoomx > 0?(drawzoomx * 2):1);
    //let newmovey = viewBox.y * (drawzoomx > 0?(drawzoomx * 2):1);

    let locationx = checkitem.x * (drawzoomx > 0?(drawzoomx * 2):1);
    let locationy = checkitem.y + (drawzoomx > 0?(drawzoomx * 2):1);

    checkitem.x = roundOffDecimal(locationx,2);
    checkitem.y = roundOffDecimal(locationy,2);
    checkitem.drawWidth = roundOffDecimal((checkitem.drawWidth * (drawzoomx > 0?(drawzoomx * 2):1)),2);
    checkitem.drawHeight = roundOffDecimal((checkitem.drawHeight * (drawzoomx > 0?(drawzoomx * 2):1)),2);

    return checkitem;
}
//convert or reverse according to lay
export function saveObjDataConvert(ccatobj, isreverse, layoutwidth, dimention, isbrandview, subcatid, checksaveobj, displayuom) {
    let maincatobj = JSON.parse(JSON.stringify(ccatobj));
    let saftyxvalue = 0.01;

    if(maincatobj && Object.keys(maincatobj).length > 0){
        let maincatfield = maincatobj.field_obj;
        // console.log(maincatobj);

        if(maincatfield){
            //group allow to edit shelfs
            let allowEditGroups = []; let isnewgroup = -1;
            if(isreverse){
                for (let j = 0; j < maincatfield.field_shelves.length; j++) {
                    const checkshelfitem = maincatfield.field_shelves[j];
                    if(checkshelfitem.isAllowEdit){
                        if(isnewgroup === -1){
                            allowEditGroups.push({
                                y: checkshelfitem.y,
                                height: (checkshelfitem.drawHeight + checkshelfitem.drawGap),
                                contains: [{ id: uuidv4(), rank: checkshelfitem.rank, height: checkshelfitem.height, gap: checkshelfitem.gap, uom: checkshelfitem.uom }],
                            });

                            isnewgroup = (allowEditGroups.length - 1);
                        } else{
                            allowEditGroups[isnewgroup].height = (allowEditGroups[isnewgroup].height + (checkshelfitem.drawHeight + checkshelfitem.drawGap));
                            allowEditGroups[isnewgroup].contains.push({ id: uuidv4(), rank: checkshelfitem.rank, height: checkshelfitem.height, gap: checkshelfitem.gap, uom: checkshelfitem.uom });
                        }
                    } else{
                        isnewgroup = -1;
                    }
                }
            }
            // console.log(allowEditGroups);
            maincatfield["allowShelfGroups"] = allowEditGroups;
            
            for (let i = 0; i < maincatobj.rects.length; i++) {
                const rectitem = maincatobj.rects[i];
                
                for (let j = 0; j < rectitem.sub_categories.length; j++) {
                    const subcatitem = rectitem.sub_categories[j];
                    if(!subcatitem.isDelete && (!isbrandview || (isbrandview && subcatitem.id === subcatid))){
                        if(isreverse && !isbrandview){
                            let checklevel = ((subcatitem.type === catRectEnums.rule)?subcatitem.rule.level:catRuleEnums.subcat);
                            let findruleadded = RuleWarningValidations("scat", checksaveobj, getNameorIdorColorofBox(subcatitem, "num"), ccatobj.id, rectitem.id, null, (subcatitem.type === catRectEnums.rule), checklevel);
                            // console.log(findruleadded);
                            subcatitem["isRuleParentAdded"] = findruleadded.isAdded;
                            subcatitem["isRuleParentList"] = findruleadded.addedRuleList;
                            // console.log(subcatitem);
                        }
                        
                        let totalrectwidth = 0;
                        for (let m = 0; m < subcatitem.rects.length; m++) {
                            const rectitem = subcatitem.rects[m];
                            rectitem.width = convertWidthPercent(rectitem.box_width_percentage,layoutwidth,true);

                            totalrectwidth = (totalrectwidth + (rectitem.width * rectitem.contain_shelves.length));
                        }
                        
                        let prevsubitemx2 = null;
                        for (let l = 0; l < subcatitem.rects.length; l++) {
                            const subrectitem = subcatitem.rects[l];
                            if(!subrectitem.isDelete){
                                let oldrectitem = JSON.parse(JSON.stringify(subrectitem));
                                if(!isreverse){
                                    subrectitem.x = convertWidthPercent(subrectitem.x,layoutwidth);
                                    // subrectitem.width = subrectitem.box_width_percentage;
                                    subrectitem.width = subrectitem.percentage;
                                } else{
                                    //console.log(subrectitem.x,layoutwidth);
                                    subrectitem.x = convertWidthPercent(subrectitem.x,layoutwidth,true);
                                    if(prevsubitemx2 > subrectitem.x){
                                        subrectitem.x = roundOffDecimal((subrectitem.x + saftyxvalue),2);
                                    }
                                    
                                    subrectitem.width = convertWidthPercent(subrectitem.box_width_percentage,layoutwidth,true);
                                    
                                    /* if(isbrandview && subcatitem.id === subcatid){
                                        subrectitem.x = 0;
                                        subrectitem.width = layoutwidth;
                                        //
                                        totalrectwidth = (subrectitem.width * subrectitem.contain_shelves.length);
                                    } */
                                    
                                    let getscatyheights = findHeightFromShelves(subrectitem.contain_shelves, maincatfield);
                                    
                                    subrectitem.y = (measureConverter(maincatfield.field_uom, displayuom, getscatyheights.y) * dimention);
                                    subrectitem.height = (measureConverter(maincatfield.field_uom, displayuom, getscatyheights.height) * dimention);
                                    
                                    let getsubcatper = getRectPercentage (subrectitem, layoutwidth, maincatfield, false);
                                    subrectitem["percentage"] = getsubcatper.percentage;

                                    oldrectitem = subrectitem;
                                    //
                                    prevsubitemx2 = roundOffDecimal((subrectitem.x + subrectitem.width),2);
                                }
                                
                                for (let k = 0; k < subrectitem.brands.length; k++) {
                                    const branditem = subrectitem.brands[k];

                                    if(isreverse && isbrandview){
                                        let checkbrandlevel = ((branditem.type === catRectEnums.rule)?branditem.rule.level:catRuleEnums.brand);
                                        let findruleadded = RuleWarningValidations("brand", checksaveobj, getNameorIdorColorofBox(branditem, "num"), ccatobj.id, rectitem.id, subcatitem.id, false, checkbrandlevel);
                                        // console.log(findruleadded);
                                        branditem["isRuleParentAdded"] = findruleadded.isAdded;
                                        branditem["isRuleParentList"] = findruleadded.addedRuleList;
                                        // console.log(subcatitem);
                                    }

                                    let brandrectpertotal = 0;
                                    for (let z = 0; z < branditem.rects.length; z++) {
                                        const brectitem = branditem.rects[z];
                                        
                                        if(!isreverse){
                                            let xwidthfromrectx = (brectitem.x - oldrectitem.x);
                                            //let checkwidth = (isbrandview?layoutwidth:oldrectitem.width);
                                            let checkwidth = oldrectitem.width;
                                            brectitem.x = convertWidthPercent(xwidthfromrectx,checkwidth);
                                            // brectitem.width = brectitem.box_width_percentage;
                                            brectitem.width = brectitem.percentage;
                                        } else{
                                            let getbrandxwidth = convertWidthPercent(brectitem.x,oldrectitem.width,true);
                                            brectitem.x = (oldrectitem.x + getbrandxwidth);
                                            brectitem.width = convertWidthPercent(brectitem.box_width_percentage,subrectitem.width,true);

                                            let getbrandyheights = findHeightFromShelves(brectitem.contain_shelves, maincatfield);
                                            brectitem.y = (measureConverter(maincatfield.field_uom, displayuom, getbrandyheights.y) * dimention);
                                            brectitem.height = (measureConverter(maincatfield.field_uom, displayuom, getbrandyheights.height) * dimention);   
                                            
                                            let getbrandper = getRectPercentage (brectitem, totalrectwidth, subrectitem, true);
                                            
                                            brectitem["percentage"] = getbrandper.percentage;

                                            brandrectpertotal = (brandrectpertotal + getbrandper.percentage);
                                        }    
                                    }
                                    
                                    branditem["percentage"] = brandrectpertotal;
                                }
                                //console.log(subrectitem.brands);
                            }
                        }
                    }
                }    
            }
        }
        
    }

    return maincatobj;
}

export function findHeightFromShelves(containshelves, drawfield, issimconvert) {
    //console.log(containshelves, drawfield.field_shelves);
    let checkfield = JSON.parse(JSON.stringify(drawfield));
    let totalrectheight = 0; let startrecty = -1;
    
    if(checkfield){
        let newy = 0;
        let shelflist = (issimconvert?checkfield.shelf:checkfield.field_shelves);

        for (let i = 0; i < shelflist.length; i++) {
            const shelfitem = shelflist[i];
            let shelveheight = roundOffDecimal((issimconvert?(shelfitem.drawHeight + shelfitem.drawGap):(shelfitem.height + shelfitem.gap)),2);
            shelfitem.y = newy;
            
            let iscontainshelve = containshelves.findIndex(x => x.rank === shelfitem.rank);
            if(iscontainshelve > -1){
                totalrectheight = (totalrectheight + shelveheight);
                
                if(startrecty < 0 ){
                    startrecty = shelfitem.y;
                }
            }

            newy = (newy + shelveheight);
        }
    }
    
    return {y: startrecty, height: totalrectheight};
}

export function reCheckSnapRects(rect, subidx, rectidx, otherrects, issubcat) {
    //loop though product list
    var founditem = false;

    if(issubcat){
        let nrectx = rect.x;
        let nrectwidth = rect.width;

        let nxa = (nrectx - (nrectwidth / 3));
        let nxb = (nrectx + nrectwidth + (nrectwidth / 3));

        //check is it snapping other drawed rects
        for (let i = 0; i < otherrects.length; i++) {
            const otherrect = otherrects[i];
            if(!otherrect.isDelete && subidx !== i){
                for (let l = 0; l < otherrect.rects.length; l++) {
                    const subrect = otherrect.rects[l];
                    
                    if(!subrect.isDelete){
                        //is it left
                        if(nxa <= (subrect.x + subrect.width) && (subrect.x + subrect.width) <= nrectx){
                            let reducewidth3 = ((nrectx - (subrect.x + subrect.width)) + nrectwidth);
                            founditem = {"x":roundOffDecimal((subrect.x + subrect.width),2), "width": roundOffDecimal(reducewidth3,2), "isleftsnap":l, "leftparent": i};
                        }
                        
                        //is it right
                        if(nxb >= subrect.x && (nrectx + rect.width) <= subrect.x){
                            let reducewidth4 = ((subrect.x - (nrectx + nrectwidth)) + nrectwidth);
                            //let reducex4 = (isafteradd?(subrect.x - rect.width):nrectx);
                            founditem = {"x": roundOffDecimal(nrectx,2), "width": roundOffDecimal(reducewidth4,2), "isrightsnap":true};
                        }
                    }
                    
                }
            }
            
        }
    } else{
        let nrectx2 = rect.x;
        let nrectwidth2 = rect.width;

        let nxa2 = (nrectx2 - (nrectwidth2 / 3));
        let nxb2 = (nrectx2 + nrectwidth2 + (nrectwidth2 / 3));

        //check is it snapping other drawed brands
        for (let l = 0; l < otherrects.length; l++) {
            const subrect = otherrects[l];
            
            if(!subrect.isDelete && rectidx !== l){
                 //is it left
                if(nxa2 <= (subrect.x + subrect.width) && (subrect.x + subrect.width) <= nrectx2){
                    let reducewidth3 = ((nrectx2 - (subrect.x + subrect.width)) + nrectwidth2);
                    founditem = {"x":roundOffDecimal((subrect.x + subrect.width),2), "width": roundOffDecimal(reducewidth3,2), "isleftsnap":l};
                }
                //is it right
                if(nxb2 >= subrect.x && (nrectx2 + rect.width) <= subrect.x){
                    let reducewidth4 = ((subrect.x - (nrectx2 + nrectwidth2)) + nrectwidth2);
                    founditem = {"x": roundOffDecimal(nrectx2,2), "width": roundOffDecimal(reducewidth4,2), "isrightsnap":true};
                }  
            }
        }
    }

    return founditem;
}

export class DrawViewClipboard extends Component {

    handleGhostOnDrag = (e, obj) => {
        let viewobj = JSON.parse(JSON.stringify(obj));
        
        viewobj["drawWidth"] = viewobj.width;
        viewobj["drawHeight"] = viewobj.height;
        
        this.props.ghostFromParent(e, viewobj);
    }

    handleDragEnd = () => {
        if(this.props.isBrandView && !this.props.isAllowCutDrop){
            alertService.error(this.props.t("oveflowinglayout"));
        }
        this.props.droppedCutItem();
    }

    render() {
        
        return (<>
            <Col className={'clipboard-items '+(this.props.isShowClipboard?"show":"")}>
                <Row style={{padding:"0px 5px"}}>
                {this.props.cutBoxList && this.props.cutBoxList.length > 0?this.props.cutBoxList.map((xitem, xidx) => {
                    let dataobj = (this.props.isBrandView?xitem.brectitem:xitem.citem);
                    let viewratio = floorAspectRatioDrawBox(dataobj.width, dataobj.height, 70, 70);
                    
                    let cutitemname = (this.props.isBrandView?(getNameorIdorColorofBox(xitem.citem, "name")?getNameorIdorColorofBox(xitem.citem, "name").substring(0,15):"-")
                    :(getNameorIdorColorofBox(xitem.parentitem, "name")?getNameorIdorColorofBox(xitem.parentitem, "name").substring(0,15):"-"))

                    return <Col key={xidx} xs={12} className="clip-item">
                        <Row>
                            <Col xs={5} className='sub-content'>
                                <Col className='rect-item' draggable 
                                onDragStart={e => this.props.dragStart(e)}
                                onMouseDown={(e) => {this.props.drawRectCanvas(xitem, xidx)}}
                                onDrag={e => this.handleGhostOnDrag(e,dataobj)} 
                                onDragEnd={e => this.handleDragEnd()} 
                                style={{width: viewratio.dwidth, height: viewratio.dheight, background: (dataobj.color?dataobj.color:xitem.parentitem.color)}}></Col>
                            </Col>
                            <Col className='box-text'>
                                <small>{this.props.t("CUT_NO")}: {xitem.cutno?xitem.cutno:"-"}</small><br/>
                                {cutitemname+(!this.props.isBrandView?(" "+xitem.boxno):"")}<br/>
                                <small>{dataobj.percentage}%</small>
                            </Col>
                        </Row>
                    </Col>;
                }):<><h6>{this.props.t("NO_CUT_ITEMS")}</h6></>}
                </Row>
            </Col>
        </>);
    }
}

//check main object and return name or id of rule/ subcat/cat/brand
export function getNameorIdorColorofBox(mainObj, returntype){
    let returnvalue = null;
    
    if(mainObj){
        if(mainObj.type === catRectEnums.default){
            if(mainObj.category){
                returnvalue = (returntype === "num"?mainObj.category.category_id:returntype === "color"?mainObj.category.color:mainObj.category.category_name);
            }else 
            if(mainObj.sub_category){
                returnvalue = (returntype === "num"?mainObj.sub_category.subCategoryId:returntype === "color"?mainObj.sub_category.color:mainObj.sub_category.subCategoryName);
            }else
            if(mainObj.brand){
                returnvalue = (returntype === "num"?mainObj.brand.brandId:returntype === "color"?mainObj.brand.color:mainObj.brand.brandName);
            }
        }
        else if(mainObj.type === catRectEnums.rule){
            var ruleobj = mainObj.rule
            if(ruleobj.level === catRuleEnums.sup){ //supplier
                returnvalue = (ruleobj.supplier?(returntype === "num"?ruleobj.supplier.supplierId:returntype === "color"?ruleobj.supplier.color:ruleobj.supplier.supplierName):"");
    
            } else if(ruleobj.level === catRuleEnums.cat){ //category
                returnvalue = (ruleobj.category?(returntype === "num"?ruleobj.category.categoryId:returntype === "color"?ruleobj.category.color:ruleobj.category.categoryName):"");
    
            } else if(ruleobj.level === catRuleEnums.subcat){ //sub category
                returnvalue = (ruleobj.sub_category?(returntype === "num"?ruleobj.sub_category.subCategoryId:returntype === "color"?ruleobj.sub_category.color:ruleobj.sub_category.subCategoryName):"");
    
            } else if(ruleobj.level === catRuleEnums.brand){ //sub category
                returnvalue = (ruleobj.brand?(returntype === "num"?ruleobj.brand.brandId:returntype === "color"?ruleobj.brand.color:ruleobj.brand.brandName):"");
            } else{
                returnvalue = (returntype === "num"?0:returntype === "color"?"#dc3545":"-");
            }
        }
    }
    
    return returnvalue;
}
//common function for generate tooltips for elements
export function TooltipWrapper(parentprops) {
    return ( <>
        <OverlayTrigger
          delay={{ hide: 250, show: 200 }}
          transition={false}
          overlay={(props) => (
            <>{parentprops.text !== undefined && parentprops.text !== ""?<Tooltip id={parentprops.bcolor !== undefined ? parentprops.bcolor === "red"? "tooltip-mpview-red": parentprops.bcolor === "blue"? "tooltip-mpview-blue" : "tooltip-mpview-white" :"tooltip-mpview"} {...props}>{parentprops.text}</Tooltip>:<></>}</>
          )} placement={parentprops.placement?parentprops.placement:"auto"}>
            {parentprops.children}
        </OverlayTrigger>
    </>);
}
//common function for generate tooltips for elements
export function TooltipWrapperBrandnsubcat(parentprops) {
    return ( <>
        <OverlayTrigger
          delay={{ hide: 250, show: 200 }}
          transition={false} 
          overlay={parentprops.showdash?<></>:(props) => (
            <Tooltip id="tooltip-mpview" {...props}>{parentprops.text}</Tooltip>
          )} placement={parentprops.placement?parentprops.placement:"auto"}>
            {parentprops.children}
        </OverlayTrigger>
    </>);
}
//common function for generate popover for elements
export function PopoverWrapper(parentprops) {
    return ( <>
        <OverlayTrigger
          trigger={parentprops.trigger?parentprops.trigger:"click"}
          delay={{ hide: (parentprops.showdelay?parentprops.showdelay:450), show: 200 }}
          transition={false} 
          overlay={(props) => (
            <Popover id={parentprops.cusid?parentprops.cusid:'popover-mpview'} {...props}>
                <Popover.Body id={parentprops.subcontent?parentprops.subcontent:""} >
                    {parentprops.text}
                </Popover.Body>
            </Popover >
          )} placement={parentprops.placement?parentprops.placement:"auto"} rootClose={parentprops.rootClose?parentprops.rootClose:false}>
            {parentprops.children}
        </OverlayTrigger>
    </>);
}
// checks rule already added in parent levels of checklevel and return added list
export function RuleWarningValidations(checklevel, checkSaveObj, checkruleid, pcatid, pcatrectid, pscatid, issubrule, checkrulelevel) {
    //checklevel - scat/brand
    let returnobj = { isAdded: false, addedRuleList: [] };
    //found levels - cat/scat
    if(checkSaveObj && checkSaveObj.categories && checkSaveObj.categories.length > 0){
        for (let i = 0; i < checkSaveObj.categories.length; i++) {
            const catitem = checkSaveObj.categories[i];
            
            if(!catitem.isDelete && catitem.rects && catitem.rects.length > 0){ // && catitem.id !== pcatid
                for (let j = 0; j < catitem.rects.length; j++) {
                    const catrectitem = catitem.rects[j];
                    
                    if(!catrectitem.isDelete){
                        if((issubrule || (!issubrule && catrectitem.id !== pcatrectid)) && catrectitem.type === catRectEnums.rule && catrectitem.rule.level === checkrulelevel && getNameorIdorColorofBox(catrectitem, "num") === checkruleid){
                            let foundcatobj = {
                                foundLevel: "cat",
                                id: catrectitem.id,
                                catIdx: i,
                                catRectIdx: j,
                            };

                            returnobj.isAdded = true;
                            returnobj.addedRuleList.push(foundcatobj);
                        }
                        
                        if(catrectitem.sub_categories && catrectitem.sub_categories.length > 0){ // checklevel === "brand" && 
                            for (let l = 0; l < catrectitem.sub_categories.length; l++) {
                                const scatitem = catrectitem.sub_categories[l];
                                //catrectitem.id !== pcatrectid
                                if(!scatitem.isDelete && (checklevel === "brand" && catrectitem.id === pcatrectid) && scatitem.id !== pscatid && 
                                    scatitem.type === catRectEnums.rule && scatitem.rule.level === checkrulelevel && getNameorIdorColorofBox(scatitem, "num") === checkruleid){
                                    
                                    let foundscatobj = {
                                        foundLevel: "scat",
                                        id: catrectitem.id,
                                        catIdx: i,
                                        catRectIdx: j,
                                        scatIdx: l,
                                        catName: getNameorIdorColorofBox(catrectitem, "name"),
                                    };
                                    
                                    returnobj.isAdded = true;
                                    returnobj.addedRuleList.push(foundscatobj);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    // console.log(returnobj);
    return returnobj;
}
//get resize/move percentage of box
export function getBoxResizePercentage(isheightchange, moveobj, mainperobj, divwidth, viewfieldobj, parentitem, isbrand){
    let newperobj = JSON.parse(JSON.stringify(mainperobj));
    newperobj["width"] = moveobj.width;

    if(isheightchange){
        let returnobj = checkDrawRectInShelve(viewfieldobj, parentitem, divwidth, isbrand, moveobj);
        // console.log(returnobj);

        if(returnobj && returnobj.contain_shelves){
            newperobj["contain_shelves"] = returnobj.contain_shelves;
        }
    }
    
    let checkpercentages = getRectPercentage(newperobj, divwidth, viewfieldobj, isbrand);
    
    let newmoveobj = moveobj;
    newmoveobj["percentage"] = checkpercentages.percentage;
    
    return newmoveobj;
}
//validate department settings object
export function validateDeptSettings (settingobj, trans, showalerts) {
    let isvalid = true;

    if(settingobj.min_qty < 0 || settingobj.min_qty === ""){
        if(showalerts){
            alertService.error(trans("required_minqty"));
        }
        isvalid = false;
    }
    // if(settingobj.max_qty < 0 || settingobj.max_qty < settingobj.min_qty){
    //     if(showalerts){
    //         alertService.error(trans("required_maxqty"));
    //     }
    //     isvalid = false;
    // }
    if(settingobj.min_revenue < 0 || settingobj.min_revenue === ""){
        if(showalerts){
            alertService.error(trans("required_minrev"));
        }
        isvalid = false;
    }
    // if(settingobj.max_revenue < 0 || settingobj.max_revenue < settingobj.min_revenue){
    //     if(showalerts){
    //         alertService.error(trans("required_maxrev"));
    //     }
    //     isvalid = false;
    // }
    // if(settingobj.shelf_life < 0){
    //     if(showalerts){
    //         alertService.error(trans("required_shelflife"));
    //     }
    //     isvalid = false;
    // }
    // if(settingobj.pace_of_sale_qty < 0){
    //     if(showalerts){
    //         alertService.error(trans("required_pacesale"));
    //     }
    //     isvalid = false;
    // }
    if(settingobj.mvp_percentage < 0 || settingobj.mvp_percentage > 100 || settingobj.mvp_percentage === ""){
        if(showalerts){
            alertService.error(trans("required_validmvp"));
        }
        isvalid = false;
    }

    return isvalid;
}
//resolution view counts
export function findResolutionShowCount(defcount) {
    var cviewwidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
    
    let expcount = (defcount + 1);
    if(cviewwidth > 992 && cviewwidth < 1600) {
        expcount = (expcount - 1);
    } 

    if(cviewwidth > 1900){
        expcount = 4;
    }
    
    return expcount;
}
//resolution view counts dep
export function findResolutionShowCountfoDep(defcount) {
    var cviewwidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
    
    let expcount = (defcount + 1);
    if(cviewwidth > 992 && cviewwidth < 1600) {
        expcount = (expcount - 1);
    } 
    if(cviewwidth > 1000){
        expcount = 7;
    }
    if(cviewwidth > 1900){
        expcount = 10;
    }
    if(cviewwidth > 2500){
        expcount = 11;
    }
    
    return expcount;
}
//resolution view counts
export function findResolutionType(defcount) {
    var cviewwidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
    
    let expcount = (defcount + 1);
    if(cviewwidth > 992 && cviewwidth < 1600) {
        expcount = (expcount - 1);
    } 
    
    if(cviewwidth > 992 && cviewwidth <= 1024){
        expcount = 3;
    }

    if(cviewwidth > 1900){
        expcount = 5;
    }

    if(cviewwidth > 2500){
        expcount = 4;
    }
    
    return expcount;
}
//find max result
export function FindMPMaxResult(divHeight,oneresultHeight,allocatedspace){
    var result={}
    var maxresult=1
    maxresult=(divHeight-allocatedspace)/oneresultHeight
    result = parseInt(maxresult.toFixed(0));

    return result
}
