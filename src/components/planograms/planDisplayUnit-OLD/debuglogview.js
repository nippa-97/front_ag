/* import React from "react";
import { Col} from "react-bootstrap";
import { HubotIcon } from '@primer/octicons-react'; */
/**
 * using this debug view for testing puposes - not finished
 * this shows all the calculations done when user doing some task. (ex- dropping a new product, multiplying or deleting)
 * their lots of calculations going on when user doing some task to calculate product movement or sale effectancy on that product
 *
 * @export
 * @param {*} props
 * @return {*} 
 */
/* export default function DebugLogView(props) {

  //toggle edit sidebar
  const checkToggleView = () => {
    props.toggledebugview(!props.isshowedit);
  }
  
  return <>
    <Col xs={12} md={5} className="fieldedit-sidebar" style={(props.isRTL==="rtl"?{left:(props.showdebugview?"0px":"-440px")}:{right:(props.showdebugview?"0px":"-440px")})}>
      <div onClick={() => checkToggleView()} className="edit-toggle" style={{top:"160px",background:"#2CC990"}}><HubotIcon size={14}/></div>
      <h5>Debug Log</h5>
      <Col style={{marginTop:"20px"}}>
        
        {props.debuglist&&props.debuglist&&props.debuglist.length > 0?<>
            <Col style={{paddingRight:"12px",maxHeight:"calc(100vh - 280px)",overflowX:"hidden",overflowY:"scroll",marginRight:"-15px"}}>
              {props.debuglist.map((dlog, idx) => (
                <React.Fragment key={idx}>
                  <div className="NDUrackparams">
                    <small>{dlog.title}</small><br/>{dlog.msg}
                  </div>
                </React.Fragment>
              ))}
            </Col>
        </>:<></>}
      </Col>
    </Col>
  </>;
} */
