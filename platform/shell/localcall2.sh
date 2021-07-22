#!/bin/bash

##################################################
#
#@On 13-11-2013
#
#@By tushar takkar
#####################################################
#####################################################
#
#Following part will always update as per requirement
#
#
base="/var/www/html/"
log="/var/www/html/console/app1/tmp/logs/new_instance.log"



echo '---------------------------START------------------------------'>>$log
echo "PARAMS $1 $2 $3 $4 $5 $6 $7 $8 $9 ${10} ${11} ${12} ${13} ${14} ${15} ${16} ${17}"  >>$log

# set username password in production environment.
root_db_username='admin'
root_db_password='Cr3ative12'
db_hostname='maaxframe.czpoly2st3e1.us-east-1.rds.amazonaws.com'



#PRODUCTION PARAMS############ 
instance_name=$1
application_url=$2
# Uncomment following in production setup.
security_salt=$3
maax_admin_username=$4
maax_admin_password_hash=$5
load_demo_data=$6
first_name=$7
last_name=$8
email=$9
maax_admin_password=${10}
maax_default_password_hash=${12}
instance_id=${13}
instances_table=${14}
setup_instance_code=${15}
max_version=${16}
db_prefix=${17}
base=$base$max_version"/"
##############################

echo "paths are"  >>$log
echo "base: "$base  >>$log
echo "log: "$log  >>$log

#TEST PARAMS-- START / comment out test mode params in production setup
#call ./localcall2 maax14 https://localhost/maax14
#root_db_username='root'
#root_db_password='primod123'
#db_hostname='localhost'
#security_salt='asdfasdfasdfsadfasdfqwr234123'
#maax_admin_username='ttakkar@gmail.com'
#maax_admin_password_hash='241243123ferwe'
#load_demo_data=1
#first_name='tushar'
#last_name='takkar'
#email='ttakkar@gmail.com'
#################################


echo "params are"  >>$log
echo "  instance_name           : "$instance_name  >>$log
echo "  application_url         : "$application_url  >>$log
echo "  security_salt           : "$security_salt  >>$log
echo "  maax_admin_username     : "$maax_admin_username  >>$log
echo "  maax_admin_password_hash: "$maax_admin_password_hash  >>$log
echo "  maax_admin_password     : "$maax_admin_password  >>$log
echo "  load_demo_data          : "$load_demo_data  >>$log
echo "  first name              : "$first_name  >>$log
echo "  last name               : "$last_name  >>$log
echo "  office email            : "$email  >>$log
echo "  project path            : $base$instance_name">>$log

db_password=`date +%s | sha256sum | base64 | head -c 32 ; echo`
db_username=${11}
echo "db params are "  >>$log
echo "  db_username             : "$db_username  >>$log
echo "  db_password             : "$db_password  >>$log

db_acl=$db_prefix"_acl"
db_design=$db_prefix"_design"
db_app=$db_prefix"_app"

echo "  db_acl                  : "$db_acl  >>$log
echo "  db_design               : "$db_design  >>$log
echo "  db_app                  : "$db_app  >>$log

echo "Check if instance exists with same name"  >>$log
    echo "directory not found so start install script " >>$log
    mysql -u $root_db_username -p$root_db_password  -h $db_hostname  -e "create database $db_acl"
    echo "  Created $db_acl" >>$log
    mysql -u $root_db_username -p$root_db_password  -h $db_hostname  -e "create database $db_design"
    echo "  Created $db_design" >>$log
    mysql -u $root_db_username -p$root_db_password  -h $db_hostname  -e "create database $db_app"
    echo "  Created $db_app" >>$log
    mysql -u $root_db_username -p$root_db_password  -h $db_hostname  -e "CREATE USER '$db_username' identified by '$db_password'"
    echo "  Created db-user $db_username" >>$log
    mysql -u $root_db_username -p$root_db_password  -h $db_hostname -e "GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,INDEX,ALTER ON "$db_acl".* TO '$db_username'@'%' "
    mysql -u $root_db_username -p$root_db_password  -h $db_hostname -e "GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,INDEX,ALTER ON "$db_design".* TO '$db_username'@'%' "
    mysql -u $root_db_username -p$root_db_password  -h $db_hostname -e "GRANT SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,INDEX,ALTER ON "$db_app".* TO '$db_username'@'%' "
    echo "  Granted 'SELECT,INSERT,UPDATE,DELETE,CREATE,DROP,INDEX,ALTER ' to db-user $db_username" >>$log
    
    echo "user created and permission granted" >>$log

    
    if [ $load_demo_data -eq 1 ] 
    then 
        echo "Load full data" >>$log
        mysql -u $root_db_username -p$root_db_password -f -h $db_hostname $db_acl < $base"sql/withdata_acl.sql"
        echo "DB-ACL-DONE: "$db_acl" < "$base"sql/withdata_acl.sql">>$log
        mysql -u $root_db_username -p$root_db_password -f -h $db_hostname $db_design < $base"sql/withdata_design.sql"
        echo "DB-DESIGN-DONE: "$db_design" < "$base"sql/withdata_design.sql">>$log
        mysql -u $root_db_username -p$root_db_password -f -h $db_hostname $db_app < $base"sql/withdata_app.sql"
        echo "DB-APP-DONE: "$db_app" < "$base"sql/withdata_app.sql">>$log
        echo "Imported full data" >>$log
    else 
        echo "Load partial data" >>$log
        mysql -u $root_db_username -p$root_db_password -f -h $db_hostname $db_acl < $base"sql/withoutdata_acl.sql"
        echo "DB-ACL-DONE"
        mysql -u $root_db_username -p$root_db_password -f -h $db_hostname $db_design < $base"sql/withoutdata_design.sql"
        echo "DB-DESIGN-DONE"
        mysql -u $root_db_username -p$root_db_password -f -h $db_hostname $db_app < $base"sql/withoutdata_app.sql"
        echo "DB-APP-DONE"
        echo "Imported partial data" >>$log
    fi
    mysql -u $root_db_username -p$root_db_password  -h $db_hostname -e "UPDATE $db_app.access_controls__users SET access_key=UUID(), user_name='$maax_admin_username',user_password='$maax_admin_password_hash',first_name='$first_name',last_name='$last_name',name='$first_name $last_name',force_password_reset_on_login=1  where(id=1)"
    
    mysql -u $root_db_username -p$root_db_password  -h $db_hostname -e "UPDATE $db_app.access_controls__users SET access_key=UUID(), user_name= concat(replace(user_name,'@maaxframe.com',''),'+','$maax_admin_username'),user_password='$maax_default_password_hash',force_password_reset_on_login=1  where id > 1 "
    
    mysql -u $root_db_username -p$root_db_password  -h $db_hostname -e "UPDATE $instances_table SET edition='Free', security_salt='$security_salt',application_url='$application_url',default_database='$db_app' ,design_database='$db_design' ,acl_database='$db_acl' ,db_host='$db_hostname' ,db_port='3306' ,db_login='$db_username' ,db_password='$db_password' ,db_driver='mysql'  where id = '$instance_id' "

    if [ $setup_instance_code -eq 1 ] 
        then   

        echo "SVN Exporting code to new instance" >>$log
        svn export $base"app1" $base$instance_name
        echo "SVN Exported code to new instance[$base$instance_name]" >>$log
        chmod -R 777 $base$instance_name
        echo "Permission given">>$log

        find $base$instance_name -name tests -type d -exec rm -r {} +
        echo "Deleted tests folders">>$log

        find $base$instance_name -name *.json -exec rm -r {} +
        echo "Deleted .json files">>$log

        find $base$instance_name -iwholename *.ml -not -name *[usage]* -exec rm -r {} +
        echo "Deleted non usage type licenses">>$log

        chmod -R 777 $base$instance_name"/webroot/img"	
        mv $base$instance_name/config/connection.php.init $base$instance_name/config/connection.php
        mv $base$instance_name/config/configuration.php.init $base$instance_name/config/configuration.php
        chmod -R 777 $base$instance_name/config

        echo "Updated connection file">>$log;
        sed -i "/host/c\'host' =>'$db_hostname'," $base$instance_name/config/connection.php
        sed -i "/login/c\'login' =>'$db_username'," $base$instance_name/config/connection.php
        sed -i "/password/c\'password' =>'$db_password'," $base$instance_name/config/connection.php
        sed -i "/_app/c\'database' =>'$db_app'," $base$instance_name/config/connection.php
        sed -i "/_design/c\'database' =>'$db_design'," $base$instance_name/config/connection.php
        sed -i "/_acl/c\'database' =>'$db_acl'," $base$instance_name/config/connection.php

        echo "Updated configuration file">>$log;
        sed -i "/current_application_url/c\'current_application_url' =>'$application_url'," $base$instance_name/config/configuration.php
        sed -i "/securitySalt/c\'securitySalt' =>'$security_salt'," $base$instance_name/config/configuration.php
     fi

    CRON_INVOKE_MINUTE_1=$(( ( RANDOM % 60 )  + 1 ))   
    CRON_INVOKE_MINUTE_2=$(($CRON_INVOKE_MINUTE_1 + 30))
    if [ $CRON_INVOKE_MINUTE_2 -gt 60 ] 
    then   
        CRON_INVOKE_MINUTE_2=$(CRON_INVOKE_MINUTE_2 % 60)
    fi
    (crontab -l ; echo "$CRON_INVOKE_MINUTE_1,$CRON_INVOKE_MINUTE_2 * * * * wget --no-check-certificate $application_url/campaigns/process/execute -o /dev/null") | sort - | uniq - | crontab - 
    (crontab -l ; echo "$CRON_INVOKE_MINUTE_1,$CRON_INVOKE_MINUTE_2 * * * * wget --no-check-certificate $application_url/campaigns/process/execute?test_mode=1 -o /dev/null") | sort - | uniq - | crontab - 
    (crontab -l ; echo "$CRON_INVOKE_MINUTE_1,$CRON_INVOKE_MINUTE_2 * * * * wget --no-check-certificate $application_url/job_queue/job_instances/__execute -o /dev/null") | sort - | uniq - | crontab - 
    (crontab -l ; echo "$CRON_INVOKE_MINUTE_1,$CRON_INVOKE_MINUTE_2 * * * * wget --no-check-certificate $application_url/data_management/imports/__execute -o /dev/null") | sort - | uniq - | crontab - 
 

    sleep 60;
    echo "SETUP-DONE"
    echo "END"

echo '---------------------------END------------------------------'>>$log

