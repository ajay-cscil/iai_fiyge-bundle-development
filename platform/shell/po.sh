#!/bin/sh
echo "--------------start----------------"
for file in `find  . -name "*.po"`
do

#get only the file name
fnwpo=`basename $file .po`
output_location=`dirname $file`
echo "$file …"
msgfmt -cv -o $output_location/$fnwpo.mo $file

done
echo "--------------end----------------"