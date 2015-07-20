SER1=rs1/127.0.0.1:27017
SER2=rs1/127.0.0.1:27018
SER3=rs1/127.0.0.1:27019
DUMPOVDIR=/home/voldalys/bkp/db
VIDEOOVDIR=/home/vodalys/bkp/video

#kill server
echo "*********** kill server" 
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
