<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InvestmentPlan;

class InvestmentPlanController extends Controller
{
    // List all investment plans (public)
    public function index()
    {
        return response()->json(InvestmentPlan::all());
    }

    // Create a new investment plan (admin only)
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'min_amount' => 'required|numeric',
            'max_amount' => 'nullable|numeric',
            'interest_rate' => 'required|numeric',
            'duration_days' => 'required|integer',
        ]);
        $plan = InvestmentPlan::create($data);
        return response()->json($plan, 201);
    }

    // Update an investment plan (admin only)
    public function update(Request $request, $id)
    {
        $plan = InvestmentPlan::find($id);
        if (!$plan) {
            return response()->json(['message' => 'Not found'], 404);
        }
        $data = $request->validate([
            'name' => 'sometimes|required|string',
            'description' => 'nullable|string',
            'min_amount' => 'sometimes|required|numeric',
            'max_amount' => 'nullable|numeric',
            'interest_rate' => 'sometimes|required|numeric',
            'duration_days' => 'sometimes|required|integer',
        ]);
        $plan->update($data);
        return response()->json($plan);
    }

    // Delete an investment plan (admin only)
    public function destroy($id)
    {
        $plan = InvestmentPlan::find($id);
        if (!$plan) {
            return response()->json(['message' => 'Not found'], 404);
        }
        $plan->delete();
        return response()->json(['message' => 'Deleted']);
    }
} 