#!/bin/bash
ssh -L 3002:$(docker-machine ip):3002 -L 5000:$(docker-machine ip):5000 docker@$(docker-machine ip)
