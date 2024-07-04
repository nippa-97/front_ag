import React from 'react';
import { Toast } from 'react-bootstrap';

import { messaging } from '../../firebase';

export default class ToastMain extends React.Component {
  _isMounted = false;

  constructor(props){
    super (props);
    this.state = {
      toastList: []
    };
  }

  getNotifiData = () => {
    try {

    } catch (error) {
      //console.log(error);
    }
  }

  removeToast = (index) =>{
    var ctoastList = this.state.toastList;
    ctoastList.splice(index, 1);
    this.setState({toastList:ctoastList});
  }

  redirectToast = (toast) =>{
    //
  }

  async componentDidMount(){
    this._isMounted = true;
    if(this._isMounted){
      //this.getNotifiData();
      messaging.requestPermission().then(async function() {
  			const token = await messaging.getToken();
        console.log("token:"+token);
      }).catch(function(err) {
        console.log("Unable to get permission to notify.", err);
      });

      messaging.onMessage((payload) => {
        console.log('Message received. ', payload);
        var ctoastList = this.state.toastList;
        var cnotificatiob = payload.notification;
        ctoastList.push(cnotificatiob); //unshift
        if(ctoastList.length > 5){
          ctoastList.shift();
        }
        this.setState({toastList:ctoastList});
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
      return (
        <div className="toastMain">
            {this.state.toastList.map((toast,i) =>
                <Toast key={i} onClose={()=>this.removeToast(i)}>
                    <Toast.Header>
                        <strong onClick={()=>this.redirectToast(toast)} style={{marginRight:"15px"}}>{toast.title}</strong>
                    </Toast.Header>
                    <Toast.Body>{toast.body}</Toast.Body>
                </Toast>
            )}
        </div>
      )
  }
}
