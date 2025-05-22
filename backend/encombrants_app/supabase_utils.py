import os
import requests

def supabase_request(method, endpoint, data=None, params=None):
    base_url = os.getenv("VITE_SUPABASE_URL")
    api_key = os.getenv("VITE_SUPABASE_ANON_KEY")

    if not base_url or not api_key:
        raise ValueError("Supabase URL or API key not configured.")

    url = f"{base_url}/rest/v1/{endpoint}"
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

    return requests.request(method, url, headers=headers, json=data, params=params)
