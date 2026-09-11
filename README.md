# ZipCon

Zip Code is having a convention! This is the app that manages it all!

This application needs to support the following:

- Signing up for the event
  - As a lecturer/panelist
    - A lecture/panel can have multiple lecturers/panelists
    - If this is a new lecture/panel, assign it a day and time, with title and topic
    - There can be "tracks" where events in two different tracks occur at the same time. If this is the case, then the track must be identified.
  - As an attendee
    - Pick which lectures/panels you wish to attend
    - May require the attendee to select a track, which determines what events they can select from
    - Some events are mandatory like the Keynote speaker, Kris Younger, and the evening concert with Raz sitting in with Bonnie Raitt and Taj Mahal.
- Booking travel
  - Covers air, train putting the following on their itinerary
    - Leaving their home
    - Arrival at venue
    - Departure from venue
    - Returning home
  - Car rental
    - During event
    - There are sufficient cars for anyone who wants one
- Obtaining lodging
  - Hotel reservations
  - Must support booking at, at least, two hotels
- Phone app
  - Displays user's itinerary
  - Provides messaging for event participants
    - Forums by track
      - attending a track gives you access to that forum
      - attendees in other tracks don't have access
      - lecturers/panelists are identified by flair
    - All attendees/lecturers/panelists have access to Concierge forum which is an AI agent
    - Admin forum is only accessible to admins