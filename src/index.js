import * as Rx from 'rxjs';
import ThreadPool from '../lib/index';
import DataWorker from './data-process.worker';

const pool = new ThreadPool({
  threadCtor: DataWorker,
  maxThreadsNumber: 2
});

setTimeout(() => {
  console.log('main post message');

  pool.postMessage({
    action: 'do filter',
    payload: {
      id: 1,
      data: 'hello world'
    }
  });

  pool.postMessage({
    action: 'do filter',
    payload: {
      id: 2,
      data: 'hello world'
    }
  });
}, 2000);

const workerObservable$ = Rx.fromEvent(pool, 'message');
workerObservable$.subscribe({
  next: value => {
    console.log(value.data);
  }
});
