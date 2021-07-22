#!/bin/sh
#for file in `find . -name "*.js"`
#do
#fi=$(echo $file | sed -e 's/\.js$/.min.js/g')
#echo $fi
#echo "Compressing and renaming $file … to $fi"

#java -jar /usr/share/yui-compressor/yui-compressor.jar --type js -o $fi  $file
#echo "output"
#done

for file in `find . -name "*.json"`
do
echo $file
rm -rf $file
done
