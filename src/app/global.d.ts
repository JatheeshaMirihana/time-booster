// src/global.d.ts or src/types.d.ts

declare namespace gapi.client.calendar {
    interface EventInput {
      summary: string;
      description?: string;
      start: {
        date: string;
      };
      end: {
        date: string;
      };
    }
  
    interface Event {
      id: string;
      summary: string;
      description?: string;
      start: {
        date: string;
      };
      end: {
        date: string;
      };
    }
  
    interface EventsResource {
      insert(request: {
        calendarId: string;
        resource: EventInput;
      }): gapi.client.Request<Event>;
    }
  }
  
  declare namespace gapi.client {
    const calendar: {
      events: gapi.client.calendar.EventsResource;
    };
  }
  