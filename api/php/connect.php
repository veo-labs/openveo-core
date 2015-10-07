<?php

require 'OpenveoWSClient.php';

$client = New OpenveoWSClient("65d6247f0293049523d6a5e2efdf49ac07b51600", "8a7b0d43a631b52cf15e89eba7a65f274ccc7f73",
    "localhost", "3001");
$isAuthenticated = $client->authenticate();

// Autentication succeed
if ($isAuthenticated)
{
  $param = [
      'limit' => 2,
      'page' => 0,
      'sortBy' => 'date',
      'sortOrder' => 'asc',
      'properties' => [
        'Auteur' => 'Einstein',
        'Moodle'=> ['149', '150']
      ]
  ];
  $result = $client->getVideosByProperty($param);
  print_r($result);
  print_r(count($result->entities));
} else
  print_r('error');
