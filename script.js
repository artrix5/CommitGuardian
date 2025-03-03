// Import risk prediction module
import { predictCommitRisk, generateRecommendations } from './commit-risk-predictor.js';

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const commit1Btn = document.getElementById('commit1Btn');
    const commit2Btn = document.getElementById('commit2Btn');
    const commit3Btn = document.getElementById('commit3Btn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const filesList = document.getElementById('filesList');
    
    // Event handlers for sample commit buttons
    commit1Btn.addEventListener('click', function() {
        analyzeCommit('c9f67a195');
    });
    
    commit2Btn.addEventListener('click', function() {
        analyzeCommit('b8d45e720');
    });
    
    commit3Btn.addEventListener('click', function() {
        analyzeCommit('c9f67a195');
    });
    
    // Event handler for custom commit analysis
    analyzeBtn.addEventListener('click', function() {
        const hash = document.getElementById('commitHashInput').value.trim();
        
        if (!hash) {
            alert("Please enter a commit hash");
            return;
        }
        
        analyzeCommit(hash);
    });
    
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
    
    async function analyzeCommit(commitId) {
        // ...
      
        try {
          const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ commitId: commitId })
          });
      
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
      
          const commitData = await response.json();
          displayResults(commitData);
      
        } catch (error) {
          console.error('Error fetching commit analysis:', error);
          displayErrorResults(commitId);
        } finally {
          loading.style.display = 'none';
        }
      }
    
    
    function displayNotFoundResults(commitId) {
        // Display results for not found scenario
        document.getElementById('repoName').textContent = 'Repository: Unknown';
        document.getElementById('commitHash').textContent = `Commit: ${commitId}`;
        document.getElementById('commitMessage').textContent = 'Commit not found in repository';
        document.getElementById('commitAuthor').textContent = 'Author: N/A';
        document.getElementById('commitDate').textContent = 'Date: N/A';
        
        // Reset risk indicators
        document.getElementById('riskScore').textContent = '0.00';
        const riskLabel = document.getElementById('riskLabel');
        riskLabel.textContent = 'Not Found';
        riskLabel.className = 'risk-label risk-not-found';
        
        // Clear other sections
        document.getElementById('filesList').innerHTML = '<div class="file-item">No files found</div>';
        document.getElementById('recommendationList').innerHTML = '<li>Commit ID not found in the repository.</li>';
        
        // Hide or reset other stats
        const statElements = [
            'filesChanged', 'insertions', 'deletions', 'totalChanges', 
            'reviewersCount', 'patchsetsCount', 'unresolvedComments', 'timeOfDay'
        ];
        statElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = 'N/A';
        });
        
        // Show results section
        results.style.display = 'block';
    }
    
    function displayErrorResults(commitId) {
        // Similar to not found, but with error messaging
        document.getElementById('repoName').textContent = 'Repository: Error';
        document.getElementById('commitHash').textContent = `Commit: ${commitId}`;
        document.getElementById('commitMessage').textContent = 'Error analyzing commit';
        document.getElementById('commitAuthor').textContent = 'Author: N/A';
        document.getElementById('commitDate').textContent = 'Date: N/A';
        
        // Reset risk indicators
        document.getElementById('riskScore').textContent = '0.00';
        const riskLabel = document.getElementById('riskLabel');
        riskLabel.textContent = 'Error';
        riskLabel.className = 'risk-label risk-error';
        
        // Clear other sections
        document.getElementById('filesList').innerHTML = '<div class="file-item">Analysis failed</div>';
        document.getElementById('recommendationList').innerHTML = '<li>Unable to analyze commit. Please try again later.</li>';
        
        // Hide or reset other stats
        const statElements = [
            'filesChanged', 'insertions', 'deletions', 'totalChanges', 
            'reviewersCount', 'patchsetsCount', 'unresolvedComments', 'timeOfDay'
        ];
        statElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = 'N/A';
        });
        
        // Show results section
        results.style.display = 'block';
    }
    
    function displayResults(commitData) {
        // Display basic commit info
        document.getElementById('repoName').textContent = `Repository: ${commitData.commitData?.repository || 'Unknown'}`;
        document.getElementById('commitHash').textContent = `Commit: ${commitData.commitId}`;
        document.getElementById('commitMessage').textContent = commitData.commitData?.message || 'No message available';
        document.getElementById('commitAuthor').textContent = `Author: ${commitData.commitData?.author || 'Unknown'}`;
        document.getElementById('commitDate').textContent = `Date: ${commitData.commitData?.commit_timestamp ? new Date(commitData.commitData.commit_timestamp).toLocaleDateString() : 'N/A'}`;
        
        // Display files list
        const filesList = document.getElementById('filesList');
        if (filesList) {
            filesList.innerHTML = '';
            
            // Check if files exist in the commit data
            const files = commitData.commitData?.files || [];
            
            if (files.length > 0) {
                files.forEach((file, index) => {
                    const fileItem = document.createElement('div');
                    fileItem.className = `file-item file-${file.language?.toLowerCase() || 'unknown'}`;
                    if (index === 0) fileItem.classList.add('active');
                    
                    fileItem.setAttribute('data-code', file.code);
                    fileItem.setAttribute('data-type', file.language?.toLowerCase() || 'unknown');
                    
                    const fileName = document.createElement('div');
                    fileName.className = 'file-name';
                    fileName.textContent = file.filename || 'Unnamed file';
                    
                    const fileChanges = document.createElement('div');
                    fileChanges.className = 'file-changes';
                    fileChanges.innerHTML = `<span class="added-lines">+${file.changes || 0}</span>`;
                    
                    fileItem.appendChild(fileName);
                    fileItem.appendChild(fileChanges);
                    filesList.appendChild(fileItem);
                });
                
                // Display the first file by default
                if (files[0]) {
                    displayCodePreview(files[0].code, files[0].language?.toLowerCase() || 'unknown');
                }
            } else {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item active';
                fileItem.textContent = 'No files in this commit';
                filesList.appendChild(fileItem);
            }
        }
        
        // Set code preview border based on risk level
        const codePreview = document.getElementById('codePreview');
        if (codePreview) {
            codePreview.className = 'code-preview';
            codePreview.classList.add(`${commitData.risk_level.toLowerCase()}-risk`);
        }
        
        // Display risk score
        document.getElementById('riskScore').textContent = (commitData.risk_score || 0).toFixed(1);
        
        // Update risk label with appropriate class
        const riskLevel = commitData.risk_level;
        const riskLabel = document.getElementById('riskLabel');
        riskLabel.textContent = `${riskLevel} Risk`;
        riskLabel.className = `risk-label risk-${riskLevel.toLowerCase()}`;
        
        // Update stats
        document.getElementById('filesChanged').textContent = commitData.commitData?.files_changed || 0;
        document.getElementById('insertions').textContent = commitData.commitData?.lines_added || 0;
        document.getElementById('deletions').textContent = commitData.commitData?.lines_removed || 0;
        document.getElementById('totalChanges').textContent = 
            ((commitData.commitData?.lines_added || 0) + (commitData.commitData?.lines_removed || 0));
        
        // Update ML-specific stats if available
        if (document.getElementById('reviewersCount')) {
            document.getElementById('reviewersCount').textContent = commitData.commitData?.reviewers_count || 0;
        }
        
        if (document.getElementById('patchsetsCount')) {
            document.getElementById('patchsetsCount').textContent = commitData.commitData?.patchsets_count || 0;
        }
        
        if (document.getElementById('unresolvedComments')) {
            document.getElementById('unresolvedComments').textContent = commitData.commitData?.unresolved_comments || 0;
        }
        
        if (document.getElementById('timeOfDay')) {
            const hour = commitData.commitData?.commit_hour || new Date().getHours();
            document.getElementById('timeOfDay').textContent = `${hour}:00`;
        }
        
        // Update recommendations
        const recommendationList = document.getElementById('recommendationList');
        recommendationList.innerHTML = '';
        
        if (commitData.riskFactors && commitData.riskFactors.length > 0) {
            commitData.riskFactors.forEach(function(factor) {
                const li = document.createElement('li');
                li.textContent = factor;
                recommendationList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No recommendations needed.';
            recommendationList.appendChild(li);
        }
        
        // Update TR section (if needed)
        displayTrForRepo(commitData.commitData?.repository);
        
        // Show the TR section
        const trSection = document.getElementById('trSection');
        if (trSection) {
            trSection.style.display = 'block';
        }
        
        // Show results section
        results.style.display = 'block';
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
        if (['h', 'cpp', 'c++', 'c'].includes(fileType)) {
            codeElement.className = 'language-cpp';
        } else if (fileType === 'js' || fileType === 'javascript') {
            codeElement.className = 'language-javascript';
        } else if (fileType === 'py' || fileType === 'python') {
            codeElement.className = 'language-python';
        } else {
            codeElement.className = 'language-clike';
        }
        
        // Set the code content as text (not HTML)
        codeElement.textContent = code || 'No code preview available.';
        
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
    
    function displayTrForRepo(repoName) {
        const trList = document.getElementById('trList');
        if (!trList) return;
        
        // Clear current list
        trList.innerHTML = '';
        
        const yearFilter = document.getElementById('trYearFilter').value;
        
        // Simulate TR display logic - you would typically fetch this from a backend
        const dummyTRs = [
            {
                id: 'TR-001',
                title: 'Performance Bottleneck',
                description: 'Identified slow query in user authentication service',
                status: 'Open',
                severity: 'High',
                dateSubmitted: '2025-03-01'
            }
        ];
        
        if (dummyTRs.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'tr-empty-state';
            emptyState.textContent = `No troubleshooting reports found for ${repoName}`;
            trList.appendChild(emptyState);
            return;
        }
        
        // Create TR items
        dummyTRs.forEach(report => {
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
            
            trList.appendChild(trItem);
        });
    }
});

// Export functions that might be used externally
export { 
    displayCodePreview 
};