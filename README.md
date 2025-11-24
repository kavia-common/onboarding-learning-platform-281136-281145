# onboarding-learning-platform-281136-281145

This workspace contains the onboarding LMS frontend featuring router-driven pages, onboarding wizard, documents acknowledgment, basic catalog and dashboard. See `onbording_lms_frontend/README.md` for details.

Preview-only mode: you can limit the frontend to Documents flow by setting `REACT_APP_PREVIEW_DOCUMENTS_ONLY=true` in `onbording_lms_frontend/.env`. In this mode, `/documents` is the default route, navigation to other routes is hidden/redirected, and a banner indicates "Preview mode: Documents only".