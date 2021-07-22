#!/bin/bash

applicationurl=$1

securitysalt=$2

adminusermaax=$3

adminpasshash=$4

demodata=$5

username=$6

firstname=$7

lastname=$8

officeemail=$9


ssh -i /var/www/app1maax.pem ubuntu@54.204.40.191 /var/www/html/uat/maax/shell/localcall.sh $applicationurl $securitysalt $adminusermaax $adminpasshash $demodata  $username $firstname $lastname $officeemail
