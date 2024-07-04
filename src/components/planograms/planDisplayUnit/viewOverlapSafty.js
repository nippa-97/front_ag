import React, {useState, useEffect} from "react";
import { Button, Col, Form, Modal } from "react-bootstrap";

import {measureConverter } from '../../../_services/common.service';
import { alertService } from "../../../_services/alert.service";

/**
 * validates overlapping field with right field to check inside shelves allowed to overlapping shelves
 *
 * @param {*} currentField
 * @return {*} 
 */
function compareSideToAllowDrop (currentField, fieldsList) {
  //current field 
  let lastY = 0;
  let previousHeight = 0;
  //sort by reverse row number to validate from bottom to top
  currentField.planogramShelfDto.sort((a, b) => a.reverseRowNumber - b.reverseRowNumber).forEach(planogramShelfDto => {
    let shelfBottomY = 0;

    if (planogramShelfDto.reverseRowNumber === 1) {
        shelfBottomY = planogramShelfDto.gap;
        previousHeight = planogramShelfDto.height;
    } else {
        shelfBottomY = planogramShelfDto.gap + previousHeight + lastY;
        previousHeight = planogramShelfDto.height;
    }

    lastY = shelfBottomY;

    planogramShelfDto.bottomY = shelfBottomY;

  });

  //right side field 
  let lastRightY = 0;;
  let previousleftHeight = 0;
  //this also sort by reverse row number
  if (currentField.rightSidePlanogramFieldDto) {
      currentField.rightSidePlanogramFieldDto.planogramShelfDto.sort((a, b) => a.reverseRowNumber - b.reverseRowNumber).forEach(planogramShelfDto => {
        let shelfBottomY = 0;

        if (planogramShelfDto.reverseRowNumber === 1) {
            shelfBottomY = planogramShelfDto.gap;
            previousleftHeight = planogramShelfDto.height;
        } else {
            shelfBottomY = planogramShelfDto.gap + previousleftHeight + lastRightY;
            previousleftHeight = planogramShelfDto.height;
        }
        //reset overlapping details
        planogramShelfDto.overlappingAllow = false;
        planogramShelfDto.sourceShelfId = -1;

        lastRightY = shelfBottomY;

        planogramShelfDto.bottomY = shelfBottomY;

      });
  }

  var matchedLeftShelfs = []

  //left source id set
  /* let rightFieldShelfSourceList = [];
  if(currentField.leftSidePlanogramFieldDto){
    let checkLeftField = currentField.leftSidePlanogramFieldDto;
    let leftfield = fieldsList.find(x => x.id === checkLeftField.id);
    
    if(leftfield){
      rightFieldShelfSourceList = (leftfield.rightSidePlanogramFieldDto?leftfield.rightSidePlanogramFieldDto.planogramShelfDto:[]);
    }
  } */

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

              let fieldSafetyMargin = (currentField.fieldSafetyMargin > -1?currentField.fieldSafetyMargin:0);
              // console.log(fieldSafetyMargin);
              let safetyMargin = measureConverter(rightPlanogramShelf.uom, currentPlanogramShelf.uom, fieldSafetyMargin)
              
              if (currentPlanogramShelf.bottomY <= (convertedBottomLeftY + safetyMargin)
                      && (convertedBottomLeftY - safetyMargin) <= currentPlanogramShelf.bottomY
                      && !matchedLeftShelfs.includes(rightPlanogramShelf.id)) {
                  
                  // console.log(currentPlanogramShelf.bottomY, safetyMargin, fieldSafetyMargin, (convertedBottomLeftY + safetyMargin), (convertedBottomLeftY - safetyMargin));

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

      currentField.rightSidePlanogramFieldDto = rightSideField;
      currentField.planogramShelfDto[i] = currentPlanogramShelf;

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
    if(props.overlapFieldObj){ //get current overlapping margin
      const fieldSafetyMargin = (props.overlapFieldObj?props.overlapFieldObj.fieldSafetyMargin:0);
      setSaftyMargin(fieldSafetyMargin);
    }
  }, [props.overlapFieldObj]);

  //onchange safty margin
  const handleChangeSafty = (evt) => {
    if(evt.target.value > -1){
      setSaftyMargin(evt.target.value);

      const csaveobj = props.saveobj;

      for (let i = 0; i < csaveobj.fieldsList.length; i++) {
        let csobj = csaveobj.fieldsList[i];
        if(i === props.overlapFieldIdx){
          let fieldheight = measureConverter(csobj.masterFieldUom, props.displayuom, csobj.masterFieldHeight);
          let saftymargin = (!isNaN(evt.target.value) && evt.target.value !== "" && evt.target.value > -1?parseFloat(evt.target.value):0);
          // console.log(fieldheight, saftymargin);
          
          csobj.fieldSafetyMargin = (saftymargin > fieldheight?csobj.fieldSafetyMargin:saftymargin);

          if(saftymargin > fieldheight){
            alertService.warn(props.trans("CANNOT_CHANGE_OVERSAFTY_MORETHAN_FIELDHEIGHT"));
            setSaftyMargin(csobj.fieldSafetyMargin);
          }
        }
        csobj = compareSideToAllowDrop(csobj, csaveobj.fieldsList);
      }
      
      props.handlechangesafty(csaveobj);
    }
  }

  return (
    <Modal size="sm" className='share-emailmodal' dir={props.isRTL} show={props.isShowOverflowModal} centered onHide={() => props.toggleOverflowModal(false)}>
      <Modal.Header>
          <Modal.Title>{props.trans('overlap_safty')} <small>({props.displayuom})</small></Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Col className="overlapsafty-view">
            <Form.Control type="text" size="sm" value={saftymargin} onChange={e => handleChangeSafty(e)} />
        </Col>
      </Modal.Body>
      <Modal.Footer>
          <Button size="sm" variant="light" onClick={() => props.toggleOverflowModal(false)}>{props.trans('btnnames.close')}</Button>
      </Modal.Footer>
  </Modal>
  );
}

export { compareSideToAllowDrop, OverlapSaftyView};