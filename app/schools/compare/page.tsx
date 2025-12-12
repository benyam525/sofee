"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { SchoolRecord } from "@/types/schools";
import { schoolAverages } from "@/lib/schoolAverages";

function SchoolCompareContent() {
  const searchParams = useSearchParams();
  const [zip, setZip] = useState(searchParams.get("zip") || "75007");
  const [level, setLevel] = useState(searchParams.get("level") || "All");
  const [year] = useState(2024);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolRecord | null>(null);
  const [hoveredSchool, setHoveredSchool] = useState<SchoolRecord | null>(null);

  const DFW_ZIPS = [
    // Frisco
    "75034", "75035",
    // Allen
    "75002", "75013",
    // McKinney
    "75069", "75070", "75071", "75072",
    // Plano
    "75023", "75024", "75025", "75074", "75075", "75093",
    // Prosper
    "75078",
    // Celina
    "75009",
    // Flower Mound
    "75022", "75028",
    // Southlake
    "76092",
    // Colleyville
    "76034",
    // Carrollton
    "75006", "75007", "75010",
    // Coppell
    "75019",
    // Grand Prairie
    "75052",
    // Richardson
    "75080", "75081", "75082",
    // Irving
    "75038", "75039", "75062",
    // Farmers Branch
    "75234", "75244",
    // Lewisville
    "75067", "75077",
  ];

  useEffect(() => {
    fetch("/data/schools_normalized.json")
      .then((res) => res.json())
      .then((data: SchoolRecord[]) => {
        const filtered = data.filter((s) => {
          if (s.zip !== zip) return false;
          if (level !== "All" && s.level !== level) return false;
          if (s.year !== year) return false;
          return s.staarMathProficiency != null && s.staarReadingProficiency != null;
        });
        setSchools(filtered);
      });
  }, [zip, level, year]);

  const districtId = schools[0]?.districtId;
  const districtAvg = districtId ? schoolAverages.districts[districtId] : null;
  const stateAvg = schoolAverages.state;

  const minX = 0.4, maxX = 1.0;
  const minY = 0.4, maxY = 1.0;
  const width = 600, height = 400;
  const padding = 60;

  const toX = (reading: number) => padding + ((reading - minX) / (maxX - minX)) * (width - 2 * padding);
  const toY = (math: number) => height - padding - ((math - minY) / (maxY - minY)) * (height - 2 * padding);

  const ratingColors: Record<string, string> = {
    A: "#10b981", // green
    B: "#3b82f6", // blue
    C: "#f59e0b", // orange
    D: "#ef4444", // red
    F: "#991b1b"  // dark red
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2">School Comparison</h1>
        <p className="text-gray-600 mb-8">Compare school performance across DFW neighborhoods</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <Label className="text-sm text-gray-600 mb-2 block">ZIP Code</Label>
            <select
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {DFW_ZIPS.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-sm text-gray-600 mb-2 block">School Level</Label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="All">All Levels</option>
              <option value="ES">Elementary (ES)</option>
              <option value="MS">Middle School (MS)</option>
              <option value="HS">High School (HS)</option>
            </select>
          </div>

          <div>
            <Label className="text-sm text-gray-600 mb-2 block">Year</Label>
            <select
              value={year}
              disabled
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
            >
              <option value={2024}>2024</option>
            </select>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Math vs Reading Proficiency</CardTitle>
            <CardDescription>
              {schools.length} school{schools.length !== 1 ? "s" : ""} in ZIP {zip}
              {districtAvg && ` (${districtAvg.name})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <svg width={width} height={height} className="border border-gray-200 rounded-lg">
                {/* Grid lines */}
                {[0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((v) => (
                  <g key={`grid-${v}`}>
                    <line
                      x1={toX(v)}
                      y1={padding}
                      x2={toX(v)}
                      y2={height - padding}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                    <line
                      x1={padding}
                      y1={toY(v)}
                      x2={width - padding}
                      y2={toY(v)}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* State average reference line */}
                <line
                  x1={padding}
                  y1={toY(stateAvg.math)}
                  x2={width - padding}
                  y2={toY(stateAvg.math)}
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <line
                  x1={toX(stateAvg.reading)}
                  y1={padding}
                  x2={toX(stateAvg.reading)}
                  y2={height - padding}
                  stroke="#9ca3af"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* District average reference line */}
                {districtAvg && (
                  <>
                    <line
                      x1={padding}
                      y1={toY(districtAvg.math)}
                      x2={width - padding}
                      y2={toY(districtAvg.math)}
                      stroke="#6366f1"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1={toX(districtAvg.reading)}
                      y1={padding}
                      x2={toX(districtAvg.reading)}
                      y2={height - padding}
                      stroke="#6366f1"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </>
                )}

                {/* School dots */}
                {schools.map((school) => {
                  const x = toX(school.staarReadingProficiency!);
                  const y = toY(school.staarMathProficiency!);
                  const color = ratingColors[school.accountabilityRating || ""] || "#6b7280";
                  
                  return (
                    <circle
                      key={school.campusId}
                      cx={x}
                      cy={y}
                      r={8}
                      fill={color}
                      opacity={0.7}
                      className="cursor-pointer hover:opacity-100 transition-opacity"
                      onMouseEnter={() => setHoveredSchool(school)}
                      onMouseLeave={() => setHoveredSchool(null)}
                      onClick={() => setSelectedSchool(school)}
                    />
                  );
                })}

                {/* Axes */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#374151" strokeWidth="2" />
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#374151" strokeWidth="2" />

                {/* Axis labels */}
                <text x={width / 2} y={height - 20} textAnchor="middle" className="text-sm fill-gray-700">
                  Reading Proficiency
                </text>
                <text
                  x={20}
                  y={height / 2}
                  textAnchor="middle"
                  transform={`rotate(-90, 20, ${height / 2})`}
                  className="text-sm fill-gray-700"
                >
                  Math Proficiency
                </text>

                {/* Tick labels */}
                {[0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map((v) => (
                  <g key={`label-${v}`}>
                    <text x={toX(v)} y={height - padding + 20} textAnchor="middle" className="text-xs fill-gray-600">
                      {Math.round(v * 100)}%
                    </text>
                    <text x={padding - 10} y={toY(v) + 4} textAnchor="end" className="text-xs fill-gray-600">
                      {Math.round(v * 100)}%
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Tooltip */}
            {hoveredSchool && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="font-medium">{hoveredSchool.name}</p>
                <p className="text-sm text-gray-600">Campus ID: {hoveredSchool.campusId}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span>Math: {Math.round(hoveredSchool.staarMathProficiency! * 100)}%</span>
                  <span>Reading: {Math.round(hoveredSchool.staarReadingProficiency! * 100)}%</span>
                  <span>Rating: {hoveredSchool.accountabilityRating || "N/A"}</span>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#10b981]" />
                <span>A-Rated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#3b82f6]" />
                <span>B-Rated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#f59e0b]" />
                <span>C-Rated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-gray-400" style={{ width: "20px" }} />
                <span>State Avg</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-[#6366f1]" style={{ width: "20px" }} />
                <span>District Avg</span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic">
                Source: TEA TAPR. Some metrics updated annually; figures shown are latest available.
              </p>
            </div>
          </CardContent>
        </Card>

        {selectedSchool && selectedSchool.history && selectedSchool.history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedSchool.name} - 5-Year Trends</CardTitle>
              <CardDescription>Historical performance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Math Trend */}
                <div>
                  <p className="text-sm font-medium mb-2">Math Proficiency</p>
                  <svg width={250} height={80} className="border border-gray-200 rounded">
                    {selectedSchool.history.map((h, i) => {
                      if (!h.staarMathProficiency || i === selectedSchool.history!.length - 1) return null;
                      const next = selectedSchool.history![i + 1];
                      if (!next.staarMathProficiency) return null;
                      
                      const x1 = 20 + (i * 40);
                      const x2 = 20 + ((i + 1) * 40);
                      const y1 = 60 - (h.staarMathProficiency * 50);
                      const y2 = 60 - (next.staarMathProficiency * 50);
                      
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#3b82f6"
                          strokeWidth="2"
                        />
                      );
                    })}
                    {selectedSchool.history.map((h, i) => {
                      if (!h.staarMathProficiency) return null;
                      const x = 20 + (i * 40);
                      const y = 60 - (h.staarMathProficiency * 50);
                      return (
                        <circle key={i} cx={x} cy={y} r={3} fill="#3b82f6" />
                      );
                    })}
                  </svg>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    {selectedSchool.history.map((h) => (
                      <span key={h.year}>{h.year}</span>
                    ))}
                  </div>
                </div>

                {/* Reading Trend */}
                <div>
                  <p className="text-sm font-medium mb-2">Reading Proficiency</p>
                  <svg width={250} height={80} className="border border-gray-200 rounded">
                    {selectedSchool.history.map((h, i) => {
                      if (!h.staarReadingProficiency || i === selectedSchool.history!.length - 1) return null;
                      const next = selectedSchool.history![i + 1];
                      if (!next.staarReadingProficiency) return null;
                      
                      const x1 = 20 + (i * 40);
                      const x2 = 20 + ((i + 1) * 40);
                      const y1 = 60 - (h.staarReadingProficiency * 50);
                      const y2 = 60 - (next.staarReadingProficiency * 50);
                      
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#10b981"
                          strokeWidth="2"
                        />
                      );
                    })}
                    {selectedSchool.history.map((h, i) => {
                      if (!h.staarReadingProficiency) return null;
                      const x = 20 + (i * 40);
                      const y = 60 - (h.staarReadingProficiency * 50);
                      return (
                        <circle key={i} cx={x} cy={y} r={3} fill="#10b981" />
                      );
                    })}
                  </svg>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    {selectedSchool.history.map((h) => (
                      <span key={h.year}>{h.year}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Disclaimer for trends section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 italic">
                  Source: TEA TAPR. Some metrics updated annually; figures shown are latest available.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function SchoolComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white p-6">Loading...</div>}>
      <SchoolCompareContent />
    </Suspense>
  );
}
