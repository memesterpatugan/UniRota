import sys
from PIL import Image

def process_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()

    new_data = []
    threshold = 230
    for item in data:
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            new_data.append((255, 255, 255, 0)) 
        else:
            new_data.append(item)

    img.putdata(new_data)
    
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    img.save(output_path, "PNG")

process_logo(r"C:\Users\batuh\.gemini\antigravity\brain\07eca51c-1b79-4e63-9d6a-35b8b16c77bf\unirota_logo_v2_1790953000131.jpg", r"C:\Users\batuh\Desktop\Site\public\logo.png")
