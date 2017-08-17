#!/usr/bin/python
import os
from PIL import Image as PImage

basedir = os.path.abspath(os.path.dirname(__file__))
imagePath = os.path.join(basedir, "../static/slide_images/")

for image in os.listdir(imagePath):
    if not image.startswith("."):
        img = PImage.open(imagePath + image).convert("RGB")
        img.thumbnail((800, 800), PImage.ANTIALIAS)
        img.save(imagePath + image, "JPEG", quality=90)
        print imagePath + image
