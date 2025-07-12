<?php
header('Content-Type: application/json');
echo json_encode([
    'status' => 'healthy',
    'timestamp' => date('c'),
    'message' => 'Server is running',
    'environment' => getenv('APP_ENV') ?: 'unknown'
]); 