import React, { useState, useCallback, useEffect } from "react";
import { Col, Table } from 'react-bootstrap';
import { SortableContainer, SortableElement } from "react-sortable-hoc";

import { alertService } from '../../../_services/alert.service';

import TableRow from './draggableRow';
import arrayMove from "./arrayMove";

const SortableCont = SortableContainer(({ children }) => {
    return <tbody>{children}</tbody>;
});
  
const SortableItem = SortableElement(props => <TableRow {...props} />);

const QuestionTable = (props) => {
  const [items, setItems] = useState([]);
  const [isHaveTasks, setIshaveTasks] = useState(false);

  useEffect(() => {
    if(props.saveObj){ //gets current field details
      setItems(JSON.parse(JSON.stringify(props.saveObj.questionList?props.saveObj.questionList:[])));
      setIshaveTasks(props.saveObj.haveTasks?true:false);
    }
  }, [props.saveObj]);

  const onSortEnd = useCallback(({ oldIndex, newIndex }) => {
    //only if indexes are not matching
    if(oldIndex !== newIndex){
      var isbranchquestion = false;
      var oldItems = arrayMove(items, oldIndex, newIndex);
      var ispositionchanged = (oldIndex !== newIndex?true:false);
      //remove top/bottom added question ids
      for (let i = 0; i < oldItems.length; i++) {
        //update branch list goto links items
        if(i === newIndex){
          oldItems[i]["isMoved"] = true;
          if(oldItems[i].feedbackTypeId === 8){
            for (let j = 0; j < oldItems[i].optionList.length; j++) {
              const optionitem = oldItems[i].optionList[j];
              if(optionitem.actionType === "GoTo"){
                var findselecteidx = oldItems.findIndex(x => x.questionId === optionitem.actionQuestionId);
                /* //find question and get new question number
                if(findselecteidx > -1){
                  if(optionitem.questionNo < oldItems[findselecteidx].questionNo){
                    optionitem.actionQuestionNo = oldItems[findselecteidx].questionNo;
                  } else {
                    optionitem["actionType"] = "None";
                    optionitem["actionQuestionId"] = 0;
                    optionitem["actionQuestionName"] = "";
                    optionitem["actionQuestionNo"] = 0;
                  }
                } */
                //find goto action question index not less than newindex
                if(findselecteidx > -1 && findselecteidx < newIndex){
                  isbranchquestion = true;
                  optionitem["actionType"] = "None";
                  optionitem["actionQuestionId"] = 0;
                  optionitem["actionQuestionName"] = "";
                  optionitem["actionQuestionNo"] = 0;
                }
              }
            }
          } else if(oldItems[i].completeActionType === "GoTo"){
            var otherfindselecteidx = oldItems.findIndex(x => x.questionId === oldItems[i].actionQuestionId);
            //oldItems[i]["completeActionType"] = "None";
            if(otherfindselecteidx > -1 && otherfindselecteidx < newIndex){
              oldItems[i]["completeActionType"] = "None";
              oldItems[i]["actionQuestionId"] = 0;
              oldItems[i]["actionQuestionName"] = "";
              oldItems[i]["actionQuestionNo"] = 0;
            }
          }

        } else if(oldItems[i].feedbackTypeId === 8 || oldItems[i].completeActionType === "GoTo"){
          //if changing question available in other branch list
          if(i > newIndex){
            var cchangeobj = oldItems[newIndex];

            if(oldItems[i].completeActionType === "GoTo"){
              if(oldItems[i].actionQuestionId === cchangeobj.questionId){
                oldItems[i]["completeActionType"] = "None";
                oldItems[i]["actionQuestionId"] = 0;
                oldItems[i]["actionQuestionName"] = "";
                oldItems[i]["actionQuestionNo"] = 0;
              }
            } else{
              for (let l = 0; l < oldItems[i].optionList.length; l++) {
                const optitem = oldItems[i].optionList[l];
                if(optitem.actionQuestionId === cchangeobj.questionId){
                  isbranchquestion = true;
                  optitem["actionType"] = "None";
                  optitem["actionQuestionId"] = 0;
                  optitem["actionQuestionName"] = "";
                  optitem["actionQuestionNo"] = 0;
                }
              }  
            }
          }
        } 
      }

      if(isbranchquestion){
        alertService.warn(props.t("questlinkswillbereplaced"),3500);
      }

      setItems(oldItems);
      props.handleChangePostions(oldItems,ispositionchanged);
    }
  }, [items, props]);

  return (<Col id="editviewquesttable" className="table-container editviewquest-table">
    <Table hover>
        <thead>
            <tr><th width="5%" className="text-center">{props.t("fieldid")}</th><th width="28%">{props.t("STAGEQUESTION")}</th><th width="19%">{props.t("FEEDBACK_TYPE")}</th><th width="15%">{props.t("REQUIRED_MEDIA")}</th><th width="25%">{props.t("ACTIONON_COMPLETE")}</th><th width="4%"></th><th width="4%"></th></tr>
        </thead>  
        <SortableCont onSortEnd={onSortEnd} axis="y" lockAxis="y" lockToContainerEdges={true} lockOffset={["30%", "50%"]} helperClass="helperContainerClass" useDragHandle={true} >
            {items.map((value, index) => {
                return <React.Fragment key={index}>{!value.isDelete && !value.isnotshow?<>
                <SortableItem key={`item-${index}`} index={index} isHaveTasks={isHaveTasks} isDisableBtns={props.isDisableBtns} isRTL={props.isRTL} t={props.t} isQuestionOpened={props.isQuestionOpened} questStatus={props.questStatus} selectedQuestion={props.selectedQuestion} obj={value} rownumber={index} handleRowClick={props.handleRowClick} handleDeleteQuestion={props.handleDeleteQuestion} />
                <tr className="bottom-row"><td colSpan="7"></td></tr>
                </>:<></>}</React.Fragment>
            })}
        </SortableCont>
    </Table>
  </Col>);
};

export default QuestionTable;
