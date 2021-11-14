#!/bin/bash
sudo pm2 stop all
sudo pm2 delete all
cd /home/ubuntu/
sudo chown ubuntu:ubuntu webapp/
cd webapp
npm install