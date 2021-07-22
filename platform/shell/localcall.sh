#!/bin/bash

##################################################
#
#This script is written By primod123 N Rathi
#
#On 13-11-2013
#
# Sr. System root Primary Modules Inc
#
#####################################################
#####################################################
#
#Following part will always update as per requirement
#
#
echo "BEGIN "

echo "started " >>/home/ubuntu/log.txt

dbpassword=`tr -cd \#_[:alnum:] < /dev/urandom |  fold -w 8 | head -1`

echo $pass

applicationurl=$1

securitysalt=$2

adminusermaax=$3

adminpasshash=$4

d=$5

#username=$6
fname=$6
#fname="$6 "

lname=$7

username=$fname$lname

demodata=$8
echo "started"

echo"params are $1 $2 $3 $4 $5 $6 $7 $8 $9" 
echo"params are $1 $2 $3 $4 $5 $6 $7 $8 "  >>/home/ubuntu/log.txt
echo "$username" >>/home/ubuntu/log.txt
dbusername=`echo $applicationurl | awk -F/ '{print $2}'|awk -F. '{print $1}'`admin

dbprefix=`echo $applicationurl | awk -F/ '{print $2}'|awk -F. '{print $1}'`

hostname='maaxframe.czpoly2st3e1.us-east-1.rds.amazonaws.com'

host='maaxframe.czpoly2st3e1.us-east-1.rds.amazonaws.com'

masterdbadmin='admin'

masterdbpass='Cr3ative12'

res='/var/www/html/console/maax/shell/'
echo $dbusername

#dbpassword='Atv4M6V6'

dirname=`echo $applicationurl | awk -F/ '{print $2}' `

dbacl=`echo $applicationurl | awk -F/ '{print $2}'|awk -F. '{print $1}'`_acl

dbdesign=`echo $applicationurl | awk -F/ '{print $2}'|awk -F. '{print $1}'`_design

dbapp=`echo $applicationurl | awk -F/ '{print $2}'|awk -F. '{print $1}'`_app

echo "--------all variables are loaded in syatem"
echo "-----------"$dirname
echo "------------"$dbacl
echo "-----------"$dbdesign
echo "------------"$dbapp
echo "--------"$applicationurl

echo "database prefix is $dbprefix"
echo "database password is$dbpassword"
######################################################################################################


#echo "all databases are created."
echo "        "
echo "        "
echo "        "
echo "        "
echo "        "
#echo '@@@@@@@@@@@@@@@--database created--@@@@@@@@@'
echo "processing done till this point"  >>/home/ubuntu/log.txt
if [ -d "/var/www/html/$dirname" ]; then
  # Control will enter here if $DIRECTORY exists.
echo 'INSTANCE-EXISTS'
echo "copy not possible... please choose another name" >>/home/ubuntu/log.txt
fi
#
echo "dir dont exes't so move ahead"  >>/home/ubuntu/log.txt
if [ ! -d "/var/www/html/$dirname" ]; then
echo "directory not found so start install script " >>/home/ubuntu/log.txt

echo "$dbacl $dbdesign $dbapp"

mysql -u $masterdbadmin -p$masterdbpass  -h $hostname  -e  "create database $dbacl"

mysql -u $masterdbadmin -p$masterdbpass  -h $hostname   -e "create database  $dbdesign"

mysql -u $masterdbadmin -p$masterdbpass  -h $hostname   -e "create database $dbapp"

mysql -u $masterdbadmin -p$masterdbpass  -h $hostname -e "CREATE USER '$dbusername'identified by'$dbpassword'"

echo 'user created'

mysql -u $masterdbadmin -p$masterdbpass  -h $hostname -e "GRANT SELECT,INSERT,UPDATE,DELETE ON *.* TO '$dbusername'@'%'"

echo "user created and permission grated" >>/home/ubuntu/log.txt
if [ $d -eq 1 ]
then 
#mysql -u $masterdbadmin -p$masterdbpass -h $hostname $dbacl < /var/www/html/sql/demo_maax_acl.sql
echo "data is pass to script." >>/home/ubuntu/log.txt

$res"restore.sh" demo_acl $dbacl

echo "DB-ACL-DONE"

#mysql -u $masterdbadmin -p$masterdbpass -h $hostname $dbdesign < /var/www/html/sql/demo_maax_design.sql
#
$res"restore.sh" demo_design $dbdesign

echo "DB-DESIGN-DONE"

#mysql -u $masterdbadmin -p$masterdbpass -h $hostname $dbapp < /var/www/html/sql/demo_maax_app.sql
#
$res"restore.sh" demo_app $dbapp

echo "DB-APP-DONE"
##########################################don't load Demo data#################################################################
else 
#mysql -u $masterdbadmin -p$masterdbpass -h $hostname $dbacl < /var/www/html/sql/maax_acl.sql
#

$res"restore.sh" maax_acl $dbacl

echo "DB-ACL-DONE"

#mysql -u $masterdbadmin -p$masterdbpass -h $hostname $dbdesign < /var/www/html/sql/maax_design.sql
$res"restore.sh" maax_design $dbdesign

echo "DB-DESIGN-DONE"

#mysql -u $masterdbadmin -p$masterdbpass -h $hostname $dbapp < /var/www/html/sql/maax_app.sql
$res"restore.sh" maax_app $dbapp

echo "DB-DESIGN-DONE"
fi
echo "dump complete successfully."
  # Control will enter here if $DIRECTORY doesn't exist.
cp -ar /var/www/html/maaxframe.com /var/www/html/$dirname

echo "copy complete"

mysql -u $masterdbadmin -p$masterdbpass  -h $hostname -e "UPDATE $dbapp.access_controls__users SET user_name='$adminusermaax',user_password='$adminpasshash',first_name='$fname',last_name='$lname',name='$fname $lname',force_password_reset_on_login=1  where(id=1)"

#mysql -u $masterdbadmin -p$masterdbpass  -h $hostname -e "UPDATE $dbapp.crm_base__email_addresses SET email='$officeemail'where(id=1)"
echo 'admin email change'


chmod -R 777 /var/www/html/$dirname

echo "permission given"

#echo "secsalt=528253ec-27ec-4110-8e51-069b00000000"

sed -i "s/maax/$dbprefix/g" /var/www/html/$dirname/app1/config/connection.php

sed -i "s/root/$dbusername/g" /var/www/html/$dirname/app1/config/connection.php

sed -i "s/localhost/$host/g" /var/www/html/$dirname/app1/config/connection.php

sed -i "s/primod123/$dbpassword/g" /var/www/html/$dirname/app1/config/connection.php

sed -i "/securitySalt/c\'securitySalt' =>'$securitysalt'," /var/www/html/$dirname/app1/config/configuration.php

sleep 60;

echo "SETUP-DONE"

echo "END"

fi
