# Setup

1. Open the `backend` folder in VS Code.
2. Make sure Java 17+ and Maven are installed.
3. Create a PostgreSQL database named `zipcon`.
4. Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` if your local values differ.
5. Run `mvn spring-boot:run` from `backend`.
6. Test `GET /api/health`.

The scaffold intentionally does not implement real authentication, all business rules, controllers for every domain, or production database migrations yet. Those are implementation tasks for the team.
