sudo killall -9 node

sudo /usr/bin/mongorestore --host rs1/127.0.0.1:27017,rs1/127.0.0.1:27018,rs1/127.0.0.1:27019 --drop /home/developer/Bureau/bkp/db/


cd /home/developer/workspace/openveo-core/nodes_modules/openveo-publish/
rm -Rf shared/videos
cp -R /data/bkp/videos shared/videos 

cd /home/developer/workspace/openveo-core
NODE_ENV="production" && /usr/bin/node /home/developer/workspace/openveo-core/server.js

