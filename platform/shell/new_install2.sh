#!/bin/bash
log="/var/www/html/console/app1/tmp/logs/new_instance.log"
echo "ENTER NEW INSTALL">>$log
echo "PARAMS $1 $2 $3 $4 $5 $6 $7 $8 $9 ${10} ${11} ${12} ${13} ${14} ${15} ${16} ${17}"  >>$log
ssh ubuntu@localhost /var/www/html/console/maax/shell/localcall2.sh $1 $2 $3 $4 $5 $6 $7 $8 $9 ${10} ${11} ${12} ${13} ${14} ${15} ${16} ${17} 
echo "EXIT NEW INSTALL">>$log
