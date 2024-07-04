import { v4 as uuidv4 } from 'uuid'; //unique id

import { roundOffDecimal } from '../../_services/common.service';
import { checkThroughProductsTest } from '../planograms/planDisplayUnit/additionalcontents';
import { checkDrawRectInShelve, getRectPercentage, checkSnapAllow, convertWidthPercent, getNameorIdorColorofBox } from './AddMethods'; //, getReduceSizeValue

import i18n from "../../_translations/i18n"; 
import { alertService } from '../../_services/alert.service';
import { catRectEnums } from '../../enums/masterPlanogramEnums';


//check if allow to resize or move rect
export function checkAllowMoveResize (event, isresize, isheight, isactionend, isotherside, lastAllowedXY, moveXY, props) {
  const checkevt = JSON.parse(JSON.stringify(event));
  
  let selcatrect = (props.catrectitem?props.catrectitem:null);
  
  //if resize/move allowed
  let isallowchange = {isallow: false, rectobj: null, rectidx: -1 };
  let saftyallowvalue = 0.01;
  //check rect box define
  let srectx1 = roundOffDecimal(checkevt.x,2);
  let srecty1 = roundOffDecimal(checkevt.y,2);
  let srectx2 = roundOffDecimal((checkevt.x + moveXY.width),2);
  let srecty2 = roundOffDecimal((checkevt.y + moveXY.height),2);
  //if resize - define new box details
  if(isresize){
    if(!isotherside){
      srectx1 = roundOffDecimal(lastAllowedXY.x,2);
      srecty1 = roundOffDecimal(lastAllowedXY.y,2);
    }

    srectx2 = roundOffDecimal((lastAllowedXY.x + lastAllowedXY.width),2);
    srecty2 = roundOffDecimal((lastAllowedXY.y + lastAllowedXY.height),2);

    if(isheight){
      if(isotherside){
        srectx1 = roundOffDecimal(lastAllowedXY.x,2);

      } else{
        let reduceheight = ((lastAllowedXY.y + lastAllowedXY.height) - checkevt.y);
        let newheight = roundOffDecimal((lastAllowedXY.height - reduceheight),2);

        srecty2 = roundOffDecimal((lastAllowedXY.y + newheight),2);
      }
    } else{
      if(isotherside){
        srecty1 = roundOffDecimal(lastAllowedXY.y,2);

      } else{
        let reducewidth = ((lastAllowedXY.x + lastAllowedXY.width) - checkevt.x);
        let newwidth = roundOffDecimal((lastAllowedXY.width - reducewidth),2);

        srectx2 = roundOffDecimal((lastAllowedXY.x + newwidth),2);
      }
    }
  }
  //console.log(srectx1, srecty1, srectx2, srecty2);
  //if is sub category
  if(!props.isbrand){
    isallowchange.isallow = true;

    //readjust box location details, if it out of layout
    srectx1 = (srectx1 >= 0?srectx1:0);
    srectx2 = (srectx2 <= props.viewWidth?srectx2:props.viewWidth);
    srecty1 = (srecty1 >= 0?srecty1:0);

    //check
    if(isresize){
      //check is inner layout except for height
      // if(srectx1 >= 0 && srecty1 >= 0){ //srectx2 <= props.viewWidth &&  && srecty2 <= this.props.viewHeight
      //   srectx2 = (srectx2 <= props.viewWidth?srectx2:props.viewWidth);
      //   isallowchange.isallow = true;
      // }

      //is less or more than opposite side
      let lastwidth = ((lastAllowedXY.x + lastAllowedXY.width) - 10);
      let lastheight = ((lastAllowedXY.y + lastAllowedXY.height) - 10);
      
      if((!isheight && ((!isotherside && checkevt.x < (lastAllowedXY.x + 10)) || (isotherside && checkevt.x > lastwidth))) || 
      (isheight && ((!isotherside && (checkevt.y + 10) < lastAllowedXY.y) || (isotherside && checkevt.y > lastheight)))){
        isallowchange.isallow = false;
      }

    } else{
      //check
      if(srectx1 >= props.viewWidth || srectx2 <= 0 || srecty1 >= props.viewHeight || srecty2 <= 0){
        isallowchange.isallow = false;
      }
    }
    
    if(isallowchange.isallow){
      //get current rect from main rect views
      let crectlist = JSON.parse(JSON.stringify(props.rectsets));

      let checksubitem = crectlist[props.parentidx].rects[props.curno];
      checksubitem.y = srecty1;
      checksubitem.height = roundOffDecimal(moveXY.height,2);

      //get new y,height and contain shelve details
      let returnobj = checkDrawRectInShelve(props.fieldObj, selcatrect, props.layoutWidth, false, checksubitem);
      //console.log(returnobj);

      //check resize is more than shelves
      if(returnobj && returnobj.contain_shelves && returnobj.contain_shelves.length > 0){
        for (let l = 0; l < returnobj.contain_shelves.length; l++) {
          const cfieldshelve = returnobj.contain_shelves[l];

          let iscshelvecontains = (selcatrect?selcatrect.contain_shelves.findIndex(x => x.rank === cfieldshelve.rank):-1);
          
          if(iscshelvecontains === -1){
            isallowchange.isallow = false; 
          }
        }
      } else{
        isallowchange.isallow = false; 
      }
      
      if(isallowchange.isallow){
        //if sub cat has brands 
        if(checksubitem.brands && checksubitem.brands.length > 0){
            if(isresize && isheight){
              alertService.error(i18n.t("CANNOT_CHANGE_BRANDS_AVAILABLE"));
              return false;

            } else if(checksubitem.contain_shelves.length !== returnobj.contain_shelves.length){
              alertService.error(i18n.t("CANNOT_CHANGE_BRANDS_AVAILABLE"));
              return false;

            } else{
              srecty2 = roundOffDecimal((returnobj.y + returnobj.height),2);
            }
            
          }
          
          //check brands to disable if resizing lower than maximum item positions
          if(isactionend && checksubitem.brands && checksubitem.brands.length > 0){
            let filterrectbrands = [];
            for (let j = 0; j < checksubitem.brands.length; j++) {
              const checkbranditem = checksubitem.brands[j];
              if(!checkbranditem.isDelete){
                for (let k = 0; k < checkbranditem.rects.length; k++) {
                  const checkbrect = checkbranditem.rects[k];
                  if(!checkbrect.isDelete && checkbrect.width > 0 && checkbrect.percentage > 0){
                    filterrectbrands.push(checkbrect);
                  }
                }
              }
            }

            if(isresize && isheight){
              if(filterrectbrands && filterrectbrands.length > 0){
                alertService.error(i18n.t("CANNOT_CHANGE_BRANDS_AVAILABLE"));
                return false;
              }
            }
            
            //sort brands list to highest y list
            if(filterrectbrands && filterrectbrands.length > 0){
              let sortmaxymin = filterrectbrands.sort((a,b) => (b.y + b.height) - (a.y + a.height));
              let lowestyitem = roundOffDecimal(sortmaxymin[(sortmaxymin.length - 1)].y,2); //get lowest y
              let heighestyitem = roundOffDecimal((sortmaxymin[0].y + sortmaxymin[0].height),2); //get highest y
              
              //validate with created brand xy values to check resize is lower than brand margins
              if(isresize){
                if(srecty1 > lowestyitem || srecty2 < heighestyitem){ //srectx1 > lowestxitem || srectx2 < highestxitem || 
                  isallowchange.isallow = false; 
                  alertService.error(i18n.t("cannot_resize_minimum_brands"));
                }
              } else{
                //adjust width height to lowest/highest xy
                // srectx1 = (srectx1 <= lowestxitem?srectx1:lowestxitem);
                // srectx2 = (srectx2 >= highestxitem?srectx2:highestxitem);
                // srecty1 = (srecty1 <= lowestyitem?srecty1:lowestyitem);
                // srecty2 = (srecty2 >= heighestyitem?srecty2:heighestyitem);
                
              }  
            }
          }

          //temp -
          srectx1 = roundOffDecimal((srectx1 + saftyallowvalue),2);
          srecty1 = roundOffDecimal((srecty1 + saftyallowvalue),2);
          srectx2 = roundOffDecimal((srectx2 - saftyallowvalue),2);
          srecty2 = roundOffDecimal((srecty2 - saftyallowvalue),2);
          
          //check is it overlapping other sub cat rects
          for (let j = 0; j < props.rectsets.length; j++) {
            const subcitem = props.rectsets[j];
            
            if(!subcitem.isDelete){
              for (let i = 0; i < subcitem.rects.length; i++) {
                const rectitem = subcitem.rects[i];
                
                if(!rectitem.isDelete && (j !== props.parentidx || (j === props.parentidx && i !== props.curno))){
                  let snrectx1 = roundOffDecimal(rectitem.x,2);
                  let snrecty1 = roundOffDecimal(rectitem.y,2);
                  let snrectx2 = roundOffDecimal((rectitem.x + rectitem.width),2);
                  let snrecty2 = roundOffDecimal((rectitem.y + rectitem.height),2);
                  
                  //if resize
                  if(!isresize || (!isheight && (snrectx1 > srectx1 || snrectx2 > srectx1)) || (isheight && (snrecty1 > srecty1 || snrecty2 > srecty1))){
                    let issubcoverlap = checkThroughProductsTest(srectx1, srecty1, srectx2, srecty2, snrectx1, snrecty1, snrectx2, snrecty2);
                    
                    if(!issubcoverlap){
                      isallowchange.isallow = false;
                    }
                  }
                }
              }    
            }
          }
          
        }
      }
      
  } else{
    isallowchange.isallow = true;
    
    //is brand inside sub category
    const rectitem = props.subrectitem;
    //set rect item
    isallowchange.rectobj = props.subrectitem;
    isallowchange.rectidx = props.rectidx;
    
    
    let snrectx1 = roundOffDecimal(rectitem.x,2);
    let snrecty1 = roundOffDecimal(rectitem.y,2);
    let snrectx2 = roundOffDecimal((rectitem.x + rectitem.width),2);
    let snrecty2 = roundOffDecimal((rectitem.y + rectitem.height),2);
    
    //parent rect brands list
    let parentbrandlist = props.parentitem.rects[props.rectidx].brands;

    //readjust box location details, if it out of layout
    if(isresize){
      //is less or more than opposite side
      let lastwidth = ((lastAllowedXY.x + lastAllowedXY.width) - 10);
      let lastheight = ((lastAllowedXY.y + lastAllowedXY.height) - 10);
      
      if((!isheight && ((!isotherside && checkevt.x < (lastAllowedXY.x + 10)) || (isotherside && checkevt.x > lastwidth))) || 
      (isheight && ((!isotherside && (checkevt.y + 10) < lastAllowedXY.y) || (isotherside && (checkevt.y > lastheight || checkevt.y < rectitem.y))))){
        isallowchange.isallow = false;
      }

    } else{
      //validating size details are setting to inside sub rect details
      let isinsideparentbox = checkThroughProductsTest(srectx1, srecty1, srectx2, srecty2, snrectx1, snrecty1, snrectx2, snrecty2);
      
      if(!isinsideparentbox){
        srectx1 = (srectx1 >= snrectx1?srectx1:snrectx1);
        srectx2 = (srectx2 <= snrectx2?srectx2:snrectx2);
        srecty1 = (srecty1 >= snrecty1?srecty1:snrecty1);
      }
      
      isallowchange.isallow = true;

      //check rect is inside parent sub category
      if(srectx1 >= snrectx2 || srectx2 <= snrectx1 || srecty1 >= snrecty2 || srecty2 <= snrecty1){
        isallowchange.isallow = false;

        //check is it inside other box of sub category
        if(props.parentitem.rects && props.parentitem.rects.length > 0){
          for (let j = 0; j < props.parentitem.rects.length; j++) {
            const parentrect = props.parentitem.rects[j];
            
            let prectx1 = roundOffDecimal(parentrect.x,2);
            let precty1 = roundOffDecimal(parentrect.y,2);
            let prectx2 = roundOffDecimal((parentrect.x + parentrect.width),2);
            let precty2 = roundOffDecimal((parentrect.y + parentrect.height),2);
            
            if(srectx1 <= prectx2 && srectx2 > prectx1 && srecty1 <= precty2 && srecty2 > precty1){
              //set rect item
              isallowchange.rectobj = parentrect;
              isallowchange.rectidx = j;

              isallowchange.isallow = true;
              //set this rect brand as check list
              parentbrandlist = parentrect.brands;
            }
          }
        }
      }
    }

    //get current changing sub category rect and brand details
    /* let droppingsub = crectlist[props.parentidx].rects[isallowchange.rectidx]
    let parentsub = crectlist[props.parentidx].rects[props.rectidx];

    let subitem = parentsub.brands[props.curno].rects[props.brectidx];

    let returnobj = checkDrawRectInShelve(props.fieldObj, droppingsub, props.layoutWidth, true, subitem);
    if(returnobj && returnobj.contain_shelves && returnobj.contain_shelves.length > 0){
      
    } else{
      isallowchange.isallow = false;
    } */
    
    if(isallowchange.isallow){
      //temp -
      srectx1 = roundOffDecimal((srectx1 + saftyallowvalue),2);
      srecty1 = roundOffDecimal((srecty1 + saftyallowvalue),2);
      srectx2 = roundOffDecimal((srectx2 - saftyallowvalue),2);
      srecty2 = roundOffDecimal((srecty2 - saftyallowvalue),2);

      //is it overlapping other brands inside same sub cat
      for (let l = 0; l < parentbrandlist.length; l++) {
        const branditem = parentbrandlist[l];
        
        if(!branditem.isDelete){
          for (let j = 0; j < branditem.rects.length; j++) {
            const brectitem = branditem.rects[j];
            //without current brand
            if(brectitem.id !== props.rectitem.id){
              if(!brectitem.isDelete && brectitem.width > 0){
                  let snrectx1 = roundOffDecimal(brectitem.x,2);
                  let snrecty1 = roundOffDecimal(brectitem.y,2);
                  let snrectx2 = roundOffDecimal((brectitem.x + brectitem.width),2);
                  let snrecty2 = roundOffDecimal((brectitem.y + brectitem.height),2);
                  
                  if(!isresize || (!isheight && (snrectx1 > srectx1 || snrectx2 > srectx1)) || (isheight && (snrecty1 > srecty1 || snrecty2 > srecty1))){
                    let isbrandoverlap = checkThroughProductsTest(srectx1, srecty1, srectx2, srecty2, snrectx1, snrecty1, snrectx2, snrecty2);
                    
                    if(!isbrandoverlap){
                      isallowchange.isallow = false;
                    } 
                  }
              }
            }
            
          }
        }
      }  
    }
  }

  //console.log(isallowchange);
  return isallowchange;
} 
//
export function updateRectProps (ismove, event, cx, cy, ischangex, isopposite, isreducevalue, lastAllowedXY, props, checkreturnobj) {
  
  let selcatrect = (props.catrectitem?props.catrectitem:null);
  let crectlist = JSON.parse(JSON.stringify(props.rectsets));
  
  let lastallowobj = JSON.parse(JSON.stringify(lastAllowedXY));

  let isrefreshrects = false;
  //if it's brand
  if(props.isbrand){
    let checkrectidx = (checkreturnobj && checkreturnobj.rectobj?checkreturnobj.rectidx:props.rectidx);
    let isdroppingotherrect = (checkrectidx !== props.rectidx);
    
    let curbrandidx = props.curno;
    let curbrectidx = props.brectidx;

    //get current changing sub category rect and brand details
    let droppingsub = crectlist[props.parentidx].rects[checkrectidx]
    let parentsub = crectlist[props.parentidx].rects[props.rectidx];

    let snrectx1 = roundOffDecimal(droppingsub.x,2);
    let snrecty1 = roundOffDecimal(droppingsub.y,2);
    let snrectx2 = roundOffDecimal((droppingsub.x + droppingsub.width),2);
    let snrecty2 = roundOffDecimal((droppingsub.y + droppingsub.height),2);

    let subitem = parentsub.brands[curbrandidx].rects[curbrectidx];

    let subcontains = subitem.contain_shelves;
    let containlast = subcontains[(subcontains.length - 1)];
    let findinfield = props.fieldObj.field_shelves.find(x => x.rank === containlast.rank);
    let newcygap = roundOffDecimal((snrecty2 - cy),2);

    //if change is moving box or opposite side resizing
    if(ismove || isopposite){
      if(isopposite){ //if opposite
        if(ischangex){ //if x value change
          subitem.x = cx;

          let gapbetweenlastx = (lastallowobj.x - cx);
          let newxwidth = roundOffDecimal((lastallowobj.width + gapbetweenlastx),2);

          subitem.width = newxwidth;
        } else{
          let gapbetweenlasty = (lastallowobj.y - cy);
          let newyheight = roundOffDecimal((lastallowobj.height + gapbetweenlasty),2);
          
          subitem.height = (newcygap < findinfield.drawHeight?findinfield.drawHeight:newyheight);
          subitem.y = (newcygap < findinfield.drawHeight?((droppingsub.y + droppingsub.height) - subitem.height):cy);
        }
      } else{
        //readjust box location details, if it out of layout
        let srectx2 = (cx + lastallowobj.width);
        
        subitem.width = (cx < snrectx1?(srectx2 - snrectx1):srectx2 <= snrectx2?lastallowobj.width:(snrectx2 - cx));
        subitem.height = (newcygap < findinfield.drawHeight?findinfield.drawHeight:cy < snrecty1?(lastallowobj.height + cy):lastallowobj.height);
        subitem.x = (cx >= snrectx1?cx:snrectx1);
        subitem.y = (newcygap < findinfield.drawHeight?((droppingsub.y + droppingsub.height) - subitem.height):cy >= snrecty1?cy:snrecty1);
      }
    } else{
      if(ischangex){
        subitem.width = lastallowobj.width;
      } else{
        subitem.height = lastallowobj.height;
      }  
    }

    //check is snapping
    let snappingobj = (!isreducevalue?checkSnapAllow(subitem, props.layoutWidth, false, droppingsub.brands, droppingsub):false);
    //console.log(snappingobj);

    if(snappingobj){
      subitem.x = snappingobj.x;
      subitem.width = snappingobj.width;
      lastallowobj.width = snappingobj.width;

      if(snappingobj.isrightsnap){
        subitem.isSnapped = true;
      } else if(snappingobj.isleftsnap > -1){
        crectlist[props.parentidx].rects[checkrectidx].brands[snappingobj.isleftsnap].isSnapped = true;
      }
    } 
    
    let returnobj = checkDrawRectInShelve(props.fieldObj, droppingsub, props.layoutWidth, true, subitem);
    // console.log(JSON.parse(JSON.stringify(returnobj)));

    if(returnobj){
      //if dropping rect is not already exsting rect remove from current rect and drop to other rect
      if(isdroppingotherrect){
        isrefreshrects = true;

        returnobj["id"] = uuidv4();
        returnobj["isNew"] = true;

        let newbrandobj = JSON.parse(JSON.stringify(crectlist[props.parentidx].rects[props.rectidx].brands[curbrandidx]));

        //remove old one
        let oldbrandrect = crectlist[props.parentidx].rects[props.rectidx].brands[curbrandidx].rects[curbrectidx];
        if(!oldbrandrect.isNew){
          oldbrandrect["isDelete"] = true;
          //if left brand rect are zero remove brand item
          let leftbrandrectlength = crectlist[props.parentidx].rects[props.rectidx].brands[curbrandidx].rects.filter(x => !x.isDelete);
          if(leftbrandrectlength.length === 0){
            crectlist[props.parentidx].rects[props.rectidx].brands[curbrandidx]["isDelete"] = true;
          }

        } else{
          crectlist[props.parentidx].rects[props.rectidx].brands[curbrandidx].rects.splice(curbrectidx,1);
          //if left brand rect are zero remove brand item
          if(crectlist[props.parentidx].rects[props.rectidx].brands[curbrandidx].rects.length === 0){
            crectlist[props.parentidx].rects[props.rectidx].brands.splice(curbrandidx,1);
          }
        }

        //check brand already exists
        let existingbrandidx = crectlist[props.parentidx].rects[checkrectidx].brands.findIndex(x => !x.isDelete && (
          (props.mainitem.type === catRectEnums.default && x.type === catRectEnums.default && x.brand.brandId === props.mainitem.brand.brandId) ||
          (props.mainitem.type === catRectEnums.rule && x.type === catRectEnums.rule && getNameorIdorColorofBox(x,"num") === getNameorIdorColorofBox(props.mainitem,"num"))
        ));
        //if found push to the found brand rect 
        //otherwise create new brand object and push to the brand list
        if(existingbrandidx > -1){
          curbrandidx = existingbrandidx;
          curbrectidx = crectlist[props.parentidx].rects[checkrectidx].brands[existingbrandidx].rects.length;
          
          crectlist[props.parentidx].rects[checkrectidx].brands[existingbrandidx].rects.push(returnobj);
          
        } else{
          newbrandobj["id"] =  uuidv4();
          newbrandobj["isNew"] = true; 
          newbrandobj["isDelete"] = false;
          newbrandobj["rects"] = [returnobj];
          
          curbrandidx = crectlist[props.parentidx].rects[checkrectidx].brands.length;
          curbrectidx = 0;

          crectlist[props.parentidx].rects[checkrectidx].brands.push(newbrandobj);
        }
        
      } else{
        crectlist[props.parentidx].rects[checkrectidx].brands[curbrandidx].rects[curbrectidx] = returnobj;
      }
    }
    
    subitem = crectlist[props.parentidx].rects[checkrectidx].brands[curbrandidx].rects[curbrectidx];
    
    let totalrectwidth = 0; 
    for (let i = 0; i < crectlist[props.parentidx].rects.length; i++) {
      const cviewitem = crectlist[props.parentidx].rects[i];
      if(!cviewitem.isDelete){
        totalrectwidth = (totalrectwidth + (cviewitem.width * cviewitem.contain_shelves.length));
      }
    }
    
    let checkpercentages = getRectPercentage(subitem, totalrectwidth, crectlist[props.parentidx].rects[checkrectidx], true);
    subitem["percentage"] = roundOffDecimal(checkpercentages.percentage,2);
    subitem["box_width_percentage"] = roundOffDecimal(checkpercentages.box_percentage,2);

    //update last details
    lastallowobj.x = subitem.x;
    lastallowobj.y = subitem.y;
    lastallowobj.width = subitem.width;
    lastallowobj.height = subitem.height;

    //console.log(crectlist[props.parentidx]);
    
  } else{
    let bkpitem = JSON.parse(JSON.stringify(crectlist[props.parentidx].rects[props.curno]));
    let subitem = crectlist[props.parentidx].rects[props.curno];
    
    let subcontains = subitem.contain_shelves;
    let containlast = subcontains[(subcontains.length - 1)];
    let findinfield = props.fieldObj.field_shelves.find(x => x.rank === containlast.rank);
    let newcygap = roundOffDecimal((props.viewHeight - cy),2);

    //if sub category move or opposite side resize
    if(ismove || isopposite){
      if(isopposite){ //if opposite
        if(ischangex){ //if change x value
          subitem.x = cx;

          let gapbetweenlastx = (lastallowobj.x - cx);
          let newxwidth = roundOffDecimal((lastallowobj.width + gapbetweenlastx),2);

          subitem.width = newxwidth;
        } else{
          let gapbetweenlasty = (lastallowobj.y - cy);
          let newyheight = roundOffDecimal((lastallowobj.height + gapbetweenlasty),2);
          
          subitem.height = (newcygap < findinfield.drawHeight?findinfield.drawHeight:newyheight);
          subitem.y = (newcygap < findinfield.drawHeight?(props.viewHeight - subitem.height):cy);
        }
      } else{
        //readjust box location details, if it out of layout
        let srectx2 = (cx + lastallowobj.width);

        subitem.width = (cx < 0?(lastallowobj.width + cx):srectx2 > props.viewWidth?(props.viewWidth - cx):lastallowobj.width);
        subitem.height = (newcygap < findinfield.drawHeight?findinfield.drawHeight:lastallowobj.height);
        subitem.x = (cx >= 0?cx:0);
        subitem.y = (newcygap < findinfield.drawHeight?(props.viewHeight - subitem.height):cy >= 0?cy:0);
        
        //subitem.height = lastallowobj.height;
      }
    } else{
      if(ischangex){
        subitem.width = (lastallowobj.width > props.parentWidth?props.parentWidth:lastallowobj.width);
      } else{
        subitem.height = (lastallowobj.height > props.parentHeight?props.parentHeight:lastallowobj.height);
      }  
    }
    //console.log(lastallowobj);
    //check snap rect
    //if(ismove){
      //check is snapping
      let snappingobj = (!isreducevalue?checkSnapAllow(subitem, props.layoutWidth, true, props.rectsets, null):false);
      //console.log(snappingobj);
      subitem.isSnapped = false;
      if(snappingobj){
        subitem.x = snappingobj.x;
        subitem.width = snappingobj.width;
        lastallowobj.width = snappingobj.width;

        if(snappingobj.isrightsnap){
          subitem.isSnapped = true;
        } else if(snappingobj.isleftsnap > -1){
          crectlist[snappingobj.leftparent].rects[snappingobj.isleftsnap].isSnapped = true;
        }
      } 
      //console.log(subitem);
      let returnobj = checkDrawRectInShelve(props.fieldObj, selcatrect, props.layoutWidth, false, subitem);
      if(returnobj){
        //console.log(returnobj);
        crectlist[props.parentidx].rects[props.curno] = returnobj;
      }
      
      subitem = crectlist[props.parentidx].rects[props.curno];
      //update last details
      lastallowobj.x = subitem.x;
      lastallowobj.y = subitem.y;
      lastallowobj.width = subitem.width;
      lastallowobj.height = subitem.height;
    //}

    let checkpercentages = getRectPercentage(subitem, props.parentWidth, props.fieldObj);
    subitem["percentage"] = roundOffDecimal(checkpercentages.percentage,2);
    subitem["box_width_percentage"] = roundOffDecimal(checkpercentages.box_percentage,2);
    
    let totalrectper = 0; let totalrectwidth = 0;
    for (let i = 0; i < crectlist[props.parentidx].rects.length; i++) {
      const cvitem = crectlist[props.parentidx].rects[i];
      if(!cvitem.isDelete){
        totalrectper = (totalrectper + cvitem.percentage);
        totalrectwidth = (totalrectwidth + (cvitem.width * cvitem.contain_shelves.length));
      }
    }
    crectlist[props.parentidx].percentage = roundOffDecimal(totalrectper,2);

    //update brands if available
    //get gap between last
    let reducevalue = roundOffDecimal((subitem.width - bkpitem.width),2);
    let reducexvalue = roundOffDecimal((subitem.x - bkpitem.x),2);
    
    //let reducehgtvalue = roundOffDecimal((lastallowobj.height - bkpitem.height),2);
    let reduceyvalue = (ismove?roundOffDecimal((subitem.y - bkpitem.y),2):0);

    //console.log(reducexvalue,reducevalue,reduceyvalue,reducehgtvalue);

    //checking sub cat rect
    let viewitem = crectlist[props.parentidx].rects[props.curno];
    
    if(viewitem.brands && viewitem.brands.length > 0){
      //loop available brands
      for (let i = 0; i < viewitem.brands.length; i++) {
        let branditem = viewitem.brands[i];
        
        if(!branditem.isDelete){
          for (let v = 0; v < branditem.rects.length; v++) {
            let rectitem = branditem.rects[v];

            //change brand x
            if(reducexvalue !== 0 || reducevalue !== 0){
              let oldxgap = (rectitem.x - bkpitem.x); //brand x gap between old sub rect x value

              /* if(ismove){
                rectitem.x =  subitem.x + oldxgap;
              } else{
                let newreducex = (oldxgap > 0?(!isopposite && reducevalue !== 0?reducevalue:reducexvalue):reducexvalue);
                
                let reducex = getReduceSizeValue(oldxgap, bkpitem.width, newreducex); //get how much should change
                rectitem.x =  roundOffDecimal((reducex !== 0?(isopposite?(rectitem.x + newreducex):(rectitem.x + reducex)):(rectitem.x + reducexvalue)),2);
              } */

              let getbrandxwidth = convertWidthPercent(oldxgap,bkpitem.width);
              let getnewbrandxgap = convertWidthPercent(getbrandxwidth,subitem.width,true);
              rectitem.x = (subitem.x + getnewbrandxgap);
            }
            
            //change brand y
            if(reduceyvalue !== 0){
              let oldygap = (rectitem.y - bkpitem.y);
              
              // let reducey = getReduceSizeValue(oldygap, bkpitem.height, reduceyvalue);
              // rectitem.y =  (reducey !== 0?(rectitem.y + reducey):(rectitem.y + reduceyvalue));
              rectitem.y =  roundOffDecimal((subitem.y + oldygap),2);
            }
            
            //change brand width
            if(reducexvalue !== 0 || reducevalue !== 0){
              //let newreducevalue = (reducevalue !== 0?reducevalue:reducexvalue);
              let getbrandwidth = convertWidthPercent(rectitem.width,bkpitem.width);

              let reducewidth = convertWidthPercent(getbrandwidth, subitem.width, true);
              rectitem.width = roundOffDecimal(reducewidth,2);
            }

            //change brand height
            /* if(reducehgtvalue !== 0){
              let reduceheight = getReduceSizeValue(rectitem.height, subitem.height, reducehgtvalue);
              rectitem.height = (rectitem.height + reduceheight);
            } */
            
            let returnobj = checkDrawRectInShelve(props.fieldObj, selcatrect, props.layoutWidth, false, rectitem);
            if(returnobj){
              viewitem.brands[i].rects[v] = returnobj;
            }
            rectitem = viewitem.brands[i].rects[v];
            //change new percentages
            let checkpercentages = getRectPercentage(rectitem, totalrectwidth, viewitem, true);
            
            rectitem["percentage"] = roundOffDecimal(checkpercentages.percentage,2);
            rectitem["box_width_percentage"] = roundOffDecimal(checkpercentages.box_percentage,2);

            //change contain shelves of brand 
            
              
          }
          
        }
      }
      //console.log(viewitem.brands);
    }
  }
  
  return {rectlist: crectlist, lastallow: lastallowobj, isrefreshrects};
}
//
export function findDropSpace (event, boxobj, allrects, fieldobj, layoutwidth, parentitem, isbrand){
  //find empty space
  let curx = event.x;
  let cury = event.y;
  
  let locaObj = {x: 0, y:0, width: layoutwidth, height: fieldobj.drawHeight};
  for (let i = 0; i < allrects.length; i++) {
    const subitem = allrects[i];
    //console.log(rectitem);
    if(!subitem.isDelete && subitem.id !== parentitem.id){

      for (let j = 0; j < subitem.rects.length; j++) {
        const rectitem = subitem.rects[j];
        
        if(!rectitem.isDelete){
          let rectx1 = rectitem.x;
          let rectx2 = (rectitem.x + rectitem.width);
          let recty1 = rectitem.y;
          let recty2 = (rectitem.y + rectitem.height);
          
          if(rectx2 < curx && rectx2 > locaObj.x){
            locaObj.x = rectx2; 
          }
  
          if(recty2 < cury && recty2 > locaObj.y){
            locaObj.y = recty2; 
          }
  
          let curx2 = (locaObj.x + locaObj.width);
          if(rectx1 > curx && rectx1 < curx2){
            let gapbetweenx = (rectx1 - locaObj.x);
            locaObj.width = gapbetweenx; 
          }
  
          let cury2 = (locaObj.y + locaObj.height);
          if(recty1 > cury && recty1 < cury2){
            let gapbetweeny = (recty1 - locaObj.y);
            locaObj.height = gapbetweeny; 
          }
        }
      }
      
    }
  }
  
  let isChangeAvailable = false;
  if(locaObj.width < boxobj.width){
    isChangeAvailable = true;

    if(locaObj.height >= boxobj.height){
      locaObj.height = boxobj.height;
    }
  } else if(locaObj.height <= boxobj.height){
    isChangeAvailable = true;

    if(locaObj.width > boxobj.width){
      locaObj.width = boxobj.width;
    }
  }
  // console.log(locaObj);
  return {isChangeAvailable: isChangeAvailable, locObj: locaObj};
}