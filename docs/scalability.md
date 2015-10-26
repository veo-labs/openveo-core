# MongoDB database replication

If you want to take benefit of your [MongoDB replication set](http://docs.mongodb.org/manual/replication/), you can adapt your OpenVeo configuration.

Open **~openveo/core/databaseConf.json** and add a name for the ReplicaSet and a comma separated list of secondary servers.

```json
{
  ...
  "replicaSet" : "REPLICA_SET_NAME", // Replace REPLICA_SET_NAME by the name of the ReplicaSet
  "seedlist": "IP_1:PORT_1,IP_2:PORT_2" // The list comma separated list of secondary servers
}
```

```json
{
  "type" : "mongodb", // Do not change
  "host" : "localhost", // MongoDB server host
  "port" : 27017, // MongoDB port
  "database" : "DATABASE_NAME", // Replace DATABASE_NAME by the name of the OpenVeo database
  "username" : "DATABASE_USER_NAME", // Replace DATABASE_USER_NAME by the name of the database user
  "password" : "DATABASE_USER_PWD", // Replace DATABASE_USER_PWD  by the password of the database user
  "replicaSet" : "REPLICA_SET_NAME", // Replace REPLICA_SET_NAME by the name of the ReplicaSet
  "seedlist": "IP_1:PORT_1,IP_2:PORT_2" // The comma separated list of secondary servers
}
```