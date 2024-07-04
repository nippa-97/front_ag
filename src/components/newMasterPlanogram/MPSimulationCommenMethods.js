import { Badge, Col } from "react-bootstrap";
import moment from "moment";
import i18n from '../../_translations/i18n';

import { catRuleEnums, catRectEnums, MPBoxType } from "../../enums/masterPlanogramEnums";
import { measureConverter, roundOffDecimal } from "../../_services/common.service";

import arigologo from '../../assets/img/logo_o.png';


//check main object and return name or id of rule/ subcat/cat/brand
export function getNameorIdorColorofBox(mainObj,returntype){
    let returnvalue = null;
   
    if(mainObj.type===MPBoxType.default){
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
    else if(mainObj.type===MPBoxType.rule){
        var ruleobj=mainObj.rule
        if(ruleobj.level === catRuleEnums.sup && ruleobj.supplier){ //supplier
            returnvalue = (returntype === "num"?ruleobj.supplier.supplierId:returntype === "color"?ruleobj.supplier.color:ruleobj.supplier.supplierName);

        } else if(ruleobj.level === catRuleEnums.subcat && ruleobj.sub_category){ //sub category
            returnvalue = (returntype === "num"?ruleobj.sub_category.subCategoryId:returntype === "color"?ruleobj.sub_category.color:ruleobj.sub_category.subCategoryName);

        } else if(ruleobj.level === catRuleEnums.brand && ruleobj.brand){ //sub category
            returnvalue = (returntype === "num"?ruleobj.brand.brandId:returntype === "color"?ruleobj.brand.color:ruleobj.brand.brandName);

        } else if(ruleobj.level === catRuleEnums.cat && ruleobj.category){ // category
            returnvalue = (returntype === "num"?ruleobj.category.categoryId:returntype === "color"?ruleobj.category.color:ruleobj.category.categoryName);
            
        }
    }
    
    return returnvalue;
}
export function PushBranchGetboxNamefromDealer(mainObj,returntype){
    let returnvalue = null;

    if(mainObj.type===MPBoxType.default){
        if(mainObj.category){
            returnvalue = (returntype === "num"?mainObj.category.categoryId:returntype === "color"?mainObj.category.color:mainObj.category.categoryName);
        }
    }
    else if(mainObj.type===MPBoxType.rule){
        var ruleArray=mainObj.drawRule
        if(ruleArray.length === 0){
            returnvalue = "";
        }
        for (let i = 0; i < ruleArray.length; i++) {
            const rule = ruleArray[i];
            if(i>0){
                returnvalue=(returnvalue+"/"+rule.name)
            }else{
                returnvalue=rule.name
            }
        }
    }
    return returnvalue;
}
export function PrintCoverPageView(props) {

    let chaindetails = (props.signedobj && props.signedobj.signinDetails?props.signedobj.signinDetails.chain:null);
    let userdetails = (props.signedobj && props.signedobj.signinDetails?props.signedobj.signinDetails.userDto:null);
    let departmentname = (props.simType === "AUI")?((props.department&&props.department.name)?(props.department.name+" "+props.t("department")):"-"):((props.department&&props.department.department_name)?(props.department.department_name+" "+props.t("department")):"-");
    let mpDetails=(props.defSaveObj&&props.defSaveObj.masterPlanogram)?props.defSaveObj.masterPlanogram:undefined
    
    // originatedMpName={this.props.originatedMpName}
    // originatedMpId={this.props.originatedMpId}

    let MPVersion=(mpDetails?mpDetails.version:"");
    let MPVName=(props.originatedMpId > 0?props.originatedMpName:mpDetails?mpDetails.name:"");
    let isOriginatedMPAvailable = (props.originatedMpId > 0);

    // let departmentname = ((props.department&&props.department.department_name)?(props.department.department_name+" "+props.t("department")):"-");
    return <>
        <Col id={props.mainid} style={{display: "none", position: "relative"}}>
            <Col id={props.subid} className="printpreview-cover" style={{display: "block", position: "relative", width: 1191, height: 842}}>
                <ul className="list-inline top-list">
                    <li className="list-inline-item">
                        <label>
                            {props.t("FIELD_COUNT")}: <span>{props.fieldCount?props.fieldCount:0}</span>
                            {props.isFieldWisePDFPrint?
                                <Badge bg="info">{props.t("FIELD_WISE_PRINT")}</Badge>
                                :<Badge bg="info">{props.t("CATEGORY_WISE_PRINT")}</Badge>
                            }
                        </label>
                    </li>
                    <li className="list-inline-item"><img src={arigologo} className="printmain-logo" alt="" /></li>
                </ul>

                <h4>{chaindetails?chaindetails.chainName:"-"} <br/>
                    <b>{departmentname}{props.isCatview?(" | "+props.categoryName):""}</b>
                </h4>

                {props.searchobj && props.searchobj.selectedTagsId && props.searchobj.selectedTagsId.length > 0?<>
                    <ul className="list-inline tags-list">
                        {props.searchobj.selectedTagsId.map((tagitem, tagidx) => {
                            return <li key={tagidx} className="list-inline-item">{tagitem.tagName}</li>;
                        })}
                    </ul>
                </>:<></>}
                {mpDetails?<h5>
                    {/* {chaindetails?chaindetails.chainName:"-"} <br/> */}
                    {isOriginatedMPAvailable?MPVName:(MPVName+" | v"+MPVersion)}
                </h5>:<></>}
                
                <Col className="cover-footer">
                    <ul className="list-inline">
                        <li className="list-inline-item">
                            {props.isRTL === "rtl"?
                                <label>{props.searchobj && props.searchobj.storeName?(props.searchobj.storeName)+" <":""} {" "+(chaindetails?chaindetails.chainName:"-")}</label>
                            :
                                <label>{(chaindetails?chaindetails.chainName:"-")+" "} {props.searchobj && props.searchobj.storeName?("> "+props.searchobj.storeName):""}</label>
                            }
                        </li>
                        <li className="list-inline-item" dir="ltr">
                            {props.isRTL === "rtl"?
                                <label>{(userdetails?(userdetails.lName+" "+userdetails.fName):"-")} | {moment().format("hh:mm:ss")} | {moment().format("MMMM DD YYYY")}</label>
                            :
                                <label>{moment().format("MMMM DD YYYY")} | {moment().format("hh:mm:ss")} | {(userdetails?(userdetails.fName+" "+userdetails.lName):"-")}</label>
                            }
                        </li>
                    </ul>
                </Col>
            </Col>    
        </Col>
    </>;
}

export function compareAndGetFieldProds(mapfields, simobj, mapproductList, isFieldPrint, actualFieldsCounts, displayUOM, displayRatio, saftyMargin){
    let cmapproductList= mapproductList?structuredClone(mapproductList):[]
    let filteredcmapproductList=cmapproductList.filter(x=>x.isDelete!==true)
    let checksimobj = structuredClone(simobj);
    let fieldslist = [];
    //actual fields counts filter zeros
    let actualFilteredFieldCount = (actualFieldsCounts?actualFieldsCounts.filter(x => x.fieldCount > 0):[]);

    // console.log(mapfields);
    let allFields = structuredClone(mapfields);
    
    if(isFieldPrint){
        for (const fieldkey in actualFilteredFieldCount) {
            const fieldobj = actualFilteredFieldCount[fieldkey];
    
            /* let existingFieldObj = null;
            for (const checkfieldkey in allFields){
                const checkfieldobj = allFields[checkfieldkey];

                if(checkfieldobj.mpFieldId === fieldobj.mpField.id){
                    existingFieldObj = checkfieldobj;
                }
            } */

            // if(existingFieldObj){
                let mergedFieldObj = fieldobj; //{...existingFieldObj, ...fieldobj }
                mergedFieldObj["products"] = [];
                mergedFieldObj["lastorder"] = fieldobj.order;
                mergedFieldObj["totalDrawWidth"] = fieldobj.drawWidth;
                mergedFieldObj["oriFieldDrawWidth"] = (measureConverter(fieldobj.mpField.field_uom, displayUOM, fieldobj.mpField.field_width) * displayRatio);
                mergedFieldObj["fieldName"] = fieldobj.mpField.fieldName;
                mergedFieldObj["shelf"] = fieldobj.mpField.field_shelves;

                fieldslist.push(mergedFieldObj);
            
                //calc fields count
                //remove duplicates
                /* let availSeperators = fieldobj.separators.filter((v, i, a) => a.findIndex(v2 => (v2.x === v.x)) === i);
                let availContinueSeperators = availSeperators.filter(x => !x.isCategoryEnd && x.x > 0);
                let availEndSeperators = availSeperators.filter(x => x.isCategoryEnd);
                // console.log(availContinueSeperators.length, availEndSeperators.length); //!v.isCategoryEnd && v.x > 0 && 
    
                if(availContinueSeperators.length > 0){
                    // let availableKeys = Object.keys(mapfields).length;
                    let addingCount = (availContinueSeperators.length - availEndSeperators.length);
    
                    fieldslist[isfieldadded].fieldsCount = (fieldslist[isfieldadded].fieldsCount + addingCount);
                } else{
                    fieldslist[isfieldadded].fieldsCount = (fieldslist[isfieldadded].fieldsCount -  availEndSeperators.length);
                    // fieldslist[isfieldadded].fieldsCount = (fieldslist[isfieldadded].fieldsCount +  availEndSeperators.length);
                } */
                
            // }
        }
        // console.log(structuredClone(fieldslist));

        let newFieldsList = [];
        let prevX = 0;
        let orderNo = 1;
        for (let j = 0; j < fieldslist.length; j++) {
            const fieldobj = fieldslist[j];
            let singleFieldWidth = roundOffDecimal(fieldobj.oriFieldDrawWidth,2);

            for (let l = 0; l < fieldobj.fieldCount; l++) {
                let newFieldObj = structuredClone(fieldslist[j]);
                
                newFieldObj.startX = prevX;
                newFieldObj.endX = roundOffDecimal((prevX + singleFieldWidth), 2);
                
                prevX = (prevX + singleFieldWidth);

                newFieldObj.drawWidth = singleFieldWidth;
                newFieldObj.totalDrawWidth = singleFieldWidth;

                newFieldObj.order = orderNo;
                orderNo++;

                newFieldsList.push(newFieldObj);
            }
        }

        // console.log(structuredClone(newFieldsList));
        fieldslist = newFieldsList;

    } else{
        let categoryNo = 1;
        let lastCategory = null;

        for (const fieldkey in allFields) {
            const fieldobj = allFields[fieldkey];
    
            let isfieldadded = fieldslist.findIndex(checkfieldobj => (checkfieldobj.field_custom_id === fieldobj.field_custom_id && checkfieldobj.lastorder === (fieldobj.order - 1))); //checkfieldobj.fieldId === fieldobj.fieldId
            let categoryList = (checksimobj && checksimobj.categoryList && checksimobj.categoryList.length > 0?checksimobj.categoryList.filter(x => x.field_custom_id === fieldobj.field_custom_id):[]);
            let categoryobj = (categoryList.length > 1?i18n.t("multiplerows"):categoryList.length > 0?getNameorIdorColorofBox(categoryList[0],"name"):null);
            
            if(isfieldadded === -1){
                categoryNo = (categoryobj && lastCategory && categoryobj === lastCategory?(categoryNo + 1):1);
                lastCategory = categoryobj;

                fieldobj["customids"] = [fieldobj.field_custom_id];
                fieldobj["products"] = [];
                fieldobj["lastorder"] = fieldobj.order;
                fieldobj["totalDrawWidth"] = fieldobj.drawWidth;
                fieldobj["category"] = categoryobj;
                fieldobj["categoryNo"] = categoryNo;

                fieldslist.push(fieldobj);
            } else{
                fieldslist[isfieldadded].lastorder = fieldobj.order;
                fieldslist[isfieldadded].totalDrawWidth = (fieldslist[isfieldadded].totalDrawWidth + fieldobj.drawWidth);
                fieldslist[isfieldadded].customids.push(fieldobj.field_custom_id);
            }
        }
        // console.log(structuredClone(fieldslist));
    }

    // for (let i = 0; i < cmapproductList.length; i++) {
    //     const simprod = cmapproductList[i];
    for (let i = 0; i < filteredcmapproductList.length; i++) {
        const simprod = filteredcmapproductList[i];

        //find brand supplier from brands list
        /* if(simprod.brand && simprod.brand.brand && simprod.brand.brand.brandId > 0){
            let findbrandfromlist = checksimobj.brandList.findIndex(brnditem => brnditem.brand.brand.brandId === simprod.brand.brand.brandId);
            if(findbrandfromlist > -1){
                let foundbranditem = checksimobj.brandList[findbrandfromlist];
                let brandmdobj = foundbranditem.brand.brand;
                if(brandmdobj.supplierId > 0){
                    simprod.brand.brand["supplierId"] = brandmdobj.supplierId;
                    simprod.brand.brand["supplierName"] = brandmdobj.supplierName;
                }
            }
        } */
        //find field index
        let prodObjX = roundOffDecimal(simprod.x,2);
        let getfieldidx = fieldslist.findIndex(fieldobj => 
            (isFieldPrint && (fieldobj.startX - saftyMargin) <= prodObjX && (fieldobj.endX - saftyMargin) > prodObjX) || 
            (!isFieldPrint && fieldobj.customids.includes(simprod.field_custom_id))
        ); // - (fieldobj.startX === 0?saftyMargin:0)
        
        if(getfieldidx > -1){
            //add object to field
            let prodsupname = (simprod.productBrand && simprod.productBrand.supplier?simprod.productBrand.supplier.supplierName:"-").toString();
            simprod["distributor"] = prodsupname;

            fieldslist[getfieldidx].products.push(simprod);
        }
    }
    //loop field list sort prod list and update
    for (let l = 0; l < fieldslist.length; l++) {
        const newfieldobj = fieldslist[l];
        //group prod list by shelf rank
        newfieldobj["shelfprods"] = groupShelfByKey(newfieldobj.products, "shelfrank");
        //loop shelft list to sort prod list
        for (var key of Object.keys(newfieldobj.shelfprods)) {
            let shelfprod = JSON.parse(JSON.stringify(newfieldobj.shelfprods[key]));
            //sort prod list to lowest x
            shelfprod = shelfprod.sort((a, b) => a.x - b.x);
            //loop prod list to create new prod list with closest same prod group
            let newprodlist = [];
            for (let k = 0; k < shelfprod.length; k++) {
                const prodobj = shelfprod[k];
                //get last added prod
                let prevprod = newprodlist[(newprodlist.length - 1)];
                let findprodadded = (prevprod && prevprod.productId === prodobj.productId?(newprodlist.length - 1):-2);
                
                if(findprodadded > -1){
                    newprodlist[findprodadded].qty = (newprodlist[findprodadded].qty + 1);
                } else{ 
                    prodobj["qty"] = 1;
                    newprodlist.push(prodobj);
                }
            }
            
            newfieldobj.shelfprods[key] = newprodlist;
        }
    }

    return fieldslist;
}

function groupShelfByKey(array, key) {
    return array.reduce((hash, obj) => {
        if(obj[key] === undefined) return hash; 
        return Object.assign(hash, { [obj[key]]:( hash[obj[key]] || [] ).concat(obj)})
      }, {})
 }
export function checkCategoryCompleted(checktype, defSaveObj, checkCatObj) {
    // console.log(defSaveObj, checkCatObj);

    if(checktype === "cat"){
        let iscatfound = false;
        let catparentidx = -1; let catrectidx = -1;
        for (let i = 0; i < defSaveObj.categories.length; i++) {
            const catobj = defSaveObj.categories[i];
            
            if(!iscatfound && !catobj.isDelete){
                let isrectidx = (catobj && catobj.rects?catobj.rects.findIndex(rectobj => ((!checkCatObj.isRule && rectobj.type === catRectEnums.default && checkCatObj.categoryId === getNameorIdorColorofBox(rectobj, "num")) ||
                (checkCatObj.isRule && rectobj.type === catRectEnums.rule && checkCatObj.categoryId === getNameorIdorColorofBox(rectobj, "num")))):-1);

                if(isrectidx > -1){
                    iscatfound = true;
                    catparentidx = i;
                    catrectidx = isrectidx;
                }
            }
        }

        if(iscatfound){
            let foundrectobj = defSaveObj.categories[catparentidx].rects[catrectidx];
            
            let completedscatcount = [];
            let compnonperscats = [];
            let suggestMoreSubCats = checkCatObj.subcategories.filter(filterscatobj => filterscatobj.percentageSuggestion > 0);

            if(checkCatObj.subcategories.length > 0){
                for (let p = 0; p < checkCatObj.subcategories.length; p++) {
                    const checkSubCat = checkCatObj.subcategories[p];
                    
                    // if(checkSubCat.percentageSuggestion > 0){
                        let isscatidx = (foundrectobj && foundrectobj.sub_categories?foundrectobj.sub_categories.findIndex(scatobj => (!scatobj.isDelete && ((!checkSubCat.isRule && scatobj.type === catRectEnums.default && checkSubCat.subcategoryId === getNameorIdorColorofBox(scatobj, "num")) ||
                        (checkSubCat.isRule && scatobj.type === catRectEnums.rule && checkSubCat.subcategoryId === getNameorIdorColorofBox(scatobj, "num"))))):-1);

                        if(isscatidx > -1){
                            let foundscatobj = foundrectobj.sub_categories[isscatidx];

                            let completedbrandcount = [];
                            let completednonpercount = [];
                            let suggestMoreBrands = checkSubCat.brands.filter(filterbrandobj => filterbrandobj.suggestedPercentage > 0);

                            if(checkSubCat.brands && checkSubCat.brands.length > 0){
                                for (let j = 0; j < checkSubCat.brands.length; j++) {
                                    const checkBrandObj = checkSubCat.brands[j];

                                    let isbrandfound = false;
                                    for (let k = 0; k < foundscatobj.rects.length; k++) {
                                        const scatrect = foundscatobj.rects[k];
                                        
                                        if(!isbrandfound){
                                            let isbrandidx = (scatrect && scatrect.brands?scatrect.brands.findIndex(brandobj => (!brandobj.isDelete && (checkBrandObj.id === getNameorIdorColorofBox(brandobj, "num") && brandobj.rects.length > 0))):-1);
                                            
                                            if(isbrandidx > -1){
                                                isbrandfound = true;

                                                if(checkBrandObj.suggestedPercentage > 0){
                                                    completedbrandcount.push(checkBrandObj);
                                                } else{
                                                    completednonpercount.push(checkBrandObj);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            
                            // console.log(checkSubCat, completedbrandcount.length, suggestMoreBrands.length, completednonpercount.length, checkSubCat.brands.length);
                            if(((completedbrandcount.length > 0 && completedbrandcount.length === suggestMoreBrands.length) || 
                            (suggestMoreBrands.length === 0 && completednonpercount.length > 0 && completednonpercount.length === checkSubCat.brands.length))){ //
                                
                                if(checkSubCat.percentageSuggestion > 0){
                                    completedscatcount.push(checkSubCat);
                                } else{
                                    compnonperscats.push(checkSubCat);
                                }

                                checkSubCat.isPathCompleted = true;
                            }
                        }
                    // }
                }
            }
            
            // console.log(completedscatcount.length, suggestMoreSubCats.length, compnonperscats.length, checkCatObj.subcategories.length);
            if(((completedscatcount.length > 0 && completedscatcount.length === suggestMoreSubCats.length) || 
                (suggestMoreSubCats.length === 0 && compnonperscats.length > 0 && compnonperscats.length === checkCatObj.subcategories.length))){
                checkCatObj.isPathCompleted = true;
            }
        }
    } else{
        let isscatidx = (defSaveObj && defSaveObj.sub_categories?defSaveObj.sub_categories.findIndex(scatobj => (!scatobj.isDelete && ((!checkCatObj.isRule && scatobj.type === catRectEnums.default && checkCatObj.subcategoryId === getNameorIdorColorofBox(scatobj, "num")) ||
        (checkCatObj.isRule && scatobj.type === catRectEnums.rule && checkCatObj.subcategoryId === getNameorIdorColorofBox(scatobj, "num"))))):-1);
        
        if(isscatidx > -1){
            let foundscatobj = defSaveObj.sub_categories[isscatidx];

            let completedbrandcount = []; 
            let completednonpercount = [];
            let suggestMoreBrands = checkCatObj.brands.filter(filterbrandobj => (filterbrandobj.percentageSuggestion > 0));
            
            if(checkCatObj.brands && checkCatObj.brands.length > 0){
                for (let j = 0; j < checkCatObj.brands.length; j++) {
                    const checkBrandObj = checkCatObj.brands[j];

                    let isbrandfound = false;
                    for (let k = 0; k < foundscatobj.rects.length; k++) {
                        const scatrect = foundscatobj.rects[k];
                        
                        if(!isbrandfound){
                            let isbrandidx = (scatrect && scatrect.brands?scatrect.brands.findIndex(brandobj => (!brandobj.isDelete && (checkBrandObj.brandId === getNameorIdorColorofBox(brandobj, "num") && brandobj.rects.length > 0))):-1);
                            
                            if(isbrandidx > -1){
                                isbrandfound = true;
                                if(checkBrandObj.percentageSuggestion > 0){
                                    completedbrandcount.push(checkBrandObj);
                                } else{
                                    completednonpercount.push(checkBrandObj);
                                }
                            }
                        }
                    }
                }
            }

            // console.log(completedbrandcount.length, suggestMoreBrands.length, completednonpercount.length, checkCatObj.brands.length);
            if(((completedbrandcount.length > 0 && completedbrandcount.length === suggestMoreBrands.length) || 
                (suggestMoreBrands.length === 0 && completednonpercount.length > 0 && completednonpercount.length === checkCatObj.brands.length))){ //
                    
                checkCatObj.isPathCompleted = true;
            }
        }
    }
    
    return checkCatObj;
} 
