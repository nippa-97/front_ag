import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux'
import { Modal } from 'react-bootstrap';
import MPsimulateAllCategory from '../MPsimulateAllCategory/MPsimulateAllCategory';

class AllSimulationModal extends Component {
    constructor(props) {
        super(props)
        this._isMounted = false;
        this.state = {
            loadedcom:false
        }
    }
    componentDidMount(){
        this._isMounted = true;
       
       
        if(this._isMounted){
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    handlecomploaded=()=>{
        this.setState({loadedcom:true})
    }
    render() {
        // var {openOneCategory} = this.props;
        
        return (
            <Modal className="MPSimulateAllModal" show={this.props.isallsimulatemodal} onShow={()=>this.handlecomploaded()}  onHide={()=>this.props.toggleSimulateAllModal()}>
                <Modal.Body>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {/* {openOneCategory?this.props.t("EDIT_SIMULATE_CATEGORY") :this.props.t("EDITALLCATEGORY") } */}
                            {this.props.t("SIMULATION_OF")+" "}
                            {(this.props.department&&this.props.department.department_name)?this.props.department.department_name:this.props.department.name?this.props.department.name:""}
                            {(this.props.selectedSimPreviewObj&&this.props.selectedSimPreviewObj.mpversionname)?
                            // show newprod version
                                <div className='version'>{this.props.selectedSimPreviewObj.mpversionname}</div>
                            :
                            <div className='version'>{(this.props.defSaveObj&&this.props.defSaveObj.masterPlanogram&&this.props.defSaveObj.masterPlanogram.name?(this.props.defSaveObj.masterPlanogram.name):"")}</div>
                            }
                            
                        </Modal.Title>
                       
                        </Modal.Header>

                        {this.state.loadedcom?
                        <MPsimulateAllCategory
                            isFixed={this.props.isFixed}
                            selectedBranch={this.props.selectedBranch}
                            isopenfromAffectedSimList={this.props.isopenfromAffectedSimList}
                            newSnapshotId={this.props.newSnapshotId}
                            isAuiViewsAllow={this.props.isAuiViewsAllow}
                            isSalesCycle={false}
                            isFromStandaloneView={this.props.isFromStandaloneView}
                            importedDataObj={this.props.importedDataObj}
                            simType={this.props.simType} 
                            department={this.props.defSaveObj.department}
                            bottomFieldCount={this.props.bottomFieldCount}
                            defSaveObj={this.props.defSaveObj} 
                            mpstate={this.props.mpstate} 
                            chartFilterDates={this.props.chartFilterDates}
                            isallsimulatemodal={this.props.isallsimulatemodal} 
                            isRTL={this.props.isRTL} 
                            dmode={this.props.dmode}
                            isDirectSimulation={this.props.isDirectSimulation}
                            loadedTagsList={this.props.loadedTagsList} 
                            openOneCategory={this.props.openOneCategory} 
                            haveChnagesinCat={this.props.haveChnagesinCat}
                            signedobj={this.props.signedobj} 
                            handlehaveChnagesinCat={this.props.handlehaveChnagesinCat}
                            toggleOneCategory={this.props.toggleOneCategory} 
                            toggleLoadingModal={this.props.toggleLoadingModal}
                            toggleSimulateAllModal={this.props.toggleSimulateAllModal} 
                            sendmarkStackableCall={this.props.sendmarkStackableCall}
                            handleAuiOpen={this.props.handleAuiOpen}
                            handleAuiRedirect={this.props.handleAuiRedirect}
                            storeId={this.props.storeId}
                            storeName={this.props.storeName}
                            disableSalesCycleState={this.props.disableSalesCycleState}
                            disableSalesCycle={this.props.disableSalesCycle}
                            isShowFromPreview={this.props.isShowFromPreview}
                            selectedSimPreviewObj={this.props.selectedSimPreviewObj}
                            saveSimulationObjToSideBarComp={this.props.saveSimulationObjToSideBarComp}
                            selectedTagList={this.props.selectedTagList}
                            tagStoreGroup={this.props.tagStoreGroup}
                            isIsleSimulation={this.props.isIsleSimulation}
                            isleSimObj={this.props.isleSimObj}
                            updateSimDisabled={this.props.updateSimDisabled}
                            updateImportedDataObj={this.props.updateImportedDataObj}
                            changeSaleCycleActive={this.props.changeSaleCycleActive}
                            isNewProdSim={this.props.isNewProdSim}
                            />
                        :<></> }
                </Modal.Body>
            </Modal>
        )
    }
}


const mapDispatchToProps = dispatch => ({
    
});
export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(AllSimulationModal)))
