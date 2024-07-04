import React, { Component } from 'react'
//import { Button } from 'react-bootstrap'
import { withTranslation } from 'react-i18next'
import { withRouter } from 'react-router-dom'
import SyncLogOpen from './synclogopen/syncLogOpen'
import SynclogTable from './synclogTable.js/synclogTable'

class SaleSyncLog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            viewsynclogtable: true,
            clikingId:null,
            pageDetails:null,
        }
    }
    setpageDetails=(pdetails)=>{
        this.setState({pageDetails:pdetails})
    }
    handleviewsalestable=(id)=>{
        this.setState({ viewsynclogtable: false, clikingId:id,})
    }
    handleViewSyncLogTable=()=>{
        this.setState({ viewsynclogtable: true, clikingId:null,})
    }

    render() {
        return this.state.viewsynclogtable ? (
            <SynclogTable branches={this.props.branches} whitecontainer={this.props.whitecontainer} handleviewsalestable={this.handleviewsalestable} pageDetails={this.state.pageDetails} setpageDetails={this.setpageDetails} getTileDetails={this.props.getTileDetails}  />
        ) : (
           <SyncLogOpen isRTL={this.props.isRTL} handleViewSyncLogTable={this.handleViewSyncLogTable} clikingId={this.state.clikingId} />
        )
    }
}

export default withTranslation()(withRouter(SaleSyncLog))
