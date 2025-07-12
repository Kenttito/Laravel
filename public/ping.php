<?php
header('Content-Type: application/json');
echo json_encode([
    'status' => 'pong',
    'timestamp' => date('c'),
    'message' => 'Server is running',
    'environment' => getenv('APP_ENV') ?: 'unknown'
]); 