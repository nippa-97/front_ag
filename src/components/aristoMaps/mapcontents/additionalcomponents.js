import { useState } from "react";
import { Marker, OverlayView, OverlayViewF } from "@react-google-maps/api";

// import locationIcon from '../../../assets/img/icons/location-pin.png';
import { Badge, Col, Row } from "react-bootstrap";

import locationGreenIcon from '../../../assets/img/icons/location-circle-green.png';
import locationRedIcon from '../../../assets/img/icons/location-circle-red.png';
import locationGreyIcon from '../../../assets/img/icons/location-circle-grey.png';

import locationGreenSmallIcon from '../../../assets/img/icons/mapicons/location-circle-green-small.png';
import locationRedSmallIcon from '../../../assets/img/icons/mapicons/location-circle-red-small.png';
import locationGreySmallIcon from '../../../assets/img/icons/mapicons/location-circle-grey-small.png';
import { mapViewTypes } from "../../../enums/aristoMapDataEnums";
import { numberWithCommas, roundOffDecimal } from "../../../_services/common.service";

function getPixelPositionOffset(width, height) {
    return { x: -(width / 2), y: -(height / 2) };
}

export function CustomLocationMarker(props) {
    const [visible, setVisible] = useState(false);
    
    const handleClickMarker = (evt, locobj) => {
        // console.log(locobj);
        props.handleMarkerClick(locobj);
    }

    let loctabobj = props.loc[props.tabViewType];

    const markerIconFind = () => {
        let salescount = 0;
        let locicon = customClusterIcon("grey", true);
        
        if(loctabobj){
            if(props.loc && props.loc.isRedStore === true){
                locicon = customClusterIcon("red", true);
            } else{
                if(props.tabViewType === mapViewTypes.versionAnalysis || props.tabViewType === mapViewTypes.productLifeCycle){
                    salescount = (loctabobj.spfpd > 0?parseFloat(loctabobj.spfpd):0);
                    
                } else if(props.tabViewType === mapViewTypes.openSearch || props.tabViewType === mapViewTypes.newProduct){
                    salescount = (loctabobj.sales > 0?parseFloat(loctabobj.sales):0);

                }

                if(props.tabViewType !== mapViewTypes.newProduct || (props.tabViewType === mapViewTypes.newProduct && loctabobj.isHasNewProducts)){
                    locicon = (salescount > 0?customClusterIcon("green", true):customClusterIcon("red", true));
                }    
            }
        }
        
        return locicon;
    }

    // let trendDisSelectedCard = props.trendDisSelectedCard;
    
    return <OverlayViewF
        position={props.loc}
        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        getPixelPositionOffset={getPixelPositionOffset}>
        <div className={`map-tooltipcard card ${visible? 'd-block' : 'd-none'} ${props.tabViewType === mapViewTypes.openSearch? 'morewidth':''}`}>
            <div className="card-body">
                {loctabobj?<>
                    {props.tabViewType === mapViewTypes.versionAnalysis?<>
                        <h6>{props.loc.name}</h6><hr></hr>
                        <ul className="tooltip-list pos">
                            <li><Badge bg={loctabobj.spfpd > 0?"success":"danger"}>{(loctabobj.spfpd?roundOffDecimal(loctabobj.spfpd,2):0)}</Badge><span className='greytxt'>{props.t("per_day")}</span></li>
                            {loctabobj.spmpd !== undefined?<li><Badge bg={loctabobj.spmpd > 0?"success":"danger"}>{(loctabobj.spmpd?numberWithCommas(roundOffDecimal(loctabobj.spmpd, 2)):0)}</Badge><span className='greytxt'>{props.t("SALES_PER_METER")}</span></li>:<></>}
                        </ul>
                    </>:
                    props.tabViewType === mapViewTypes.productLifeCycle?<>
                        <h6>{props.loc.name}</h6><hr></hr>
                        <ul className="tooltip-list pos">
                            <li><Badge bg={loctabobj.spfpd > 0?"success":"danger"}>{(loctabobj.spfpd?numberWithCommas(roundOffDecimal(loctabobj.spfpd, 2)):0)}</Badge><span className='greytxt'>{props.t("per_day")}</span></li>
                        </ul>
                    </>:
                    props.tabViewType === mapViewTypes.openSearch?<>
                        <h6>{props.loc.name}</h6><hr></hr>
                        <Col xs={12} style={{position:"relative", minWidth: "320px"}}>
                            <Row className="tooltip-list">
                                <Col style={{position:"relative"}}><Badge bg={!props.loc.isRedStore && loctabobj.sales > 0?"success":"danger"} style={{position:"relative"}}>{(loctabobj.sales?numberWithCommas(roundOffDecimal(loctabobj.sales,2)):0)}</Badge> <span className='greytxt'>{props.t("MAP_OPENSEARCH.SALES")}</span></Col>
                                <Col style={{position:"relative"}}><Badge bg={!props.loc.isRedStore && loctabobj.profit > 0?"success":"danger"} style={{position:"relative"}}>{(loctabobj.profit?numberWithCommas(roundOffDecimal(loctabobj.profit, 2)):0)}</Badge> <span className='greytxt'>{props.t("profit")}</span></Col>
                            </Row>
                            <Row className="tooltip-list">
                                <Col style={{position:"relative"}}><Badge bg={!props.loc.isRedStore && loctabobj.share > 0?"success":"danger"} style={{position:"relative"}}>{(loctabobj.share?loctabobj.share:0)}</Badge> <span className='greytxt'>{props.t("SHARE")}</span></Col>
                                <Col style={{position:"relative"}}><Badge bg={!props.loc.isRedStore && loctabobj.qty > 0?"success":"danger"} style={{position:"relative"}}>{loctabobj.qty?loctabobj.qty:0}</Badge> <span className='greytxt'>{props.t("QUANTITY")}</span></Col>
                            </Row>    
                        </Col>
                        {/* <ul className="tooltip-list">
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                        </ul> */}
                    </>:
                    props.tabViewType === mapViewTypes.newProduct?<>
                        <h6>{props.loc.name}</h6><hr></hr>
                        <ul className="tooltip-list">
                            <li><Badge bg={loctabobj.sales > 0?"success":"danger"}>{(loctabobj.sales?numberWithCommas(roundOffDecimal(loctabobj.sales,2)):0)}</Badge>{props.t("MAP_OPENSEARCH.SALES")}</li>
                        </ul>
                    </>:
                    props.tabViewType === mapViewTypes.trendsDiscover?<>
                        <h6>{props.loc.name}</h6><hr></hr>
                        {loctabobj?<ul className="tooltip-list">
                            <li><Badge bg={loctabobj.trendType === "Good"?"success":"danger"}>{(loctabobj.trendType === "Good"?"+":"-")+" "+loctabobj.trend}%</Badge> {loctabobj.name}</li>
                            <li><Badge bg={loctabobj.trendType === "Good"?"danger":"success"}>{(loctabobj.trendType === "Good"?"-":"+")+" "+(loctabobj.rest && loctabobj.rest.trend?loctabobj.rest.trend:0)}%</Badge> Rest</li>
                        </ul>:<></>}
                    </>:<></>}


                </>:<></>}
                
                {/* <ul className="tooltip-list">
                    <li>Tomato Cans <Badge bg="danger">-10%</Badge></li>
                    <li>Veg Cans <Badge bg="success">+3%</Badge></li>
                </ul> */}
            </div>
            {/* <div className="card-body d-flex p-1">
                <button className="btn btn-sm btn-secondary w-50 p-0" onClick={() => setVisible(false)}>
                    Close
                </button>
                <div style={{width: 4}}/>
                <button className={`btn btn-sm btn-primary text-light w-50 p-0`}>
                    Test
                </button>
            </div> */}
        </div>
        {/* <button className={`btn btn-none`} onClick={() => setVisible(true)}>
            <img src={locationIcon} alt="Custom location pin" />
        </button> */}
        <Marker 
            title={props.loc.uuid}
            position={props.loc} 
            clusterer={props.clusterer} 
            icon={markerIconFind()} 
            
            onMouseOver={() => setVisible(true)} 
            onMouseOut={() => setVisible(false)} 
            onClick={e => handleClickMarker(e, props.loc)}
            />
    </OverlayViewF>
}

export function customClusterIcon(color, issmall){
    let locicon = (color === "green"?locationGreenIcon:color === "red"?locationRedIcon:locationGreyIcon);

    if(issmall){
        locicon = (color === "green"?locationGreenSmallIcon:color === "red"?locationRedSmallIcon:locationGreySmallIcon);
    }

    return locicon;
}