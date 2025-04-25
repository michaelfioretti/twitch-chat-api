# Twitch Chat Stats API

A public NestJS-powered API for Twitch chat analytics, including total messages, bits, and streamer metadata. This API pulls data produced via the [Twitch Stats Producer](https://github.com/michaelfioretti/twitch-stats-producer), which was a precursor to this project.

[![codecov](https://codecov.io/gh/michaelfioretti/twitch-chat-api/branch/develop/graph/badge.svg?token=D2VOC2DTG4)](https://codecov.io/gh/michaelfioretti/twitch-chat-api)

## Video Overview
Watch the YouTube video about this project [here](https://youtu.be/dmEhb20MSyU)

## Tech Stack

- [NestJS](https://nestjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- [Render](https://render.com/) for deployment
- [Jest](https://jestjs.io/) for testing

## Installation
```bash
# Clone the repo
git clone https://github.com/michaelfioretti/twitch-chat-api.git
cd twitch-chat-api

# Install dependencies
npm install

# Start the dev server
npm run start:dev
