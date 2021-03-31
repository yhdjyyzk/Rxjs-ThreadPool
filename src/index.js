import * as Rx from 'rxjs';
import { bufferCount, filter } from 'rxjs/operators';
import ThreadPool from '../lib/index';
import DataWorker from './data-process.worker';

const pool = new ThreadPool({
  threadCtor: DataWorker,
  maxThreadsNumber: 2
});

setTimeout(() => {
  console.log('main post message');

  pool.postMessage({
    action: 'do sum',
    payload: {
      id: 2,
      data: 'hello world'
    }
  });

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

const subjectFilter = new Rx.Subject();

const workerObservableFilter$ = Rx.fromEvent(pool, 'message');
workerObservableFilter$.pipe(
  filter(value => value.data.action === 'do filter')
).subscribe({
  next (value) {
    const { payload } = value.data;
    subjectFilter.next(payload);
  }
});

subjectFilter.pipe(
  bufferCount(2) // 等两个消息都返回
).subscribe({
  next (value) {
    console.log(value);
  }
});

const sumObservable$ = Rx.fromEvent(pool, 'message');
sumObservable$.pipe(
  filter(value => value.data.action === 'do sum')
).subscribe({
  next (value) {
    console.log(value.data);
  }
});
