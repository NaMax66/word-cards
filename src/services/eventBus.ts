class EventBus {
    eventObject: {
        [key: string]: Array<Function>
    }
    constructor() {
        this.eventObject = {}
    }

    emit(eventName: string, data?: any) {
        const callbackList = this.eventObject[eventName]
        if (!callbackList) return console.warn(eventName + ' not found!')
        for (const callback of callbackList) {
            callback(data)
        }
    }

    on(eventName: string, callback: Function) {
        if (!this.eventObject[eventName]) {
            this.eventObject[eventName] = []
        }

        this.eventObject[eventName].push(callback)
    }

    off(eventName: string, callback: Function) {
        this.eventObject[eventName]?.filter(cb => cb !== callback)
    }
}

export default new EventBus()
