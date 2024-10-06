"use client";

import React, { useState } from "react";

interface PeerScore {
  scoredGroupId: string;
  scoreValue: number | "";
}

interface PeerScoresFormProps {
  currentGroupId: string;
  courseId: string;
  studentId: string;
  onSuccess: () => void;
}

const PeerScoresForm: React.FC<PeerScoresFormProps> = ({
  currentGroupId,
  courseId,
  studentId,
  onSuccess,
}) => {
  const [peerScores, setPeerScores] = useState<PeerScore[]>([
    { scoredGroupId: "G2", scoreValue: "" },
    { scoredGroupId: "G3", scoreValue: "" },
    { scoredGroupId: "G4", scoreValue: "" },
    { scoredGroupId: "G5", scoreValue: "" },
  ]);

  const handleScoreChange = (index: number, value: string) => {
    const updatedScores = [...peerScores];
    updatedScores[index].scoreValue = value === "" ? "" : Number(value);
    setPeerScores(updatedScores);
  };

  const handleSubmit = async () => {
    // Validate scores
    for (const score of peerScores) {
      if (
        score.scoreValue === "" ||
        isNaN(Number(score.scoreValue)) ||
        Number(score.scoreValue) < 0 ||
        Number(score.scoreValue) > 100
      ) {
        alert("Please enter valid scores between 0 and 100 for all groups.");
        return;
      }
    }

    // Prepare data for submission
    const formattedScores = peerScores.map((score) => ({
      courseId,
      scorerGroupId: currentGroupId,
      scoredGroupId: score.scoredGroupId,
      studentId,
      scoreValue: Number(score.scoreValue),
    }));

    try {
      const response = await fetch("/api/grading/peer-scores/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ peerScores: formattedScores }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Peer scores submitted successfully!");
        onSuccess(); // Callback to refresh data or close modal
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error submitting peer scores:", error);
      alert("An error occurred while submitting peer scores.");
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Assign Peer Scores</h3>
      {peerScores.map((score, index) => (
        <div key={score.scoredGroupId} className="mb-2">
          <label className="flex items-center">
            Score for Group {score.scoredGroupId}:
            <input
              type="number"
              min="0"
              max="100"
              value={score.scoreValue}
              onChange={(e) => handleScoreChange(index, e.target.value)}
              className="ml-2 w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </label>
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Submit Peer Scores
      </button>
    </div>
  );
};

export default PeerScoresForm;