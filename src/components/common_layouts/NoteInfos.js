import React from 'react';
import { ListUnorderedIcon, XIcon } from '@primer/octicons-react';

import { noteInfoService } from '../../_services/noteinfo.service';

var notifitimeout;
export default class NoteInfos extends React.Component{
    constructor(props) {
        super(props);
        
        this.state = {
            alerts: []
        };
    }

    componentDidMount() {
        this.subscription = noteInfoService.onNoteInfo().subscribe(alert => {
            this.setState({ alerts: (alert?[alert]:[]) }, () => {
                if(notifitimeout){ clearTimeout(notifitimeout); }
                /* notifitimeout = setTimeout(() => this.removeNoteInfo(), 2500); */
            });
        });
    }

    componentWillUnmount(){
        this.subscription.unsubscribe();
    }

    removeNoteInfo = (isclose) => {
        this.setState({ alerts: [] }, () => {
            if(!isclose && this.props.opennotifications){
                this.props.opennotifications();
            }
        })
    }

    render() {
        const { alerts } = this.state;
        if (!alerts.length) return null;

        return (
            <>
                {alerts.map((alert, index) =>
                    <div key={index} className="noteinfo-alert">
                        <span className="notifi-icon" onClick={() => this.removeNoteInfo()}><ListUnorderedIcon size={16} /></span>
                        <span className="close-link" onClick={() => this.removeNoteInfo(true)}><XIcon size={14}/></span>
                        <h4 onClick={() => this.removeNoteInfo()}>{alert.title}</h4>
                        <p onClick={() => this.removeNoteInfo()}>{alert.body}</p>
                    </div>
                )}
            </>
        )
    }
}

