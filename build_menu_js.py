import json
import os

def bundle_menus():
    assets_dir = '/Users/tejasatyanarayanathotakura/MY_LEARNINGS/mythus_page/assets'
    food_path = os.path.join(assets_dir, 'food_menu.json')
    drinks_path = os.path.join(assets_dir, 'drinks_menu.json')
    dest_path = os.path.join(assets_dir, 'menu_data.js')
    
    if not os.path.exists(food_path) or not os.path.exists(drinks_path):
        print("Menu JSON files not found.")
        return
        
    try:
        with open(food_path, 'r') as f:
            food_data = json.load(f)
            
        with open(drinks_path, 'r') as d:
            drinks_data = json.load(d)
            
        bundle = {
            'food': food_data,
            'drinks': drinks_data
        }
        
        # Write as a JavaScript file that defines window.menuData
        with open(dest_path, 'w') as out:
            out.write("window.menuData = ")
            json.dump(bundle, out, indent=2)
            out.write(";\n")
            
        print(f"Bundled menus successfully into {dest_path}")
    except Exception as e:
        print(f"Error bundling menus: {e}")

if __name__ == '__main__':
    bundle_menus()
