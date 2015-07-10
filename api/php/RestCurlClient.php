<?php

class RestClientException extends Exception{}

/**
 * Defines a REST Curl client with common GET, POST, PUT, DELETE HTTP 
 * methods.
 */
class RestCurlClient{
  
  /** 
   * Curl handle
   * @var CURL handle
   */
  public $handle;
  
  /** 
   * Curl options 
   * @var Array
   */
  public $httpOptions;

  /**
   * Builds a new RestCurlClient.
   */
  function __construct(){}

  /**
   * Init A curl session with cookie session.
   * @param Array $headers A list of headers to had to the curl request  
   */
  function initCurl($headers = array()){
    $curlCookieJar = tempnam(sys_get_temp_dir(), "cookies_");

    // Prepare curl default options
    $this->httpOptions = array();
    $this->httpOptions[CURLOPT_HTTPHEADER] = $headers;
    $this->httpOptions[CURLOPT_RETURNTRANSFER] = true;
    $this->httpOptions[CURLOPT_FOLLOWLOCATION] = false;
    $this->httpOptions[CURLOPT_COOKIESESSION] = false;
    $this->httpOptions[CURLOPT_COOKIEJAR] = $curlCookieJar;
    $this->httpOptions[CURLOPT_COOKIEFILE] = $curlCookieJar;
    $this->httpOptions[CURLOPT_HEADER] = false;
    $this->httpOptions[CURLOPT_CONNECTTIMEOUT] = 1;
    $this->httpOptions[CURLOPT_TIMEOUT] = 30;
    
    // Initialize curl session
    $this->handle = curl_init();
  }

  /**
   * Executes the curl request.
   * Curl object is destroy after a call.
   */
  function execCurl(){
    if($this->handle){
      $this->responseObject = curl_exec($this->handle);
      curl_close($this->handle);
    }
  }

  /**
   * Performs a GET call to server.
   * @param String $url The url to make the call to
   * @param Array $httpOptions Extra option to pass to curl request
   * @return String The response from curl if any
   */
  function get($url, $httpHeaders = array(), $httpOptions = array()){
    $this->initCurl($httpHeaders);
    $httpOptions = $httpOptions + $this->httpOptions;
    $httpOptions[CURLOPT_CUSTOMREQUEST] = 'GET';
    $httpOptions[CURLOPT_URL] = $url;

    if(!curl_setopt_array($this->handle, $httpOptions))
      throw new RestClientException('Error setting cURL request options');
      
    $this->execCurl();
    return $this->responseObject;
  }

  /**
   * Performs a POST call to the server.
   * @param String $url The url to make the call to
   * @param String|Array $fields The data to post. Pass an array to
   * make an http form post.
   * @param Array $httpOptions Extra option to pass to curl request
   * @return String The response from curl if any
   */
  function post($url, $fields = array(), $httpHeaders = array(), $httpOptions = array()){
    $this->initCurl($httpHeaders);
    $httpOptions = $httpOptions + $this->httpOptions;
    $httpOptions[CURLOPT_POST] = true;
    $httpOptions[CURLOPT_URL] = $url;
    $httpOptions[CURLOPT_POSTFIELDS] = $fields;
    if(is_array($fields)){
      $httpOptions[CURLOPT_HTTPHEADER] = array(
          'Content-Type: multipart/form-data'
      );
    }
    if(!curl_setopt_array($this->handle, $httpOptions))
      throw new RestClientException('Error setting cURL request options.');
    
    $this->execCurl();
    return $this->responseObject;
  }

  /**
   * Performs a PUT call to the server.
   * @param String $url The url to make the call to
   * @param String|Array $data The data to post
   * @param Array $httpOptions Extra option to pass to curl request
   * @return String The response from curl if any
   */
  function put($url, $data = '', $httpHeaders = array(), $httpOptions = array()){
    $this->initCurl($httpHeaders);
    $httpOptions = $httpOptions + $this->httpOptions;
    $httpOptions[CURLOPT_CUSTOMREQUEST] = 'PUT';
    $httpOptions[CURLOPT_POSTFIELDS] = $data;
    $httpOptions[CURLOPT_URL] = $url;
    if(!curl_setopt_array($this->handle, $httpOptions))
      throw new RestClientException('Error setting cURL request options.');

    $this->execCurl();
    return $this->responseObject;
  }

  /**
   * Performs a DELETE call to server.
   * @param String $url The url to make the call to
   * @param Array $httpOptions Extra option to pass to curl handle
   * @return String The response from curl if any
   */
  function delete($url, $httpHeaders = array(), $httpOptions = array()){
    $this->initCurl($httpHeaders);
    $httpOptions = $httpOptions + $this->httpOptions;
    $httpOptions[CURLOPT_CUSTOMREQUEST] = 'DELETE';
    $httpOptions[CURLOPT_URL] = $url;
    if(!curl_setopt_array($this->handle, $httpOptions))
      throw new RestClientException('Error setting cURL request options.');
    
    $this->execCurl();
    return $this->responseObject;
  }

}
