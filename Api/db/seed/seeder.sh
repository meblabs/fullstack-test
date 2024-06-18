#!/bin/bash

# Importa tutti i json presenti nella cartella seed/ nelle collection del db
cd seed

dir=$(ls *.json)
for file in $dir; do
  echo ${file}:
  mongosh -u $MONGO_DATABASE_USERNAME -p $MONGO_DATABASE_PASSWORD $MONGO_DATABASE_NAME --eval 'db.'${file%.*}'.deleteMany({})'
  if [ -s $file ]; then
    mongoimport -u $MONGO_DATABASE_USERNAME -p $MONGO_DATABASE_PASSWORD --collection "${file%.*}" --db $MONGO_DATABASE_NAME /seed/$file --jsonArray
  fi
  echo
done
