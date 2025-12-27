"""
Simple script to start the AI API server without reload for testing
"""

import sys
import os
import logging
from ai_api_server import app

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    import uvicorn
    
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    logger.info("Starting AI Itinerary API Server (simple mode)...")
    
    try:
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8001,
            reload=False,  # Disable reload to avoid multiprocessing issues
            log_level="info"
        )
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server failed to start: {e}")
        sys.exit(1)