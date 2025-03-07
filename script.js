import mockCommits  from '../mock_data/mock_commits.js';
import mockComments from './mock_data/mock_comments.js';

import mockPatchSets  from '../mock_data/mock_patch_sets.js';
import mockTestRuns  from '../mock_data/mock_test_runs.js';
import mockTroubleshootingReports from '../mock_data/mock_troubleshooting_reports.js';
import mockMergedCommits from '../mock_data/mock_merged_commits.js';
import { predictCommitRisk, generateRecommendations } from '../commit-risk-predictor.js';

// Make troubleshooting reports available globally for our ML predictor
window.troubleshootingReports = mockTroubleshootingReports;

document.addEventListener('DOMContentLoaded', function () {
    // Get DOM elements
    const commit1Btn = document.getElementById('commit1Btn');
    const commit2Btn = document.getElementById('commit2Btn');
    const commit3Btn = document.getElementById('commit3Btn');
    const commit4Btn = document.getElementById('commit4Btn');
    const commit5Btn = document.getElementById('commit5Btn');
    const commit6Btn = document.getElementById('commit6Btn');

    const analyzeBtn = document.getElementById('analyzeBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const codePreview = document.getElementById('codePreview');
    const filesList = document.getElementById('filesList');

    // Event handlers for buttons
    commit1Btn.addEventListener('click', function () {
        console.log('Commit 1 button clicked');

        loadCommit(0);
    });

    commit2Btn.addEventListener('click', function () {
        loadCommit(1);
    });

    commit3Btn.addEventListener('click', function () {
        loadCommit(2);
    });

    commit4Btn.addEventListener('click', function () {
        loadCommit(3);
    });

    commit5Btn.addEventListener('click', function () {
        loadCommit(4);
    });

    commit6Btn.addEventListener('click', function () {
        loadCommit(5);
    });

    // Event handler for custom commit analysis
    analyzeBtn.addEventListener('click', function () {
        const hash = document.getElementById('commitHashInput').value.trim();

        if (!hash) {
            alert("Please enter a commit hash");
            return;
        }

        analyzeCommitByHash(hash);
    });

    // Add TR filter year change handler
    const trYearFilter = document.getElementById('trYearFilter');
    if (trYearFilter) {
        trYearFilter.addEventListener('change', function () {
            const repo = document.getElementById('trRepoName').textContent;
            if (repo && repo !== 'None selected') {
                displayTrForRepo(repo);
            }
        });
    }

    // Event delegation for file clicks
    if (filesList) {
        filesList.addEventListener('click', function (e) {
            const fileItem = e.target.closest('.file-item');
            if (!fileItem) return;

            // Find all active file items and remove active class
            document.querySelectorAll('.file-item.active').forEach(item => {
                item.classList.remove('active');
            });

            // Add active class to clicked item
            fileItem.classList.add('active');

            // Get file content from data attribute
            const fileContent = fileItem.getAttribute('data-code');
            const fileType = fileItem.getAttribute('data-type');

            // Update code preview
            displayCodePreview(fileContent, fileType);
        });
    }

    async function loadCommit(index) {
        // Show loading, hide results
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('results').classList.add('hidden');
        document.getElementById('trSection').classList.add('hidden');
        document.getElementById('repoActivitySection').classList.add('hidden');

        try {
            const commitData = mockCommits[index];

            // Call the ML model for risk prediction
            const prediction = await predictCommitRisk(commitData);

            // Update the sample commit with the ML prediction
            const enhancedCommit = {
                ...commitData,
                risk_score: prediction.risk_score,
                risk_level: prediction.risk_level,
                // Generate recommendations based on ML prediction
                recommendations: generateRecommendations(prediction, commitData)
            };

            // Display results with the enhanced commit data
            displayResults(enhancedCommit);

            // Add UI indicator if we used fallback prediction
            if (prediction.is_fallback) {
                showFallbackWarning();
            }
        } catch (error) {
            console.error("Error loading commit:", error);
            alert("Error analyzing commit: " + error.message);

            // Fallback to original data without ML
            displayResults(mockCommits[index]);
        } finally {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('results').classList.remove('hidden');
            document.getElementById('trSection').classList.remove('hidden');
            document.getElementById('repoActivitySection').classList.remove('hidden');
        }
    }

    async function analyzeCommitByHash(hash) {
        // Show loading, hide results
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('results').classList.add('hidden');
        document.getElementById('trSection').classList.add('hidden');
        document.getElementById('repoActivitySection').classList.add('hidden');

        try {
            // Check if hash matches one of our sample commits
            const matchedCommit = mockCommits.find(commit => commit.hash === hash);

            if (matchedCommit) {
                // If we have this commit in our samples, use it with ML prediction
                const prediction = await predictCommitRisk(matchedCommit);

                // Create enhanced commit with ML predictions
                const enhancedCommit = {
                    ...matchedCommit,
                    risk_score: prediction.risk_score,
                    risk_level: prediction.risk_level,
                    recommendations: generateRecommendations(prediction, matchedCommit)
                };

                displayResults(enhancedCommit);

                // Add UI indicator if we used fallback prediction
                if (prediction.is_fallback) {
                    showFallbackWarning();
                }
            } else {
                // In a real implementation, this would fetch from a git repository

                // Use ML prediction for this random commit
                const prediction = await predictCommitRisk(randomCommit);

                // Create enhanced commit with ML predictions
                const enhancedCommit = {
                    ...randomCommit,
                    risk_score: prediction.risk_score,
                    risk_level: prediction.risk_level,
                    recommendations: generateRecommendations(prediction, randomCommit)
                };

                displayResults(enhancedCommit);

                // Add UI indicator if we used fallback prediction
                if (prediction.is_fallback) {
                    showFallbackWarning();
                }
            }
        } catch (error) {
            console.error("Error analyzing commit:", error);
            alert("Error analyzing commit: " + error.message);

            // If we have a matched commit, use that as fallback
            const matchedCommit = mockCommits.find(commit => commit.hash === hash);
            if (matchedCommit) {
                displayResults(matchedCommit);
            }
            
        } finally {
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('results').classList.remove('hidden');
            document.getElementById('trSection').classList.remove('hidden');
            document.getElementById('repoActivitySection').classList.remove('hidden');
        }
    }

    function showFallbackWarning() {
        // Create warning element
        const warningDiv = document.createElement('div');
        warningDiv.className = 'fallback-warning';
        warningDiv.innerHTML = `
            <div class="warning-icon">⚠️</div>
            <div class="warning-message">
                <strong>Using fallback risk assessment:</strong> 
                Could not connect to the AI model. Using basic algorithm for risk evaluation.
            </div>
            <button class="warning-close">×</button>
        `;

        // Add close button handler
        warningDiv.querySelector('.warning-close').addEventListener('click', function () {
            warningDiv.remove();
        });

        // Add to page
        const container = document.querySelector('.container');
        container.insertBefore(warningDiv, container.firstChild);

        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (document.body.contains(warningDiv)) {
                warningDiv.remove();
            }
        }, 8000);
    }

    function displayCodePreview(code, fileType) {
        const codePreview = document.getElementById('codePreview');
    
        // Clear previous content
        codePreview.innerHTML = '';
        codePreview.className = 'code-preview';
        codePreview.classList.add(`file-${fileType}`);
    
        // Create fresh elements
        const pre = document.createElement('pre');
        const codeElement = document.createElement('code');
    
        // Set the appropriate class for the language
        if (fileType === 'h' || fileType === 'cpp') {
            codeElement.className = 'language-cpp';
        } else if (fileType === 'c') {
            codeElement.className = 'language-c';
        } else if (fileType === 'erl') {
            codeElement.className = 'language-erlang';
        } else if (fileType === 'java') {
            codeElement.className = 'language-java';
        } else if (fileType === 'py') {
            codeElement.className = 'language-python';
        } else {
            codeElement.className = 'language-clike';
        }
    
        // Set the code content as text (not HTML)
        codeElement.textContent = code;
    
        // Append elements
        pre.appendChild(codeElement);
        codePreview.appendChild(pre);
    
        // If Prism is available, highlight the code
        if (window.Prism) {
            try {
                Prism.highlightElement(codeElement);
            } catch (error) {
                console.error('Error highlighting code:', error);
            }
        } else {
            console.warn('Prism is not available for syntax highlighting');
        }
    }

    function displayResults(commit) {
        // Display basic commit info
        document.getElementById('repoName').textContent = `Repository: ${commit.repo || 'Unknown'}`;
        document.getElementById('commitHash').textContent = `Commit: ${commit.hash}`;
        document.getElementById('commitMessage').textContent = commit.message;
        document.getElementById('commitAuthor').textContent = `Author: ${commit.author}`;
        document.getElementById('commitDate').textContent = `Date: ${commit.date}`;

        // Display files list
        const filesList = document.getElementById('filesList');
        if (filesList) {
            filesList.innerHTML = '';

            if (commit.files && commit.files.length > 0) {
                commit.files.forEach((file, index) => {
                    const fileItem = document.createElement('div');
                    fileItem.className = `file-item file-${file.type}`;
                    if (index === 0) fileItem.classList.add('active');

                    fileItem.setAttribute('data-code', file.code);
                    fileItem.setAttribute('data-type', file.type);

                    const fileName = document.createElement('div');
                    fileName.className = 'file-name';
                    fileName.textContent = file.name;

                    const fileChanges = document.createElement('div');
                    fileChanges.className = 'file-changes';
                    fileChanges.innerHTML = `<span class="added-lines">${file.changes.split(',')[0]}</span>, <span class="deleted-lines">${file.changes.split(',')[1]}</span>`;

                    fileItem.appendChild(fileName);
                    fileItem.appendChild(fileChanges);
                    filesList.appendChild(fileItem);
                });

                // Display the first file by default
                if (commit.files[0]) {
                    displayCodePreview(commit.files[0].code, commit.files[0].type);
                }
            } else {
                // Fallback for old data format
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item active';
                fileItem.setAttribute('data-code', commit.code);
                fileItem.setAttribute('data-type', 'cpp');

                const fileName = document.createElement('div');
                fileName.className = 'file-name';
                fileName.textContent = 'Code Sample';

                const fileChanges = document.createElement('div');
                fileChanges.className = 'file-changes';
                fileChanges.textContent = `+${commit.insertions}, -${commit.deletions}`;

                fileItem.appendChild(fileName);
                fileItem.appendChild(fileChanges);
                filesList.appendChild(fileItem);

                displayCodePreview(commit.code, 'cpp');
            }
        } else {
            // Fallback if filesList doesn't exist
            document.getElementById('codeSnippet').textContent = commit.code || (commit.files && commit.files[0] ? commit.files[0].code : '');
        }

        // Set code preview border based on risk level
        const codePreview = document.getElementById('codePreview');
        if (codePreview) {
            codePreview.className = 'code-preview';
            codePreview.classList.add(`${commit.risk_level.toLowerCase()}-risk`);

            // Make sure to also add file type class
            if (commit.files && commit.files.length > 0) {
                codePreview.classList.add(`file-${commit.files[0].type}`);
            }
        }

        // Display risk score
        document.getElementById('riskScore').textContent = commit.risk_score.toFixed(1);

        // Update risk label with appropriate class
        const riskLevel = commit.risk_level;
        const riskLabel = document.getElementById('riskLabel');
        riskLabel.textContent = `${riskLevel} Risk`;
        riskLabel.className = `risk-label risk-${riskLevel.toLowerCase()}`;

        // Update stats
        document.getElementById('filesChanged').textContent = commit.files_changed || 0;
        document.getElementById('insertions').textContent = "+" + (commit.lines_added || commit.insertions || 0);
        document.getElementById('deletions').textContent = "-" + (commit.lines_deleted || commit.deletions || 0);
        document.getElementById('totalChanges').textContent = (commit.total_changes || 
            ((commit.lines_added || 0) + (commit.lines_deleted || 0)) || 0);

        const commitPatchsets = mockPatchSets[commit.hash] || [];


        if (document.getElementById('reviewersCount')) {
            const comments = mockComments[commit.hash] || [];
            
            // Use a Set to get unique reviewers, excluding the commit author
            const uniqueReviewers = new Set();
            
            comments.forEach(comment => {
                // Only add if the comment author is different from the commit author
                if (comment.author !== commit.author) {
                    uniqueReviewers.add(comment.author);
                }
                
                // Add replies' authors, excluding the commit author
                if (comment.replies) {
                    comment.replies.forEach(reply => {
                        if (reply.author !== commit.author) {
                            uniqueReviewers.add(reply.author);
                        }
                    });
                }
            });
        
            document.getElementById('reviewersCount').textContent = uniqueReviewers.size;
        }

        if (document.getElementById('patchsetsCount')) {
            document.getElementById('patchsetsCount').textContent = commitPatchsets.length;
        }

        if (document.getElementById('timeOfDay')) {
            const commitDate = new Date(commit.date);
            document.getElementById('timeOfDay').textContent = commitDate.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }

        // Update recommendations
        const recommendationList = document.getElementById('recommendationList');
        recommendationList.innerHTML = '';

        if (commit.recommendations && commit.recommendations.length > 0) {
            commit.recommendations.forEach(function (rec) {
                const li = document.createElement('li');
                li.textContent = rec;
                recommendationList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No recommendations needed.';
            recommendationList.appendChild(li);
        }

        // Display CI/CD test status
        displayCiCdTests(commit.hash);

        // Display patchsets details
        displayPatchsets(commit.hash);

        // Update and show TR section
        updateTrSection(commit.repo);

        displayCommentsForCommit(commit.hash);


        if (document.getElementById('unresolvedComments')) {
            // Count all comments
            let totalCommentCount = 0;
            const comments = mockComments[commit.hash] || [];
        
            comments.forEach(comment => {
                totalCommentCount++; // Count the main comment
                
                // Add the number of replies
                if (comment.replies && comment.replies.length > 0) {
                    totalCommentCount += comment.replies.length;
                }
            });
        
            document.getElementById('unresolvedComments').textContent = totalCommentCount;
        }

        // Show the TR section
        const trSection = document.getElementById('trSection');
        if (trSection) {
            trSection.style.display = 'block';
        }

        // Show and update Repository Activity section
        displayMergedCommits(commit.repo);
        setupMergeStatusTabs();


        // Show Repository Activity section
        const repoActivitySection = document.getElementById('repoActivitySection');
        if (repoActivitySection) {
            repoActivitySection.style.display = 'block';
        }

        // Show results section
        document.getElementById('results').style.display = 'block';
    }

    // Helper functions for CI/CD and patchset display that are called by displayResults

    function displayCiCdTests(commitHash) {
        const testRuns = mockTestRuns[commitHash] || [];
        const testRunsList = document.getElementById('testRunsList');

        if (!testRunsList) return;

        // Clear previous test runs
        testRunsList.innerHTML = '';

        // If no test runs, show a message
        if (testRuns.length === 0) {
            testRunsList.innerHTML = '<div class="no-tests-message">No test runs available for this commit</div>';

            // Update summary
            updateTestSummary(0, 0, 0);
            return;
        }

        // Count passing and failing runs
        const passingCount = testRuns.filter(run => run.status === 'passing').length;
        const failingCount = testRuns.length - passingCount;

        // Update summary
        updateTestSummary(testRuns.length, passingCount, failingCount);

        // Create test run items
        testRuns.forEach(run => {
            const testRunItem = document.createElement('div');
            testRunItem.className = `test-run-item ${run.status}`;

            // Format the date
            const runDate = new Date(run.date);
            const formattedDate = runDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            testRunItem.innerHTML = `
            <div class="test-run-name">${run.name}</div>
            <div class="test-run-meta">
                <div class="test-run-duration">${run.duration}</div>
                <div class="test-run-date">${formattedDate}</div>
                <div class="test-status-badge ${run.status}">${run.status}</div>
            </div>
        `;

            testRunsList.appendChild(testRunItem);
        });
    }

    function updateTestSummary(total, passing, failing) {
        const testRunCount = document.getElementById('testRunCount');
        const passingRunCount = document.getElementById('passingRunCount');
        const failingRunCount = document.getElementById('failingRunCount');
        const testStatusIndicator = document.getElementById('testStatusIndicator');
        const testStatusText = document.getElementById('testStatusText');

        if (testRunCount) testRunCount.textContent = total;
        if (passingRunCount) passingRunCount.textContent = passing;
        if (failingRunCount) failingRunCount.textContent = failing;

        if (testStatusIndicator && testStatusText) {
            // Determine overall status
            if (total === 0) {
                testStatusIndicator.className = 'test-status-indicator';
                testStatusText.textContent = 'No Tests';
            } else if (failing === 0) {
                testStatusIndicator.className = 'test-status-indicator passing';
                testStatusText.textContent = 'Passing';
            } else if (passing === 0) {
                testStatusIndicator.className = 'test-status-indicator failing';
                testStatusText.textContent = 'Failing';
            } else {
                testStatusIndicator.className = 'test-status-indicator unstable';
                testStatusText.textContent = 'Unstable';
            }
        }
    }

    function displayPatchsets(commitHash) {
        const patchsets = mockPatchSets[commitHash] || [];
        const patchsetsList = document.getElementById('patchsetsList');
        const patchsetTimeline = document.getElementById('patchsetTimeline');
        const patchsetTotalCount = document.getElementById('patchsetTotalCount');
    
        if (!patchsetsList || !patchsetTimeline || !patchsetTotalCount) return;
    
        // Clear previous patchsets
        patchsetsList.innerHTML = '';
        patchsetTimeline.innerHTML = '';
    
        // Find the commit to get the number of patchsets
        const commitData = mockCommits.find(commit => commit.hash === commitHash);
        
        // Update total count directly from commit data
        const totalPatchsets = commitData ? commitData.num_patchsets : patchsets.length;
        patchsetTotalCount.textContent = totalPatchsets;
    
        // If no patchsets, show a message
        if (patchsets.length === 0) {
            patchsetsList.innerHTML = '<div class="no-patchsets-message">No patchsets available for this commit</div>';
            return;
        }
    
        // Create timeline markers
        patchsets.forEach((patchset, index) => {
            const percentage = (index / (patchsets.length - 1)) * 100;
            const marker = document.createElement('div');
            marker.className = `patchset-marker ${patchset.isCurrent ? 'current' : ''}`;
            marker.style.left = `${percentage}%`;
    
            // Format date for tooltip
            const patchsetDate = new Date(patchset.date);
            const formattedDate = patchsetDate.toLocaleDateString() + ' ' +
                patchsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            marker.setAttribute('data-date', formattedDate);
    
            patchsetTimeline.appendChild(marker);
        });
    
        // Create patchset items
        patchsets.forEach(patchset => {
            const patchsetItem = document.createElement('div');
            patchsetItem.className = `patchset-item ${patchset.isCurrent ? 'current' : ''}`;
    
            // Format the date
            const patchsetDate = new Date(patchset.date);
            const formattedDate = patchsetDate.toLocaleDateString() + ' ' +
                patchsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
            patchsetItem.innerHTML = `
                <div class="patchset-info">
                    <div class="patchset-id">
                        Patchset ${patchset.id}
                        ${patchset.isCurrent ? '<span class="current-tag">current</span>' : ''}
                    </div>
                    <div class="patchset-changes">${patchset.changes} lines</div>
                    <div class="patchset-description">${patchset.description}</div>
                </div>
                <div class="patchset-date">${formattedDate}</div>
            `;
    
            patchsetsList.appendChild(patchsetItem);
        });
    }
    function updateTrSection(repoName) {
        const trRepoNameElement = document.getElementById('trRepoName');
        if (trRepoNameElement) {
            trRepoNameElement.textContent = repoName || 'Unknown';
        }

        // Display TRs for this repo
        displayTrForRepo(repoName);
    }

    function displayTrForRepo(repoName) {
        const trList = document.getElementById('trList');
        if (!trList) return;

        // Clear current list
        trList.innerHTML = '';

        // Get TRs for this repo
        const reports = mockTroubleshootingReports[repoName];

        if (!reports || reports.length === 0) {
            // Show empty state
            const emptyState = document.createElement('div');
            emptyState.className = 'tr-empty-state';
            emptyState.textContent = `No troubleshooting reports found for ${repoName}`;
            trList.appendChild(emptyState);
            return;
        }

        // Get year filter
        const yearFilter = document.getElementById('trYearFilter').value;

        // Filter reports by year if needed
        const filteredReports = yearFilter === 'all'
            ? reports
            : reports.filter(report => report.dateSubmitted.startsWith(yearFilter));

        if (filteredReports.length === 0) {
            // Show empty state for year filter
            const emptyState = document.createElement('div');
            emptyState.className = 'tr-empty-state';
            emptyState.textContent = `No reports from ${yearFilter} for ${repoName}`;
            trList.appendChild(emptyState);
            return;
        }

        // Sort reports by date (newest first)
        filteredReports.sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted));

        // Create TR items
        filteredReports.forEach(report => {
            const trItem = document.createElement('div');
            trItem.className = 'tr-item';

            const trHeader = document.createElement('div');
            trHeader.className = 'tr-header';

            const trId = document.createElement('div');
            trId.className = 'tr-id';
            trId.textContent = report.id;

            const trDate = document.createElement('div');
            trDate.className = 'tr-date';
            trDate.textContent = report.dateSubmitted;

            trHeader.appendChild(trId);
            trHeader.appendChild(trDate);

            const trTitle = document.createElement('div');
            trTitle.className = 'tr-title';
            trTitle.textContent = report.title;

            const trMeta = document.createElement('div');
            trMeta.className = 'tr-meta';

            const trStatus = document.createElement('div');
            trStatus.className = `tr-status tr-status-${report.status.toLowerCase().replace(' ', '-')}`;
            trStatus.textContent = report.status;

            const trSeverity = document.createElement('div');
            trSeverity.className = `tr-severity tr-severity-${report.severity.toLowerCase()}`;
            trSeverity.textContent = report.severity;

            trMeta.appendChild(trStatus);
            trMeta.appendChild(trSeverity);

            const trDescription = document.createElement('div');
            trDescription.className = 'tr-description';
            trDescription.textContent = report.description;

            // Add to TR item
            trItem.appendChild(trHeader);
            trItem.appendChild(trTitle);
            trItem.appendChild(trMeta);
            trItem.appendChild(trDescription);

            // Add related commits if any
            if (report.relatedCommits && report.relatedCommits.length > 0) {
                const trRelated = document.createElement('div');
                trRelated.className = 'tr-related';

                const relatedText = document.createElement('span');
                relatedText.textContent = 'Related commits: ';
                trRelated.appendChild(relatedText);

                report.relatedCommits.forEach(commit => {
                    const commitLink = document.createElement('a');
                    commitLink.className = 'tr-commit-link';
                    commitLink.textContent = commit.substring(0, 8);
                    commitLink.href = '#';
                    commitLink.setAttribute('data-commit', commit);

                    // Add click handler to analyze this commit
                    commitLink.addEventListener('click', function (e) {
                        e.preventDefault();
                        analyzeCommitByHash(commit);
                    });

                    trRelated.appendChild(commitLink);
                });

                trItem.appendChild(trRelated);
            }

            trList.appendChild(trItem);
        });
    }
});

function displayCiCdTests(commitHash) {
    const testRuns = mockTestRuns[commitHash] || [];
    const testRunsList = document.getElementById('testRunsList');

    if (!testRunsList) return;

    // Clear previous test runs
    testRunsList.innerHTML = '';

    // If no test runs, show a message
    if (testRuns.length === 0) {
        testRunsList.innerHTML = '<div class="no-tests-message">No test runs available for this commit</div>';

        // Update summary
        updateTestSummary(0, 0, 0);
        return;
    }

    // Count passing and failing runs
    const passingCount = testRuns.filter(run => run.status === 'passing').length;
    const failingCount = testRuns.length - passingCount;

    // Update summary
    updateTestSummary(testRuns.length, passingCount, failingCount);

    // Create test run items
    testRuns.forEach(run => {
        const testRunItem = document.createElement('div');
        testRunItem.className = `test-run-item ${run.status}`;

        // Format the date
        const runDate = new Date(run.date);
        const formattedDate = runDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        testRunItem.innerHTML = `
            <div class="test-run-name">${run.name}</div>
            <div class="test-run-meta">
                <div class="test-run-duration">${run.duration}</div>
                <div class="test-run-date">${formattedDate}</div>
                <div class="test-status-badge ${run.status}">${run.status}</div>
            </div>
        `;

        testRunsList.appendChild(testRunItem);
    });
}

// Function to update test summary
function updateTestSummary(total, passing, failing) {
    const testRunCount = document.getElementById('testRunCount');
    const passingRunCount = document.getElementById('passingRunCount');
    const failingRunCount = document.getElementById('failingRunCount');
    const testStatusIndicator = document.getElementById('testStatusIndicator');
    const testStatusText = document.getElementById('testStatusText');

    if (testRunCount) testRunCount.textContent = total;
    if (passingRunCount) passingRunCount.textContent = passing;
    if (failingRunCount) failingRunCount.textContent = failing;

    if (testStatusIndicator && testStatusText) {
        // Determine overall status
        if (total === 0) {
            testStatusIndicator.className = 'test-status-indicator';
            testStatusText.textContent = 'No Tests';
        } else if (failing === 0) {
            testStatusIndicator.className = 'test-status-indicator passing';
            testStatusText.textContent = 'Passing';
        } else if (passing === 0) {
            testStatusIndicator.className = 'test-status-indicator failing';
            testStatusText.textContent = 'Failing';
        } else {
            testStatusIndicator.className = 'test-status-indicator unstable';
            testStatusText.textContent = 'Unstable';
        }
    }
}

// Function to display patchsets for a commit
function displayPatchsets(commitHash) {
    const patchsets = mockPatchSets[commitHash] || [];
    const patchsetsList = document.getElementById('patchsetsList');
    const patchsetTimeline = document.getElementById('patchsetTimeline');
    const patchsetTotalCount = document.getElementById('patchsetTotalCount');

    if (!patchsetsList || !patchsetTimeline || !patchsetTotalCount) return;

    // Clear previous patchsets
    patchsetsList.innerHTML = '';
    patchsetTimeline.innerHTML = '';

    // Update total count
    patchsetTotalCount.textContent = patchsets.length;

    // If no patchsets, show a message
    if (patchsets.length === 0) {
        patchsetsList.innerHTML = '<div class="no-patchsets-message">No patchsets available for this commit</div>';
        return;
    }

    // Create timeline markers
    patchsets.forEach((patchset, index) => {
        const percentage = (index / (patchsets.length - 1)) * 100;
        const marker = document.createElement('div');
        marker.className = `patchset-marker ${patchset.isCurrent ? 'current' : ''}`;
        marker.style.left = `${percentage}%`;

        // Format date for tooltip
        const patchsetDate = new Date(patchset.date);
        const formattedDate = patchsetDate.toLocaleDateString() + ' ' +
            patchsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        marker.setAttribute('data-date', formattedDate);

        patchsetTimeline.appendChild(marker);
    });

    // Create patchset items
    patchsets.forEach(patchset => {
        const patchsetItem = document.createElement('div');
        patchsetItem.className = `patchset-item ${patchset.isCurrent ? 'current' : ''}`;

        // Format the date
        const patchsetDate = new Date(patchset.date);
        const formattedDate = patchsetDate.toLocaleDateString() + ' ' +
            patchsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        patchsetItem.innerHTML = `
            <div class="patchset-info">
                <div class="patchset-id">
                    Patchset ${patchset.id}
                    ${patchset.isCurrent ? '<span class="current-tag">current</span>' : ''}
                </div>
                <div class="patchset-changes">${patchset.changes} lines</div>
                <div class="patchset-description">${patchset.description}</div>
            </div>
            <div class="patchset-date">${formattedDate}</div>
        `;

        patchsetsList.appendChild(patchsetItem);
    });
}


function displayMergedCommits(repoName) {
    const mergedCommitsList = document.getElementById('mergedCommitsList');

    if (!mergedCommitsList) return;

    // Clear previous content
    mergedCommitsList.innerHTML = '';

    // Get merged commits data for this repo
    const repoData = mockMergedCommits[repoName];

    if (!repoData || !repoData.mergedCommits || repoData.mergedCommits.length === 0) {
        mergedCommitsList.innerHTML = '<div class="empty-state">No merged commits found for this repository today</div>';

        // Update stats
        updateMergeStats(0, 0);
        return;
    }

    // Update stats
    updateMergeStats(repoData.recentMergedCount, 15); // Using mock 15% increase

    // Sort commits by time (newest first)
    const sortedCommits = [...repoData.mergedCommits].sort((a, b) =>
        new Date(b.time) - new Date(a.time)
    );

    // Create commit items - using more compact layout for sidebar
    sortedCommits.forEach(commit => {
        const commitItem = document.createElement('div');
        commitItem.className = 'commit-item';

        const date = new Date(commit.time);
        const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Simplified layout for sidebar
        commitItem.innerHTML = `
            <div class="commit-info">
                <div class="commit-hash">${commit.hash.substring(0, 8)}</div>
                <div class="commit-message" title="${commit.message}">${commit.message}</div>
                <div class="commit-time">${timeString}</div>
                <div class="commit-author">${commit.author.split('<')[0].trim()}</div>
            </div>
        `;

        mergedCommitsList.appendChild(commitItem);
    });
}

// Function to update merge stats
function updateMergeStats(count, percentDelta) {
    const todayMergeCount = document.getElementById('todayMergeCount');
    const mergeCountDelta = document.getElementById('mergeCountDelta');

    if (todayMergeCount) todayMergeCount.textContent = count;

    if (mergeCountDelta) {
        const deltaElement = mergeCountDelta.parentElement;

        if (percentDelta > 0) {
            mergeCountDelta.textContent = `+${percentDelta}%`;
            deltaElement.className = 'merge-stats-trend positive';
        } else if (percentDelta < 0) {
            mergeCountDelta.textContent = `${percentDelta}%`;
            deltaElement.className = 'merge-stats-trend negative';
        } else {
            mergeCountDelta.textContent = `0%`;
            deltaElement.className = 'merge-stats-trend';
        }
    }
}

// Function to set up tab navigation
function setupMergeStatusTabs() {
    const tabButtons = document.querySelectorAll('.section-tab');

    tabButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Get tab id
            const tabId = this.getAttribute('data-tab');

            // Hide all panes
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });

            // Show the selected pane
            let targetPane;
            if (tabId === 'merged') {
                targetPane = document.getElementById('mergedCommitsPane');
            } 
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// Function to display comments for a commit
function displayCommentsForCommit(commitHash) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;

    commentsList.innerHTML = '';

    const comments = mockComments[commitHash] || [];

    if (comments.length === 0) {
        commentsList.innerHTML = '<div class="no-comments-message">No review comments for this commit.</div>';
        return;
    }

    // Count resolved and unresolved comments
    let resolvedCount = 0;
    let unresolvedCount = 0;
    let totalComments = 0;

    // Count all comments including replies
    comments.forEach(comment => {
        totalComments++;
        if (comment.status === 'resolved') resolvedCount++;
        else if (comment.status === 'unresolved') unresolvedCount++;

        comment.replies.forEach(reply => {
            totalComments++;
            if (reply.status === 'resolved') resolvedCount++;
            else if (reply.status === 'unresolved') unresolvedCount++;
        });
    });

    // Update stats if element exists
    if (document.getElementById('commentStats')) {
        document.getElementById('commentStats').innerHTML = `
            <div class="comment-stat">
                <span class="comment-stat-value">${totalComments}</span>
                <span class="comment-stat-label">Total</span>
            </div>
            <div class="comment-stat">
                <span class="comment-stat-value">${resolvedCount}</span>
                <span class="comment-stat-label">Resolved</span>
            </div>
            <div class="comment-stat">
                <span class="comment-stat-value">${unresolvedCount}</span>
                <span class="comment-stat-label">Unresolved</span>
            </div>
        `;
    }

    // Display each comment
    comments.forEach(comment => {
        const commentElement = createCommentElement(comment);
        commentsList.appendChild(commentElement);
    });
}

function createCommentElement(comment) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment-item';

    // Format the timestamp
    const timestamp = new Date(comment.timestamp);
    const formattedDate = timestamp.toLocaleDateString();
    const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    commentElement.innerHTML = `
        <div class="comment-header">
            <div class="comment-author">
                <div class="comment-author-avatar">${comment.authorInitials}</div>
                ${comment.author}
                <span class="comment-status ${comment.status}">${comment.status}</span>
            </div>
            <div class="comment-timestamp">${formattedDate} ${formattedTime}</div>
        </div>
        <div class="comment-content">${comment.content}</div>
        <div class="comment-file-reference">${comment.file}:${comment.line}</div>
        <div class="comment-actions">
            <button class="comment-action-btn">Reply</button>
            <button class="comment-action-btn">Resolve</button>
        </div>
    `;

    // Add replies if any
    if (comment.replies && comment.replies.length > 0) {
        const threadElement = document.createElement('div');
        threadElement.className = 'comment-thread';

        comment.replies.forEach(reply => {
            const replyElement = document.createElement('div');
            replyElement.className = 'comment-item';

            // Format the reply timestamp
            const replyTimestamp = new Date(reply.timestamp);
            const replyFormattedDate = replyTimestamp.toLocaleDateString();
            const replyFormattedTime = replyTimestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            replyElement.innerHTML = `
                <div class="comment-header">
                    <div class="comment-author">
                        <div class="comment-author-avatar">${reply.authorInitials}</div>
                        ${reply.author}
                        <span class="comment-status ${reply.status}">${reply.status}</span>
                    </div>
                    <div class="comment-timestamp">${replyFormattedDate} ${replyFormattedTime}</div>
                </div>
                <div class="comment-content">${reply.content}</div>
                <div class="comment-actions">
                    <button class="comment-action-btn">Reply</button>
                    <button class="comment-action-btn">Resolve</button>
                </div>
            `;

            threadElement.appendChild(replyElement);
        });

        commentElement.appendChild(threadElement);
    }

    return commentElement;
}
