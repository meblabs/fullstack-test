#!/bin/bash
cd seed

dir=$(ls *.json)
for file in $dir; do
  echo "$file":
  mongosh -u $MONGO_DATABASE_USERNAME -p $MONGO_DATABASE_PASSWORD $MONGO_DATABASE_NAME --eval 'db.'${file%.*}'.deleteMany({})'
done
