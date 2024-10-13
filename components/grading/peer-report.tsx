"use client";
import React, { useState, useEffect } from "react";

interface PeerScore {
  scoredGroupId: string;
  scoreValue: number | "";
}

interface PeerScoresFormProps {
  courseId: string;
  onSuccess: () => void;
}

const PeerScoresForm: React.FC<PeerScoresFormProps> = ({
  courseId,
  onSuccess,
}) => {
  const [peerScores, setPeerScores] = useState<PeerScore[]>([]);
  const [userGroupId, setUserGroupId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch peer scores and user group ID
  useEffect(() => {
    if (courseId) {
      const fetchPeerScores = async () => {
        setLoading(true);
        try {
          const response = await fetch(
            `/api/grading/peer-report?courseId=${courseId}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await response.json();
          setPeerScores(data.peerScores || []);
          setUserGroupId(data.userGroupId || "");
        } catch (error) {
          console.error("Error fetching peer scores:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchPeerScores();
    }
  }, [courseId]);

  // Handle score change
  const handleScoreChange = (index: number, value: string) => {
    const updatedScores = [...peerScores];
    updatedScores[index].scoreValue = value === "" ? "" : Number(value);
    setPeerScores(updatedScores);
  };

  // Handle form submission
  const handleSubmit = async () => {
    const formattedScores = peerScores.map((score) => ({
      courseId,
      scorerGroupId: userGroupId,
      scoredGroupId: score.scoredGroupId,
      scoreValue: Number(score.scoreValue),
    }));

    try {
      const response = await fetch("/api/grading/peer-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ peerScores: formattedScores }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Peer scores submitted successfully!");
        onSuccess();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error submitting peer scores:", error);
      alert("An error occurred while submitting peer scores.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8 pb-20">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Assign Peer Scores
        </h1>

        <div className="flex flex-col gap-4">
          {peerScores.map((score, index) => (
            <div
              key={score.scoredGroupId}
              className="p-4 border rounded-lg bg-white dark:bg-gray-800 flex"
            >
              <label className="flex items-center justify-between w-full">
                <span>Score for Group {score.scoredGroupId}:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={score.scoreValue !== "" ? score.scoreValue : ""}
                  onChange={(e) => handleScoreChange(index, e.target.value)}
                  className="ml-2 w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50 dark:bg-gray-700"
                />
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Submit Peer Scores
          </button>
        </div>
      </div>
    </div>
  );
};

export default PeerScoresForm;
