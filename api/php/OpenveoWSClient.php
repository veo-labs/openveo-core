<?php

require 'RestCurlClient.php';

class OpenveoWSException extends Exception
{

}

/**
 * Defines an OpenVeo Web Service client.
 * TODO When the OpenVeo Web Service will have a standard way to handle
 * errors, automatically authenticate client if token has expired.
 */
class OpenveoWSClient extends RestCurlClient
{

  /**
   * Base url for all requests to the OpenVeo Web Service
   * @var String
   */
  protected $baseUrl;

  /**
   * Basic base 64 encoded authentication credentials
   * @var String
   */
  protected $credentials;

  /**
   * Authenticated token returned by the Web Service
   * @var String
   */
  protected $authenticatedToken;

  /**
   * List of headers sent with each request
   * @var Array
   */
  protected $headers;

  /**
   * Builds a new Web Service client.
   * @param String $id The client application id
   * @param String $secret The client application secret
   * @param String $host The OpenVeo Web Service host without the
   * protocol part (e.g 127.0.0.1)
   * @param String|Integer $port The Web Service port if any
   */
  public function __construct($id, $secret, $host, $port = null)
  {
    if (empty($host) || empty($id) || empty($secret))
    {
      throw new OpenveoWSException('Host, client id and client secret are required to create an OpenveoWSClient');
    }

    $this->credentials = base64_encode($id . ':' . $secret);
    $this->baseUrl = 'http://' . trim($host, '/');
    $this->headers = array();

    // Add port if defined
    if (!empty($port))
      $this->baseUrl .= ':' . $port;

    parent::__construct();
  }

  /**
   * Authenticates the client application to the Web Service.
   * @return Boolean true if the authentication succeed, false otherwise
   */
  public function authenticate()
  {
    $url = $this->baseUrl . '/token';
    $results = $this->post($url, json_encode(array(
        'grant_type' => 'client_credentials'
        )), array(
        'Authorization: Basic ' . $this->credentials,
        'Content-Type: application/json'
    ));

    $decodedResults = json_decode($results);

    // Got a valid token
    // Authentication succeed
    if (isset($decodedResults->access_token))
    {
      $this->authenticatedToken = $decodedResults->access_token;
      $this->headers = array(
          'Authorization: Bearer ' . $this->authenticatedToken
      );
      return true;
    }

    // Authentication failed
    return false;
  }

  /**
   * Retrieves the list of published videos.
   *
   * TODO : Use correct Web Service end point when available to get the
   * list of videos by property. Actually its just post treatment.
   *
   * @param String $propertyName The name of the property to look for
   * @param String $propertyValue The value of the property
   * @return Array The list of videos or null
   */
  public function getVideosByProperty($propertyName, $propertyValue)
  {
    $url = $this->baseUrl . '/video';
    $results = $this->get($url, $this->headers);

    $decodedResults = json_decode($results);

    // Got videos
    if (isset($decodedResults->entities))
    {

      // Return only published videos
      $videos = array();
      for ($i = 0; $i < sizeof($decodedResults->entities); $i++)
      {
        $video = $decodedResults->entities[$i];
        if ($video->state == 7)
        {

          if (!empty($video->properties))
          {

            for ($j = 0; $j < sizeof($video->properties); $j++)
            {
              $property = $video->properties[$j];
              if (strtolower($property->name) === strtolower($propertyName) && $property->value == $propertyValue
              )
              {
                $videos[] = $video;
              }
            }
          }
        }
      }

      return $videos;
    }

    return null;
  }

}
