#!/bin/sh
for file in `find . -name "*.css"`
do
fi=$(echo $file | sed -e 's/\.css$/.min.css/g')
#echo $fi
echo "Compressing and renaming $file … to $fi"

java -jar /usr/share/yui-compressor/yui-compressor.jar --type css -o $fi  $file
echo "output"
done

for file in `find . -name "*.min.min.*"`
do
rm -rf $file
done
