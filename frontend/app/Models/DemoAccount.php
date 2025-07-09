<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemoAccount extends Model
{
    protected $fillable = [
        'user_id',
        'balance',
        'holdings',
        'trades',
    ];
}
