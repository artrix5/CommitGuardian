import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import uuid

# Set a random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Number of mock records to generate
n_records = 5000

# Define repositories
repositories = ['frontend-app', 'backend-service', 'data-processing', 'authentication', 'mobile-app']

# Define programming languages with weights
languages = ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Ruby', 'TypeScript', 'C#', 'PHP', 'Swift']
language_weights = [0.25, 0.2, 0.15, 0.1, 0.08, 0.05, 0.07, 0.05, 0.03, 0.02]

# Define languages with manual memory allocation (higher risk)
memory_allocation_languages = ['C++', 'C', 'Rust']

# Create empty DataFrame
data = []

# Generate mock data
end_date = datetime.now()
start_date = end_date - timedelta(days=365)  # Last year of commits

for _ in range(n_records):
    # Generate a random commit timestamp within the last year
    commit_timestamp = start_date + (end_date - start_date) * random.random()
    
    # Extract temporal features
    commit_hour = commit_timestamp.hour
    is_friday = 1 if commit_timestamp.weekday() == 4 else 0
    is_weekend = 1 if commit_timestamp.weekday() >= 5 else 0
    after_hours = 1 if commit_hour < 9 or commit_hour > 17 else 0
    
    # Repository and language
    repository = random.choice(repositories)
    programming_language = np.random.choice(languages, p=language_weights)
    
    # Multiple languages - increased probability and impact
    multiple_languages = 1 if random.random() < 0.3 else 0
    
    # Memory allocation risk flag
    has_manual_memory_allocation = 1 if programming_language in memory_allocation_languages else 0
    
    # Code change metrics (with some correlation to risk)
    risk_factor = random.random()  # Hidden factor to correlate features
    
    lines_added = int(np.random.exponential(50) * (1 + risk_factor))
    lines_removed = int(np.random.exponential(30) * (1 + 0.5 * risk_factor))
    files_changed = max(1, int(np.random.exponential(3) * (1 + 0.7 * risk_factor)))
    
    # Review process metrics - smaller commit messages increase risk
    commit_message_length = int(np.random.normal(50, 30) * (1 - 0.3 * risk_factor))
    reviewers_count = max(0, int(np.random.normal(2, 1)))
    unresolved_comments = max(0, int(np.random.exponential(1) * risk_factor * 3))
    
    # Increase patchsets impact on risk
    patchsets_count = max(1, int(np.random.exponential(2) * (1 + 0.5 * risk_factor)))
    
    # Repository context - any TRs increase risk
    repo_trs_count = max(0, int(np.random.exponential(20)))
    # If there are no TRs in the repo, there can't be any unresolved or critical TRs
    if repo_trs_count == 0:
        unresolved_trs_count = 0
        critical_trs_count = 0
    else:
        unresolved_trs_count = max(0, int(repo_trs_count * 0.3 * random.random()))
        critical_trs_count = max(0, int(unresolved_trs_count * 0.4 * random.random()))
    
    # Build stability as binary (yes/no) - if tests failed once and then passed
    # Higher risk_factor means more likely to have failed tests
    build_failed = 1 if random.random() < 0.3 * risk_factor else 0
    
    # Risk calculation with the new factors
    # Factors that increase risk:
    # - Large changes (lines, files)
    # - Weekend/after hours commits
    # - Few reviewers
    # - Many unresolved comments
    # - Failed builds
    # - Critical TRs
    # - Multiple programming languages
    # - Manual memory allocation languages
    # - Big number of patchsets
    # - Small commit message
    
    risk_score = (
        0.15 * risk_factor +
        0.10 * (lines_added / 500) +
        0.05 * (files_changed / 10) + 
        0.05 * is_weekend +
        0.05 * after_hours +
        0.05 * (max(0, 3 - reviewers_count) / 3) +
        0.10 * (unresolved_comments / 5) +
        0.10 * build_failed +  # Binary build stability
        0.05 * (1 if repo_trs_count > 0 else 0) +  # Any TRs increase risk
        0.10 * (critical_trs_count / 5) +
        0.10 * multiple_languages +  # Multiple languages increase risk
        0.10 * has_manual_memory_allocation +  # Manual memory allocation increases risk
        0.05 * (patchsets_count / 5) +  # More patchsets increase risk
        0.05 * (1 - min(1, commit_message_length / 30))  # Shorter commit messages increase risk
    )
    
    # Add some randomness
    risk_score = min(1, risk_score * 0.8 + random.random() * 0.2)
    
    # Convert risk_score to 0-100 scale
    risk_score_scaled = int(risk_score * 100)  # Convert 0-1 to 0-100
    
    # Assign risk level
    if risk_score < 0.3:
        risk_level = "low"
    elif risk_score < 0.6:
        risk_level = "medium"
    else:
        risk_level = "high"
    
    # Generate a unique commit ID
    commit_id = str(uuid.uuid4())[:8]
    
    # Add record to data
    data.append({
        'commit_id': commit_id,
        'commit_message_length': commit_message_length,
        'repository': repository,
        'lines_added': lines_added,
        'lines_removed': lines_removed,
        'files_changed': files_changed,
        'commit_timestamp': commit_timestamp,
        'commit_hour': commit_hour,
        'is_friday': is_friday,
        'is_weekend': is_weekend,
        'after_hours': after_hours,
        'unresolved_comments': unresolved_comments,
        'reviewers_count': reviewers_count,
        'patchsets_count': patchsets_count,
        'repo_trs_count': repo_trs_count,
        'unresolved_trs_count': unresolved_trs_count,
        'critical_trs_count': critical_trs_count,
        'build_failed': build_failed,  # Changed from build_stability percentage
        'programming_language': programming_language,
        'has_manual_memory_allocation': has_manual_memory_allocation,  # New field
        'are_multiple_programming_languages_present': multiple_languages,
        'risk_score': risk_score_scaled,  # Added numerical risk score (0-100)
        'risk_level': risk_level
    })

# Create DataFrame
df = pd.DataFrame(data)

# Convert timestamp to string for CSV export
df['commit_timestamp'] = df['commit_timestamp'].astype(str)

# Save to CSV
df.to_csv('commit_risk_training_data.csv', index=False)

# Print dataset statistics
print(f"Generated {n_records} mock commit records")
print("\nRisk level distribution:")
print(df['risk_level'].value_counts())

print("\nRepository distribution:")
print(df['repository'].value_counts())

print("\nProgramming language distribution:")
print(df['programming_language'].value_counts())

print("\nManual memory allocation languages:")
print(df['has_manual_memory_allocation'].value_counts())

print("\nMultiple programming languages:")
print(df['are_multiple_programming_languages_present'].value_counts())

print("\nBuild failures:")
print(df['build_failed'].value_counts())

# Distribution of risk scores (0-100)
print("\nRisk score distribution:")
print(f"Min: {df['risk_score'].min()}, Max: {df['risk_score'].max()}")
print(f"Mean: {df['risk_score'].mean():.2f}, Median: {df['risk_score'].median()}")
print(f"25th percentile: {df['risk_score'].quantile(0.25)}")
print(f"75th percentile: {df['risk_score'].quantile(0.75)}")

# Show sample records
print("\nSample records:")
print(df.head())