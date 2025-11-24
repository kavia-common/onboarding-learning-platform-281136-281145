#!/bin/bash
cd /home/kavia/workspace/code-generation/onboarding-learning-platform-281136-281145/onbording_lms_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

