
import firebase from "firebase/app";
import "firebase/messaging";

const initializedFirebaseApp = !firebase.apps.length ? firebase.initializeApp({
  //test-aitdev
  /* apiKey: "AIzaSyDQioQXwqa53ncVSQro52K6cEg7ZcslXqk",
  authDomain: "testpg-47f3a.firebaseapp.com",
  projectId: "testpg-47f3a",
  storageBucket: "testpg-47f3a.appspot.com",
  messagingSenderId: "1007138615577",
  appId: "1:1007138615577:web:dfa65676829652cbea5588",
  measurementId: "G-8VL8RVQ53M" */

  //test-pg
  apiKey: "AIzaSyClA3nOgQ_fzvTonTy5aNGsWCNVsW3HL5M",
  authDomain: "planigo-notification.firebaseapp.com",
  projectId: "planigo-notification",
  storageBucket: "planigo-notification.appspot.com",
  messagingSenderId: "788100244576",
  appId: "1:788100244576:web:cf0ced1767b60c235d8f05",
  measurementId: "G-1E8DTY9J8P"
}) : firebase.app() ;

//const messaging = initializedFirebaseApp.messaging();
let messaging = null;

if (firebase.messaging.isSupported()) {
  messaging = initializedFirebaseApp.messaging();

  //messaging.usePublicVapidKey("BGxw0IzMu7PIyamSHf4JhBq3I7fXlUG_ePI8oj2rYxaE9GXbAMilR_lRuyxhYnoaEVB5oVXmZyLAfawDZCI6gfk"); //test-aitdev
  //messaging.usePublicVapidKey("BC52nhB9KYnQ0laTryHjPcIrV7JQb98dr2VrYexS7LXkm5WjwlIXdV8YcdJ0AlcdAUOl0JmBr2CUMEdNi36XhwA"); //test-pg

} else {
  //console.log('messaging no-support :(')
}

export { messaging };
