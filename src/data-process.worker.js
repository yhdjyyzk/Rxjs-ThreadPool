function onMessage (e) {
  const data = e.data;

  self.postMessage({
    action: 'did filter',
    payload: {
      data
    }
  });
}

self.addEventListener('message', onMessage);
