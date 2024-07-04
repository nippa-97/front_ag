import React from 'react';
import { PlugIcon, XIcon } from '@primer/octicons-react';

import { withTranslation } from 'react-i18next';

let noconntimeinterval;
class NoConnectionNotify extends React.Component {
  _isMounted = false;

  constructor(props){
    super (props);
    this.state = {
      isactivenotify: false, isslowconection: false,
    };
  }
  
  componentDidMount(){
    this._isMounted = true;
    if(this._isMounted){
      this.checkConnectionTime();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    if(noconntimeinterval){
      clearInterval(noconntimeinterval);
    }
  }

  checkConnectionTime = () => {
    noconntimeinterval = setInterval(() => {
      this.isOnlineCheck().then((res) => {
        let isconn = res;
        let connection = (isconn?(navigator.connection || navigator.mozConnection || navigator.webkitConnection):false);
        
        this.setState({ isactivenotify: !isconn, isslowconection: (connection && (connection.effectiveType === '2g' || connection.effectiveType === "slow-2g")?true:false) });
      });
    }, 8000);
  }

  getRandomString () {
    return Math.random().toString(36).substring(2, 15)
  }

  isOnlineCheck = async () => {
    /* if (!window.navigator.onLine) return false
  
    // avoid CORS errors with a request to your own origin
    const url = new URL(window.location.origin)
  
    // random value to prevent cached responses
    url.searchParams.set('rand', this.getRandomString())
  
    try {
      const response = await fetch(url.toString(),{ method: 'HEAD' });
  
      return response.ok
    } catch {
      return false
    } */

    return (window.navigator && window.navigator.onLine);
  }

  toggleNotify = () => {
    this.setState({ isactivenotify: false, isslowconection: false });
  }

  render() {
      //console.log(this.props);
      return (<>
        <div className={"noconnection-main"+(this.state.isactivenotify?" active":"")} dir={this.props.isRTL}>
            <div className="noconnection-toast"><PlugIcon size={14} /> {this.props.t("connection_offline")}
            <span onClick={this.toggleNotify}><XIcon size={14}/></span></div>
        </div>
        <div className={"noconnection-main "+(this.state.isslowconection?" active":"")} dir={this.props.isRTL}>
            <div className="noconnection-toast warning"><PlugIcon size={14} /> {this.props.t("slow_connection")}
            <span onClick={this.toggleNotify}><XIcon size={14}/></span></div>
        </div>
      </>)
  }
}

export default withTranslation()(NoConnectionNotify);