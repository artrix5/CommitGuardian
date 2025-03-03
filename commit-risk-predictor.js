// commit-risk-predictor.js
// Commit risk prediction service

/**
 * Predicts commit risk using backend AI service
 * @param {string} commitId - The commit ID to analyze
 * @returns {Promise<Object>} - Promise resolving to risk prediction results
 */
async function predictCommitRisk(commitId) {
    try {
        // Call the backend analyze endpoint
        const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ commitId: commitId })
        });

        // Check if the response is successful
        if (!response.ok) {
            // Handle not found or other errors
            if (response.status === 404) {
                return {
                    commitId: commitId,
                    risk_score: 0.00,
                    risk_level: "Not Found",
                    commitData: null,
                    riskFactors: [],
                    recommendations: ["Commit ID not found in the repository."]
                };
            }

            // For other errors
            throw new Error('Failed to fetch commit analysis');
        }

        // Parse the response
        const data = await response.json();

        // Return the parsed data
        return {
            commitId: data.commitId,
            risk_score: data.risk_score,
            risk_level: data.risk_level,
            commitData: data.commitData,
            riskFactors: data.riskFactors,
            recommendations: data.recommendations
        };
    } catch (error) {
        console.error("Error analyzing commit:", error);
        
        // Fallback error response
        return {
            commitId: commitId,
            risk_score: 0.00,
            risk_level: "Error",
            commitData: null,
            riskFactors: [],
            recommendations: ["Unable to analyze commit. Please try again later."]
        };
    }
}

/**
 * Generates recommendations based on the prediction
 * @param {Object} prediction - Commit risk prediction
 * @param {Object} commitData - Original commit data
 * @returns {Array<string>} - List of recommendations
 */
function generateRecommendations(prediction, commitData) {
    // If prediction already has recommendations, return those
    if (prediction.recommendations && prediction.recommendations.length > 0) {
        return prediction.recommendations;
    }

    // Fallback recommendations based on risk level
    if (prediction.risk_level === "High") {
        return [
            "This commit appears to be high risk.",
            "Conduct a thorough code review before merging.",
            "Consider breaking down the changes into smaller, more manageable commits."
        ];
    } else if (prediction.risk_level === "Medium") {
        return [
            "This commit requires careful review.",
            "Ensure comprehensive testing is performed.",
            "Verify that all changes align with project standards."
        ];
    } else if (prediction.risk_level === "Low") {
        return [
            "This commit appears to be low risk.",
            "Standard review process recommended."
        ];
    }

    // Default recommendations for unknown scenarios
    return ["No specific recommendations available."];
}

// Export the functions for use in other scripts
export { predictCommitRisk, generateRecommendations };