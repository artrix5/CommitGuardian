from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import requests
from openai import OpenAI

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = "gpt-4o-mini"
MOCK_DATA_PATH = os.getenv("MOCK_DATA_PATH", "mock_commits.json")
RISK_SCORING_API = os.getenv("RISK_SCORING_API", "https://proteusai-vejyq.swedencentral.inference.ml.azure.com/score")
RISK_SCORING_API_KEY = os.getenv("RISK_SCORING_API_KEY")

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

# Load mock commit data
def load_commit_data():
    try:
        with open(MOCK_DATA_PATH, 'r') as f:
            data = json.load(f)
            # Handle different possible JSON structures
            commits = data.get('commits', data) if isinstance(data, dict) else data
            print(f"Loaded {len(commits)} mock commits")
            return commits
    except Exception as e:
        print(f"Error loading mock data: {e}")
        return []

# Load data at startup
mock_data = load_commit_data()

def create_analysis_prompt(commit_data):
    """Create a structured prompt for GPT-4o-mini"""
    prompt = f"""
    Analyze this code commit and provide specific recommendations to reduce risk.
    
    COMMIT DATA:
    - Commit ID: {commit_data.get('commit_id')}
    - Repository: {commit_data.get('repository')}
    - Programming Language: {commit_data.get('programming_language')}
    - Multiple Languages Present: {"Yes" if commit_data.get('are_multiple_programming_languages_present') == 1 else "No"}
    - Manual Memory Allocation: {"Yes" if commit_data.get('has_manual_memory_allocation') == 1 else "No"}
    
    CODE METRICS:
    - Lines Added: {commit_data.get('lines_added')}
    - Lines Removed: {commit_data.get('lines_removed')}
    - Files Changed: {commit_data.get('files_changed')}
    - Commit Message Length: {commit_data.get('commit_message_length')} characters
    
    REVIEW PROCESS:
    - Reviewers Count: {commit_data.get('reviewers_count')}
    - Unresolved Comments: {commit_data.get('unresolved_comments')}
    - Patchsets Count: {commit_data.get('patchsets_count')}
    
    BUILD INFO:
    - Build Failed: {"Yes" if commit_data.get('build_failed') == 1 else "No"}
    
    REPOSITORY CONTEXT:
    - Total TRs: {commit_data.get('repo_trs_count')}
    - Unresolved TRs: {commit_data.get('unresolved_trs_count')}
    - Critical TRs: {commit_data.get('critical_trs_count')}
    
    TIMING:
    - Weekend Commit: {"Yes" if commit_data.get('is_weekend') == 1 else "No"}
    - Friday Commit: {"Yes" if commit_data.get('is_friday') == 1 else "No"}
    - After Hours: {"Yes" if commit_data.get('after_hours') == 1 else "No"}
    
    Return your response in this exact format:

    RISK FACTORS:
    - [List the top risk factors in order of importance]
    
    RECOMMENDATIONS:
    [Provide specific, actionable recommendations on how to reduce the risk of this commit]
    """
    return prompt

def parse_gpt_response(response_text):
    """Parse GPT response to extract risk factors and recommendations"""
    # Default values
    risk_factors = []
    recommendations = ""
    
    # Split response by sections
    if "RISK FACTORS:" in response_text and "RECOMMENDATIONS:" in response_text:
        # Extract risk factors
        risk_section = response_text.split("RISK FACTORS:")[1].split("RECOMMENDATIONS:")[0].strip()
        risk_factors = [factor.strip()[2:].strip() for factor in risk_section.split('\n') if factor.strip().startswith('-')]
        
        # Extract recommendations
        recommendations = response_text.split("RECOMMENDATIONS:")[1].strip()
    else:
        # If format is not as expected, use the whole response as recommendations
        recommendations = response_text
    
    return risk_factors, recommendations

def calculate_risk_score(commit_data):
    """
    Calculate risk score by calling the Azure ML risk scoring API
    """
    try:
        # Transform commit data for the ML model
        input_data = {
            "data": [{
                "commit_id": commit_data.get('commit_id'),
                "commit_message_length": commit_data.get('commit_message_length'),
                "repository": commit_data.get('repository'),
                "lines_added": commit_data.get('lines_added'),
                "lines_removed": commit_data.get('lines_removed'),
                "files_changed": commit_data.get('files_changed'),
                "commit_hour": commit_data.get('commit_hour'),
                "is_friday": commit_data.get('is_friday'),
                "is_weekend": commit_data.get('is_weekend'),
                "after_hours": commit_data.get('after_hours'),
                "unresolved_comments": commit_data.get('unresolved_comments'),
                "reviewers_count": commit_data.get('reviewers_count'),
                "patchsets_count": commit_data.get('patchsets_count'),
                "repo_trs_count": commit_data.get('repo_trs_count'),
                "unresolved_trs_count": commit_data.get('unresolved_trs_count'),
                "critical_trs_count": commit_data.get('critical_trs_count'),
                "build_failed": commit_data.get('build_failed'),
                "programming_language": commit_data.get('programming_language'),
                "has_manual_memory_allocation": commit_data.get('has_manual_memory_allocation'),
                "are_multiple_programming_languages_present": commit_data.get('are_multiple_programming_languages_present')
            }]
        }
        
        # Call Azure ML scoring endpoint
        response = requests.post(
            RISK_SCORING_API,
            json=input_data,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {RISK_SCORING_API_KEY}'
            },
            timeout=10  # 10 second timeout
        )
        
        if response.status_code != 200:
            print(f"Risk API Error: {response.status_code} - {response.text}")
            # Return fallback calculation
            return calculate_fallback_risk_score(commit_data)
            
        result = response.json()
        
        # Handle different response formats
        if 'risk_score' in result and isinstance(result['risk_score'], list):
            score = float(result['risk_score'][0])
            level = result['risk_level'][0]
            return score, level
        elif isinstance(result, list):
            score = float(result[0])
            # Determine risk level based on score
            if score >= 70:
                level = "High"
            elif score >= 40:
                level = "Medium"
            else:
                level = "Low"
            return score, level
        else:
            print(f"Unexpected response format: {result}")
            return calculate_fallback_risk_score(commit_data)
            
    except Exception as e:
        print(f"Error calling risk scoring API: {e}")
        return calculate_fallback_risk_score(commit_data)

def calculate_fallback_risk_score(commit_data):
    """Fallback risk calculation if API fails"""
    # Get numeric values with defaults
    lines_added = float(commit_data.get('lines_added', 0))
    lines_removed = float(commit_data.get('lines_removed', 0))
    files_changed = float(commit_data.get('files_changed', 0))
    unresolved_comments = float(commit_data.get('unresolved_comments', 0))
    critical_trs = float(commit_data.get('critical_trs_count', 0))
    multiple_languages = float(commit_data.get('are_multiple_programming_languages_present', 0))
    manual_memory = float(commit_data.get('has_manual_memory_allocation', 0))
    
    # Basic risk calculation
    risk_score = (
        (lines_added + lines_removed) / 10 * 0.4 +
        files_changed * 5 * 0.2 +
        unresolved_comments * 10 * 0.1 +
        critical_trs * 15 * 0.1 +
        multiple_languages * 20 * 0.1 +
        manual_memory * 20 * 0.1
    )
    
    # Cap at 100
    risk_score = min(100, risk_score)
    
    # Determine risk level
    if risk_score >= 70:
        risk_level = "High"
    elif risk_score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"
        
    return risk_score, risk_level

@app.route('/analyze', methods=['POST'])
def analyze_commit():
    # Get request data
    data = request.json
    commit_id = data.get('commitId')
    
    # Find commit in mock data
    commit_data = next((commit for commit in mock_data if commit.get('commit_id') == commit_id), None)
    
    if not commit_data:
        return jsonify({
            'error': f'Commit ID {commit_id} not found',
            'commitId': commit_id
        }), 404
    
    # Ensure we're using the correct nested structure if applicable
    commit_data = commit_data.get('commit', commit_data)
    
    try:
        # Prepare prompt for GPT-4o-mini
        prompt = create_analysis_prompt(commit_data)
        
        # Call GPT-4o-mini for analysis
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are an expert code reviewer and risk analyst. Analyze the commit data and provide specific recommendations to reduce risk."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        # Parse GPT response to extract risk factors and recommendations
        analysis_text = response.choices[0].message.content
        
        # Extract risk factors and recommendations
        risk_factors, recommendations = parse_gpt_response(analysis_text)
        
        # Call risk scoring API
        risk_score, risk_level = calculate_risk_score(commit_data)
        
        return jsonify({
            "commitId": commit_id,
            "commitData": commit_data,
            "riskFactors": risk_factors,
            "recommendations": recommendations,
            "risk_score": risk_score,
            "risk_level": risk_level
        })
        
    except Exception as e:
        return jsonify({
            'error': f'Error analyzing commit: {str(e)}',
            'commitId': commit_id
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "commit_count": len(mock_data)
    })

if __name__ == '__main__':
    app.run(debug=True, port=8000)