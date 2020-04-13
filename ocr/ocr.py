import cv2
from PIL import Image
import pytesseract
import json
import numpy as np
import os


def process_image_part(img: np.array, coords: dict):
    img_roi = img[coords['y']: coords['y']+coords['h'], coords['x']: coords['x']+coords['w']]
    return pytesseract.image_to_string(img_roi)


with open('selections/cv_3.json', "r") as f:
    file = json.load(f)

img_cv = cv2.imread(f"images/{file['filename']}")
img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
height, width = img_cv.shape[:2]


for c in file['annotations']:
    c['text'] = process_image_part(img=img_rgb, coords=c)

out_filename = os.path.splitext(os.path.basename(file['filename']))[0]
with open(f"texts/{out_filename}.json", "w") as f:
    json.dump(file, f)
