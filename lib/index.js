import ee from 'event-emitter-es6';

export default class ThreadPool extends ee {
  /**
   * @param {{ threadCtor: Worker, maxThreadsNumber: number }} param0
   */
  constructor ({ threadCtor, maxThreadsNumber }) {
    super();

    this.threadCtor = threadCtor;
    this.maxThreadsNumber = maxThreadsNumber || window.navigator.hardwareConcurrency;
    /**
     * @type {Array<Thread>}
     */
    this.threads = [];
    this.tasks = [];

    this.init();
  }

  init () {
    for (let i = 0; i < this.maxThreadsNumber; i++) {
      const thread = new Thread({
        threadCtor: this.threadCtor,
        id: i,
        onMessage: msg => {
          this.emitSync('message', msg);
          this.onMessage();
        }
      });

      this.threads.push(thread);
    }
  }

  /**
   * @param {any} msg
   * @param {Transferable} transferable
   */
  postMessage (msg, transferable) {
    this.tasks.push({
      msg, transferable
    });

    const thread = this.select();

    if (thread) {
      const { msg, transferable } = this.tasks.splice(0, 1)[0];
      thread.postMessage(msg, transferable);
    }
  }

  onMessage () {
    if (this.tasks.length) {
      const thread = this.select();

      if (thread) {
        const { msg, transferable } = this.tasks.splice(0, 1)[0];
        thread.postMessage(msg, transferable);
      }
    }
  }

  select () {
    return this.threads.filter(thread => !thread.isBusy())[0];
  }

  clearTasks () {
    this.tasks = [];
  }

  destroy () {
    this.tasks = [];
    this.threads.forEach(thread => {
      thread.terminate();
    });
  }
}

class Thread {
  constructor ({ threadCtor, id, onMessage }) {
    this.thread = new threadCtor();
    this.id = id;
    this.busy = false;
    this.onMessage = onMessage;
    this.thread.addEventListener('message', e => {
      this._onMessage(e);
    });
  }

  getId () {
    return this.id;
  }

  /**
   * @param {any} msg
   * @param {Transferable} transferable
   */
  postMessage (msg, transferable) {
    this.busy = true;
    this.thread.postMessage(msg, transferable);
  }

  isBusy () {
    return this.busy;
  }

  terminate () {
    this.thread.terminate();
  }

  /**
   * @param { MessageEvent } e
   */
  _onMessage (e) {
    this.busy = false;
    this.onMessage(e);
  }
}
