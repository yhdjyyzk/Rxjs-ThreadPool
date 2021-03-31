// 用户自定义 worker

function onMessage (e) {
  const data = e.data;
  const { action } = data;

  self.postMessage({
    action,
    payload: {
      data
    }
  });
}

self.addEventListener('message', onMessage);
