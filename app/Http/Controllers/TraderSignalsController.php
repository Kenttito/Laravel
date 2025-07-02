<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TraderSignalsController extends Controller
{
    public function recent()
    {
        $demoTraders = [
            [
                'name' => 'BinanceTrader1',
                'roi' => '+120%',
                'signal' => [ 'action' => 'Buy', 'symbol' => 'BTCUSDT', 'price' => 63500, 'time' => '2024-06-23 10:15' ]
            ],
            [
                'name' => 'CryptoSniper',
                'roi' => '+98%',
                'signal' => [ 'action' => 'Sell', 'symbol' => 'ETHUSDT', 'price' => 3450, 'time' => '2024-06-23 09:50' ]
            ],
            [
                'name' => 'PipMasterPro',
                'roi' => '+85%',
                'signal' => [ 'action' => 'Buy', 'symbol' => 'BNBUSDT', 'price' => 590, 'time' => '2024-06-23 09:30' ]
            ],
            [
                'name' => 'AlphaWolf',
                'roi' => '+77%',
                'signal' => [ 'action' => 'Sell', 'symbol' => 'SOLUSDT', 'price' => 140, 'time' => '2024-06-23 09:20' ]
            ],
            [
                'name' => 'TrendCatcher',
                'roi' => '+65%',
                'signal' => [ 'action' => 'Buy', 'symbol' => 'XRPUSDT', 'price' => 0.52, 'time' => '2024-06-23 09:10' ]
            ],
        ];
        return response()->json($demoTraders);
    }
} 