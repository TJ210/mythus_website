import os
import re
import json
import urllib.request
import urllib.error

CID = "-3373343849920815228"
# pb parameters details:
# 1y<CID>: CID of the place (signed 64-bit integer)
# 2i0: offset index
# 2i20: limit of reviews to fetch
# 3e1: Sort by Most Relevant
URL = f"https://www.google.com/maps/preview/review/listentries?authuser=0&hl=en&gl=in&pb=!1m2!1y{CID}!2m2!1i0!2i25!3e1"

headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

def clean_text(text):
    if not text:
        return ""
    # Remove excessive newlines and escape quotes
    text = text.replace('"', '\\"').replace('\n', ' ').strip()
    # Limit review length to avoid huge slides
    if len(text) > 280:
        text = text[:277] + "..."
    return text

def run():
    print(f"Fetching Google Reviews from: {URL}")
    req = urllib.request.Request(URL, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            body = response.read().decode("utf-8")
    except Exception as e:
        print(f"Network request failed: {e}")
        return False

    # Google prepends anti-CSRF characters: )]}'\n
    if body.startswith(")]}'"):
        body = body[4:].strip()

    try:
        data = json.loads(body)
    except Exception as e:
        print(f"Failed to parse JSON response: {e}")
        # Log a snippet of the response for debugging
        print(f"Response snippet: {body[:300]}")
        return False

    # Google Maps nested JSON format parsing
    # Index [2] usually contains the array of reviews
    try:
        raw_reviews = data[2]
        if not raw_reviews:
            print("No reviews array found at index 2.")
            return False
    except Exception as e:
        print(f"Could not access raw reviews at index 2: {e}")
        return False

    filtered_reviews = []
    for r in raw_reviews:
        try:
            # Parse components safely
            author_name = r[0][1]
            rating = int(r[4])
            
            # Review text is optional
            review_text = ""
            if len(r) > 2 and r[2]:
                review_text = r[2][0][0]
                
            # Date/Time
            relative_time = r[1] if len(r) > 1 else "recent"
            
            # Badge detection (e.g. Local Guide)
            badge = "Google Review"
            # Google marks Local Guide details in index [14]
            if len(r) > 14 and r[14]:
                badge = "Local Guide"

            # Filter for 4 and 5 stars, and only include reviews with text
            if rating in [4, 5] and review_text:
                filtered_reviews.append({
                    "name": author_name,
                    "rating": rating,
                    "text": clean_text(review_text),
                    "badge": badge,
                    "date": relative_time
                })
        except Exception as item_err:
            continue

    if not filtered_reviews:
        print("No 4-star or 5-star text reviews found in this response.")
        return False

    print(f"Successfully parsed {len(filtered_reviews)} reviews (4★ and 5★).")
    
    # We only show up to 6 reviews to keep the slide carousel clean and premium
    final_reviews = filtered_reviews[:6]

    # Now update script.js in place
    script_path = os.path.join(os.path.dirname(__file__), "script.js")
    if not os.path.exists(script_path):
        print(f"script.js not found at {script_path}")
        return False

    try:
        with open(script_path, "r", encoding="utf-8") as f:
            script_content = f.read()

        # Regex to locate const GOOGLE_REVIEWS = [ ... ];
        pattern = r"(const GOOGLE_REVIEWS = \[\s*.*?^\];)"
        
        # Format the reviews list as pretty JSON string with indentation
        reviews_json = json.dumps(final_reviews, indent=2)
        replacement = f"const GOOGLE_REVIEWS = {reviews_json};"
        
        # Perform replacement
        new_content, count = re.subn(pattern, replacement, script_content, flags=re.MULTILINE | re.DOTALL)
        
        if count == 0:
            print("Could not find patterns to replace in script.js. Check the pattern matching.")
            return False

        with open(script_path, "w", encoding="utf-8") as f:
            f.write(new_content)

        print(f"Updated script.js successfully with {len(final_reviews)} real Google reviews.")
        return True
    except Exception as file_err:
        print(f"Failed to write to script.js: {file_err}")
        return False

if __name__ == "__main__":
    success = run()
    # Return 0 status even on failure so GitHub Actions run doesn't fail
    # but logs tell the story.
    exit(0)
