import { Subject } from 'rxjs';

const modalSubject = new Subject();

export const modalService = {
    onModal,
    modal
};

function onModal() {
    return modalSubject.asObservable();
}

function modal(mid) {
    modalSubject.next(mid);
}
