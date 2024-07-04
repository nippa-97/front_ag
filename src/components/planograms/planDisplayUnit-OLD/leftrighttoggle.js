import React from "react";
import { Col} from "react-bootstrap";
/**
 * shows left and right browsing options if each side dealers available
 * when click side item it sends its side dealer to props.handleChangeLeftRightField function it redirects to that field
 *
 * @export
 * @param {*} props
 * @return {*} 
 */
export default function LeftRightToggle(props) {
  
  return <>
    <Col xs={12} className={"leftright-toggle "+(props.size?props.size:"")+(props.isRTL==="rtl"?" RTL":"")}>
      <ul className="list-inline">
        
        {props.saveobj && props.saveobj.leftSidePlanogramFieldDto && Object.keys(props.saveobj.leftSidePlanogramFieldDto).length>0?<li className="list-inline-item">
          <Col className="lrfield-left" onClick={() => props.handleChangeLeftRightField(props.saveobj.leftSidePlanogramFieldDto)}>
            <div className="overlay">{props.t("OPEN")}</div>{props.t("left_field")}<br/>
            <small>{(props.saveobj.leftSidePlanogramFieldDto.department?
              (props.saveobj.leftSidePlanogramFieldDto.department.name.substring(0,22)+(props.saveobj.leftSidePlanogramFieldDto.department.name.length > 22?"..":"")):
              props.t("no_dept"))+(props.saveobj.leftSidePlanogramFieldDto.noInFloorLayout > 0?(" : "+props.saveobj.leftSidePlanogramFieldDto.noInFloorLayout):"")}</small>
          </Col>
        </li>:<li className="list-inline-item"></li>}
        {props.saveobj && props.saveobj.rightSidePlanogramFieldDto && Object.keys(props.saveobj.rightSidePlanogramFieldDto).length>0?<li className="list-inline-item">
          <Col className="lrfield-right" onClick={() => props.handleChangeLeftRightField(props.saveobj.rightSidePlanogramFieldDto)}>
            <div className="overlay">{props.t("OPEN")}</div>{props.t("right_field")}<br/>
            <small><small>{(props.saveobj.rightSidePlanogramFieldDto.department?
              (props.saveobj.rightSidePlanogramFieldDto.department.name.substring(0,22)+(props.saveobj.rightSidePlanogramFieldDto.department.name.length > 22?"..":"")):
              props.t("no_dept"))+(props.saveobj.rightSidePlanogramFieldDto.noInFloorLayout > 0?(" : "+props.saveobj.rightSidePlanogramFieldDto.noInFloorLayout):"")}</small></small>
          </Col>
        </li>:<li className="list-inline-item"></li>}
      </ul>
    </Col>
  </>;
}
