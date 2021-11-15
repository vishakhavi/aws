#!/bin/bash
sudo pm2 stop all
sudo pm2 delete all
cd /home/ubuntu/
sudo chown ubuntu:ubuntu webapp/
cd webapp
npm install
sudo cp /home/ubuntu/webapp/config/aws_cw_config.json /opt/
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws_cw_config.json \
    -s