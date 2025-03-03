import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import uuid
import hashlib

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Number of synthetic commits to generate
NUM_COMMITS = 1000

# Repositories list
REPOSITORIES = ["frontend-app", "core-utils", "libclient", "rc", "rpcppg2"]

def generate_synthetic_commit_data():
    data = []
    
    # Generate date range (last 1 year of commits)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    dates = [start_date + timedelta(days=x) for x in range((end_date - start_date).days)]
    
    for _ in range(NUM_COMMITS):
        # Select a random repository
        repo = random.choice(REPOSITORIES)
        
        # Generate a commit hash
        commit_hash = hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()[:40]
        
        # Select random date and determine if it's Friday or weekend
        commit_date = random.choice(dates)
        is_friday = 1 if commit_date.weekday() == 4 else 0
        is_weekend = 1 if commit_date.weekday() >= 5 else 0
        
        # Generate commit hour (time of day)
        # Create hour distribution - more commits during work hours
        hour_weights = np.array([0.02, 0.01, 0.01, 0.01, 0.02, 0.05, 0.07, 0.08, 0.09, 0.1, 
                       0.1, 0.09, 0.08, 0.09, 0.08, 0.07, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.01, 0.01])
        
        # Normalize to ensure weights sum to 1
        hour_weights = hour_weights / np.sum(hour_weights)
        commit_hour = np.random.choice(range(24), p=hour_weights)
        after_hours = 1 if commit_hour < 9 or commit_hour > 17 else 0
        
        # Generate different distributions based on repository
        if repo in ["frontend-app", "core-utils"]:
            # Frontend tends to have more files changed but fewer lines per file
            files_changed = max(1, int(np.random.exponential(5)))
            lines_added = int(np.random.exponential(20) * files_changed)
            lines_removed = int(np.random.exponential(10) * files_changed)
        else:
            # Backend code tends to have fewer files but more lines per file
            files_changed = max(1, int(np.random.exponential(3)))
            lines_added = int(np.random.exponential(40) * files_changed)
            lines_removed = int(np.random.exponential(20) * files_changed)
        
        # Generate reviewers (inverse relationship with risk)
        # High-risk commits tend to have fewer reviewers
        reviewers_count = max(1, min(5, int(np.random.normal(2.5, 1.0))))
        
        # Generate number of patchsets (revisions)
        # High-risk commits tend to have more patchsets
        patchsets_count = max(1, int(np.random.exponential(3)))
        
        # Generate unresolved comments
        # More complex/risky changes tend to have more unresolved comments
        unresolved_comments = max(0, int(np.random.exponential(1)))
        
        # Repository TR counts (some repos are more problematic than others)
        if repo in ["rpcppg2", "libclient"]:
            # These repos have more TRs
            repo_trs_count = int(np.random.normal(15, 5))
        else:
            repo_trs_count = int(np.random.normal(7, 3))
        
        repo_trs_count = max(0, repo_trs_count)
        
        # Unresolved TRs count (subset of repo TRs)
        unresolved_trs_count = min(repo_trs_count, max(0, int(repo_trs_count * np.random.beta(1, 3))))
        
        # Calculate risk score based on our risk factors
        # More lines, more files, fewer reviewers, Friday/weekend commits all increase risk
        
        risk_base = 0
        
        # Lines changed factor (0-40 points)
        lines_factor = min(40, (lines_added + lines_removed) / 25)
        risk_base += lines_factor
        
        # Files changed factor (0-20 points)
        files_factor = min(20, files_changed * 3)
        risk_base += files_factor
        
        # Reviewers factor (0-15 points, inverse - fewer reviewers means higher risk)
        reviewers_factor = max(0, 15 - (reviewers_count * 3))
        risk_base += reviewers_factor
        
        # Time factor (0-10 points)
        time_factor = 0
        if is_weekend:
            time_factor += 10
        elif is_friday:
            time_factor += 7
        if after_hours:
            time_factor += 3
        risk_base += min(10, time_factor)
        
        # Unresolved comments factor (0-5 points)
        comments_factor = min(5, unresolved_comments * 2)
        risk_base += comments_factor
        
        # Patchsets factor (0-5 points)
        patchsets_factor = min(5, patchsets_count)
        risk_base += patchsets_factor
        
        # TRs factor (0-5 points)
        trs_factor = min(5, unresolved_trs_count)
        risk_base += trs_factor
        
        # Add random noise (+/- 10%)
        noise = random.uniform(0.9, 1.1)
        risk_score = max(0, min(100, risk_base * noise))
        
        # Determine risk level
        if risk_score >= 70:
            risk_level = "High"
        elif risk_score >= 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        # Format timestamp
        commit_timestamp = commit_date.replace(hour=commit_hour).isoformat()
        
        # Create commit record
        commit = {
            'commit_id': commit_hash,
            'repo': repo,
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
            'risk_score': round(risk_score, 2),
            'risk_level': risk_level
        }
        
        data.append(commit)
    
    return pd.DataFrame(data)

def main():
    print("Generating synthetic commit data...")
    df = generate_synthetic_commit_data()
    
    # Save to CSV
    output_file = "synthetic_commit_data.csv"
    df.to_csv(output_file, index=False)
    
    print(f"Generated {len(df)} synthetic commits and saved to {output_file}")
    
    # Print some stats
    print("\nData Summary:")
    print(f"Risk Level Distribution:\n{df['risk_level'].value_counts()}")
    print(f"\nRisk Score Range: {df['risk_score'].min()} - {df['risk_score'].max()}")
    print(f"Average Risk Score: {df['risk_score'].mean():.2f}")
    
    print("\nAverage values by risk level:")
    for level in ["Low", "Medium", "High"]:
        subset = df[df['risk_level'] == level]
        if len(subset) > 0:
            print(f"\n{level} Risk ({len(subset)} commits):")
            print(f"  Lines Added: {subset['lines_added'].mean():.1f}")
            print(f"  Files Changed: {subset['files_changed'].mean():.1f}")
            print(f"  Reviewers: {subset['reviewers_count'].mean():.1f}")
            print(f"  Unresolved Comments: {subset['unresolved_comments'].mean():.1f}")
            print(f"  Friday Commits: {(subset['is_friday'] == 1).mean() * 100:.1f}%")
            print(f"  Weekend Commits: {(subset['is_weekend'] == 1).mean() * 100:.1f}%")
    
    print("\nSample data (first 5 rows):")
    print(df.head().to_string())
    
if __name__ == "__main__":
    main()