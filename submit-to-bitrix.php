<?php
// Allow requests from any origin. For production, you should restrict this to your website's domain.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// IMPORTANT: Replace this with your actual Bitrix24 inbound webhook URL!
$bitrixWebhookUrl = 'https://nextgeneration.bitrix24.kz/rest/5584/ti4fotjmrh46o7zy/';

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']);
    exit;
}

// Get the raw POST data
$logFile = 'form_log.txt';
$json_data = file_get_contents('php://input');
file_put_contents($logFile, "Received POST data: " . $json_data . "\n", FILE_APPEND);
$data = json_decode($json_data, true);
file_put_contents($logFile, "Decoded data: " . print_r($data, true) . "\n", FILE_APPEND);

// Basic validation
if (empty($data['Name']) || empty($data['Phone'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Name and Phone are required.']);
    exit;
}

// Prepare the data for Bitrix24
$fields = array(
    'TITLE' => 'New Lead from Website', // You can customize the lead title
    'NAME' => $data['Name'],
    'PHONE' => array(array('VALUE' => $data['Phone'], 'VALUE_TYPE' => 'WORK')),
    'SOURCE_ID' => 'WEB' // Identifies the lead source as 'Web'
);

if (!empty($data['Email'])) {
    $fields['EMAIL'] = array(array('VALUE' => $data['Email'], 'VALUE_TYPE' => 'WORK'));
}

if (!empty($data['Selectbox'])) {
    $fields['COMMENTS'] = 'Role: ' . $data['Selectbox'];
}

if (!empty($data['Selectbox_2'])) {
    $fields['COMMENTS'] = ($fields['COMMENTS'] ?? '') . '\nGrade: ' . $data['Selectbox_2'];
}

$leadData = http_build_query(array(
    'fields' => $fields,
    'params' => array('REGISTER_SONET_EVENT' => 'Y')
));

// Initialize cURL to send the request
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $bitrixWebhookUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $leadData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
file_put_contents($logFile, "Bitrix24 Response: " . $response . "\n", FILE_APPEND);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
if ($curl_error) {
    file_put_contents($logFile, "cURL Error: " . $curl_error . "\n", FILE_APPEND);
}
curl_close($ch);

// Check the response
if ($curl_error) {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => 'cURL Error: ' . $curl_error]);
} elseif ($http_code >= 400) {
    http_response_code($http_code);
    echo json_encode(['success' => false, 'message' => 'Bitrix24 API Error', 'details' => json_decode($response)]);
} else {
    echo json_encode(['success' => true, 'message' => 'Lead successfully created in Bitrix24.']);
}

?>
