import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import PushBranchView from '../../simulateview/MPsimulateAllCategory/EditSimulateCategory/pushBranchView/pushBranchView'

class IsleAlocateModal extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loadedcom:false,
        }
    }

    componentDidMount() {
        
    }

    componentDidUpdate(prevProps,prevState){
        if (prevProps.completedStatus !== this.props.completedStatus) {
            if(this.props.completedStatus === true){
                this.props.handleShow(false)
            }
         }
    }

    handlecomploaded=()=>{
        this.setState({loadedcom:true})
    }
    render() {
        return (
            <Modal className="MPSimulateAllModal" show={this.props.isShow} onHide={()=>this.props.handleShow(false)} onShow={()=>this.handlecomploaded()}  >
                <Modal.Body>
                    <Modal.Header closeButton>
                        <Modal.Title>
                        </Modal.Title>
                       
                    </Modal.Header>
                    {this.state.loadedcom?<PushBranchView
                                        // viewWidth={viewWidth}
                                        // catList={this.state.BrshowcategoryList}
                                        defSaveObj={this.props.defSaveObj}
                                        departmentId={this.props.departmentId}
                                        implemAisleStores={this.props.implemAisleStores}
                                        dataObj={this.props.dataObj}
                                        mpId = {this.props.mpId}
                                        mpstate={this.props.mpstate}
                                        hadleUpdateImplementData={this.props.hadleUpdateImplementData}
                                        isRTL={this.props.isRTL}
                                                                            // viewHeight={this.state.viewHeight}
                                        // imageurl={this.state.imageurl}
                                        // floormaprects={this.state.floormaprects}
                                     />:<></>}
                </Modal.Body>
            </Modal>


        )
    }
}

export default IsleAlocateModal