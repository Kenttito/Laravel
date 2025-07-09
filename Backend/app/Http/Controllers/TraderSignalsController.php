<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class TraderSignalsController extends Controller
{
    public function recent()
    {
        // Get real-time crypto prices
        $prices = $this->getCryptoPrices();
        
        // Generate dynamic trading signals with real prices
        $demoTraders = [
            [
                'name' => 'BinanceTrader1',
                'roi' => '+' . rand(120, 200) . '%',
                'signal' => [
                    'action' => rand(0, 1) ? 'Buy' : 'Sell',
                    'symbol' => 'BTCUSDT',
                    'price' => $prices['bitcoin'] ?? 108000,
                    'time' => now()->format('Y-m-d H:i')
                ]
            ],
            [
                'name' => 'CryptoSniper',
                'roi' => '+' . rand(100, 180) . '%',
                'signal' => [
                    'action' => rand(0, 1) ? 'Buy' : 'Sell',
                    'symbol' => 'ETHUSDT',
                    'price' => $prices['ethereum'] ?? 3850,
                    'time' => now()->subMinutes(15)->format('Y-m-d H:i')
                ]
            ],
            [
                'name' => 'PipMasterPro',
                'roi' => '+' . rand(80, 150) . '%',
                'signal' => [
                    'action' => rand(0, 1) ? 'Buy' : 'Sell',
                    'symbol' => 'BNBUSDT',
                    'price' => $prices['binancecoin'] ?? 680,
                    'time' => now()->subMinutes(30)->format('Y-m-d H:i')
                ]
            ],
            [
                'name' => 'AlphaWolf',
                'roi' => '+' . rand(70, 140) . '%',
                'signal' => [
                    'action' => rand(0, 1) ? 'Buy' : 'Sell',
                    'symbol' => 'SOLUSDT',
                    'price' => $prices['solana'] ?? 165,
                    'time' => now()->subMinutes(45)->format('Y-m-d H:i')
                ]
            ],
            [
                'name' => 'TrendCatcher',
                'roi' => '+' . rand(60, 130) . '%',
                'signal' => [
                    'action' => rand(0, 1) ? 'Buy' : 'Sell',
                    'symbol' => 'XRPUSDT',
                    'price' => $prices['ripple'] ?? 0.65,
                    'time' => now()->subMinutes(60)->format('Y-m-d H:i')
                ]
            ],
            [
                'name' => 'CryptoQueen',
                'roi' => '+' . rand(90, 160) . '%',
                'signal' => [
                    'action' => rand(0, 1) ? 'Buy' : 'Sell',
                    'symbol' => 'ADAUSDT',
                    'price' => $prices['cardano'] ?? 0.48,
                    'time' => now()->subMinutes(75)->format('Y-m-d H:i')
                ]
            ],
            [
                'name' => 'BitcoinBull',
                'roi' => '+' . rand(150, 250) . '%',
                'signal' => [
                    'action' => rand(0, 1) ? 'Buy' : 'Sell',
                    'symbol' => 'DOGEUSDT',
                    'price' => $prices['dogecoin'] ?? 0.15,
                    'time' => now()->subMinutes(90)->format('Y-m-d H:i')
                ]
            ],
            [
                'name' => 'AltcoinHunter',
                'roi' => '+' . rand(70, 140) . '%',
                'signal' => [
                    'action' => rand(0, 1) ? 'Buy' : 'Sell',
                    'symbol' => 'MATICUSDT',
                    'price' => $prices['matic-network'] ?? 0.92,
                    'time' => now()->subMinutes(105)->format('Y-m-d H:i')
                ]
            ],
        ];
        
        return response()->json($demoTraders);
    }
    
    private function getCryptoPrices()
    {
        // Cache prices for 5 minutes to avoid too many API calls
        return Cache::remember('crypto_prices', 300, function () {
            try {
                $response = Http::timeout(10)->get('https://api.coingecko.com/api/v3/simple/price', [
                    'ids' => 'bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin,matic-network',
                    'vs_currencies' => 'usd'
                ]);
                
                if ($response->successful()) {
                    $data = $response->json();
                    $prices = [];
                    
                    // Map CoinGecko IDs to our symbols
                    $mapping = [
                        'bitcoin' => 'bitcoin',
                        'ethereum' => 'ethereum', 
                        'binancecoin' => 'binancecoin',
                        'solana' => 'solana',
                        'ripple' => 'ripple',
                        'cardano' => 'cardano',
                        'dogecoin' => 'dogecoin',
                        'matic-network' => 'matic-network'
                    ];
                    
                    foreach ($mapping as $id => $key) {
                        if (isset($data[$id]['usd'])) {
                            $prices[$key] = $data[$id]['usd'];
                        }
                    }
                    
                    return $prices;
                }
            } catch (\Exception $e) {
                \Log::error('Failed to fetch crypto prices: ' . $e->getMessage());
            }
            
            // Return fallback prices if API fails
            return [
                'bitcoin' => 108000,
                'ethereum' => 3850,
                'binancecoin' => 680,
                'solana' => 165,
                'ripple' => 0.65,
                'cardano' => 0.48,
                'dogecoin' => 0.15,
                'matic-network' => 0.92
            ];
        });
    }
} 