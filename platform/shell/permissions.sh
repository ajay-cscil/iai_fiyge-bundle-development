#!/bin/bash

# Run from main maax directory like
# htdocs/maax$ shell/permissions.sh

# Development Parameters

# Give permissions to the user
sudo chown -R "$(whoami)" ./
# provide write permissions to app directory in case I am using module builder
sudo chmod -R 770 app1/module/
sudo chmod -R 770 app1/webroot/module/

# Server parameters

# for server assign permissions as the apache group
sudo chown -R :www-data ./
# make overall permissions in a manner that user can read write but apache can only read and execute
sudo chmod -R 750 ./
# provide write permissions for tmp and storage
sudo chmod -R 770 app1/tmp/
sudo chmod -R 770 app1/storage/
sudo chmod -R 770 app1/config/
