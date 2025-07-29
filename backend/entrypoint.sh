#!/bin/bash

# Entrypoint script for FastAPI backend deployment
# Handles production deployment tasks

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting What's the Chance? API deployment...${NC}"

# Wait for database to be ready (if using external DB)
if [ "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
    python -c "
import time
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError

db_url = os.getenv('DATABASE_URL')
if db_url:
    for i in range(30):
        try:
            engine = create_engine(db_url)
            engine.connect()
            print('✅ Database is ready!')
            break
        except OperationalError:
            time.sleep(1)
    else:
        print('❌ Database connection failed')
        sys.exit(1)
"
fi

# Run database migrations (if applicable)
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
# alembic upgrade head  # Uncomment when using Alembic

# Start the application
echo -e "${GREEN}🎮 Starting the API server...${NC}"
exec uvicorn main:app \
    --host 0.0.0.0 \
    --port ${PORT:-8000} \
    --workers ${WORKERS:-4} \
    --log-level info \
    --access-log
