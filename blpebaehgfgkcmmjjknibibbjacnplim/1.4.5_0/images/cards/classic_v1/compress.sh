#!/bin/bash

mkdir compressed
for file in *; do
    convert -quality 0 +dither -depth 7 "$file" "compressed/$file"
done

cd compressed
mkdir temp

for file in *; do
    pngcrush -brute "$file" "temp/$file"
done

cd temp

for file in *; do
    cp "$file" "../../$file"
done

cd ..
cd ..

rm -r compressed