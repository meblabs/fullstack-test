#!/bin/bash

mongosh -- "$MONGO_DATABASE_NAME" <<-EOJS
	var rootUser = '$MONGO_INITDB_ROOT_USERNAME';
	var rootPassword = '$MONGO_INITDB_ROOT_PASSWORD';
	var admin = db.getSiblingDB('admin');
	admin.auth(rootUser, rootPassword);
	var user = '$MONGO_DATABASE_USERNAME';
	var passwd = '$MONGO_DATABASE_PASSWORD';
	db.createUser({user: user, pwd: passwd, roles: ["dbOwner"]});
EOJS
