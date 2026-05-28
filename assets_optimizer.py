import os
from PIL import Image

def optimize_images():
    source_dirs = [
        ('/Users/tejasatyanarayanathotakura/MY_LEARNINGS/mythus_page/assets/drive_folder_1/Images', 'folder1'),
        ('/Users/tejasatyanarayanathotakura/MY_LEARNINGS/mythus_page/assets/drive_folder_2/Both Ambience', 'folder2')
    ]
    
    target_dir = '/Users/tejasatyanarayanathotakura/MY_LEARNINGS/mythus_page/assets/optimized'
    os.makedirs(target_dir, exist_ok=True)
    
    max_width = 1200
    jpeg_quality = 80
    
    processed_count = 0
    
    for src_path, folder_label in source_dirs:
        if not os.path.exists(src_path):
            print(f"Source path {src_path} does not exist. Skipping.")
            continue
            
        print(f"Optimizing images in {src_path}...")
        for filename in os.listdir(src_path):
            if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                full_src_path = os.path.join(src_path, filename)
                
                # Create a standardized lowercase name for the optimized version
                # Prefixing with folder label to avoid name conflicts
                base_name = os.path.splitext(filename)[0].lower().replace('-edit', '').replace('-hdr', '').replace(' ', '_')
                new_filename = f"{folder_label}_{base_name}.jpg"
                full_dest_path = os.path.join(target_dir, new_filename)
                
                try:
                    with Image.open(full_src_path) as img:
                        # Convert to RGB if it's RGBA
                        if img.mode != 'RGB':
                            img = img.convert('RGB')
                            
                        # Calculate ratio
                        w, h = img.size
                        if w > max_width:
                            ratio = max_width / float(w)
                            new_size = (max_width, int(float(h) * ratio))
                            img = img.resize(new_size, Image.Resampling.LANCZOS)
                            
                        # Save with optimization
                        img.save(full_dest_path, 'JPEG', quality=jpeg_quality, optimize=True)
                        processed_count += 1
                        print(f"Optimized: {filename} -> {new_filename} ({img.size[0]}x{img.size[1]})")
                except Exception as e:
                    print(f"Error processing {filename}: {e}")
                    
    print(f"Completed! Processed {processed_count} images in total.")

if __name__ == '__main__':
    optimize_images()
