import csv
import random
import matplotlib.pyplot as plt
from collections import defaultdict

# Define fields for the CSV
fields = [
    "author_experience", "repository", "caused_TR", "problematic_integration", "lines_added", "lines_deleted",
    "files_changed", "programming_language", "multiple_languages", "num_reviewers", "num_comments",
    "num_unresolved_comments", "num_patchsets", "reviewer_experience", "past_TRs", "active_TRs", "critical_TRs",
    "ci_cd_status", "hour", "day_of_week", "time_since_last_commit", "test_coverage",
    "documentation_changes", "risk_score"
]

# List of repositories
repositories = [
    "payment-gateway", "data-analytics", "message-queue", "auth-service", "image-processor", "iot-controller"
]

# List of programming languages (including C, C++, and Erlang)
programming_languages = ["Python", "Java", "C++", "C", "Erlang"]

# Days of the week
days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

# Function to generate risk score based on detailed risk factors
def calculate_risk_score(commit):
    risk_score = 0  # Start with a baseline score
    # Rest of function remains the same
   # 1. Author Experience
    if commit["author_experience"] == 1:  # Junior developer
        risk_score += random.uniform(5.0, 10.0)
    elif commit["author_experience"] == 2:  # Mid-level developer
        risk_score += random.uniform(2.0, 7.0)
    elif commit["author_experience"] == 3:  # Senior developer
        risk_score += random.uniform(0.0, 3.0)  # Minimal risk for senior developers

    # 2. Repository Risk
    if commit["repository"] in ["payment-gateway", "auth-service"]:  # Critical repositories
        risk_score += random.uniform(3.0, 8.0)

    # 3. Caused TR or Problematic Integration
    if commit["caused_TR"] == 1:
        risk_score += random.uniform(15.0, 25.0)
    elif commit["problematic_integration"] == 1:
        risk_score += random.uniform(7.0, 15.0)

    # 4. Code Metrics
    if commit["lines_added"] > 200:
        risk_score += random.uniform(3.0, 8.0)
    if commit["lines_deleted"] > 100:
        risk_score += random.uniform(3.0, 8.0)
    if commit["files_changed"] > 10:
        risk_score += random.uniform(3.0, 8.0)
    if commit["multiple_languages"] == 1:
        risk_score += random.uniform(2.0, 5.0)

    # 5. Programming Language Risk
    if commit["programming_language"] in ["C", "C++", "Erlang"]:  # Higher risk for certain languages
        risk_score += random.uniform(5.0, 15.0)

    # 6. Collaboration Insights
    if commit["num_reviewers"] < 2:
        risk_score += random.uniform(3.0, 6.0)
    if commit["num_comments"] > 10:
        risk_score += random.uniform(2.0, 5.0)
    if commit["num_unresolved_comments"] > 0:
        risk_score += random.uniform(3.0, 7.0)

    # 7. Day of the Week Risk (Mondays and Fridays are riskier)
    if commit["day_of_week"] == "Monday" or commit["day_of_week"] == "Friday":
        risk_score += random.uniform(5.0, 10.0)
    elif commit["day_of_week"] == "Saturday" or commit["day_of_week"] == "Sunday":
        risk_score += random.uniform(7.0, 12.0)

    # 8. Time Since Last Commit (recent commits might be riskier)
    if commit["time_since_last_commit"] > 24:  # More than 24 hours since last commit
        risk_score += random.uniform(2.0, 5.0)

    # 9. Test Coverage (lower coverage increases risk)
    if commit["test_coverage"] < 50:  # Low test coverage
        risk_score += random.uniform(5.0, 10.0)

    # 10. Documentation Changes (lack of documentation increases risk)
    if commit["documentation_changes"] == 0:  # No documentation changes
        risk_score += random.uniform(3.0, 7.0)

    # 11. Hour-Based Risk (after 17:00 is risky)
    if commit["hour"] < 7 or commit["hour"] >= 17:  # Risky hours (before 7:00 or after 17:00)
        risk_score += random.uniform(5.0, 10.0)  # Increased risk

    # 12. High Number of Patchsets (more patchsets increase risk)
    if commit["num_patchsets"] > 5:  # High number of patchsets
        risk_score += random.uniform(5.0, 10.0)  # Increased risk

    # 13. More Lines Deleted Than Added (increases risk)
    if commit["lines_deleted"] > commit["lines_added"]:  # More deletions than additions
        risk_score += random.uniform(5.0, 10.0)  # Increased risk

    # Cap the risk score to avoid negative values or excessive values (range 0 to 100)
    risk_score = max(0.0, min(risk_score, 100.0))

    return risk_score


# Generate 5000 commits with detailed random data
commits = []
for _ in range(5000):
    commit = {
        "author_experience": random.choice([1, 2, 3]),  # 1 for Junior, 2 for Mid-level, 3 for Senior-Level
        "repository": random.choice(repositories),
        "caused_TR": random.choice([0, 1]),
        "problematic_integration": random.choice([0, 1]),
        "lines_added": random.randint(0, 500),
        "lines_deleted": random.randint(0, 200),
        "files_changed": random.randint(1, 20),
        "programming_language": random.choice(programming_languages),
        "multiple_languages": random.choice([0, 1]),
        "num_reviewers": random.randint(1, 5),
        "num_comments": random.randint(0, 20),
        "num_unresolved_comments": random.randint(0, 5),
        "num_patchsets": random.randint(1, 10),
        "reviewer_experience": random.choice([1, 2, 3]),  # 1 for Junior, 2 for Senior, 3 for Senior
        "past_TRs": random.randint(0, 30),
        "active_TRs": random.randint(0, 5),
        "critical_TRs": random.randint(0, 3),
        "ci_cd_status": random.choice(["passing", "failing"]),
        "hour": random.randint(0, 23),  # Random hour of the day (0-23)
        "day_of_week": random.choice(days_of_week),
        "time_since_last_commit": random.randint(1, 72),  # Hours since last commit
        "test_coverage": random.randint(30, 100),  # Test coverage percentage
        "documentation_changes": random.choice([0, 1]),  # 0 for no, 1 for yes
    }
    commit["risk_score"] = calculate_risk_score(commit)
    commits.append(commit)

# Write the generated commits to a CSV file
with open('commits.csv', mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=fields)
    writer.writeheader()
    writer.writerows(commits)

# Plot histogram of risk scores
risk_scores = [commit["risk_score"] for commit in commits]
plt.hist(risk_scores, bins=20, edgecolor='black', alpha=0.7)
plt.title("Distribution of Risk Scores")
plt.xlabel("Risk Score")
plt.ylabel("Frequency")
plt.show()