import React from "react";
import { SortableHandle } from "react-sortable-hoc";
import { TrashIcon, UnfoldIcon } from '@primer/octicons-react';
import styled from "styled-components";

import { QUEST_STATUS } from '../../../enums/taskfeedEnums';
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const TrWrapper = styled.tr`
  cursor: default;

  .firstElement {
    display: flex;
    flex-direction: row;
  }

  &.helperContainerClass {
    width: auto;
    border: 1px solid #efefef;
    box-shadow: 0 5px 5px -5px rgba(0, 0, 0, 0.2);
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 10px;

    &:active {
      cursor: grabbing;
    }

    & > td {
      padding: 5px;
      text-align: left;
      font-size: 12px; padding: 20px 10px; font-weight: 800; color: #5128a0;
    }
  }
`;

const Handle = styled.div`
  margin-right: 10px;
  padding: 0 5px;
  cursor: grab;
`;

const RowHandler = SortableHandle(() => <Handle className="handle"><UnfoldIcon size={14}/></Handle>);

const TableRow = (props) => {
  //console.log(props.obj);
  //check none avaiable in complete action or lists empty
  var isshownone = (props.obj.feedbackTypeId === 8?(props.obj.optionList.length === 0?true:false):props.obj.feedbackTypeId === 3?((props.obj.checkList.length === 0 || props.obj.completeActionType === "None")?true:false)
  :props.obj.feedbackTypeId === 4?((props.obj.radioOptionList.length === 0 || props.obj.completeActionType === "None")?true:false):props.obj.completeActionType === "None"?true:false);
  
  //branch details list
  const optionlist = ((props.obj.feedbackTypeId === 8 && props.obj.optionList.length > 0)?props.obj.optionList.map((xitem, xidx) => {
    isshownone = (xitem.actionType === "None"?true:isshownone);
    return <React.Fragment key={xidx}>{xitem.optionName+"->"+(xitem.actionType === "GoTo"?(" "+props.t("GOTO")+" "+xitem.actionQuestionNo):props.t(xitem.actionType.toUpperCase()))+((xidx + 1) !== props.obj.optionList.length?", ":"")}</React.Fragment>;
  }):props.obj.completeActionType === "GoTo"?("Go To: "+props.obj.actionQuestionNo):props.t(props.obj.completeActionType.toUpperCase()));
  
  return (
    <TrWrapper dir={props.isRTL} className={(props.selectedQuestion&&props.selectedQuestion.questionId === props.obj.questionId?"active":"")
    +(isshownone?" none-row":"")}>
        <td width="5%" onClick={() => props.handleRowClick(props.obj, props.rownumber)} className="text-center">{props.obj.questionNo}</td>
        <td width="28%" onClick={() => props.handleRowClick(props.obj, props.rownumber)} className="title-txt"><OverlayTrigger placement="bottom-start" overlay={<Tooltip>{props.obj.question}</Tooltip>}><span className="question-name">{props.obj.question}</span></OverlayTrigger></td>
        <td width="19%" onClick={() => props.handleRowClick(props.obj, props.rownumber)} className="capital-txt">{props.obj.feedbackTypeId===1?props.t('COMMENT'):props.obj.feedbackTypeId===2?props.t('NUMBER'):props.obj.feedbackTypeId===3?props.t('CHECK_LIST')
        :props.obj.feedbackTypeId===4?props.t('SELECT_FROM_A_LIST'):props.obj.feedbackTypeId===8?props.t('branch'):"-"}</td>
        <td width="15%" onClick={() => props.handleRowClick(props.obj, props.rownumber)}>{props.obj.mediaList&&props.obj.mediaList.length>0?props.obj.mediaList.map((xitem,xidx) => {
          return <React.Fragment key={xidx}>{(xitem.mediaName?props.t(xitem.mediaName==="photo"?props.t('PICTURE'):xitem.mediaName==="video"?props.t('VIDEO'):xitem.mediaName.toUpperCase()):"-")+((xidx+1) === props.obj.mediaList.length?"":", ")}</React.Fragment>
        }):props.t("NONE")}</td>

        <td width="25%" onClick={() => props.handleRowClick(props.obj, props.rownumber)}>{optionlist}</td>
        
        {props.questStatus && props.questStatus !== QUEST_STATUS.Replaced && !props.isHaveTasks?<td width="4%" className={"text-center "+(props.isQuestionOpened?"disable-td":"")} onClick={() => props.handleDeleteQuestion(props.obj, props.rownumber)}><span><TrashIcon size={14}/></span></td>:<td width="4%" className="text-center"></td>}
        <td width="4%" className={"text-center "+(props.isQuestionOpened || props.isDisableBtns?"disable-td":"")}><span>{props.questStatus && props.questStatus !== QUEST_STATUS.Replaced && !props.isHaveTasks?<RowHandler />:<></>}</span></td>
    </TrWrapper>
  );
};

export default TableRow;
