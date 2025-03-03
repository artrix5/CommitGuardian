# score.py - Inference script for CommitPredictionAI model
import json
import numpy as np
import pandas as pd
import os
import mlflow

def init():
    """
    Initialize the model.
    This function is called when the container is started.
    """
    global model
    
    # Get model path in the deployment environment
    model_dir = os.getenv('AZUREML_MODEL_DIR')
    
    # For MLflow models, the structure is different than for regular pkl files
    # Print directory structure for debugging
    print(f"Files in model directory: {os.listdir(model_dir)}")
    
    # Load MLflow model - this handles both classification and regression in one model
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
        
        # Expected columns based on your training data
        expected_columns = [
            'repo', 'lines_added', 'lines_removed', 'files_changed', 
            'commit_hour', 'is_friday', 'is_weekend', 'after_hours',
            'unresolved_comments', 'reviewers_count', 'patchsets_count', 
            'repo_trs_count', 'unresolved_trs_count'
        ]
        
        # Check if all expected columns are present
        missing_columns = [col for col in expected_columns if col not in input_df.columns]
        if missing_columns:
            return json.dumps({"error": f"Missing columns: {', '.join(missing_columns)}"})
        
        # Get predictions
        # MLflow models can return different formats depending on the model type
        predictions = model.predict(input_df)
        
        # Handle different prediction result formats
        if isinstance(predictions, pd.DataFrame):
            # If predictions is a DataFrame, it might have multiple columns
            if 'risk_score' in predictions.columns and 'risk_level' in predictions.columns:
                risk_score = predictions['risk_score'].tolist()
                risk_level = predictions['risk_level'].tolist()
            else:
                # If column names are different, use first column for score and second for level
                risk_score = predictions.iloc[:, 0].tolist()
                risk_level = predictions.iloc[:, 1].tolist() if predictions.shape[1] > 1 else ["Medium"] * len(risk_score)
        else:
            # If predictions is not a DataFrame, assume it's a numpy array or list
            if isinstance(predictions, (np.ndarray, list)):
                if len(np.array(predictions).shape) > 1 and np.array(predictions).shape[1] >= 2:
                    # If 2D array with at least 2 columns
                    risk_score = np.array(predictions)[:, 0].tolist()
                    risk_level = np.array(predictions)[:, 1].tolist()
                else:
                    # If 1D array, assume it's the risk score
                    risk_score = np.array(predictions).flatten().tolist()
                    # Convert numerical scores to risk levels
                    risk_level = []
                    for score in risk_score:
                        if score >= 70:
                            risk_level.append("High")
                        elif score >= 40:
                            risk_level.append("Medium")
                        else:
                            risk_level.append("Low")
            else:
                return json.dumps({"error": f"Unexpected prediction format: {type(predictions)}"})
        
        # Return predictions
        return json.dumps({
            "risk_score": risk_score,
            "risk_level": risk_level
        })
    
    except Exception as e:
        # Return error message
        error_message = str(e)
        import traceback
        traceback_str = traceback.format_exc()
        return json.dumps({"error": error_message, "traceback": traceback_str})