import jwt
import datetime

service_role_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyYXdmdWZpbGVtZ2toaGp3aGp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkwMzI1MCwiZXhwIjoyMDYzNDc5MjUwfQ.eA5i0INTrJqjYclYFwZvF7Ees6RLMrIUmIOfot-KMM4"
user_id = "417e24ba-c1af-4334-b861-ad956184f428"
exp = datetime.datetime.utcnow() + datetime.timedelta(hours=1)

token = jwt.encode({
    "sub": user_id,
    "role": "authenticated",
    "iss": "supabase",
    "exp": exp
}, service_role_key, algorithm="HS256")

print(token)
