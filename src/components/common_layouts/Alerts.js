import React from 'react';
import { alertService, alertType } from '../../_services/alert.service';
/**
 * common alert view for whole application.
 * this one using rxjs to show messages.
 * loaded in app.js
 *
 * @export
 * @class Alerts
 * @extends {React.Component}
 */
export default class Alerts extends React.Component{
    constructor(props) {
        super(props);
        
        this.state = {
            alerts: [], //alerts array
        };
    }

    componentDidMount() {
        this.subscription = alertService.onAlert(this.props.id).subscribe(alert => {
            if (!alert.message) {
                const alerts = this.state.alerts;
                this.setState({ alerts });
                return;
            }
            //only pushes one message every time shows message. but can modify it to keep showing messages
            this.setState({ alerts: [alert] });

            // auto close alert in 2.5secs
            if (alert.autoClose) {
                var istimeoutavble = (alert.msgtimeout?alert.msgtimeout:2500)
                setTimeout(() => this.removeAlert(alert), istimeoutavble);
            }
        });
    }

    componentWillUnmount(){
        this.subscription.unsubscribe();
    }
    //delete alert by clicking or after 2.5secs
    removeAlert(alert) {
        if (this.props.fade) {
            // fade out alert
            const alertWithFade = { ...alert, fade: true };
            this.setState({ alerts: this.state.alerts.map(x => x === alert ? alertWithFade : x) });

            // remove alert after faded out
            setTimeout(() => {
                this.setState({ alerts: this.state.alerts.filter(x => x !== alertWithFade) })
            }, 250);
        } else {
            // remove alert
            this.setState({ alerts: this.state.alerts.filter(x => x !== alert) })
        }
    }
    //css classes for each message containing alerttypes
    cssClasses(alert) {
        if (!alert) return;

        const classes = ['alert', 'alert-dismissable'];
                
        const alertTypeClass = {
            [alertType.success]: 'alert alert-success',
            [alertType.error]: 'alert alert-danger',
            [alertType.info]: 'alert alert-info',
            [alertType.warning]: 'alert alert-warning'
        }

        classes.push(alertTypeClass[alert.type]);

        if (alert.fade) {
            classes.push('fade');
        }

        return classes.join(' ');
    }

    render() {
        const { alerts } = this.state;
        if (!alerts.length) return null;

        return (
            <>
                {alerts.map((alert, index) =>
                    <div style={{marginTop:"25px"}} key={index} className={this.cssClasses(alert)}>
                        <label className="close" onClick={() => this.removeAlert(alert)}>&times;</label>
                        <span dangerouslySetInnerHTML={{__html: alert.message}}></span>
                    </div>
                )}
            </>
        )
    }
}

