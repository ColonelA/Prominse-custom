//  PENDING 等待状态，允许修改， FULFILLED 成功状态 REJECTED 失败状态
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';


function resolvePromise(newPromise, x, resolve, reject) {

    if (newPromise === x) {
        return reject(new TypeError('错误，函数引用一致'));
    }

    let called = false;
    if (typeof x === 'object' && x !== null || typeof x === 'function') {
        try {
            let then = x.then;
            if (typeof then === 'function') {
                then.call(x, y => {
                    if (called) return;
                    called = true;
                    resolvePromise(newPromise, y, resolve, reject)
                }, err => {
                    if (called) return;
                    called = true;
                    reject(err)
                })
            }

        } catch (e) {
            reject(x)
        }

    } else {
        if (called) return;
        called = true;
        // 普通值直接执行 
        resolve(x)
    }

}



class Promise {
    constructor(executor) {
        this.status = PENDING; // 初始化为默认的状态  
        this.value = undefined; // 成功时的返回参数
        this.reason = undefined; // 失败的原因

        this.onResolvedCallbacks = [] // 成功存放的回调
        this.onRejectedCallbacks = [] // 失败的回调 

        const resolve = (value) => {


            if (this.status = PENDING) {
                this.value = value;
                this.status = FULFILLED;
                this.onResolvedCallbacks.forEach(fn => fn())
            }
        };

        const reject = (reason) => {
            if (this.status = PENDING) {
                this.reason = reason;
                this.status = REJECTED;
                this.onRejectedCallbacks.forEach(fn => fn())
            }

        };


        try {
            executor(resolve, reject)
        } catch (e) {
            reject(e)
        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
        onRejected = typeof onRejected === 'function' ? onRejected : err => {
            throw err;
        };


        const newPromise = new Promise((resolve, reject) => {

            // 订阅模式
            if (this.status == FULFILLED) { // 成功调用成功方法
                setTimeout(() => {
                    try {
                        const x = onFulfilled(this.value);
                        // 此x 可能是一个promise， 如果是promise需要看一下这个promise是成功还是失败 .then ,如果成功则把成功的结果 调用promise2的resolve传递进去，如果失败则同理
                        // 总结 x的值 决定是调用promise2的 resolve还是reject，如果是promise则取他的状态，如果是普通值则直接调用resolve
                        resolvePromise(newPromise, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            }
            if (this.status === REJECTED) { // 失败调用失败方法
                setTimeout(() => {
                    try {
                        const x = onRejected(this.reason);
                        resolvePromise(newPromise, x, resolve, reject);
                    } catch (e) {
                        reject(e);
                    }
                }, 0);
            }

            // 记录状态下，保存任务切片 
            if (this.status === PENDING) {
                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onFulfilled(this.value);
                            resolvePromise(newPromise, x, resolve, reject);
                        } catch (e) {
                            reject(e)
                        }
                    }, 0)
                });

                this.onRejectedCallbacks.push(() => {
                    setTimeout(() => {
                        try {
                            const x = onFulfilled(this.reason);
                            resolvePromise(newPromise, x, resolve, reject);
                        } catch (e) {
                            reject(e)
                        }
                    })
                })
            }



        })

        return newPromise

    }

    static resolve(value) {
        return new Promise((resolve, reject) => {
            resolve(value);
        })
    }
    static reject(value) {
        return new Promise((resolve, reject) => {
            reject(value);
        })
    }
    catch (errorFn) {
        return this.then(null, errorFn)
    }

}


export default Promise;