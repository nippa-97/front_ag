import React, {useState, useEffect} from "react";
import { Col, Form } from "react-bootstrap";

import { measureConverter } from '../../../_services/common.service';

/**
 * validates overlapping field with right field to check inside shelves allowed to overlapping shelves
 *
 * @param {*} currentField
 * @return {*} 
 */
function compareSideToAllowDrop (currentField) {

  //current field 
  var lastY = 0
  var previousHeight = 0
  //sort by reverse row number to validate from bottom to top
  currentField.planogramShelfDto.sort((a, b) => a.reverseRowNumber - b.reverseRowNumber).forEach(planogramShelfDto => {

      var shelfBottomY = 0

      if (planogramShelfDto.reverseRowNumber === 1) {
          shelfBottomY = planogramShelfDto.gap
          previousHeight = planogramShelfDto.height
      } else {
          shelfBottomY = planogramShelfDto.gap + previousHeight + lastY
          previousHeight = planogramShelfDto.height
      }

      lastY = shelfBottomY

      planogramShelfDto.bottomY = shelfBottomY

  });

  //right side field 
  var lastRightY = 0
  var previousleftHeight = 0
  //this also sort by reverse row number
  if (currentField.rightSidePlanogramFieldDto) {
      currentField.rightSidePlanogramFieldDto.planogramShelfDto.sort((a, b) => a.reverseRowNumber - b.reverseRowNumber).forEach(planogramShelfDto => {

          var shelfBottomY = 0

          if (planogramShelfDto.reverseRowNumber === 1) {
              shelfBottomY = planogramShelfDto.gap
              previousleftHeight = planogramShelfDto.height
          } else {
              shelfBottomY = planogramShelfDto.gap + previousleftHeight + lastRightY
              previousleftHeight = planogramShelfDto.height
          }
          //reset overlapping details
          planogramShelfDto.overlappingAllow = false
          planogramShelfDto.sourceShelfId = -1

          lastRightY = shelfBottomY

          planogramShelfDto.bottomY = shelfBottomY

      });
  }

  var matchedLeftShelfs = []

  //check overlapping availability
  for (let i = 0; i < currentField.planogramShelfDto.length; i++) {
      var currentPlanogramShelf = currentField.planogramShelfDto[i];

      currentPlanogramShelf.overlappingAllow = false;

      currentPlanogramShelf.leftPlanogramShelfId = -1
      currentPlanogramShelf.leftPlanogramShelfHeight = 0

      currentPlanogramShelf.rightPlanogramShelfId = -1
      currentPlanogramShelf.rightPlanogramShelfHeight = 0


      //right check
      var rightSideField = currentField.rightSidePlanogramFieldDto
      if (rightSideField) {

          rightSideField.planogramShelfDto = rightSideField.planogramShelfDto.sort((a, b) => a.reverseRowNumber - b.reverseRowNumber)

          for (let j = 0; j < rightSideField.planogramShelfDto.length; j++) {
              var rightPlanogramShelf = rightSideField.planogramShelfDto[j];

              var convertedBottomLeftY = measureConverter(rightPlanogramShelf.uom, currentPlanogramShelf.uom, rightPlanogramShelf.bottomY)
              var convertedShelfHeight = measureConverter(rightPlanogramShelf.uom, currentPlanogramShelf.uom, rightPlanogramShelf.height)

              var safetyMargin = measureConverter(rightPlanogramShelf.uom, currentPlanogramShelf.uom, currentField.fieldSafetyMargin)
              
              if (currentPlanogramShelf.bottomY <= convertedBottomLeftY + safetyMargin
                      && convertedBottomLeftY - safetyMargin <= currentPlanogramShelf.bottomY
                      && !matchedLeftShelfs.includes(rightPlanogramShelf.id)) {

                  currentPlanogramShelf.overlappingAllow = true
                  currentPlanogramShelf.leftPlanogramShelfId = rightPlanogramShelf.id
                  currentPlanogramShelf.leftPlanogramShelfHeight = convertedShelfHeight
                  rightPlanogramShelf.overlappingAllow = true
                  rightPlanogramShelf.sourceShelfId = currentPlanogramShelf.id

                  rightSideField.planogramShelfDto[j] = rightPlanogramShelf

                  //for validation purposes
                  matchedLeftShelfs.push(rightPlanogramShelf.id)

                  break;
              }
          }
      }

      currentField.rightSidePlanogramFieldDto = rightSideField
      currentField.planogramShelfDto[i] = currentPlanogramShelf
  }

  return currentField;

}

/**
 * using this to overlapping safty margin change
 * overlapping safty margin is what space between top or bottom of shelve is allowing right side shelve to be at
 * when check allowing to overlap
 * measure is what overlapping field uom using at it. (ex - cm,in,m)
 *
 * @param {*} props
 * @return {*} 
 */
function OverlapSaftyView(props) {
  const [saftymargin, setSaftyMargin] = useState(0);
  
  useEffect(() => {
    if(props.saveobj){ //get current overlapping margin
      setSaftyMargin(props.saveobj.fieldSafetyMargin?props.saveobj.fieldSafetyMargin:0);
    }
  }, [props.saveobj]);

  //onchange safty margin
  const handleChangeSafty = (evt) => {
    if(evt.target.value > -1){
      setSaftyMargin(evt.target.value);

      const csobj = props.saveobj;
      csobj.fieldSafetyMargin = parseFloat(evt.target.value);
      const returncobj = compareSideToAllowDrop(csobj);

      props.handlechangesafty(returncobj);
    }
  }

  return (<Col className="overlapsafty-view">
        <div className="form-group row">
          <label className="col-sm-7">{props.trans('overlap_safty')}:<br/><small>({props.displayuom})</small></label> 
          <div className="col-sm-5">
            <Form.Control type="text" size="sm" value={saftymargin} onChange={e => handleChangeSafty(e)} /></div>
          </div>
  </Col>);
}

export { compareSideToAllowDrop, OverlapSaftyView};