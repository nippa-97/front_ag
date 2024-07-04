// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
const config = {
  

  //live-pg
  apiKey: "AIzaSyClA3nOgQ_fzvTonTy5aNGsWCNVsW3HL5M",
  authDomain: "planigo-notification.firebaseapp.com",
  projectId: "planigo-notification",
  storageBucket: "planigo-notification.appspot.com",
  messagingSenderId: "788100244576",
  appId: "1:788100244576:web:cf0ced1767b60c235d8f05",
  measurementId: "G-1E8DTY9J8P"
}

firebase.initializeApp(config);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
/* self.addEventListener('push', function(event) {
  //console.log(event);

  //Customize notification here
  var data = event.data.json();
  //console.log(data);
  const notificationTitle = data.notification.title;
  const notificationOptions = {
    body: data.notification.body,
    icon: './assets/img/logo192.png',
    tag: "notification-1"
  };
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
}); */

/* self.addEventListener('install', event => {
  self.skipWaiting();
}); */


self.addEventListener('notificationclick', function(event) {
  //console.log(event);
  event.notification.close();
  // This looks to see if the current is already open and
  // focuses if it is
  const ctaburl = event.target.serviceWorker.scriptURL;
  const { hostname } = new URL(ctaburl);
  //console.log(hostname);
  event.waitUntil(clients.matchAll({includeUncontrolled: true, type: 'window'}).then(function(clientList) {
    //console.log(clientList);
    for (var i = 0; i < clientList.length; i++) {
      var client = clientList[i];
      if (client.url.includes(hostname.toString()) && 'focus' in client)
        return client.focus();
    }
    if (clients.openWindow)
      return clients.openWindow('/');
  }));
});

let messaging = null;

if (firebase.messaging.isSupported()) {
  messaging = firebase.messaging();
  //console.log(console.log("messagging works"));

  // messaging.onBackgroundMessage((payload) => {
  //   //console.log('Received background message ', payload);
  //   // Customize notification here
  //   const notificationTitle = payload.notification.title;
  //   const notificationOptions = {
  //     body: payload.notification.body,
  //     icon: './assets/img/logo192.png',
  //     tag: "notification-1"
  //   };
    
  //   self.registration.showNotification(notificationTitle, notificationOptions);
  // });

} else {
  console.log('no-support :(')
}

//self.registration.hideNotification();
