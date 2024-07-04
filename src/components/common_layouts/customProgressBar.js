import { Col } from 'react-bootstrap';
import { TooltipWrapper } from '../newMasterPlanogram/AddMethods';

function CustomProgressBar(props) {
    return(
        <Col xs={12} className={"custom-progress-bar "+(props.isRTL)}>
            {props.showtooltip?<TooltipWrapper text={(props.fulltext ? props.fulltext:(props.text ? props.text:""))}>
                <Col className="name" style={{color:(props.textcolor?props.textcolor:"white")}}>{(props.text ? props.text:"")}</Col>
            </TooltipWrapper>:<>
                <Col className="name" style={{color:(props.textcolor?props.textcolor:"white")}}>{(props.text ? props.text:"")}</Col>
            </>}
            
            {props.mainbarpercentage > 0?<Col className="main-bar" style={{width:(props.mainbarpercentage+"%"), background:(!props.isborder?props.mainbarcolor:"white"), border:(props.isborder?("2px solid "+props.mainbarcolor):"none")}}></Col>:<></>}
            {
                props.showsubbar==="true" || props.showsubbar === true ?
                <Col className="sub-bar" style={{width:(props.subbarpercentage+"%")}}></Col>
                :<></>
            }
            {
               props.showpercentage ?
               <span className='progress-txt'>{(props.mainbarpercentage+"%")}</span>
               :<></> 
            }
        </Col>
    )
}

export default CustomProgressBar;
