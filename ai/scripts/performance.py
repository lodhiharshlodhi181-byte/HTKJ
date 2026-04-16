def detect_weak_topics(results_data: dict):
    # Dummy ML inference logic for 'model.pkl'
    # Actually we'll just check what questions the user got wrong.
    
    weak_topics = ["Topic X"]
    if results_data.get('scores'):
        # Just an example heuristic
        for score in results_data['scores']:
            if score < 50:
                weak_topics.append("Needs Improvement")
                
    return {
        "weak_topics": list(set(weak_topics)),
        "study_plan": [f"Review {topic}" for topic in list(set(weak_topics))]
    }
