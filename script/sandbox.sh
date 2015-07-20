# OPENVEO ******************************* OPENVEO
echo "*********** Launch openveo sandbox" 
SER1=rs1/127.0.0.1:27017
SER2=rs1/127.0.0.1:27018
SER3=rs1/127.0.0.1:27019
DUMPOVDIR=/home/voldalys/bkp/db
VIDEOOVDIR=/home/vodalys/bkp/video

#kill NodeJs server
echo "*********** kill NodeJs server" 
sudo killall -9 node

#Restore mongodump
echo "*********** Restore mongodb" 
sudo /usr/bin/mongorestore --host $SER1,$SER2,$SER3 --drop $DUMPOVDIR

#Remove all unused video file
echo "*********** Remove unused file" 
cd /home/vodalys/livraison/openveo-publish
rm -Rf shared/videos
cp -R $VIDEOOVDIR shared/videos 

#Restart server
echo "*********** Restart server" 
cd /home/vodalys/livraison/openveo/current
NODE_ENV="production" && /usr/bin/node server.js


# MOODLES ******************************* MOODLES
echo "*********** Launch moodles sandbox" 
MYSQLUSER = 'root'
MYSQLPWD = 'root'
MYSQLDBNAME = 'moodles'
SQLPATHFILE = /home/vodalys/bkp/moodles/moodles.sql
MOODLEDATAPATH = /home/vodalys/bkp/moodles/moodledata-2.9/

#kill apache2 server
echo "*********** kill apache2 server" 
sudo service apache2 stop

#Restore Mysql
echo "*********** Restore Mysql" 
mysql -u MYSQLUSER -p MYSQLPWD  MYSQLDBNAME < SQLPATHFILE

#Remove all unused video file
echo "*********** Remove unused file" 
cd /home/vodalys
rm -Rf moodledata-2.9
cp -R $MOODLEDATAPATH moodledata-2.9 

#Restart server
echo "*********** Restart server" 
sudo service apache2 start

