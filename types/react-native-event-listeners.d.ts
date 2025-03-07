declare module 'react-native-event-listeners' {
  interface EventRegister {
    addEventListener: (eventName: string, callback: () => void) => string;
    removeEventListener: (eventId: string) => void;
    emitEvent: (eventName: string, data?: any) => void;
  }

  const EventRegister: EventRegister;
  export default EventRegister;
} 