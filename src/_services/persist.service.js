import { Subject } from 'rxjs';
import { persistRootName } from './common.service';

const persistSubject = new Subject();

export const persistService = {
    onPersist,
    persist,
    loadPersist
};

function onPersist() {
    return persistSubject.asObservable();
}

function persist(pobj,isroot,subname) {
    if(pobj){
        var rootobj = (sessionStorage.getItem((persistRootName+"persistroot"))?JSON.parse(sessionStorage.getItem((persistRootName+"persistroot"))):{});
        if(isroot){
            rootobj = pobj;
        } else{
            rootobj[subname] = pobj;
        }
        sessionStorage.setItem((persistRootName+"persistroot"),JSON.stringify(rootobj));    
    } else{
        sessionStorage.removeItem((persistRootName+"persistroot"));
    }
    persistSubject.next(rootobj);
}

function loadPersist(){
    return (sessionStorage.getItem((persistRootName+"persistroot"))?JSON.parse(sessionStorage.getItem((persistRootName+"persistroot"))):undefined);
}
