import React from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Col } from 'react-bootstrap';

import { grantPermission } from '../../_services/common.service';
import { alertService } from '../../_services/alert.service';

import { viewFieldAction, viewSetAction } from '../../actions/planogram/planogram_action';
import { complianceIDSetAction, complianceResetSetAction } from '../../actions/manualCompliance/manualCompliance_action';
import { setNewProdRedirectAction } from '../../actions/newProductCount/newProductCount_action';
import { auiRedirectMDSetAction, selectedMasterPlanSetAction } from '../../actions/masterPlanogram/masterplanogram_action';
import { viewUsersSetAction } from '../../actions/users/users_actions';
import { store } from '../../store/store';
import i18n from "../../_translations/i18n";
/**
 * using to redirect in varies purposes 
 * 1-if signin details available, 2-notification click planogram item, 3-change left/right field
 *
 * @class RedirectComponent
 * @extends {React.Component}
 */
export class RedirectComponent extends React.Component {
  _isMounted = false;

  constructor(props){
    super (props);
    this.state = {

    };
  }

  async componentDidMount(){
    //console.log(this.props.taskFeedState.tasktableDetails);
    this._isMounted = true;
    if(this._isMounted){
      this.checkRedirectState();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  checkRedirectState = () => {
    if(this.props.mpstate && this.props.mpstate.mpDetails && this.props.mpstate.mpDetails.isredirect){
      let mpobj = this.props.mpstate.mpDetails;
      mpobj["isredirect"] = false;

      this.props.setMasterPlanAction(mpobj);
      this.props.history.push("/masterplanograms/layoutview");
    }
    else if(this.props.mpstate && this.props.mpstate.auiRedirect){
      if(this.props.mpstate.auiRedirect === "floor"){
        this.props.history.push("/floors/details");
        
      } else if(this.props.mpstate.auiRedirect === "store"){
        this.props.setUserView(null);
        this.props.history.push("/users/details");
      }
      this.props.auiRedirectMDSet(null);
    }
    else if(this.props.planogramState!==null && this.props.planogramState.pgramFieldDetails && this.props.planogramState.pgramFieldDetails.isredirect){
      var cfieldobj = this.props.planogramState.pgramFieldDetails;
      cfieldobj["isredirect"] = false;
      this.props.setFieldView(cfieldobj);
      this.props.history.push("/planograms/displayunit");
    } else if(this.props.planogramState!==null && this.props.planogramState.planogramDetails && this.props.planogramState.planogramDetails.isnotsredirect){
      const cpgdview = this.props.planogramState.planogramDetails;
      cpgdview["isnotsredirect"] = false;
      
      if(cpgdview.id > 0){
        this.props.setPLanogramView(cpgdview);
      } else{
        this.props.setPLanogramView(null);
      }
      this.props.history.push("/planograms/details");
    } 
    // else if(this.props.taskFeedState!==null&& this.props.taskFeedState.tasktableDetails!==null&&this.props.taskFeedState.tasktableDetails.taskdetail!==null &&this.props.taskFeedState.tasktableDetails.taskdetail.payloadTypeId==="1"){
    //   this.props.history.push("/tasks");
    // }
    else if(this.props.taskFeedState&& this.props.taskFeedState.tasktableDetails&&this.props.taskFeedState.tasktableDetails.taskdetail){
      this.props.history.push("/tasks");
    }
    else if(this.props.manualcomp && this.props.manualcomp.manualCompRedirect){
      this.props.setmanualCompIDSet(this.props.manualcomp.manualCompRedirect);
      this.props.setmanualCompRedirect(null);
      this.props.history.push("/manualcompliance/details");
    }
    else if(this.props.newprodState&& this.props.newprodState.redirectState){
      this.props.setNewProdRedirect(null);
      this.props.history.push("/newProducts");
    }
    else if(this.props.signedobj!==null&&this.props.signedobj.signinDetails){
      //this.props.history.push("/planograms");
      var newState = store.getState();
      var curuserobj = (newState.signState && newState.signState.signinDetails ? newState.signState.signinDetails : null);
      const permittedRolePages = (curuserobj && curuserobj.userRolls ? curuserobj.userRolls.userAccessService : []);
      var defaccesspage=permittedRolePages.length>0?permittedRolePages[0].serviceName:undefined

      // let isUserRestricted = (curuserobj && curuserobj.userUUID === "53bd6158-b53c-4032-9855-b6a9d0481da9"?true:false);
      let isUserRestricted = false;

      if(isUserRestricted){
        this.props.history.push("/masterplanograms");
      } else if(this.props.signedobj.signinDetails.isAiUser && grantPermission("manualcomp")){
        this.props.history.push("/manualcompliance");
      } else if(this.props.signedobj.prevPageDetails && this.props.signedobj.prevPageDetails !== ""){
        this.props.history.push(this.props.signedobj.prevPageDetails);
      } else if(grantPermission("planogram")){
        defaccesspage="planogram"
        this.props.history.push("/planograms");
      } else if(grantPermission("taskfeed")){
        defaccesspage="tasks"
          this.props.history.push("/tasks");
      } else if(grantPermission("products")){
        defaccesspage="products"
        this.props.history.push("/products");
      } else{
        if(defaccesspage){
          this.props.history.push(defaccesspage);
        }else{
          alertService.error(i18n.t("accessdenied"));
          this.props.history.push("/signin");
        }
          
      }
      //this.props.setHomePageval(defaccesspage)
    } else{
      this.props.history.push("/landing");
    }
  }

  render() {
      return (
        <Col xs="12" md="4" className="col-centered text-center" style={{fontSize:"16px",fontWeight:"300"}}>Redirecting...</Col>
      )
  }
}

const mapDispatchToProps = dispatch => ({
  setFieldView: (payload) => dispatch(viewFieldAction(payload)),
  setPLanogramView: (payload) => dispatch(viewSetAction(payload)),
  setmanualCompIDSet: (payload) => dispatch(complianceIDSetAction(payload)),
  setmanualCompRedirect: (payload) => dispatch(complianceResetSetAction(payload)),
  setNewProdRedirect:(payload) => dispatch(setNewProdRedirectAction(payload)),
  auiRedirectMDSet:(payload) => dispatch(auiRedirectMDSetAction(payload)),
  setUserView: (payload) => dispatch(viewUsersSetAction(payload)),
  setMasterPlanAction: (payload) => dispatch(selectedMasterPlanSetAction(payload)),
});

export default withRouter(connect(null, mapDispatchToProps)(RedirectComponent));
