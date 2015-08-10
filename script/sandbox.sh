#!/bin/sh

# OPENVEO ******************************* OPENVEO
echo "*********** Launch openveo sandbox"
SER1=127.0.0.1:27017
DUMPOVDIR=/home/openveo/bkp/openveo/db/openveo-dump
VIDEOOVDIR=/home/openveo/bkp/openveo/videos

# Kill NodeJs processes
echo "*********** Kill NodeJs processes"
killall -9 nodejs

# Restore openveo database
echo "*********** Restore openveo database"
mongorestore -u openveo -p openveo --authenticationDatabase openveo --host $SER1 --drop $DUMPOVDIR

# Restore videos files
echo "*********** Restore videos files"
cd /home/openveo/delivery/openveo-publish
rm -Rf shared/videos
cp -R $VIDEOOVDIR shared/videos
chown -R openveo:openveo shared/videos

# Clean tmp directory
echo "*********** Clean up tmp directory"
rm -Rf /home/openveo/delivery/openveo-publish/shared/tmp/*

# Restart server
echo "*********** Start OpenVeo Application server and Web Service server"
service openveo app start
service openveo ws start

# MOODLE ******************************* MOODLE
echo "*********** Launch moodle sandbox"
MYSQLUSER=root
MYSQLPWD=root
MYSQLDBNAME=moodle
SQLPATHFILE=/home/openveo/bkp/moodle/db/moodle-dump.sql
MOODLEDATAPATH=/home/openveo/bkp/moodle/moodledata-2.9

# Stop Nginx
echo "*********** Stop Nginx"
service nginx stop

# Restore moodle database
echo "*********** Restore moodle database"
mysql -u $MYSQLUSER -p$MYSQLPWD -e "DROP DATABASE moodle;"
mysql -u $MYSQLUSER -p$MYSQLPWD -e "CREATE DATABASE moodle;"
mysql -u $MYSQLUSER -p$MYSQLPWD $MYSQLDBNAME < $SQLPATHFILE

# Restart php-fpm
echo "*********** Restart php-fpm"
service php5-fpm restart

# Start Nginx
echo "*********** Start Nginx"
service nginx start