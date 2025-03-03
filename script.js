// Import sample data from data.js and our new ML predictor
import { sampleCommits, codeSamplesByType, troubleshootingReports } from './data.js';
import { predictCommitRisk, generateRecommendations } from './commit-risk-predictor.js';

// Make troubleshooting reports available globally for our ML predictor
window.troubleshootingReports = troubleshootingReports;

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const commit1Btn = document.getElementById('commit1Btn');
    const commit2Btn = document.getElementById('commit2Btn');
    const commit3Btn = document.getElementById('commit3Btn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const codePreview = document.getElementById('codePreview');
    const filesList = document.getElementById('filesList');
    
    // Event handlers for buttons
    commit1Btn.addEventListener('click', function() {
        loadCommit(0);
    });
    
    commit2Btn.addEventListener('click', function() {
        loadCommit(1);
    });
    
    commit3Btn.addEventListener('click', function() {
        loadCommit(2);
    });
    
    // Event handler for custom commit analysis
    analyzeBtn.addEventListener('click', function() {
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
        trYearFilter.addEventListener('change', function() {
            const repo = document.getElementById('trRepoName').textContent;
            if (repo && repo !== 'None selected') {
                displayTrForRepo(repo);
            }
        });
    }
    
    // Event delegation for file clicks
    if (filesList) {
        filesList.addEventListener('click', function(e) {
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
        loading.style.display = 'block';
        results.style.display = 'none';
        
        try {
            const commitData = sampleCommits[index];
            
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
            displayResults(sampleCommits[index]);
        } finally {
            loading.style.display = 'none';
        }
    }
    
    async function analyzeCommitByHash(hash) {
        // Show loading, hide results
        loading.style.display = 'block';
        results.style.display = 'none';
        
        try {
            // Check if hash matches one of our sample commits
            const matchedCommit = sampleCommits.find(commit => commit.hash === hash);
            
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
                // Generate a random commit for demo purposes
                // In a real implementation, this would fetch from a git repository
                const randomCommit = generateRandomCommit(hash);
                
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
            const matchedCommit = sampleCommits.find(commit => commit.hash === hash);
            if (matchedCommit) {
                displayResults(matchedCommit);
            } else {
                // Otherwise generate a random commit
                const randomCommit = generateRandomCommit(hash);
                displayResults(randomCommit);
            }
        } finally {
            loading.style.display = 'none';
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
        warningDiv.querySelector('.warning-close').addEventListener('click', function() {
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
    
    function generateRandomCommit(hash) {
        // Select a random type of commit for variety
        const commitTypes = ["feature", "bugfix", "refactor", "docs", "chore"];
        const type = commitTypes[Math.floor(Math.random() * commitTypes.length)];
        
        // Generate random repo name
        const repos = ["rpcppg2", "rc", "libclient", "core-utils", "frontend-app"];
        const repo = repos[Math.floor(Math.random() * repos.length)];
        
        // Generate random stats based on commit type
        let filesChanged, insertions, deletions;
        let message, author;
        let files = [];
        
        switch(type) {
            case "feature":
                filesChanged = Math.floor(Math.random() * 5) + 2; // 2-6 files
                insertions = Math.floor(Math.random() * 300) + 100;
                deletions = Math.floor(Math.random() * 50);
                message = "Add new feature: " + [
                    "user authentication",
                    "dashboard analytics",
                    "export functionality",
                    "dark mode support",
                    "mobile responsive layout"
                ][Math.floor(Math.random() * 5)];
                
                // Create files for this commit
                files.push({
                    name: "Feature" + Math.floor(Math.random() * 1000) + ".h",
                    type: "h",
                    changes: `+${Math.floor(Math.random() * 100) + 50}, -${Math.floor(Math.random() * 20)}`,
                    code: codeSamplesByType.feature.h
                });
                
                files.push({
                    name: "Feature" + Math.floor(Math.random() * 1000) + ".cpp",
                    type: "cpp",
                    changes: `+${Math.floor(Math.random() * 200) + 100}, -${Math.floor(Math.random() * 30)}`,
                    code: codeSamplesByType.feature.cpp
                });
                
                // Add additional files
                for (let i = 0; i < filesChanged - 2; i++) {
                    const isHeader = Math.random() > 0.5;
                    files.push({
                        name: `Utils${Math.floor(Math.random() * 100)}.${isHeader ? 'h' : 'cpp'}`,
                        type: isHeader ? 'h' : 'cpp',
                        changes: `+${Math.floor(Math.random() * 50) + 10}, -${Math.floor(Math.random() * 10)}`,
                        code: isHeader ? codeSamplesByType.feature.h : codeSamplesByType.feature.cpp
                    });
                }
                break;
                
            case "bugfix":
                filesChanged = Math.floor(Math.random() * 2) + 1; // 1-2 files
                insertions = Math.floor(Math.random() * 20) + 5;
                deletions = Math.floor(Math.random() * 15) + 3;
                message = "Fix bug in " + [
                    "login process",
                    "data validation",
                    "error handling",
                    "memory management",
                    "edge case scenario"
                ][Math.floor(Math.random() * 5)];
                
                // Create files for this commit
                if (Math.random() > 0.5 || filesChanged > 1) {
                    files.push({
                        name: "BugFix" + Math.floor(Math.random() * 1000) + ".h",
                        type: "h",
                        changes: `+${Math.floor(Math.random() * 10) + 5}, -${Math.floor(Math.random() * 5) + 1}`,
                        code: codeSamplesByType.bugfix.h
                    });
                }
                
                files.push({
                    name: "BugFix" + Math.floor(Math.random() * 1000) + ".cpp",
                    type: "cpp",
                    changes: `+${Math.floor(Math.random() * 15) + 5}, -${Math.floor(Math.random() * 10) + 3}`,
                    code: codeSamplesByType.bugfix.cpp
                });
                break;
                
            case "refactor":
                filesChanged = Math.floor(Math.random() * 8) + 3; // 3-10 files
                insertions = Math.floor(Math.random() * 500) + 200;
                deletions = Math.floor(Math.random() * 500) + 200;
                message = "Refactor " + [
                    "authentication system",
                    "database layer",
                    "component structure",
                    "build process",
                    "error handling mechanism"
                ][Math.floor(Math.random() * 5)];
                
                // Create files for this commit - mix of header and implementation files
                const headerCount = Math.ceil(filesChanged / 2);
                const implCount = filesChanged - headerCount;
                
                // Add header files
                for (let i = 0; i < headerCount; i++) {
                    files.push({
                        name: `Refactored${Math.floor(Math.random() * 1000)}${i}.h`,
                        type: "h",
                        changes: `+${Math.floor(Math.random() * 100) + 30}, -${Math.floor(Math.random() * 100) + 30}`,
                        code: codeSamplesByType.refactor.h
                    });
                }
                
                // Add implementation files
                for (let i = 0; i < implCount; i++) {
                    files.push({
                        name: `Refactored${Math.floor(Math.random() * 1000)}${i}.cpp`,
                        type: "cpp",
                        changes: `+${Math.floor(Math.random() * 200) + 50}, -${Math.floor(Math.random() * 200) + 50}`,
                        code: codeSamplesByType.refactor.cpp
                    });
                }
                break;
                
            case "docs":
                filesChanged = Math.floor(Math.random() * 5) + 1; // 1-5 files
                insertions = Math.floor(Math.random() * 100) + 50;
                deletions = Math.floor(Math.random() * 20);
                message = "Update documentation for " + [
                    "API endpoints",
                    "setup process",
                    "contributing guidelines",
                    "code examples",
                    "configuration options"
                ][Math.floor(Math.random() * 5)];
                
                // Create files for this commit - mostly header files with docs
                for (let i = 0; i < filesChanged; i++) {
                    const isHeader = Math.random() > 0.3;
                    files.push({
                        name: `Documented${Math.floor(Math.random() * 1000)}.${isHeader ? 'h' : 'cpp'}`,
                        type: isHeader ? 'h' : 'cpp',
                        changes: `+${Math.floor(Math.random() * 50) + 20}, -${Math.floor(Math.random() * 10)}`,
                        code: isHeader ? codeSamplesByType.docs.h : codeSamplesByType.docs.cpp
                    });
                }
                break;
                
            case "chore":
                filesChanged = Math.floor(Math.random() * 10) + 1; // 1-10 files
                insertions = Math.floor(Math.random() * 50) + 10;
                deletions = Math.floor(Math.random() * 50) + 10;
                message = "Update " + [
                    "dependencies",
                    "build configuration",
                    "CI pipeline",
                    "version numbers",
                    "project structure"
                ][Math.floor(Math.random() * 5)];
                
                // Create files for this commit - mix of different file types
                for (let i = 0; i < filesChanged; i++) {
                    const isHeader = Math.random() > 0.6;
                    files.push({
                        name: `Build${Math.floor(Math.random() * 1000)}.${isHeader ? 'h' : 'cpp'}`,
                        type: isHeader ? 'h' : 'cpp',
                        changes: `+${Math.floor(Math.random() * 20) + 5}, -${Math.floor(Math.random() * 20) + 5}`,
                        code: isHeader ? codeSamplesByType.chore.h : codeSamplesByType.chore.cpp
                    });
                }
                break;
        }
        
        const authors = [
            "John Doe <john@example.com>",
            "Jane Smith <jane@example.com>",
            "Alex Johnson <alex@example.com>",
            "Maria Garcia <maria@example.com>",
            "David Chen <david@example.com>"
        ];
        
        author = authors[Math.floor(Math.random() * authors.length)];
        
        // Verify insertions and deletions match the files
        let totalInsertions = 0;
        let totalDeletions = 0;
        
        files.forEach(file => {
            const changes = file.changes.split(', ');
            const ins = parseInt(changes[0].replace('+', ''));
            const del = parseInt(changes[1].replace('-', ''));
            totalInsertions += ins;
            totalDeletions += del;
        });
        
        // Adjust if there's a big discrepancy
        if (Math.abs(totalInsertions - insertions) > 50) {
            insertions = totalInsertions;
        }
        
        if (Math.abs(totalDeletions - deletions) > 50) {
            deletions = totalDeletions;
        }
        
        // Get ML specific attributes for demo
        const totalChanges = insertions + deletions;
        
        // Add ML-specific meta fields for more realistic predictions
        const mlFields = {
            reviewers_count: Math.floor(Math.random() * 3) + 1,
            patchsets_count: Math.floor(Math.random() * 3) + 1,
            unresolved_comments: Math.floor(Math.random() * 5),
        };
        
        return {
            hash: hash,
            repo: repo,
            message: message,
            author: author,
            date: new Date().toISOString().split('T')[0],
            files_changed: filesChanged,
            insertions: insertions,
            deletions: deletions,
            total_changes: totalChanges,
            files: files,
            ...mlFields  // Add ML fields to commit object
        };
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
        document.getElementById('filesChanged').textContent = commit.files_changed;
        document.getElementById('insertions').textContent = commit.insertions;
        document.getElementById('deletions').textContent = commit.deletions;
        document.getElementById('totalChanges').textContent = commit.total_changes;
        
        // Update ML-specific stats if available
        if (document.getElementById('reviewersCount')) {
            document.getElementById('reviewersCount').textContent = commit.reviewers_count || 1;
        }
        
        if (document.getElementById('patchsetsCount')) {
            document.getElementById('patchsetsCount').textContent = commit.patchsets_count || 1;
        }
        
        if (document.getElementById('unresolvedComments')) {
            document.getElementById('unresolvedComments').textContent = commit.unresolved_comments || 0;
        }
        
        if (document.getElementById('timeOfDay')) {
            const hour = new Date().getHours();
            document.getElementById('timeOfDay').textContent = `${hour}:00`;
        }
        
        // Update recommendations
        const recommendationList = document.getElementById('recommendationList');
        recommendationList.innerHTML = '';
        
        if (commit.recommendations && commit.recommendations.length > 0) {
            commit.recommendations.forEach(function(rec) {
                const li = document.createElement('li');
                li.textContent = rec;
                recommendationList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No recommendations needed.';
            recommendationList.appendChild(li);
        }
        
        // Update and show TR section
        updateTrSection(commit.repo);
        
        // Show the TR section
        const trSection = document.getElementById('trSection');
        if (trSection) {
            trSection.style.display = 'block';
        }
        
        // Show results section
        results.style.display = 'block';
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
        const reports = troubleshootingReports[repoName];
        
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
                    commitLink.addEventListener('click', function(e) {
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