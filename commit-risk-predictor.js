// commit-risk-predictor.js

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
                risk_level: response.risk_level ? response.risk_level[0] : determineRiskLevel(parseFloat(response.risk_score[0])),
                original_data: commitData
            };
        }         else if (response.prediction && Array.isArray(response.prediction)) {
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
 * Determines risk level based on score
 * @param {number} score - Risk score
 * @returns {string} - Risk level (Low, Medium, High)
 */
function determineRiskLevel(score) {
    if (score >= 70) return "High";
    if (score >= 40) return "Medium";
    return "Low";
}

/**
 * Transforms commit data into the format expected by the Azure ML model
 * @param {Object} commitData - Raw commit data
 * @returns {Object} - Data formatted for the ML model
 */
function transformCommitData(commitData) {
    // Get day of week as string
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDate = new Date();
    const dayOfWeek = days[currentDate.getDay()];
    
    // Use commit repo name if available, otherwise fall back to repo
    const repository = commitData.repository || commitData.repo || "unknown";
    
    // Format the data to match your training dataset
    return {
        input_data: {
            columns: [
                "author_experience",
                "repository",
                "caused_TR",
                "problematic_integration",
                "lines_added",
                "lines_deleted",
                "files_changed",
                "programming_language",
                "multiple_languages",
                "num_reviewers",
                "num_comments",
                "num_unresolved_comments",
                "num_patchsets",
                "reviewer_experience",
                "past_TRs",
                "active_TRs",
                "critical_TRs",
                "ci_cd_status",
                "hour",
                "day_of_week",
                "time_since_last_commit",
                "test_coverage",
                "documentation_changes"
            ],
            index: [0],
            data: [
                [
                    commitData.author_experience || 1, // Author experience (default: 1)
                    repository, // Repository name
                    commitData.caused_TR || 0, // Default to 0 (not caused TR)
                    commitData.problematic_integration || 0, // Default to 0 (not problematic)
                    commitData.lines_added || commitData.insertions || 0, // Lines added
                    commitData.lines_deleted || commitData.deletions || 0, // Lines deleted
                    commitData.files_changed || 0, // Files changed
                    commitData.programming_language || "Unknown", // Programming language
                    commitData.multiple_languages || 0, // Multiple languages (default: 0)
                    commitData.num_reviewers || commitData.reviewers_count || 1, // Number of reviewers
                    commitData.num_comments || commitData.comments_count || 0, // Number of comments
                    commitData.num_unresolved_comments || commitData.unresolved_comments || 0, // Number of unresolved comments
                    commitData.num_patchsets || commitData.patchsets_count || 1, // Number of patchsets
                    commitData.reviewer_experience || 1, // Reviewer experience (default: 1)
                    commitData.past_TRs || getPastTRsCount(repository), // Past TRs count
                    commitData.active_TRs || getActiveTRsCount(repository), // Active TRs count
                    commitData.critical_TRs || getCriticalTRsCount(repository), // Critical TRs count
                    commitData.ci_cd_status || "passing", // CI/CD status (default: passing)
                    currentDate.getHours(), // Current hour
                    dayOfWeek, // Current day of week as string
                    commitData.time_since_last_commit || 48, // Time since last commit (default: 48h)
                    commitData.test_coverage || 50, // Test coverage (default: 50%)
                    commitData.documentation_changes || 0 // Documentation changes (default: 0)
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
        console.log("Sending ML Model Input:", JSON.stringify(modelInput, null, 2));
        
        const response = await fetch('/api/azure-ml-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: modelInput  // Only send the model input
            })
        });
        
        // Log the raw response
        const responseText = await response.text();
        console.log("Raw Response:", responseText);
        
        if (!response.ok) {
            console.error("Response not OK:", response.status, responseText);
            throw new Error(`Proxy API returned status ${response.status}`);
        }
        
        const result = JSON.parse(responseText);
        return result;
    } catch (error) {
        console.error("Complete Azure ML Endpoint Error:", error);
        throw error;
    }
}

/**
 * Fallback risk calculation if Azure ML endpoint fails
 * @param {Object} commitData - Raw commit data
 * @returns {Object} - Risk assessment
 */
function calculateFallbackRiskScore(commitData) {
    // Base risk score
    let riskScore = 0;
    
    // Get commit data with defaults
    const authorExperience = commitData.author_experience || 1; // Default to junior
    const repo = commitData.repo || "unknown";
    const linesAdded = commitData.insertions || 0;
    const linesDeleted = commitData.deletions || 0;
    const filesChanged = commitData.files_changed || 0;
    const unresolvedComments = commitData.unresolved_comments || 0;
    const numReviewers = commitData.reviewers_count || 1;
    const programmingLanguage = commitData.programming_language || "Unknown";
    const multipleLanguages = commitData.multiple_languages || 0;
    const numPatchsets = commitData.patchsets_count || 1;
    const reviewerExperience = commitData.reviewer_experience || 1;
    const testCoverage = commitData.test_coverage || 50;
    const docChanges = commitData.documentation_changes || 0;
    const ciCdStatus = commitData.ci_cd_status || "passing";
    
    // Get current time data
    const now = new Date();
    const hour = now.getHours();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = days[now.getDay()];
    
    // 1. Author Experience
    if (authorExperience === 1) {
        riskScore += 7.5; // Junior developer (5-10)
    } else if (authorExperience === 2) {
        riskScore += 4.5; // Mid-level developer (2-7)
    } else if (authorExperience === 3) {
        riskScore += 1.5; // Senior developer (0-3)
    }
    
    // 2. Repository Risk
    if (repo === "payment-gateway" || repo === "auth-service") {
        riskScore += 5.5; // Critical repositories (3-8)
    }
    
    // 3. Code Metrics
    if (linesAdded > 200) {
        riskScore += 5.5; // Large additions (3-8)
    }
    if (linesDeleted > 100) {
        riskScore += 5.5; // Large deletions (3-8)
    }
    if (filesChanged > 10) {
        riskScore += 5.5; // Many files changed (3-8)
    }
    if (multipleLanguages === 1) {
        riskScore += 3.5; // Multiple languages (2-5)
    }
    
    // 4. Programming Language Risk
    if (["C", "C++", "Erlang"].includes(programmingLanguage)) {
        riskScore += 10; // Higher risk languages (5-15)
    }
    
    // 5. Collaboration Insights
    if (numReviewers < 2) {
        riskScore += 4.5; // Few reviewers (3-6)
    }
    if (unresolvedComments > 0) {
        riskScore += 5; // Unresolved comments (3-7)
    }
    
    // 6. Day/Time Risk
    if (dayOfWeek === "Monday" || dayOfWeek === "Friday") {
        riskScore += 7.5; // Risky days (5-10)
    } else if (dayOfWeek === "Saturday" || dayOfWeek === "Sunday") {
        riskScore += 9.5; // Weekend (7-12)
    }
    
    // 7. Hour Risk
    if (hour < 7 || hour >= 17) {
        riskScore += 7.5; // After hours (5-10)
    }
    
    // 8. High Number of Patchsets
    if (numPatchsets > 5) {
        riskScore += 7.5; // Many patchsets (5-10)
    }
    
    // 9. More Lines Deleted Than Added
    if (linesDeleted > linesAdded) {
        riskScore += 7.5; // More deletions than additions (5-10)
    }
    
    // 10. Test Coverage
    if (testCoverage < 50) {
        riskScore += 7.5; // Low test coverage (5-10)
    }
    
    // Cap the risk score (0-100)
    riskScore = Math.max(0, Math.min(100, riskScore));
    
    // Round to 2 decimal places
    riskScore = Math.round(riskScore * 100) / 100;
    
    // Get risk level (aligned with your thresholds)
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
 * Gets past TR count for a repository
 * @param {string} repo - Repository name
 * @returns {number} - Count of past TRs
 */
function getPastTRsCount(repo) {
    try {
        // Check if we have TR data for this repo
        if (window.troubleshootingReports && window.troubleshootingReports[repo]) {
            return window.troubleshootingReports[repo].length;
        }
        return 5; // Default value
    } catch (error) {
        console.error("Error getting past TR count:", error);
        return 5; // Default value
    }
}

/**
 * Gets active TR count for a repository
 * @param {string} repo - Repository name
 * @returns {number} - Count of active TRs
 */
function getActiveTRsCount(repo) {
    try {
        // Check if we have TR data for this repo
        if (window.troubleshootingReports && window.troubleshootingReports[repo]) {
            return window.troubleshootingReports[repo]
                .filter(tr => tr.status !== "Resolved")
                .length;
        }
        return 2; // Default value
    } catch (error) {
        console.error("Error getting active TR count:", error);
        return 2; // Default value
    }
}

/**
 * Gets critical TR count for a repository
 * @param {string} repo - Repository name
 * @returns {number} - Count of critical TRs
 */
function getCriticalTRsCount(repo) {
    try {
        // Check if we have TR data for this repo
        if (window.troubleshootingReports && window.troubleshootingReports[repo]) {
            return window.troubleshootingReports[repo]
                .filter(tr => tr.priority === "Critical")
                .length;
        }
        return 1; // Default value
    } catch (error) {
        console.error("Error getting critical TR count:", error);
        return 1; // Default value
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
    const unresolvedComments = commitData.unresolved_comments || 0;
    
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
    
    if (unresolvedComments > 0) {
        recommendations.push(`Resolve the ${unresolvedComments} unresolved comment(s) before merging`);
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