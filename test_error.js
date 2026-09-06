function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
}
try {
  urlBase64ToUint8Array(undefined);
} catch (e) {
  console.log(e.message);
}
