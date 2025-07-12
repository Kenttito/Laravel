<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CryptoAddress extends Model
{
    protected $fillable = [
        'currency', 'address', 'user_id', 'label'
    ];
}
