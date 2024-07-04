import React, { Component } from 'react'
import { Badge, Col, Modal } from 'react-bootstrap'
import { withTranslation } from 'react-i18next'
import EditSimulateCategory from '../EditSimulateCategory'
import { withRouter } from 'react-router-dom';
import { TooltipWrapper } from '../../../../AddMethods';
import { getNameorIdorColorofBox } from '../../../../MPSimulationCommenMethods';
import { KebabHorizontalIcon } from '@primer/octicons-react';
class FullScreenEditModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            
        }
    }
    handlecomploaded=()=>{
        this.setState({loadedcom:true})
    }
    render() {
        var {defSaveObj,openOneCategory}=this.props
        return (
            <Modal className={"MPSimulateAllModal editfullscreenModal"+(this.props.dmode?" d-mode":"")} show={this.props.isSetFullScreenEditModal} 
            onShow={()=>this.handlecomploaded()}
            //   onHide={()=>this.props.handleFullscreenEdit(false)}
              >
                <Modal.Body>
                    <Modal.Header 
                    // closeButton
                    >
                        <Modal.Title>
                            {/* {openOneCategory?this.props.t("EDIT_SIMULATE_CATEGORY") :this.props.t("EDITALLCATEGORY") } */}
                            <div style={{display:"flex"}}>
                                 <h5>{this.props.t("SIMULATION")}</h5>
                                 {(this.props.storeId && this.props.storeId > 0 && this.props.originatedMpId && this.props.originatedMpId > -1 && this.props.originatedMpName) ?
                                    //  if have relogram
                                    <div style={{padding:"4px 10px"}} className='version'>{this.props.originatedMpName}</div>
                                    :
                                    <div style={{padding:"4px 10px"}} className='version'>{(this.props.defSaveObj?(this.props.defSaveObj.masterPlanogram.name):"")}</div>
                                }
                           
                            </div>
                           
                            {this.state.loadedcom?
                                <Col className='aui-sim-title'>
                                
                            <label>{defSaveObj && defSaveObj.department?(defSaveObj.department.name+" "):"- "}
                            {
                            openOneCategory && 
                            this.props.selectedCatRect && this.props.selectedCatRect.categoryList.length > 0?
                            <>
                            {"  "}&#62; <span className={'badge bg-warning'} style={{background: getNameorIdorColorofBox(this.props.selectedCatRect.categoryList[0],"color"), color: "#fff"}}>
                                {getNameorIdorColorofBox(this.props.selectedCatRect.categoryList[0],"name")}
                                </span>
                            </>
                            :<></>}
                            {"  "}
                            {this.props.selectedTagList.length > 0?<>
                                    &#62;{' '}
                                    {this.props.selectedTagList.map((tags,tagskey)=>{
                                        return(<React.Fragment key={tagskey}>
                                            {tagskey < 2?<><TooltipWrapper text={tags.name} >
                                                <Badge className='tags-bg tags-selected-coloring'>{tags.name.slice(0, 8)}{tags.name.length > 8 && "..."}</Badge> 
                                            </TooltipWrapper> {' '}</>:<></>}
                                        </React.Fragment>)
                                    })}
                                    {this.props.selectedTagList.length > 2?<>
                                        <div className="dropdown aui-tag-dropdown" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                                            <div className='dropdown-link'><KebabHorizontalIcon size={16} /></div>
                                            {this.state.isOpen && (
                                                <div className="dropdown-content">
                                                    <h6>{this.props.t("MORE_TAGS")}</h6>
                                                    {this.props.selectedTagList.map((tags,index)=>{
                                                        return(<React.Fragment key={index}>
                                                            {index > 1?<TooltipWrapper text={tags.name}>
                                                                <Badge className='tags-bg tags-selected-coloring'>{tags.name.substring(0,10)+(tags.name.length > 10?"..":"")}</Badge>
                                                            </TooltipWrapper>
                                                            :<></>}
                                                        </React.Fragment>)
                                                    })}
                                            </div>
                                            )}
                                        </div>
                                    </>:<></>}
                            </>:<>&#62; <Badge className='no-tags-bg tags-selected-coloring'>{this.props.t("NO_TAG")}</Badge></>}
                            </label>
                            </Col>:<></>}
                        </Modal.Title>
                       
                        </Modal.Header>
                        {this.state.loadedcom?
                            <EditSimulateCategory
                                actualFieldStructures={this.props.actualFieldStructures}
                                allCategoryData={this.props.allCategoryData}
                                productEditWarningsList={this.props.productEditWarningsList}
                                isopenfromAffectedSimList={this.props.isopenfromAffectedSimList}

                                importedDataObj={this.props.importedDataObj}
                                updateImportedDataObj={this.props.updateImportedDataObj}

                                isAuiViewsAllow={this.props.isAuiViewsAllow}
                                isStoreReset={this.props.isStoreReset}
                                isIsleSimulation={this.props.isIsleSimulation}
                                originatedMpName={this.props.originatedMpName}
                                originatedMpId={this.props.originatedMpId}
                                storeId={this.props.storeId}
                                reloadSimAndTag={this.props.reloadSimAndTag}
                                reloadSimAndStore={this.props.reloadSimAndStore}
                                tagStoreGroup={this.props.tagStoreGroup}
                                selectedTagGroup={this.props.selectedTagGroup}
                                selectedTagList={this.props.selectedTagList}
                                toggleLoadingModal={this.props.toggleLoadingModal}
                                simOption={this.props.simOption} 
                                simulateCount={this.props.simulateCount}
                                newSnapshotId={this.props.newSnapshotId}
                                isFullScreenEdit={this.props.isFullScreenEdit}
                                isSetFullScreenEditModal={this.props.isSetFullScreenEditModal}
                                SimWrapperId={"fullscreen-simulation-edit-wrapper"}
                                mainViewId={"fullscreen-edit-mainsvg-view"}
                                mpstate={this.props.mpstate}
                                isFullscreenEditModal={true}
                                simType={this.props.simType}
                                bottomFieldCount={this.props.bottomFieldCount} 
                                isopenfirsttime={this.props.isopenfirsttime}
                                defSaveObj={this.props.defSaveObj}
                                getsimulatepayload={this.props.getsimulatepayload} 
                                selectedCatRect={this.props.selectedCatRect}
                                signedobj={this.props.signedobj}
                                toggleopenfirsttime={this.props.toggleopenfirsttime} 
                                toggleOneCategory={this.props.toggleOneCategory} 
                                haveChnagesinCat={this.props.haveChnagesinCat} 
                                isRTL={this.props.isRTL} 
                                handlebackinsaveChnages={this.props.handlebackinsaveChnages} 
                                handlehaveChnagesinCat={this.props.handlehaveChnagesinCat}
                                simulationObj={this.props.simulationObj} 
                                notReleatedProdList={this.props.notReleatedProdList}
                                simulateSearchObj={this.props.simulateSearchObj} 
                                updateSaveReloadStatus={this.props.updateSaveReloadStatus} 
                                sendmarkStackableCall={this.props.sendmarkStackableCall} 
                                dmode={this.props.dmode}
                                handleFullscreenEdit={this.props.handleFullscreenEdit}
                                isSalesCycle={this.props.isSalesCycle}
                                isSCycle={this.props.isSCycle}
                                mapFields={this.props.mapFields}
                                mapProducts={this.props.mapProducts}
                                productsWithAnomaly={this.props.productsWithAnomaly}
                                getProductAnomalies={this.props.getProductAnomalies}
                                changeSaleCycleActive={this.props.changeSaleCycleActive} 
                                disableSalesCycleState={this.props.disableSalesCycleState}    
                                handleFullscreenEditMethodcall={this.props.handleFullscreenEditMethodcall}
                                sendmarkStackableCallParent={this.props.sendmarkStackableCallParent}
                                mapobjectsdraw={this.props.mapobjectsdraw}
                                isShowFromPreview={this.props.isShowFromPreview}
                                selectedSimPreviewObj={this.props.selectedSimPreviewObj}
                                isPrintPending={this.props.isPrintPending}
                                isPDFPrintPending={this.props.isPDFPrintPending}
                                togglePrintPending={this.props.togglePrintPending}
                                getSimulationcall={this.props.getSimulationcall}
                                handleacknowledgeSimulationWarning={this.props.handleacknowledgeSimulationWarning}
                                isNewProdSim={this.props.isNewProdSim}
                                isChainSaleCycle={this.props.isChainSaleCycle}
                                updateIsChainSaleCycle={this.props.updateIsChainSaleCycle}
                                isSaleCycleUpdated={this.props.isSaleCycleUpdated}
                                updateIsSaleCycleUpdated={this.props.updateIsSaleCycleUpdated}
                                selectedScProductId={this.props.selectedScProductId}
                                mapCategories={this.props.mapCategories}
                                />
                        :<></>}
                    </Modal.Body>
            </Modal>
        )
    }
}


export default withTranslation()(withRouter(FullScreenEditModal))