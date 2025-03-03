// commit-risk-predictor.js
// Azure ML integration for commit risk prediction

// Azure ML endpoint configuration
const config = {
    modelEndpoint: "https://proteusai-vejyq.swedencentral.inference.ml.azure.com/score", // Replace with your actual endpoint
    apiKey: "AXWEflWBaOieqKmFD2VMVxwCSlQzt8iYgv7q0GJvnNnpIAMMh1o4JQQJ99BCAAAAAAAAAAAAINFRAZML2YCc", // Replace with your actual API key
    requestTimeout: 10000 // 10 seconds timeout
};

/**
 * Predicts commit risk using Azure ML model
 * @param {Object} commitData - The commit data to analyze
 * @returns {Promise<Object>} - Promise resolving to risk prediction results
 */
async function predictCommitRisk(commitData) {
    try {
        // Transform commit data into the format expected by the model
        const modelInput = transformCommitData(commitData);
        
        // Call Azure ML endpoint via proxy
        const response = await callAzureMLEndpoint(modelInput);
        
        console.log("Azure ML response:", response);
        
        // Handle array response format (what your model is returning)
        if (Array.isArray(response)) {
            const score = parseFloat(response[0]);
            let level = "Low";
            if (score >= 70) level = "High";
            else if (score >= 40) level = "Medium";
            
            return {
                risk_score: score,
                risk_level: level,
                original_data: commitData
            };
        }
        // Handle object response formats
        else if (response.risk_score && Array.isArray(response.risk_score)) {
            return {
                risk_score: parseFloat(response.risk_score[0]),
                risk_level: response.risk_level[0],
                original_data: commitData
            };
        } else if (response.prediction && Array.isArray(response.prediction)) {
            const score = parseFloat(response.prediction[0]);
            let level = "Low";
            if (score >= 70) level = "High";
            else if (score >= 40) level = "Medium";
            
            return {
                risk_score: score,
                risk_level: level,
                original_data: commitData
            };
        } else {
            console.log("Unrecognized response format, using fallback:", response);
            return calculateFallbackRiskScore(commitData);
        }
    } catch (error) {
        console.error("Error predicting commit risk:", error);
        // Fallback to basic risk calculation in case of API failure
        return calculateFallbackRiskScore(commitData);
    }
}

/**
 * Transforms commit data into the format expected by the Azure ML model
 * @param {Object} commitData - Raw commit data
 * @returns {Object} - Data formatted for the ML model
 */
function transformCommitData(commitData) {
    // Format the data to match your successful test example
    return {
        input_data: {
            columns: [
                "commit_id",
                "repo",
                "lines_added",
                "lines_removed",
                "files_changed",
                "commit_timestamp",
                "commit_hour",
                "is_friday",
                "is_weekend",
                "after_hours",
                "unresolved_comments",
                "reviewers_count",
                "patchsets_count",
                "repo_trs_count",
                "unresolved_trs_count",
                "risk_level"
            ],
            index: [0],
            data: [
                [
                    commitData.hash || "unknown",
                    commitData.repo || "unknown",
                    commitData.insertions || 0,
                    commitData.deletions || 0,
                    commitData.files_changed || 0,
                    new Date().toISOString(),
                    new Date().getHours(),
                    new Date().getDay() === 5 ? 1 : 0, // Check if today is Friday
                    [0, 6].includes(new Date().getDay()) ? 1 : 0, // Check if weekend
                    (new Date().getHours() < 9 || new Date().getHours() > 17) ? 1 : 0,
                    commitData.unresolved_comments || 0,
                    commitData.reviewers_count || 1,
                    commitData.patchsets_count || 1,
                    getRepoTrsCount(commitData.repo),
                    getUnresolvedTrsCount(commitData.repo),
                    "" // Leave risk_level empty as this is what we're predicting
                ]
            ]
        }
    };
}

/**
 * Calls Azure ML endpoint with commit data
 * @param {Object} modelInput - Data formatted for the ML model
 * @returns {Promise<Object>} - Promise resolving to model prediction
 */
async function callAzureMLEndpoint(modelInput) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.requestTimeout);
        
        // Use the proxy endpoint instead of calling Azure ML directly
        const response = await fetch('/api/azure-ml-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                azureEndpoint: config.modelEndpoint,
                apiKey: config.apiKey,
                data: modelInput
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Proxy error:", errorText);
            throw new Error(`Proxy API returned status ${response.status}: ${errorText}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout when calling Azure ML endpoint');
        }
        throw error;
    }
}

/**
 * Fallback risk calculation if Azure ML endpoint fails
 * @param {Object} commitData - Raw commit data
 * @returns {Object} - Risk assessment
 */
function calculateFallbackRiskScore(commitData) {
    // Base metrics - similar to your existing calculation
    const highRiskThreshold = 500;
    const filesHighRiskThreshold = 20;
    
    const totalChanges = (commitData.insertions || 0) + (commitData.deletions || 0);
    const filesChanged = commitData.files_changed || 0;
    
    // Calculate score components (0-100 scale)
    const changesScore = Math.min(100, (totalChanges / highRiskThreshold) * 75);
    const filesScore = Math.min(100, (filesChanged / filesHighRiskThreshold) * 25);
    
    // Combined weighted score
    const riskScore = Math.round((changesScore * 0.7 + filesScore * 0.3) * 100) / 100;
    
    // Get risk level
    let riskLevel = "Low";
    if (riskScore >= 70) riskLevel = "High";
    else if (riskScore >= 40) riskLevel = "Medium";
    
    return {
        risk_score: riskScore,
        risk_level: riskLevel,
        original_data: commitData,
        is_fallback: true
    };
}

/**
 * Gets number of TRs for a repository
 * @param {string} repo - Repository name
 * @returns {number} - Count of TRs
 */
function getRepoTrsCount(repo) {
    try {
        // Check if we have TR data for this repo
        if (window.troubleshootingReports && window.troubleshootingReports[repo]) {
            return window.troubleshootingReports[repo].length;
        }
        return 0;
    } catch (error) {
        console.error("Error getting repo TR count:", error);
        return 0;
    }
}

/**
 * Gets number of unresolved TRs for a repository
 * @param {string} repo - Repository name
 * @returns {number} - Count of unresolved TRs
 */
function getUnresolvedTrsCount(repo) {
    try {
        // Check if we have TR data for this repo
        if (window.troubleshootingReports && window.troubleshootingReports[repo]) {
            return window.troubleshootingReports[repo]
                .filter(tr => tr.status !== "Resolved")
                .length;
        }
        return 0;
    } catch (error) {
        console.error("Error getting unresolved TR count:", error);
        return 0;
    }
}

/**
 * Generates recommendations based on ML prediction
 * @param {Object} prediction - ML model prediction
 * @param {Object} commitData - Original commit data
 * @returns {Array<string>} - List of recommendations
 */
function generateRecommendations(prediction, commitData) {
    const recommendations = [];
    const riskLevel = prediction.risk_level;
    const filesChanged = commitData.files_changed || 0;
    const insertions = commitData.insertions || 0;
    const deletions = commitData.deletions || 0;
    
    // Base recommendations by risk level
    if (riskLevel === "High") {
        recommendations.push("Consider breaking this large commit into smaller, focused commits");
        recommendations.push("Add detailed documentation for this significant change");
        recommendations.push("Ensure comprehensive test coverage for these changes");
        recommendations.push("Request thorough code review from multiple team members");
    } else if (riskLevel === "Medium") {
        recommendations.push("Consider if this commit could be more focused");
        recommendations.push("Ensure adequate test coverage for these changes");
        recommendations.push("Request detailed code review");
    }
    
    // Additional contextual recommendations
    if (filesChanged > 10) {
        recommendations.push(`This commit touches ${filesChanged} files, which increases integration risk`);
    }
    
    if (deletions > insertions * 2) {
        recommendations.push("This commit removes significantly more code than it adds, ensure functionality is preserved");
    }
    
    if (insertions > deletions * 5) {
        recommendations.push("Large amount of new code added. Consider thorough code review and testing");
    }
    
    return recommendations;
}


// Export the functions for use in other scripts
export { predictCommitRisk, generateRecommendations };