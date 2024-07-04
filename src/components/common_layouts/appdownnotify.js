import { Col, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import planigologo from '../../assets/img/logo_o.png';
import underconstimg from '../../assets/img/underconstruction_bg.jpg';

export default function AppDownNotify(props) {
  var { t } = useTranslation();
  //console.log(this.props);
  return (<>
    <Col className={"appdown-overlay"+(props.isonloadglobal || (props.globsettingobj && props.globsettingobj.stop_app_traffic)?" active":"")} dir={props.isRTL}>
        <img src={planigologo} className="logo-img" alt="Planigo logo" />
        <Col xs={12} lg={6} className="details-view centered">
          {!props.isonloadglobal?<><Col className="img-preview">
              <img src={underconstimg} className='img-fluid' alt='under construction'/>
          </Col>
          
          <h1><span>{t("WEBSITE_IS")}</span><br/>{t("UNDER_CONST")}</h1>
          <Button type="button" variant="primary" onClick={() => window.location.reload() }>{t("RELOAD_APP")}</Button>
          </>:<>
            <Col className='text-center'>
              <div className="loadanime-content" dir='ltl'>
                  <div className="anime-container animation-4">
                  <div className="shape shape1"></div>
                  <div className="shape shape2"></div>
                  <div className="shape shape3"></div>
                  <div className="shape shape4"></div>
                  </div>
              </div>
          </Col>  
          </>}

        </Col>
    </Col>
  </>)
}
