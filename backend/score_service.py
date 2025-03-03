# score.py - Optimized inference script for CommitPredictionAI model
import json
import os
import pandas as pd
import mlflow
import numpy as np

def init():
    """
    Initialize the model.
    This function is called when the container is started.
    """
    global model
    
    # Get model path in the deployment environment
    model_dir = os.getenv('AZUREML_MODEL_DIR')
    
    # Load MLflow model
    model_path = os.path.join(model_dir, "CommitPredictionAI")
    print(f"Loading model from: {model_path}")
    
    model = mlflow.pyfunc.load_model(model_path)
    print("Model loaded successfully!")

def run(raw_data):
    """
    Run inference on input data.
    Args:
        raw_data (str): JSON string containing input data.
    Returns:
        str: JSON string containing model predictions.
    """
    try:
        # Parse input
        data = json.loads(raw_data)
        
        # Convert to DataFrame with expected schema
        input_df = pd.DataFrame(data['data'])
        
        # Expected columns based on training data
        expected_columns = [
            'commit_message_length', 'repository', 'lines_added', 'lines_removed', 
            'files_changed', 'commit_hour', 'is_friday', 'is_weekend', 'after_hours',
            'unresolved_comments', 'reviewers_count', 'patchsets_count', 
            'repo_trs_count', 'unresolved_trs_count', 'critical_trs_count',
            'build_failed', 'programming_language', 'has_manual_memory_allocation',
            'are_multiple_programming_languages_present'
        ]
        
        # Check if all expected columns are present
        missing_columns = set(expected_columns) - set(input_df.columns)
        if missing_columns:
            return json.dumps({"error": f"Missing columns: {', '.join(missing_columns)}"})
        
        # Get predictions
        predictions = model.predict(input_df)
        
        # Process prediction results in a standardized way
        predictions_array = np.array(predictions)
        
        # Handle different output formats
        if isinstance(predictions, pd.DataFrame):
            if 'risk_score' in predictions.columns:
                risk_scores = predictions['risk_score'].tolist()
            else:
                risk_scores = predictions.iloc[:, 0].tolist()
                
            if 'risk_level' in predictions.columns:
                risk_levels = predictions['risk_level'].tolist()
            else:
                # Generate risk levels based on scores if not provided
                risk_levels = categorize_risk_levels(risk_scores)
                
        elif len(predictions_array.shape) > 1 and predictions_array.shape[1] >= 2:
            # Handle 2D array outputs (score and level)
            risk_scores = predictions_array[:, 0].tolist()
            risk_levels = predictions_array[:, 1].tolist()
            
        else:
            # Handle scalar or 1D array outputs (just scores)
            risk_scores = predictions_array.flatten().tolist()
            risk_levels = categorize_risk_levels(risk_scores)
            
        # Return predictions
        return json.dumps({
            "risk_score": risk_scores,
            "risk_level": risk_levels
        })
    
    except Exception as e:
        import traceback
        return json.dumps({
            "error": str(e),
            "traceback": traceback.format_exc()
        })

def categorize_risk_levels(scores):
    """Convert numerical scores to risk levels."""
    return [
        "High" if score >= 70 else 
        "Medium" if score >= 40 else 
        "Low" 
        for score in scores
    ]