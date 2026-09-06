self.addEventListener("install", function(event) {
    self.skipWaiting();
});

self.addEventListener("activate", function(event) {
    event.waitUntil(clients.claim());
});

self.addEventListener("push", function (event) {
    if (event.data) {
        try {
            const data = event.data.json();
            const options = {
                body: data.body,
                icon: data.icon ? new URL(data.icon, self.location.origin).href : new URL("/icon-192.png", self.location.origin).href,
                badge: new URL("/icon-192.png", self.location.origin).href,
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: "2",
                    url: data.url
                },
            };
            event.waitUntil(self.registration.showNotification(data.title, options));
        } catch (e) {
            console.error("Error processing push event:", e);
        }
    }
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(clients.openWindow(event.notification.data.url));
    }
});
