import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

const alertSubject = new Subject();
const defaultId = 'default-alert';
const autoClose = true; 
const keepAfterRouteChange = false;
const msgOptions = { autoClose, keepAfterRouteChange };

//rxjs alert service for show alerts across applications
export const alertService = {
    onAlert,
    success,
    error,
    info,
    warn,
    alert,
    clear,
};
//alert types
export const alertType = {
    success: 'success',
    error: 'error',
    info: 'info',
    warning: 'warning'
}

function onAlert(id = defaultId) {
    return alertSubject.asObservable().pipe(filter(x => x && x.id === id));
}

function success(message, msgtimeout) {
    alert({ ...msgOptions, type: alertType.success, message, msgtimeout });
}

function error(message, msgtimeout) {
    alert({ ...msgOptions, type: alertType.error, message, msgtimeout });
}

function info(message, msgtimeout) {
    alert({ ...msgOptions, type: alertType.info, message, msgtimeout });
}

function warn(message, msgtimeout) {
    alert({ ...msgOptions, type: alertType.warning, message, msgtimeout });
}

function alert(alert) {
    alert.id = alert.id || defaultId;
    alertSubject.next(alert);
}

function clear(id = defaultId) {
    alertSubject.next({ id });
}