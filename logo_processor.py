import os
from PIL import Image, ImageChops, ImageOps

def process_logos():
    assets_dir = '/Users/tejasatyanarayanathotakura/MY_LEARNINGS/mythus_page/assets'
    gold_color = (197, 168, 128, 255) # #c5a880
    
    for i in range(1, 8):
        filename = f"beer_logo_{i}.png"
        src_path = os.path.join(assets_dir, filename)
        dest_path = os.path.join(assets_dir, f"beer_logo_{i}_gold.png")
        
        if not os.path.exists(src_path):
            print(f"File {src_path} not found.")
            continue
            
        try:
            with Image.open(src_path) as img:
                img = img.convert('RGBA')
                
                # We need to find the bounding box of the logo drawings (black/dark parts)
                # First, convert to grayscale and invert it so the logo lines are white on black background
                gray = img.convert('L')
                inverted = ImageOps.invert(gray)
                
                # Get the bounding box of the non-black pixels (which is the logo drawing)
                bbox = inverted.getbbox()
                if bbox:
                    # Crop the logo with a small padding
                    padding = 20
                    width, height = img.size
                    left = max(0, bbox[0] - padding)
                    top = max(0, bbox[1] - padding)
                    right = min(width, bbox[2] + padding)
                    bottom = min(height, bbox[3] + padding)
                    
                    cropped = img.crop((left, top, right, bottom))
                    inverted_cropped = inverted.crop((left, top, right, bottom))
                else:
                    cropped = img
                    inverted_cropped = inverted
                
                # Create a solid gold image of the same size
                gold_img = Image.new('RGBA', cropped.size, color=gold_color)
                gold_img.putalpha(inverted_cropped)
                gold_img.save(dest_path, 'PNG')
                
                print(f"Processed: {filename} -> beer_logo_{i}_gold.png (Size: {gold_img.size})")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

if __name__ == '__main__':
    process_logos()
