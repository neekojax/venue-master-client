// eventBus.ts
class EventBus {
  private listeners: { [key: string]: Array<(data?: any) => void> } = {};

  // 注册事件监听器
  on(event: string, listener: (data?: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
  }

  // 移除事件监听器
  off(event: string, listener: (data?: any) => void): void {
    if (!this.listeners[event]) return;

    this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
  }

  // 触发事件
  emit(event: string, data?: any): void {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach((listener) => listener(data));
  }
}

const eventBus = new EventBus();
export default eventBus;
