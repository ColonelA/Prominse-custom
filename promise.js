//  PENDING 等待状态，允许修改， FULFILLED 成功状态 REJECTED 失败状态
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';


function resolvePromise(newPromise, x, resolve, reject) {

    if (newPromise === x) {
        return reject(new TypeError('错误，引用一致'));
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
                })
            }



        })

        return newPromise

    }
}


export default Promise;