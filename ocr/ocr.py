import cv2
from PIL import Image
import pytesseract
import json
import numpy as np
import os


def process_image_part(img: np.array, coords: dict, height_multiplier=1, width_multiplier=1):
    y_from = int(coords['y']*height_multiplier)
    y_to = int((coords['y']+coords['h'])*height_multiplier)
    x_from = int(coords['x']*width_multiplier)
    x_to = int((coords['x']+coords['w'])*width_multiplier)
    img_roi = img[y_from: y_to, x_from: x_to]
    return pytesseract.image_to_string(img_roi)


with open('selections/cv_2.json', "r") as f:
    file = json.load(f)

img_cv = cv2.imread(f"images/{file['filename']}")
img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
height, width = img_cv.shape[:2]

# Calculate annotation ratio (different size on website)
height_multiplier = height / file['height']
width_multiplier = width / file['width']

for c in file['annotations']:
    c['text'] = process_image_part(img=img_rgb,
                                   coords=c,
                                   height_multiplier=height_multiplier,
                                   width_multiplier=width_multiplier)

out_filename = os.path.splitext(os.path.basename(file['filename']))[0]
with open(f"texts/{out_filename}.json", "w") as f:
    json.dump(file, f)
