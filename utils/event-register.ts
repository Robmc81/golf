import EventEmitter from 'eventemitter3';

const eventEmitter = new EventEmitter();

export const addEventListener = (eventName: string, callback: (...args: any[]) => void) => {
  eventEmitter.on(eventName, callback);
  // Return a unique identifier for this listener
  return `${eventName}-${Date.now()}`;
};

export const removeEventListener = (eventId: string) => {
  if (!eventId) return;
  const [eventName] = eventId.split('-');
  eventEmitter.removeAllListeners(eventName);
};

export const emitEvent = (eventName: string, data?: any) => {
  eventEmitter.emit(eventName, data);
}; 