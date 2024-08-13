'use client';

import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';

interface Event {
  title: string;
  description: string;
  date: string;
  subject: string;
}

const subjects = [
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Combined Maths', label: 'Combined Maths' },
];

const spacedRepetitionIntervals = [
  { interval: 1, unit: 'day' },
  { interval: 3, unit: 'day' },
  { interval: 7, unit: 'day' },
  { interval: 14, unit: 'day' },
  { interval: 30, unit: 'day' },
];

const EventScheduler = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    const initClient = () => {
      gapi.client.init({
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/calendar.events',
      }).then(() => {
        if (gapi.auth2) {
          gapi.auth2.init({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          });
        }
      }).catch((error) => {
        console.error('Error initializing gapi:', error);
      });
    };

    if (typeof window !== 'undefined') {
      gapi.load('client:auth2', initClient);
    }
  }, []);

  const handleSignIn = () => {
    if (typeof window !== 'undefined' && gapi.auth2) {
      gapi.auth2.getAuthInstance().signIn();
    }
  };

  const handleSignOut = () => {
    if (typeof window !== 'undefined' && gapi.auth2) {
      gapi.auth2.getAuthInstance().signOut();
    }
  };

  const handleAddEvent = () => {
    const newEvent: Event = { title, description, date, subject };
    setEvents([...events, newEvent]);

    spacedRepetitionIntervals.forEach((interval) => {
      const newDate = new Date(date);
      if (interval.unit === 'day') {
        newDate.setDate(newDate.getDate() + interval.interval);
      }
      const repeatedEvent: Event = { title, description, date: newDate.toISOString().split('T')[0], subject };
      setEvents((prevEvents) => [...prevEvents, repeatedEvent]);

      const gapiEvent = {
        summary: title,
        description,
        start: {
          date: repeatedEvent.date,
        },
        end: {
          date: repeatedEvent.date,
        },
      };

      handleEventCreation(gapiEvent);
    });

    setTitle('');
    setDescription('');
    setDate('');
    setSubject('');
  };

  const handleEventCreation = (gapiEvent: gapi.client.calendar.EventInput) => {
    if (typeof window !== 'undefined' && gapi.client && gapi.client.calendar) {
      gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: gapiEvent,
      })
      .then((response: any) => {
        console.log('Event created:', response.result);
      })
      .catch((err: Error) => {
        console.error('Error creating event:', err);
      });
    }
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubject(e.target.value);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-lg font-bold mb-4">Event Scheduler</h2>
      <button
        onClick={handleSignIn}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
      >
        Sign in with Google
      </button>
      <button
        onClick={handleSignOut}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
      >
        Sign out
      </button>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium" htmlFor="subject">
            Subject
          </label>
          <select
            id="subject"
            value={subject}
            onChange={handleSubjectChange}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a subject</option>
            {subjects.map((subject) => (
              <option key={subject.value} value={subject.value}>
                {subject.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          onClick={handleAddEvent}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Event
        </button>
      </form>
      <ul className="space-y-4 mt-4">
        {events.map((event, index) => (
          <li key={index} className="bg-gray-100 p-4 rounded">
            <h3 className="text-lg font-bold">{event.title}</h3>
            <p className="text-sm">{event.description}</p>
            <p className="text-sm">Subject: {event.subject}</p>
            <p className="text-sm">{event.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventScheduler;
