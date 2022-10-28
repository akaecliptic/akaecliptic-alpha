import os

# This version of the sky box was rendered in Blender through a rotating camera system.
# This took many, many, many failed attempts. It grew tedious to rename files with every batch.
# HINDSIGHT - Not sure why I did this in python. However, this is what this does. 

os.rename('0001.png', 'Front.png')
os.rename('0002.png', 'Back.png')
os.rename('0003.png', 'Left.png')
os.rename('0004.png', 'Right.png')
os.rename('0005.png', 'Top.png')
os.rename('0006.png', 'Bottom.png')
