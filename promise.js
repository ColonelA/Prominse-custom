//  PENDING 等待状态，允许修改， FULFILLED 成功状态 REJECTED 失败状态
const PENDING = 'PENDING';
const FULFILLED = 'FULFILLED';
const REJECTED = 'REJECTED';


class Promise {
    constructor(executor) {
        this.status = PENDING; // 初始化为默认的状态  
        this.value = undefined; // 成功时的返回参数
        this.reason = undefined; // 失败的原因

        this.onResolvedCallbacks = [] // 成功存放的回调
        this.onRejectedCallbacks = [] // 失败的回调 

        const resolve = () => {};

        const reject = () => {};


        try {
            executor(resolve, reject)
        } catch (e) {
            reject(e)
        }
    }

}


export default Promise;