import json
import os

import cv2
import numpy as np
import pytesseract


def process_image_part(img: np.array,
                       x: int,
                       y: int,
                       width: int,
                       height: int,
                       height_multiplier=1,
                       width_multiplier=1):
    y_from = int(y * height_multiplier)
    y_to = int((y + height) * height_multiplier)
    x_from = int(x * width_multiplier)
    x_to = int((x + width) * width_multiplier)
    img_roi = img[y_from: y_to, x_from: x_to]
    return pytesseract.image_to_string(img_roi)


# with open('selections/cv_2.json', "r") as f:
#     file = json.load(f)
#
# img_cv = cv2.imread(f"images/{file['filename']}")
# img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
# height, width = img_cv.shape[:2]
#
# # Calculate annotation ratio (different size on website)
# height_multiplier = height / file['height']
# width_multiplier = width / file['width']
#
# for c in file['annotations']:
#     c['text'] = process_image_part(img=img_rgb,
#                                    x=c['x'],
#                                    y=c['y'],
#                                    height=c['height'],
#                                    width=c['width'],
#                                    height_multiplier=height_multiplier,
#                                    width_multiplier=width_multiplier)
#
# out_filename = os.path.splitext(os.path.basename(file['filename']))[0]
# with open(f"texts/{out_filename}.json", "w") as f:
#     json.dump(file, f)
