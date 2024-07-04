import React from 'react';
import { Col, Modal } from 'react-bootstrap';
import moment from 'moment';

import DisplayUnitDraw from './drawcontent';

import arigologo from '../../../../assets/img/logo_o.png';

//product warning modal
export function FullScreenEditView (props) {
    return <>
        <Modal show={props.showFullScreenEditView} animation={false} onHide={() => props.toggleFullScreenView()} className={"fullscreenview-modal "+props.isRTL}>
            <Modal.Body onContextMenu={e => e.preventDefault()}>
                <DisplayUnitDraw 
                    t={props.t} isRTL={props.isRTL} dmode={props.dmode} 
                    activeFieldDeptList={props.activeFieldDeptList}
                    activeViewObj={props.activeViewObj}
                    allSnapshotBrandList={props.allSnapshotBrandList}
                    bkpSaveObj={props.bkpSaveObj}
                    isFullScreenMode={true}
                    isPendingExport={props.isPendingExport}
                    isPrintRLView={props.isPrintRLView}
                    ischangesavailable={props.ischangesavailable}
                    isActiveFirstTimeLoaded={props.isActiveFirstTimeLoaded}
                    fieldDeptList={props.fieldDeptList}
                    filterRevenueList={props.filterRevenueList}
                    filterLevel={props.filterLevel}
                    fullScreenPreviewObj={props.fullScreenPreviewObj}
                    hightlightSnapShotList={props.hightlightSnapShotList}
                    printType={props.printType}
                    proposeHighlightProd={props.proposeHighlightProd}
                    showFullScreenEditView={props.showFullScreenEditView}
                    saveObj={props.saveObj}
                    showWarningSidebar={props.showWarningSidebar}
                    selectedPrintDept={props.selectedPrintDept}
                    selStoreName={props.selStoreName} 
                    shareEmail={props.shareEmail}
                    userDetails={props.userDetails}
                    warningProdList={props.warningProdList}
                    addItemstoWarning={props.addItemstoWarning}
                    copyToClipboard={props.copyToClipboard}
                    checkPrintProdAvailablity={props.checkPrintProdAvailablity}
                    handlePreviewModal={props.handlePreviewModal}
                    handlePropHighlight={props.handlePropHighlight}
                    handleChangeShareEmail={props.handleChangeShareEmail}
                    notsaveConfirm={props.notsaveConfirm}
                    setPrintDept={props.setPrintDept}
                    toggleWarningSidebar={props.toggleWarningSidebar}
                    toggleFullScreenView={props.toggleFullScreenView}
                    togglePrintFullScreen={props.togglePrintFullScreen}
                    toggleLoadingModal={props.toggleLoadingModal}
                    togglePrintFullScreenView={props.togglePrintFullScreenView}
                    updateActiveConvertDetails={props.updateActiveConvertDetails}
                    updateConvertDetails={props.updateConvertDetails}
                    updateZoomContent={props.updateZoomContent}
                    updateFilterRevenueList={props.updateFilterRevenueList}
                    />
            </Modal.Body>
        </Modal>
    </>;
}

export class FullRenderProdImage extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            prodObj: null,
        };
    }
    
    componentDidMount() {
        setTimeout(() => {
            let prodinfo = structuredClone(this.props.prodInfo);
            this.getBase64FromUrl(prodinfo.imageUrl).then(returnimage => {
                let cprodobj = this.props.prodObj;
                cprodobj["baseUrl"] = returnimage;
    
                this.setState({ prodObj: cprodobj },()=>{
                    this.props.handleLoadedProdCount();
                });
            });
        }, 100);
    }

    getBase64FromUrl = async (url) => {
        const data = await fetch(url);
        const blob = await data.blob();

        return new Promise((resolve) => {
            let newblob = new Blob([blob], {type: 'image/png'});

            const reader = new FileReader();
            reader.readAsDataURL(newblob); 
            reader.onloadend = () => {
                const base64data = reader.result;   
                resolve(base64data);
            }
        });
    }
    
    render() {
        let prodObj = this.state.prodObj;

        return (<>
            {prodObj?
                <image pointerEvents="all" preserveAspectRatio="none" 
                x={prodObj.x} y={prodObj.y} width={prodObj.drawWidth} height={prodObj.drawHeight} xlinkHref={prodObj.baseUrl} 
                onMouseDown={(e) => this.props.viewProdOnClock(e, this.props.prodInfo)} style={{outlineColor:(this.props.filterlistcolor?"#dc3545":"#ccc")}} />
            :<></>}
        </>);
    }
}

export function PrintCoverPageView(props) {
    let userdetails = (props.userDetails?props.userDetails:null);
    let viewObj = (props.isShowRLView?props.activeViewObj:props.viewObj);

    let generatedDate = moment().format("MMMM DD YYYY");
    let generatedTime = moment().format("hh:mm:ss");

    return <>
        <Col id={props.mainid} style={{display: "none", position: "relative"}}>
            <Col id={props.subid} className="printpreview-cover" style={{display: "block", position: "relative", width: 1191, height: 842}}>
                <ul className="list-inline top-list">
                    <li className="list-inline-item"><label>{props.t("FIELD_COUNT")}: <span>{(viewObj && viewObj.fieldsList?viewObj.fieldsList.length:0)}</span></label></li>
                    <li className="list-inline-item"><img src={arigologo} className="printmain-logo" alt="" /></li>
                </ul>

                <h4>{props.selStoreName?props.selStoreName:"-"} <br/>
                    <b>{(props.selectedPrintDept?(props.selectedPrintDept.name+" - "):"")+(props.viewObj && props.viewObj.fieldsList && props.viewObj.fieldsList[0]?props.viewObj.fieldsList[0].floorLayoutVersion:"-")}</b>
                </h4>

                <ul className="list-inline tags-list">
                    {viewObj && viewObj.tagList?viewObj.tagList.map((tagitem, tagidx) => {
                        return <li key={tagidx} className="list-inline-item">{tagitem.name}</li>;
                    }):<></>}
                </ul>

                {/* <h5>{props.viewObj && props.viewObj.fieldsList && props.viewObj.fieldsList[0]?props.viewObj.fieldsList[0].floorLayoutVersion:"-"}</h5> */}
                
                <Col className="cover-footer">
                    <ul className="list-inline">
                        <li className="list-inline-item">
                        <label>{userdetails && userdetails.chain?userdetails.chain.chainName:"-"}</label>
                        </li>
                        <li className="list-inline-item" dir="ltr">
                        <label>{(userdetails && userdetails.userDto?(userdetails.userDto.fName+" "+userdetails.userDto.lName):"-")} | {generatedDate+" | "+generatedTime}</label>
                        </li>
                    </ul>
                </Col>
            </Col>    
        </Col>
    </>;
}
