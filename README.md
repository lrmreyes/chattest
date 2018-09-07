# Project 2

Web Programming with Python and JavaScript

This project allows a user to choose (and change) a display name,
then post messages to a channel. New, unique channels can be added
and each channel keeps track of the last 100 messages posted.
The display name and the last used channel are stored locally so that
the display name is remembered through several sessions and so that the
last channel used can be loaded automatically on the next session.

The personal touch added was the ability to delete messages.
This allowed the user to delete a message, as long as the display name of
that user matched the username in that message.

index.html - Template and layout of website
application.py - Stores all the channels and messages and updates them

Static files:
favicon.ico
index.js - Gets user inputs and updates outputs
style.css - Custom CSS