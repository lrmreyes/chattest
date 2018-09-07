import os
import requests

from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit
from datetime import datetime

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channel_list = {"General": []}

@app.route("/")
def index():
    return render_template("index.html", channels=list(channel_list))

@socketio.on("add channel")
def addchannel(data):
    """Adds a channel."""

    channelname = data["channel"]
    # Checks if channel is unique
    if channelname in list(channel_list):
        print(channelname + " already exists.")
    else:
        channel_list[channelname]=[]
        emit("channel added", channelname, broadcast=True)

@socketio.on("get channel")
def getchannel(data):
    """Gets the selected channel."""

    channelname = data["channel"]
    selectedchannel = channel_list[channelname]
    emit("load channel", selectedchannel)

@socketio.on("send message")
def sendmessage(data):
    """Adds a message to a channel."""

    # Combines all information into one entry
    user = data["user"]
    message = data["message"]
    channel = data["channel"]
    time = datetime.now().strftime('%Y-%m-%d %H:%M')
    if len(channel_list[channel]) < 1:
        counter = 1
    else:
        counter = channel_list[channel][-1][3] + 1
    entry = [user, time, message, counter]

    # Takes out the first message if there are at least 100 messages
    if len(channel_list[channel]) > 99:
        channel_list[channel].pop(0)

    # Adds the entry to the channel
    channel_list[channel].append(entry)

    entry.append(channel)
    datatosend = entry

    emit("message added", datatosend, broadcast=True)

@socketio.on("delete message")
def deletemessage(data):
    """Deletes a message from a channel."""

    id = data["id"]
    channel = data["channel"]

    counter = 0
    for message in channel_list[channel]:
        if message[3] == id:
            del channel_list[channel][counter]
            emit('message deleted',
            [channel_list[channel], channel], broadcast=True)
            break
        counter += 1;



