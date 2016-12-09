# Launch in production

To use OpenVeo in a production environment, start the server in production :

    # Starts OpenVeo application in production environment
    NODE_ENV=production node server.js

    # Starts OpenVeo Web Service in production environment
    NODE_ENV=production node server.js -ws

**Nb :** You should also consider launching the process as a deamon.

# Replicate database

You should consider replicating your database using [MongoDB ReplicaSets](http://docs.mongodb.org/manual/replication/). You can configure OpenVeo to [use your ReplicaSets](scalability.md).