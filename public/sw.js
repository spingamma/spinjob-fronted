import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener("install", function() {
    self.skipWaiting();
});

self.addEventListener("activate", function(event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
    if (event.data) {
        try {
            const data = event.data.json();
            const isPayment = (data && data.type === 'payment') ||
                              (data && data.title && data.title.toLowerCase().includes('pago')) ||
                              (data && data.body && data.body.toLowerCase().includes('comprobante'));

            const options = {
                body: data.body,
                icon: data.icon ? new URL(data.icon, self.location.origin).href : new URL("/icon-192.png", self.location.origin).href,
                badge: new URL("/icon-192.png", self.location.origin).href,
                vibrate: isPayment ? [250, 100, 250, 100, 500] : [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: "2",
                    url: data.url,
                    isPayment: isPayment
                },
            };

            const notifyClientsPromise = self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
                if (clientList && clientList.length > 0) {
                    clientList.forEach((client) => {
                        client.postMessage({
                            type: isPayment ? 'PUSH_PAYMENT_RECEIVED' : 'PUSH_NOTIFICATION_RECEIVED',
                            data: data
                        });
                    });
                }
            });

            event.waitUntil(Promise.all([
                self.registration.showNotification(data.title, options),
                notifyClientsPromise
            ]));
        } catch (e) {
            console.error("Error processing push event:", e);
        }
    }
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(self.clients.openWindow(event.notification.data.url));
    }
});
