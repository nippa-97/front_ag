import { Subject } from 'rxjs';

const noteInfoSubject = new Subject();

export const noteInfoService = {
    onNoteInfo,
    noteInfo
};

function onNoteInfo() {
    return noteInfoSubject.asObservable();
}

function noteInfo(mid) {
    noteInfoSubject.next(mid);
}
