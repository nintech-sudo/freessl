<?php
header("Content-Type: application/json");

$input = json_decode(file_get_contents("php://input"), true);
$auths = $input['auths'] ?? [];
$results = [];

foreach ($auths as $auth) {
  $url = $auth['url'];
  $ch = curl_init();
  
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Theo dõi redirect
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Accept: text/plain",
    "User-Agent: Mozilla/5.0 (compatible; Grok/3.0; +https://nin.id.vn)"
  ]);

  $content = curl_exec($ch);
  $error = curl_error($ch);
  $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  
  curl_close($ch);

  if ($content !== false && $httpCode >= 200 && $httpCode < 300) {
    $results[] = ["success" => true, "content" => $content];
  } else {
    $results[] = ["success" => false, "error" => $error ?: "HTTP $httpCode"];
  }
}

echo json_encode($results);
?>