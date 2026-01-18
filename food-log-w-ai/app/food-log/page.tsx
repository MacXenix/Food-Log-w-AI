"use client";
import { Spinner } from "@/components/spinner";
import { useMutation } from "@tanstack/react-query";
import { Dynalight } from "next/font/google";
import React from "react";

interface MealPlanInput {
  dietType: string;
  calories: number;
  allergies: string;
  cuisine: string;
  snacks: string;
  days: number;
}
interface DailyMealPlan {
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  Snacks?: string;
}
interface WeeklyMealPlan {
  [day: string]: DailyMealPlan;
}
interface MealPlanResponse {
  mealplan?: WeeklyMealPlan;
  error?: string;
}

async function generateMealPlan(payload: MealPlanInput) {
  const response = await fetch("/api/generate-mealplan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export default function FoodLogDashboard() {
  const { mutate, isPending, data, isSuccess } = useMutation<
    MealPlanResponse,
    Error,
    MealPlanInput
  >({
    mutationFn: generateMealPlan,
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const payload: MealPlanInput = {
      dietType: formData.get("dietType")?.toString() || "",
      calories: Number(formData.get("calories")) || 2000,
      allergies: formData.get("allergies")?.toString() || "",
      cuisine: formData.get("cuisine")?.toString() || "",
      snacks: formData.get("snacks")?.toString() || "",
      days: 7,
    };

    mutate(payload);
  }

  const daysOfTheWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const getMealPlanForDay = (day: string): DailyMealPlan | undefined => {
    if (!data?.mealplan) return undefined;
    return data?.mealplan[day];
  };

  if (data) {
    console.log(data);
  }

  return (
    <div className="min-h-screen bg-[#37375e] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl transition-all overflow-hidden">
        {/* Header Section */}
        <div className="bg-[#356288] p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
              AI Food Log
            </h1>
            <p className="text-[#aacfdd] text-lg font-medium">
              Meal Planner Generator
            </p>
          </div>
          {/* Decorative circle in background */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#aacfdd] rounded-full opacity-20 blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#fe875d] rounded-full opacity-20 blur-xl"></div>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Diet Type */}
              <div className="space-y-2">
                <label
                  htmlFor="dietType"
                  className="text-sm font-bold text-[#37375e] uppercase tracking-wider"
                >
                  Diet Type
                </label>
                <input
                  type="text"
                  id="dietType"
                  name="dietType"
                  required
                  placeholder="e.g. Vegetarian, Keto..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#aacfdd] text-[#37375e] placeholder-[#356288]/40 focus:border-[#fe875d] focus:ring-4 focus:ring-[#fe875d]/10 outline-none transition-all duration-200 bg-gray-50"
                />
              </div>

              {/* Calories */}
              <div className="space-y-2">
                <label
                  htmlFor="calories"
                  className="text-sm font-bold text-[#37375e] uppercase tracking-wider"
                >
                  Calorie Goal
                </label>
                <input
                  type="number"
                  id="calories"
                  name="calories"
                  required
                  min={500}
                  max={15000}
                  placeholder="e.g. 2000"
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#aacfdd] text-[#37375e] placeholder-[#356288]/40 focus:border-[#fe875d] focus:ring-4 focus:ring-[#fe875d]/10 outline-none transition-all duration-200 bg-gray-50"
                />
              </div>

              {/* Allergies */}
              <div className="space-y-2">
                <label
                  htmlFor="allergies"
                  className="text-sm font-bold text-[#37375e] uppercase tracking-wider"
                >
                  Allergies
                </label>
                <input
                  type="text"
                  id="allergies"
                  name="allergies"
                  required
                  placeholder="e.g. Nuts, Dairy..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#aacfdd] text-[#37375e] placeholder-[#356288]/40 focus:border-[#fe875d] focus:ring-4 focus:ring-[#fe875d]/10 outline-none transition-all duration-200 bg-gray-50"
                />
              </div>

              {/* Cuisine */}
              <div className="space-y-2">
                <label
                  htmlFor="cuisine"
                  className="text-sm font-bold text-[#37375e] uppercase tracking-wider"
                >
                  Cuisine
                </label>
                <input
                  type="text"
                  id="cuisine"
                  name="cuisine"
                  required
                  placeholder="e.g. Italian..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#aacfdd] text-[#37375e] placeholder-[#356288]/40 focus:border-[#fe875d] focus:ring-4 focus:ring-[#fe875d]/10 outline-none transition-all duration-200 bg-gray-50"
                />
              </div>
            </div>

            {/* Snacks Checkbox - Styled as a card */}
            <div className="relative flex items-start">
              <div className="flex items-center h-6">
                <input
                  id="snacks"
                  name="snacks"
                  type="checkbox"
                  className="h-5 w-5 rounded border-[#aacfdd] text-[#fe875d] focus:ring-[#fe875d] accent-[#fe875d] cursor-pointer"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label
                  htmlFor="snacks"
                  className="font-medium text-[#37375e] cursor-pointer"
                >
                  Include Snacks
                </label>
                <p className="text-[#356288] text-xs">
                  We will distribute your calories across 3 meals and 2 snacks.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-[#fe875d] text-white font-bold text-lg py-4 px-8 rounded-xl shadow-lg shadow-[#fe875d]/30 hover:bg-[#fe1100] hover:shadow-[#fe1100]/40 transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300 ease-in-out"
              >
                {isPending ? "Generating..." : "Generate Meal Plan"}
              </button>
            </div>
          </form>
        </div>

        {/* Results Section Placeholder */}
        <div className="bg-[#f8fafc] border-t-2 border-[#aacfdd]/30 p-8">
          <h2 className="text-2xl font-bold text-[#37375e] mb-4 flex items-center gap-2">
            <span className="w-2 h-8 bg-[#fe875d] rounded-full inline-block"></span>
            Weekly Meal Plan
          </h2>

          <div className="p-8 border-2 border-dashed border-[#5dc7ed] rounded-xl text-center text-[#356288]">
            {data?.mealplan && isSuccess ? (
              <div className="space-y-6">
                {daysOfTheWeek.map((day) => {
                  const dailyMeals = getMealPlanForDay(day);

                  if (!dailyMeals) return null;
                  return (
                    <div
                      key={day}
                      className="bg-white p-6 rounded-xl shadow-sm border border-[#aacfdd]/50 hover:shadow-md transition-shadow duration-200"
                    >
                      <h3 className="text-xl font-bold text-[#356288] mb-4 pb-2 border-gray-100">
                        {day}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/*Breakfast  */}
                        {dailyMeals.Breakfast && (
                          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                            <span className="text-xs font-bold text-[#fe875d] uppercase tracking-wider block mb-1">
                              Breakfast
                            </span>
                            <p className="text-[#37375e] text-sm font-medium">
                              {dailyMeals.Breakfast}
                            </p>
                          </div>
                        )}
                        {/*Lunch  */}
                        {dailyMeals.Lunch && (
                          <div className="bg-orange-50 p-3 rounded-lg border border-blue-100">
                            <span className="text-xs font-bold text-[#356288] uppercase tracking-wider block mb-1">
                              Breakfast
                            </span>
                            <p className="text-[#37375e] text-sm font-medium">
                              {dailyMeals.Lunch}
                            </p>
                          </div>
                        )}
                        {/*Dinner  */}
                        {dailyMeals.Dinner && (
                          <div className="bg-orange-50 p-3 rounded-lg border border-indigo-100">
                            <span className="text-xs font-bold text-[#37375e] uppercase tracking-wider block mb-1">
                              Breakfast
                            </span>
                            <p className="text-[#37375e] text-sm font-medium">
                              {dailyMeals.Dinner}
                            </p>
                          </div>
                        )}
                        {/*Snacks  */}
                        {dailyMeals.Snacks && (
                          <div className="bg-orange-50 p-3 rounded-lg border border-green-100">
                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider block mb-1">
                              Snacks
                            </span>
                            <p className="text-[#37375e] text-sm font-medium">
                              {dailyMeals.Snacks}
                            </p>
                          </div>
                        )}
                        
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : isPending ? (
              <div className="p-12 border-2 border-dashed border-[#aacfdd] rounded-xl flex flex-col items-center justify-center text-center gap-4">
                <Spinner className="h-10 w-10 animate-spin text-[#fe875d]" />
                <p className="text-[#356288] font-medium">
                  Curating your menu... This might take a moment.{" "}
                </p>
              </div>
            ) : (
              <p>Fill out the form above to generate our plan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
