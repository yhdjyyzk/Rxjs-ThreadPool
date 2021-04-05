import * as Rx from 'rxjs';
import { bufferCount, filter } from 'rxjs/operators';
import ThreadPool from '../lib/index';
// import './decode';
import DecodeWorker from './decode.worker';

const pool = new ThreadPool({
  threadCtor: DecodeWorker,
  maxThreadsNumber: 4
});

// --------------------- decode tile --------------

const workerObservableDecode$ = Rx.fromEvent(pool, 'message');
workerObservableDecode$.pipe(
  filter(value => value.data.action === 'decode'),
  bufferCount(4)
).subscribe({
  next (value) {
    console.timeEnd('decoding');
    const timestamps = [];

    for (let i = 0; i < value.length; i++) {
      const { payload, timestamp } = value[i].data;
      // console.log(payload.data);
      timestamps.push(timestamp);
    }

    console.log(Date.now() - Math.max(...timestamps));
  }
});

setTimeout(() => {
  console.time('decoding');

  for (let x = 26983; x < 26985; x++) {
    for (let y = 12416; y < 12418; y++) {
      const timestamp = Date.now();

      pool.postMessage({
        action: 'decode',
        payload: {
          x,
          y,
          z: 15
        },
        timestamp
      });
    }
  }
}, 1200);

// ------------------------------------------------

// setTimeout(() => {
//   console.log('main post message');

//   pool.postMessage({
//     action: 'do sum',
//     payload: {
//       id: 2,
//       data: 'hello world'
//     }
//   });

//   pool.postMessage({
//     action: 'do filter',
//     payload: {
//       id: 1,
//       data: 'hello world'
//     }
//   });

//   pool.postMessage({
//     action: 'do filter',
//     payload: {
//       id: 2,
//       data: 'hello world'
//     }
//   });
// }, 2000);

// const subjectFilter = new Rx.Subject();

// const workerObservableFilter$ = Rx.fromEvent(pool, 'message');
// workerObservableFilter$.pipe(
//   filter(value => value.data.action === 'do filter')
// ).subscribe({
//   next (value) {
//     const { payload } = value.data;
//     subjectFilter.next(payload);
//   }
// });

// subjectFilter.pipe(
//   bufferCount(2) // 等两个消息都返回
// ).subscribe({
//   next (value) {
//     console.log(value);
//   }
// });

// const sumObservable$ = Rx.fromEvent(pool, 'message');
// sumObservable$.pipe(
//   filter(value => value.data.action === 'do sum')
// ).subscribe({
//   next (value) {
//     console.log(value.data);
//   }
// });
